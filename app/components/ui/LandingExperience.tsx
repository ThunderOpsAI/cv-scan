"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { APP_NAME } from "@/lib/branding";
import { CREDIT_PACKAGES } from "@/lib/pricing";

type LandingExperienceProps = {
  accountHref: string;
  signedIn: boolean;
};

const processSteps = [
  {
    accent: "cyan" as const,
    description: "Paste or capture a role description and turn it into something the scanner can act on immediately.",
    eyebrow: "Step 01",
    title: "Bring in the job ad",
  },
  {
    accent: "blue" as const,
    description: "See keyword gaps, section-level ATS scoring, and what evidence is still missing from your profile.",
    eyebrow: "Step 02",
    title: "Find the weak spots",
  },
  {
    accent: "violet" as const,
    description: "Tailor faster, generate sharper writing, and practice interview answers without losing context.",
    eyebrow: "Step 03",
    title: "Ship stronger applications",
  },
];

export function LandingExperience({ accountHref, signedIn }: LandingExperienceProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
      <nav className="container relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.14] bg-white/[0.06] shadow-[0_18px_44px_rgba(2,8,23,0.32)]">
            <span className="bg-[linear-gradient(135deg,#7dd3fc,#c4b5fd)] bg-clip-text text-lg font-semibold text-transparent">
              AI
            </span>
          </div>
          <div>
            <div className="text-lg font-semibold tracking-[-0.03em]">{APP_NAME}</div>
            <div className="text-xs text-slate-400">magic-link access only</div>
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
            {signedIn ? "Open dashboard" : "Sign in"}
          </GradientButton>
        </div>
      </nav>

      <section className="container relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.07] px-4 py-2 text-sm text-cyan-100"
            >
              Production-ready AI resume review
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl"
            >
              Make every application sharper before it reaches a recruiter.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="mt-6 max-w-2xl text-base leading-8 text-slate-300"
            >
              {APP_NAME} helps you scan roles, tighten resume evidence, and practice interviews with less friction and
              clearer next steps.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <GradientButton href={accountHref}>
                {signedIn ? "Continue in dashboard" : "Start with magic link"}
              </GradientButton>
              <GradientButton href="#before-after" variant="secondary">
                See the transformation
              </GradientButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32 }}
              className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-400"
            >
              <span>Magic-link email sign-in</span>
              <span>No credit card required to start</span>
              <span>Designed for fast role-by-role tailoring</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 26 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            <GlassCard accent="cyan" className="p-6 sm:p-8">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/70">Before & After</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Clearer evidence, stronger story
                </h2>
              </div>

              <div id="before-after" className="space-y-4">
                <div className="rounded-2xl border border-rose-300/[0.16] bg-rose-300/[0.08] p-4">
                  <p className="text-sm font-medium text-rose-100">Before</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Responsible for customer support and issue handling. Helped with reporting and team coordination.
                  </p>
                </div>
                <div className="rounded-2xl border border-cyan-300/[0.16] bg-cyan-300/[0.08] p-4">
                  <p className="text-sm font-medium text-cyan-100">After with {APP_NAME}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-100">
                    Resolved 40+ weekly customer escalations, cut response time by 38%, and built reporting workflows
                    that gave leadership same-day visibility into SLA risk.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <section className="container relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
            A calmer workflow for a noisy process.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
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

      <section className="container relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <GlassCard accent="violet" className="p-8 sm:p-10">
          <div>
            <p className="eyebrow">Trust</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Built for people who want help without giving up control.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                "Magic-link authentication keeps sign-in simple and secure.",
                "Resume content and application edits stay under your control.",
                "AI output is guidance to review, not blind automation to ship untouched.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/[0.42] p-5 text-sm leading-7 text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="container relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="eyebrow">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
            Static pricing, clear value
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {CREDIT_PACKAGES.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <GlassCard accent={tier.popular ? "cyan" : "blue"} interactive className="h-full p-0">
                <div className="h-full rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(10,18,34,0.92),rgba(7,12,24,0.98))] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">{tier.name}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{tier.description}</p>
                    </div>
                    {tier.popular ? (
                      <div className="rounded-full border border-cyan-300/[0.24] bg-cyan-300/[0.12] px-3 py-1 text-xs text-cyan-100">
                        Popular
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-8 flex items-end justify-between gap-4">
                    <div>
                      <div className="text-sm uppercase tracking-[0.22em] text-slate-400">Credits</div>
                      <div className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-white">{tier.credits}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm uppercase tracking-[0.22em] text-slate-400">Price</div>
                      <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                        ${tier.price.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {tier.offerLabel ? (
                    <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-medium text-amber-100">
                      {tier.offerLabel}
                    </div>
                  ) : null}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(24,48,88,0.92),rgba(7,12,24,0.98))] p-8 sm:p-10 lg:p-14">
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow text-cyan-100/80">Ready when you are</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                Move faster on your next application.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-200/[0.82]">
                Start free, keep the parts that help, and buy credits only when the workflow earns it.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <GradientButton href={accountHref}>
                {signedIn ? "Open dashboard" : "Get started"}
              </GradientButton>
              <GradientButton href="/privacy" variant="secondary">
                Review privacy policy
              </GradientButton>
            </div>
          </div>
        </div>
      </section>

      <footer className="container relative z-10 mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/[0.08] px-4 py-8 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>© 2026 {APP_NAME}. All rights reserved.</div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/privacy" className="transition-colors hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-white">
            Terms
          </Link>
          <Link href="/testimonials" className="transition-colors hover:text-white">
            Testimonials
          </Link>
        </div>
      </footer>
    </main>
  );
}
