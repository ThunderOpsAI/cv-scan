import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { sendPaymentReceiptEmail } from "@/lib/email/resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
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
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Extract metadata
    const userId = session.metadata?.userId;
    const credits = Number(session.metadata?.credits);
    const packageType = session.metadata?.packageType;

    if (!userId || isNaN(credits)) {
      console.error("Missing or invalid metadata in checkout session:", session.id);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    // 🔐 SECURE CREDIT ADDITION: Added server-side via Supabase RPC with service role
    const supabase = createClient();
    const { data: rpcResult, error: rpcError } = await (supabase.rpc as any)("add_credits", {
      p_user_id: userId,
      p_amount: credits,
      p_type: "purchase",
      p_description: `Purchased ${credits} credits (${packageType})`,
      p_metadata: {
        stripe_session_id: session.id,
        package_type: packageType
      },
    });

    if (rpcError || !rpcResult?.[0]?.success) {
      console.error("Failed to add credits in database:", rpcError || rpcResult?.[0]?.error_message);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }

    console.log(`✅ Successfully added ${credits} credits to user ${userId}`);

    // Update stripe_customer_id if available
    if (session.customer && typeof session.customer === 'string') {
      await (supabase
        .from("users")
        .update as any)({ stripe_customer_id: session.customer })
        .eq("id", userId);
    }

    // Send payment receipt email (non-blocking)
    if (process.env.RESEND_API_KEY && session.customer_details?.email) {
      const { data: user } = await (supabase
        .from("users")
        .select as any)("name")
        .eq("id", userId)
        .single();

      if (user) {
        sendPaymentReceiptEmail(
          session.customer_details.email,
          user.name || "User",
          credits,
          session.amount_total || 0
        ).catch(err => console.error("Failed to send receipt email:", err));
      }
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

