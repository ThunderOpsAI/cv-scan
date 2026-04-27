"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";

type BeforeAfterProps = {
  afterLabel: string;
  afterText: string | string[];
  beforeLabel: string;
  beforeText: string | string[];
  changedTerms?: string[];
};

function toSegments(value: string | string[]) {
  return Array.isArray(value) ? value : value.split(/\n+/).filter(Boolean);
}

function highlightTerms(text: string, terms: string[]) {
  if (!terms.length) {
    return [{ text, highlighted: false }];
  }

  const escaped = terms
    .map((term) => term.trim())
    .filter(Boolean)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (!escaped.length) {
    return [{ text, highlighted: false }];
  }

  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  return text.split(regex).filter(Boolean).map((part) => ({
    text: part,
    highlighted: terms.some((term) => term.trim() && part.toLowerCase() === term.trim().toLowerCase()),
  }));
}

function ComparisonColumn({
  accent,
  label,
  lines,
  terms,
}: {
  accent: "blue" | "emerald";
  label: string;
  lines: string[];
  terms: string[];
}) {
  return (
    <GlassCard accent={accent} className="h-full p-5 sm:p-6">
      <p className="eyebrow">{label}</p>
      <div className="mt-4 space-y-3">
        {lines.map((line, index) => (
          <div key={`${label}-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-slate-200">
            {highlightTerms(line, terms).map((segment, segmentIndex) => (
              <span
                key={`${label}-${index}-${segmentIndex}`}
                className={
                  segment.highlighted
                    ? "rounded-md bg-emerald-300/18 px-1 py-0.5 text-emerald-200 underline decoration-emerald-300/60 underline-offset-4"
                    : ""
                }
              >
                {segment.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function BeforeAfter({
  afterLabel,
  afterText,
  beforeLabel,
  beforeText,
  changedTerms = [],
}: BeforeAfterProps) {
  const beforeLines = toSegments(beforeText);
  const afterLines = toSegments(afterText);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Tailor preview</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Before and after</h3>
        </div>
        {changedTerms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {changedTerms.slice(0, 6).map((term) => (
              <span
                key={term}
                className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100"
              >
                {term}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ComparisonColumn accent="blue" label={beforeLabel} lines={beforeLines} terms={[]} />
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          <ComparisonColumn accent="emerald" label={afterLabel} lines={afterLines} terms={changedTerms} />
        </motion.div>
      </div>
    </motion.div>
  );
}
