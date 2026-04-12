import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { gemini } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { loadProfileForTailoring } from "@/lib/ats/profile-loader";
import { approvedFactIds, formatApprovedFactsForPrompt } from "@/lib/profile/facts";

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

    if (!user || user.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: "Insufficient credits. Please purchase more credits." },
        { status: 402 }
      );
    }

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

Return ONLY the bullet points, one per line, without any numbering or bullet symbols. Each line should be a complete sentence.`;

    const result = await gemini.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse bullets (split by newlines, filter empty)
    const bullets = text
      .split("\n")
      .map((b) => b.replace(/^[\s\d.\-*•]+/, "").trim())
      .filter((b) => b.length > 0);

    if (bullets.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate bullet points. Please try again." },
        { status: 500 }
      );
    }

    // Deduct credit using Supabase function
    const { data: deductResult, error: deductError } = await (supabase.rpc as any)(
      "deduct_credit",
      {
        p_user_id: session.user.id,
        p_amount: CREDIT_COST,
        p_description: "Generated resume bullets",
      }
    );

    if (deductError || !deductResult?.[0]?.success) {
      console.error("Failed to deduct credit:", deductError);
      return NextResponse.json(
        { error: deductResult?.[0]?.error_message || "Failed to deduct credit" },
        { status: 500 }
      );
    }

    // Save generation to database
    await (supabase
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

    return NextResponse.json({
      bullets,
      creditsRemaining: deductResult[0].new_credits,
    });
  } catch (error: any) {
    console.error("Generate bullets error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate bullets" },
      { status: 500 }
    );
  }
}
