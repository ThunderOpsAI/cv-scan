import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import {
  type PlanTier,
  stripePriceIdForTier,
  isPlanTier,
  PLAN_TIERS,
} from "@/lib/billing/plan-tier";
import { createClient } from "@/lib/supabase/server";

function assertStripeMode() {
  if (process.env.STRIPE_LIVE_MODE === "true" && process.env.NODE_ENV !== "production") {
    console.warn(
      "[stripe] STRIPE_LIVE_MODE=true while NODE_ENV is not production — confirm keys and webhook endpoints."
    );
  }
}

/**
 * Starts Stripe Checkout in subscription mode. Requires matching STRIPE_PRICE_* env for the tier.
 * Webhook updates users.plan_tier from subscription lifecycle events.
 */
export async function POST(req: NextRequest) {
  try {
    assertStripeMode();
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const raw = typeof body.plan_tier === "string" ? body.plan_tier : body.tier;
    if (!raw || !isPlanTier(raw) || raw === "free") {
      return NextResponse.json(
        { error: "Invalid plan", allowed: PLAN_TIERS.filter((t) => t !== "free") },
        { status: 400 }
      );
    }

    const planTier = raw as Exclude<PlanTier, "free">;
    const priceId = stripePriceIdForTier(planTier);
    if (!priceId) {
      return NextResponse.json(
        {
          error: `Subscription price not configured for ${planTier}. Set STRIPE_PRICE_${planTier.toUpperCase()} in the environment.`,
        },
        { status: 503 }
      );
    }

    const supabase = createClient();
    const { data: userRow } = await (supabase.from("users").select as any)(
      "stripe_customer_id"
    )
      .eq("id", session.user.id)
      .maybeSingle();
    const existingCustomerId =
      userRow && typeof (userRow as { stripe_customer_id?: string }).stripe_customer_id === "string"
        ? (userRow as { stripe_customer_id: string }).stripe_customer_id
        : null;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20" as any,
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?subscription=success`,
      cancel_url: `${baseUrl}/buy-credits?subscription=cancelled`,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        plan_tier: planTier,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          plan_tier: planTier,
        },
      },
      ...(existingCustomerId
        ? { customer: existingCustomerId }
        : { customer_email: session.user.email }),
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe subscribe error:", error);
    return NextResponse.json({ error: "Failed to create subscription checkout" }, { status: 500 });
  }
}
