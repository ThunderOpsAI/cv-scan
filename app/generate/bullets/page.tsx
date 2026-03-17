"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function GenerateBullets() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobDuty, setJobDuty] = useState("");
  const [loading, setLoading] = useState(false);
  const [bullets, setBullets] = useState<string[]>([]);
  const [error, setError] = useState("");

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

    if (session?.user?.credits === 0) {
      setError("You don't have enough credits. Please purchase more.");
      return;
    }

    setLoading(true);
    setError("");
    setBullets([]);

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

      // Update session to reflect new credit count
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyBullet = (bullet: string) => {
    navigator.clipboard.writeText(bullet);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-white">
          <span className="text-blue-400">CV</span>Scan
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-white">
            <span className="text-gray-400">Credits:</span>{" "}
            <span className="font-bold text-blue-400">{session.user.credits}</span>
          </div>
          <Link
            href="/dashboard"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Generate Resume Bullets</h1>
            <p className="text-gray-400">
              Transform your job duties into ATS-optimized, professional resume bullet points
            </p>
            <div className="mt-2 text-blue-400 text-sm">Cost: 1 credit per generation</div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleGenerate} className="mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <label htmlFor="jobDuty" className="block text-white font-semibold mb-3">
                What did you do in your role?
              </label>
              <textarea
                id="jobDuty"
                value={jobDuty}
                onChange={(e) => setJobDuty(e.target.value)}
                placeholder="Example: Managed social media accounts for company, posted content daily, grew follower count"
                className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[120px]"
                disabled={loading}
              />
              <p className="text-gray-400 text-sm mt-2">
                Describe your responsibility, accomplishments, or daily tasks
              </p>

              {error && (
                <div className="mt-4 bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !jobDuty.trim()}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Generating..." : "Generate Bullet Points"}
              </button>
            </div>
          </form>

          {/* Results */}
          {bullets.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Your Resume Bullets</h2>
              <div className="mb-6 p-4 bg-blue-900/40 border border-blue-500/30 rounded-xl flex items-start gap-3">
                <span className="text-blue-400 text-xl">🤖</span>
                <p className="text-blue-200 text-sm leading-relaxed">
                  <strong>AI-Generated Drafts:</strong> Please review and edit these bullet points to ensure they perfectly match your actual experience before using them in applications.
                </p>
              </div>
              <p className="text-gray-400 mb-6">
                Click any bullet point to copy it to your clipboard
              </p>
              <div className="space-y-4">
                {bullets.map((bullet, index) => (
                  <div
                    key={index}
                    onClick={() => copyBullet(bullet)}
                    className="bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-blue-400 font-bold">•</span>
                      <p className="text-white flex-1">{bullet}</p>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setJobDuty("");
                  setBullets([]);
                }}
                className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl font-semibold transition-all border border-white/20"
              >
                Generate Another
              </button>
            </div>
          )}

          {/* Tips */}
          <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-white font-semibold mb-3">💡 Tips for Best Results:</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Be specific about your responsibilities and accomplishments</li>
              <li>• Include metrics or numbers when possible (e.g., "increased by 30%")</li>
              <li>• Mention tools, technologies, or methodologies you used</li>
              <li>• Focus on impact and results, not just tasks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
