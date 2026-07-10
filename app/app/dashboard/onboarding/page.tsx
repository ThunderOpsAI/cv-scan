"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const PATHS = [
  { id: "new_grad", label: "New grad" },
  { id: "career_switcher", label: "Career switcher" },
  { id: "employed", label: "Currently employed" },
  { id: "laid_off", label: "Between roles / laid off" },
  { id: "international", label: "International candidate" },
] as const;

const STEP_COUNT = 5;

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [careerPath, setCareerPath] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=%2Fdashboard%2Fonboarding");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        const res = await fetch("/api/onboarding");
        const data = await res.json();
        if (res.ok && data.onboarding_completed_at) {
          setFinished(true);
        }
        if (data.career_path) setCareerPath(data.career_path);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  const savePath = async () => {
    if (!careerPath) {
      setMsg("Pick one option or skip with the button below.");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career_path: careerPath }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      setStep(3);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const markComplete = async () => {
    setSaving(true);
    try {
      await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_complete: true }),
      });
      setFinished(true);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#E0F2F1] flex items-center justify-center text-[#1A237E]">
        Loading…
      </div>
    );
  }

  if (!session) return null;

  const pct = Math.round(((Math.min(step, STEP_COUNT - 1) + 1) / STEP_COUNT) * 100);

  if (finished) {
    return (
      <div className="min-h-screen bg-[#E0F2F1] flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-3xl font-bold text-[#1A237E]">You&apos;re set</h1>
          <p className="text-[#4E5B7A]">
            Run <strong className="text-[#1A237E]">Job fit</strong>, then open <strong className="text-[#1A237E]">Tailor</strong>{" "}
            to generate grounded bullets and cover letters. Everything stays review-first.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-lg bg-[#26A69A] px-8 py-3 font-semibold text-white shadow-sm transition hover:bg-[#1f8f85]"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0F2F1]">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-[#1A237E]">
          <span className="text-[#26A69A]">CV</span>Scan
        </Link>
        <Link href="/dashboard" className="text-[#4E5B7A] hover:text-[#1A237E] text-sm">
          Skip to dashboard
        </Link>
      </nav>

      <main className="container mx-auto px-4 py-10 max-w-lg">
        <div className="mb-8">
          <div className="h-2 bg-[#B2DFDB] rounded-full overflow-hidden">
            <div className="h-full bg-[#26A69A] transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[#4E5B7A] text-xs mt-2">
            Step {step + 1} of {STEP_COUNT}
          </p>
        </div>

        <div className="rounded-2xl border border-black/[0.08] bg-white p-8 space-y-6 shadow-[0_18px_48px_rgba(26,35,126,0.08)]">
          {step === 0 && (
            <>
              <h1 className="text-2xl font-bold text-[#1A237E]">Welcome</h1>
              <p className="text-[#4E5B7A]">
                A short setup puts you on the path: career memory → your context → first job fit. You can skip any
                step.
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full rounded-lg bg-[#26A69A] py-3 font-semibold text-white transition hover:bg-[#1f8f85]"
              >
                Continue
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-[#1A237E]">Career memory</h1>
              <p className="text-[#4E5B7A]">
                Import a resume and approve facts. Tailoring and fit only use what you approve.
              </p>
              <Link
                href="/dashboard/scanner"
                className="block text-center rounded-lg border border-[#26A69A]/30 bg-[#26A69A]/10 py-3 font-semibold text-[#1A237E] transition hover:bg-[#26A69A]/15"
              >
                Scan resume
              </Link>
              <Link
                href="/dashboard/profile/facts"
                className="block text-center rounded-lg bg-[#26A69A] py-3 font-semibold text-white transition hover:bg-[#1f8f85]"
              >
                Open Career Memory
              </Link>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full rounded-lg border border-black/[0.08] bg-[#F7FAFA] py-3 font-semibold text-[#1A237E] transition hover:bg-[#EEF7F6]"
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-[#1A237E]">Your path</h1>
              <p className="text-[#4E5B7A] text-sm">Stored on your account for future prompt tuning.</p>
              {msg && <p className="text-amber-700 text-sm">{msg}</p>}
              <div className="space-y-2">
                {PATHS.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer ${
                      careerPath === p.id
                        ? "border-[#26A69A] bg-[#26A69A]/10"
                        : "border-black/[0.08] bg-[#F7FAFA]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="path"
                      checked={careerPath === p.id}
                      onChange={() => setCareerPath(p.id)}
                      className="accent-[#26A69A]"
                    />
                    <span className="text-[#1A237E]">{p.label}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={savePath}
                className="w-full rounded-lg bg-[#26A69A] py-3 font-semibold text-white transition hover:bg-[#1f8f85] disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save and continue"}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full text-sm text-[#4E5B7A] hover:text-[#1A237E]"
              >
                Skip
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold text-[#1A237E]">First job fit</h1>
              <p className="text-[#4E5B7A]">Paste a real job description to get apply / stretch / skip.</p>
              <Link
                href="/dashboard/job-fit"
                className="block text-center rounded-lg bg-[#26A69A] py-3 font-semibold text-white transition hover:bg-[#1f8f85]"
              >
                Open Job fit
              </Link>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full rounded-lg border border-black/[0.08] bg-[#F7FAFA] py-3 font-semibold text-[#1A237E] transition hover:bg-[#EEF7F6]"
              >
                Next
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="text-2xl font-bold text-[#1A237E]">Wrap up</h1>
              <p className="text-[#4E5B7A]">
                From a saved job, use <strong className="text-[#1A237E]">Tailor</strong> to generate bullets and cover
                letters, then export. Mark onboarding complete when you&apos;re ready.
              </p>
              <button
                type="button"
                disabled={saving}
                onClick={markComplete}
                className="w-full rounded-lg bg-[#26A69A] py-3 font-semibold text-white transition hover:bg-[#1f8f85] disabled:opacity-50"
              >
                {saving ? "Saving…" : "Mark onboarding complete"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
