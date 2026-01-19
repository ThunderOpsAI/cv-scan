"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

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
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">
          <span className="text-blue-400">Bullet</span>Pro
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-white">
            <span className="text-gray-400">Credits:</span>{" "}
            <span className="font-bold text-blue-400">{session.user.credits}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-400 mb-8">
            You have <span className="text-blue-400 font-semibold">{session.user.credits} credits</span> remaining
          </p>

          {/* User Info Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Account Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{session.user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">User ID:</span>
                <span className="text-white font-mono text-sm">{session.user.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Credits:</span>
                <span className="text-blue-400 font-bold">{session.user.credits}</span>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/generate/bullets"
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-500/50 transition-all group"
            >
              <div className="text-3xl mb-3">📝</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                Generate Bullet Points
              </h3>
              <p className="text-gray-400 mb-3">
                Transform job duties into polished, ATS-optimized resume bullets
              </p>
              <div className="text-blue-400 text-sm">1 credit per generation</div>
            </Link>

            <Link
              href="/generate/cover-letter"
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-500/50 transition-all group"
            >
              <div className="text-3xl mb-3">✉️</div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                Generate Cover Letter
              </h3>
              <p className="text-gray-400 mb-3">
                Create a tailored cover letter from your resume and job description
              </p>
              <div className="text-blue-400 text-sm">2 credits per generation</div>
            </Link>
          </div>

          {/* Buy Credits CTA */}
          {session.user.credits < 5 && (
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Running low on credits?</h3>
              <p className="text-blue-100 mb-4">Purchase more credits to keep generating content</p>
              <Link
                href="/buy-credits"
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all"
              >
                Buy Credits
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
