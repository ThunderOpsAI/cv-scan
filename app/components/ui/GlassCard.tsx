import type { ReactNode } from "react";

type GlassCardAccent = "blue" | "cyan" | "emerald" | "amber" | "pink" | "violet";

type GlassCardProps = {
  accent?: GlassCardAccent;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
};

const ACCENT_STYLES: Record<GlassCardAccent, string> = {
  amber: "before:from-amber-400/[0.28] before:to-orange-300/[0.08] hover:border-amber-300/[0.35]",
  blue: "before:from-sky-400/[0.24] before:to-indigo-300/[0.08] hover:border-sky-300/[0.35]",
  cyan: "before:from-cyan-300/[0.26] before:to-sky-300/10 hover:border-cyan-200/[0.35]",
  emerald: "before:from-emerald-300/[0.24] before:to-teal-300/10 hover:border-emerald-200/[0.35]",
  pink: "before:from-pink-300/[0.26] before:to-rose-300/10 hover:border-pink-200/[0.35]",
  violet: "before:from-violet-300/[0.26] before:to-fuchsia-300/10 hover:border-violet-200/[0.35]",
};

export function GlassCard({
  accent = "blue",
  children,
  className = "",
  interactive = false,
}: GlassCardProps) {
  return (
    <div
      className={[
        "glass-card relative overflow-hidden rounded-[1.75rem] border border-white/10",
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r",
        ACCENT_STYLES[accent],
        interactive
          ? "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.35)]"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
