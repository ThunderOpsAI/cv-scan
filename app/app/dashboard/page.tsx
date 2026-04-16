"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    const paymentStatus = searchParams.get("payment");
    const subscriptionStatus = searchParams.get("subscription");
    if (paymentStatus === "success") {
      setMessage({ text: "Payment successful! Your credits are being added to your account.", type: "success" });
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
    } else if (paymentStatus === "cancelled") {
      setMessage({ text: "Payment was cancelled.", type: "error" });
    } else if (subscriptionStatus === "success") {
      setMessage({
        text: "Subscription updated. Your plan may take a moment to refresh — sign out and back in if needed.",
        type: "success",
      });
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
    }
  }, [status, router, searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {message && (
        <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 p-4 rounded-xl shadow-2xl border backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === "success"
          ? "bg-green-500/20 border-green-500/50 text-green-100"
          : "bg-red-500/20 border-red-500/50 text-red-100"
          }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{message.type === "success" ? "✅" : "⚠️"}</span>
            <p className="font-medium">{message.text}</p>
            <button onClick={() => setMessage(null)} className="ml-2 hover:text-white">✕</button>
          </div>
        </div>
      )}
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4 sm:py-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <Link href="/" className="text-2xl font-bold text-white">
          <span className="text-blue-400">CV</span>Scan
        </Link>
        <div className="w-full sm:w-auto flex items-center justify-between gap-4">

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header with Welcome and Account Info */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Welcome back, {session.user.name}!
              </h1>
              <p className="text-gray-400">
                Ready to optimize your job search
              </p>
            </div>

            {/* Account Information - Compact Box */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 w-full md:min-w-[280px]">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Account Info</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Email:</span>
                  <span className="text-white text-sm max-w-[65%] truncate text-right">{session.user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Onboarding */}
          <div className="mb-8">
            <Link
              href="/dashboard/onboarding"
              className="block bg-gradient-to-r from-violet-600/25 to-fuchsia-600/25 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-violet-500/30 hover:border-violet-400/50 transition-all"
            >
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Activation checklist</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Career memory → your path → first job fit (optional guided path)
                  </p>
                </div>
                <span className="text-violet-300 text-sm font-semibold shrink-0">Open →</span>
              </div>
            </Link>
          </div>

          {/* Profile Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Your Profile</h2>
            <Link
              href="/dashboard/profile"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-5 sm:p-6 border border-blue-500/50 hover:border-blue-400 transition-all block group"
            >
              <div className="flex justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-blue-100 transition-colors">
                    Build Your Professional Profile
                  </h3>
                  <p className="text-blue-100 mb-3">
                    Create your profile with experiences, education, and skills for better job matching
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl shrink-0">👤</div>
              </div>
            </Link>
          </div>

          {/* Job Applications */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Job Applications</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Link
                href="/dashboard/job-fit"
                className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-cyan-500/30 hover:border-cyan-400/50 transition-all group"
              >
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  Job fit
                </h3>
                <p className="text-gray-400 mb-3">
                  Apply, stretch, or skip — grounded in your approved profile facts
                </p>
              </Link>

              <Link
                href="/dashboard/scanner"
                className="bg-gradient-to-r from-green-600/20 to-teal-600/20 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-green-500/30 hover:border-green-400/50 transition-all group"
                data-testid="ats-scanner-link"
              >
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                  ATS Scanner
                </h3>
                <p className="text-gray-400 mb-3">
                  Check how well your profile matches any job description
                </p>
              </Link>

              <Link
                href="/dashboard/job-packs"
                className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all group"
                data-testid="job-packs-link"
              >
                <div className="text-3xl mb-3">📦</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  Job Packs
                </h3>
                <p className="text-gray-400 mb-3">
                  Complete application package: tailored resume, cover letter, ATS analysis
                </p>
              </Link>

              <Link
                href="/dashboard/applications"
                className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-orange-500/30 hover:border-orange-400/50 transition-all group"
                data-testid="application-tracker-link"
              >
                <div className="text-3xl mb-3">📋</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  Application Tracker
                </h3>
                <p className="text-gray-400 mb-3">
                  Track applications, interviews, and generate follow-up emails
                </p>
                <div className="text-orange-400 text-sm">Kanban + List views</div>
              </Link>
            </div>
          </div>

          {/* Intelligence Features */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Intelligence</h2>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <Link
                href="/dashboard/copilot"
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-white/20 hover:border-blue-500/50 transition-all group"
              >
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  Career Copilot
                </h3>
                <p className="text-gray-400 mb-3">
                  Chat with your personal assistant for general career advice
                </p>
              </Link>

              <Link
                href="/dashboard/interview"
                className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all group"
              >
                <div className="text-3xl mb-3">🎙️</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  Mock Interview
                </h3>
                <p className="text-gray-400 mb-3">
                  Practice answering questions with an AI hiring manager
                </p>
              </Link>

              <Link
                href="/dashboard/jobs"
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-white/20 hover:border-blue-500/50 transition-all group"
              >
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  Discover Jobs
                </h3>
                <p className="text-gray-400 mb-3">
                  Find jobs matched to your profile with intelligent scoring
                </p>
                <div className="text-blue-400 text-sm">Free job discovery</div>
              </Link>

              <Link
                href="/dashboard/profile/stories"
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-white/20 hover:border-blue-500/50 transition-all group"
              >
                <div className="text-3xl mb-3">🌟</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  STAR Stories
                </h3>
                <p className="text-gray-400 mb-3">
                  Structure your interview answers with the STAR method
                </p>
                <div className="text-blue-400 text-sm">Profile context</div>
              </Link>

              <Link
                href="/dashboard/profile/goals"
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-500/50 transition-all group"
              >
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  SMART Goals
                </h3>
                <p className="text-gray-400 mb-3">
                  Set and track specific career objectives
                </p>
                <div className="text-blue-400 text-sm">Career tracking</div>
              </Link>
            </div>
          </div>

          {/* Generation Tools */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Content Generation</h2>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <Link
                href="/generate/bullets"
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-white/20 hover:border-blue-500/50 transition-all group"
              >
                <div className="text-3xl mb-3">📝</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  Generate Bullet Points
                </h3>
                <p className="text-gray-400 mb-3">
                  Transform job duties into polished, ATS-optimized resume bullets
                </p>
              </Link>

              <Link
                href="/generate/cover-letter"
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-white/20 hover:border-blue-500/50 transition-all group"
              >
                <div className="text-3xl mb-3">✉️</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  Generate Cover Letter
                </h3>
                <p className="text-gray-400 mb-3">
                  Create a tailored cover letter from your resume and job description
                </p>
              </Link>
            </div>
          </div>

          {/* User ID Footer - Discreetly displayed */}
          <div className="mt-12 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-600 font-mono">
              User ID: <span className="select-all">{session.user.id}</span>
            </p>
          </div>
        </div>
      </div>
    </div >
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
