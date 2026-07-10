import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete Your Account | AI CV Scan",
  description:
    "Request deletion of your AI CV Scan account and all associated personal data. No app download required.",
  robots: "noindex, nofollow", // avoid search indexing of deletion URL
};

export default function DeleteAccountPage() {
  return (
    <div className="">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-[#1A237E]">
          <span className="text-[#26A69A]">AI CV</span> Scan
        </Link>
        <Link
          href="/privacy"
          className="text-[#607086] hover:text-[#1A237E] transition-colors text-sm"
        >
          Privacy Policy
        </Link>
      </nav>

      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-white/40 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/10 text-[#607086]">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#1A237E] mb-3">
              Delete Your AI CV Scan Account
            </h1>
            <p className="text-[#607086]/80 leading-relaxed">
              You can request deletion of your account and all associated data
              at any time — no app download required.
            </p>
          </div>

          {/* Option 1: In-App */}
          <div className="mb-6 p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <h2 className="text-lg font-semibold text-[#1A237E] mb-2 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-[#26A69A]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 9 2.25 2.25L15 9"
                />
              </svg>
              Option 1 — Delete directly in the app (instant)
            </h2>
            <p className="text-sm text-[#607086] mb-3">
              The fastest way to delete your account and data is directly inside
              the AI CV Scan app:
            </p>
            <ol className="text-sm text-[#607086]/80 space-y-1 list-decimal pl-5">
              <li>Open AI CV Scan on your device</li>
              <li>Tap <strong className="text-gray-200">Dashboard → Profile</strong></li>
              <li>Scroll to <strong className="text-gray-200">Data Export & Deletion</strong></li>
              <li>Tap <strong className="text-gray-200">Delete Account</strong> and confirm</li>
            </ol>
            <p className="text-xs text-gray-500 mt-3">
              Account deletion is immediate and permanent. All associated data
              is removed from our systems within 72 hours.
            </p>
          </div>

          {/* Option 2: Email request */}
          <div className="mb-6 p-5 rounded-2xl bg-white/40 border border-white/10">
            <h2 className="text-lg font-semibold text-[#1A237E] mb-2 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-[#607086]/80"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
              Option 2 — Request via email (1–3 business days)
            </h2>
            <p className="text-sm text-[#607086] mb-3">
              If you no longer have access to the app, send a deletion request
              from the email address associated with your account:
            </p>
            <a
              href="mailto:privacy@cvscan.com.au?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20AI%20CV%20Scan%20account%20and%20all%20associated%20data.%20My%20registered%20email%20address%20is%3A%20%5Byour%20email%20here%5D"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/60 hover:bg-white/15 border border-black/[0.06] text-[#1A237E] text-sm font-medium transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
              Email privacy@cvscan.com.au
            </a>
            <p className="text-xs text-gray-500 mt-3">
              Please include the email address associated with your account.
              We will verify your identity and process your request within 1–3
              business days.
            </p>
          </div>

          {/* What gets deleted */}
          <div className="mb-8 p-5 rounded-2xl bg-white/40 border border-white/10">
            <h2 className="text-base font-semibold text-[#1A237E] mb-3">
              What data is deleted?
            </h2>
            <ul className="text-sm text-[#607086]/80 space-y-1.5">
              {[
                "Your account credentials and profile information",
                "Career facts, resume content, and profile history",
                "AI-generated outputs (cover letters, bullet points, etc.)",
                "Job tracking records and fit analysis results",
                "Uploaded resume files and documents",
                "Credit balance and purchase entitlement records",
                "Feature usage analytics (no raw CV content stored)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-3 border-t border-white/10 pt-3">
              <strong className="text-[#607086]/80">Note:</strong> Stripe billing
              records related to completed transactions may be retained for up
              to 7 years in compliance with financial regulations. This is
              limited to transaction metadata and does not include resume or
              application content.
            </p>
          </div>

          {/* Footer links */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-[#607086] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#607086] transition-colors">
              Terms of Service
            </Link>
            <a
              href="mailto:support@cvscan.com.au"
              className="hover:text-[#607086] transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
