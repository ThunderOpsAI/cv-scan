import type { SupabaseClient } from "@supabase/supabase-js";

export type CreditRpcResult = {
  success: boolean;
  new_credits: number;
  error_message?: string | null;
};

export type DeductCreditsArgs = {
  p_user_id: string;
  p_amount: number;
  p_description: string;
  /** Idempotency key: same reference must not double-charge (see credit_ledger.reference_id). */
  p_reference_id?: string | null;
};

export async function deductCredits(
  supabase: SupabaseClient<any>,
  args: DeductCreditsArgs
): Promise<{ data: CreditRpcResult[] | null; error: any }> {
  return await _deductCredits(supabase, args);
}

export const deductCredit = deductCredits;

async function _deductCredits(
  supabase: SupabaseClient<any>,
  args: DeductCreditsArgs
): Promise<{ data: CreditRpcResult[] | null; error: any }> {
  const rpcArgs: Record<string, unknown> = {
    p_user_id: args.p_user_id,
    p_amount: args.p_amount,
    p_description: args.p_description,
  };
  if (args.p_reference_id != null && args.p_reference_id !== "") {
    rpcArgs.p_reference_id = args.p_reference_id;
  }

  const res = await supabase.rpc("deduct_credits", rpcArgs as never);

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

  if (isFunctionNotFound) {
    return await supabase.rpc("deduct_credit", {
      p_user_id: args.p_user_id,
      p_amount: args.p_amount,
      p_description: args.p_description,
    } as never) as any;
  }

  return res as any;
}
