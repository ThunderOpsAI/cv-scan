import Link from "next/link";

export const metadata = {
  title: "Pricing | CVScan",
  description: "Simple, transparent pay-as-you-go pricing for CVScan. No subscriptions.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">
          <span className="text-blue-400">CV</span>Scan
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/auth/signin" className="text-gray-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          No subscriptions. No hidden fees. Pay only for what you use when you need it.
        </p>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter Pack */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-white mb-2">Starter Pack</h3>
            <p className="text-gray-400 mb-6 text-center">Perfect for trying out the platform</p>
            <div className="text-4xl font-bold text-white mb-2">$2.99</div>
            <div className="text-blue-400 font-semibold mb-8">20 Credits</div>
            <ul className="space-y-4 text-gray-300 mb-8 w-full text-left">
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span> ~4-5 Job Applications
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span> Full ATS Scanning
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span> Cover Letter Generation
              </li>
            </ul>
            <Link
              href="/auth/signin"
              className="w-full mt-auto bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Get Starter Pack
            </Link>
          </div>

          {/* Popular Pack */}
          <div className="bg-blue-600/20 backdrop-blur-lg rounded-3xl p-8 border border-blue-500 relative flex flex-col items-center transform md:-translate-y-4">
            <div className="absolute -top-4 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Popular Pack</h3>
            <p className="text-blue-200 mb-6 text-center">Ideal for active job seekers</p>
            <div className="text-4xl font-bold text-white mb-2">$4.99</div>
            <div className="text-blue-400 font-semibold mb-8">50 Credits</div>
            <ul className="space-y-4 text-gray-300 mb-8 w-full text-left">
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span> ~10-12 Job Applications
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span> Full ATS Scanning
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span> Cover Letter Generation
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span> Track Unlimited Jobs
              </li>
            </ul>
            <Link
              href="/auth/signin"
              className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25"
            >
              Get Popular Pack
            </Link>
          </div>

          {/* Pro Pack */}
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-white mb-2">Pro Pack</h3>
            <p className="text-gray-400 mb-6 text-center">For serious career transitions</p>
            <div className="text-4xl font-bold text-white mb-2">$7.99</div>
            <div className="text-blue-400 font-semibold mb-8">100 Credits</div>
            <ul className="space-y-4 text-gray-300 mb-8 w-full text-left">
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span> ~20-25 Job Applications
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span> Full ATS Scanning
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span> Cover Letter Generation
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span> Priority Support
              </li>
            </ul>
            <Link
              href="/auth/signin"
              className="w-full mt-auto bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Get Pro Pack
            </Link>
          </div>
        </div>
      </section>

      {/* Credit Usage Explanation */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">How Credits Work</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <ul className="space-y-4 text-gray-300">
                <li className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span>ATS Match Scan</span>
                  <span className="text-blue-400 font-semibold">1 Credit</span>
                </li>
                <li className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span>Resume Bullet Generation</span>
                  <span className="text-blue-400 font-semibold">1 Credit</span>
                </li>
                <li className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span>Cover Letter Generation</span>
                  <span className="text-blue-400 font-semibold">2 Credits</span>
                </li>
              </ul>
            </div>
            <div>
               <ul className="space-y-4 text-gray-300">
                <li className="flex justify-between items-center text-gray-500 pb-2">
                  <span>Job Search Aggregator</span>
                  <span>Free</span>
                </li>
                <li className="flex justify-between items-center text-gray-500 pb-2">
                  <span>Application Tracking Board</span>
                  <span>Free</span>
                </li>
                <li className="flex justify-between items-center text-gray-500 pb-2">
                  <span>Profile Storage</span>
                  <span>Free</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to land more interviews?</h2>
        <p className="text-gray-400 mb-6">Every new user gets 3 free credits to try the platform.</p>
        <Link
          href="/auth/signin"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
        >
          Create Free Account
        </Link>
      </section>
    </div>
  );
}
