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
import Image from "next/image";
import type { ATSScan } from "@/types/job-packs";

type Accent = "amber" | "blue" | "cyan" | "emerald" | "pink" | "violet";

type FeatureCard = {
  accent: Accent;
  badge: string;
  copy: string;
  href: string;
  icon: ReactNode;
  title: string;
};

type FeatureSection = {
  cards: FeatureCard[];
  description: string;
  title: string;
};

const quickActions = [
  { href: "/dashboard/scanner", label: "Scan resume", variant: "primary" as const },
  { href: "/generate/cover-letter", label: "New cover letter", variant: "secondary" as const },
  { href: "/dashboard/jobs", label: "Browse jobs", variant: "ghost" as const },
];

const featureSections: FeatureSection[] = [
  {
    description: "Build the context that powers stronger tailoring everywhere else.",
    title: "Profile foundation",
    cards: [
      {
        accent: "blue",
        badge: "Career memory",
        copy: "Create your professional profile with experiences, education, and skills for stronger matching.",
        href: "/dashboard/profile",
        icon: (
          <path
            d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        ),
        title: "Build your profile",
      },
      {
        accent: "violet",
        badge: "Guided path",
        copy: "Career memory, target roles, and first job fit all in one optional activation flow.",
        href: "/dashboard/onboarding",
        icon: (
          <path
            d="M5 12h4l2-6 2 12 2-6h4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        ),
        title: "Activation checklist",
      },
    ],
  },
  {
    description: "Use targeted tools to evaluate roles, tailor assets, and keep applications moving.",
    title: "Application engine",
    cards: [
      {
        accent: "cyan",
        badge: "1 credit per analysis",
        copy: "Apply, stretch, or skip with profile-grounded reasoning for each job description.",
        href: "/dashboard/job-fit",
        icon: (
          <path
            d="m4 16 4-4 3 3 7-7M4 7h5m0 0v5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        ),
        title: "Job fit",
      },
      {
        accent: "emerald",
        badge: "Free 3/day, then 1 credit",
        copy: "Check keyword coverage and ATS alignment before you send another draft.",
        href: "/dashboard/scanner",
        icon: (
          <path
            d="M10.5 4H7a2 2 0 0 0-2 2v3.5m11-5.5H17a2 2 0 0 1 2 2v3.5M16 20h1a2 2 0 0 0 2-2v-3.5M8 20H7a2 2 0 0 1-2-2v-3.5M9.5 9.5a4 4 0 1 0 5 5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        ),
        title: "ATS scanner",
      },
      {
        accent: "violet",
        badge: "5 credits per pack",
        copy: "Assemble a complete application package with tailored assets and analysis in one flow.",
        href: "/dashboard/job-packs",
        icon: (
          <path
            d="M4 8.5 12 4l8 4.5M4 8.5v7L12 20l8-4.5v-7M12 20v-8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        ),
        title: "Job packs",
      },
      {
        accent: "amber",
        badge: "Kanban + list views",
        copy: "Track interviews, follow-ups, and application momentum without leaving the app.",
        href: "/dashboard/applications",
        icon: (
          <path
            d="M6 5h12M6 12h12M6 19h12"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        ),
        title: "Application tracker",
      },
    ],
  },
  {
    description: "Stay sharp with intelligence tools and tailored generation on demand.",
    title: "Intelligence studio",
    cards: [
      {
        accent: "blue",
        badge: "1 credit per message",
        copy: "Talk through strategy, blockers, and next steps with your career copilot.",
        href: "/dashboard/copilot",
        icon: (
          <path
            d="M12 4a6 6 0 0 0-6 6v2.5L4 16v1h16v-1l-2-3.5V10a6 6 0 0 0-6-6Zm-2 14h4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        ),
        title: "Career copilot",
      },
      {
        accent: "cyan",
        badge: "Free job discovery",
        copy: "Find roles matched to your profile and prioritize where to spend your energy next.",
        href: "/dashboard/jobs",
        icon: (
          <path
            d="m20 20-3.5-3.5M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        ),
        title: "Discover jobs",
      },
      {
        accent: "pink",
        badge: "Interview context",
        copy: "Structure stronger stories and prep responses with STAR-ready context.",
        href: "/dashboard/profile/stories",
        icon: (
          <path
            d="m12 3 2.5 5 5.5.8-4 3.9 1 5.5L12 15.7 7 18.2l1-5.5-4-3.9L9.5 8 12 3Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        ),
        title: "STAR stories",
      },
      {
        accent: "violet",
        badge: "Career tracking",
        copy: "Set career objectives and keep your search aligned with a measurable plan.",
        href: "/dashboard/profile/goals",
        icon: (
          <path
            d="M5 19 19 5M9 5h10v10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        ),
        title: "SMART goals",
      },
      {
        accent: "blue",
        badge: "1 credit per generation",
        copy: "Transform rough responsibilities into polished, ATS-aware bullet points.",
        href: "/generate/bullets",
        icon: (
          <path
            d="M7 7h10M7 12h10M7 17h6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        ),
        title: "Generate bullets",
      },
      {
        accent: "cyan",
        badge: "2 credits per generation",
        copy: "Draft sharper cover letters that stay grounded in your actual experience.",
        href: "/generate/cover-letter",
        icon: (
          <path
            d="M4 7.5 12 13l8-5.5M6 19h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
        ),
        title: "Generate cover letter",
      },
    ],
  },
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

function IconWrap({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/[0.06] bg-[#F0EEF0] text-[#1A237E]">
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        {children}
      </svg>
    </div>
  );
}

function DashboardLoadingState() {
  return (
    <div className="min-h-screen bg-[#E0F2F1]">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <div className="h-12 w-40 animate-pulse rounded-2xl bg-black/[0.04]" />
          <div className="h-10 w-32 animate-pulse rounded-full bg-black/[0.04]" />
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="h-64 animate-pulse rounded-[2rem] bg-black/[0.04]" />
          <div className="h-64 animate-pulse rounded-[2rem] bg-black/[0.04]" />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-[1.75rem] bg-black/[0.04]" />
          ))}
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
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
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
      setOnboardingDismissed(window.localStorage.getItem("cvscan-dashboard-onboarding-dismissed") === "true");
    } catch {
      setOnboardingDismissed(false);
    }
  }, []);

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
  const onboardingSteps = [
    "Career memory imported",
    "Target role path set",
    "First scan or fit check run",
  ];
  const completedOnboardingSteps = session.user.credits > 0 ? 1 : 0;
  const onboardingProgress = Math.round((completedOnboardingSteps / onboardingSteps.length) * 100);
  const profileSignals = [
    {
      label: "Credits ready",
      value: `${session.user.credits}`,
    },
    {
      label: "Plan tier",
      value: session.user.planTier.charAt(0).toUpperCase() + session.user.planTier.slice(1),
    },
    {
      label: "Next best move",
      value: session.user.credits < 3 ? "Recharge credits" : "Run a fresh scan",
    },
  ];

  const dismissInsight = (id: string) => {
    const next = [...dismissedInsights, id];
    setDismissedInsights(next);
    try {
      window.localStorage.setItem("cvscan-dashboard-insights-dismissed", JSON.stringify(next));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#E0F2F1]">

      <nav className="container mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-16 w-64 transition-transform duration-300 group-hover:scale-105">
            <Image src="/AI_CV_Scan_Logo.png" alt="AICVScan Logo" fill className="object-contain" priority />
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-[#26A69A]/[0.18] bg-[#26A69A]/10 px-4 py-2 text-sm text-[#1A237E]">
            Credits <span className="ml-2 font-semibold text-[#26A69A]">{session.user.credits}</span>
          </div>
          <div className="rounded-full border border-black/[0.06] bg-white/40 px-4 py-2 text-sm text-[#1A237E]">
            Plan <span className="ml-2 font-semibold capitalize text-[#1A237E]">{session.user.planTier}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-full border border-black/[0.06] bg-white/40 px-4 py-2 text-sm text-[#757575] transition hover:bg-white/60 hover:text-[#1A237E]"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="container mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto">
          {session.user.credits < 5 && (
            <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Low balance: you have {session.user.credits} credit{session.user.credits === 1 ? "" : "s"}.{" "}
              <Link href="/buy-credits" className="font-semibold text-amber-700 underline decoration-amber-400/60 underline-offset-4 hover:text-amber-900">
                Add credits
              </Link>{" "}
              before running paid generations.
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <GlassCard accent="cyan" className="h-full p-7 sm:p-8">
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

            {!onboardingDismissed ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.06 }}
              >
                <GlassCard accent="violet" className="h-full p-7 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">Activation path</p>
                      <div className="mt-3 flex items-center gap-3">
                        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#1A237E]">
                          Three-step launch path
                        </h2>
                        <div className="rounded-full border border-black/[0.06] bg-white/40 px-3 py-1 text-xs text-[#757575]">
                          {onboardingProgress}% complete
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOnboardingDismissed(true);
                        window.localStorage.setItem("cvscan-dashboard-onboarding-dismissed", "true");
                      }}
                      className="text-sm text-[#757575] transition hover:text-[#1A237E]"
                    >
                      Dismiss
                    </button>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#757575]">
                    Career memory, target roles, and your first job-fit pass. Optional, but still the fastest route to sharper results.
                  </p>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/[0.06]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#26A69A,#1A237E)] transition-all duration-500"
                      style={{ width: `${Math.max(onboardingProgress, 20)}%` }}
                    />
                  </div>
                  <div className="mt-6 space-y-3">
                    {onboardingSteps.map((step, index) => {
                      const completed = index < completedOnboardingSteps;
                      const current = index === completedOnboardingSteps;

                      return (
                        <div key={step} className="flex items-center gap-3 rounded-2xl border border-black/[0.04] bg-white/30 px-4 py-3">
                          <div
                            className={[
                              "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                              completed
                                ? "border-[#26A69A]/30 bg-[#26A69A]/18 text-[#26A69A]"
                                : current
                                  ? "border-[#1A237E]/30 bg-[#1A237E]/14 text-[#1A237E]"
                                  : "border-black/[0.06] bg-[#F0EEF0] text-[#757575]",
                            ].join(" ")}
                          >
                            0{index + 1}
                          </div>
                          <div className="flex-1 text-sm text-[#1A237E]">{step}</div>
                          <div className="text-xs uppercase tracking-[0.18em] text-[#757575]">
                            {completed ? "Done" : current ? "Now" : "Next"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <GradientButton href="/dashboard/onboarding" size="md" variant="secondary">
                      Open onboarding
                    </GradientButton>
                    <GradientButton href="/dashboard/profile/facts" size="md" variant="ghost">
                      Import resume
                    </GradientButton>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.06 }}
              >
                <GlassCard accent="blue" className="h-full p-7 sm:p-8">
                  <p className="eyebrow">Search pulse</p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    {profileSignals.map((signal) => (
                      <div key={signal.label} className="rounded-[1.4rem] border border-black/[0.06] bg-[#F0EEF0]/50 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-[#757575]">{signal.label}</div>
                        <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[#1A237E]">{signal.value}</div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>

          {insightCards.length > 0 ? (
            <section className="mt-6">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Insights</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#1A237E]">
                    Actionable nudges for your next move
                  </h2>
                </div>
                <div className="rounded-full border border-black/[0.06] bg-white/40 px-3 py-1 text-xs text-[#757575]">
                  Up to 3 visible
                </div>
              </div>
              <div className="grid gap-4 xl:grid-cols-3">
                {insightCards.map((item) => (
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
            </section>
          ) : null}

          {featureSections.map((section, sectionIndex) => (
            <section key={section.title} className="mt-12">
              <div className="gradient-divider mb-6" />
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow">{section.title}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#1A237E] sm:text-3xl">
                    {section.title}
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-[#757575]">{section.description}</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {section.cards.map((card, cardIndex) => (
                  <motion.div
                    key={card.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: sectionIndex * 0.06 + cardIndex * 0.04 }}
                  >
                    <Link
                      href={card.href}
                      data-testid={
                        card.href === "/dashboard/scanner"
                          ? "ats-scanner-link"
                          : card.href === "/dashboard/job-packs"
                            ? "job-packs-link"
                            : card.href === "/dashboard/applications"
                              ? "application-tracker-link"
                              : undefined
                      }
                    >
                      <GlassCard accent={card.accent} interactive className="h-full p-6">
                        <div className="flex h-full flex-col">
                          <div className="flex items-start justify-between gap-4">
                            <IconWrap>{card.icon}</IconWrap>
                            <div className="rounded-full border border-black/[0.06] bg-white/40 px-3 py-1 text-xs text-[#757575]">
                              {card.badge}
                            </div>
                          </div>
                          <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-[#1A237E]">
                            {card.title}
                          </h3>
                          <p className="mt-3 flex-1 text-sm leading-7 text-[#757575]">{card.copy}</p>
                          <div className="mt-6 text-sm text-[#26A69A]">Open workspace</div>
                        </div>
                      </GlassCard>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}

          <section className="mt-12">
            <GlassCard accent="blue" className="p-6 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="eyebrow">Billing</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#1A237E]">
                    Keep the workflow moving.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#757575]">
                    Web purchases run through Stripe today. Android release paths are scaffolded for Google Play Billing verification.
                  </p>
                </div>
                <GradientButton href="/buy-credits" size="md">
                  Buy credits
                </GradientButton>
              </div>
            </GlassCard>
          </section>

          <div className="mt-12 border-t border-black/[0.05] pt-6">
            <p className="text-xs font-mono text-[#757575]">
              User ID: <span className="select-all">{session.user.id}</span>
            </p>
          </div>
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
