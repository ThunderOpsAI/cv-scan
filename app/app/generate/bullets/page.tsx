"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { ScribeInlineEditor } from "@/components/ui/ScribeInlineEditor";

export default function GenerateBullets() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobDuty, setJobDuty] = useState("");
  const [loading, setLoading] = useState(false);
  const [bullets, setBullets] = useState<string[]>([]);
  const [ungroundableNotes, setUngroundableNotes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const sourceBullets = [
    "Responsible for product analytics and reporting across multiple teams.",
    "Worked with stakeholders to improve dashboard visibility and decision-making.",
    "Supported roadmap planning with customer and operational insights.",
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobDuty.trim()) {
      setError("Please enter a job duty or responsibility");
      return;
    }


    setLoading(true);
    setError("");
    setBullets([]);
    setUngroundableNotes([]);

    try {
      const res = await fetch("/api/generate/bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDuty }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate bullets");
      }

      setBullets(data.bullets);
      setUngroundableNotes(Array.isArray(data.ungroundableNotes) ? data.ungroundableNotes : []);

      // Update session to reflect new credit count
      router.refresh();
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const copyBullet = (bullet: string) => {
    navigator.clipboard.writeText(bullet);
  };

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
    <div className="min-h-screen bg-[#E0F2F1]">
      {/* Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1A237E] mb-2">Generate Resume Bullets</h1>
            <p className="text-[#607086]/80">
              Create ATS-optimized resume bullets from approved career facts
            </p>

            <p className="mt-2 text-[#607086]/80 text-sm">
              Need to add facts first?{" "}
              <Link href="/dashboard/profile/facts" className="text-[#26A69A] hover:text-blue-200">
                Open Career Memory
              </Link>
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleGenerate} className="mb-8">
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-black/[0.06]">
              <label htmlFor="jobDuty" className="block text-[#1A237E] font-semibold mb-3">
                What should these bullets focus on?
              </label>
              <textarea
                id="jobDuty"
                value={jobDuty}
                onChange={(e) => setJobDuty(e.target.value)}
                placeholder="Example: Focus on product analytics, stakeholder leadership, or customer support impact"
                className="w-full bg-white/40 border border-black/[0.06] rounded-xl p-4 text-[#1A237E] placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[120px]"
                disabled={loading}
              />
              <p className="text-[#607086]/80 text-sm mt-2">
                This guides the generation, but only approved facts can be used as evidence.
              </p>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !jobDuty.trim()}
                className="mt-6 w-full bg-[#26A69A] hover:bg-[#1A237E] text-white py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Generating..." : "Generate Bullet Points"}
              </button>
            </div>
          </form>

          {/* Results */}
          {bullets.length > 0 && (
            <div className="space-y-6">
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-black/[0.06]">
                <h2 className="text-2xl font-bold text-[#1A237E] mb-4">Your Resume Bullets</h2>
                <div className="mb-6 p-4 bg-[#E0F2F1] border border-[#26A69A]/30 rounded-xl flex items-start gap-3">
                  <p className="text-[#1A237E] text-sm leading-relaxed">
                    <strong>AI-generated drafts:</strong> These bullets cite approved Career Memory facts.
                    Keep the evidence tag visible while reviewing, then verify every claim before using it.
                  </p>
                </div>
                {ungroundableNotes.length > 0 && (
                  <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <li className="text-amber-800 text-sm font-semibold">Unsupported requests were withheld</li>
                    <ul className="mt-2 list-disc list-inside text-amber-700 text-sm">
                      {ungroundableNotes.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <ScribeInlineEditor
                  mode="bullets"
                  title="Scribe Inline Bullet Editor"
                  subtitle="Click any bullet point below to open the floating AI toolbar (Tighten, Add Metrics, Match Keywords, or AU/UK ↔ US Localization)."
                  items={bullets.map((bullet, index) => ({
                    id: `gen-bullet-${index}`,
                    text: bullet,
                  }))}
                  onUpdateItem={(id, newText) => {
                    const idx = Number(id.replace("gen-bullet-", ""));
                    setBullets((prev) => prev.map((b, i) => (i === idx ? newText : b)));
                  }}
                  jobContext={jobDuty}
                  keywords={jobDuty.split(/[\s,/.]+/).filter((t) => t.length > 4)}
                  onCopyAll={() => {
                    copyBullet(bullets.map((b) => `• ${b}`).join("\n"));
                  }}
                  copyAllLabel="Copy All Bullets"
                />

                <button
                  onClick={() => {
                    setJobDuty("");
                    setBullets([]);
                    setUngroundableNotes([]);
                  }}
                  className="mt-6 w-full bg-white/80 hover:bg-white text-[#1A237E] py-3 px-6 rounded-xl font-semibold transition-all border border-black/[0.06]"
                >
                  Generate Another
                </button>
              </div>

              <BeforeAfter
                beforeLabel="Original direction"
                beforeText={sourceBullets}
                afterLabel="Tailored output"
                afterText={bullets}
                changedTerms={jobDuty.split(/[\s,/.]+/).filter((term) => term.length > 5).slice(0, 6)}
              />
            </div>
          )}

          {/* Tips */}
          <div className="mt-8 bg-white/40 backdrop-blur-lg rounded-2xl p-6 border border-black/[0.06]">
            <h3 className="text-[#1A237E] font-semibold mb-3">Tips for best results:</h3>
            <ul className="space-y-2 text-[#607086] text-sm">
              <li>- Approve accurate resume facts in Career Memory first</li>
              <li>- Add exact metrics before asking for metric-heavy bullets</li>
              <li>- Mention the role or theme you want the approved facts tailored toward</li>
              <li>- Reject or edit any draft that does not match your real experience</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
