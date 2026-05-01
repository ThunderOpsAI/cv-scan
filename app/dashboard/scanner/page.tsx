"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ATSScan, ATSScanResponse } from "@/types/job-packs";
import { ScannerPageSkeleton } from "@/components/ui/dashboard-skeletons";
import { APP_NAME, brandWordmark } from "@/lib/branding";

type CaptureState = "idle" | "camera" | "processing";

const brand = brandWordmark();

export default function ScannerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [freeScansRemaining, setFreeScansRemaining] = useState<number | null>(null);
  const [scanResult, setScanResult] = useState<ATSScan | null>(null);
  const [error, setError] = useState("");
  const [captureError, setCaptureError] = useState("");
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchFreeScans();
    }
  }, [status, router]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const hasCameraSupport = useMemo(
    () => typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia),
    []
  );

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
      setError("Paste or capture a job description first.");
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

      const data: ATSScanResponse & { error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Scan failed");
      }

      setScanResult(data.scan);
      setFreeScansRemaining(data.free_scans_remaining);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCaptureState("idle");
  };

  const startCamera = async () => {
    setCaptureError("");

    if (!hasCameraSupport) {
      fileInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1600 },
          height: { ideal: 1200 },
        },
      });

      streamRef.current = stream;
      setCaptureState("camera");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      const message =
        err?.name === "NotAllowedError"
          ? "Camera access was blocked. You can allow permission and try again, or upload a screenshot instead."
          : err?.name === "NotFoundError"
            ? "No camera was found on this device. Upload a screenshot or photo instead."
            : "We couldn't open the camera on this device. Upload a screenshot or photo instead.";

      setCaptureError(message);
      fileInputRef.current?.click();
    }
  };

  const downscaleImage = (image: HTMLImageElement, mimeType: string) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error("Canvas is not available.");
    }

    const maxWidth = 1600;
    const scale = Math.min(1, maxWidth / image.width);
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas context is not available.");
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(mimeType, 0.9);
  };

  const extractTextFromDataUrl = async (dataUrl: string) => {
    setCaptureState("processing");
    setCaptureError("");
    setError("");

    const [header, base64] = dataUrl.split(",");
    const mimeTypeMatch = /data:(.*);base64/.exec(header);
    const mimeType = mimeTypeMatch?.[1] || "image/jpeg";

    try {
      const response = await fetch("/api/ats/extract-job-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract text from image.");
      }

      setJobDescription(data.text);
      stopCamera();
    } catch (err: any) {
      setCaptureError(err.message);
      stopCamera();
    }
  };

  const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setCaptureError("Please choose an image file.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(objectUrl);

    const reader = new FileReader();

    reader.onload = async () => {
      const image = new Image();
      image.onload = async () => {
        const dataUrl = downscaleImage(image, file.type || "image/jpeg");
        await extractTextFromDataUrl(dataUrl);
      };
      image.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  };

  const captureFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setCaptureError("Camera preview is not ready yet.");
      return;
    }

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 960;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      setCaptureError("Camera capture is unavailable.");
      return;
    }

    context.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(dataUrl);
    await extractTextFromDataUrl(dataUrl);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  if (status === "loading") {
    return <ScannerPageSkeleton />;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-5">
        <Link href="/dashboard" className="text-xl font-semibold tracking-tight text-white">
          <span className="text-cyan-300">{brand.leading}</span>
          {brand.trailing}
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-slate-300 transition-colors hover:text-white">
            Dashboard
          </Link>
          <div className="text-white">
            <span className="text-slate-400">Credits:</span>{" "}
            <span className="font-semibold text-cyan-300">{session.user.credits}</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pb-12 pt-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-white">ATS Scanner</h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Paste the role, upload a screenshot, or capture it with your camera. {APP_NAME} will extract the text
              and score it against your saved profile.
            </p>
            {freeScansRemaining !== null && (
              <p className="text-sm text-cyan-300">
                {freeScansRemaining > 0
                  ? `${freeScansRemaining} free scans remaining today`
                  : "Free scans used. Each additional scan costs 1 credit."}
              </p>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-3xl border border-white/10 bg-white/6 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={startCamera}
                  className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  {hasCameraSupport ? "Open Camera" : "Take Photo"}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border border-white/15 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
                >
                  Upload Image
                </button>
                <span className="text-xs text-slate-400">
                  Mobile camera fallback is available through the file picker if direct camera access is blocked.
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelection}
                className="hidden"
              />
              <canvas ref={canvasRef} className="hidden" />

              {captureState === "camera" && (
                <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
                  <video ref={videoRef} playsInline muted className="aspect-[4/3] w-full object-cover" />
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <p className="text-sm text-slate-300">
                      Frame the full job description, then capture a still image for OCR.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={captureFrame}
                        className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                      >
                        Capture
                      </button>
                      <button
                        onClick={stopCamera}
                        className="rounded-full border border-white/15 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {previewUrl && captureState !== "camera" && (
                <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
                  <img src={previewUrl} alt="Captured job description preview" className="max-h-64 w-full object-cover" />
                </div>
              )}

              {captureError && <p className="mb-4 text-sm text-rose-300">{captureError}</p>}

              <label className="mb-2 block text-sm font-semibold text-white">Job description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={14}
                placeholder="Paste a role description here, or extract it from a screenshot/photo."
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                data-testid="job-description-input"
              />

              {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleScan}
                  disabled={loading || captureState === "processing"}
                  className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-900 disabled:text-slate-300"
                  data-testid="scan-button"
                >
                  {loading ? "Scanning..." : captureState === "processing" ? "Extracting text..." : "Scan Match"}
                </button>
                {scanResult && (
                  <Link
                    href={`/dashboard/job-packs/new?jd=${encodeURIComponent(jobDescription.slice(0, 2000))}`}
                    className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                    data-testid="create-job-pack-btn"
                  >
                    Create Job Pack
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
              <h2 className="text-base font-semibold text-white">Capture tips</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>Use good lighting and keep the entire role description inside the frame.</li>
                <li>On desktop, screenshots usually extract more accurately than angled photos.</li>
                <li>If camera permission is denied, the upload flow is the built-in fallback.</li>
                <li>Review the extracted text before scanning so the ATS score reflects the real role.</li>
              </ul>
            </div>
          </div>

          {scanResult && (
            <div className="space-y-5" data-testid="scan-results">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">ATS Match Score</h2>
                    <p className="text-sm text-slate-400">Scored against your current saved profile.</p>
                  </div>
                  <div className="relative h-28 w-28">
                    <svg className="h-full w-full -rotate-90 transform">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-slate-700"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(scanResult.ats_score / 100) * 301.6} 301.6`}
                        className={getScoreBg(scanResult.ats_score)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-3xl font-semibold ${getScoreColor(scanResult.ats_score)}`}>
                        {scanResult.ats_score}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur">
                  <h2 className="text-lg font-semibold text-white">Matched keywords</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {scanResult.keyword_matches.found.length > 0 ? (
                      scanResult.keyword_matches.found.map((keyword, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300"
                        >
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">No matches found yet.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur">
                  <h2 className="text-lg font-semibold text-white">Missing keywords</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {scanResult.keyword_matches.missing.length > 0 ? (
                      scanResult.keyword_matches.missing.map((keyword, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-300"
                        >
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">No critical gaps detected.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur">
                <h2 className="text-lg font-semibold text-white">Section breakdown</h2>
                <div className="mt-5 space-y-4">
                  {Object.entries(scanResult.section_scores).map(([section, score]) => (
                    <div key={section}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="capitalize text-slate-300">{section}</span>
                        <span className={getScoreColor(score as number)}>{score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800">
                        <div
                          className={`h-2 rounded-full ${getScoreBg(score as number)}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur">
                <h2 className="text-lg font-semibold text-white">Recommendations</h2>
                {scanResult.recommendations.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {scanResult.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-slate-300">
                        <span className="mt-1 text-cyan-300">•</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">Your profile already looks strong for this role.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
