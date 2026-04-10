// Simple analytics utility
// Will work with Vercel Analytics once deployed

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", eventName, properties);
  }

  // Send to Vercel Analytics if available
  if (typeof window !== "undefined" && (window as any).va) {
    (window as any).va("track", eventName, properties);
  }

  // Can add other analytics providers here (Google Analytics, Mixpanel, etc.)
}

export function trackPageView(path: string) {
  trackEvent("page_view", { path });
}

export function trackSignUp(userId: string) {
  trackEvent("sign_up", { userId });
}

export function trackPurchase(userId: string, credits: number, amount: number) {
  trackEvent("purchase", { userId, credits, amount });
}

export function trackGeneration(userId: string, type: "bullets" | "cover_letter") {
  trackEvent("generation", { userId, type });
}
