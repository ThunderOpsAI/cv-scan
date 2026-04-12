"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type { JobRecord } from "@/types/fit";
import type { TailoredBulletItem, TailoredBulletsEvidence } from "@/types/generated-assets";
import { stripFactTagsForExport } from "@/lib/generation/cover-letter-evidence";

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function postExport(
  path: string,
  body: Record<string, string>,
  outName: string
) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Export failed");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = outName;
  a.click();
  URL.revokeObjectURL(url);
}

function TailorInner() {
  const params = useParams();
  const jobId = typeof params.jobId === "string" ? params.jobId : "";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [job, setJob] = useState<JobRecord | null>(null);
  const [loadError, setLoadError] = useState("");
  const [bulletEvidence, setBulletEvidence] = useState<TailoredBulletsEvidence | null>(null);
  const [bulletJson, setBulletJson] = useState<Record<string, unknown> | null>(null);
  const [itemDrafts, setItemDrafts] = useState<Record<string, string>>({});
  const [itemStatus, setItemStatus] = useState<Record<string, "pending" | "accepted" | "rejected">>({});

  const [coverLetter, setCoverLetter] = useState("");
  const [coverEvidence, setCoverEvidence] = useState<Record<string, unknown> | null>(null);

  const [followUpDraft, setFollowUpDraft] = useState("");
  const [appliedAt, setAppliedAt] = useState(() => new Date().toISOString().slice(0, 10));

  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const fromFit = searchParams.get("fromFit") === "1";

  const loadJob = useCallback(async () => {
    if (!jobId) return;
    setLoadError("");
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load job");
      setJob(data.job as JobRecord);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [jobId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      loadJob();
    }
  }, [status, router, loadJob]);

  const runBullets = async () => {
    if (!jobId) return;
    setBusy("bullets");
    setMsg("");
    try {
      const res = await fetch(`/api/jobs/${jobId}/generate/bullets`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      const ev = data.evidence as TailoredBulletsEvidence;
      setBulletEvidence(ev);
      setBulletJson(data.evidence_json as Record<string, unknown>);
      const drafts: Record<string, string> = {};
      const st: Record<string, "pending" | "accepted" | "rejected"> = {};
      ev.items.forEach((i: TailoredBulletItem) => {
        drafts[i.fact_id] = i.tailored;
        st[i.fact_id] = "pending";
      });
      setItemDrafts(drafts);
      setItemStatus(st);
      setMsg(`Bullets ready. Credits: ${data.new_credits ?? "—"}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  };

  const runCover = async () => {
    if (!jobId) return;
    setBusy("cover");
    setMsg("");
    try {
      const res = await fetch(`/api/jobs/${jobId}/generate/cover-letter`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setCoverLetter(data.cover_letter as string);
      setCoverEvidence(data.evidence_json as Record<string, unknown>);
      setMsg(`Cover letter ready. Credits: ${data.new_credits ?? "—"}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  };

  const saveBulletsAsset = async () => {
    if (!jobId || !bulletEvidence) return;
    const lines = bulletEvidence.items
      .filter((i) => itemStatus[i.fact_id] !== "rejected")
      .map((i) => {
        const text = itemDrafts[i.fact_id] ?? i.tailored;
        return itemStatus[i.fact_id] === "accepted" || itemStatus[i.fact_id] === "pending"
          ? `• ${text} [fact:${i.fact_id.slice(0, 8)}]`
          : null;
      })
      .filter(Boolean) as string[];
    if (lines.length === 0) {
      setMsg("Accept or edit at least one bullet before saving.");
      return;
    }
    setBusy("save-bullets");
    try {
      const res = await fetch("/api/generated-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          asset_type: "tailored_bullets",
          content: lines.join("\n"),
          evidence_json: bulletJson || {},
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMsg("Tailored bullets saved to your library.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(null);
    }
  };

  const saveCoverAsset = async () => {
    if (!jobId || !coverLetter.trim()) return;
    setBusy("save-cover");
    try {
      const res = await fetch("/api/generated-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          asset_type: "cover_letter",
          content: coverLetter,
          evidence_json: coverEvidence || {},
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMsg("Cover letter saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(null);
    }
  };

  const runFollowUp = async () => {
    if (!job || !appliedAt) return;
    setBusy("followup");
    setMsg("");
    try {
      const res = await fetch("/api/generate/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: job.title,
          company: job.company,
          applied_at: new Date(appliedAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setFollowUpDraft(data.draft as string);
      setMsg(`Follow-up draft ready. Credits: ${data.new_credits ?? "—"}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  };

  const saveFollowUpAsset = async () => {
    if (!jobId || !followUpDraft.trim()) return;
    setBusy("save-fu");
    try {
      const res = await fetch("/api/generated-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          asset_type: "follow_up",
          content: followUpDraft,
          evidence_json: { applied_at: appliedAt },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMsg("Follow-up draft saved.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(null);
    }
  };

  if (status === "loading" || (status === "authenticated" && !job && !loadError)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center text-white">
        Loading…
      </div>
    );
  }

  if (!session) return null;

  if (loadError || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8 text-white">
        <p>{loadError || "Job not found"}</p>
        <Link href="/dashboard/job-fit" className="text-blue-400 underline mt-4 inline-block">
          Back to job fit
        </Link>
      </div>
    );
  }

  const exportCleanCover = stripFactTagsForExport(coverLetter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <nav className="container mx-auto px-4 py-6 flex flex-wrap justify-between items-center gap-4">
        <Link href="/dashboard" className="text-2xl font-bold text-white">
          <span className="text-indigo-400">CV</span>Scan
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href={`/dashboard/job-fit`} className="text-gray-300 hover:text-white">
            Job fit
          </Link>
          <Link href="/dashboard" className="text-gray-300 hover:text-white">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {fromFit && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-100">
            <strong>Nice work.</strong> Your fit analysis is saved. Tailor your bullets and cover letter below,
            then export or save each asset explicitly.
          </div>
        )}

        <header>
          <h1 className="text-3xl font-bold text-white">Tailor application</h1>
          <p className="text-gray-400 mt-1">
            {job.title} · {job.company}
          </p>
        </header>

        {msg && (
          <div className="rounded-lg border border-white/20 bg-white/5 p-3 text-gray-200 text-sm">{msg}</div>
        )}

        <section className="bg-white/10 border border-white/20 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Tailored bullets</h2>
          <p className="text-gray-400 text-sm">
            Generate from approved facts, then review each line. Edit text, accept or reject, then save — nothing
            is stored until you click Save.
          </p>
          <button
            type="button"
            disabled={!!busy}
            onClick={runBullets}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-500 disabled:opacity-50"
          >
            {busy === "bullets" ? "Generating…" : "Generate tailored bullets (1 credit)"}
          </button>

          {bulletEvidence && bulletEvidence.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-200 border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-2 pr-4">Original (fact)</th>
                    <th className="py-2 pr-4">Tailored</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bulletEvidence.items.map((row) => (
                    <tr key={row.fact_id} className="border-b border-white/10 align-top">
                      <td className="py-3 pr-4 max-w-[200px] text-gray-300">{row.original}</td>
                      <td className="py-3 pr-4">
                        <textarea
                          className="w-full min-h-[72px] bg-slate-950/80 border border-white/20 rounded p-2 text-white text-sm"
                          value={itemDrafts[row.fact_id] ?? row.tailored}
                          onChange={(e) =>
                            setItemDrafts((d) => ({ ...d, [row.fact_id]: e.target.value }))
                          }
                        />
                        {!row.grounded && row.note && (
                          <p className="text-amber-300 text-xs mt-1">Note: {row.note}</p>
                        )}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            className="text-xs text-emerald-400 hover:underline"
                            onClick={() =>
                              setItemStatus((s) => ({ ...s, [row.fact_id]: "accepted" }))
                            }
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="text-xs text-rose-400 hover:underline"
                            onClick={() =>
                              setItemStatus((s) => ({ ...s, [row.fact_id]: "rejected" }))
                            }
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {bulletEvidence && bulletEvidence.ungroundable_notes.length > 0 && (
            <ul className="text-amber-200/90 text-sm list-disc list-inside">
              {bulletEvidence.ungroundable_notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!busy || !bulletEvidence}
              onClick={saveBulletsAsset}
              className="rounded-lg bg-green-700 px-4 py-2 text-white text-sm disabled:opacity-50"
            >
              Save tailored bullets
            </button>
            {bulletEvidence && (
              <button
                type="button"
                onClick={() => {
                  const lines = bulletEvidence.items
                    .filter((i) => itemStatus[i.fact_id] !== "rejected")
                    .map((i) => `• ${itemDrafts[i.fact_id] ?? i.tailored}`);
                  downloadText(`bullets-${job.company.slice(0, 20)}.txt`, lines.join("\n"));
                }}
                className="rounded-lg bg-white/10 px-4 py-2 text-white text-sm"
              >
                Download .txt
              </button>
            )}
          </div>
        </section>

        <section className="bg-white/10 border border-white/20 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Cover letter</h2>
          <button
            type="button"
            disabled={!!busy}
            onClick={runCover}
            className="rounded-lg bg-purple-600 px-4 py-2 text-white font-medium hover:bg-purple-500 disabled:opacity-50"
          >
            {busy === "cover" ? "Generating…" : "Generate cover letter (2 credits)"}
          </button>
          {coverLetter && (
            <>
              <textarea
                className="w-full min-h-[220px] bg-slate-950/80 border border-white/20 rounded p-3 text-white text-sm"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveCoverAsset}
                  disabled={!!busy}
                  className="rounded-lg bg-green-700 px-4 py-2 text-white text-sm"
                >
                  Save cover letter
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadText(`cover-${job.company.slice(0, 20)}.txt`, exportCleanCover)
                  }
                  className="rounded-lg bg-white/10 px-4 py-2 text-white text-sm"
                >
                  Download .txt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(exportCleanCover);
                    setMsg("Cover letter copied to clipboard.");
                  }}
                  className="rounded-lg bg-white/10 px-4 py-2 text-white text-sm"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() =>
                    postExport(
                      "/api/export/pdf",
                      {
                        title: `Cover letter — ${job.title}`,
                        content: exportCleanCover,
                        filename: "cover-letter.pdf",
                      },
                      "cover-letter.pdf"
                    ).catch((e) => setMsg(String(e)))
                  }
                  className="rounded-lg bg-white/10 px-4 py-2 text-white text-sm"
                >
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() =>
                    postExport(
                      "/api/export/docx",
                      {
                        title: `Cover letter — ${job.title}`,
                        content: exportCleanCover,
                        filename: "cover-letter.docx",
                      },
                      "cover-letter.docx"
                    ).catch((e) => setMsg(String(e)))
                  }
                  className="rounded-lg bg-white/10 px-4 py-2 text-white text-sm"
                >
                  Download DOCX
                </button>
              </div>
            </>
          )}
        </section>

        <section className="bg-white/10 border border-white/20 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Follow-up email draft</h2>
          <label className="block text-gray-400 text-sm">Date applied</label>
          <input
            type="date"
            className="bg-slate-950 border border-white/20 rounded px-3 py-2 text-white"
            value={appliedAt}
            onChange={(e) => setAppliedAt(e.target.value)}
          />
          <button
            type="button"
            disabled={!!busy}
            onClick={runFollowUp}
            className="rounded-lg bg-amber-600 px-4 py-2 text-white font-medium disabled:opacity-50"
          >
            {busy === "followup" ? "Generating…" : "Generate follow-up draft (1 credit)"}
          </button>
          {followUpDraft && (
            <>
              <textarea
                className="w-full min-h-[160px] bg-slate-950/80 border border-white/20 rounded p-3 text-white text-sm"
                value={followUpDraft}
                onChange={(e) => setFollowUpDraft(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveFollowUpAsset}
                  className="rounded-lg bg-green-700 px-4 py-2 text-white text-sm"
                >
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(followUpDraft);
                    setMsg("Copied to clipboard.");
                  }}
                  className="rounded-lg bg-white/10 px-4 py-2 text-white text-sm"
                >
                  Copy
                </button>
              </div>
            </>
          )}
        </section>

        <section className="bg-white/5 border border-white/15 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Application pack</h2>
          <p className="text-gray-400 text-sm mb-3">
            Zip: job description plus any assets you saved for this job from this page.
          </p>
          <button
            type="button"
            onClick={() =>
              postExport(
                "/api/export/pack",
                { job_id: jobId },
                `pack-${job.company}.zip`
              ).catch((e) => setMsg(String(e)))
            }
            className="rounded-lg bg-slate-700 px-4 py-2 text-white text-sm"
          >
            Download .zip pack
          </button>
        </section>
      </main>
    </div>
  );
}

export default function TailorJobPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
          Loading…
        </div>
      }
    >
      <TailorInner />
    </Suspense>
  );
}
