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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 flex items-center justify-center text-white">
        Loading…
      </div>
    );
  }

  if (!session) return null;

  const pct = Math.round(((Math.min(step, STEP_COUNT - 1) + 1) / STEP_COUNT) * 100);

  if (finished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-3xl font-bold text-white">You&apos;re set</h1>
          <p className="text-gray-300">
            Run <strong className="text-white">Job fit</strong>, then open <strong className="text-white">Tailor</strong>{" "}
            to generate grounded bullets and cover letters. Everything stays review-first.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-slate-900 hover:bg-gray-100"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-white">
          <span className="text-violet-400">CV</span>Scan
        </Link>
        <Link href="/dashboard" className="text-gray-300 hover:text-white text-sm">
          Skip to dashboard
        </Link>
      </nav>

      <main className="container mx-auto px-4 py-10 max-w-lg">
        <div className="mb-8">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Step {step + 1} of {STEP_COUNT}
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-2xl p-8 space-y-6">
          {step === 0 && (
            <>
              <h1 className="text-2xl font-bold text-white">Welcome</h1>
              <p className="text-gray-300">
                A short setup puts you on the path: career memory → your context → first job fit. You can skip any
                step.
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full rounded-lg bg-violet-600 py-3 font-semibold text-white hover:bg-violet-500"
              >
                Continue
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-white">Career memory</h1>
              <p className="text-gray-300">
                Import a resume and approve facts. Tailoring and fit only use what you approve.
              </p>
              <Link
                href="/dashboard/profile/facts"
                className="block text-center rounded-lg bg-violet-600 py-3 font-semibold text-white hover:bg-violet-500"
              >
                Open Career Memory
              </Link>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full rounded-lg bg-white/10 py-3 font-semibold text-white hover:bg-white/20"
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-white">Your path</h1>
              <p className="text-gray-300 text-sm">Stored on your account for future prompt tuning.</p>
              {msg && <p className="text-amber-200 text-sm">{msg}</p>}
              <div className="space-y-2">
                {PATHS.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer ${
                      careerPath === p.id
                        ? "border-violet-500 bg-violet-500/20"
                        : "border-white/20 bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name="path"
                      checked={careerPath === p.id}
                      onChange={() => setCareerPath(p.id)}
                      className="accent-violet-500"
                    />
                    <span className="text-gray-100">{p.label}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={savePath}
                className="w-full rounded-lg bg-violet-600 py-3 font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save and continue"}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full text-sm text-gray-400 hover:text-white"
              >
                Skip
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold text-white">First job fit</h1>
              <p className="text-gray-300">Paste a real job description to get apply / stretch / skip.</p>
              <Link
                href="/dashboard/job-fit"
                className="block text-center rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-500"
              >
                Open Job fit
              </Link>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full rounded-lg bg-white/10 py-3 font-semibold text-white hover:bg-white/20"
              >
                Next
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="text-2xl font-bold text-white">Wrap up</h1>
              <p className="text-gray-300">
                From a saved job, use <strong className="text-white">Tailor</strong> to generate bullets and cover
                letters, then export. Mark onboarding complete when you&apos;re ready.
              </p>
              <button
                type="button"
                disabled={saving}
                onClick={markComplete}
                className="w-full rounded-lg bg-violet-600 py-3 font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
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
