"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { APP_NAME } from "@/lib/branding";

export default function SignIn() {
  const [authMode, setAuthMode] = useState<"signin" | "register" | "magic-link">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "nextauth.message") {
        router.push("/dashboard");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [status, router]);

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError("Agree to the terms and privacy policy to continue.");
      return;
    }
    setLoading(true);
    setError("");

    if (typeof window !== "undefined") {
      localStorage.setItem("cvscan_marketing_opt_in", marketingOptIn ? "1" : "0");
    }

    const result = await signIn("email", {
      email,
      redirect: false,
      callbackUrl: "/auth/success",
    });

    if (result?.error) {
      setError("We couldn't send the sign-in link. Please try again.");
      setLoading(false);
      return;
    }

    setEmailSent(true);
    setLoading(false);
  };

  const handleCredentialsAuth = async (e: FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError("Agree to the terms and privacy policy to continue.");
      return;
    }
    setLoading(true);
    setError("");

    if (authMode === "register") {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to register");
        }
        // After register, log them in
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          setError("Registered successfully, but failed to log in automatically.");
          setLoading(false);
          return;
        }
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    } else {
      // Sign In
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = () => {
    if (!consent) {
      setError("Agree to the terms and privacy policy to continue.");
      return;
    }
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E0F2F1] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex justify-center group">
            <div className="relative h-24 w-80 transition-transform duration-300 group-hover:scale-105">
              <Image src="/AI_CV_Scan_Logo.png" alt="AICVScan Logo" fill className="object-contain" priority />
            </div>
          </Link>
          <p className="mt-3 text-sm text-[#757575]">Sign in to continue into {APP_NAME}.</p>
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
                Open the email on this device to continue. The link expires automatically for safety.
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
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-semibold text-[#1A237E]">
                  {authMode === "signin" ? "Sign in" : authMode === "register" ? "Create an account" : "Magic Link Sign In"}
                </h1>
                <p className="mt-2 text-sm text-[#757575]">
                  {authMode === "magic-link" 
                    ? "Enter your email and we'll send you a one-time sign-in link."
                    : authMode === "signin"
                    ? "Welcome back."
                    : "Join us and supercharge your resume."}
                </p>
              </div>

              <form onSubmit={authMode === "magic-link" ? handleMagicLink : handleCredentialsAuth} className="space-y-4">
                {authMode === "register" && (
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[#1A237E]">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                      className="w-full rounded-2xl border border-black/[0.08] bg-white/60 px-4 py-3 text-sm text-[#1A237E] placeholder:text-[#757575]/60 focus:border-[#26A69A] focus:outline-none"
                    />
                  </div>
                )}
                
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

                {authMode !== "magic-link" && (
                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#1A237E]">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-2xl border border-black/[0.08] bg-white/60 px-4 py-3 text-sm text-[#1A237E] placeholder:text-[#757575]/60 focus:border-[#26A69A] focus:outline-none"
                    />
                  </div>
                )}

                <label className="flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-white/30 p-4 mt-4">
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

                {authMode === "register" && (
                  <label className="flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-white/30 p-4">
                    <input
                      type="checkbox"
                      checked={marketingOptIn}
                      onChange={(e) => setMarketingOptIn(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-black/20 bg-white text-[#26A69A] focus:ring-[#26A69A]"
                    />
                    <span className="text-xs leading-5 text-[#757575]">
                      I&apos;d like to receive product updates, tips, and promotional emails from {APP_NAME}.
                    </span>
                  </label>
                )}

                {error && <p className="text-sm text-rose-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#26A69A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2bbbad] disabled:cursor-not-allowed disabled:bg-[#26A69A]/40 disabled:text-white/60"
                >
                  {loading ? "Please wait..." : authMode === "signin" ? "Sign In" : authMode === "register" ? "Sign Up" : "Email me a magic link"}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/[0.06]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[#f2f8f8] px-2 text-[#757575] rounded-full">Or</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 rounded-full border border-black/[0.08] bg-white px-5 py-3 text-sm font-semibold text-[#1A237E] transition hover:bg-black/[0.02]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <div className="mt-4 flex flex-col gap-2 text-center text-sm text-[#1A237E]">
                {authMode === "signin" && (
                  <>
                    <button onClick={() => setAuthMode("register")} className="font-semibold text-[#26A69A] hover:underline">
                      Don't have an account? Sign up
                    </button>
                    <button onClick={() => setAuthMode("magic-link")} className="text-[#757575] hover:underline">
                      Use magic link instead
                    </button>
                  </>
                )}
                {authMode === "register" && (
                  <button onClick={() => setAuthMode("signin")} className="font-semibold text-[#26A69A] hover:underline">
                    Already have an account? Sign in
                  </button>
                )}
                {authMode === "magic-link" && (
                  <button onClick={() => setAuthMode("signin")} className="font-semibold text-[#26A69A] hover:underline">
                    Use password to sign in
                  </button>
                )}
              </div>
            </div>
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
