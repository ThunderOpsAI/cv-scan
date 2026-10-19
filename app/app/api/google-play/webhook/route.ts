import { NextRequest, NextResponse } from "next/server";
import {
  getGooglePlayConfig,
  hasGooglePlayServiceAccount,
  isGooglePlayWebhookConfigured,
  parseGooglePlayWebhookBody,
  validateGooglePlayPackage,
  verifyGooglePlayPurchase,
} from "@/lib/billing/google-play";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const config = getGooglePlayConfig();
  const authHeader = request.headers.get("authorization");
  const webhookToken = request.nextUrl.searchParams.get("token");

  // Pub/Sub push subscriptions can be configured with this secret in the endpoint
  // URL. Keep the Authorization-header option for direct, authenticated calls.
  const isAuthorized =
    Boolean(config.webhookToken) &&
    (authHeader === `Bearer ${config.webhookToken}` || webhookToken === config.webhookToken);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const notification = parseGooglePlayWebhookBody(body);

  if (!notification) {
    return NextResponse.json(
      { error: "Could not parse Google Play developer notification payload." },
      { status: 400 }
    );
  }

  const packageCheck = validateGooglePlayPackage(notification.packageName);
  if (!packageCheck.ok) {
    return NextResponse.json({ error: packageCheck.reason }, { status: 400 });
  }

  if (notification.testNotification) {
    return NextResponse.json(
      {
        received: true,
        status: isGooglePlayWebhookConfigured() ? "configured" : "scaffolded",
        packageName: packageCheck.packageName,
        message: "Google Play RTDN test notification received.",
      },
      { status: 202 }
    );
  }

  const notificationType =
    notification.subscriptionNotification?.notificationType ??
    notification.oneTimeProductNotification?.notificationType ??
    null;

  const purchaseToken =
    notification.subscriptionNotification?.purchaseToken ??
    notification.oneTimeProductNotification?.purchaseToken ??
    null;
  const productId =
    notification.subscriptionNotification?.subscriptionId ??
    notification.oneTimeProductNotification?.sku ??
    null;
  const purchaseType = notification.subscriptionNotification ? "subscription" : "product";

  let verification:
    | Awaited<ReturnType<typeof verifyGooglePlayPurchase>>
    | null = null;
  let verificationError: string | null = null;

  if (purchaseToken && productId && hasGooglePlayServiceAccount()) {
    try {
      verification = await verifyGooglePlayPurchase({
        packageName: packageCheck.packageName,
        productId,
        purchaseToken,
        purchaseType,
      });
    } catch (error) {
      verificationError =
        error instanceof Error ? error.message : "Google Play verification lookup failed.";
    }
  }

  return NextResponse.json(
    {
      received: true,
      status: isGooglePlayWebhookConfigured() ? "configured" : "scaffolded",
      packageName: packageCheck.packageName,
      notificationType,
      productId,
      purchaseToken,
      purchaseType,
      verification,
      verificationError,
      message:
        "Google Play RTDN webhook received the notification. Live entitlement mutation is intentionally not wired in this phase.",
    },
    { status: 202 }
  );
}
