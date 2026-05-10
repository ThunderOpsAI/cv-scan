"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { APP_NAME } from "@/lib/branding";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();

    if (!consent) {
      setError("Agree to the terms and privacy policy to continue.");
      return;
    }

    setLoading(true);
    setError("");

    // Store marketing opt-in preference for the consent callback
    if (typeof window !== "undefined") {
      localStorage.setItem("cvscan_marketing_opt_in", marketingOptIn ? "1" : "0");
    }

    const result = await signIn("email", {
      email,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (result?.error) {
      setError("We couldn't send the sign-in link. Please try again.");
      setLoading(false);
      return;
    }

    setEmailSent(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E0F2F1] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex justify-center group">
            <div className="relative h-24 w-80 transition-transform duration-300 group-hover:scale-105">
              <Image src="/AI_CV_Scan_Logo.png" alt="AICVScan Logo" fill className="object-contain" priority />
            </div>
          </Link>
          <p className="mt-3 text-sm text-[#757575]">Secure magic-link access only. No passwords to remember.</p>
        </div>

        <div className="rounded-3xl border border-black/[0.06] bg-white/50 p-7 shadow-2xl shadow-[#1A237E]/5 backdrop-blur">
          {emailSent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#26A69A]/15 text-[#26A69A]">
                OK
              </div>
              <h1 className="text-2xl font-semibold text-[#1A237E]">Check your inbox</h1>
              <p className="text-sm text-[#757575]">
                We sent a secure sign-in link to <span className="font-semibold text-[#1A237E]">{email}</span>.
              </p>
              <p className="text-xs text-[#757575]">
                Open the email on this device to continue into {APP_NAME}. The link expires automatically for safety.
              </p>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                className="w-full rounded-full border border-black/[0.06] bg-white/40 px-5 py-3 text-sm font-semibold text-[#1A237E] transition hover:bg-white/60"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-5">
              <div>
                <h1 className="text-2xl font-semibold text-[#1A237E]">Sign in</h1>
                <p className="mt-2 text-sm text-[#757575]">
                  Enter your email and we&apos;ll send you a one-time sign-in link.
                </p>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#1A237E]">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-2xl border border-black/[0.08] bg-white/60 px-4 py-3 text-sm text-[#1A237E] placeholder:text-[#757575]/60 focus:border-[#26A69A] focus:outline-none"
                />
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-white/30 p-4">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked) setError("");
                  }}
                  className="mt-1 h-4 w-4 rounded border-black/20 bg-white text-[#26A69A] focus:ring-[#26A69A]"
                />
                <span className="text-xs leading-5 text-[#757575]">
                  I agree to the <Link href="/terms" className="text-[#26A69A] hover:text-[#2bbbad]">Terms</Link> and{" "}
                  <Link href="/privacy" className="text-[#26A69A] hover:text-[#2bbbad]">Privacy Policy</Link>.
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-white/30 p-4">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-black/20 bg-white text-[#26A69A] focus:ring-[#26A69A]"
                />
                <span className="text-xs leading-5 text-[#757575]">
                  I&apos;d like to receive product updates, tips, and occasional promotional emails from {APP_NAME}. You can unsubscribe at any time.
                </span>
              </label>

              {error && <p className="text-sm text-rose-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#26A69A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2bbbad] disabled:cursor-not-allowed disabled:bg-[#26A69A]/40 disabled:text-white/60"
              >
                {loading ? "Sending link..." : "Email me a magic link"}
              </button>

              <p className="text-center text-xs text-[#757575]">New accounts start with 3 free credits.</p>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-[#757575] transition-colors hover:text-[#1A237E]">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
