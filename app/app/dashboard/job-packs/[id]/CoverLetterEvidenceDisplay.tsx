"use client";

import { useMemo } from "react";
import { extractCoverLetterEvidence, stripFactTagsForExport } from "@/lib/generation/cover-letter-evidence";
import { ScribeInlineEditor } from "@/components/ui/ScribeInlineEditor";

export function CoverLetterEvidenceDisplay({
  coverLetter,
  jobContext,
  keywords = [],
  onUpdateCoverLetter,
}: {
  coverLetter?: string | null;
  jobContext?: string;
  keywords?: string[];
  onUpdateCoverLetter?: (updatedCoverLetter: string) => void;
}) {
  const evidence = useMemo(
    () => extractCoverLetterEvidence(coverLetter || "", []),
    [coverLetter]
  );

  if (!coverLetter) {
    return (
      <div>
        <h2 className="text-xl font-bold text-[#1A237E] mb-4">Cover Letter</h2>
        <div className="bg-white/40 rounded-lg p-6">
          <span className="text-[#607086]">No cover letter available</span>
        </div>
      </div>
    );
  }

  const paragraphs = coverLetter
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-[#1A237E]">Cover Letter</h2>
      </div>

      <ScribeInlineEditor
        mode="paragraphs"
        title="Scribe Cover Letter Co-Writer"
        subtitle="Click any paragraph to open the Scribe AI toolbar (Tighten, Add Metrics, Match Keywords, or AU/UK ↔ US Localization)."
        items={paragraphs.map((text, idx) => {
          const paraEv = evidence.paragraphs[idx];
          return {
            id: `cl-para-${idx}`,
            text,
            evidenceTag:
              paraEv && paraEv.fact_ids.length > 0
                ? `Evidence: ${paraEv.fact_ids.join(", ")}`
                : undefined,
          };
        })}
        onUpdateItem={(id, newText) => {
          const idx = Number(id.replace("cl-para-", ""));
          const nextParagraphs = paragraphs.map((p, i) => (i === idx ? newText : p));
          const updatedFull = nextParagraphs.join("\n\n");
          onUpdateCoverLetter?.(updatedFull);
        }}
        jobContext={jobContext}
        keywords={keywords}
        onCopyAll={() => {
          void navigator.clipboard.writeText(stripFactTagsForExport(coverLetter));
        }}
        copyAllLabel="Copy All (Clean Export)"
      />
    </div>
  );
}

