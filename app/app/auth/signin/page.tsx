"use client";

import { getProviders, signIn, type ClientSafeProvider } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const authErrorMessages: Record<string, string> = {
  Configuration: "Sign-in is not configured correctly. Please try again later.",
  AccessDenied: "Access was denied. Use the same email or provider you signed up with.",
  Verification: "That sign-in link has expired or has already been used. Request a fresh link.",
  OAuthSignin: "Google sign-in could not start. Please try again.",
  OAuthCallback: "Google did not finish signing you in. Please try again.",
  OAuthCreateAccount: "We could not create an account from Google. Please try email sign-in.",
  EmailCreateAccount: "We could not create an account from that email link. Request a fresh link.",
  EmailSignin: "We could not send the sign-in email. Please try again.",
  OAuthAccountNotLinked: "This email is already linked to another sign-in method.",
  SessionRequired: "Your session expired. Please sign in again to continue.",
  Callback: "The sign-in flow could not be completed. Please try again.",
  Default: "Sign-in failed. Please try again.",
};

function getAuthErrorMessage(error: string | null) {
  if (!error) return "";
  return authErrorMessages[error] || authErrorMessages.Default;
}

function normalizeCallbackUrl(value: string | null) {
  if (!value) return "/dashboard";

  try {
    const callbackUrl = new URL(value, window.location.origin);
    if (callbackUrl.origin !== window.location.origin) {
      return "/dashboard";
    }

    return `${callbackUrl.pathname}${callbackUrl.search}${callbackUrl.hash}`;
  } catch {
    return "/dashboard";
  }
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("/dashboard");
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);
  const [providersLoaded, setProvidersLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const searchParams = new URLSearchParams(window.location.search);
    const rawCallbackUrl = searchParams.get("callbackUrl");
    const rawError = searchParams.get("error");
    const isVerifyRequest = searchParams.get("verifyRequest") === "true";

    setCallbackUrl(normalizeCallbackUrl(rawCallbackUrl));
    setError(getAuthErrorMessage(rawError));

    if (isVerifyRequest) {
      setStatusMessage("Check your email for a secure sign-in link.");
    } else if (rawCallbackUrl && !rawError) {
      setStatusMessage("Sign in to continue. Your previous session may have expired.");
    }

    getProviders()
      .then((availableProviders) => {
        if (isMounted) {
          setProviders(availableProviders);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProviders(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setProvidersLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const emailProviderAvailable = !!providers?.email;
  const googleProviderAvailable = !!providers?.google;
  const authUnavailable =
    providersLoaded && !emailProviderAvailable && !googleProviderAvailable;

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError("Please agree to the Terms and Privacy Policy to continue.");
      return;
    }
    if (!providersLoaded) {
      setError("Sign-in options are still loading. Please try again in a moment.");
      return;
    }
    if (!emailProviderAvailable) {
      setError("Email sign-in is temporarily unavailable.");
      return;
    }
    setError("");
    setStatusMessage("");
    setLoading(true);

    try {
      await signIn("email", {
        email,
        callbackUrl,
        redirect: true
      });
    } catch {
      setError("Unable to start email sign-in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold text-white inline-block">
            <span className="text-blue-400">CV</span>Scan
          </Link>
          <p className="text-gray-400 mt-4">
            Sign in to your account
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {authUnavailable && (
            <div className="mb-6 rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm text-yellow-100">
              Sign-in is not configured yet. Add the Google and email provider environment variables before accepting users.
            </div>
          )}
          {statusMessage && (
            <div className="mb-6 rounded-xl border border-green-400/30 bg-green-400/10 p-4 text-sm text-green-100">
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="mb-6">
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
              />
            </div>
            
            <div className="mb-6 flex items-start gap-3">
              <div className="flex items-center h-5">
                <input
                  id="consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked) setError("");
                  }}
                  className="w-4 h-4 rounded border-gray-600 bg-white/5 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                />
              </div>
              <label htmlFor="consent" className="text-xs text-gray-400">
                I agree to the <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>, and consent to the processing of my candidate data.
              </label>
            </div>

            {error && (
              <div className="mb-4 text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending Link..." : "Sign in with Email"}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400 bg-slate-900/50 backdrop-blur">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (!consent) {
                setError("Please agree to the Terms and Privacy Policy to continue.");
                return;
              }
              if (!providersLoaded) {
                setError("Sign-in options are still loading. Please try again in a moment.");
                return;
              }
              if (!googleProviderAvailable) {
                setError("Google sign-in is temporarily unavailable.");
                return;
              }
              setError("");
              setStatusMessage("");
              signIn("google", { callbackUrl });
            }}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Get 3 free credits to try CVScan
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
