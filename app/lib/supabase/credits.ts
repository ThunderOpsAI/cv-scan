import type { SupabaseClient } from "@supabase/supabase-js";
import { emitAnalyticsEvent, logCriticalError } from "@/lib/analytics/server";
import type { Database } from "./types";

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

export type AddCreditsArgs = {
  p_user_id: string;
  p_amount: number;
  p_description: string;
  p_reference_id?: string | null;
  p_metadata?: Record<string, unknown> | null;
  p_admin_id?: string | null;
};

export async function deductCredits(
  supabase: SupabaseClient<Database>,
  args: DeductCreditsArgs
): Promise<{ data: CreditRpcResult[] | null; error: unknown }> {
  const result = await _deductCredits(supabase, args);
  const rpcResult = result.data?.[0];

  if (!result.error && rpcResult?.success) {
    await emitAnalyticsEvent({
      eventName: "credit_spent",
      userId: args.p_user_id,
      supabase: supabase as unknown as Parameters<typeof emitAnalyticsEvent>[0]["supabase"],
      properties: {
        amount: args.p_amount,
        balance_after: rpcResult.new_credits,
        has_reference_id: Boolean(args.p_reference_id),
      },
    });
  } else {
    await logCriticalError({
      workflow: "credit_debit",
      userId: args.p_user_id,
      supabase: supabase as unknown as Parameters<typeof logCriticalError>[0]["supabase"],
      error: result.error ?? rpcResult?.error_message ?? "Unknown credit debit failure",
      properties: {
        amount: args.p_amount,
        has_reference_id: Boolean(args.p_reference_id),
      },
    });
  }

  return result;
}

export const deductCredit = deductCredits;

export async function addCredits(
  supabase: SupabaseClient<Database>,
  args: AddCreditsArgs
): Promise<{ data: CreditRpcResult[] | null; error: unknown }> {
  const rpcArgs: {
    p_user_id: string;
    p_amount: number;
    p_description: string;
    p_reference_id?: string | null;
    p_metadata?: Record<string, unknown> | null;
    p_admin_id?: string | null;
  } = {
    p_user_id: args.p_user_id,
    p_amount: args.p_amount,
    p_description: args.p_description,
    p_metadata: args.p_metadata ?? null,
    p_admin_id: args.p_admin_id ?? null,
  };
  if (args.p_reference_id != null && args.p_reference_id !== "") {
    rpcArgs.p_reference_id = args.p_reference_id;
  }

  const res = await supabase.rpc("add_credits", rpcArgs);
  const rpcResult = res.data?.[0];

  if (!res.error && rpcResult?.success) {
    await emitAnalyticsEvent({
      eventName: "credit_purchased",
      userId: args.p_user_id,
      supabase: supabase as unknown as Parameters<typeof emitAnalyticsEvent>[0]["supabase"],
      properties: {
        amount: args.p_amount,
        balance_after: rpcResult.new_credits,
        has_reference_id: Boolean(args.p_reference_id),
      },
    });
  } else {
    await logCriticalError({
      workflow: "credit_add",
      userId: args.p_user_id,
      supabase: supabase as unknown as Parameters<typeof logCriticalError>[0]["supabase"],
      error: res.error ?? rpcResult?.error_message ?? "Unknown credit add failure",
      properties: {
        amount: args.p_amount,
        has_reference_id: Boolean(args.p_reference_id),
      },
    });
  }

  return res as { data: CreditRpcResult[] | null; error: unknown };
}

async function _deductCredits(
  supabase: SupabaseClient<Database>,
  args: DeductCreditsArgs
): Promise<{ data: CreditRpcResult[] | null; error: unknown }> {
  const rpcArgs: {
    p_user_id: string;
    p_amount: number;
    p_description: string;
    p_reference_id?: string | null;
  } = {
    p_user_id: args.p_user_id,
    p_amount: args.p_amount,
    p_description: args.p_description,
  };
  if (args.p_reference_id != null && args.p_reference_id !== "") {
    rpcArgs.p_reference_id = args.p_reference_id;
  }

  const res = await supabase.rpc("deduct_credits", rpcArgs);

  // If successful or the error is not "function not found", return the result
  if (!res.error) return res as { data: CreditRpcResult[] | null; error: unknown };

  const errorObj = res.error as { code?: string; message?: string; details?: string; hint?: string } | null;
  const errorMsg = [
    errorObj?.code,
    errorObj?.message,
    errorObj?.details,
    errorObj?.hint,
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
    const fallbackRes = await supabase.rpc("deduct_credit", {
      p_user_id: args.p_user_id,
      p_amount: args.p_amount,
      p_description: args.p_description,
    });
    return fallbackRes as { data: CreditRpcResult[] | null; error: unknown };
  }

  return res as { data: CreditRpcResult[] | null; error: unknown };
}
