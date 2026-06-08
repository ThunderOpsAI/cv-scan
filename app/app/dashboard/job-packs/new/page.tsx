"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { JobPackResponse } from "@/types/job-packs";

type ApiErrorResponse = { error?: string };
type JobAdOcrResponse = ApiErrorResponse & {
  text?: string;
  parsed?: {
    title?: string;
    company?: string;
  };
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function NewJobPackContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const jd = searchParams.get("jd");
    const t = searchParams.get("title");
    const c = searchParams.get("company");
    if (jd) {
      setJobDescription(decodeURIComponent(jd));
    }
    if (t) {
      setJobTitle(decodeURIComponent(t));
    }
    if (c) {
      setCompany(decodeURIComponent(c));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobTitle.trim() || !company.trim() || !jobDescription.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate progress steps
    const steps = [
      "Analyzing job description...",
      "Tailoring your resume...",
      "Generating cover letter...",
      "Running ATS scan...",
      "Checking cultural fit...",
    ];

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setLoadingStep(steps[stepIndex]);
        stepIndex++;
      }
    }, 2000);

    try {
      const res = await fetch("/api/job-packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: jobTitle,
          company,
          job_description: jobDescription,
        }),
      });

      clearInterval(stepInterval);
      const data = (await res.json()) as JobPackResponse & ApiErrorResponse;

      if (!res.ok) {
        throw new Error(data.error || "Failed to create job pack");
      }

      // Redirect to the job pack detail page
      router.push(`/dashboard/job-packs/${data.job_pack.id}`);
    } catch (err) {
      clearInterval(stepInterval);
      setError(getErrorMessage(err, "Failed to create job pack"));
      setLoading(false);
    }
  };

  const handleJobAdImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError("");
    setOcrLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/jobs/ocr", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as JobAdOcrResponse;

      if (!res.ok) {
        throw new Error(data.error || "Could not read that screenshot");
      }

      setJobDescription(data.text || "");
      if (!jobTitle && data.parsed?.title) {
        setJobTitle(data.parsed.title);
      }
      if (!company && data.parsed?.company) {
        setCompany(data.parsed.company);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Could not read that screenshot. Try a clearer image or paste the job ad."));
    } finally {
      setOcrLoading(false);
      event.target.value = "";
    }
  };

  if (status === "loading") {
    return (
      <div className=" flex items-center justify-center">
        <div className="text-[#1A237E] text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="">


      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1A237E] mb-2">Create Job Pack</h1>
            <p className="text-[#607086]/80">
              Generate a tailored resume, cover letter, and ATS analysis
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-black/[0.06] mb-8">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
                <h3 className="text-xl font-bold text-[#1A237E] mb-2">Creating Your Job Pack</h3>
                <p className="text-[#26A69A] animate-pulse">{loadingStep}</p>
              </div>
            </div>
          )}

          {/* Form */}
          {!loading && (
            <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-black/[0.06]">
              <div className="space-y-6">
                <div>
                  <label className="block text-[#1A237E] font-semibold mb-2">
                    Upload job ad screenshot
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleJobAdImageUpload}
                    disabled={ocrLoading}
                    className="block w-full text-sm text-[#607086] file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1A237E] hover:file:bg-blue-700 disabled:opacity-60"
                  />
                  <p className="mt-2 text-sm text-[#607086]/80">
                    Take a clear screenshot or photo. CVScan will fill the fields below for review.
                  </p>
                  {ocrLoading && (
                    <p className="mt-2 text-sm text-[#26A69A]">Reading job ad screenshot...</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#1A237E] font-semibold mb-2">Job Title *</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Product Manager"
                    className="w-full px-4 py-3 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    data-testid="job-title-input"
                  />
                </div>

                <div>
                  <label className="block text-[#1A237E] font-semibold mb-2">Company *</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Stripe"
                    className="w-full px-4 py-3 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    data-testid="company-input"
                  />
                </div>

                <div>
                  <label className="block text-[#1A237E] font-semibold mb-2">Job Description *</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={12}
                    placeholder="Paste the full job description here..."
                    className="w-full px-4 py-3 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                    data-testid="job-description-input"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-[#1A237E] font-semibold mb-2">What you'll get:</h4>
                  <ul className="text-[#607086] space-y-1 text-sm">
                    <li>✓ Tailored resume optimized for this role</li>
                    <li>✓ Custom cover letter</li>
                    <li>✓ ATS compatibility score</li>
                    <li>✓ Keyword analysis (matched & missing)</li>
                    <li>✓ Cultural fit warnings</li>
                    <li>✓ Export to PDF or DOCX</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={ocrLoading}
                  className="w-full bg-[#26A69A] hover:bg-[#168579] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-all"
                  data-testid="create-job-pack-submit"
                >
                  Generate Job Pack
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewJobPackPage() {
  return (
    <Suspense fallback={
      <div className=" flex items-center justify-center">
        <div className="text-[#1A237E] text-xl">Loading...</div>
      </div>
    }>
      <NewJobPackContent />
    </Suspense>
  );
}
