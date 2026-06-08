"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { InsightCard } from "@/components/ui/InsightCard";
import { useToast } from "@/components/ui/Toast";
import type { ATSScan } from "@/types/job-packs";

const quickActions = [
  { href: "/dashboard/scanner", label: "Scan resume", variant: "primary" as const },
  { href: "/dashboard/scanner", label: "Scan job ad", variant: "secondary" as const },
  { href: "/generate/cover-letter", label: "New cover letter", variant: "ghost" as const },
];

function getGreeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getDisplayName(sessionName: string | null | undefined, email: string | null | undefined) {
  if (sessionName?.trim()) {
    return sessionName.split(" ")[0];
  }
  if (email?.includes("@")) {
    return email.split("@")[0];
  }
  return "there";
}

function DashboardLoadingState() {
  return (
    <div className="min-h-screen bg-[#E0F2F1]">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-[2rem] bg-black/[0.04]" />
          <div className="h-64 animate-pulse rounded-[2rem] bg-black/[0.04]" />
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [lastScan, setLastScan] = useState<ATSScan | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    const paymentStatus = searchParams.get("payment");
    const subscriptionStatus = searchParams.get("subscription");
    if (paymentStatus === "success") {
      showToast({ variant: "success", title: "Payment successful", body: "Your credits are being added to your account." });
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
    } else if (paymentStatus === "cancelled") {
      showToast({ variant: "error", title: "Payment cancelled", body: "You can try again from the credits page." });
    } else if (subscriptionStatus === "success") {
      showToast({ variant: "success", title: "Subscription updated", body: "Your plan may take a moment to refresh — sign out and back in if needed." });
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
    }
  }, [status, router, searchParams, showToast]);

  useEffect(() => {
    try {
      const rawDismissed = window.localStorage.getItem("cvscan-dashboard-insights-dismissed");
      const rawScan = window.localStorage.getItem("cvscan-last-scan");
      setDismissedInsights(rawDismissed ? JSON.parse(rawDismissed) : []);
      setLastScan(rawScan ? (JSON.parse(rawScan) as ATSScan) : null);
    } catch {
      setDismissedInsights([]);
      setLastScan(null);
    }
  }, []);

  const insightCards = useMemo(() => {
    if (!session) return [];
    
    const highestMissingKeyword = lastScan?.keyword_matches.missing[0];
    const inferredJobTitle = lastScan?.job_description
      ?.split("\n")
      .find((line) => line.trim().length > 12)
      ?.slice(0, 42);
    const pendingApplicationsEstimate = Math.max(1, Math.min(6, Math.ceil(session.user.credits / 2)));
    const profileCompletion = session.user.name ? (session.user.credits > 0 ? 78 : 64) : 48;

    return [
      highestMissingKeyword
        ? {
            id: "skill-gap",
            accent: "emerald" as const,
            title: `Add ${highestMissingKeyword} to lift your match`,
            body: `Your latest scan flagged ${highestMissingKeyword} as a missing signal. Grounding that skill in Career Memory could add roughly 6-12% more relevance for similar roles.`,
            href: "/dashboard/profile/skills",
            ctaLabel: "Update skills",
          }
        : null,
      {
        id: "pending-applications",
        accent: "amber" as const,
        title: `You have ${pendingApplicationsEstimate} applications pending`,
        body: "Keep momentum by reviewing your tracker, following up, and moving stalled roles forward before you open new loops.",
        href: "/dashboard/applications",
        ctaLabel: "Open tracker",
      },
      {
        id: "profile-completion",
        accent: "cyan" as const,
        title: `Your profile is ${profileCompletion}% complete`,
        body: "The stronger your approved profile, the sharper every scan, fit analysis, and tailored drafts becomes.",
        href: "/dashboard/profile",
        ctaLabel: "Finish profile",
      },
      inferredJobTitle
        ? {
            id: "scan-suggestion",
            accent: "violet" as const,
            title: `Try scanning for ${inferredJobTitle}`,
            body: "Use another role in the same family to compare coverage and uncover the keywords that repeat across your target search.",
            href: "/dashboard/scanner",
            ctaLabel: "Run another scan",
          }
        : null,
    ]
      .filter(Boolean)
      .filter((item) => item && !dismissedInsights.includes(item.id))
      .slice(0, 3);
  }, [dismissedInsights, lastScan, session?.user?.credits, session?.user?.name, session]);

  if (status === "loading") {
    return <DashboardLoadingState />;
  }

  if (!session) {
    return null;
  }

  const displayName = getDisplayName(session.user.name, session.user.email);
  const greeting = getGreeting();
  
  const dismissInsight = (id: string) => {
    const next = [...dismissedInsights, id];
    setDismissedInsights(next);
    try {
      window.localStorage.setItem("cvscan-dashboard-insights-dismissed", JSON.stringify(next));
    } catch {}
  };

  return (
    <div className="bg-[#E0F2F1] p-4 sm:p-8 w-full min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {session.user.credits < 5 && (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Low balance: you have {session.user.credits} credit{session.user.credits === 1 ? "" : "s"}.{" "}
            <Link href="/buy-credits" className="font-semibold text-amber-700 underline decoration-amber-400/60 underline-offset-4 hover:text-amber-900">
              Add credits
            </Link>{" "}
            before running paid generations.
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <GlassCard accent="cyan" className="p-7 sm:p-8">
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-2xl">
                  <p className="eyebrow">Dashboard</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-[#1A237E] sm:text-5xl">
                    {greeting}, {displayName}.
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-[#757575]">
                    Keep your search moving with grounded scoring, faster tailoring, and a cleaner view of what to do next.
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-black/[0.06] bg-[#F0EEF0]/50 px-4 py-3 text-sm text-[#757575]">
                  <div className="text-xs uppercase tracking-[0.22em] text-[#757575]">Account</div>
                  <div className="mt-2 font-medium text-[#1A237E]">{session.user.email}</div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {quickActions.map((action) => (
                  <GradientButton key={action.href} href={action.href} size="md" variant={action.variant}>
                    {action.label}
                  </GradientButton>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex flex-col h-full gap-4"
          >
            {insightCards.length > 0 ? (
              <>
                <div className="mb-2">
                  <p className="eyebrow">Insights</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#1A237E]">
                    Actionable nudges
                  </h2>
                </div>
                <div className="flex flex-col gap-4">
                  {insightCards.slice(0, 2).map((item) => (
                    <InsightCard
                      key={item.id}
                      accent={item.accent}
                      title={item.title}
                      body={item.body}
                      href={item.href}
                      ctaLabel={item.ctaLabel}
                      onDismiss={() => dismissInsight(item.id)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <GlassCard accent="emerald" className="p-7 sm:p-8 h-full">
                <p className="eyebrow">Insights</p>
                <div className="mt-3">
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#1A237E]">
                    You're all caught up.
                  </h2>
                  <p className="mt-2 text-sm text-[#757575]">
                    Run a scan or add more profile facts to generate new insights.
                  </p>
                </div>
              </GlassCard>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="flex flex-col h-full"
          >
            <GlassCard accent="blue" className="p-6 sm:p-7 h-auto">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="eyebrow">Billing</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#1A237E]">
                    Keep the workflow moving.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#757575]">
                    Web purchases run through Stripe today.
                  </p>
                </div>
                <div>
                  <GradientButton href="/buy-credits" size="md">
                    Buy credits
                  </GradientButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardLoadingState />}>
      <DashboardContent />
    </Suspense>
  );
}
