import type { SupabaseClient } from "@supabase/supabase-js";

export type CreditRpcResult = {
  success: boolean;
  new_credits: number;
  error_message?: string | null;
};

export async function deductCredits(
  supabase: SupabaseClient<any>,
  args: { p_user_id: string; p_amount: number; p_description: string }
): Promise<{ data: CreditRpcResult[] | null; error: any }> {
  const sb: any = supabase as any;

  const fnNames = ["deduct_credits", "deduct_credit", "educt_credit"] as const;

  for (const fnName of fnNames) {
    const res = await sb.rpc(fnName, args);
    if (!res?.error) {
      return res;
    }

    const msg = String(res.error?.message || res.error);
    const normalized = msg.toLowerCase();
    const code = String((res.error as any)?.code || "");
    const looksLikeMissingFn =
      code === "PGRST202" ||
      (normalized.includes("function") &&
        (normalized.includes("does not exist") ||
          normalized.includes("not found") ||
          normalized.includes("unknown") ||
          normalized.includes("could not find"))) ||
      (normalized.includes("schema cache") && normalized.includes("could not find"));

    if (!looksLikeMissingFn) {
      return res;
    }
  }

  return await sb.rpc("deduct_credit", args);
}
