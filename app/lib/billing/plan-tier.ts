import type { SupabaseClient } from "@supabase/supabase-js";

/** Build Spec 3.3 — must match DB `users.plan_tier` CHECK. */
export const PLAN_TIERS = ["free", "starter", "pro", "enterprise"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

const ORDER: Record<PlanTier, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

export function isPlanTier(v: string | null | undefined): v is PlanTier {
  return v != null && (PLAN_TIERS as readonly string[]).includes(v);
}

export function normalizePlanTier(v: string | null | undefined): PlanTier {
  return isPlanTier(v) ? v : "free";
}

export function planMeetsMinimum(userTier: PlanTier, minimum: PlanTier): boolean {
  return ORDER[userTier] >= ORDER[minimum];
}

/** Map Stripe Price IDs from env to tier (configure in Stripe Dashboard per environment). */
export function planTierFromStripePriceId(priceId: string | null | undefined): PlanTier | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return "enterprise";
  return null;
}

export function stripePriceIdForTier(tier: Exclude<PlanTier, "free">): string | null {
  switch (tier) {
    case "starter":
      return process.env.STRIPE_PRICE_STARTER ?? null;
    case "pro":
      return process.env.STRIPE_PRICE_PRO ?? null;
    case "enterprise":
      return process.env.STRIPE_PRICE_ENTERPRISE ?? null;
    default:
      return null;
  }
}

/**
 * Server-side plan read (prefer over session alone for gated APIs).
 */
export async function getPlanTierForUser(
  supabase: SupabaseClient<any>,
  userId: string
): Promise<PlanTier> {
  const { data, error } = await (supabase.from("users").select as any)("plan_tier")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return "free";
  return normalizePlanTier((data as { plan_tier?: string }).plan_tier);
}
