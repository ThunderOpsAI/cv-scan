import "next-auth";
import type { PlanTier } from "@/lib/billing/plan-tier";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      credits: number;
      planTier: PlanTier;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    credits?: number;
    planTier?: PlanTier;
  }
}
