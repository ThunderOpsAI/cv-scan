"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  BarChart3,
  Target,
  Globe,
  Check,
  X,
  RotateCcw,
  Copy,
  CheckCheck,
  Loader2,
  Pencil,
} from "lucide-react";
import type { InlineRewriteAction } from "@/app/api/scribe/rewrite/route";

export interface ScribeItem {
  id: string;
  text: string;
  originalFact?: string;
  evidenceTag?: string;
  isHeading?: boolean;
}

interface ScribeInlineEditorProps {
  mode: "bullets" | "paragraphs" | "document";
  items: ScribeItem[];
  onUpdateItem: (id: string, newText: string) => void;
  jobContext?: string;
  keywords?: string[];
  title?: string;
  subtitle?: string;
  onCopyAll?: () => void;
  copyAllLabel?: string;
}

interface PendingDiff {
  itemId: string;
  originalText: string;
  rewrittenText: string;
  action: InlineRewriteAction;
  localeTarget?: "AU_UK" | "US";
}

export function ScribeInlineEditor({
  mode,
  items,
  onUpdateItem,
  jobContext = "",
  keywords = [],
  title,
  subtitle,
  onCopyAll,
  copyAllLabel = "Copy All",
}: ScribeInlineEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<{
    itemId: string;
    action: InlineRewriteAction;
  } | null>(null);
  const [pendingDiff, setPendingDiff] = useState<PendingDiff | null>(null);
  const [localeState, setLocaleState] = useState<Record<string, "AU_UK" | "US">>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [manualEditId, setManualEditId] = useState<string | null>(null);
  const [manualDraft, setManualDraft] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runRewrite = async (item: ScribeItem, action: InlineRewriteAction) => {
    setErrorMsg(null);
    setLoadingAction({ itemId: item.id, action });

    try {
      const res = await fetch("/api/scribe/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: item.text,
          action,
          jobContext,
          keywords,
          mode: mode === "paragraphs" ? "paragraph" : "bullet",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Rewrite failed");
      }

      const nextLocale =
        action === "localize_au_uk"
          ? "AU_UK"
          : action === "localize_us"
          ? "US"
          : undefined;

      if (nextLocale) {
        setLocaleState((prev) => ({ ...prev, [item.id]: nextLocale }));
      }

      setPendingDiff({
        itemId: item.id,
        originalText: item.text,
        rewrittenText: data.rewritten,
        action,
        localeTarget: nextLocale,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Could not rewrite selection");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLocaleToggle = (item: ScribeItem) => {
    const current = localeState[item.id] || "US";
    const nextAction: InlineRewriteAction =
      current === "US" ? "localize_au_uk" : "localize_us";
    void runRewrite(item, nextAction);
  };

  const handleAcceptDiff = () => {
    if (!pendingDiff) return;
    onUpdateItem(pendingDiff.itemId, pendingDiff.rewrittenText);
    setPendingDiff(null);
  };

  const handleRejectDiff = () => {
    setPendingDiff(null);
  };

  const handleRetryDiff = () => {
    if (!pendingDiff) return;
    const item = items.find((i) => i.id === pendingDiff.itemId);
    if (!item) return;
    void runRewrite(item, pendingDiff.action);
  };

  const handleCopySingle = (item: ScribeItem) => {
    void navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyAllInternal = () => {
    if (onCopyAll) {
      onCopyAll();
    } else {
      const joined = items
        .map((i) => (mode === "bullets" && !i.isHeading ? `• ${i.text}` : i.text))
        .join(mode === "paragraphs" ? "\n\n" : "\n");
      void navigator.clipboard.writeText(joined);
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const actionLabel = (action: InlineRewriteAction) => {
    switch (action) {
      case "tighten":
        return "Tighten & Punchier";
      case "metrics":
        return "Add Quantifiable Metrics";
      case "keywords":
        return "Match Job Keywords Harder";
      case "localize_au_uk":
        return "AU/UK CV Localization";
      case "localize_us":
        return "US Resume Localization";
    }
  };

  return (
    <div className="space-y-4" data-testid="scribe-inline-editor">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#26A69A]/25 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#26A69A]/15 text-[#168579]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#1A237E]">
                {title || "Scribe Inline Co-Writer"}
              </span>
              <span className="rounded-full border border-[#26A69A]/30 bg-[#E0F2F1] px-2 py-0.5 text-[11px] font-medium text-[#168579]">
                Interactive Diff Mode
              </span>
            </div>
            <p className="text-xs text-[#607086]">
              {subtitle ||
                "Click any bullet or paragraph below to open the floating AI micro-toolbar and preview inline diffs."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyAllInternal}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#1A237E]/15 bg-[#1A237E] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#26A69A]"
          data-testid="scribe-copy-all-btn"
        >
          {copiedAll ? (
            <>
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Copied Synced Version!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>{copyAllLabel}</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
          {errorMsg}
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item) => {
          if (item.isHeading) {
            return (
              <div
                key={item.id}
                className="pt-2 text-xs font-bold uppercase tracking-wider text-[#1A237E]/80"
              >
                {item.text}
              </div>
            );
          }

          const isSelected = selectedId === item.id;
          const activeDiff = pendingDiff?.itemId === item.id ? pendingDiff : null;
          const isItemLoading = loadingAction?.itemId === item.id;
          const currentLocale = localeState[item.id] || "US";
          const isManualEditing = manualEditId === item.id;

          return (
            <div
              key={item.id}
              className={`group relative rounded-2xl border transition-all duration-200 ${
                isSelected || activeDiff
                  ? "border-[#26A69A] bg-white shadow-[0_12px_32px_rgba(26,35,126,0.08)]"
                  : "border-black/[0.08] bg-white/70 hover:border-[#26A69A]/40 hover:bg-white/95"
              }`}
              data-testid={`scribe-item-${item.id}`}
            >
              {/* Floating Micro-Toolbar when selected */}
              <AnimatePresence>
                {isSelected && !activeDiff && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-wrap items-center gap-1.5 border-b border-black/[0.06] bg-[#F7FAFA] px-3 py-2 rounded-t-2xl"
                    data-testid="scribe-floating-toolbar"
                  >
                    <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#26A69A]">
                      <Sparkles className="h-3 w-3" /> Scribe AI:
                    </span>

                    <button
                      type="button"
                      disabled={isItemLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        void runRewrite(item, "tighten");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-black/[0.08] bg-white px-2.5 py-1 text-xs font-medium text-[#1A237E] shadow-sm transition hover:border-[#26A69A] hover:bg-[#E0F2F1]/50 disabled:opacity-50"
                      data-testid="scribe-action-tighten"
                    >
                      {isItemLoading && loadingAction?.action === "tighten" ? (
                        <Loader2 className="h-3 w-3 animate-spin text-[#26A69A]" />
                      ) : (
                        <Zap className="h-3 w-3 text-amber-500" />
                      )}
                      <span>Tighten &amp; Punchier</span>
                    </button>

                    <button
                      type="button"
                      disabled={isItemLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        void runRewrite(item, "metrics");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-black/[0.08] bg-white px-2.5 py-1 text-xs font-medium text-[#1A237E] shadow-sm transition hover:border-[#26A69A] hover:bg-[#E0F2F1]/50 disabled:opacity-50"
                      data-testid="scribe-action-metrics"
                    >
                      {isItemLoading && loadingAction?.action === "metrics" ? (
                        <Loader2 className="h-3 w-3 animate-spin text-[#26A69A]" />
                      ) : (
                        <BarChart3 className="h-3 w-3 text-emerald-600" />
                      )}
                      <span>Add Quantifiable Metrics</span>
                    </button>

                    <button
                      type="button"
                      disabled={isItemLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        void runRewrite(item, "keywords");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-black/[0.08] bg-white px-2.5 py-1 text-xs font-medium text-[#1A237E] shadow-sm transition hover:border-[#26A69A] hover:bg-[#E0F2F1]/50 disabled:opacity-50"
                      data-testid="scribe-action-keywords"
                    >
                      {isItemLoading && loadingAction?.action === "keywords" ? (
                        <Loader2 className="h-3 w-3 animate-spin text-[#26A69A]" />
                      ) : (
                        <Target className="h-3 w-3 text-indigo-600" />
                      )}
                      <span>Match Job Keywords Harder</span>
                    </button>

                    <button
                      type="button"
                      disabled={isItemLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLocaleToggle(item);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#26A69A]/30 bg-[#E0F2F1]/60 px-2.5 py-1 text-xs font-medium text-[#1A237E] shadow-sm transition hover:bg-[#E0F2F1] disabled:opacity-50"
                      title="Toggle between Australian/UK CV conventions and US Resume spelling"
                      data-testid="scribe-action-localize"
                    >
                      {isItemLoading &&
                      (loadingAction?.action === "localize_au_uk" ||
                        loadingAction?.action === "localize_us") ? (
                        <Loader2 className="h-3 w-3 animate-spin text-[#26A69A]" />
                      ) : (
                        <Globe className="h-3 w-3 text-[#168579]" />
                      )}
                      <span>
                        AU/UK ↔ US ({currentLocale === "US" ? "Switch to AU/UK" : "Switch to US"})
                      </span>
                    </button>

                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setManualEditId(item.id);
                          setManualDraft(item.text);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[#607086] hover:bg-black/[0.05] hover:text-[#1A237E]"
                        title="Edit manually"
                      >
                        <Pencil className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopySingle(item);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[#607086] hover:bg-black/[0.05] hover:text-[#1A237E]"
                        title="Copy line"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Content or Inline Diff View */}
              <div
                onClick={() => {
                  if (!activeDiff && !isManualEditing) {
                    setSelectedId((prev) => (prev === item.id ? null : item.id));
                  }
                }}
                className="cursor-pointer p-4"
              >
                {activeDiff ? (
                  <div className="space-y-3" data-testid="scribe-inline-diff">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#26A69A]/15 px-2.5 py-0.5 text-xs font-semibold text-[#168579]">
                        <Sparkles className="h-3 w-3" />
                        Inline Diff Preview · {actionLabel(activeDiff.action)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptDiff();
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                          data-testid="scribe-diff-accept"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Accept (✓)</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectDiff();
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
                          data-testid="scribe-diff-reject"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject (✕)</span>
                        </button>
                        <button
                          type="button"
                          disabled={isItemLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetryDiff();
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-black/[0.12] bg-white px-2.5 py-1 text-xs font-medium text-[#1A237E] transition hover:bg-slate-50 disabled:opacity-50"
                          data-testid="scribe-diff-retry"
                        >
                          {isItemLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                          )}
                          <span>Retry</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-2.5 rounded-xl border border-black/[0.06] bg-[#F8FCFC] p-3 text-sm leading-relaxed">
                      <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 px-3 py-2 text-rose-900/75">
                        <span className="mt-0.5 select-none text-xs font-bold uppercase tracking-wider text-rose-600">
                          Old
                        </span>
                        <p className="line-through decoration-rose-500/60">
                          {activeDiff.originalText}
                        </p>
                      </div>
                      <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-emerald-950 font-medium">
                        <span className="mt-0.5 select-none text-xs font-bold uppercase tracking-wider text-emerald-700">
                          New
                        </span>
                        <p>{activeDiff.rewrittenText}</p>
                      </div>
                    </div>
                  </div>
                ) : isManualEditing ? (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <textarea
                      value={manualDraft}
                      onChange={(e) => setManualDraft(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-[#26A69A] bg-white p-3 text-sm text-[#1A237E] focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setManualEditId(null)}
                        className="rounded-lg border border-black/10 px-3 py-1 text-xs text-[#607086]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (manualDraft.trim()) {
                            onUpdateItem(item.id, manualDraft.trim());
                          }
                          setManualEditId(null);
                        }}
                        className="rounded-lg bg-[#26A69A] px-3 py-1 text-xs font-semibold text-white"
                      >
                        Save Edit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    {mode === "bullets" && (
                      <span className="mt-0.5 select-none font-bold text-[#26A69A]">•</span>
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-relaxed text-[#1A237E] whitespace-pre-wrap">
                        {item.text}
                      </p>
                      {(item.originalFact || item.evidenceTag) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {item.evidenceTag && (
                            <span className="rounded-md bg-[#1A237E]/10 px-2 py-0.5 text-[11px] font-medium text-[#1A237E]">
                              {item.evidenceTag}
                            </span>
                          )}
                          {item.originalFact && (
                            <span className="text-xs text-[#607086]">
                              Source fact: {item.originalFact}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="rounded-lg border border-transparent px-2 py-1 text-[11px] font-medium text-[#607086] opacity-0 transition group-hover:border-black/[0.08] group-hover:bg-[#F7FAFA] group-hover:opacity-100">
                      {isSelected ? "Selected" : "Click to refine with AI ✨"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
