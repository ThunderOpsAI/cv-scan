"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/branding";
import { CREDIT_PACKAGES } from "@/lib/pricing";



function BuyCreditsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      const timeout = setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [searchParams, router]);

  const handlePurchase = async (packageType: string) => {
    setLoading(packageType);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageType }),
      });

      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Failed to initiate purchase. Please try again.");
      setLoading(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
        <div className="text-sm text-slate-200">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white group">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-white/[0.14] shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Image src="/logo.png" alt="CVScan Logo" fill className="object-cover" />
          </div>
          {APP_NAME}
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-white">
            <span className="text-slate-400">Credits:</span>{" "}
            <span className="font-semibold text-cyan-300">{session.user.credits}</span>
          </div>
          <Link href="/dashboard" className="text-slate-300 transition-colors hover:text-white">
            Dashboard
          </Link>
        </div>
      </nav>

      <section className="container mx-auto px-4 pb-16 pt-10">
        <div className="mx-auto max-w-5xl">
          {searchParams.get("payment") === "success" && (
            <div className="mb-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              Payment successful. Your credits have been added and we&apos;re sending you back to the dashboard.
            </div>
          )}

          {searchParams.get("payment") === "cancelled" && (
            <div className="mb-6 rounded-3xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              Payment cancelled. You can pick a package and try again whenever you&apos;re ready.
            </div>
          )}

          <div className="mb-8 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Choose more credits</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Same pricing system as the homepage, with secure Stripe checkout and no subscription lock-in.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {CREDIT_PACKAGES.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-[2rem] border p-6 backdrop-blur ${
                  plan.popular ? "border-cyan-400/30 bg-cyan-400/10" : "border-white/10 bg-white/6"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
                    <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
                  </div>
                  {plan.popular && (
                    <span className="rounded-full bg-cyan-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-950">
                      Best value
                    </span>
                  )}
                </div>

                <div className="mt-6 text-4xl font-semibold text-white">${plan.price.toFixed(2)}</div>
                <div className="mt-1 text-sm text-cyan-200">{plan.credits} credits</div>

                {plan.offerLabel && (
                  <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-medium text-amber-100">
                    {plan.offerLabel}
                  </div>
                )}

                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="text-cyan-200">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={loading !== null}
                  className={`mt-8 w-full rounded-full px-5 py-3 text-sm font-semibold transition ${
                    plan.popular
                      ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                      : "border border-white/15 bg-white/6 text-white hover:bg-white/12"
                  } ${loading === plan.id ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {loading === plan.id ? "Processing..." : plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Before you buy</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 text-sm text-slate-300">
                Credits are used only when you run paid actions like ATS scans beyond the free allowance, cover letters,
                writing generation, or interview replies.
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 text-sm text-slate-300">
                Checkout is handled by Stripe, credits do not expire, and launch pricing currently highlights a 50%
                discount for the first 200 users on the Popular Pack.
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-slate-400">
            New accounts in {APP_NAME} still start with 3 free credits.
          </div>
        </div>
      </section>
    </main>
  );
}

export default function BuyCredits() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
          <div className="text-sm text-slate-200">Loading...</div>
        </div>
      }
    >
      <BuyCreditsContent />
    </Suspense>
  );
}
