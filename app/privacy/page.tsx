import Link from "next/link";
import { APP_NAME, appTitle, brandWordmark } from "@/lib/branding";

const brand = brandWordmark();

export const metadata = {
  title: appTitle("Privacy Policy"),
  description: `How ${APP_NAME} collects, uses, and protects personal data.`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-5">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white">
          <span className="text-cyan-300">{brand.leading}</span>
          {brand.trailing}
        </Link>
        <Link href="/trust" className="text-sm text-slate-300 transition-colors hover:text-white">
          Trust center
        </Link>
      </nav>

      <main className="container mx-auto max-w-4xl px-4 pb-16 pt-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/6 p-8 text-sm text-slate-300 backdrop-blur md:p-10">
          <h1 className="text-4xl font-semibold tracking-tight text-white">Privacy Policy</h1>
          <p className="mt-3 text-slate-500">Last updated: May 2026</p>

          <section className="mt-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white">1. Information we collect</h2>
              <p className="mt-2">
                We collect the account, profile, and workflow information you provide when using {APP_NAME}, including email address, professional background, and application-related content.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">2. How we use it</h2>
              <p className="mt-2">
                We use your data to run scanning, interview practice, application support, billing, and product improvement tied to the service experience.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">3. AI processing</h2>
              <p className="mt-2">
                Relevant prompts and profile context may be sent to third-party AI providers to generate the requested output. That processing is limited to product functionality.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">4. Sharing</h2>
              <p className="mt-2">
                We do not sell your personal data. We share data only with service providers needed to operate the platform, such as hosting, payments, and AI infrastructure partners.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">5. Retention and deletion</h2>
              <p className="mt-2">
                You retain ownership of your data and can request deletion of your account and stored information according to our operational and legal retention requirements.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
