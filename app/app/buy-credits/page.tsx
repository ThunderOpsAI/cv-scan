// Buy credits page disabled for beta branch (no payments/credits in beta)
export default function BuyCreditsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Payments Disabled</h1>
        <p className="mb-3">Purchasing credits is not available in the public beta. All features are open and free to use.</p>
      </div>
    </div>
  );
}
// Buy credits page disabled for beta branch (no payments/credits in beta)
export default function BuyCreditsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Payments Disabled</h1>
        <p className="mb-3">Purchasing credits is not available in the public beta. All features are open and free to use.</p>
      </div>
    </div>
  );
}

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    (async () => {
      try {
        const res = await fetch("/api/credits/ledger?type=purchase&limit=20");
        const data = await res.json();
        if (res.ok && Array.isArray(data.entries)) {
          setPurchases(data.entries);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [status]);

  const handleSubscribe = async (planTier: "starter" | "pro" | "enterprise") => {
    setSubLoading(planTier);
    try {
      const res = await fetch("/api/stripe/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_tier: planTier }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start subscription checkout");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Subscribe error:", error);
      alert(error instanceof Error ? error.message : "Failed to subscribe");
      setSubLoading(null);
    }
  };

  const openBillingPortal = async () => {
    setSubLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not open billing portal");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      alert(error instanceof Error ? error.message : "Portal unavailable");
    } finally {
      setSubLoading(null);
    }
  };

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

// Buy credits page disabled for beta branch (no payments/credits in beta)
export default function BuyCreditsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Payments Disabled</h1>
        <p className="mb-3">Purchasing credits is not available in the public beta. All features are open and free to use.</p>
      </div>
    </div>
  );
}
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

          {searchParams.get("subscription") === "cancelled" && (
            <div className="bg-yellow-600 text-white p-4 rounded-xl mb-8 text-center">
              Subscription checkout cancelled.
            </div>
          )}

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Credits &amp; plans</h1>
            <p className="text-gray-300 text-lg">
              Buy credit packs for pay-as-you-go use, or subscribe for tier features (e.g. interview prep).
            </p>
          </div>

          <div className="mb-14 rounded-2xl border border-indigo-500/40 bg-indigo-950/40 p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Subscriptions (Stripe)</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-2xl">
              Create recurring products/prices in Stripe and set{" "}
              <code className="text-gray-300">STRIPE_PRICE_STARTER</code>,{" "}
              <code className="text-gray-300">STRIPE_PRICE_PRO</code>, and optionally{" "}
              <code className="text-gray-300">STRIPE_PRICE_ENTERPRISE</code> in your environment. Webhook must include{" "}
              <code className="text-gray-300">checkout.session.completed</code>,{" "}
              <code className="text-gray-300">customer.subscription.updated</code>, and{" "}
              <code className="text-gray-300">customer.subscription.deleted</code>.
            </p>
            <div className="flex flex-wrap gap-3 mb-4">
              {(["starter", "pro", "enterprise"] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  disabled={subLoading !== null}
                  onClick={() => handleSubscribe(tier)}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-2.5 text-white font-semibold capitalize"
                >
                  {subLoading === tier ? "Redirecting…" : `Subscribe — ${tier}`}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={subLoading !== null}
              onClick={openBillingPortal}
              className="text-sm text-indigo-200 underline hover:text-white disabled:opacity-50"
            >
              {subLoading === "portal" ? "Opening…" : "Manage billing in Stripe portal"}
            </button>
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

          {purchases.length > 0 && (
            <div className="mt-16 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Recent purchases</h2>
              <ul className="space-y-3 text-gray-300 text-sm">
                {purchases.map((p) => (
                  <li
                    key={p.event_id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-white/10 pb-3"
                  >
                    <span>{p.description || "Credit purchase"}</span>
                    <span className="text-emerald-300 font-medium">
                      +{p.amount} credits
                      <span className="text-gray-500 font-normal ml-2">
                        {new Date(p.created_at).toLocaleString()}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                  Typical costs: job fit 1 credit, tailored bullets 1, tailored cover letter 2, job pack 5. The full map
                  lives in <code className="text-gray-300">docs/CVScan_Credit_Costs.md</code> in the repository.
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
