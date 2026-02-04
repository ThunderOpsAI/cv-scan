"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { JobPack } from "@/types/job-packs";

export default function JobPacksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobPacks, setJobPacks] = useState<JobPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchJobPacks();
    }
  }, [status, router]);

  const fetchJobPacks = async () => {
    try {
      const res = await fetch("/api/job-packs");
      const data = await res.json();
      setJobPacks(data.job_packs || []);
    } catch (err) {
      console.error("Failed to fetch job packs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-gray-400";
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadge = (score?: number) => {
    if (!score) return "bg-gray-500/20 text-gray-400";
    if (score >= 80) return "bg-green-500/20 text-green-400";
    if (score >= 60) return "bg-yellow-500/20 text-yellow-400";
    return "bg-red-500/20 text-red-400";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
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
          <div className="text-white">
            <span className="text-gray-400">Credits:</span>{" "}
            <span className="font-bold text-blue-400">{session.user.credits}</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Job Packs</h1>
              <p className="text-gray-400">
                Your tailored application packages
              </p>
            </div>
            <Link
              href="/dashboard/job-packs/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              data-testid="new-job-pack-btn"
            >
              + New Job Pack
            </Link>
          </div>

          {/* Job Packs Grid */}
          {jobPacks.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No Job Packs Yet
              </h3>
              <p className="text-gray-400 mb-6">
                Create your first job pack to get a tailored resume and cover letter
              </p>
              <Link
                href="/dashboard/job-packs/new"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Job Pack (5 credits)
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="job-packs-grid">
              {jobPacks.map((pack) => (
                <Link
                  key={pack.id}
                  href={`/dashboard/job-packs/${pack.id}`}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-500/50 transition-all group"
                  data-testid={`job-pack-card-${pack.id}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                        {pack.company}
                      </h3>
                      <p className="text-gray-400 truncate">{pack.job_title}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBadge(pack.ats_score)}`}>
                      {pack.ats_score ? `${pack.ats_score}%` : "N/A"}
                    </span>
                  </div>

                  {pack.cultural_fit_warnings && pack.cultural_fit_warnings.length > 0 && (
                    <div className="mb-4">
                      <span className="text-yellow-400 text-sm">
                        ⚠️ {pack.cultural_fit_warnings.length} warning{pack.cultural_fit_warnings.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formatDate(pack.created_at)}</span>
                    <span className="text-blue-400 group-hover:text-blue-300">
                      View →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
