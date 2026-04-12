"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "Sign-in is not configured correctly. Please try again later.",
    AccessDenied: "Access was denied. Use the same email or provider you signed up with.",
    Verification: "That sign-in link has expired or has already been used.",
    OAuthSignin: "Google sign-in could not start.",
    OAuthCallback: "Google did not finish signing you in.",
    OAuthCreateAccount: "We could not create an account from Google.",
    EmailCreateAccount: "We could not create an account from that email link.",
    EmailSignin: "We could not send the sign-in email.",
    OAuthAccountNotLinked: "This email is already linked to another sign-in method.",
    SessionRequired: "Your session expired or this page requires sign-in.",
    Callback: "The sign-in flow could not be completed.",
    Default: "Sign-in failed.",
  };

  const errorMessage = errorMessages[error || "Default"] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Authentication Error</h1>
        <p className="text-gray-300 mb-3">{errorMessage}</p>
        <p className="text-gray-400 mb-8 text-sm">
          Request a new magic link or try another configured sign-in method.
        </p>
        <Link
          href="/auth/signin"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
