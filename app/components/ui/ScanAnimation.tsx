"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

type ScanAnimationProps = {
  fileName?: string | null;
  isUploading?: boolean;
  stageIndex?: number;
  stages?: string[];
  visibleKeywords?: string[];
};

const fallbackStages = ["Reading document...", "Extracting skills...", "Building profile..."];

export function ScanAnimation({
  fileName,
  isUploading = false,
  stageIndex = 0,
  stages = fallbackStages,
  visibleKeywords = [],
}: ScanAnimationProps) {
  const activeStage = stages[Math.min(stageIndex, stages.length - 1)] ?? stages[0];

  return (
    <GlassCard accent="cyan" className="relative overflow-hidden p-6 sm:p-8">
      <div className="magic-scan-particles" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, index) => (
          <span
            key={index}
            className="magic-scan-particle"
            style={
              {
                left: `${10 + index * 8}%`,
                top: `${8 + (index % 5) * 16}%`,
                ["--scan-delay" as string]: `${index * 0.4}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <div>
            <p className="eyebrow">{isUploading ? "Preparing input" : "Magic scan"}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
              {isUploading ? "Reading your screenshot" : "Turning a job ad into guidance"}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
              {fileName
                ? `${fileName} is in the scanner. We are extracting the signals that matter most for this role.`
                : "Your scan is mapping keywords, profile strengths, and missing evidence in one pass."}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
            <div className="magic-document-shell">
              <div className="magic-document">
                <div className="magic-scan-line" />
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-2.5 rounded-full bg-white/10"
                      style={{ width: `${index % 3 === 0 ? 78 : index % 2 === 0 ? 92 : 64}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {stages.map((stage, index) => {
              const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "idle";
              return (
                <div key={stage} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                      state === "done"
                        ? "bg-emerald-300/20 text-emerald-200"
                        : state === "active"
                          ? "bg-cyan-300/20 text-cyan-100"
                          : "bg-white/[0.06] text-slate-400",
                    ].join(" ")}
                  >
                    {state === "done" ? "✓" : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{stage}</p>
                    {state === "active" ? <p className="text-xs text-slate-400">{activeStage}</p> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Signals detected</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Keywords floating out</h3>
            </div>
            <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
              Live scan
            </div>
          </div>

          <div className="mt-6 flex min-h-[16rem] flex-wrap content-start gap-3">
            {visibleKeywords.length > 0 ? (
              visibleKeywords.map((keyword, index) => (
                <motion.span
                  key={`${keyword}-${index}`}
                  initial={{ opacity: 0, y: 20, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.34, delay: index * 0.06 }}
                  className="inline-flex items-center rounded-full border border-cyan-300/16 bg-cyan-300/10 px-3 py-1.5 text-sm text-cyan-50"
                >
                  {keyword}
                </motion.span>
              ))
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.02] text-sm text-slate-400">
                Extracted skills and themes will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
