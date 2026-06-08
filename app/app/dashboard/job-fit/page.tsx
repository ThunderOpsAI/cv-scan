"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type { FitAnalysisRecord, JobRecord } from "@/types/fit";
import { CREDIT_COSTS } from "@/lib/billing/credit-costs";

function verdictStyles(verdict: string) {
  switch (verdict) {
    case "apply":
      return {
        border: "border-emerald-500/60",
        bg: "bg-emerald-500/15",
        label: "Apply",
        text: "text-emerald-100",
      };
    case "stretch":
      return {
        border: "border-amber-500/60",
        bg: "bg-amber-500/15",
        label: "Stretch",
        text: "text-amber-100",
      };
    case "skip":
      return {
        border: "border-rose-500/60",
        bg: "bg-rose-500/15",
        label: "Skip",
        text: "text-rose-100",
      };
    default:
      return {
        border: "border-black/[0.06]",
        bg: "bg-white/40",
        label: verdict,
        text: "text-gray-200",
      };
  }
}

function JobFitContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [rawDescription, setRawDescription] = useState("");

  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [latestAnalysis, setLatestAnalysis] = useState<FitAnalysisRecord | null>(null);
  const [analysisJob, setAnalysisJob] = useState<JobRecord | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<FitAnalysisRecord[]>([]);

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load jobs");
      setJobs(data.jobs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=%2Fdashboard%2Fjob-fit");
    } else if (status === "authenticated") {
      loadJobs();
    }
  }, [status, router, loadJobs]);

  useEffect(() => {
    const jd = searchParams.get("jd");
    const t = searchParams.get("title");
    const c = searchParams.get("company");
    if (jd) setRawDescription(decodeURIComponent(jd));
    if (t) setTitle(decodeURIComponent(t));
    if (c) setCompany(decodeURIComponent(c));
  }, [searchParams]);

  const runFit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLatestAnalysis(null);
    setAnalysisJob(null);
    setAnalysisHistory([]);

    if (!title.trim() || !company.trim() || rawDescription.trim().length < 20) {
      setError("Enter job title, company, and a description (at least 20 characters).");
      return;
    }

    setRunning(true);
    try {
      const createRes = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          company: company.trim(),
          url: url.trim() || null,
          raw_description: rawDescription.trim(),
          source: "manual",
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || "Failed to save job");
      }

      const job = createData.job as JobRecord;

      const fitRes = await fetch(`/api/jobs/${job.job_id}/fit`, { method: "POST" });
      const fitData = await fitRes.json();

      if (!fitRes.ok) {
        throw new Error(fitData.error || "Failed to run job fit analysis");
      }

      const analysis = fitData.analysis as FitAnalysisRecord;
      const savedJob = fitData.job as JobRecord;
      setLatestAnalysis(analysis);
      setAnalysisJob(savedJob);
      setAnalysisHistory([analysis]);
      setMessage(
        typeof fitData.new_credits === "number"
          ? `Analysis saved. You have ${fitData.new_credits} credits remaining.`
          : "Analysis saved."
      );
      await loadJobs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setRunning(false);
    }
  };

  const loadJobAnalysis = async (job: JobRecord) => {
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/jobs/${job.job_id}/analyses`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load analyses");
      const list = (data.analyses || []) as FitAnalysisRecord[];
      setAnalysisHistory(list);
      if (list.length === 0) {
        setLatestAnalysis(null);
        setAnalysisJob(job);
        setMessage("No saved analysis for this job yet. Run a new analysis from the form.");
        return;
      }
      setLatestAnalysis(list[0]);
      setAnalysisJob(job);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analysis");
    }
  };

  if (status === "loading" || loadingJobs) {
    return (
      <div className=" flex items-center justify-center">
        <div className="text-[#1A237E] text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const vs = latestAnalysis ? verdictStyles(latestAnalysis.verdict) : null;

  return (
    <div className="">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-[#1A237E]">
          <span className="text-[#26A69A]">CV</span>Scan
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/profile/facts" className="text-[#607086] hover:text-[#1A237E] text-sm">
            Career Memory
          </Link>
          <Link href="/dashboard" className="text-[#607086] hover:text-[#1A237E]">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-10 max-w-5xl space-y-10">
        <header>
          <p className="text-[#26A69A] text-sm font-semibold uppercase tracking-wide">Phase 2 — Activation</p>
          <h1 className="text-4xl font-bold text-[#1A237E] mt-2">Job fit</h1>
          <p className="text-[#607086] mt-3 max-w-3xl">
            Paste a job description and get an apply / stretch / skip verdict grounded only in your approved
            profile facts. Each run uses {CREDIT_COSTS.jobFit} credit
            {CREDIT_COSTS.jobFit === 1 ? "" : "s"} (you have {session.user.credits}).
          </p>
        </header>

        {(error || message) && (
          <div
            className={`rounded-lg border p-4 ${
              error
                ? "bg-red-500/20 border-red-500/50 text-red-100"
                : "bg-green-500/15 border-green-500/40 text-green-100"
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={runFit} className="lg:col-span-2 space-y-5">
            <div className="bg-white/60 backdrop-blur-lg rounded-lg p-6 border border-black/[0.06] space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#1A237E] font-semibold mb-2 text-sm">Job title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/40 border border-black/[0.06] rounded-lg p-3 text-[#1A237E] placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="Senior Software Engineer"
                    disabled={running}
                  />
                </div>
                <div>
                  <label className="block text-[#1A237E] font-semibold mb-2 text-sm">Company</label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-white/40 border border-black/[0.06] rounded-lg p-3 text-[#1A237E] placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    placeholder="Acme Corp"
                    disabled={running}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#1A237E] font-semibold mb-2 text-sm">Job URL (optional)</label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-white/40 border border-black/[0.06] rounded-lg p-3 text-[#1A237E] placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                  disabled={running}
                />
              </div>
              <div>
                <label className="block text-[#1A237E] font-semibold mb-2 text-sm">Job description</label>
                <textarea
                  value={rawDescription}
                  onChange={(e) => setRawDescription(e.target.value)}
                  className="min-h-[220px] w-full bg-white/40 border border-black/[0.06] rounded-lg p-4 text-[#1A237E] placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Paste the full job description..."
                  disabled={running}
                />
              </div>
              <button
                type="submit"
                disabled={running || rawDescription.trim().length < 20}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-[#1A237E] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {running ? "Saving job and analyzing fit..." : "Save job and run fit analysis"}
              </button>
            </div>
          </form>

          <aside className="bg-white/40 backdrop-blur-lg rounded-lg p-6 border border-black/[0.06] h-fit">
            <h2 className="text-lg font-bold text-[#1A237E] mb-2">Recent jobs</h2>
            <p className="text-[#607086]/80 text-sm mb-4">Open a past job to view its latest saved analysis.</p>
            {jobs.length === 0 ? (
              <p className="text-gray-500 text-sm">No saved jobs yet.</p>
            ) : (
              <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {jobs.map((job) => (
                  <li key={job.job_id}>
                    <button
                      type="button"
                      onClick={() => loadJobAnalysis(job)}
                      className="w-full text-left rounded-lg border border-white/10 bg-white/40 px-3 py-2 hover:bg-white/60 transition-colors"
                    >
                      <p className="text-[#1A237E] text-sm font-medium line-clamp-1">{job.title}</p>
                      <p className="text-[#607086]/80 text-xs">{job.company}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>

        {latestAnalysis && analysisJob && vs && (
          <section className={`rounded-xl border p-6 ${vs.border} ${vs.bg}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wide ${vs.text}`}>{vs.label}</p>
                <h2 className="text-2xl font-bold text-[#1A237E] mt-1">
                  {analysisJob.title} <span className="text-[#607086]/80 font-normal">@</span> {analysisJob.company}
                </h2>
                <p className="text-gray-200 mt-4 leading-relaxed">{latestAnalysis.rationale}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Link
                  href={`/dashboard/tailor/${analysisJob.job_id}?fromFit=1`}
                  className="text-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-[#1A237E] hover:bg-indigo-500"
                >
                  Tailor bullets & cover letter
                </Link>
                <Link
                  href={`/dashboard/job-packs/new?${new URLSearchParams({
                    jd: analysisJob.raw_description,
                    title: analysisJob.title,
                    company: analysisJob.company,
                  }).toString()}`}
                  className="text-center rounded-lg bg-purple-600/90 px-4 py-2 text-sm font-semibold text-[#1A237E] hover:bg-purple-600"
                >
                  Full job pack (legacy flow)
                </Link>
                <Link
                  href="/dashboard/scanner"
                  className="text-center rounded-lg bg-white/60 px-4 py-2 text-sm font-semibold text-[#1A237E] hover:bg-white/20"
                >
                  ATS scanner
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="rounded-lg bg-black/20 border border-white/10 p-4">
                <h3 className="text-emerald-300 text-sm font-semibold mb-2">Strengths matched</h3>
                <ul className="text-gray-200 text-sm space-y-2 list-disc list-inside">
                  {latestAnalysis.signals_json.strengths_matched.length === 0 ? (
                    <li className="list-none text-gray-500">None listed</li>
                  ) : (
                    latestAnalysis.signals_json.strengths_matched.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))
                  )}
                </ul>
              </div>
              <div className="rounded-lg bg-black/20 border border-white/10 p-4">
                <h3 className="text-amber-300 text-sm font-semibold mb-2">Must-have gaps</h3>
                <ul className="text-gray-200 text-sm space-y-2 list-disc list-inside">
                  {latestAnalysis.signals_json.must_have_gaps.length === 0 ? (
                    <li className="list-none text-gray-500">None listed</li>
                  ) : (
                    latestAnalysis.signals_json.must_have_gaps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))
                  )}
                </ul>
              </div>
              <div className="rounded-lg bg-black/20 border border-white/10 p-4">
                <h3 className="text-sky-300 text-sm font-semibold mb-2">Stretch areas</h3>
                <ul className="text-gray-200 text-sm space-y-2 list-disc list-inside">
                  {latestAnalysis.signals_json.stretch_areas.length === 0 ? (
                    <li className="list-none text-gray-500">None listed</li>
                  ) : (
                    latestAnalysis.signals_json.stretch_areas.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            {analysisHistory.length > 1 && (
              <div className="mt-8 border-t border-black/[0.06] pt-6">
                <h3 className="text-[#1A237E] font-semibold mb-3">Fit history (newest first)</h3>
                <ul className="space-y-2 text-sm text-[#607086]">
                  {analysisHistory.map((a) => (
                    <li
                      key={a.analysis_id}
                      className="flex flex-wrap justify-between gap-2 rounded-lg bg-black/20 px-3 py-2 border border-white/10"
                    >
                      <span className="uppercase text-xs font-bold text-[#607086]/80">{a.verdict}</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(a.created_at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default function JobFitPage() {
  return (
    <Suspense
      fallback={
        <div className=" flex items-center justify-center">
          <div className="text-[#1A237E] text-xl">Loading...</div>
        </div>
      }
    >
      <JobFitContent />
    </Suspense>
  );
}
