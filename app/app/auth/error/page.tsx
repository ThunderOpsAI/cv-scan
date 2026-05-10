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
    <div className="flex min-h-screen items-center justify-center bg-[#E0F2F1] px-4">
      <div className="w-full max-w-md rounded-3xl border border-black/[0.06] bg-white/50 p-7 text-center shadow-2xl shadow-[#1A237E]/5 backdrop-blur">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          !
        </div>
        <h1 className="text-2xl font-semibold text-[#1A237E]">Authentication error</h1>
        <p className="mt-3 text-sm text-[#757575]">
          {errorMessages[error || "Default"] || errorMessages.Default}
        </p>
        <Link
          href="/auth/signin"
          className="mt-6 inline-flex rounded-full bg-[#26A69A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2bbbad]"
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
        <div className="flex min-h-screen items-center justify-center bg-[#E0F2F1]">
          <div className="text-sm text-[#757575]">Loading...</div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
