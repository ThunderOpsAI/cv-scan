import Link from "next/link";
import Image from "next/image";
import { appTitle, APP_NAME } from "@/lib/branding";
import { CREDIT_PACKAGES } from "@/lib/pricing";


export const metadata = {
  title: appTitle("Pricing"),
  description: `Simple, pay-as-you-go pricing for ${APP_NAME}.`,
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#E0F2F1]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-16 w-56 transition-transform duration-300 group-hover:scale-105">
            <Image src="/AI_CV_Scan_Logo.png" alt="AICVScan Logo" fill className="object-contain" priority />
          </div>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/trust" className="text-[#757575] transition-colors hover:text-[#1A237E]">
            Trust
          </Link>
          <Link href="/auth/signin" className="rounded-full bg-[#26A69A] px-4 py-2 font-semibold text-white transition hover:bg-[#2bbbad]">
            Get started
          </Link>
        </div>
      </nav>

      <section className="container mx-auto px-4 pb-16 pt-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[#1A237E] md:text-5xl">Simple pricing, clear value</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-[#757575] md:text-base">
          Credits never expire. Use them for ATS scans, tailored writing, and interview prep when you actually need them.
        </p>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          {CREDIT_PACKAGES.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-[2rem] border p-6 backdrop-blur ${
                plan.popular ? "border-[#26A69A]/30 bg-[#26A69A]/10" : "border-black/[0.06] bg-white/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[#1A237E]">{plan.name}</h2>
                  <p className="mt-2 text-sm text-[#757575]">{plan.description}</p>
                </div>
                {plan.popular ? (
                  <span className="rounded-full bg-[#26A69A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                    Best value
                  </span>
                ) : null}
              </div>

              <div className="mt-6 text-4xl font-semibold text-[#1A237E]">${plan.price.toFixed(2)}</div>
              <div className="mt-1 text-sm text-[#26A69A]">{plan.credits} credits</div>

              {plan.offerLabel ? (
                <div className="mt-5 inline-flex items-center rounded-full border border-[#26A69A]/20 bg-[#26A69A]/10 px-3 py-1 text-[13px] font-medium text-[#1A237E]">
                  ✨ {plan.offerLabel}
                </div>
              ) : null}

              <ul className="mt-6 space-y-3 text-sm text-[#757575]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-[#26A69A]">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/signin"
                className={`mt-8 inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                  plan.popular
                    ? "bg-[#26A69A] text-white hover:bg-[#2bbbad]"
                    : "border border-black/[0.08] bg-white/40 text-[#1A237E] hover:bg-white/60"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
