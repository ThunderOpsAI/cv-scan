import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  _req: NextRequest,
  props: { params: Promise<{ assetId: string }> }
) {
  const params = await props.params;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!UUID_RE.test(params.assetId)) {
      return NextResponse.json({ error: "Invalid asset id" }, { status: 400 });
    }

    const supabase = createClient();

    const { data, error } = await (supabase as any)
      .from("generated_assets")
      .delete()
      .eq("asset_id", params.assetId)
      .eq("user_id", session.user.id)
      .select("asset_id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete asset error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
