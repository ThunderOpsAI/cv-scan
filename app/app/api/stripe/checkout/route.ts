import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

/**
 * Build Spec Phase 3.1 package shapes; unit_amount is checkout-time price_data only.
 * Final prices should match what you configure in Stripe / finance.
 */
const CREDIT_PACKAGES = {
  starter: {
    credits: 50,
    price: 899, // $8.99 AUD example — adjust in Stripe dashboard as needed
    name: "Starter Pack",
    description: "50 credits — try CVScan on several applications",
  },
  sprint: {
    credits: 200,
    price: 2999,
    name: "Application Sprint",
    description: "200 credits — steady job-search cadence",
  },
  career: {
    credits: 500,
    price: 6999,
    name: "Career Switch Pack",
    description: "500 credits — higher-volume search and prep",
  },
};

function assertStripeMode() {
  if (process.env.STRIPE_LIVE_MODE === "true" && process.env.NODE_ENV !== "production") {
    console.warn(
      "[stripe] STRIPE_LIVE_MODE=true while NODE_ENV is not production — confirm keys and webhook endpoints."
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    assertStripeMode();
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20" as any,
    });
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { packageType } = body;

    if (!packageType || !CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES]) {
      return NextResponse.json({ error: "Invalid package type" }, { status: 400 });
    }

    const pkg = CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES];

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: pkg.name,
              description: pkg.description,
            },
            unit_amount: pkg.price,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/buy-credits?payment=cancelled`,
      metadata: {
        userId: session.user.id,
        credits: pkg.credits.toString(),
        packageType,
      },
      payment_intent_data: {
        metadata: {
          userId: session.user.id,
          credits: pkg.credits.toString(),
          packageType,
        },
      },
      customer_email: session.user.email,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
