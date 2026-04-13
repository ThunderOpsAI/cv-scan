import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

/** Billing portal for active Stripe customers (subscriptions or prior checkouts). */
export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient();
  const { data: row } = await (supabase.from("users").select as any)("stripe_customer_id")
    .eq("id", session.user.id)
    .maybeSingle();

  const customerId =
    row && typeof (row as { stripe_customer_id?: string | null }).stripe_customer_id === "string"
      ? (row as { stripe_customer_id: string }).stripe_customer_id
      : null;

  if (!customerId) {
    return NextResponse.json(
      { error: "No billing account on file. Purchase credits or subscribe first." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20" as any,
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/buy-credits`,
  });

  return NextResponse.json({ url: portal.url });
}
