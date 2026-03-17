import Link from "next/link";

export const metadata = {
  title: "Terms of Service | CVScan",
  description: "Terms and conditions for using CVScan.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">
          <span className="text-blue-400">CV</span>Scan
        </Link>
        <Link href="/trust" className="text-gray-300 hover:text-white transition-colors">
          Trust & Security Center
        </Link>
      </nav>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/10 text-gray-300">
          <h1 className="text-4xl font-bold text-white mb-6">Terms of Service</h1>
          <p className="mb-8">Last Updated: March 2026</p>

          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the CVScan platform, you agree to be bound by these Terms of Service. If you do not agree, you must not use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">2. Description of Service</h2>
              <p>
                CVScan is an AI-powered career assistant providing resume scoring, cover letter generation, job tracking, and application insights on a pay-as-you-go credit basis.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">3. Credits and Payments</h2>
              <p>
                Our services require "credits" to perform specific AI-generation actions. Credits can be purchased via our payment processor, Stripe.
                Credits are non-refundable except where legally required. Credits do not expire as long as your account remains active.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">4. AI Output Disclaimer</h2>
              <p>
                Our tools utilize generative artificial intelligence. While we strive for high quality, AI outputs may contain errors, hallucinations, or formatting issues.
                <strong> You are solely responsible for reviewing, verifying, and editing all AI-generated content before submitting it to a potential employer.</strong>
                CVScan does not guarantee job placement, interview outcomes, or the absolute accuracy of output content.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">5. User Conduct</h2>
              <p>
                You agree not to use CVScan to generate fraudulent, misleading, or malicious content. You must not attempt to bypass our credit system, scrape our databases, or reverse-engineer our platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Modifications to Service</h2>
              <p>
                We reserve the right to modify or discontinue any aspect of our service at any time without notice. We will not be liable to you or any third party for modification or cessation of the service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">Contact</h2>
              <p>
                Legal inquiries should be directed to legal@cvscan.com.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
