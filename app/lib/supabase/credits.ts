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
  // Aliased version
  return await _deductCredits(supabase, args);
}

export const deductCredit = deductCredits;

async function _deductCredits(
  supabase: SupabaseClient<any>,
  args: { p_user_id: string; p_amount: number; p_description: string }
): Promise<{ data: CreditRpcResult[] | null; error: any }> {
  // Use the standard rpc method
  const res = await supabase.rpc("deduct_credits", args);

  // If successful or the error is not "function not found", return the result
  if (!res.error) return res as any;

  const errorMsg = [
    res.error?.code,
    res.error?.message,
    res.error?.details,
    res.error?.hint,
  ]
    .filter(Boolean)
    .join(" ");
  const normalizedError = errorMsg.toLowerCase();
  const isFunctionNotFound =
    normalizedError.includes("pgrst202") ||
    (
      normalizedError.includes("function") &&
      (
        normalizedError.includes("does not exist") ||
        normalizedError.includes("not found") ||
        normalizedError.includes("could not find")
      )
    );

  // Fallback to singular "deduct_credit" if "deduct_credits" doesn't exist (backwards compatibility)
  if (isFunctionNotFound) {
    return await supabase.rpc("deduct_credit", args) as any;
  }

  return res as any;
}
