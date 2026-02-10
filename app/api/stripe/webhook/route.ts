import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { sendPaymentReceiptEmail } from "@/lib/email/resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract metadata
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits || "0");
        const packageType = session.metadata?.packageType;

        if (!userId || !credits) {
          console.error("Missing metadata in checkout session:", session.id);
          return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
        }

        // Add credits to user using Supabase function
        const supabase = createClient();
        const { data, error } = await (supabase.rpc as any)("add_credits", {
          p_user_id: userId,
          p_amount: credits,
          p_type: "purchase",
          p_description: `Purchased ${credits} credits (${packageType})`,
          p_metadata: session.metadata || {},
        });

        if (error) {
          console.error("Failed to add credits:", error);
          return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
        }

        console.log(`Added ${credits} credits to user ${userId}`);

        // Update stripe_customer_id if not set
        if (session.customer && typeof session.customer === 'string') {
          await supabase
            .from("users")
            .update({ stripe_customer_id: session.customer } as any)
            .eq("id", userId);
        }

        // Send payment receipt email (non-blocking)
        if (process.env.RESEND_API_KEY && session.customer_email) {
          const { data: user } = await (supabase
            .from("users")
            .select as any)("name")
            .eq("id", userId)
            .single();

          if (user) {
            sendPaymentReceiptEmail(
              session.customer_email,
              user.name || "there",
              credits,
              session.amount_total || 0
            ).catch(console.error);
          }
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error("Payment failed:", paymentIntent.id);
        // Could send email notification here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
