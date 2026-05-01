import Link from "next/link";
import { appTitle, APP_NAME, brandWordmark } from "@/lib/branding";

const brand = brandWordmark();

const testimonials = [
  {
    quote:
      "I stopped guessing which keywords mattered. The scanner showed the gaps, and the bullet generator helped me close them without rewriting everything from scratch.",
    name: "Elena M.",
    role: "Customer Success Lead",
  },
  {
    quote:
      "The camera capture flow was surprisingly useful. I snapped a role from my laptop screen on my phone and had a clean ATS scan a minute later.",
    name: "Jordan P.",
    role: "Operations Analyst",
  },
  {
    quote:
      "The interview tool remembered the thread between answers, which made the practice feel a lot more realistic than one-off prompts.",
    name: "Noah R.",
    role: "Backend Engineer",
  },
  {
    quote:
      "The pricing felt low-risk enough to try, and the product was clear about what each credit actually covered.",
    name: "Chloe D.",
    role: "Marketing Manager",
  },
  {
    quote:
      "I liked that it pushed me to review the AI output instead of pretending the draft was perfect. That made me trust it more.",
    name: "Samira A.",
    role: "Program Coordinator",
  },
  {
    quote:
      "AICVScan helped me tighten my resume for three roles in one evening without the usual copy-paste chaos.",
    name: "Ben C.",
    role: "Product Designer",
  },
];

export const metadata = {
  title: appTitle("What Customers Say"),
  description: `Customer feedback for ${APP_NAME}.`,
};

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-5">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white">
          <span className="text-cyan-300">{brand.leading}</span>
          {brand.trailing}
        </Link>
        <Link href="/auth/signin" className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
          Try it free
        </Link>
      </nav>

      <section className="container mx-auto px-4 pb-12 pt-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">What Customers Say</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
          Placeholder testimonials for launch styling and structure, written to feel grounded and credible.
        </p>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
              <p className="text-sm leading-7 text-slate-200">“{item.quote}”</p>
              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="text-sm font-semibold text-white">{item.name}</div>
                <div className="text-xs text-slate-500">{item.role}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
