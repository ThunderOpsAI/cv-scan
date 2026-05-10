import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { sendPaymentReceiptEmail } from "@/lib/email/resend";
import {
  normalizePlanTier,
  planTierFromStripePriceId,
  type PlanTier,
} from "@/lib/billing/plan-tier";

function stripeReferenceFromSession(session: Stripe.Checkout.Session): string {
  const pi = session.payment_intent;
  const piId = typeof pi === "string" ? pi : pi?.id;
  if (piId) {
    return `stripe:pi:${piId}`;
  }
  return `stripe:session:${session.id}`;
}

async function creditPurchaseFromStripe(params: {
  userId: string;
  credits: number;
  packageType: string | undefined;
  referenceId: string;
  stripeSessionId: string;
  amountTotal: number | null;
  customerEmail: string | null | undefined;
}) {
  const { userId, credits, packageType, referenceId, stripeSessionId, amountTotal, customerEmail } = params;

  const supabase = createClient();
  const { data: rpcResult, error: rpcError } = await (supabase.rpc as any)("add_credits", {
    p_user_id: userId,
    p_amount: credits,
    p_type: "purchase",
    p_description: `Purchased ${credits} credits (${packageType ?? "package"})`,
    p_metadata: {
      stripe_session_id: stripeSessionId,
      package_type: packageType,
    },
    p_reference_id: referenceId,
  });

  if (rpcError || !rpcResult?.[0]?.success) {
    console.error("Failed to add credits in database:", rpcError || rpcResult?.[0]?.error_message);
    return false;
  }

  console.info(`Credits applied for ${userId} ref=${referenceId} (+${credits})`);

  if (process.env.RESEND_API_KEY && customerEmail) {
    const { data: user } = await (supabase.from("users").select as any)("name").eq("id", userId).single();
    if (user) {
      sendPaymentReceiptEmail(customerEmail, user.name || "User", credits, amountTotal ?? 0).catch((err) =>
        console.error("Failed to send receipt email:", err)
      );
    }
  }

  return true;
}

function tierFromSubscription(sub: Stripe.Subscription): PlanTier {
  const meta = sub.metadata?.plan_tier;
  const normalized = normalizePlanTier(meta);
  if (normalized !== "free") return normalized;
  const priceId = sub.items.data[0]?.price?.id;
  return planTierFromStripePriceId(priceId) ?? "free";
}

function subscriptionKeepsPlanAccess(status: Stripe.Subscription.Status): boolean {
  return (
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    (status as string) === "paused"
  );
}

async function persistSubscriptionState(params: {
  userId: string;
  customerId: string | null;
  subscriptionId: string;
  status: Stripe.Subscription.Status;
  tierWhenActive: PlanTier;
}) {
  const { userId, customerId, subscriptionId, status, tierWhenActive } = params;
  const supabase = createClient();
  const keepsAccess = subscriptionKeepsPlanAccess(status);
  const patch: Record<string, unknown> = {
    stripe_subscription_status: status,
    plan_tier: keepsAccess ? tierWhenActive : "free",
    stripe_subscription_id: keepsAccess ? subscriptionId : null,
  };
  if (keepsAccess && customerId) {
    patch.stripe_customer_id = customerId;
  }

  const { error } = await (supabase.from("users").update as any)(patch).eq("id", userId);
  if (error) {
    console.error("Failed to update user subscription state:", error);
    return false;
  }
  return true;
}

async function handleCheckoutSessionCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<{ ok: boolean; errorStatus?: number }> {
  const supabase = createClient();

  if (session.mode === "subscription") {
    const userId = session.metadata?.userId || session.client_reference_id || undefined;
    if (!userId) {
      console.error("Subscription checkout missing userId metadata:", session.id);
      return { ok: false, errorStatus: 400 };
    }

    const subRef = session.subscription;
    const subscriptionId = typeof subRef === "string" ? subRef : subRef?.id;
    if (!subscriptionId) {
      console.error("Subscription checkout missing subscription id:", session.id);
      return { ok: false, errorStatus: 500 };
    }

    const sub = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price"],
    });

    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
    const tier = tierFromSubscription(sub);

    const ok = await persistSubscriptionState({
      userId,
      customerId,
      subscriptionId: sub.id,
      status: sub.status,
      tierWhenActive: tier,
    });
    return ok ? { ok: true } : { ok: false, errorStatus: 500 };
  }

  if (session.mode !== "payment") {
    console.info(`checkout.session.completed mode=${session.mode} — no handler`);
    return { ok: true };
  }

  const userId = session.metadata?.userId;
  const credits = Number(session.metadata?.credits);
  const packageType = session.metadata?.packageType;
  const referenceId = stripeReferenceFromSession(session);

  if (!userId || Number.isNaN(credits) || credits <= 0) {
    console.error("Missing or invalid credit metadata in payment checkout session:", session.id);
    return { ok: false, errorStatus: 400 };
  }

  const ok = await creditPurchaseFromStripe({
    userId,
    credits,
    packageType,
    referenceId,
    stripeSessionId: session.id,
    amountTotal: session.amount_total,
    customerEmail: session.customer_details?.email,
  });

  if (!ok) {
    return { ok: false, errorStatus: 500 };
  }

  if (session.customer && typeof session.customer === "string") {
    await (supabase.from("users").update as any)({ stripe_customer_id: session.customer }).eq("id", userId);
  }

  return { ok: true };
}

async function handleSubscriptionUpdated(stripe: Stripe, sub: Stripe.Subscription): Promise<void> {
  const supabase = createClient();
  const full = await stripe.subscriptions.retrieve(sub.id, { expand: ["items.data.price"] });

  let userId = full.metadata?.userId;

  if (!userId) {
    const { data } = await (supabase.from("users").select as any)("id")
      .eq("stripe_subscription_id", full.id)
      .maybeSingle();
    if (data?.id) userId = data.id;
  }

  if (!userId) {
    console.warn("subscription.updated: could not resolve user", full.id);
    return;
  }

  const customerId = typeof full.customer === "string" ? full.customer : full.customer.id;
  const tier = tierFromSubscription(full);

  await persistSubscriptionState({
    userId,
    customerId,
    subscriptionId: full.id,
    status: full.status,
    tierWhenActive: tier,
  });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const supabase = createClient();
  const { error } = await (supabase.from("users").update as any)({
    plan_tier: "free",
    stripe_subscription_id: null,
    stripe_subscription_status: sub.status ?? "canceled",
  }).eq("stripe_subscription_id", sub.id);

  if (error) {
    console.error("subscription.deleted user update failed:", error);
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20" as any,
    });
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const result = await handleCheckoutSessionCompleted(stripe, session);
      if (!result.ok) {
        return NextResponse.json(
          { error: "Webhook handler failed" },
          { status: result.errorStatus ?? 500 }
        );
      }
    } else if (event.type === "customer.subscription.updated") {
      await handleSubscriptionUpdated(stripe, event.data.object as Stripe.Subscription);
    } else if (event.type === "customer.subscription.deleted") {
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
    } else if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.info(`payment_intent.succeeded ${pi.id} (one-time credits use checkout.session.completed)`);
    } else if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.warn("Stripe payment failed:", {
        payment_intent: pi.id,
        last_error: pi.last_payment_error?.message,
      });
    } else {
      console.info(`Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`Webhook error: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
