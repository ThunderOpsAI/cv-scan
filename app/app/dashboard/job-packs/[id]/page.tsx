
"use client";
import { CoverLetterEvidenceDisplay } from "./CoverLetterEvidenceDisplay";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { JobPack, ATSScan, TailorDiffResponse } from "@/types/job-packs";

type TabType = "overview" | "resume" | "cover-letter" | "ats";

export default function JobPackDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [jobPack, setJobPack] = useState<JobPack | null>(null);
  const [atsScan, setAtsScan] = useState<ATSScan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [diffData, setDiffData] = useState<TailorDiffResponse | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && params.id) {
      fetchJobPack();
    }
  }, [status, router, params.id]);

  const fetchJobPack = async () => {
    try {
      const res = await fetch(`/api/job-packs/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setJobPack(data.job_pack);
        setAtsScan(data.ats_scan);
      } else {
        router.push("/dashboard/job-packs");
      }
    } catch (err) {
      console.error("Failed to fetch job pack:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiff = async () => {
    setLoadingDiff(true);
    try {
      const res = await fetch(`/api/job-packs/${params.id}/diff`);
      const data = await res.json();
      if (res.ok) {
        setDiffData(data);
        setShowDiffModal(true);
      }
    } catch (err) {
      console.error("Failed to fetch diff:", err);
    } finally {
      setLoadingDiff(false);
    }
  };

  const handleExport = (format: "pdf" | "docx") => {
    window.open(`/api/job-packs/${params.id}/export/${format}?reviewed=1`, "_blank");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job pack?")) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/job-packs/${params.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard/job-packs");
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeleting(false);
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-gray-400";
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score?: number) => {
    if (!score) return "bg-gray-500";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || !jobPack) return null;

  const tabs: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "resume", label: "Tailored Resume" },
    { id: "cover-letter", label: "Cover Letter" },
    { id: "ats", label: "ATS Analysis" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-white">
          <span className="text-blue-400">CV</span>Scan
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/job-packs" className="text-gray-300 hover:text-white">
            ← Back to Job Packs
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">{jobPack.company}</h1>
                <p className="text-xl text-gray-400">{jobPack.job_title}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(jobPack.ats_score)}`}>
                    {jobPack.ats_score || "N/A"}%
                  </div>
                  <div className="text-gray-400 text-sm">ATS Score</div>
                </div>
                {/* Export Dropdown */}
                <div className="relative group">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    data-testid="export-btn"
                  >
                    Export ▼
                  </button>
                  <div className="absolute right-0 mt-2 w-40 bg-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => handleExport("pdf")}
                      className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-t-lg"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => handleExport("docx")}
                      className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-b-lg"
                    >
                      Download DOCX
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded-lg transition-colors"
                  data-testid="delete-btn"
                >
                  {deleting ? "..." : "Delete"}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="mb-6 rounded-lg border border-amber-400/40 bg-amber-900/20 p-4 text-amber-100 text-sm">
              <strong>Disclosure:</strong> Some content below may be generated by AI using only your approved Career Memory facts.<br />
              <span className="font-semibold">You are responsible for reviewing and editing all AI-generated content before export, save, or use.</span> CVScan does not fabricate experience, credentials, or achievements, but cannot guarantee the accuracy or appropriateness of AI output.<br />
              <span className="italic">Do not submit generated content to employers without careful review.</span>
            </div>
            <div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-blue-100 text-sm">
              <strong>Review before export.</strong> AI-generated resume and cover letter text should only use
              claims backed by visible evidence tags from approved Career Memory facts. Edit anything that does
              not match your real experience before sending.
            </div>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* ATS Score Summary */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">ATS Compatibility</h2>
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-700"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${((jobPack.ats_score || 0) / 100) * 251} 251`}
                          className={getScoreBg(jobPack.ats_score)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${getScoreColor(jobPack.ats_score)}`}>
                          {jobPack.ats_score || "?"}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-300">
                        {(jobPack.ats_score || 0) >= 80
                          ? "Excellent match! Your profile aligns well with this role."
                          : (jobPack.ats_score || 0) >= 60
                          ? "Good match. Some improvements could boost your chances."
                          : "Needs work. Review recommendations to improve your match."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cultural Warnings */}
                {jobPack.cultural_fit_warnings && jobPack.cultural_fit_warnings.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">⚠️ Cultural Fit Warnings</h2>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <ul className="space-y-2">
                        {jobPack.cultural_fit_warnings.map((warning, i) => (
                          <li key={i} className="text-yellow-300 flex items-start gap-2">
                            <span>•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Package Contents</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-3xl mb-2">📝</div>
                      <h3 className="text-white font-semibold">Tailored Resume</h3>
                      <p className="text-gray-400 text-sm">Optimized for this role</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-3xl mb-2">✉️</div>
                      <h3 className="text-white font-semibold">Cover Letter</h3>
                      <p className="text-gray-400 text-sm">Personalized for {jobPack.company}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-3xl mb-2">📊</div>
                      <h3 className="text-white font-semibold">ATS Analysis</h3>
                      <p className="text-gray-400 text-sm">Keywords & recommendations</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resume Tab */}

            {activeTab === "resume" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Tailored Resume</h2>
                  <button
                    onClick={fetchDiff}
                    disabled={loadingDiff}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                    data-testid="view-diff-btn"
                  >
                    {loadingDiff ? "Loading..." : "View Diff"}
                  </button>
                </div>
                <div className="bg-white/5 rounded-lg p-6">
                  {/* Evidence tag rendering for resume bullets (Phase 4.1) */}
                  {/* TODO: Replace with actual evidence extraction for resume bullets if available */}
                  <pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {jobPack.resume_version || "No tailored resume available"}
                  </pre>
                  {/* If evidence/gap signals are available for resume, render them here */}
                </div>
              </div>
            )}

            {/* Cover Letter Tab */}
            {activeTab === "cover-letter" && (
              <CoverLetterEvidenceDisplay coverLetter={jobPack.cover_letter} />
            )}

            {/* ATS Analysis Tab */}
            {activeTab === "ats" && atsScan && (
              <div className="space-y-6">
                {/* Keywords */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Keyword Analysis</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-green-400 font-semibold mb-2">Matched Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {atsScan.keyword_matches.found.length > 0 ? (
                          atsScan.keyword_matches.found.map((keyword, i) => (
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
                        {atsScan.keyword_matches.missing.length > 0 ? (
                          atsScan.keyword_matches.missing.map((keyword, i) => (
                            <span
                              key={i}
                              className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm"
                            >
                              {keyword}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No critical keywords missing</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Scores */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Section Breakdown</h2>
                  <div className="space-y-4">
                    {Object.entries(atsScan.section_scores).map(([section, score]) => (
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
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Recommendations</h2>
                  {atsScan.recommendations.length > 0 ? (
                    <ul className="space-y-3">
                      {atsScan.recommendations.map((rec, i) => (
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

      {/* Diff Modal */}
      {showDiffModal && diffData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Resume Tailor Diff</h2>
              <button
                onClick={() => setShowDiffModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-400 mb-3">Original Resume</h3>
                  <div className="bg-white/5 rounded-lg p-4 text-sm">
                    <pre className="text-gray-400 whitespace-pre-wrap font-sans">
                      {diffData.original}
                    </pre>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Tailored Resume</h3>
                  <div className="bg-white/5 rounded-lg p-4 text-sm">
                    <pre className="text-gray-300 whitespace-pre-wrap font-sans">
                      {diffData.tailored}
                    </pre>
                  </div>
                </div>
              </div>
              {/* Changes Summary */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Changes</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                    {diffData.changes.filter(c => c.type === "added").length} additions
                  </span>
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
                    {diffData.changes.filter(c => c.type === "removed").length} removals
                  </span>
                  <span className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-sm">
                    {diffData.changes.filter(c => c.type === "unchanged").length} unchanged
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
