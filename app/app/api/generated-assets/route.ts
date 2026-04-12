import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { GeneratedAssetType } from "@/types/generated-assets";

function isAssetType(v: unknown): v is GeneratedAssetType {
  return v === "tailored_bullets" || v === "cover_letter" || v === "follow_up";
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = req.nextUrl.searchParams.get("job_id");

    const supabase = createClient();
    let q = (supabase as any)
      .from("generated_assets")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (jobId) {
      q = q.eq("job_id", jobId);
    }

    const { data: assets, error } = await q;

    if (error) {
      console.error("List generated assets error:", error);
      return NextResponse.json({ error: "Failed to list assets" }, { status: 500 });
    }

    return NextResponse.json({ assets: assets || [] });
  } catch (error) {
    console.error("List generated assets error:", error);
    return NextResponse.json({ error: "Failed to list assets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const asset_type = body.asset_type;
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const evidence_json =
      body.evidence_json && typeof body.evidence_json === "object" ? body.evidence_json : {};
    const job_id =
      body.job_id === null || body.job_id === undefined
        ? null
        : typeof body.job_id === "string"
          ? body.job_id
          : null;

    if (!isAssetType(asset_type) || content.length < 3) {
      return NextResponse.json(
        { error: "asset_type and content (min 3 chars) are required" },
        { status: 400 }
      );
    }

    if (job_id) {
      const supabase = createClient();
      const { data: job } = await (supabase as any)
        .from("jobs")
        .select("job_id")
        .eq("job_id", job_id)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
    }

    const supabase = createClient();

    const { data: row, error } = await (supabase as any)
      .from("generated_assets")
      .insert({
        user_id: session.user.id,
        job_id,
        asset_type,
        content,
        evidence_json,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Save generated asset error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ asset: row }, { status: 201 });
  } catch (error) {
    console.error("Save generated asset error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
