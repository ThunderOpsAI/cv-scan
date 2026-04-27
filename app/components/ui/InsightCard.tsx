"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

type InsightCardProps = {
  accent?: "amber" | "blue" | "cyan" | "emerald" | "pink" | "violet";
  body: string;
  ctaLabel: string;
  href: string;
  onDismiss: () => void;
  title: string;
};

export function InsightCard({
  accent = "cyan",
  body,
  ctaLabel,
  href,
  onDismiss,
  title,
}: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42 }}
    >
      <GlassCard accent={accent} interactive className="h-full p-5">
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Next best move</p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-400 transition hover:text-white"
            >
              Dismiss
            </button>
          </div>

          <p className="text-sm leading-7 text-slate-300">{body}</p>

          <div className="mt-auto">
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.1]"
            >
              {ctaLabel}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
