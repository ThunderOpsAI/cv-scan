"use client";

import { useSession } from "next-auth/react";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-white">
          <span className="text-blue-400">CV</span>Scan
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-300 hover:text-white">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Your Profile</h1>
              <p className="text-gray-400">Build your professional profile</p>
            </div>
            {profile && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Strength */}
          {strength && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Profile Strength</h2>
                <span className="text-3xl font-bold text-blue-400">
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
                  <p className="text-gray-400 text-sm font-semibold">Recommendations:</p>
                  {strength.recommendations.map((rec, i) => (
                    <p key={i} className="text-gray-300 text-sm">
                      • {rec}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Form/View */}
          {editing ? (
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
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
                  <label className="block text-white mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Professional Headline</label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Professional Summary</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    rows={4}
                    placeholder="Brief overview of your experience and expertise..."
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Portfolio URL</label>
                  <input
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/yourusername"
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
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
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          ) : profile ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{profile.full_name}</h2>
                  {profile.headline && <p className="text-blue-400 text-lg">{profile.headline}</p>}
                </div>

                {profile.summary && (
                  <div>
                    <h3 className="text-white font-semibold mb-2">Summary</h3>
                    <p className="text-gray-300">{profile.summary}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {profile.phone && (
                    <div>
                      <h3 className="text-white font-semibold mb-1">Phone</h3>
                      <p className="text-gray-300">{profile.phone}</p>
                    </div>
                  )}
                  {profile.location && (
                    <div>
                      <h3 className="text-white font-semibold mb-1">Location</h3>
                      <p className="text-gray-300">{profile.location}</p>
                    </div>
                  )}
                </div>

                {(profile.linkedin_url || profile.portfolio_url || profile.github_url) && (
                  <div>
                    <h3 className="text-white font-semibold mb-2">Links</h3>
                    <div className="space-y-2">
                      {profile.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-400 hover:text-blue-300"
                        >
                          LinkedIn →
                        </a>
                      )}
                      {profile.portfolio_url && (
                        <a
                          href={profile.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-400 hover:text-blue-300"
                        >
                          Portfolio →
                        </a>
                      )}
                      {profile.github_url && (
                        <a
                          href={profile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-400 hover:text-blue-300"
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
              href="/dashboard/profile/experience"
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-500/50 transition-all"
            >
              <h3 className="text-lg font-bold text-white mb-2">Experience</h3>
              <p className="text-gray-400 text-sm">Add your work history</p>
            </Link>

            <Link
              href="/dashboard/profile/education"
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-500/50 transition-all"
            >
              <h3 className="text-lg font-bold text-white mb-2">Education</h3>
              <p className="text-gray-400 text-sm">Add your degrees</p>
            </Link>

            <Link
              href="/dashboard/profile/skills"
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-500/50 transition-all"
            >
              <h3 className="text-lg font-bold text-white mb-2">Skills</h3>
              <p className="text-gray-400 text-sm">List your expertise</p>
            </Link>

            <Link
              href="/dashboard/profile/stories"
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-500/50 transition-all"
            >
              <h3 className="text-lg font-bold text-white mb-2">STAR Stories</h3>
              <p className="text-gray-400 text-sm">Build interview answers</p>
            </Link>

            <Link
              href="/dashboard/profile/goals"
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-500/50 transition-all"
            >
              <h3 className="text-lg font-bold text-white mb-2">SMART Goals</h3>
              <p className="text-gray-400 text-sm">Track career goals</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
