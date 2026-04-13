import { NextRequest, NextResponse } from "next/server";
import { debitReferenceFromRequest } from "@/lib/billing/idempotency";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deductCredits } from "@/lib/supabase/credits";
import { loadProfileForTailoring } from "@/lib/ats/profile-loader";
import {
  generateTailoredBulletsForJob,
  summarizeEvidenceForStorage,
} from "@/lib/generation/tailored-bullets";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CREDIT_COST = 1;

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
      return NextResponse.json({ error: "Failed to load job" }, { status: 500 });
    }

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const { data: userRow } = await (supabase as any)
      .from("users")
      .select("credits")
      .eq("id", session.user.id)
      .single();

    if (!userRow || userRow.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: "Insufficient credits for tailored bullets." },
        { status: 402 }
      );
    }

    const profile = await loadProfileForTailoring(session.user.id, supabase);

    if (!profile) {
      return NextResponse.json(
        { error: "Approve profile facts in Career Memory before tailoring." },
        { status: 400 }
      );
    }

    const { data: deductResult, error: deductError } = await deductCredits(supabase as never, {
      p_user_id: session.user.id,
      p_amount: CREDIT_COST,
      p_description: `Tailored bullets: ${job.title}`,
      p_reference_id: debitReferenceFromRequest(req, `tailor-bullets:${params.jobId}`),
    });

    if (deductError || !deductResult?.[0]?.success) {
      return NextResponse.json(
        { error: deductResult?.[0]?.error_message || "Failed to deduct credits" },
        { status: 500 }
      );
    }

    const evidence = await generateTailoredBulletsForJob(
      profile,
      job.raw_description,
      job.title,
      job.company
    );

    const evidenceRecord = summarizeEvidenceForStorage(evidence);

    return NextResponse.json({
      evidence,
      evidence_json: evidenceRecord,
      new_credits: deductResult[0].new_credits,
      job: { job_id: job.job_id, title: job.title, company: job.company },
    });
  } catch (error) {
    console.error("Generate tailored bullets error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate bullets" },
      { status: 500 }
    );
  }
}
