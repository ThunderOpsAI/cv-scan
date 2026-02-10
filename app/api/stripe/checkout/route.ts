import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

// Credit packages
const CREDIT_PACKAGES = {
  starter: {
    credits: 20,
    price: 499, // $4.99 in cents
    name: "Starter Pack",
    description: "20 credits for resume bullets and cover letters",
  },
  popular: {
    credits: 50,
    price: 999, // $9.99 in cents (20% discount)
    name: "Popular Pack",
    description: "50 credits - Best value!",
  },
  pro: {
    credits: 100,
    price: 1799, // $17.99 in cents (28% discount)
    name: "Pro Pack",
    description: "100 credits for power users",
  },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
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
            currency: "usd",
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
        userId: session.user.id!,
        credits: pkg.credits.toString(),
        packageType,
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

// Export credit packages for use in UI
export { CREDIT_PACKAGES };
