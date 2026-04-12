import Link from "next/link";

export const metadata = {
  title: "Trust & Security | CVScan",
  description: "Learn how CVScan handles your data, our privacy commitments, and our approach to AI.",
};

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">
          <span className="text-blue-400">CV</span>Scan
        </Link>
        <Link
          href="/"
          className="text-gray-300 hover:text-white transition-colors"
        >
          Back to Home
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Trust & Security
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          We believe your career data is yours. Here is how we protect your privacy,
          secure your information, and navigate AI responsibly.
        </p>
      </section>

      {/* Content Sections */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-12">
          {/* Data Privacy */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="text-3xl mb-4 text-blue-400">🔒 Data Privacy & Ownership</div>
            <h2 className="text-2xl font-semibold text-white mb-4">Your Data is Yours</h2>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <p><strong>Storage & Security:</strong> We use industry-standard encryption and SOC2-compliant infrastructure to store your profile, experiences, and applications.</p>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <p><strong>No Third-Party Selling:</strong> We never sell your personal data or resume information to recruiters, advertisers, or third parties.</p>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <p><strong>Data Deletion:</strong> You have the right to request the complete deletion of your account and all associated data at any time.</p>
              </li>
            </ul>
          </div>

          {/* AI Limitations */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="text-3xl mb-4 text-blue-400">🤖 AI Transparency</div>
            <h2 className="text-2xl font-semibold text-white mb-4">Assisted, Not Automated</h2>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-400 mt-1 mr-3">•</span>
                <p><strong>Human-in-the-Loop Concept:</strong> CVScan generates drafts formatting your achievements. We strongly recommend that you read, review, and edit all AI-generated content before pasting it into your resume or submitting an application.</p>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mt-1 mr-3">•</span>
                <p><strong>Hallucination Risk:</strong> While we use leading enterprise-grade models (Google Gemini) instructed not to fabricate information, AI can still hallucinate. You are responsible for the final accuracy of your applications.</p>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mt-1 mr-3">•</span>
                <p><strong>Data Processing:</strong> Your prompts and profile elements are processed by our AI partners strictly to provide you with the generated text. They are not used to train global AI models.</p>
              </li>
            </ul>
          </div>

          {/* Compliance */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="text-3xl mb-4 text-blue-400">✅ Compliance</div>
            <h2 className="text-2xl font-semibold text-white mb-4">Meeting Standards</h2>
            <p className="text-gray-300 mb-4">
              We are actively rolling out our formal Terms of Service and comprehensive Privacy Policy. 
              In the meantime, these Trust & Security principles govern our handling of your candidate data.
            </p>
            <p className="text-gray-300">
              We aim for fully transparent data handling that respects candidate agency. If you have any compliance questions or data requests, please contact our support team.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-white/10 mt-12 text-center text-gray-400">
        <p>© 2026 CVScan. All rights reserved.</p>
      </footer>
    </main>
  );
}
