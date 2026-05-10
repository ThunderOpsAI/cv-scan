import Link from "next/link";
import Image from "next/image";
import { APP_NAME, appTitle } from "@/lib/branding";

export const metadata = {
  title: appTitle("Terms of Service"),
  description: `Terms and conditions for using ${APP_NAME}.`,
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#E0F2F1]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-16 w-56 transition-transform duration-300 group-hover:scale-105">
            <Image src="/AI_CV_Scan_Logo.png" alt="AICVScan Logo" fill className="object-contain" priority />
          </div>
        </Link>
        <Link href="/trust" className="text-sm text-[#757575] transition-colors hover:text-[#1A237E]">
          Trust center
        </Link>
      </nav>

      <main className="container mx-auto max-w-4xl px-4 pb-16 pt-10">
        <div className="rounded-[2rem] border border-black/[0.06] bg-white/40 p-8 text-sm text-[#757575] backdrop-blur md:p-10">
          <h1 className="text-4xl font-semibold tracking-tight text-[#1A237E]">Terms of Service</h1>
          <p className="mt-3 text-[#757575]/70">Last updated: May 2026</p>

          <section className="mt-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-[#1A237E]">1. Acceptance</h2>
              <p className="mt-2">
                By accessing or using {APP_NAME}, you agree to these terms. If you do not agree, do not use the service.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1A237E]">2. Service scope</h2>
              <p className="mt-2">
                {APP_NAME} provides AI-assisted resume analysis, application prep, and interview practice on a credit-based model.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1A237E]">3. Credits and payments</h2>
              <p className="mt-2">
                Paid actions consume credits. Payments are processed by Stripe. Credits do not expire while your account remains active.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1A237E]">4. AI output</h2>
              <p className="mt-2">
                AI outputs may contain errors or weak suggestions. You are responsible for reviewing and validating any material before using it in a job application.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1A237E]">5. Acceptable use</h2>
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
