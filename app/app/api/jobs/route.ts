import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CreateJobRequest, JobSource } from "@/types/fit";

function isJobSource(value: unknown): value is JobSource {
  return value === "manual" || value === "captured" || value === "api";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();

    const { data: jobs, error } = await (supabase as any)
      .from("jobs")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("List jobs error:", error);
      return NextResponse.json({ error: "Failed to list jobs" }, { status: 500 });
    }

    return NextResponse.json({ jobs: jobs || [] });
  } catch (error) {
    console.error("List jobs error:", error);
    return NextResponse.json({ error: "Failed to list jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Partial<CreateJobRequest>;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const company = typeof body.company === "string" ? body.company.trim() : "";
    const raw_description =
      typeof body.raw_description === "string" ? body.raw_description.trim() : "";
    const url =
      body.url === undefined || body.url === null
        ? null
        : typeof body.url === "string"
          ? body.url.trim() || null
          : null;
    const source: JobSource = isJobSource(body.source) ? body.source : "manual";

    if (!title || !company || raw_description.length < 20) {
      return NextResponse.json(
        { error: "Title, company, and a job description (at least 20 characters) are required." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: job, error } = await (supabase as any)
      .from("jobs")
      .insert({
        user_id: session.user.id,
        title,
        company,
        url,
        raw_description,
        source,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Create job error:", error);
      return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
  }
}
