import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { emitAnalyticsEvent, logCriticalError } from "@/lib/analytics/server";
import { extractCandidateFactsFromResume } from "@/lib/profile/facts";
import { createClient } from "@/lib/supabase/server";
import type { ResumeImportRequest, ResumeImportResponse } from "@/types/profile";

const MIN_RESUME_LENGTH = 50;
const MAX_RESUME_LENGTH = 120_000;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Partial<ResumeImportRequest>;
    const rawContent = typeof body.raw_content === "string" ? body.raw_content.trim() : "";
    const label = typeof body.label === "string" && body.label.trim()
      ? body.label.trim().slice(0, 120)
      : `Resume import ${new Date().toLocaleDateString("en-AU")}`;

    if (rawContent.length < MIN_RESUME_LENGTH) {
      return NextResponse.json(
        { error: "Paste or upload at least 50 characters of resume content" },
        { status: 400 }
      );
    }

    if (rawContent.length > MAX_RESUME_LENGTH) {
      return NextResponse.json(
        { error: "Resume content is too large. Please keep it under 120,000 characters." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: resumeVersion, error: resumeError } = await (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase.from("resume_versions") as any
    )
      .insert({
        user_id: session.user.id,
        raw_content: rawContent,
        tailored_content: null,
        label,
      })
      .select("*")
      .single();

    if (resumeError || !resumeVersion) {
      console.error("Resume import save error:", resumeError);
      await logCriticalError({
        workflow: "resume_import_save",
        userId: session.user.id,
        supabase,
        error: resumeError ?? "Missing resume version after insert",
      });
      return NextResponse.json(
        { error: "Failed to save resume version. Has the Phase 1.2 SQL been applied locally?" },
        { status: 500 }
      );
    }

    const candidateFacts = await extractCandidateFactsFromResume(rawContent);

    const response: ResumeImportResponse = {
      resume_version: resumeVersion,
      candidate_facts: candidateFacts,
      review_message: "Review each extracted fact. Facts you reject are not saved or used by generation.",
    };

    await emitAnalyticsEvent({
      eventName: "resume_imported",
      userId: session.user.id,
      supabase,
      properties: {
        resume_version_id: resumeVersion.version_id,
        candidate_fact_count: candidateFacts.length,
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Resume import error:", error);
    await logCriticalError({
      workflow: "resume_import",
      error,
    });
    return NextResponse.json({ error: "Failed to import resume" }, { status: 500 });
  }
}
