"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { APP_NAME, brandWordmark } from "@/lib/branding";

const brand = brandWordmark();

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-3xl font-semibold tracking-tight text-white">
            <span className="text-cyan-300">{brand.leading}</span>
            {brand.trailing}
          </Link>
          <p className="mt-3 text-sm text-slate-400">Secure magic-link access only. No passwords to remember.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/6 p-7 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          {emailSent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
                ✓
              </div>
              <h1 className="text-2xl font-semibold text-white">Check your inbox</h1>
              <p className="text-sm text-slate-300">
                We sent a secure sign-in link to <span className="font-semibold text-white">{email}</span>.
              </p>
              <p className="text-xs text-slate-500">
                Open the email on this device to continue into {APP_NAME}. The link expires automatically for safety.
              </p>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                className="w-full rounded-full border border-white/15 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-5">
              <div>
                <h1 className="text-2xl font-semibold text-white">Sign in</h1>
                <p className="mt-2 text-sm text-slate-400">
                  Enter your email and we’ll send you a one-time sign-in link.
                </p>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-200">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked) setError("");
                  }}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                />
                <span className="text-xs leading-5 text-slate-400">
                  I agree to the <Link href="/terms" className="text-cyan-300 hover:text-cyan-200">Terms</Link> and{" "}
                  <Link href="/privacy" className="text-cyan-300 hover:text-cyan-200">Privacy Policy</Link>.
                </span>
              </label>

              {error && <p className="text-sm text-rose-300">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-900 disabled:text-slate-300"
              >
                {loading ? "Sending link..." : "Email me a magic link"}
              </button>

              <p className="text-center text-xs text-slate-500">New accounts start with 3 free credits.</p>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-400 transition-colors hover:text-white">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
