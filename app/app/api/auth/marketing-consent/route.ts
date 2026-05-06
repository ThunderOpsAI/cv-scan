import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/marketing-consent
 * Records the user's explicit marketing opt-in preference.
 * Body: { optIn: boolean }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let optIn = false;
  try {
    const body = await req.json();
    optIn = body.optIn === true;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = createClient();
  const now = new Date().toISOString();

  const { error } = await (supabase
    .from("users")
    .update as any)({
      marketing_opt_in: optIn,
      marketing_opt_in_at: optIn ? now : null,
    })
    .eq("id", session.user.id);

  if (error) {
    console.error("Failed to update marketing consent:", error);
    return NextResponse.json({ error: "Failed to save preference" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, marketingOptIn: optIn });
}
