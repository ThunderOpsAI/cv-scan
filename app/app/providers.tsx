"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";
import { useEffect } from "react";

/**
 * Syncs the marketing opt-in preference from localStorage to the database
 * after a successful sign-in. Runs once per session.
 */
function MarketingConsentSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const stored = typeof window !== "undefined"
      ? localStorage.getItem("cvscan_marketing_opt_in")
      : null;

    // Only sync if there's a pending preference to record
    if (stored === null) return;

    const optIn = stored === "1";

    fetch("/api/auth/marketing-consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optIn }),
    })
      .then(() => {
        // Clear the flag so we don't re-send on every page load
        localStorage.removeItem("cvscan_marketing_opt_in");
      })
      .catch(() => {
        // Silently fail — will retry on next page load
      });
  }, [session, status]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MarketingConsentSync />
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
