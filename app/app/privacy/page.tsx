import Link from "next/link";
import Image from "next/image";
import { APP_NAME, appTitle } from "@/lib/branding";

export const metadata = {
  title: appTitle("Privacy Policy"),
  description: `Privacy policy for ${APP_NAME}.`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#E0F2F1]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-16 w-56 transition-transform duration-300 group-hover:scale-105">
            <Image src="/AI_CV_Scan_Logo.png" alt="AICVScan Logo" fill className="object-contain" priority />
          </div>
        </Link>
        <Link href="/trust" className="text-sm text-[#757575] transition-colors hover:text-[#1A237E]">
          Trust center
        </Link>
      </nav>

      <main className="container mx-auto max-w-4xl px-4 pb-16 pt-10">
        <div className="rounded-[2rem] border border-black/[0.06] bg-white/40 p-8 text-sm text-[#757575] backdrop-blur md:p-10">
          <h1 className="text-4xl font-semibold tracking-tight text-[#1A237E]">Privacy Policy</h1>
          <p className="mt-3 text-[#757575]/70">Last updated: June 2026</p>

          <section className="mt-8 space-y-8 text-base">
            <div>
              <h2 className="text-xl font-semibold text-[#1A237E]">1. Introduction</h2>
              <p className="mt-2 text-[#424242]">
                At {APP_NAME}, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our mobile application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or app.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-[#1A237E]">2. Information We Collect</h2>
              <p className="mt-2 text-[#424242]">
                <strong>Personal Data:</strong> When you register, we collect your name, email address, and authentication credentials.<br/><br/>
                <strong>User Content:</strong> We securely store the resumes, cover letters, and job descriptions you upload to provide our AI analysis services.<br/><br/>
                <strong>Usage Data:</strong> We automatically collect information about your interaction with our service, such as IP address, device type, browser type, and actions taken within the app to improve user experience.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#1A237E]">3. How We Use Your Information</h2>
              <p className="mt-2 text-[#424242]">
                We use the collected information for various purposes:
              </p>
              <ul className="mt-2 list-disc pl-5 text-[#424242] space-y-1">
                <li>To provide, operate, and maintain the Service.</li>
                <li>To process your resume and job ads using AI to generate actionable feedback.</li>
                <li>To manage your account, process payments, and track credit usage.</li>
                <li>To send you administrative emails, such as account verification and security alerts.</li>
                <li>To improve our AI models (only if explicitly opted-in, otherwise data is isolated).</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#1A237E]">4. How We Share Your Information</h2>
              <p className="mt-2 text-[#424242]">
                We do not sell your personal data. We may share your information with:
              </p>
              <ul className="mt-2 list-disc pl-5 text-[#424242] space-y-1">
                <li><strong>Service Providers:</strong> Third-party vendors who assist us in operating our application (e.g., Stripe for payments, Supabase for database hosting, OpenAI/Google for AI processing). These providers are bound by strict confidentiality agreements.</li>
                <li><strong>Legal Requirements:</strong> If required by law, subpoena, or other legal processes.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#1A237E]">5. Data Processing & AI Models</h2>
              <p className="mt-2 text-[#424242]">
                When you submit a resume or job description, the text is securely transmitted to our AI partners (e.g., OpenAI or Google Cloud) solely for the purpose of generating your requested analysis. Our enterprise agreements with these providers stipulate that <strong>your data is NOT used to train their foundational models.</strong>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#1A237E]">6. Data Security</h2>
              <p className="mt-2 text-[#424242]">
                We implement robust, industry-standard security measures, including SSL encryption and secure database architecture, to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#1A237E]">7. Data Retention and Account Deletion</h2>
              <p className="mt-2 text-[#424242]">
                We retain your data for as long as your account is active. <strong>You have the right to request the deletion of your account and all associated data at any time.</strong><br/><br/>
                To delete your account:
                <ol className="mt-2 list-decimal pl-5 text-[#424242] space-y-1">
                  <li>Log into your {APP_NAME} dashboard.</li>
                  <li>Navigate to Account Settings.</li>
                  <li>Click "Delete Account". This action is irreversible and will immediately purge your personal data and resumes from our active databases.</li>
                </ol>
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#1A237E]">8. Children's Privacy</h2>
              <p className="mt-2 text-[#424242]">
                Our Service is not intended for individuals under the age of 16. We do not knowingly collect personal information from children under 16.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#1A237E]">9. Contact Us</h2>
              <p className="mt-2 text-[#424242]">
                If you have questions or comments about this Privacy Policy, please contact us via the support portal in your dashboard or email privacy@{APP_NAME.toLowerCase().replace(' ', '')}.com.
              </p>
            </div>
            
            <div className="pt-6 border-t border-black/10">
              <p className="text-sm text-[#757575]">
                By using {APP_NAME}, you consent to our Privacy Policy.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
