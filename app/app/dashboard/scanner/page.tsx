"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import imageCompression from "browser-image-compression";
import { Camera, Upload, Loader2 } from "lucide-react";
import { ScannerPageSkeleton } from "@/components/ui/dashboard-skeletons";
import { GradientButton } from "@/components/ui/GradientButton";
import { ScanAnimation } from "@/components/ui/ScanAnimation";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { ATSScan, ATSScanResponse } from "@/types/job-packs";

type ApiErrorResponse = { error?: string };
type JobAdOcrResponse = ApiErrorResponse & { text?: string };

const scanStages = ["Reading document...", "Extracting skills...", "Building profile..."];

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-600";
}

function getScoreBar(score: number) {
  if (score >= 80) return "bg-emerald-400";
  if (score >= 60) return "bg-amber-400";
  return "bg-rose-400";
}

export default function ScannerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [jobAdFile, setJobAdFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [freeScansRemaining, setFreeScansRemaining] = useState<number | null>(null);
  const [scanResult, setScanResult] = useState<ATSScan | null>(null);
  const [error, setError] = useState("");
  const [scanStageIndex, setScanStageIndex] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchFreeScans();
    }
  }, [status, router]);

  useEffect(() => {
    if (!loading) {
      setScanStageIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setScanStageIndex((current) => (current < scanStages.length - 1 ? current + 1 : current));
    }, 950);

    return () => window.clearInterval(interval);
  }, [loading]);

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
    setScanStageIndex(0);

    try {
      const res = await fetch("/api/ats/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription }),
      });

      const data = (await res.json()) as ATSScanResponse & ApiErrorResponse;

      if (!res.ok) {
        throw new Error(data.error || "Scan failed");
      }

      setScanResult(data.scan);
      setFreeScansRemaining(data.free_scans_remaining);
      setScanStageIndex(scanStages.length - 1);
    } catch (err) {
      setError(getErrorMessage(err, "Scan failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setJobAdFile(file);
    setError("");
    setUploading(true);

    try {
      let finalFile = file;
      // Compress large images from mobile cameras before upload
      if (file.type.startsWith("image/")) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        finalFile = await imageCompression(file, options);
      }

      const formData = new FormData();
      formData.append("file", finalFile);

      const res = await fetch("/api/jobs/ocr", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as JobAdOcrResponse;

      if (!res.ok) {
        throw new Error(data.error || "Could not read that file");
      }

      setJobDescription(data.text || "");
    } catch (err) {
      setError(getErrorMessage(err, "Could not read that screenshot. Try a clearer image or paste the job ad."));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const visibleKeywords = useMemo(() => {
    if (scanResult) {
      return [...scanResult.keyword_matches.found.slice(0, 7), ...scanResult.keyword_matches.missing.slice(0, 3)];
    }

    return ["Stakeholder management", "Roadmapping", "SQL", "Customer insights", "Leadership", "Communication"];
  }, [scanResult]);

  if (status === "loading") {
    return <ScannerPageSkeleton />;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#E0F2F1]">
      <nav className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-3 text-[#1A237E]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/[0.06] bg-[#F0EEF0]">
            <span className="text-lg font-semibold text-[#1A237E]">CV</span>
          </div>
          <div>
            <div className="text-lg font-semibold tracking-[-0.03em]">CVScan</div>
            <div className="text-xs text-[#757575]">magic scan</div>
          </div>
        </Link>
        <Link href="/dashboard" className="text-sm text-[#757575] transition hover:text-[#1A237E]">
          Back to dashboard
        </Link>
      </nav>

      <div className="container mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="flex flex-col gap-5 rounded-[2rem] border border-black/[0.06] bg-white/40 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:p-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">ATS scanner</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-[#1A237E] sm:text-5xl">
                  Scan a role like it matters.
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-[#757575]">
                  Drop in a screenshot or paste the description. CVScan will surface the exact keywords, gaps, and profile signals that deserve your attention next.
                </p>
              </div>

              <div className="grid gap-3 rounded-[1.5rem] border border-black/[0.06] bg-[#F0EEF0]/50 px-5 py-4 text-sm text-[#1A237E] sm:min-w-[18rem]">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#757575]">Free scans today</span>
                  <span className="font-semibold text-[#1A237E]">
                    {freeScansRemaining !== null ? freeScansRemaining : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#757575]">Live sync</span>
                  <span className="rounded-full border border-[#26A69A]/16 bg-[#26A69A]/10 px-3 py-1 text-xs text-[#26A69A]">
                    {uploading ? "Phone capture active" : "Ready for Android capture"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.06 }}>
              <div className="scan-dropzone rounded-[2rem] border border-black/[0.06] bg-white/40 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:p-8">
                <div className="rounded-[1.6rem] border border-dashed border-black/[0.06] bg-[#F0EEF0]/30 p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">Input</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#1A237E]">
                        Paste a job ad or scan it with your phone
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-[#757575]">
                        The camera input is tuned for mobile capture, with clearer states and a direct OCR handoff into the scanner.
                      </p>
                    </div>
                    <div className="rounded-full border border-black/[0.06] bg-white/40 px-3 py-1 text-xs text-[#757575]">
                      Android Chrome friendly
                    </div>
                  </div>

                  <div className="relative mt-6">
                    <div className="flex flex-col gap-4 rounded-[1.4rem] border border-black/[0.08] bg-white p-5 shadow-sm transition hover:border-[#26A69A]/30 hover:bg-[#F8FCFC]">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#26A69A]/20 bg-[#26A69A]/10 text-[#26A69A]">
                          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-[#1A237E]">
                            {jobAdFile ? `Selected: ${jobAdFile.name}` : "Upload file or take a photo"}
                          </span>
                          <span className="mt-1 block text-sm text-[#607086]">
                            Choose to snap a photo or browse your files.
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row mt-2">
                        <label className={`relative flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#26A69A]/30 bg-[#26A69A]/10 px-4 py-3 text-sm font-semibold text-[#168579] transition hover:bg-[#26A69A]/20 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="hidden"
                            title="Take photo"
                          />
                          <Camera className="h-4 w-4" />
                          <span>Take Photo</span>
                        </label>

                        <label className={`relative flex-1 flex items-center justify-center gap-2 rounded-xl border border-black/[0.1] bg-black/[0.03] px-4 py-3 text-sm font-semibold text-[#1A237E] transition hover:bg-black/[0.06] cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="hidden"
                            data-testid="job-ad-upload-input"
                            title="Upload file"
                          />
                          <Upload className="h-4 w-4" />
                          <span>Upload File</span>
                        </label>
                      </div>

                      <div className="grid gap-2 rounded-2xl border border-black/[0.06] bg-[#F7FAFA] p-4 text-xs text-[#607086]">
                        <span>1. Use an image or PDF, or snap a clear photo of the job ad.</span>
                        <span>2. Keep the full description in frame and avoid glare.</span>
                        <span>3. Wait for the text box below to fill before running the scan.</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="mb-3 block text-sm font-medium text-[#1A237E]">
                      Job description
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={12}
                      placeholder="Paste the full job description, or upload a screenshot to fill this box..."
                      className="w-full rounded-[1.4rem] border border-black/[0.08] bg-white px-4 py-4 text-[#1A237E] placeholder:text-[#7A879C] focus:border-[#26A69A]/40 focus:outline-none"
                      data-testid="job-description-input"
                    />
                  </div>

                  {uploading ? (
                    <div className="mt-4 rounded-2xl border border-[#26A69A]/20 bg-[#26A69A]/10 px-4 py-3 text-sm text-[#1A237E]">
                      Reading job ad screenshot and syncing the text into your scan draft...
                    </div>
                  ) : null}

                  {error ? (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {error}
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <GradientButton
                      onClick={handleScan}
                      disabled={loading || uploading}
                      className="w-full sm:w-auto"
                    >
                      {loading ? "Scanning in progress..." : "Run magic scan"}
                    </GradientButton>

                    {scanResult ? (
                      <GradientButton
                        href={`/dashboard/job-packs/new?jd=${encodeURIComponent(jobDescription.slice(0, 2000))}`}
                        variant="secondary"
                        className="w-full sm:w-auto"
                      >
                        Create job pack
                      </GradientButton>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
              {(loading || uploading) ? (
                <ScanAnimation
                  fileName={jobAdFile?.name ?? null}
                  isUploading={uploading}
                  stageIndex={scanStageIndex}
                  stages={scanStages}
                  visibleKeywords={visibleKeywords.slice(0, Math.max(2, scanStageIndex * 2 + 2))}
                />
              ) : null}

              {scanResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="space-y-6"
                  data-testid="scan-results"
                >
                  <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="rounded-[2rem] border border-black/[0.08] bg-white p-6 shadow-[0_24px_60px_rgba(26,35,126,0.08)]">
                      <p className="eyebrow">Results</p>
                      <div className="mt-4 flex justify-center">
                        <ScoreGauge score={scanResult.ats_score} />
                      </div>
                      <div className="mt-5 rounded-[1.4rem] border border-black/[0.06] bg-[#F7FAFA] p-4 text-sm text-[#4E5B7A]">
                        <div className="flex items-center justify-between gap-4">
                          <span>Overall fit</span>
                          <span className={`font-semibold ${getScoreColor(scanResult.ats_score)}`}>
                            {scanResult.ats_score >= 80 ? "Ready to tailor" : scanResult.ats_score >= 60 ? "Close with a few fixes" : "Needs more evidence"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-black/[0.08] bg-white p-6 shadow-[0_24px_60px_rgba(26,35,126,0.08)]">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="eyebrow">Keyword map</p>
                          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#1A237E]">
                            Match coverage at a glance
                          </h2>
                        </div>
                        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                          Score locked
                        </div>
                      </div>

                      <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Matched keywords</h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {scanResult.keyword_matches.found.length > 0 ? (
                              scanResult.keyword_matches.found.map((keyword, index) => (
                                <motion.span
                                  key={`${keyword}-${index}`}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, delay: index * 0.04 }}
                                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700"
                                >
                                  {keyword}
                                </motion.span>
                              ))
                            ) : (
                              <span className="text-sm text-slate-500">No direct matches found yet.</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">Missing keywords</h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {scanResult.keyword_matches.missing.length > 0 ? (
                              scanResult.keyword_matches.missing.map((keyword, index) => (
                                <motion.span
                                  key={`${keyword}-${index}`}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  title={`This role signals ${keyword} as important. Add grounded evidence for it if you have it.`}
                                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm text-rose-700"
                                >
                                  {keyword}
                                </motion.span>
                              ))
                            ) : (
                              <span className="text-sm text-slate-500">Great news. No critical gaps were detected.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                    <div className="rounded-[2rem] border border-black/[0.08] bg-white p-6 shadow-[0_24px_60px_rgba(26,35,126,0.08)]">
                      <p className="eyebrow">Section breakdown</p>
                      <div className="mt-5 space-y-4">
                        {Object.entries(scanResult.section_scores).map(([section, score]) => (
                          <div key={section} className="rounded-[1.25rem] border border-black/[0.06] bg-[#F7FAFA] px-4 py-4">
                            <div className="mb-2 flex items-center justify-between gap-4">
                              <span className="capitalize text-[#1A237E]">{section}</span>
                              <span className={`font-semibold ${getScoreColor(score as number)}`}>{score}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-[#D7E7E5]">
                              <div
                                className={`h-2 rounded-full ${getScoreBar(score as number)}`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-black/[0.08] bg-white p-6 shadow-[0_24px_60px_rgba(26,35,126,0.08)]">
                      <p className="eyebrow">Actionable guidance</p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#1A237E]">
                        What to improve before tailoring
                      </h2>
                      {scanResult.recommendations.length > 0 ? (
                        <ul className="mt-5 space-y-3">
                          {scanResult.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-3 rounded-[1.25rem] border border-black/[0.06] bg-[#F7FAFA] px-4 py-4 text-sm leading-7 text-[#4E5B7A]">
                              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#26A69A]/12 text-xs font-semibold text-[#26A69A]">
                                {index + 1}
                              </span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-5 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                          Your profile already looks strong for this role. You can move straight into tailoring.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : !loading && !uploading ? (
                <div className="rounded-[2rem] border border-black/[0.08] bg-white p-6 shadow-[0_24px_60px_rgba(26,35,126,0.08)]">
                  <ScanAnimation stageIndex={0} stages={scanStages} visibleKeywords={visibleKeywords} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
