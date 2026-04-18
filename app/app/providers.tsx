"use client";

import { SessionProvider } from "next-auth/react";

// Mock session for beta branch (no authentication)
const mockSession: any = {
  user: {
    name: "Beta User",
    email: "beta@cvscan.com",
    image: null,
    id: "beta-user-123",
    role: "user",
    credits: 9999,
    stripe_customer_id: null,
    subscription_status: "active",
    planTier: "enterprise"
  },
  expires: "9999-12-31T23:59:59.999Z"
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider session={mockSession}>
      {children}
    </SessionProvider>
  );
}
