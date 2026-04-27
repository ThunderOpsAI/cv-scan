"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  value: number;
};

export function AnimatedCounter({
  className = "",
  decimals = 0,
  prefix = "",
  suffix = "",
  value,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { amount: 0.6, once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue.toLocaleString(undefined, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
