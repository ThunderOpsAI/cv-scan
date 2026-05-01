import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { APP_NAME, APP_DESCRIPTION, SUPPORT_EMAIL, brandWordmark } from "@/lib/branding";
import { CREDIT_PACKAGES } from "@/lib/pricing";

const brand = brandWordmark();

const testimonials = [
  {
    quote: "AICVScan helped me turn vague bullet points into sharp evidence that matched the role in one pass.",
    name: "Priya K.",
    role: "Product Analyst",
  },
  {
    quote: "The interview practice felt much more focused than generic chat tools because it kept the role context.",
    name: "Liam T.",
    role: "Frontend Engineer",
  },
  {
    quote: "I used the scanner on a screenshot from my phone and had an action plan in under two minutes.",
    name: "Marta S.",
    role: "Operations Manager",
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-5">
        <div className="text-xl font-semibold tracking-tight text-white">
          <span className="text-cyan-300">{brand.leading}</span>
          {brand.trailing}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="text-slate-300 transition-colors hover:text-white">
            Pricing
          </Link>
          <Link href="/trust" className="text-slate-300 transition-colors hover:text-white">
            Trust
          </Link>
          <Link
            href={session ? "/dashboard" : "/auth/signin"}
            className="rounded-full bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            {session ? "Open dashboard" : "Sign in"}
          </Link>
        </div>
      </nav>

      <section className="container mx-auto px-4 pb-14 pt-10">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Resume scanning, tailoring, and interview prep
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Make each application sharper before it reaches a recruiter.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
            {APP_DESCRIPTION}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={session ? "/dashboard" : "/auth/signin"}
              className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Start with 3 free credits
            </Link>
            <Link
              href="#before-after"
              className="rounded-full border border-white/15 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              See the transformation
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16" id="before-after">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">Before & After</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Turn generic, low-signal resume content into role-aligned proof that reads like a stronger candidate.
            </p>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-rose-400/20 bg-rose-400/8 p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">Before</div>
              <p className="text-sm leading-7 text-slate-200">
                Responsible for customer issues, worked with teams, updated reports, and helped improve service levels.
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/8 p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">After with {APP_NAME}</div>
              <p className="text-sm leading-7 text-slate-100">
                Partnered with support and operations teams to redesign escalation workflows, cutting response times by
                38%, reducing repeat tickets by 22%, and improving CSAT from 84% to 92%.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          {[
            {
              title: "Capture or paste a job description",
              body: "Use text, screenshots, or camera capture to bring the target role into the scanner quickly.",
            },
            {
              title: "See where your profile is weak",
              body: "Get keyword coverage, section-level scoring, and next-step recommendations that are easy to act on.",
            },
            {
              title: "Practice the interview flow",
              body: "Run a saved multi-turn mock interview so your prep keeps context instead of restarting each time.",
            },
          ].map((item, index) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">0{index + 1}</div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16" id="pricing">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-white">Pricing</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400">
              Static, pay-as-you-go pricing. No subscription pressure, just credits when you need them.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {CREDIT_PACKAGES.map((plan) => (
              <Link
                href="/pricing"
                key={plan.id}
                className={`rounded-3xl border p-5 backdrop-blur transition-colors ${
                  plan.popular
                    ? "border-cyan-400/30 bg-cyan-400/10"
                    : "border-white/10 bg-white/6 hover:bg-white/8"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
                  </div>
                  {plan.popular && (
                    <span className="rounded-full bg-cyan-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-950">
                      Popular
                    </span>
                  )}
                </div>
                <div className="mt-5 text-3xl font-semibold text-white">${plan.price.toFixed(2)}</div>
                <div className="mt-1 text-sm text-cyan-200">{plan.credits} credits</div>
                {plan.offerLabel && (
                  <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-medium text-amber-100">
                    {plan.offerLabel}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Trust built into the workflow</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Minimal data collection, clear human review expectations, and secure login via time-limited magic links.
              </p>
            </div>
            <Link href="/trust" className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100">
              Read trust details
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              "Magic-link authentication only",
              "Your resume and application edits stay under your control",
              "AI output is positioned as guidance, not blind automation",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">What Customers Say</h2>
              <p className="mt-2 text-sm text-slate-400">Early feedback focused on speed, clarity, and better interview confidence.</p>
            </div>
            <Link href="/testimonials" className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100">
              View all testimonials
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-sm leading-7 text-slate-200">“{item.quote}”</p>
                <div className="mt-4 text-sm font-semibold text-white">{item.name}</div>
                <div className="text-xs text-slate-500">{item.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-slate-950/35 px-5 py-5 text-center">
          <h2 className="text-xl font-semibold text-white">Move faster on your next application</h2>
          <p className="mt-2 text-sm text-slate-400">
            Start free, keep the parts that help, and buy credits only when the workflow earns it.
          </p>
          <Link
            href={session ? "/dashboard" : "/auth/signin"}
            className="mt-4 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Open {APP_NAME}
          </Link>
        </div>
      </section>

      <footer className="container mx-auto flex flex-col items-center justify-between gap-4 border-t border-white/10 px-4 py-6 text-sm text-slate-400 md:flex-row">
        <div>© 2026 {APP_NAME}. All rights reserved.</div>
        <div className="flex items-center gap-5">
          <Link href="/pricing" className="transition-colors hover:text-white">
            Pricing
          </Link>
          <Link href="/testimonials" className="transition-colors hover:text-white">
            Testimonials
          </Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="transition-colors hover:text-white">
            Support
          </a>
        </div>
      </footer>
    </main>
  );
}
