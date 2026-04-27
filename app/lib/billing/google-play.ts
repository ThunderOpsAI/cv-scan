import { createSign } from "crypto";

export type GooglePlayPurchaseKind = "product" | "subscription";

export type GooglePlayVerificationPayload = {
  packageName: string;
  productId: string;
  purchaseToken: string;
  purchaseType: GooglePlayPurchaseKind;
  userId?: string | null;
};

type GooglePlayServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

type GooglePlayPubSubEnvelope = {
  message?: {
    data?: string;
    messageId?: string;
    publishTime?: string;
  };
  subscription?: string;
};

type GooglePlaySubscriptionNotification = {
  version: string;
  notificationType: number;
  purchaseToken: string;
  subscriptionId: string;
};

type GooglePlayProductNotification = {
  version: string;
  notificationType: number;
  purchaseToken: string;
  sku: string;
};

export type GooglePlayDeveloperNotification = {
  version: string;
  packageName: string;
  eventTimeMillis?: string;
  subscriptionNotification?: GooglePlaySubscriptionNotification;
  oneTimeProductNotification?: GooglePlayProductNotification;
  testNotification?: Record<string, never>;
};

type GooglePlayProductPurchaseResponse = {
  acknowledgementState?: number;
  consumptionState?: number;
  kind?: string;
  orderId?: string;
  purchaseState?: number;
  purchaseType?: number;
  regionCode?: string;
};

type GooglePlaySubscriptionLineItem = {
  expiryTime?: string;
  latestSuccessfulOrderId?: string;
  productId?: string;
};

type GooglePlaySubscriptionPurchaseResponse = {
  acknowledgementState?: string;
  kind?: string;
  lineItems?: GooglePlaySubscriptionLineItem[];
  linkedPurchaseToken?: string;
  regionCode?: string;
  startTime?: string;
  subscriptionState?: string;
  testPurchase?: Record<string, never>;
};

export type GooglePlayVerificationResult =
  | {
      acknowledgementState: number | null;
      entitlementActive: boolean;
      orderId: string | null;
      packageName: string;
      productId: string;
      purchaseState: number | null;
      purchaseToken: string;
      purchaseType: "product";
      regionCode: string | null;
      source: "google-play";
      verified: boolean;
    }
  | {
      acknowledgementState: string | null;
      entitlementActive: boolean;
      expiryTime: string | null;
      latestOrderId: string | null;
      packageName: string;
      productId: string;
      purchaseToken: string;
      purchaseType: "subscription";
      regionCode: string | null;
      source: "google-play";
      subscriptionState: string | null;
      verified: boolean;
    };

const GOOGLE_PLAY_SCOPE = "https://www.googleapis.com/auth/androidpublisher";
const GOOGLE_PLAY_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_PLAY_API_BASE = "https://androidpublisher.googleapis.com/androidpublisher/v3";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getGooglePlayConfig() {
  return {
    packageName: process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim() || "",
    webhookToken: process.env.GOOGLE_PLAY_WEBHOOK_TOKEN?.trim() || "",
    serviceAccountJson: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON?.trim() || "",
  };
}

export function isGooglePlayWebhookConfigured() {
  const config = getGooglePlayConfig();
  return Boolean(config.packageName && config.webhookToken);
}

export function hasGooglePlayServiceAccount() {
  return Boolean(getGooglePlayServiceAccount());
}

export function normalizeGooglePlayPackage(packageName: string) {
  return packageName.trim();
}

export function validateGooglePlayPackage(packageName: string) {
  const normalized = normalizeGooglePlayPackage(packageName);
  const expected = getGooglePlayConfig().packageName;

  if (!normalized) {
    return { ok: false as const, reason: "Missing packageName" };
  }

  if (expected && normalized !== expected) {
    return {
      ok: false as const,
      reason: `Package mismatch. Expected ${expected}.`,
    };
  }

  return { ok: true as const, packageName: normalized };
}

export function parseGooglePlayWebhookBody(body: unknown): GooglePlayDeveloperNotification | null {
  if (!isObject(body)) {
    return null;
  }

  if (isGooglePlayDeveloperNotification(body)) {
    return body;
  }

  const envelope = body as GooglePlayPubSubEnvelope;
  const encodedData = envelope.message?.data;
  if (!encodedData) {
    return null;
  }

  try {
    const decoded = Buffer.from(encodedData, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as unknown;
    return isObject(parsed) && isGooglePlayDeveloperNotification(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getGooglePlayServiceAccount(): GooglePlayServiceAccount | null {
  const rawValue = getGooglePlayConfig().serviceAccountJson;
  if (!rawValue) {
    return null;
  }

  try {
    const jsonValue = rawValue.startsWith("{")
      ? rawValue
      : Buffer.from(rawValue, "base64").toString("utf8");
    const parsed = JSON.parse(jsonValue) as Partial<GooglePlayServiceAccount>;

    if (typeof parsed.client_email !== "string" || typeof parsed.private_key !== "string") {
      return null;
    }

    return {
      client_email: parsed.client_email,
      private_key: parsed.private_key.replace(/\\n/g, "\n"),
      token_uri: typeof parsed.token_uri === "string" ? parsed.token_uri : GOOGLE_PLAY_TOKEN_URL,
    };
  } catch {
    return null;
  }
}

function base64UrlEncode(value: Buffer | string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function getGooglePlayAccessToken() {
  const serviceAccount = getGooglePlayServiceAccount();
  if (!serviceAccount) {
    throw new Error("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is missing or invalid.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      aud: serviceAccount.token_uri ?? GOOGLE_PLAY_TOKEN_URL,
      exp: now + 3600,
      iat: now,
      iss: serviceAccount.client_email,
      scope: GOOGLE_PLAY_SCOPE,
    })
  );

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  signer.end();

  const assertion = `${header}.${payload}.${base64UrlEncode(
    signer.sign(serviceAccount.private_key)
  )}`;

  const tokenResponse = await fetch(serviceAccount.token_uri ?? GOOGLE_PLAY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      assertion,
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    }),
  });

  const tokenBody = await tokenResponse.json().catch(() => null);
  if (!tokenResponse.ok || typeof tokenBody?.access_token !== "string") {
    const tokenMessage =
      typeof tokenBody?.error_description === "string"
        ? tokenBody.error_description
        : typeof tokenBody?.error === "string"
          ? tokenBody.error
          : "Google OAuth token exchange failed.";
    throw new Error(tokenMessage);
  }

  return tokenBody.access_token;
}

async function fetchGooglePlayJson<T>(path: string): Promise<T> {
  const accessToken = await getGooglePlayAccessToken();
  const response = await fetch(`${GOOGLE_PLAY_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const errorPayload = body as { error?: { message?: string } } | null;
    throw new Error(errorPayload?.error?.message || "Google Play API request failed.");
  }

  return body as T;
}

function hasActiveSubscriptionEntitlement(subscriptionState: string | undefined) {
  return (
    subscriptionState === "SUBSCRIPTION_STATE_ACTIVE" ||
    subscriptionState === "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"
  );
}

export async function verifyGooglePlayPurchase(
  payload: GooglePlayVerificationPayload
): Promise<GooglePlayVerificationResult> {
  const packageCheck = validateGooglePlayPackage(payload.packageName);
  if (!packageCheck.ok) {
    throw new Error(packageCheck.reason);
  }

  if (payload.purchaseType === "subscription") {
    const result = await fetchGooglePlayJson<GooglePlaySubscriptionPurchaseResponse>(
      `/applications/${encodeURIComponent(
        packageCheck.packageName
      )}/purchases/subscriptionsv2/tokens/${encodeURIComponent(payload.purchaseToken)}`
    );
    const matchingLineItem =
      result.lineItems?.find((lineItem) => lineItem.productId === payload.productId) ??
      result.lineItems?.[0];

    return {
      acknowledgementState: result.acknowledgementState ?? null,
      entitlementActive: hasActiveSubscriptionEntitlement(result.subscriptionState),
      expiryTime: matchingLineItem?.expiryTime ?? null,
      latestOrderId: matchingLineItem?.latestSuccessfulOrderId ?? null,
      packageName: packageCheck.packageName,
      productId: matchingLineItem?.productId ?? payload.productId,
      purchaseToken: payload.purchaseToken,
      purchaseType: "subscription",
      regionCode: result.regionCode ?? null,
      source: "google-play",
      subscriptionState: result.subscriptionState ?? null,
      verified: true,
    };
  }

  const result = await fetchGooglePlayJson<GooglePlayProductPurchaseResponse>(
    `/applications/${encodeURIComponent(packageCheck.packageName)}/purchases/products/${encodeURIComponent(
      payload.productId
    )}/tokens/${encodeURIComponent(payload.purchaseToken)}`
  );

  return {
    acknowledgementState: result.acknowledgementState ?? null,
    entitlementActive: result.purchaseState === 0,
    orderId: result.orderId ?? null,
    packageName: packageCheck.packageName,
    productId: payload.productId,
    purchaseState: result.purchaseState ?? null,
    purchaseToken: payload.purchaseToken,
    purchaseType: "product",
    regionCode: result.regionCode ?? null,
    source: "google-play",
    verified: result.purchaseState === 0,
  };
}

function isGooglePlayDeveloperNotification(
  value: Record<string, unknown>
): value is GooglePlayDeveloperNotification {
  return typeof value.version === "string" && typeof value.packageName === "string";
}
