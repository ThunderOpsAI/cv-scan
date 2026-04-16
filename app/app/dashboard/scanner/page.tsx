"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import { ATSScan, ATSScanResponse } from "@/types/job-packs";
import { ScannerPageSkeleton } from "@/components/ui/dashboard-skeletons";

export default function ScannerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [parsedResume, setParsedResume] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [freeScansRemaining, setFreeScansRemaining] = useState<number | null>(null);
  const [scanResult, setScanResult] = useState<ATSScan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchFreeScans();
    }
  }, [status, router]);

  const fetchFreeScans = async () => {
    try {
      const res = await fetch("/api/ats/scan");
      const data = await res.json();
      setFreeScansRemaining(data.free_scans_remaining);
    } catch (err) {
      console.error("Failed to fetch free scans:", err);
    }
  };

  const handleScan = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    setLoading(true);
    setError("");
    setScanResult(null);

    try {
      const res = await fetch("/api/ats/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription }),
      });

      const data: ATSScanResponse = await res.json();

      if (!res.ok) {
        throw new Error((data as any).error || "Scan failed");
      }

      setScanResult(data.scan);
      setFreeScansRemaining(data.free_scans_remaining);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Handle file selection for resume upload (basic placeholder)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);
    setResumeText("");
    setParsedResume(null);
    setError("");
    // You can add OCR and parsing logic here as needed
  };

  if (status === "loading") {
    return <ScannerPageSkeleton />;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-white">
          <span className="text-blue-400">CV</span>Scan
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-300 hover:text-white">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">ATS Scanner</h1>
            <p className="text-gray-400">
              Analyze how well your profile matches a job description
            </p>
            {freeScansRemaining !== null && (
              <p className="text-blue-400 mt-2">
                {freeScansRemaining > 0
                  ? `${freeScansRemaining} free scans remaining today`
                  : "Free scans used."}
              </p>
            )}
          </div>

          {/* Scanner Input & Resume Upload */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
            <label className="block text-white font-semibold mb-2">
              Paste Job Description or Upload Resume
            </label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="mb-4 block text-white"
              data-testid="resume-upload-input"
            />
            {resumeFile && (
              <p className="text-gray-300 mb-2">Selected: {resumeFile.name}</p>
            )}
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              placeholder="Paste the full job description or upload a resume to extract text..."
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              data-testid="job-description-input"
            />
            {uploading && <p className="text-blue-400 mt-2">Extracting text from file...</p>}
            {error && <p className="text-red-400 mt-2">{error}</p>}
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleScan}
                disabled={loading || uploading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                data-testid="scan-button"
              >
                {loading ? "Scanning..." : "Scan Job Description"}
              </button>
              {scanResult && (
                <Link
                  href={`/dashboard/job-packs/new?jd=${encodeURIComponent(jobDescription.slice(0, 2000))}`}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  data-testid="create-job-pack-btn"
                >
                  Create Job Pack
                </Link>
              )}
            </div>
          </div>

          {/* Scan Results */}
          {scanResult && (
            <div className="space-y-6" data-testid="scan-results">
              {/* Overall Score */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">ATS Match Score</h1>
                    <p className="text-gray-400">Based on your profile</p>
                  </div>
                  <div className="relative w-32 h-32">
                    {/* Circular Score Gauge */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-700"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(scanResult.ats_score / 100) * 352} 352`}
                        className={getScoreBg(scanResult.ats_score)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-4xl font-bold ${getScoreColor(scanResult.ats_score)}`}>
                        {scanResult.ats_score}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">Keyword Analysis</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-green-400 font-semibold mb-2">Matched Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.keyword_matches.found.length > 0 ? (
                        scanResult.keyword_matches.found.map((keyword, i) => (
                          <span
                            key={i}
                            className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm"
                          >
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No matches found</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-red-400 font-semibold mb-2">Missing Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.keyword_matches.missing.length > 0 ? (
                        scanResult.keyword_matches.missing.map((keyword, i) => (
                          <span
                            key={i}
                            className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm"
                          >
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">Great - no critical keywords missing!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Scores */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">Section Breakdown</h2>
                <div className="space-y-4">
                  {Object.entries(scanResult.section_scores).map(([section, score]) => (
                    <div key={section}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300 capitalize">{section}</span>
                        <span className={getScoreColor(score as number)}>{score}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreBg(score as number)}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">Recommendations</h2>
                {scanResult.recommendations.length > 0 ? (
                  <ul className="space-y-3">
                    {scanResult.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-blue-400 mt-1">•</span>
                        <span className="text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">Your profile looks great for this role!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
