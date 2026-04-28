"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from "react";

/* ──────────────────────────────────────────────────────────────── *
 *  Toast types                                                    *
 * ──────────────────────────────────────────────────────────────── */

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  body?: string;
  durationMs: number;
}

interface ToastContextValue {
  showToast: (options: Omit<Toast, "id" | "durationMs"> & { durationMs?: number }) => void;
}

/* ──────────────────────────────────────────────────────────────── *
 *  Variant palette                                                *
 * ──────────────────────────────────────────────────────────────── */

const variantStyles: Record<ToastVariant, { border: string; bg: string; text: string; bar: string; icon: string }> = {
  success: {
    border: "border-emerald-300/[0.26]",
    bg: "bg-emerald-300/10",
    text: "text-emerald-50",
    bar: "bg-emerald-400",
    icon: "✓",
  },
  error: {
    border: "border-rose-300/[0.26]",
    bg: "bg-rose-300/10",
    text: "text-rose-50",
    bar: "bg-rose-400",
    icon: "✕",
  },
  info: {
    border: "border-cyan-300/[0.26]",
    bg: "bg-cyan-300/10",
    text: "text-cyan-50",
    bar: "bg-cyan-400",
    icon: "i",
  },
  warning: {
    border: "border-amber-300/[0.26]",
    bg: "bg-amber-300/10",
    text: "text-amber-50",
    bar: "bg-amber-400",
    icon: "!",
  },
};

/* ──────────────────────────────────────────────────────────────── *
 *  Single toast component                                         *
 * ──────────────────────────────────────────────────────────────── */

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const s = variantStyles[toast.variant];

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.durationMs);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.durationMs, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative overflow-hidden rounded-2xl border ${s.border} ${s.bg} ${s.text} p-4 shadow-2xl backdrop-blur-xl`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-xs font-bold">
          {s.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">{toast.title}</p>
          {toast.body && <p className="mt-1 text-xs leading-relaxed opacity-80">{toast.body}</p>}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="ml-2 shrink-0 text-current/60 transition hover:text-white"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: toast.durationMs / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-[3px] w-full origin-left ${s.bar}`}
      />
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────── *
 *  Context + Provider                                             *
 * ──────────────────────────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: Omit<Toast, "id" | "durationMs"> & { durationMs?: number }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-4), { ...options, id, durationMs: options.durationMs ?? 5000 }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast render layer */}
      <div className="fixed right-4 top-4 z-[100] flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col gap-3 sm:right-6">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
