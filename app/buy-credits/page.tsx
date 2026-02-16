"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 20,
    price: 2.99,
    description: "Perfect for trying out the service",
    features: ["20 credits", "No expiration", "Instant delivery"],
    popular: false,
  },
  {
    id: "popular",
    name: "Popular Pack",
    credits: 50,
    price: 4.99,
    description: "Best value for regular users",
    features: ["50 credits", "No expiration", "Instant delivery", "Best value"],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro Pack",
    credits: 100,
    price: 7.99,
    description: "For power users and professionals",
    features: ["100 credits", "No expiration", "Instant delivery", "Most credits"],
    popular: false,
  },
];

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
    const payment = searchParams.get("payment");
    if (payment === "success") {
      // Show success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    }
  }, [searchParams, router]);

  const handlePurchase = async (packageType: string) => {
    setLoading(packageType);

    try {
      // Create checkout session
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageType }),
      });

      if (!res.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await res.json();

      // Redirect to Stripe checkout
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const paymentSuccess = searchParams.get("payment") === "success";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-white">
          <span className="text-blue-400">CV</span>Scan
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-white">
            <span className="text-gray-400">Credits:</span>{" "}
            <span className="font-bold text-blue-400">{session.user.credits}</span>
          </div>
          <Link
            href="/dashboard"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {paymentSuccess && (
            <div className="bg-green-600 text-white p-4 rounded-xl mb-8 text-center">
              🎉 Payment successful! Your credits have been added. Redirecting to dashboard...
            </div>
          )}

          {searchParams.get("payment") === "cancelled" && (
            <div className="bg-yellow-600 text-white p-4 rounded-xl mb-8 text-center">
              Payment cancelled. You can try again below.
            </div>
          )}

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Get More Credits</h1>
            <p className="text-gray-300 text-lg">
              Choose a package that fits your needs. Credits never expire.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-white/5 backdrop-blur-lg rounded-2xl p-8 border ${pkg.popular
                  ? "border-blue-500 shadow-lg shadow-blue-500/20"
                  : "border-white/20"
                  }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    BEST VALUE
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-white">${pkg.price}</span>
                  </div>
                  <div className="text-blue-400 font-semibold">{pkg.credits} Credits</div>
                  <div className="text-gray-400 text-sm">
                    ${(pkg.price / pkg.credits).toFixed(2)} per credit
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-300">
                      <svg
                        className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading !== null}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${pkg.popular
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    } ${loading === pkg.id
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105"
                    }`}
                >
                  {loading === pkg.id ? "Processing..." : "Purchase Now"}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-16 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">Do credits expire?</h3>
                <p className="text-gray-400">
                  No! Your credits never expire. Use them whenever you need.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">How many credits do I need?</h3>
                <p className="text-gray-400">
                  Resume bullet points cost 1 credit each. Cover letters cost 2 credits each.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-400">
                  We accept all major credit cards via Stripe's secure payment processing.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Can I get a refund?</h3>
                <p className="text-gray-400">
                  Yes! Contact us within 7 days if you're not satisfied and we'll issue a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuyCredits() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <BuyCreditsContent />
    </Suspense>
  );
}
