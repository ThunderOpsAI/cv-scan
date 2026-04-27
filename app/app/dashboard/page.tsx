"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";

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
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-white">
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        {children}
      </svg>
    </div>
  );
}

function DashboardLoadingState() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.1),transparent_24%),linear-gradient(180deg,#060b15_0%,#081120_100%)]">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <div className="h-12 w-40 animate-pulse rounded-2xl bg-white/[0.08]" />
          <div className="h-10 w-32 animate-pulse rounded-full bg-white/[0.08]" />
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="h-64 animate-pulse rounded-[2rem] bg-white/[0.08]" />
          <div className="h-64 animate-pulse rounded-[2rem] bg-white/[0.08]" />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-[1.75rem] bg-white/[0.08]" />
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
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    const paymentStatus = searchParams.get("payment");
    const subscriptionStatus = searchParams.get("subscription");
    if (paymentStatus === "success") {
      setMessage({ text: "Payment successful! Your credits are being added to your account.", type: "success" });
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
    } else if (paymentStatus === "cancelled") {
      setMessage({ text: "Payment was cancelled.", type: "error" });
    } else if (subscriptionStatus === "success") {
      setMessage({
        text: "Subscription updated. Your plan may take a moment to refresh — sign out and back in if needed.",
        type: "success",
      });
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
    }
  }, [status, router, searchParams]);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeout = window.setTimeout(() => setMessage(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  useEffect(() => {
    try {
      setOnboardingDismissed(window.localStorage.getItem("cvscan-dashboard-onboarding-dismissed") === "true");
    } catch {
      setOnboardingDismissed(false);
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_90%_10%,rgba(129,140,248,0.14),transparent_18%),linear-gradient(180deg,#060b15_0%,#081120_45%,#050a14_100%)]">
      {message && (
        <div
          className={`fixed left-4 right-4 top-4 z-50 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl sm:left-auto sm:right-6 sm:w-[32rem] ${
            message.type === "success"
              ? "border-emerald-300/[0.26] bg-emerald-300/10 text-emerald-50"
              : "border-rose-300/[0.26] bg-rose-300/10 text-rose-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-current" />
            <p className="flex-1 font-medium">{message.text}</p>
            <button onClick={() => setMessage(null)} className="ml-2 text-current/80 transition hover:text-white">
              Close
            </button>
          </div>
        </div>
      )}

      <nav className="container mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.14] bg-white/[0.06] shadow-[0_18px_44px_rgba(2,8,23,0.32)]">
            <span className="bg-[linear-gradient(135deg,#7dd3fc,#c4b5fd)] bg-clip-text text-lg font-semibold text-transparent">
              CV
            </span>
          </div>
          <div>
            <div className="text-lg font-semibold tracking-[-0.03em]">CVScan</div>
            <div className="text-xs text-slate-400">premium career workflow</div>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-cyan-300/[0.18] bg-cyan-300/10 px-4 py-2 text-sm text-cyan-50">
            Credits <span className="ml-2 font-semibold text-white">{session.user.credits}</span>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-200">
            Plan <span className="ml-2 font-semibold capitalize text-white">{session.user.planTier}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.09] hover:text-white"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="container mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto">
          {session.user.credits < 5 && (
            <div className="mb-6 rounded-2xl border border-amber-300/[0.24] bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              Low balance: you have {session.user.credits} credit{session.user.credits === 1 ? "" : "s"}.{" "}
              <Link href="/buy-credits" className="font-semibold text-amber-200 underline decoration-amber-200/60 underline-offset-4 hover:text-white">
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
                      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
                        {greeting}, {displayName}.
                      </h1>
                      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                        Keep your search moving with grounded scoring, faster tailoring, and a cleaner view of what to do next.
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Account</div>
                      <div className="mt-2 font-medium text-white">{session.user.email}</div>
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
                        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                          Three-step launch path
                        </h2>
                        <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-300">
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
                      className="text-sm text-slate-400 transition hover:text-white"
                    >
                      Dismiss
                    </button>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    Career memory, target roles, and your first job-fit pass. Optional, but still the fastest route to sharper results.
                  </p>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,rgba(103,232,249,0.92),rgba(129,140,248,0.92))] transition-all duration-500"
                      style={{ width: `${Math.max(onboardingProgress, 20)}%` }}
                    />
                  </div>
                  <div className="mt-6 space-y-3">
                    {onboardingSteps.map((step, index) => {
                      const completed = index < completedOnboardingSteps;
                      const current = index === completedOnboardingSteps;

                      return (
                        <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                          <div
                            className={[
                              "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                              completed
                                ? "border-cyan-300/30 bg-cyan-300/18 text-cyan-100"
                                : current
                                  ? "border-violet-300/30 bg-violet-300/14 text-violet-100"
                                  : "border-white/10 bg-white/[0.04] text-slate-400",
                            ].join(" ")}
                          >
                            0{index + 1}
                          </div>
                          <div className="flex-1 text-sm text-slate-300">{step}</div>
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
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
                      <div key={signal.label} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{signal.label}</div>
                        <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">{signal.value}</div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>

          {featureSections.map((section, sectionIndex) => (
            <section key={section.title} className="mt-12">
              <div className="gradient-divider mb-6" />
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow">{section.title}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                    {section.title}
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-slate-400">{section.description}</p>
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
                            <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-300">
                              {card.badge}
                            </div>
                          </div>
                          <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-white">
                            {card.title}
                          </h3>
                          <p className="mt-3 flex-1 text-sm leading-7 text-slate-300">{card.copy}</p>
                          <div className="mt-6 text-sm text-cyan-200">Open workspace</div>
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
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                    Keep the workflow moving.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Web purchases run through Stripe today. Android release paths are scaffolded for Google Play Billing verification.
                  </p>
                </div>
                <GradientButton href="/buy-credits" size="md">
                  Buy credits
                </GradientButton>
              </div>
            </GlassCard>
          </section>

          <div className="mt-12 border-t border-white/[0.08] pt-6">
            <p className="text-xs font-mono text-slate-600">
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
