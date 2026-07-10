import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  type GooglePlayVerificationPayload,
  hasGooglePlayServiceAccount,
  validateGooglePlayPackage,
  verifyGooglePlayPurchase,
} from "@/lib/billing/google-play";

export const runtime = "nodejs";

function isVerificationPayload(value: unknown): value is GooglePlayVerificationPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.packageName === "string" &&
    typeof payload.productId === "string" &&
    typeof payload.purchaseToken === "string" &&
    (payload.purchaseType === "product" || payload.purchaseType === "subscription")
  );
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!isVerificationPayload(body)) {
    return NextResponse.json(
      {
        error:
          "Expected packageName, productId, purchaseToken, and purchaseType ('product' or 'subscription').",
      },
      { status: 400 }
    );
  }

  const packageCheck = validateGooglePlayPackage(body.packageName);
  if (!packageCheck.ok) {
    return NextResponse.json({ error: packageCheck.reason }, { status: 400 });
  }

  if (!hasGooglePlayServiceAccount()) {
    return NextResponse.json(
      {
        status: "scaffolded",
        verified: false,
        message:
          "Google Play verification endpoint is ready, but GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is not configured yet.",
        packageName: packageCheck.packageName,
        productId: body.productId,
        purchaseType: body.purchaseType,
      },
      { status: 503 }
    );
  }

  try {
    const verification = await verifyGooglePlayPurchase(body);

    if (verification.verified && verification.purchaseType === "product") {
      // Determine credit amount from productId (e.g., 'credits_10', 'credits_50')
      const match = verification.productId.match(/credits?_?(\d+)/i);
      const amount = match ? parseInt(match[1], 10) : 0;

      if (amount > 0) {
        const supabase = createClient();
        const { data: rpcResult, error: rpcError } = await (supabase.rpc as any)("add_credits", {
          p_user_id: session.user.id,
          p_amount: amount,
          p_type: "purchase",
          p_description: `Google Play purchase: ${verification.productId}`,
          p_metadata: {
            google_play_order_id: verification.orderId,
            google_play_purchase_token: verification.purchaseToken,
          },
          p_reference_id: `googleplay:${verification.orderId || verification.purchaseToken}`,
        });

        if (rpcError || !rpcResult?.[0]?.success) {
          console.error("Failed to add credits from Google Play:", rpcError || rpcResult?.[0]?.error_message);
          return NextResponse.json({ error: "Failed to fulfill purchase credits" }, { status: 500 });
        }
      }
    }

    return NextResponse.json(
      {
        status: "verified",
        verified: verification.verified,
        purchase: verification,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        verified: false,
        error: error instanceof Error ? error.message : "Google Play verification failed.",
        packageName: packageCheck.packageName,
        productId: body.productId,
        purchaseType: body.purchaseType,
      },
      { status: 502 }
    );
  }
}
