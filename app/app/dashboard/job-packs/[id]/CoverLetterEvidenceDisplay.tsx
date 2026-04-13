import { useMemo } from "react";
import { extractCoverLetterEvidence } from "@/lib/generation/cover-letter-evidence";

export function CoverLetterEvidenceDisplay({ coverLetter }: { coverLetter?: string | null }) {
  // For demo, we use empty facts array; in production, pass approved facts for full validation
  const evidence = useMemo(() =>
    extractCoverLetterEvidence(coverLetter || "", [])
  , [coverLetter]);

  if (!coverLetter) {
    return (
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Cover Letter</h2>
        <div className="bg-white/5 rounded-lg p-6">
          <span className="text-gray-400">No cover letter available</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Cover Letter</h2>
      <div className="bg-white/5 rounded-lg p-6 space-y-4">
        {evidence.paragraphs.map((para, idx) => (
          <div key={idx} className="mb-2">
            <p className="text-gray-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">{para.text}</p>
            {para.fact_ids.length > 0 && (
              <div className="text-xs text-blue-300 mt-1">
                Evidence: {para.fact_ids.join(", ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
