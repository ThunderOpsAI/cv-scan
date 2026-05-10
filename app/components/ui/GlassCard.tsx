import type { ReactNode } from "react";

type GlassCardAccent = "blue" | "cyan" | "emerald" | "amber" | "pink" | "violet";

type GlassCardProps = {
  accent?: GlassCardAccent;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
};

const ACCENT_STYLES: Record<GlassCardAccent, string> = {
  amber: "before:from-[#26A69A]/[0.18] before:to-[#1A237E]/[0.06] hover:border-[#26A69A]/[0.25]",
  blue: "before:from-[#1A237E]/[0.18] before:to-[#26A69A]/[0.06] hover:border-[#1A237E]/[0.25]",
  cyan: "before:from-[#26A69A]/[0.20] before:to-[#1A237E]/[0.06] hover:border-[#26A69A]/[0.25]",
  emerald: "before:from-[#26A69A]/[0.18] before:to-[#26A69A]/[0.08] hover:border-[#26A69A]/[0.25]",
  pink: "before:from-[#26A69A]/[0.14] before:to-[#1A237E]/[0.06] hover:border-[#26A69A]/[0.20]",
  violet: "before:from-[#1A237E]/[0.20] before:to-[#26A69A]/[0.06] hover:border-[#1A237E]/[0.25]",
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
        "glass-card relative overflow-hidden rounded-[1.75rem] border border-black/[0.06]",
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r",
        ACCENT_STYLES[accent],
        interactive
          ? "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(26,35,126,0.08)]"
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

