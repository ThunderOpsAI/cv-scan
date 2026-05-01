"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the authentication configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "That magic link has expired or has already been used.",
    Default: "We couldn't complete sign-in. Please request a fresh magic link.",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)] px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/6 p-7 text-center shadow-2xl shadow-cyan-950/20 backdrop-blur">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
          !
        </div>
        <h1 className="text-2xl font-semibold text-white">Authentication error</h1>
        <p className="mt-3 text-sm text-slate-300">
          {errorMessages[error || "Default"] || errorMessages.Default}
        </p>
        <Link
          href="/auth/signin"
          className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Request a new link
        </Link>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
          <div className="text-sm text-slate-200">Loading...</div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
