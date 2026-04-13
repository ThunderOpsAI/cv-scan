// Simple analytics utility
// Will work with Vercel Analytics once deployed

type VercelAnalyticsWindow = Window & {
  va?: (method: "track", eventName: string, properties?: Record<string, unknown>) => void;
};

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", eventName, properties);
  }

  // Send to Vercel Analytics if available
  if (typeof window !== "undefined") {
    const analyticsWindow = window as VercelAnalyticsWindow;
    analyticsWindow.va?.("track", eventName, properties);
  }

  // Can add other analytics providers here (Google Analytics, Mixpanel, etc.)
}

export function trackPageView(path: string) {
  trackEvent("page_view", { path });
}

export function trackSignUp() {
  trackEvent("user_signed_up");
}

export function trackPurchase(credits: number, amount: number) {
  trackEvent("credit_purchased", { credits, amount });
}

export function trackGeneration(type: "bullets" | "cover_letter") {
  trackEvent(type === "cover_letter" ? "cover_letter_run" : "tailoring_run", { type });
}
