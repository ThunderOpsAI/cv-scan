import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  const envCheck = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 40) + "...",
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    serviceRolePrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10) + "...",
  };

  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated", envCheck });
  }

  const userId = session.user.id;
  let dbResult = null;
  let rpcResult = null;
  let dbError = null;

  try {
    const supabase = createClient();

    // Direct DB lookup
    const { data, error } = await supabase
      .from("users")
      .select("id, email, credits, plan_tier")
      .eq("id", userId)
      .maybeSingle();
    dbResult = data;
    dbError = error;

    // RPC call
    const rpc = await (supabase.rpc as any)("get_credit_balance", { p_user_id: userId });
    rpcResult = { data: rpc.data, error: rpc.error };
  } catch (e: any) {
    dbError = e.message;
  }

  return NextResponse.json({
    sessionUserId: userId,
    sessionEmail: session.user.email,
    sessionCredits: session.user.credits,
    envCheck,
    dbResult,
    dbError,
    rpcResult,
  });
}
