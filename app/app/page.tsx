import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions, isAuthConfigured } from "@/lib/auth";

export default async function Home() {
  const session = isAuthConfigured()
    ? await getServerSession(authOptions)
    : null;
  const pricingHref = session ? "/buy-credits" : "/pricing";
  const accountHref = session ? "/dashboard" : "/auth/signin";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4 sm:py-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="text-2xl font-bold text-white">
          <span className="text-blue-400">CV</span>Scan
        </div>
        <div className="w-full sm:w-auto flex gap-4 items-center justify-between sm:justify-start">
          <Link
            href={pricingHref}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href={accountHref}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-lg shadow-blue-500/20"
          >
            {session ? "Dashboard" : "Sign In"}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20 text-center">
        <div className="inline-block mb-4 px-4 py-1 bg-blue-500/20 rounded-full text-blue-300 text-sm">
          AI Career & Application Platform
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Supercharge Your Job Search
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Resume, Cover Letter, Tracking & More
          </span>
        </h1>
        <p className="text-base sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          CVScan is your all-in-one AI platform for job search, resume optimization, cover letter generation, application tracking, interview prep, and more.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
          >
            Try Free - 3 Credits
          </Link>
          <Link
            href="#how-it-works"
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all border border-white/20"
          >
            See How It Works
          </Link>
        </div>
        <p className="mt-4 text-gray-400 text-sm">
          No credit card required. Start improving your career today.
        </p>
      </section>

      {/* Before/After Example */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
            <div className="text-red-400 font-semibold mb-3 flex items-center gap-2">
              <span className="text-xl">✗</span> Before
            </div>
            <p className="text-gray-300 italic">
              &quot;Responsible for managing team and handling customer issues&quot;
            </p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
            <div className="text-green-400 font-semibold mb-3 flex items-center gap-2">
              <span className="text-xl">✓</span> After (CVScan)
            </div>
            <p className="text-gray-300">
              &quot;Led cross-functional team of 8, reducing customer complaint resolution time by 40% and improving satisfaction scores from 3.2 to 4.7/5&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="container mx-auto px-4 py-16 sm:py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl mb-4 text-blue-400">
              1
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Discover & Track</h3>
            <p className="text-gray-400">
              Find relevant jobs, track your applications, and organize your entire job search in one place.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl mb-4 text-blue-400">
              2
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Score & Tailor</h3>
            <p className="text-gray-400">
              Get AI-powered scoring and ATS optimization for your resume, cover letters, and job applications.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl mb-4 text-blue-400">
              3
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Apply & Land Offers</h3>
            <p className="text-gray-400">
              Submit tailored applications with confidence and track your progress toward landing your dream job.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          Simple, Affordable Pricing
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Pay only for what you use. No subscriptions, no hidden fees.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { name: "Starter Pack", credits: 20, price: "$2.99", desc: "Perfect for trying out" },
            { name: "Popular Pack", credits: 50, price: "$4.99", desc: "Best value", popular: true },
            { name: "Pro Pack", credits: 100, price: "$7.99", desc: "Most credits" },
          ].map((plan) => (
            <Link
              href={pricingHref}
              key={plan.name}
              className={`block relative bg-white/5 backdrop-blur rounded-2xl p-6 border transition-all hover:scale-105 ${plan.popular ? "border-blue-500 ring-2 ring-blue-500/30" : "border-white/10"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
              <div className="text-3xl font-bold text-white mb-1">{plan.price}</div>
              <div className="text-blue-400 mb-4">{plan.credits} credits</div>
              <p className="text-gray-400 text-sm">{plan.desc}</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href={pricingHref}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            View all packages →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-6 sm:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Upgrade Your Resume?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Join thousands of job seekers who have landed interviews with CVScan-powered resumes.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400">
            © 2026 CVScan. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href={accountHref} className="text-gray-400 hover:text-white transition-colors">
              {session ? "Dashboard" : "Sign In"}
            </Link>
            <Link href={pricingHref} className="text-gray-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms
            </Link>
            <a href="mailto:support@cv-scan.com" className="text-gray-400 hover:text-white transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
