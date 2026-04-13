import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import JSZip from "jszip";
import { stripFactTagsForExport } from "@/lib/generation/cover-letter-evidence";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const jobId = typeof body.job_id === "string" ? body.job_id : "";

    if (!UUID_RE.test(jobId)) {
      return NextResponse.json({ error: "job_id is required" }, { status: 400 });
    }

    const supabase = createClient();

    const { data: job, error: jobErr } = await (supabase as any)
      .from("jobs")
      .select("*")
      .eq("job_id", jobId)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const { data: assets } = await (supabase as any)
      .from("generated_assets")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });

    const zip = new JSZip();

    zip.file(
      "job.txt",
      `Title: ${job.title}\nCompany: ${job.company}\nURL: ${job.url || ""}\n\n--- Description ---\n\n${job.raw_description}`
    );

    const list = assets || [];
    for (const a of list) {
      const short = typeof a.asset_id === "string" ? a.asset_id.slice(0, 8) : "asset";
      const name = `${a.asset_type}-${short}.txt`;
      let text = a.content as string;
      if (a.asset_type === "cover_letter") {
        text = stripFactTagsForExport(text);
      }
      zip.file(name, text);
    }

    if (list.length === 0) {
      zip.file(
        "readme.txt",
        "No saved generated assets for this job yet. Save tailored bullets or cover letter from the tailor workspace first."
      );
    }

    const out = await zip.generateAsync({ type: "nodebuffer" });

    const safeName = `${job.company}-${job.title}`
      .replace(/[^\w\-]+/g, "-")
      .slice(0, 80)
      .toLowerCase();

    return new NextResponse(new Uint8Array(out), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeName || "application-pack"}.zip"`,
      },
    });
  } catch (error) {
    console.error("Pack export error:", error);
    return NextResponse.json({ error: "Failed to build pack" }, { status: 500 });
  }
}
