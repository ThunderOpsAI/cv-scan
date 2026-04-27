"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

type BaseProps = {
  children: ReactNode;
  className?: string;
  size?: Size;
  variant?: Variant;
};

type LinkButtonProps = BaseProps & {
  href: string;
};

type NativeButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: never;
  };

function getButtonClasses(variant: Variant, size: Size, className: string) {
  const sizeClasses =
    size === "lg" ? "min-h-[3.5rem] px-6 py-3.5 text-base" : "min-h-[3rem] px-4 py-2.5 text-sm";

  const variantClasses =
    variant === "primary"
      ? "bg-[linear-gradient(135deg,rgba(56,189,248,0.96),rgba(59,130,246,0.92),rgba(129,140,248,0.88))] text-slate-950 shadow-[0_20px_48px_rgba(56,189,248,0.24)] hover:shadow-[0_24px_54px_rgba(56,189,248,0.34)]"
      : variant === "secondary"
        ? "bg-white/[0.08] text-white ring-1 ring-white/[0.14] hover:bg-white/[0.12]"
        : "bg-transparent text-slate-200 hover:bg-white/[0.06]";

  return [
    "group inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em]",
    "transition-all duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60",
    sizeClasses,
    variantClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function GradientButton(props: LinkButtonProps | NativeButtonProps) {
  const {
    children,
    className = "",
    size = "lg",
    variant = "primary",
  } = props;
  const classes = getButtonClasses(variant, size, className);

  if ("href" in props) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button {...props} className={classes}>
      {children}
    </button>
  );
}
