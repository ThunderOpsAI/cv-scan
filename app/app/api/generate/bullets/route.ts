import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { emitAnalyticsEvent, logCriticalError } from "@/lib/analytics/server";
import { gemini } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { deductCredits } from "@/lib/supabase/credits";
import { debitReferenceFromRequest } from "@/lib/billing/idempotency";
import { loadProfileForTailoring } from "@/lib/ats/profile-loader";
import { approvedFactIds, formatApprovedFactsForPrompt } from "@/lib/profile/facts";
import { groundingErrorMessage, validateEvidenceTags } from "@/lib/generation/grounding";
import { plainAiText } from "@/lib/text/plain-ai-output";

const CREDIT_COST = 1;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobDuty } = await req.json();

    if (!jobDuty || typeof jobDuty !== "string" || jobDuty.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a detailed job duty (at least 10 characters)" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if user has enough credits
    const { data: user } = await (supabase
      .from("users")
      .select as any)("credits")
      .eq("id", session.user.id)
      .single();

    /* Credit check bypassed for beta */

    const profile = await loadProfileForTailoring(session.user.id, supabase);

    if (!profile) {
      return NextResponse.json(
        { error: "Import your resume and approve profile facts before generating bullets." },
        { status: 400 }
      );
    }

    const approvedFactsText = formatApprovedFactsForPrompt(profile.approved_facts);

    // Generate resume bullets using Gemini, grounded only in approved facts.
    const prompt = `You are an expert resume writer. Create 3-5 professional, ATS-optimized resume bullet points grounded only in approved profile facts.

Approved profile facts:
${approvedFactsText}

Target focus from the user:
${jobDuty}

Requirements:
- Start each bullet with a strong action verb
- Include quantifiable metrics only when the exact metric appears in approved facts
- Use concise, impactful language
- Optimize for Applicant Tracking Systems (ATS)
- Focus on accomplishments and impact, not just responsibilities
- Keep each bullet to 1-2 lines maximum
- Do not invent or imply achievements, skills, dates, metrics, responsibilities, titles, companies, education, certifications, or credentials
- Do not treat the target focus as evidence unless it matches an approved fact
- Add a compact evidence tag like [fact:12345678] to each bullet
- Use plain text only. Do not use markdown formatting, bold, italics, headings, or code fences

Return ONLY the bullet points, one per line, without any numbering or bullet symbols. Each line should be a complete sentence.`;

    const result = await gemini.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse bullets and keep only lines that cite a valid approved profile fact.
    const rawBullets = text
      .split("\n")
      .map((b) => b.replace(/^[\s\d.\-*•]+/, "").trim())
      .filter((b) => b.length > 0);
    const bullets: string[] = [];
    const ungroundableNotes: string[] = [];

    for (const bullet of rawBullets) {
      const tagValidation = validateEvidenceTags(bullet, profile.approved_facts);
      if (tagValidation.validFactIds.length > 0 && tagValidation.invalidTags.length === 0) {
        bullets.push(plainAiText(bullet));
      } else {
        ungroundableNotes.push(
          "A generated bullet was withheld because it did not cite an approved profile fact."
        );
      }
    }

    if (bullets.length === 0) {
      return NextResponse.json(
        { error: groundingErrorMessage("bullets"), ungroundableNotes },
        { status: 422 }
      );
    }

    const deductResult = [{success:true}]; const deductError = null; /* const { data: deductResult, error: deductError } = await deductCredits(supabase as any, {
      p_user_id: session.user.id,
      p_amount: CREDIT_COST,
      p_description: "Generated resume bullets",
      p_reference_id: debitReferenceFromRequest(req, "gen-bullets"),
    }); */

    if (deductError || !deductResult?.[0]?.success) {
      console.error("Failed to deduct credit:", deductError);
      return NextResponse.json(
        { error: deductResult?.[0]?.error_message || "Failed to deduct credit" },
        { status: 500 }
      );
    }

    // Save generation to database
    const { error: generationError } = await (supabase
      .from("generations")
      .insert as any)({
        user_id: session.user.id,
        type: "bullets",
        input: {
          target_focus: jobDuty,
          approved_fact_ids: approvedFactIds(profile.approved_facts),
        },
        output: bullets.join("\n"),
        credits_used: CREDIT_COST,
      });

    if (generationError) {
      await logCriticalError({
        workflow: "tailoring_generation_save",
        userId: session.user.id,
        supabase,
        error: generationError,
        properties: { type: "bullets" },
      });
    }

    await emitAnalyticsEvent({
      eventName: "tailoring_run",
      userId: session.user.id,
      supabase,
      properties: {
        type: "bullets",
        bullet_count: bullets.length,
        approved_fact_count: profile.approved_facts.length,
        credits_charged: CREDIT_COST,
      },
    });

    return NextResponse.json({
      bullets,
      ungroundableNotes,
      creditsRemaining: deductResult[0].new_credits,
    });
  } catch (error: any) {
    console.error("Generate bullets error:", error);
    await logCriticalError({
      workflow: "tailoring_run",
      error,
    });
    return NextResponse.json(
      { error: error.message || "Failed to generate bullets" },
      { status: 500 }
    );
  }
}
