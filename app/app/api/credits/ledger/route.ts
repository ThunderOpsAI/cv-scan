import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type");
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 100, 200);

  const supabase = createClient();
  let q = (supabase.from("credit_ledger") as any)
    .select("event_id, event_type, amount, balance_after, description, reference_id, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (type === "purchase") {
    q = q.eq("event_type", "purchase");
  }

  const { data, error } = await q;

  if (error) {
    console.error("credit_ledger fetch:", error);
    return NextResponse.json({ error: "Failed to load ledger" }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}
