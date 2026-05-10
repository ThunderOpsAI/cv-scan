import Link from "next/link";
import Image from "next/image";
import { appTitle, APP_NAME } from "@/lib/branding";

export const metadata = {
  title: appTitle("Trust & Security"),
  description: `How ${APP_NAME} handles data, access, and AI output.`,
};

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-[#E0F2F1]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-16 w-56 transition-transform duration-300 group-hover:scale-105">
            <Image src="/AI_CV_Scan_Logo.png" alt="AICVScan Logo" fill className="object-contain" priority />
          </div>
        </Link>
        <Link href="/auth/signin" className="text-sm text-[#757575] transition-colors hover:text-[#1A237E]">
          Sign in
        </Link>
      </nav>

      <section className="container mx-auto px-4 pb-12 pt-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[#1A237E] md:text-5xl">Trust & Security</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-[#757575] md:text-base">
          A clean summary of how {APP_NAME} protects access, frames AI assistance, and keeps candidate data under user control.
        </p>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] border border-black/[0.06] bg-white/40 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#1A237E]">Secure access</h2>
            <p className="mt-3 text-sm text-[#757575]">
              Authentication is handled with time-limited magic links only. No password storage and no social login sprawl.
            </p>
          </div>
          <div className="rounded-[2rem] border border-black/[0.06] bg-white/40 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#1A237E]">Human review expected</h2>
            <p className="mt-3 text-sm text-[#757575]">
              AI output accelerates drafting and preparation, but you should still review every resume, cover letter, and answer.
            </p>
          </div>
          <div className="rounded-[2rem] border border-black/[0.06] bg-white/40 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#1A237E]">Data stays contextual</h2>
            <p className="mt-3 text-sm text-[#757575]">
              We use the information you provide to power scanning, generation, and coaching workflows inside the product.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
