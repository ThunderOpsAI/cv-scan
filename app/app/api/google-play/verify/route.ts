import { NextRequest, NextResponse } from "next/server";
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
