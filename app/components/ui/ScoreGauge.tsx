"use client";

import { motion } from "framer-motion";

type ScoreGaugeProps = {
  score: number;
  size?: number;
};

function getScoreTone(score: number) {
  if (score >= 80) {
    return {
      ring: "stroke-emerald-400",
      text: "text-emerald-300",
      glow: "drop-shadow-[0_0_18px_rgba(52,211,153,0.45)]",
      label: "Strong match",
    };
  }

  if (score >= 60) {
    return {
      ring: "stroke-amber-400",
      text: "text-amber-300",
      glow: "drop-shadow-[0_0_18px_rgba(251,191,36,0.4)]",
      label: "Promising fit",
    };
  }

  return {
    ring: "stroke-rose-400",
    text: "text-rose-300",
    glow: "drop-shadow-[0_0_18px_rgba(251,113,133,0.42)]",
    label: "Needs work",
  };
}

export function ScoreGauge({ score, size = 176 }: ScoreGaugeProps) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(100, score));
  const dash = (normalized / 100) * circumference;
  const tone = getScoreTone(normalized);

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="h-full w-full -rotate-90" viewBox="0 0 176 176">
          <circle
            cx="88"
            cy="88"
            r={radius}
            className="stroke-white/10"
            strokeWidth="12"
            fill="none"
          />
          <motion.circle
            cx="88"
            cy="88"
            r={radius}
            className={`${tone.ring} ${tone.glow}`}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${dash} ${circumference}` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-5xl font-semibold tracking-[-0.06em] ${tone.text}`}
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.25 }}
          >
            {normalized}
          </motion.span>
          <motion.span
            className="mt-2 text-[0.7rem] uppercase tracking-[0.22em] text-slate-400"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.42 }}
          >
            Match score
          </motion.span>
        </div>
      </div>
      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
        {tone.label}
      </span>
    </div>
  );
}
