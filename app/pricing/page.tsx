import Link from "next/link";
import { appTitle, APP_NAME, brandWordmark } from "@/lib/branding";
import { CREDIT_PACKAGES } from "@/lib/pricing";

const brand = brandWordmark();

export const metadata = {
  title: appTitle("Pricing"),
  description: `Simple, pay-as-you-go pricing for ${APP_NAME}.`,
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-5">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white">
          <span className="text-cyan-300">{brand.leading}</span>
          {brand.trailing}
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/trust" className="text-slate-300 transition-colors hover:text-white">
            Trust
          </Link>
          <Link href="/auth/signin" className="rounded-full bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300">
            Get started
          </Link>
        </div>
      </nav>

      <section className="container mx-auto px-4 pb-16 pt-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Simple pricing, clear value</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
          Credits never expire. Use them for ATS scans, tailored writing, and interview prep when you actually need them.
        </p>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
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

              <Link
                href="/auth/signin"
                className={`mt-8 inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                  plan.popular
                    ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                    : "border border-white/15 bg-white/6 text-white hover:bg-white/12"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
          <h2 className="text-2xl font-semibold text-white">What credits cover</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex justify-between gap-4"><span>ATS scan</span><span className="text-cyan-200">1 credit</span></li>
                <li className="flex justify-between gap-4"><span>Resume bullet generation</span><span className="text-cyan-200">1 credit</span></li>
                <li className="flex justify-between gap-4"><span>Cover letter generation</span><span className="text-cyan-200">2 credits</span></li>
                <li className="flex justify-between gap-4"><span>Mock interview reply</span><span className="text-cyan-200">1 credit</span></li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
              <ul className="space-y-3 text-sm text-slate-300">
                <li>Job discovery and dashboard storage stay available without using credits.</li>
                <li>The first 3 credits are included when a new account is created.</li>
                <li>Payments run through Stripe with promotion-code support at checkout.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
