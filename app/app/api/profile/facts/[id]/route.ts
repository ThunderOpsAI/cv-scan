import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isProfileFactType, sanitizeFactText } from "@/lib/profile/facts";
import type { ProfileFactType } from "@/types/profile";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PatchBody = {
  fact_type?: unknown;
  fact_text?: unknown;
  is_approved?: unknown;
};

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!UUID_RE.test(params.id)) {
      return NextResponse.json({ error: "Invalid fact id" }, { status: 400 });
    }

    const body = (await req.json()) as PatchBody;
    const hasType = body.fact_type !== undefined;
    const hasText = body.fact_text !== undefined;
    const hasApproved = body.is_approved !== undefined;

    if (!hasType && !hasText && !hasApproved) {
      return NextResponse.json(
        { error: "Provide fact_type, fact_text, and/or is_approved" },
        { status: 400 }
      );
    }

    let nextType: ProfileFactType | undefined;
    if (hasType) {
      if (!isProfileFactType(body.fact_type)) {
        return NextResponse.json({ error: "Invalid fact_type" }, { status: 400 });
      }
      nextType = body.fact_type;
    }

    let nextText: string | undefined;
    if (hasText) {
      nextText = sanitizeFactText(body.fact_text);
      if (nextText.length < 3) {
        return NextResponse.json(
          { error: "Fact text must be at least 3 characters" },
          { status: 400 }
        );
      }
    }

    let nextApproved: boolean | undefined;
    if (hasApproved) {
      if (typeof body.is_approved !== "boolean") {
        return NextResponse.json({ error: "is_approved must be a boolean" }, { status: 400 });
      }
      nextApproved = body.is_approved;
    }

    const supabase = createClient();

    const { data: existing, error: loadError } = await (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase.from("profile_facts") as any
    )
      .select("fact_id, user_id, fact_type, fact_text, is_approved")
      .eq("fact_id", params.id)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (loadError) {
      console.error("Load profile fact for update error:", loadError);
      return NextResponse.json({ error: "Failed to load fact" }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json({ error: "Fact not found" }, { status: 404 });
    }

    const mergedType = nextType ?? (existing.fact_type as ProfileFactType);
    const mergedText = nextText ?? (existing.fact_text as string);

    if (!isProfileFactType(mergedType)) {
      return NextResponse.json({ error: "Invalid stored fact_type" }, { status: 500 });
    }

    const dupKey = `${mergedType}:${mergedText.toLowerCase()}`;
    const { data: siblings, error: dupError } = await (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase.from("profile_facts") as any
    )
      .select("fact_id, fact_type, fact_text")
      .eq("user_id", session.user.id)
      .eq("fact_type", mergedType)
      .neq("fact_id", params.id);

    if (dupError) {
      console.error("Duplicate profile fact check error:", dupError);
      return NextResponse.json({ error: "Failed to validate fact" }, { status: 500 });
    }

    const hasDup = (siblings || []).some(
      (row: { fact_id: string; fact_type: string; fact_text: string }) =>
        `${row.fact_type}:${row.fact_text.toLowerCase()}` === dupKey
    );

    if (hasDup) {
      return NextResponse.json(
        { error: "Another fact already uses this type and text" },
        { status: 409 }
      );
    }

    const updatePayload: Record<string, unknown> = {};
    if (hasType) updatePayload.fact_type = mergedType;
    if (hasText) updatePayload.fact_text = mergedText;
    if (hasApproved && nextApproved !== undefined) updatePayload.is_approved = nextApproved;

    const { data: updated, error: updateError } = await (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase.from("profile_facts") as any
    )
      .update(updatePayload)
      .eq("fact_id", params.id)
      .eq("user_id", session.user.id)
      .select("*")
      .maybeSingle();

    if (updateError) {
      console.error("Update profile fact error:", updateError);
      return NextResponse.json({ error: "Failed to update fact" }, { status: 500 });
    }

    return NextResponse.json({ fact: updated });
  } catch (error) {
    console.error("Update profile fact error:", error);
    return NextResponse.json({ error: "Failed to update fact" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!UUID_RE.test(params.id)) {
      return NextResponse.json({ error: "Invalid fact id" }, { status: 400 });
    }

    const supabase = createClient();

    const { data: removed, error } = await (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase.from("profile_facts") as any
    )
      .delete()
      .eq("fact_id", params.id)
      .eq("user_id", session.user.id)
      .select("fact_id")
      .maybeSingle();

    if (error) {
      console.error("Delete profile fact error:", error);
      return NextResponse.json({ error: "Failed to delete fact" }, { status: 500 });
    }

    if (!removed) {
      return NextResponse.json({ error: "Fact not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete profile fact error:", error);
    return NextResponse.json({ error: "Failed to delete fact" }, { status: 500 });
  }
}
