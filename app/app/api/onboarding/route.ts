import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const PATHS = new Set([
  "new_grad",
  "career_switcher",
  "employed",
  "laid_off",
  "international",
]);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();

    const { data: row, error } = await (supabase as any)
      .from("users")
      .select("career_path, onboarding_completed_at")
      .eq("id", session.user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to load onboarding state" }, { status: 500 });
    }

    return NextResponse.json({
      career_path: row?.career_path ?? null,
      onboarding_completed_at: row?.onboarding_completed_at ?? null,
    });
  } catch (error) {
    console.error("Onboarding GET error:", error);
    return NextResponse.json({ error: "Failed to load onboarding state" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.career_path !== undefined) {
      if (body.career_path === null) {
        updates.career_path = null;
      } else if (typeof body.career_path === "string" && PATHS.has(body.career_path)) {
        updates.career_path = body.career_path;
      } else {
        return NextResponse.json({ error: "Invalid career_path" }, { status: 400 });
      }
    }

    if (body.mark_complete === true) {
      updates.onboarding_completed_at = new Date().toISOString();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const supabase = createClient();

    const { data, error } = await (supabase as any)
      .from("users")
      .update(updates)
      .eq("id", session.user.id)
      .select("career_path, onboarding_completed_at")
      .single();

    if (error) {
      console.error("Onboarding PATCH error:", error);
      return NextResponse.json({ error: "Failed to update onboarding" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    console.error("Onboarding PATCH error:", error);
    return NextResponse.json({ error: "Failed to update onboarding" }, { status: 500 });
  }
}
