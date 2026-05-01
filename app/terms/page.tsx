import Link from "next/link";
import { APP_NAME, appTitle, brandWordmark } from "@/lib/branding";

const brand = brandWordmark();

export const metadata = {
  title: appTitle("Terms of Service"),
  description: `Terms and conditions for using ${APP_NAME}.`,
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-5">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white">
          <span className="text-cyan-300">{brand.leading}</span>
          {brand.trailing}
        </Link>
        <Link href="/trust" className="text-sm text-slate-300 transition-colors hover:text-white">
          Trust center
        </Link>
      </nav>

      <main className="container mx-auto max-w-4xl px-4 pb-16 pt-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/6 p-8 text-sm text-slate-300 backdrop-blur md:p-10">
          <h1 className="text-4xl font-semibold tracking-tight text-white">Terms of Service</h1>
          <p className="mt-3 text-slate-500">Last updated: May 2026</p>

          <section className="mt-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">1. Acceptance</h2>
              <p className="mt-2">
                By accessing or using {APP_NAME}, you agree to these terms. If you do not agree, do not use the service.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">2. Service scope</h2>
              <p className="mt-2">
                {APP_NAME} provides AI-assisted resume analysis, application prep, and interview practice on a credit-based model.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">3. Credits and payments</h2>
              <p className="mt-2">
                Paid actions consume credits. Payments are processed by Stripe. Credits do not expire while your account remains active.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">4. AI output</h2>
              <p className="mt-2">
                AI outputs may contain errors or weak suggestions. You are responsible for reviewing and validating any material before using it in a job application.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">5. Acceptable use</h2>
              <p className="mt-2">
                Do not use {APP_NAME} to create fraudulent or misleading content, abuse the credit system, or interfere with platform operations.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
