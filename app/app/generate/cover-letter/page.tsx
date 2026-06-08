"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import type { CoverLetterEvidence } from "@/types/generated-assets";
import { stripFactTagsForExport } from "@/lib/generation/cover-letter-evidence";

export default function GenerateCoverLetter() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [evidence, setEvidence] = useState<CoverLetterEvidence | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const templateParagraphs = [
    "Dear Hiring Team,\n\nI am excited to apply for this opportunity and believe my background would allow me to contribute effectively from day one.",
    "In previous roles I have worked across teams, supported delivery, and helped improve outcomes for customers and internal stakeholders.",
    "Thank you for your time and consideration. I would welcome the opportunity to discuss how my experience can support your team.",
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobDescription.trim()) {
      setError("Please provide the job description");
      return;
    }


    setLoading(true);
    setError("");
    setCoverLetter("");
    setEvidence(null);

    try {
      const res = await fetch("/api/generate/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate cover letter");
      }

      setCoverLetter(data.coverLetter);
      setEvidence((data.evidence as CoverLetterEvidence) || null);
      setSaved(false); // Reset saved state for new generation
      setSaveMessage("");

      // Update session to reflect new credit count
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyCoverLetter = () => {
    navigator.clipboard.writeText(stripFactTagsForExport(coverLetter));
  };

  const coverHasEvidenceTags = /\[fact:[a-f0-9-]{8,36}\]/i.test(coverLetter);

  const saveCoverLetter = async () => {
    try {
      const res = await fetch("/api/generate/cover-letter", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverLetter, jobDescription }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save cover letter");
      }

      setSaved(true);
      setSaveMessage("Saved to your library!");
      fetchHistory(); // Refresh history sidebar

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save");
    }
  };

  /* Fetch history */
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/generate/cover-letter");
      const data = await res.json();
      if (data.generations) {
        setHistory(data.generations);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [status]);

  if (status === "loading") {
    return (
      <div className=" flex items-center justify-center">
        <div className="text-[#1A237E] text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-[#1A237E]">
          <span className="text-[#26A69A]">CV</span>Scan
        </Link>
        <div className="flex items-center gap-4">

          <Link
            href="/dashboard"
            className="text-[#607086] hover:text-[#1A237E] transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1A237E] mb-2">Generate Cover Letter</h1>
            <p className="text-[#607086]/80">
              Create a professional cover letter using only approved career facts
            </p>

            <p className="mt-2 text-[#607086]/80 text-sm">
              Need to add facts first?{" "}
              <Link href="/dashboard/profile/facts" className="text-[#26A69A] hover:text-blue-200">
                Open Career Memory
              </Link>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Input Form */}
              <form onSubmit={handleGenerate} className="mb-8 space-y-6">
                {/* Job Description Input */}
                <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-black/[0.06]">
                  <label htmlFor="jobDescription" className="block text-[#1A237E] font-semibold mb-3">
                    Job Description
                  </label>
                  <textarea
                    id="jobDescription"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full bg-white/40 border border-black/[0.06] rounded-xl p-4 text-[#1A237E] placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[150px]"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !jobDescription.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-[#1A237E] py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Generating..." : "Generate Cover Letter"}
                </button>
              </form>

              {/* Results */}
              {coverLetter && (
                <div className="space-y-6">
                  <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-black/[0.06] mb-8">
                    <div className="mb-6 p-4 bg-blue-900/40 border border-blue-500/30 rounded-xl flex items-start gap-3">
                      <p className="text-blue-200 text-sm leading-relaxed">
                        <strong>AI-generated draft:</strong> Candidate claims cite approved Career Memory
                        facts. Review the evidence tags before copying or saving.
                      </p>
                    </div>
                    {evidence && (
                      <div className="mb-6 p-4 bg-white/40 border border-white/15 rounded-xl">
                        <p className="text-[#1A237E] text-sm font-semibold">Evidence check</p>
                        <p className="text-[#607086] text-sm mt-1">
                          {evidence.valid_fact_ids.length} approved fact
                          {evidence.valid_fact_ids.length === 1 ? "" : "s"} cited.
                        </p>
                        {evidence.missing_grounding_notes.length > 0 && (
                          <ul className="mt-2 list-disc list-inside text-amber-200 text-sm">
                            {evidence.missing_grounding_notes.map((note, index) => (
                              <li key={index}>{note}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-[#1A237E]">Result</h2>
                      <div className="flex items-center gap-3">
                        {saveMessage && (
                          <span className="text-green-400 text-sm font-medium">{saveMessage}</span>
                        )}
                        <button
                          onClick={copyCoverLetter}
                          disabled={!coverHasEvidenceTags}
                          className="flex items-center gap-2 bg-white/60 hover:bg-white/20 text-[#1A237E] px-4 py-2 rounded-lg font-semibold transition-all border border-black/[0.06]"
                        >
                          Copy
                        </button>
                        <button
                          onClick={saveCoverLetter}
                          disabled={saved || !coverHasEvidenceTags}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${saved
                              ? "bg-green-600 text-[#1A237E] cursor-default"
                              : "bg-blue-600 hover:bg-blue-700 text-[#1A237E]"
                            }`}
                        >
                          {saved ? "✓ Saved" : "Save"}
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/40 border border-black/[0.06] rounded-xl p-6">
                      <div className="text-[#1A237E] whitespace-pre-wrap font-serif leading-relaxed">
                        {coverLetter}
                      </div>
                    </div>
                  </div>

                  <BeforeAfter
                    beforeLabel="Base letter"
                    beforeText={templateParagraphs}
                    afterLabel="Tailored draft"
                    afterText={coverLetter}
                    changedTerms={jobDescription.split(/[\s,/.]+/).filter((term) => term.length > 6).slice(0, 6)}
                  />
                </div>
              )}
            </div>

            {/* Sidebar History */}
            <div className="lg:col-span-1">
              <div className="bg-white/40 backdrop-blur-lg rounded-2xl p-6 border border-black/[0.06] sticky top-4">
                <h3 className="text-[#1A237E] font-bold mb-4 text-lg">History</h3>
                {history.length === 0 ? (
                  <p className="text-[#607086]/80 text-sm">No saved letters yet.</p>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/40 p-4 rounded-xl border border-white/10 hover:border-[#26A69A]/30 cursor-pointer transition-all"
                        onClick={() => {
                          setCoverLetter(item.output);
                          setJobDescription(item.input.job_description || "");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <div className="text-xs text-[#607086]/80 mb-2">
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        <p className="text-[#1A237E] text-sm line-clamp-2 mb-2 font-medium">
                          {item.input.job_description?.substring(0, 100) || "No description"}...
                        </p>
                        <div className="text-[#26A69A] text-xs mt-2 flex items-center gap-1">
                          Load <span className="text-lg">→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
