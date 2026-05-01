import Link from "next/link";
import { appTitle, APP_NAME, brandWordmark } from "@/lib/branding";

const brand = brandWordmark();

export const metadata = {
  title: appTitle("Trust & Security"),
  description: `How ${APP_NAME} handles data, access, and AI output.`,
};

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-5">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white">
          <span className="text-cyan-300">{brand.leading}</span>
          {brand.trailing}
        </Link>
        <Link href="/auth/signin" className="text-sm text-slate-300 transition-colors hover:text-white">
          Sign in
        </Link>
      </nav>

      <section className="container mx-auto px-4 pb-12 pt-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Trust & Security</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
          A clean summary of how {APP_NAME} protects access, frames AI assistance, and keeps candidate data under user control.
        </p>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Secure access</h2>
            <p className="mt-3 text-sm text-slate-300">
              Authentication is handled with time-limited magic links only. No password storage, no social login sprawl,
              and less friction for returning users.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Human review expected</h2>
            <p className="mt-3 text-sm text-slate-300">
              AI output is designed to accelerate drafting and preparation. You should still review every resume,
              cover letter, and interview answer before using it.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Data stays contextual</h2>
            <p className="mt-3 text-sm text-slate-300">
              We use the information you provide to power scanning, generation, and coaching workflows inside the product,
              not to sell your profile to third parties.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
          <h2 className="text-2xl font-semibold text-white">What that means in practice</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <p>We rely on established infrastructure partners for authentication, payments, and application storage.</p>
            <p>AI models help extract text, score relevance, and generate drafts, but they can still make mistakes.</p>
            <p>You can use the scanner, interview, and writing tools without giving up ownership of the final output.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/privacy" className="rounded-full border border-white/15 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/12">
              Privacy policy
            </Link>
            <Link href="/terms" className="rounded-full border border-white/15 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/12">
              Terms of service
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
