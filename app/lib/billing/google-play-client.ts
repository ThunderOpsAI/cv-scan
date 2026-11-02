import { Capacitor } from "@capacitor/core";
import { NativePurchases, PURCHASE_TYPE } from "@capgo/native-purchases";

/**
 * Client utility for interacting with Google Play Billing.
 * On native Android (Capacitor), uses @capgo/native-purchases.
 * In a standard browser or non-Android environment, returns an informative error.
 */

export interface GooglePlayPurchaseResult {
  purchaseToken?: string;
  orderId?: string;
  error?: string;
}

export function isGooglePlayAvailable(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

export async function purchaseGooglePlayProduct(
  productId: string
): Promise<GooglePlayPurchaseResult> {
  if (typeof window === "undefined") {
    return { error: "Not running in a browser environment" };
  }

  // If running in native Android Capacitor shell
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
    try {
      const transaction = await NativePurchases.purchaseProduct({
        productIdentifier: productId,
        productType: PURCHASE_TYPE.INAPP,
        quantity: 1,
        // Consumables must not auto-acknowledge so our backend can verify and consume
        autoAcknowledgePurchases: false,
      });

      if (!transaction.purchaseToken) {
        return { error: "Google Play purchase completed but no purchase token was returned." };
      }

      return {
        purchaseToken: transaction.purchaseToken,
        orderId: transaction.orderId,
      };
    } catch (error: unknown) {
      console.error("Google Play native purchase error:", error);
      return {
        error: error instanceof Error ? error.message : "An error occurred during Google Play purchase.",
      };
    }
  }

  return {
    error: "Google Play Billing is only available in the Android app.",
  };
}
