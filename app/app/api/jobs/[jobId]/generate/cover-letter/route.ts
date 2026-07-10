import { NextRequest, NextResponse } from "next/server";
import { debitReferenceFromRequest } from "@/lib/billing/idempotency";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { emitAnalyticsEvent, logCriticalError } from "@/lib/analytics/server";
import { createClient } from "@/lib/supabase/server";
import { deductCredits, addCredits } from "@/lib/supabase/credits";
import { loadProfileForTailoring } from "@/lib/ats/profile-loader";
import { generateCoverLetter } from "@/lib/ats/tailor";
import { extractCoverLetterEvidence } from "@/lib/generation/cover-letter-evidence";
import { groundingErrorMessage } from "@/lib/generation/grounding";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CREDIT_COST = 2;

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ jobId: string }> }
) {
  const params = await props.params;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!UUID_RE.test(params.jobId)) {
      return NextResponse.json({ error: "Invalid job id" }, { status: 400 });
    }

    const supabase = createClient();

    const { data: job, error: jobError } = await (supabase as any)
      .from("jobs")
      .select("*")
      .eq("job_id", params.jobId)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (jobError) {
      await logCriticalError({
        workflow: "job_cover_letter_load_job",
        userId: session.user.id,
        supabase,
        error: jobError,
        properties: { job_id: params.jobId },
      });
      return NextResponse.json({ error: "Failed to load job" }, { status: 500 });
    }

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const referenceId = debitReferenceFromRequest(req, `tailor-cover:${params.jobId}`);

    const { data: deductResult, error: deductError } = await deductCredits(supabase as never, {
      p_user_id: session.user.id,
      p_amount: CREDIT_COST,
      p_description: `Cover letter: ${job.title} @ ${job.company}`,
      p_reference_id: referenceId,
    });

    if (deductError || !deductResult?.[0]?.success) {
      return NextResponse.json(
        { error: deductResult?.[0]?.error_message || "Insufficient credits for cover letter (requires 2)." },
        { status: 402 }
      );
    }

    const profile = await loadProfileForTailoring(session.user.id, supabase);

    if (!profile) {
      // Refund if profile is missing
      await addCredits(supabase as never, {
        p_user_id: session.user.id,
        p_amount: CREDIT_COST,
        p_description: "Refund: Missing profile facts",
        p_reference_id: `refund-profile-${referenceId}`,
      });
      return NextResponse.json(
        { error: "Approve profile facts in Career Memory before generating a cover letter." },
        { status: 400 }
      );
    }

    let coverLetter;
    let evidence;

    try {
      coverLetter = await generateCoverLetter(
        profile,
        job.title,
        job.company,
        job.raw_description
      );

      evidence = extractCoverLetterEvidence(coverLetter, profile.approved_facts);

      if (evidence.has_ungrounded_claims) {
        await addCredits(supabase as never, {
          p_user_id: session.user.id,
          p_amount: CREDIT_COST,
          p_description: "Refund: Ungrounded claims in generation",
          p_reference_id: `refund-ungrounded-${referenceId}`,
        });
        return NextResponse.json(
          { error: groundingErrorMessage("cover_letter"), evidence_json: evidence },
          { status: 422 }
        );
      }
    } catch (err) {
      await addCredits(supabase as never, {
        p_user_id: session.user.id,
        p_amount: CREDIT_COST,
        p_description: "Refund: Generation failed",
        p_reference_id: `refund-error-${referenceId}`,
      });
      throw err;
    }

    await emitAnalyticsEvent({
      eventName: "cover_letter_run",
      userId: session.user.id,
      supabase,
      properties: {
        job_id: job.job_id,
        paragraph_count: evidence.paragraphs.length,
        approved_fact_count: profile.approved_facts.length,
        credits_charged: CREDIT_COST,
      },
    });

    return NextResponse.json({
      cover_letter: coverLetter,
      evidence_json: evidence as unknown as Record<string, unknown>,
      new_credits: deductResult[0].new_credits,
      job: { job_id: job.job_id, title: job.title, company: job.company },
    });
  } catch (error) {
    console.error("Generate cover letter (job) error:", error);
    await logCriticalError({
      workflow: "job_cover_letter_generate",
      error,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
