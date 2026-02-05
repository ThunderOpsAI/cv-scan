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

          {/* Input Form */}
          <form onSubmit={handleGenerate} className="mb-8 space-y-6">
            {/* Resume Input */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
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
              <p className="text-gray-400 text-sm mt-2">
                Include your key skills, experience, and accomplishments
              </p>
            </div>

            {/* Job Description Input */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
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
              <p className="text-gray-400 text-sm mt-2">
                Include responsibilities, requirements, and company information
              </p>
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
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Your Cover Letter</h2>
                <button
                  onClick={copyCoverLetter}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  <svg
                    className="w-5 h-5"
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
                  Copy
                </button>
              </div>

              <div className="bg-white/5 border border-white/20 rounded-xl p-6">
                <div className="text-white whitespace-pre-wrap font-serif leading-relaxed">
                  {coverLetter}
                </div>
              </div>

              <button
                onClick={() => {
                  setResume("");
                  setJobDescription("");
                  setCoverLetter("");
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
              <li>• Include your most relevant skills and experiences in the resume section</li>
              <li>• Copy the complete job description for better tailoring</li>
              <li>• The AI will match your experience to job requirements automatically</li>
              <li>• Review and personalize the letter before sending</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
