import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | CVScan",
  description: "How CVScan collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold text-white mb-6">Privacy Policy</h1>
          <p className="mb-8">Last Updated: April 2026</p>

          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <p>
                We collect information that you directly provide to us when you use the platform, build your profile, upload your resume, or communicate with us. <strong>During the public beta, we do not require accounts, authentication, or payment information. No billing data is collected.</strong> This includes:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Professional history, skills, education, and career goals.</li>
                <li>Approved Career Memory facts and generated application drafts.</li>
                <li>Job application tracking data.</li>
                <li>Product analytics events such as feature usage and error states. These events do not include resume text, job descriptions, cover letters, or raw messages.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">2. How We Use Your Data</h2>
              <p>
                We use the information we collect to operate, test, and improve CVScan. Specifically to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide you with AI-driven resume scoring and tailoring.</li>
                <li>Generate cover letters and interview prep materials.</li>
                <li>Process transactions and send related information.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">3. Artificial Intelligence & Sub-Processors</h2>
              <p>
                CVScan uses third-party AI models (such as Google Gemini) to provide core functionality.
                When you use generation tools, the relevant approved profile facts, job details, and prompt instructions are sent to these providers to generate the requested content.
                <strong> Our AI partners are contractually prohibited from using your personal data to train their foundational models.</strong>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">4. Data Sharing</h2>
              <p>
                We do not sell your personal data. We may share your data with third-party vendors, consultants, and service providers who need access to such information to carry out work on our behalf (e.g., Stripe for payment processing, Supabase for hosting).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">5. Data Export</h2>
              <p>
                You can request an export of your account data, including approved profile facts and generated assets. For V1, contact privacy@cvscan.com from the email address on your account and we will provide a machine-readable export after verifying the request.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">6. Data Retention & Deletion</h2>
              <p>
                You own your data. You can delete your account and all associated data at any time through your account settings or by contacting support. 
                Upon deletion, your data is permanently removed from our active databases and subsequently purged from backups in accordance with standard data retention policies.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@cvscan.com.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
