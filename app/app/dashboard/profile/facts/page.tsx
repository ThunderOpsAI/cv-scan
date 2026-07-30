"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { CandidateProfileFact, ProfileFact, ProfileFactType } from "@/types/profile";

type ReviewStatus = "pending" | "approved" | "rejected";
type ReviewFact = CandidateProfileFact & { status: ReviewStatus };

const FACT_TYPES: ProfileFactType[] = [
  "work_history",
  "education",
  "skill",
  "achievement",
  "metric",
  "goal",
];

const FACT_TYPE_LABELS: Record<ProfileFactType, string> = {
  work_history: "Work history",
  education: "Education",
  skill: "Skill",
  achievement: "Achievement",
  metric: "Metric",
  goal: "Goal",
};

const SOURCE_LABELS: Record<ProfileFact["source"], string> = {
  manual: "Manual",
  extracted: "From resume",
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ProfileFactsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [label, setLabel] = useState("");
  const [reviewFacts, setReviewFacts] = useState<ReviewFact[]>([]);
  const [memoryFacts, setMemoryFacts] = useState<ProfileFact[]>([]);
  const [loadingFacts, setLoadingFacts] = useState(true);
  const [importing, setImporting] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manualType, setManualType] = useState<ProfileFactType>("skill");
  const [manualText, setManualText] = useState("");
  const [addingManual, setAddingManual] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<ProfileFactType>("skill");
  const [editText, setEditText] = useState("");
  const [editApproved, setEditApproved] = useState(true);
  const [savingEditId, setSavingEditId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const approvedCount = useMemo(
    () => reviewFacts.filter((fact) => fact.status === "approved").length,
    [reviewFacts]
  );

  const fetchMemoryFacts = useCallback(async () => {
    if (status !== "authenticated") {
      return;
    }

    setLoadingFacts(true);
    try {
      const res = await fetch("/api/profile/facts?scope=all");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load profile facts");
      }

      setMemoryFacts(data.facts || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load profile facts"));
    } finally {
      setLoadingFacts(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchMemoryFacts();
    }
  }, [fetchMemoryFacts, router, status]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError("");
    setMessage("");
    setOcrLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/resume-upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not read that file");
      }

      setResumeText(data.text || "");
      setLabel((current) => current || data.label || file.name.replace(/\.[^.]+$/, ""));
      setMessage("Resume text extracted. Review it below before extracting facts.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not read that file. Upload a TXT, PDF, or DOCX resume, or paste the text instead."));
    } finally {
      setOcrLoading(false);
      event.target.value = "";
    }
  };

  const handleResumeImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError("");
    setMessage("");
    setOcrLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/ocr", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not read that image");
      }

      setResumeText(data.text || "");
      if (!label) {
        setLabel(file.name.replace(/\.[^.]+$/, ""));
      }
      setMessage("Resume text extracted. Review it below before extracting facts.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not read that image. Try a clearer photo or paste the resume text."));
    } finally {
      setOcrLoading(false);
      event.target.value = "";
    }
  };

  const importResume = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (resumeText.trim().length < 50) {
      setError("Paste or upload at least 50 characters of resume content.");
      return;
    }

    setImporting(true);
    try {
      const res = await fetch("/api/profile/resume-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_content: resumeText,
          label: label || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import resume");
      }

      const candidates = (data.candidate_facts || []) as CandidateProfileFact[];
      setReviewFacts(candidates.map((fact) => ({ ...fact, status: "pending" })));
      setMessage(
        candidates.length > 0
          ? data.review_message || "Review extracted facts before saving."
          : "Resume saved, but no facts were extracted. Add clearer resume text and try again."
      );
    } catch (err) {
      setError(getErrorMessage(err, "Failed to import resume"));
    } finally {
      setImporting(false);
    }
  };

  const updateReviewFact = (
    tempId: string,
    changes: Partial<Pick<ReviewFact, "fact_text" | "fact_type" | "status">>
  ) => {
    setReviewFacts((current) =>
      current.map((fact) => (fact.temp_id === tempId ? { ...fact, ...changes } : fact))
    );
  };

  const addManualFact = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const text = manualText.trim();
    if (text.length < 3) {
      setError("Enter at least 3 characters for the fact.");
      return;
    }

    setAddingManual(true);
    try {
      const res = await fetch("/api/profile/facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facts: [{ fact_type: manualType, fact_text: text, source: "manual" as const }],
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add fact");
      }

      setManualText("");
      setMessage(data.message || "Fact added to career memory.");
      await fetchMemoryFacts();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add fact"));
    } finally {
      setAddingManual(false);
    }
  };

  const startEdit = (fact: ProfileFact) => {
    setError("");
    setMessage("");
    setEditingId(fact.fact_id);
    setEditType(fact.fact_type);
    setEditText(fact.fact_text);
    setEditApproved(fact.is_approved);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (factId: string) => {
    setError("");
    setMessage("");
    setSavingEditId(factId);
    try {
      const res = await fetch(`/api/profile/facts/${factId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fact_type: editType,
          fact_text: editText,
          is_approved: editApproved,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update fact");
      }

      setEditingId(null);
      setMessage("Fact updated.");
      await fetchMemoryFacts();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update fact"));
    } finally {
      setSavingEditId(null);
    }
  };

  const toggleFactApproved = async (fact: ProfileFact) => {
    setError("");
    setMessage("");
    setSavingEditId(fact.fact_id);
    try {
      const res = await fetch(`/api/profile/facts/${fact.fact_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: !fact.is_approved }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update fact");
      }

      setMessage(!fact.is_approved ? "Fact is used in generation again." : "Fact paused — not used in generation.");
      await fetchMemoryFacts();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update fact"));
    } finally {
      setSavingEditId(null);
    }
  };

  const deleteFact = async (factId: string) => {
    if (!window.confirm("Delete this fact permanently? This cannot be undone.")) {
      return;
    }
    setError("");
    setMessage("");
    setDeletingId(factId);
    try {
      const res = await fetch(`/api/profile/facts/${factId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete fact");
      }

      if (editingId === factId) {
        setEditingId(null);
      }
      setMessage("Fact deleted.");
      await fetchMemoryFacts();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete fact"));
    } finally {
      setDeletingId(null);
    }
  };

  const saveApprovedFacts = async () => {
    setError("");
    setMessage("");

    const facts = reviewFacts
      .filter((fact) => fact.status === "approved")
      .map((fact) => ({
        fact_type: fact.fact_type,
        fact_text: fact.fact_text,
        source: "extracted" as const,
      }));

    if (facts.length === 0) {
      setError("Approve at least one fact before saving to career memory.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile/facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facts }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save approved facts");
      }

      await fetchMemoryFacts();
      setReviewFacts((current) => current.filter((fact) => fact.status !== "approved"));
      setMessage(data.message || "Approved facts saved to career memory.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save approved facts"));
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loadingFacts) {
    return (
      <div className=" flex items-center justify-center">
        <div className="text-[#1A237E] text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-[#1A237E]">
          <span className="text-[#26A69A]">CV</span>Scan
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/profile" className="text-[#607086] hover:text-[#1A237E]">
            Profile
          </Link>
          <Link href="/dashboard" className="text-[#607086] hover:text-[#1A237E]">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <header>
            <p className="text-[#26A69A] text-sm font-semibold uppercase tracking-wide">
              Approved facts only
            </p>
            <h1 className="text-4xl font-bold text-[#1A237E] mt-2">Career Memory</h1>
            <p className="text-[#607086] mt-3 max-w-3xl">
              Import a resume, review the extracted facts, and approve only what is accurate.
              Not approved means not saved and not used by generation.
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

          <section className="grid lg:grid-cols-3 gap-8">
            <form onSubmit={importResume} className="lg:col-span-2 space-y-5">
              <div className="bg-white/60 backdrop-blur-lg rounded-lg p-6 border border-black/[0.06]">
                <label htmlFor="resume-label" className="block text-[#1A237E] font-semibold mb-2">
                  Resume label
                </label>
                <input
                  id="resume-label"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Base resume, April 2026"
                  className="w-full bg-white/40 border border-black/[0.06] rounded-lg p-3 text-[#1A237E] placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  disabled={importing}
                />
              </div>

              <div className="bg-white/60 backdrop-blur-lg rounded-lg p-6 border border-black/[0.06]">
                <label htmlFor="resume-upload" className="block text-[#1A237E] font-semibold mb-2">
                  Upload resume text
                </label>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".txt,.md,.rtf,.csv,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-[#607086] file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1A237E] hover:file:bg-blue-700"
                  disabled={importing}
                />
                <p className="text-[#607086]/80 text-sm mt-2">
                  Upload TXT, PDF, or DOCX resumes. Paste the resume text below if the extracted text looks wrong.
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-lg rounded-lg p-6 border border-black/[0.06]">
                <label htmlFor="resume-image-upload" className="block text-[#1A237E] font-semibold mb-2">
                  Photo or screenshot of resume
                </label>
                <input
                  id="resume-image-upload"
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  capture="environment"
                  onChange={handleResumeImageUpload}
                  className="block w-full text-sm text-[#607086] file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1A237E] hover:file:bg-blue-700"
                  disabled={importing || ocrLoading}
                />
                <p className="text-[#607086]/80 text-sm mt-2">
                  Take a clear photo or upload a screenshot. AI CV Scan will read it and fill the resume content box for review.
                </p>
                {ocrLoading && (
                  <p className="text-[#26A69A] text-sm mt-3">Reading resume image...</p>
                )}
              </div>

              <div className="bg-white/60 backdrop-blur-lg rounded-lg p-6 border border-black/[0.06]">
                <label htmlFor="resume-content" className="block text-[#1A237E] font-semibold mb-2">
                  Resume content
                </label>
                <textarea
                  id="resume-content"
                  value={resumeText}
                  onChange={(event) => setResumeText(event.target.value)}
                  placeholder="Paste your resume text here..."
                  className="min-h-[260px] w-full bg-white/40 border border-black/[0.06] rounded-lg p-4 text-[#1A237E] placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  disabled={importing}
                />
                <button
                  type="submit"
                  disabled={importing || resumeText.trim().length < 50}
                  className="mt-5 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-[#1A237E] transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {importing ? "Extracting facts..." : "Extract facts for review"}
                </button>
              </div>
            </form>

            <aside className="bg-white/40 backdrop-blur-lg rounded-lg p-6 border border-black/[0.06] h-fit">
              <h2 className="text-xl font-bold text-[#1A237E] mb-3">How it works</h2>
              <ul className="text-[#607086]/80 text-sm space-y-3 list-disc list-inside">
                <li>Only facts marked for generation power tailoring and ATS scans.</li>
                <li>Add facts manually anytime — you are responsible for accuracy.</li>
                <li>Pause a fact to keep it on file but exclude it from generation.</li>
              </ul>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-gray-500 text-xs uppercase tracking-wide">Active in generation</p>
                <p className="text-2xl font-bold text-[#1A237E] mt-1">
                  {memoryFacts.filter((f) => f.is_approved).length}
                </p>
              </div>
            </aside>
          </section>

          <section className="bg-white/60 backdrop-blur-lg rounded-lg p-6 border border-black/[0.06]">
            <h2 className="text-2xl font-bold text-[#1A237E]">Manage saved facts</h2>
            <p className="text-[#607086]/80 mt-2 max-w-3xl">
              Add, edit, pause, or delete facts at any time. Paused facts stay in your list but are not used by
              generation.
            </p>

            <form
              onSubmit={addManualFact}
              className="mt-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end"
            >
              <div className="w-full md:w-52">
                <label htmlFor="manual-fact-type" className="block text-[#1A237E] text-sm font-semibold mb-2">
                  Type
                </label>
                <select
                  id="manual-fact-type"
                  value={manualType}
                  onChange={(event) => setManualType(event.target.value as ProfileFactType)}
                  className="w-full rounded-lg border border-black/[0.06] bg-slate-950 p-3 text-[#1A237E] focus:border-blue-500 focus:outline-none"
                  disabled={addingManual}
                >
                  {FACT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {FACT_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="manual-fact-text" className="block text-[#1A237E] text-sm font-semibold mb-2">
                  Fact text
                </label>
                <textarea
                  id="manual-fact-text"
                  value={manualText}
                  onChange={(event) => setManualText(event.target.value)}
                  placeholder="e.g. Led a team of five engineers on the payments migration."
                  className="min-h-[88px] w-full rounded-lg border border-black/[0.06] bg-slate-950 p-3 text-[#1A237E] placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  disabled={addingManual}
                />
              </div>
              <button
                type="submit"
                disabled={addingManual || manualText.trim().length < 3}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-[#1A237E] transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:shrink-0"
              >
                {addingManual ? "Adding..." : "Add fact"}
              </button>
            </form>

            <div className="mt-8 space-y-4">
              {memoryFacts.length === 0 ? (
                <p className="text-gray-500 text-sm">No saved facts yet. Import a resume or add a fact above.</p>
              ) : (
                memoryFacts.map((fact) => (
                  <div
                    key={fact.fact_id}
                    className={`rounded-lg border p-4 ${
                      fact.is_approved ? "border-green-500/40 bg-green-500/5" : "border-white/15 bg-white/40 opacity-90"
                    }`}
                  >
                    {editingId === fact.fact_id ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                          <div>
                            <label className="block text-[#1A237E] text-sm font-semibold mb-2">Fact type</label>
                            <select
                              value={editType}
                              onChange={(event) => setEditType(event.target.value as ProfileFactType)}
                              className="w-full rounded-lg border border-black/[0.06] bg-slate-950 p-3 text-[#1A237E] focus:border-blue-500 focus:outline-none"
                            >
                              {FACT_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {FACT_TYPE_LABELS[type]}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[#1A237E] text-sm font-semibold mb-2">Fact text</label>
                            <textarea
                              value={editText}
                              onChange={(event) => setEditText(event.target.value)}
                              className="min-h-[100px] w-full rounded-lg border border-black/[0.06] bg-slate-950 p-3 text-[#1A237E] focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-gray-200 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editApproved}
                            onChange={(event) => setEditApproved(event.target.checked)}
                            className="rounded border-white/30 bg-slate-950"
                          />
                          Use this fact in generation
                        </label>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => saveEdit(fact.fact_id)}
                            disabled={savingEditId === fact.fact_id || editText.trim().length < 3}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-[#1A237E] hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingEditId === fact.fact_id ? "Saving..." : "Save changes"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-lg bg-white/60 px-4 py-2 text-sm font-semibold text-[#1A237E] hover:bg-white/20"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[#26A69A] text-xs font-semibold uppercase">
                            {FACT_TYPE_LABELS[fact.fact_type]}
                          </span>
                          <span className="text-gray-500 text-xs">·</span>
                          <span className="text-[#607086]/80 text-xs">{SOURCE_LABELS[fact.source]}</span>
                          <span
                            className={`ml-auto text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                              fact.is_approved
                                ? "bg-green-500/20 text-green-200"
                                : "bg-gray-600/40 text-[#607086]"
                            }`}
                          >
                            {fact.is_approved ? "Active" : "Paused"}
                          </span>
                        </div>
                        <p className="text-gray-100 text-sm mt-2 whitespace-pre-wrap">{fact.fact_text}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(fact)}
                            className="rounded-lg bg-white/60 px-4 py-2 text-sm font-semibold text-[#1A237E] hover:bg-white/20"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFactApproved(fact)}
                            disabled={savingEditId === fact.fact_id || deletingId === fact.fact_id}
                            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-[#1A237E] hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingEditId === fact.fact_id
                              ? "Updating..."
                              : fact.is_approved
                                ? "Pause from generation"
                                : "Use in generation"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteFact(fact.fact_id)}
                            disabled={deletingId === fact.fact_id || savingEditId === fact.fact_id}
                            className="rounded-lg bg-red-900/50 px-4 py-2 text-sm font-semibold text-red-100 hover:bg-red-900/70 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === fact.fact_id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {reviewFacts.length > 0 && (
            <section className="bg-white/60 backdrop-blur-lg rounded-lg p-6 border border-black/[0.06]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A237E]">Review extracted facts</h2>
                  <p className="text-[#607086]/80 mt-1">
                    Edit the text if needed, approve accurate facts, and reject anything that should not be saved.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={saveApprovedFacts}
                  disabled={saving || approvedCount === 0}
                  className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-[#1A237E] transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : `Save ${approvedCount} approved`}
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {reviewFacts.map((fact) => (
                  <div
                    key={fact.temp_id}
                    className={`rounded-lg border p-4 ${
                      fact.status === "approved"
                        ? "border-green-500/50 bg-green-500/10"
                        : fact.status === "rejected"
                          ? "border-gray-600 bg-white/40 opacity-70"
                          : "border-black/[0.06] bg-white/40"
                    }`}
                  >
                    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                      <div>
                        <label className="block text-[#1A237E] text-sm font-semibold mb-2">
                          Fact type
                        </label>
                        <select
                          value={fact.fact_type}
                          onChange={(event) =>
                            updateReviewFact(fact.temp_id, {
                              fact_type: event.target.value as ProfileFactType,
                              status: "pending",
                            })
                          }
                          className="w-full rounded-lg border border-black/[0.06] bg-slate-950 p-3 text-[#1A237E] focus:border-blue-500 focus:outline-none"
                        >
                          {FACT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {FACT_TYPE_LABELS[type]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[#1A237E] text-sm font-semibold mb-2">
                          Fact text
                        </label>
                        <textarea
                          value={fact.fact_text}
                          onChange={(event) =>
                            updateReviewFact(fact.temp_id, {
                              fact_text: event.target.value,
                              status: "pending",
                            })
                          }
                          className="min-h-[88px] w-full rounded-lg border border-black/[0.06] bg-slate-950 p-3 text-[#1A237E] focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => updateReviewFact(fact.temp_id, { status: "approved" })}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-[#1A237E] hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateReviewFact(fact.temp_id, { status: "pending" })}
                        className="rounded-lg bg-white/60 px-4 py-2 text-sm font-semibold text-[#1A237E] hover:bg-white/20"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => updateReviewFact(fact.temp_id, { status: "rejected" })}
                        className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-[#1A237E] hover:bg-gray-600"
                      >
                        Reject
                      </button>
                      <span className="self-center text-sm text-[#607086]">
                        Status: {fact.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
