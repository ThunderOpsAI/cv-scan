"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Profile, ProfileStrength } from "@/types/profile";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [strength, setStrength] = useState<ProfileStrength | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    headline: "",
    summary: "",
    phone: "",
    location: "",
    linkedin_url: "",
    portfolio_url: "",
    github_url: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchProfile();
      fetchStrength();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setFormData({
          full_name: data.profile.full_name || "",
          headline: data.profile.headline || "",
          summary: data.profile.summary || "",
          phone: data.profile.phone || "",
          location: data.profile.location || "",
          linkedin_url: data.profile.linkedin_url || "",
          portfolio_url: data.profile.portfolio_url || "",
          github_url: data.profile.github_url || "",
        });
      } else {
        setEditing(true);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStrength = async () => {
    try {
      const res = await fetch("/api/profile/strength");
      const data = await res.json();
      setStrength(data.strength);
    } catch (error) {
      console.error("Failed to fetch strength:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setEditing(false);
        fetchStrength();
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className=" flex items-center justify-center">
        <div className="text-[#1A237E] text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-[#1A237E]">
          <span className="text-[#26A69A]">CV</span>Scan
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[#607086] hover:text-[#1A237E]">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Data Export & Deletion */}
          <div className="mb-8 p-6 bg-white/40 border border-black/[0.06] rounded-xl">
            <h2 className="text-2xl font-semibold text-[#1A237E] mb-3">Data Export & Deletion</h2>
            <p className="text-[#607086] mb-2">
              You can request an export of your account data, including approved profile facts and generated assets. For V1, contact <a href="mailto:privacy@cvscan.com.au" className="underline text-[#26A69A]">privacy@cvscan.com.au</a> from the email address on your account and we will provide a machine-readable export after verifying the request.
            </p>
            <button
              className="mb-2 bg-blue-600 hover:bg-blue-700 text-[#1A237E] px-4 py-2 rounded-lg font-semibold"
              onClick={async () => {
                const [factsRes, assetsRes] = await Promise.all([
                  fetch("/api/profile/facts"),
                  fetch("/api/generated-assets"),
                ]);
                const facts = await factsRes.json();
                const assets = await assetsRes.json();
                const data = { profile_facts: facts.facts || [], generated_assets: assets.assets || [] };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "cvscan-data-export.json";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              Download Profile Facts & Generated Assets (JSON)
            </button>
            <p className="text-[#607086] mb-2 mt-4 text-sm border-t border-white/10 pt-4">
              If you wish to permanently delete your account and all associated data, you may delete your account below. This action cannot be undone.
            </p>
            <button
              onClick={async () => {
                const confirmed = window.confirm(
                  "Are you absolutely sure you want to permanently delete your account? This action cannot be undone and all data will be lost."
                );
                if (confirmed) {
                  try {
                    const res = await fetch("/api/profile/delete-account", { method: "DELETE" });
                    if (res.ok) {
                      await signOut({ callbackUrl: "/" });
                    } else {
                      const data = await res.json();
                      alert(data.error || "Failed to delete account. Please try again later.");
                    }
                  } catch (err) {
                    alert("An error occurred. Please try again.");
                  }
                }
              }}
              className="mb-2 bg-red-600 hover:bg-red-700 text-[#1A237E] px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Delete Account
            </button>
            <p className="text-[#607086]/80 text-xs mt-2">
              Upon deletion, your data is permanently removed from our active databases and subsequently purged from backups in accordance with standard data retention policies.
            </p>
          </div>
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#1A237E] mb-2">Your Profile</h1>
              <p className="text-[#607086]/80">Build your professional profile</p>
            </div>
            {profile && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-[#1A237E] px-6 py-2 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Strength */}
          {strength && (
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-black/[0.06] mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#1A237E]">Profile Strength</h2>
                <span className="text-3xl font-bold text-[#26A69A]">
                  {strength.overall_percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all"
                  style={{ width: `${strength.overall_percentage}%` }}
                />
              </div>
              {strength.recommendations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[#607086]/80 text-sm font-semibold">Recommendations:</p>
                  {strength.recommendations.map((rec, i) => (
                    <p key={i} className="text-[#607086] text-sm">
                      • {rec}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Form/View */}
          {editing ? (
            <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-black/[0.06]">
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-yellow-100 font-semibold">Unsaved Changes</p>
                  <p className="text-yellow-200/80 text-sm">
                    You must click "Save Profile" at the bottom to apply your changes. Leaving this page will discard them.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[#1A237E] mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[#1A237E] mb-2">Professional Headline</label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[#1A237E] mb-2">Professional Summary</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    rows={4}
                    placeholder="Brief overview of your experience and expertise..."
                    className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#1A237E] mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[#1A237E] mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                      className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#1A237E] mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[#1A237E] mb-2">Portfolio URL</label>
                  <input
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[#1A237E] mb-2">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/yourusername"
                    className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-[#1A237E] px-6 py-2 rounded-lg transition-colors"
                  >
                    Save Profile
                  </button>
                  {profile && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          full_name: profile.full_name || "",
                          headline: profile.headline || "",
                          summary: profile.summary || "",
                          phone: profile.phone || "",
                          location: profile.location || "",
                          linkedin_url: profile.linkedin_url || "",
                          portfolio_url: profile.portfolio_url || "",
                          github_url: profile.github_url || "",
                        });
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-[#1A237E] px-6 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          ) : profile ? (
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-black/[0.06]">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A237E]">{profile.full_name}</h2>
                  {profile.headline && <p className="text-[#26A69A] text-lg">{profile.headline}</p>}
                </div>

                {profile.summary && (
                  <div>
                    <h3 className="text-[#1A237E] font-semibold mb-2">Summary</h3>
                    <p className="text-[#607086]">{profile.summary}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {profile.phone && (
                    <div>
                      <h3 className="text-[#1A237E] font-semibold mb-1">Phone</h3>
                      <p className="text-[#607086]">{profile.phone}</p>
                    </div>
                  )}
                  {profile.location && (
                    <div>
                      <h3 className="text-[#1A237E] font-semibold mb-1">Location</h3>
                      <p className="text-[#607086]">{profile.location}</p>
                    </div>
                  )}
                </div>

                {(profile.linkedin_url || profile.portfolio_url || profile.github_url) && (
                  <div>
                    <h3 className="text-[#1A237E] font-semibold mb-2">Links</h3>
                    <div className="space-y-2">
                      {profile.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[#26A69A] hover:text-[#26A69A]"
                        >
                          LinkedIn →
                        </a>
                      )}
                      {profile.portfolio_url && (
                        <a
                          href={profile.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[#26A69A] hover:text-[#26A69A]"
                        >
                          Portfolio →
                        </a>
                      )}
                      {profile.github_url && (
                        <a
                          href={profile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[#26A69A] hover:text-[#26A69A]"
                        >
                          GitHub →
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <Link
              href="/dashboard/profile/facts"
              className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-black/[0.06] hover:border-[#26A69A]/30 transition-all group"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-[#26A69A] mb-3">Approved facts</div>
              <h3 className="text-lg font-bold text-[#1A237E] mb-2 group-hover:text-[#26A69A] transition-colors">Career Memory</h3>
              <p className="text-[#607086]/80 text-sm">Import your resume and approve facts before generation uses them</p>
            </Link>

            <Link
              href="/dashboard/profile/experience"
              className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-black/[0.06] hover:border-[#26A69A]/30 transition-all group"
            >
              <div className="text-2xl mb-2">💼</div>
              <h3 className="text-lg font-bold text-[#1A237E] mb-2 group-hover:text-[#26A69A] transition-colors">Experience</h3>
              <p className="text-[#607086]/80 text-sm">Add your work history</p>
            </Link>

            <Link
              href="/dashboard/profile/education"
              className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-black/[0.06] hover:border-[#26A69A]/30 transition-all group"
            >
              <div className="text-2xl mb-2">🎓</div>
              <h3 className="text-lg font-bold text-[#1A237E] mb-2 group-hover:text-[#26A69A] transition-colors">Education</h3>
              <p className="text-[#607086]/80 text-sm">Add your degrees</p>
            </Link>

            <Link
              href="/dashboard/profile/skills"
              className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-black/[0.06] hover:border-[#26A69A]/30 transition-all group"
            >
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="text-lg font-bold text-[#1A237E] mb-2 group-hover:text-[#26A69A] transition-colors">Skills</h3>
              <p className="text-[#607086]/80 text-sm">List your expertise</p>
            </Link>

            <Link
              href="/dashboard/profile/stories"
              className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-black/[0.06] hover:border-[#26A69A]/30 transition-all group"
            >
              <div className="text-2xl mb-2">🌟</div>
              <h3 className="text-lg font-bold text-[#1A237E] mb-2 group-hover:text-[#26A69A] transition-colors">STAR Stories</h3>
              <p className="text-[#607086]/80 text-sm">Build interview answers</p>
            </Link>

            <Link
              href="/dashboard/profile/goals"
              className="bg-white/40 backdrop-blur-lg rounded-xl p-6 border border-black/[0.06] hover:border-[#26A69A]/30 transition-all group"
            >
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="text-lg font-bold text-[#1A237E] mb-2 group-hover:text-[#26A69A] transition-colors">SMART Goals</h3>
              <p className="text-[#607086]/80 text-sm">Track career goals</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
