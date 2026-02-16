"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function GenerateCoverLetter() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resume.trim() || !jobDescription.trim()) {
      setError("Please provide both your resume and the job description");
      return;
    }

    if ((session?.user?.credits || 0) < 2) {
      setError("You need at least 2 credits. Please purchase more.");
      return;
    }

    setLoading(true);
    setError("");
    setCoverLetter("");

    try {
      const res = await fetch("/api/generate/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate cover letter");
      }

      setCoverLetter(data.coverLetter);

      // Refresh history
      fetchHistory();

      // Update session to reflect new credit count
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetter);
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
            <h1 className="text-4xl font-bold text-white mb-2">Generate Cover Letter</h1>
            <p className="text-gray-400">
              Create a personalized, professional cover letter tailored to the job
            </p>
            <div className="mt-2 text-blue-400 text-sm">Cost: 2 credits per generation</div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Input Form */}
              <form onSubmit={handleGenerate} className="mb-8 space-y-6">
                {/* Resume Input */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <label htmlFor="resume" className="block text-white font-semibold mb-3">
                    Your Resume Summary or Key Highlights
                  </label>
                  <textarea
                    id="resume"
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    placeholder="Paste your resume highlights, skills, and experience here..."
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[150px]"
                    disabled={loading}
                  />
                </div>

                {/* Job Description Input */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <label htmlFor="jobDescription" className="block text-white font-semibold mb-3">
                    Job Description
                  </label>
                  <textarea
                    id="jobDescription"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-[150px]"
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
                  disabled={loading || !resume.trim() || !jobDescription.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Generating..." : "Generate Cover Letter"}
                </button>
              </form>

              {/* Results */}
              {coverLetter && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Result</h2>
                    <button
                      onClick={copyCoverLetter}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                    >
                      Copy
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/20 rounded-xl p-6">
                    <div className="text-white whitespace-pre-wrap font-serif leading-relaxed">
                      {coverLetter}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar History */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-4">
                <h3 className="text-white font-bold mb-4 text-lg">History</h3>
                {history.length === 0 ? (
                  <p className="text-gray-400 text-sm">No saved letters yet.</p>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-blue-500/50 cursor-pointer transition-all"
                        onClick={() => {
                          setCoverLetter(item.output);
                          setResume(item.input.resume || "");
                          setJobDescription(item.input.job_description || "");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <div className="text-xs text-gray-400 mb-2">
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        <p className="text-white text-sm line-clamp-2 mb-2 font-medium">
                          {item.input.job_description?.substring(0, 100) || "No description"}...
                        </p>
                        <div className="text-blue-400 text-xs mt-2 flex items-center gap-1">
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
