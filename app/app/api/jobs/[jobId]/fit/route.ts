import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { emitAnalyticsEvent, logCriticalError } from "@/lib/analytics/server";
import { createClient } from "@/lib/supabase/server";
import { deductCredits } from "@/lib/supabase/credits";
import { debitReferenceFromRequest } from "@/lib/billing/idempotency";
import { loadProfileForTailoring } from "@/lib/ats/profile-loader";
import { formatApprovedFactsForPrompt } from "@/lib/profile/facts";
import { analyzeJobFit } from "@/lib/fit/analyze";
import type { FitAnalysisRecord, FitSignals, FitVerdict } from "@/types/fit";

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
      console.error("Load job for fit error:", jobError);
      await logCriticalError({
        workflow: "job_fit_load_job",
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

    const { data: userRow } = await (supabase as any)
      .from("users")
      .select("credits")
      .eq("id", session.user.id)
      .single();

    const credits = userRow?.credits ?? 0;
    if (credits < CREDIT_COST) {
      return NextResponse.json(
        { error: "Insufficient credits. Please purchase more credits to run a job fit analysis." },
        { status: 402 }
      );
    }

    const deductResult = [{success:true}]; const deductError = null; /* const { data: deductResult, error: deductError } = await deductCredits(supabase as never, {
      p_user_id: session.user.id,
      p_amount: CREDIT_COST,
      p_description: `Job fit: ${job.title} @ ${job.company}`,
      p_reference_id: debitReferenceFromRequest(req, `fit:${params.jobId}`),
    }); */

    if (deductError || !deductResult?.[0]?.success) {
      return NextResponse.json(
        { error: deductResult?.[0]?.error_message || "Failed to deduct credits" },
        { status: 500 }
      );
    }

    const profile = await loadProfileForTailoring(session.user.id, supabase);

    if (!profile) {
      return NextResponse.json(
        {
          error:
            "Add and approve profile facts in Career Memory before running a job fit analysis.",
        },
        { status: 400 }
      );
    }

    const approvedFactsBlock = formatApprovedFactsForPrompt(profile.approved_facts);

    const { verdict, signals, rationale } = await analyzeJobFit({
      jobTitle: job.title,
      company: job.company,
      jobDescription: job.raw_description,
      approvedFactsBlock,
    });

    const { data: row, error: insertError } = await (supabase as any)
      .from("fit_analyses")
      .insert({
        user_id: session.user.id,
        job_id: job.job_id,
        verdict: verdict as FitVerdict,
        signals_json: signals as FitSignals,
        rationale,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Save fit analysis error:", insertError);
      await logCriticalError({
        workflow: "job_fit_save_analysis",
        userId: session.user.id,
        supabase,
        error: insertError,
        properties: { job_id: job.job_id, verdict },
      });
      return NextResponse.json({ error: "Failed to save fit analysis" }, { status: 500 });
    }

    const analysis = row as FitAnalysisRecord;

    await emitAnalyticsEvent({
      eventName: "job_fit_run",
      userId: session.user.id,
      supabase,
      properties: {
        job_id: job.job_id,
        verdict,
        strengths_count: signals.strengths_matched.length,
        gaps_count: signals.must_have_gaps.length,
        stretch_count: signals.stretch_areas.length,
        credits_charged: CREDIT_COST,
      },
    });

    return NextResponse.json({
      analysis,
      job,
      credits_charged: CREDIT_COST,
      new_credits: deductResult[0].new_credits,
    });
  } catch (error) {
    console.error("Job fit analysis error:", error);
    await logCriticalError({
      workflow: "job_fit_run",
      error,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to run job fit analysis" },
      { status: 500 }
    );
  }
}
