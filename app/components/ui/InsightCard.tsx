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
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#1A237E]">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full border border-black/[0.06] bg-white/40 px-2.5 py-1 text-xs text-[#757575] transition hover:text-[#1A237E]"
            >
              Dismiss
            </button>
          </div>

          <p className="text-sm leading-7 text-[#757575]">{body}</p>

          <div className="mt-auto">
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/40 px-4 py-2 text-sm font-medium text-[#1A237E] transition hover:bg-white/60"
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
