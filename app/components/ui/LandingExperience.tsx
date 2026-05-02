"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { APP_NAME } from "@/lib/branding";
import Image from "next/image";

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
  const [showAfter, setShowAfter] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
      <nav className="container relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white group">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/[0.14] shadow-[0_18px_44px_rgba(2,8,23,0.32)] transition-transform duration-300 group-hover:scale-105">
            <Image src="/logo.png" alt="CVScan Logo" fill className="object-cover" />
          </div>
          <div>
            <div className="text-base font-semibold tracking-[-0.03em]">{APP_NAME}</div>
            <div className="text-[10px] text-slate-400">magic-link access only</div>
          </div>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/pricing" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">
            Pricing
          </Link>
          <GradientButton href={accountHref} size="md" variant="secondary" className="!min-h-[2.5rem] !py-1.5">
            {signedIn ? "Dashboard" : "Sign in"}
          </GradientButton>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container relative z-10 mx-auto max-w-5xl px-4 pb-6 pt-6 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.07] px-3 py-1.5 text-xs text-cyan-100"
        >
          Production-ready AI resume review
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mx-auto max-w-3xl text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl"
        >
          Make every application sharper before it reaches a recruiter.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base"
        >
          {APP_NAME} helps you scan roles, tighten resume evidence, and practice interviews with less friction and clearer next steps.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <GradientButton href={accountHref} size="md">
            {signedIn ? "Continue in dashboard" : "Start with magic link"}
          </GradientButton>
        </motion.div>
      </section>

      {/* Interactive Before & After */}
      <section className="container relative z-10 mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
        >
          <GlassCard accent="cyan" className="p-5 sm:p-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6 mb-4">
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-cyan-100/70 text-center sm:text-left">Before & After</p>
                <h2 className="mt-1 text-base sm:text-lg font-semibold tracking-[-0.03em] text-white text-center sm:text-left">
                  Clearer evidence, stronger story
                </h2>
              </div>
              <div className="flex rounded-full bg-white/5 p-1 backdrop-blur w-full sm:w-auto">
                <button
                  onClick={() => setShowAfter(false)}
                  className={`flex-1 sm:flex-none rounded-full px-4 py-1.5 text-xs font-medium transition ${!showAfter ? "bg-white/10 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Before
                </button>
                <button
                  onClick={() => setShowAfter(true)}
                  className={`flex-1 sm:flex-none rounded-full px-4 py-1.5 text-xs font-medium transition ${showAfter ? "bg-cyan-500/20 text-cyan-100 shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  After
                </button>
              </div>
            </div>

            <div className="relative min-h-[110px] sm:min-h-[90px] overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 p-4 transition-colors">
              <AnimatePresence mode="wait">
                {!showAfter ? (
                  <motion.p
                    key="before"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-[13px] sm:text-sm leading-relaxed text-slate-300"
                  >
                    "Responsible for customer support and issue handling. Helped with reporting and team coordination."
                  </motion.p>
                ) : (
                  <motion.p
                    key="after"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-[13px] sm:text-sm leading-relaxed text-cyan-50"
                  >
                    "Resolved 40+ weekly customer escalations, cut response time by 38%, and built reporting workflows that gave leadership same-day visibility into SLA risk."
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* How it works (Compact) */}
      <section className="container relative z-10 mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.04em] text-white">
            A calmer workflow for a noisy process
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <GlassCard accent={step.accent} interactive className="h-full p-4 sm:p-5">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.08] text-xs font-semibold text-white">
                  0{index + 1}
                </div>
                <h3 className="text-[15px] sm:text-base font-semibold tracking-[-0.03em] text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{step.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Small CTA Strip */}
      <section className="container relative z-10 mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(24,48,88,0.6),rgba(7,12,24,0.8))] p-5 sm:flex-row sm:p-6 lg:px-8">
          <div className="text-center sm:text-left">
            <h2 className="text-base sm:text-lg font-semibold tracking-[-0.03em] text-white">
              Move faster on your next application
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Start free, buy credits only when needed.
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
            <GradientButton href={accountHref} size="md" className="!min-h-[2.5rem] !py-1.5 !text-sm w-full sm:w-auto">
              {signedIn ? "Dashboard" : "Get started"}
            </GradientButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container relative z-10 mx-auto flex max-w-5xl flex-col gap-4 border-t border-white/[0.08] px-4 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>© 2026 {APP_NAME}. All rights reserved.</div>
        <div className="flex items-center gap-4 justify-center sm:justify-start">
          <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
          <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
          <Link href="/testimonials" className="transition-colors hover:text-white">Testimonials</Link>
        </div>
      </footer>
    </main>
  );
}
