"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";

type LandingExperienceProps = {
  accountHref: string;
  signedIn: boolean;
};

const heroPhrases = ["score every resume", "tailor every application", "track every opportunity"];

const processSteps = [
  {
    accent: "cyan" as const,
    description:
      "Bring in your resume, target role, or a rough draft. CVScan turns messy inputs into structured career context.",
    eyebrow: "Step 01",
    title: "Import your story",
  },
  {
    accent: "blue" as const,
    description:
      "See how your experience maps to each role with grounded scoring, keyword gaps, and evidence-aware suggestions.",
    eyebrow: "Step 02",
    title: "See the signal",
  },
  {
    accent: "violet" as const,
    description:
      "Generate sharper bullets, better cover letters, and next-step actions without losing your voice or credibility.",
    eyebrow: "Step 03",
    title: "Ship the best version",
  },
];

const pricingTiers = [
  {
    accent: "blue" as const,
    description: "A lightweight pack for quick tune-ups and role-specific edits.",
    name: "Starter",
    popular: false,
    price: 8.99,
    credits: 50,
  },
  {
    accent: "cyan" as const,
    description: "The everyday workflow for active job seekers running multiple applications each week.",
    name: "Application Sprint",
    popular: true,
    price: 29.99,
    credits: 200,
  },
  {
    accent: "violet" as const,
    description: "Deep support for career pivots, interview prep, and higher-volume tailoring.",
    name: "Career Switch",
    popular: false,
    price: 69.99,
    credits: 500,
  },
];

const stats = [
  { label: "resume improvements shipped", suffix: "+", value: 2400 },
  { label: "average ATS lift on tailored drafts", suffix: "%", value: 31 },
  { label: "job seekers supported across AU/NZ", suffix: "+", value: 880 },
];

const beforeExample = [
  "Responsible for customer support and issue handling.",
  "Helped with reporting and team coordination.",
  "Worked across several projects as needed.",
];

const afterExample = [
  "Resolved 40+ weekly customer escalations while cutting average response time by 38%.",
  "Built reporting workflows that gave leadership same-day visibility into SLA risk.",
  "Coordinated cross-functional delivery across support, sales, and operations teams.",
];

function SparkIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 3l1.75 5.25L19 10l-5.25 1.75L12 17l-1.75-5.25L5 10l5.25-1.75L12 3z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24">
      <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export function LandingExperience({ accountHref, signedIn }: LandingExperienceProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [comparisonMode, setComparisonMode] = useState<"before" | "after">("after");

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPhraseIndex((current) => (current + 1) % heroPhrases.length);
    }, 2400);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="hero-mesh pointer-events-none absolute inset-0" />
      <div className="hero-orb hero-orb-left" />
      <div className="hero-orb hero-orb-right" />

      <nav className="container relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.14] bg-white/[0.06] shadow-[0_18px_44px_rgba(2,8,23,0.32)]">
            <span className="bg-[linear-gradient(135deg,#7dd3fc,#c4b5fd)] bg-clip-text text-lg font-semibold text-transparent">
              CV
            </span>
          </div>
          <div>
            <div className="text-lg font-semibold tracking-[-0.03em]">CVScan</div>
            <div className="text-xs text-slate-400">cvscan.com.au</div>
          </div>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/trust" className="text-sm text-slate-300 transition-colors hover:text-white">
            Trust
          </Link>
          <Link href="/pricing" className="text-sm text-slate-300 transition-colors hover:text-white">
            Pricing
          </Link>
          <GradientButton href={accountHref} size="md" variant="secondary">
            {signedIn ? "Open dashboard" : "Access beta"}
          </GradientButton>
        </div>
      </nav>

      <section className="container relative z-10 mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.07] px-4 py-2 text-sm text-cyan-100 shadow-[0_18px_40px_rgba(14,165,233,0.14)]"
            >
              <SparkIcon />
              Premium AI workflow for modern job search
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.08 }}
              className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-white sm:text-5xl lg:text-7xl"
            >
              Make every application feel hand-built,
              <span className="block bg-[linear-gradient(135deg,#f8fafc,#7dd3fc,#c4b5fd)] bg-clip-text text-transparent">
                without starting from zero.
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.16 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-slate-300"
            >
              CVScan helps you{" "}
              <span className="relative inline-flex min-h-[2rem] min-w-[16rem] overflow-hidden align-bottom sm:min-w-[19rem]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={heroPhrases[phraseIndex]}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.35 }}
                    className="absolute left-0 top-0 bg-[linear-gradient(135deg,#67e8f9,#93c5fd,#ddd6fe)] bg-clip-text font-medium text-transparent"
                  >
                    {heroPhrases[phraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>{" "}
              with grounded scoring, guided tailoring, and a dashboard that keeps your search moving.
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.24 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <GradientButton href={accountHref}>
                {signedIn ? "Continue in dashboard" : "Start with magic link"}
                <ArrowIcon />
              </GradientButton>
              <GradientButton href="#before-after" variant="secondary">
                See the transformation
              </GradientButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.32 }}
              className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-400"
            >
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" />
                Magic-link email sign-in
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_16px_rgba(125,211,252,0.8)]" />
                No credit card required
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.8)]" />
                Built for AU/NZ beta
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 26 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
          >
            <GlassCard accent="cyan" className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/70">Live preview</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                    Better signal, less guesswork
                  </h2>
                </div>
                <div className="rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1 text-xs text-slate-300">
                  Closed beta
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="text-2xl font-semibold tracking-[-0.04em] text-white">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.76),rgba(8,15,30,0.94))] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Role target</p>
                    <p className="mt-1 text-lg font-medium text-white">Customer Success Manager</p>
                  </div>
                  <div className="rounded-full bg-emerald-400/[0.12] px-3 py-1 text-sm text-emerald-200">
                    Match score +28%
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    ["Before", "Generic phrasing, no evidence, vague ownership."],
                    ["After", "Sharper metrics, clearer impact, stronger ATS keyword coverage."],
                  ].map(([label, copy]) => (
                    <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                      <p className="text-sm font-medium text-slate-200">{label}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <section id="before-after" className="container relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Before / After</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Show the upgrade, not just the promise.
            </h2>
          </div>
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            {(["before", "after"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setComparisonMode(mode)}
                className={[
                  "rounded-full px-4 py-2 text-sm transition-all duration-300",
                  comparisonMode === mode
                    ? "bg-white text-slate-950 shadow-[0_12px_32px_rgba(255,255,255,0.16)]"
                    : "text-slate-300 hover:text-white",
                ].join(" ")}
              >
                {mode === "before" ? "Before" : "After CVScan"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <GlassCard accent="pink" className="p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Original resume language</p>
            <div className="mt-4 space-y-4">
              {beforeExample.map((line) => (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-2xl border border-rose-300/[0.14] bg-rose-300/[0.06] p-4 text-sm leading-7 text-slate-300"
                >
                  {line}
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard accent="cyan" className="p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Tailored output preview</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={comparisonMode}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                className="mt-4 space-y-4"
              >
                {(comparisonMode === "before" ? beforeExample : afterExample).map((line) => (
                  <div
                    key={line}
                    className={[
                      "rounded-2xl border p-4 text-sm leading-7",
                      comparisonMode === "after"
                        ? "border-cyan-300/[0.16] bg-cyan-300/[0.08] text-slate-100"
                        : "border-white/10 bg-white/[0.04] text-slate-300",
                    ].join(" ")}
                  >
                    {comparisonMode === "after" ? (
                      <>
                        {line.includes("38%") ? (
                          <>
                            Resolved 40+ weekly customer escalations while cutting average response time by{" "}
                            <span className="rounded-sm bg-cyan-300/[0.18] px-1 text-cyan-100 underline decoration-cyan-300/70 underline-offset-4">
                              38%
                            </span>
                            .
                          </>
                        ) : line.includes("same-day visibility") ? (
                          <>
                            Built reporting workflows that gave leadership{" "}
                            <span className="rounded-sm bg-violet-300/[0.18] px-1 text-violet-100 underline decoration-violet-300/70 underline-offset-4">
                              same-day visibility
                            </span>{" "}
                            into SLA risk.
                          </>
                        ) : (
                          line
                        )}
                      </>
                    ) : (
                      line
                    )}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </div>
      </section>

      <section id="how-it-works" className="container relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-10">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
            A calmer workflow for a very noisy process.
          </h2>
        </div>

        <div className="relative grid gap-6 lg:grid-cols-3">
          <div className="pointer-events-none absolute left-[16.7%] right-[16.7%] top-10 hidden h-px bg-[linear-gradient(90deg,transparent,rgba(125,211,252,0.36),transparent)] lg:block" />
          {processSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <GlassCard accent={step.accent} interactive className="h-full p-6">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-sm font-semibold text-white">
                  0{index + 1}
                </div>
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">{step.eyebrow}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">{step.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <GlassCard accent="violet" className="overflow-hidden p-8 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(196,181,253,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(103,232,249,0.14),transparent_34%)]" />
          <div className="relative">
            <p className="eyebrow">Trust signals</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Built for people who want help without handing over control.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                "Magic-link email and optional Google OAuth for low-friction sign-in.",
                "Resume text, drafts, and profile facts stay in your workflow instead of scattered tools.",
                "Privacy, deletion, and billing disclosures are available publicly before sign-in.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/[0.42] p-5 text-sm leading-7 text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="container relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-10">
          <p className="eyebrow">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
            Flexible on the web, Play-ready on Android.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <GlassCard
                accent={tier.accent}
                interactive
                className={tier.popular ? "price-glow h-full p-[1px]" : "h-full p-0"}
              >
                <div className="h-full rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(10,18,34,0.92),rgba(7,12,24,0.98))] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">{tier.name}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{tier.description}</p>
                    </div>
                    {tier.popular ? (
                      <div className="rounded-full border border-cyan-300/[0.24] bg-cyan-300/[0.12] px-3 py-1 text-xs text-cyan-100">
                        Most popular
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-8 flex items-end justify-between gap-4">
                    <div>
                      <div className="text-sm uppercase tracking-[0.22em] text-slate-400">Credits</div>
                      <div className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-white">
                        <AnimatedCounter value={tier.credits} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm uppercase tracking-[0.22em] text-slate-400">From</div>
                      <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                        <AnimatedCounter value={tier.price} decimals={2} prefix="$" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-300">
                    Buy via Stripe on the web today. Android release paths are reserved for Google Play Billing.
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-24">
        <div className="cta-shell overflow-hidden rounded-[2rem] p-8 sm:p-10 lg:p-14">
          <div className="cta-shimmer" />
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow text-cyan-100/80">Ready when you are</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                Make the next application your best one yet.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-200/[0.82]">
                Join the closed beta and turn a scattered job search into a focused, premium workflow.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <GradientButton href={accountHref}>
                {signedIn ? "Open dashboard" : "Join the beta"}
                <ArrowIcon />
              </GradientButton>
              <GradientButton href="/privacy" variant="secondary">
                Review privacy policy
              </GradientButton>
            </div>
          </div>
        </div>
      </section>

      <footer className="container relative z-10 mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/[0.08] px-4 py-8 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>© 2026 CVScan. Designed for a premium AU/NZ closed beta launch.</div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/privacy" className="transition-colors hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-white">
            Terms
          </Link>
          <Link href="/delete-account" className="transition-colors hover:text-white">
            Delete account
          </Link>
          <a href="mailto:support@cvscan.com.au" className="transition-colors hover:text-white">
            support@cvscan.com.au
          </a>
        </div>
      </footer>
    </main>
  );
}
