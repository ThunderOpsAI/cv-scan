import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Privacy Policy | AICVScan",
  description: "How AICVScan collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#E0F2F1]">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-16 w-56 transition-transform duration-300 group-hover:scale-105">
            <Image src="/AI_CV_Scan_Logo.png" alt="AICVScan Logo" fill className="object-contain" priority />
          </div>
        </Link>
        <Link href="/trust" className="text-[#757575] hover:text-[#1A237E] transition-colors">
          Trust & Security Center
        </Link>
      </nav>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white/40 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-black/[0.06] text-[#757575]">
          <h1 className="text-4xl font-bold text-[#1A237E] mb-6">Privacy Policy</h1>
          <p className="mb-8">Last Updated: April 2026</p>

          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-[#1A237E] mb-3">1. Information We Collect</h2>
              <p>
                We collect information that you directly provide to us when you use the platform, build your profile, upload your resume, or communicate with us. This includes:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Professional history, skills, education, and career goals.</li>
                <li>Account sign-in identifiers and authentication events handled via magic-link email.</li>
                <li>Approved Career Memory facts and generated application drafts.</li>
                <li>Job application tracking data.</li>
                <li>Payment and entitlement data processed securely by Stripe or Google Play Billing services.</li>
                <li>Product analytics events such as feature usage and error states. These events do not include resume text, job descriptions, cover letters, or raw messages.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[#1A237E] mb-3">2. How We Use Your Data</h2>
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
              <h2 className="text-2xl font-semibold text-[#1A237E] mb-3">3. Artificial Intelligence &amp; Sub-Processors</h2>
              <p>
                CVScan uses third-party AI models such as Google Gemini and OpenAI to provide core functionality.
                When you use generation tools, the relevant approved profile facts, job details, and prompt instructions are sent to these providers to generate the requested content.
                Their handling of submitted data is governed by the provider terms and privacy commitments that apply to the configured account.
              </p>
              <p className="mt-2">
                AI-processed data may be transiently retained by our AI providers for up to 30 days for safety monitoring purposes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[#1A237E] mb-3">4. Data Sharing</h2>
              <p>
                We do not sell your personal data. We may share your data with third-party vendors, consultants, and service providers who need access to such information to carry out work on our behalf (e.g., Stripe for payment processing, Supabase for hosting).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[#1A237E] mb-3">5. Data Export</h2>
              <p>
                You can request an export of your account data, including approved profile facts and generated assets. For V1, contact privacy@cvscan.com.au from the email address on your account and we will provide a machine-readable export after verifying the request.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[#1A237E] mb-3">6. Data Retention &amp; Deletion</h2>
              <p>
                You own your data. You can delete your account and all associated data at any time directly through your account profile within the app (<strong className="text-[#1A237E]">Dashboard → Profile → Delete Account</strong>). If you no longer have access to the app, you may request deletion without logging in at{" "}
                <Link href="/delete-account" className="text-[#26A69A] hover:text-[#2bbbad] underline">
                  cvscan.com.au/delete-account
                </Link>{" "}
                or by emailing <a href="mailto:privacy@cvscan.com.au" className="text-[#26A69A] hover:text-[#2bbbad] underline">privacy@cvscan.com.au</a>.
              </p>
              <p className="mt-2">
                Upon deletion, your data is permanently removed from our active databases and subsequently purged from backups in accordance with standard data retention policies. Uploaded documents (e.g., resumes) are stored in strictly isolated storage buckets exclusively accessible by your authenticated user ID via Row Level Security, and they are fully expunged upon account deletion.
              </p>
              <p className="mt-2">
                <strong className="text-[#1A237E]">Note on billing records:</strong> Stripe billing records related to completed transactions (transaction metadata only — no resume or application content) may be retained for up to 7 years in compliance with financial regulations and cannot be deleted on demand.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[#1A237E] mb-3">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@cvscan.com.au.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
