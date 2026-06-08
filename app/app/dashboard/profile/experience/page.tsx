"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Experience, Bullet } from "@/types/profile";

export default function ExperiencePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [bullets, setBullets] = useState<Record<string, Bullet[]>>({});
  const [loading, setLoading] = useState(true);
  const [showExpForm, setShowExpForm] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [showBulletForm, setShowBulletForm] = useState<string | null>(null);
  const [miningBullet, setMiningBullet] = useState<{ id: string; questions: string[]; answers: string[] } | null>(null);
  const [expFormData, setExpFormData] = useState({
    company: "",
    title: "",
    location: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  });
  const [bulletContent, setBulletContent] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchExperiences();
    }
  }, [status, router]);

  const fetchExperiences = async () => {
    try {
      const res = await fetch("/api/profile/experiences");
      const data = await res.json();
      setExperiences(data.experiences || []);

      for (const exp of data.experiences || []) {
        fetchBullets(exp.id);
      }
    } catch (error) {
      console.error("Failed to fetch experiences:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBullets = async (experienceId: string) => {
    try {
      const res = await fetch(`/api/profile/bullets?experience_id=${experienceId}`);
      const data = await res.json();
      setBullets(prev => ({ ...prev, [experienceId]: data.bullets || [] }));
    } catch (error) {
      console.error("Failed to fetch bullets:", error);
    }
  };

  const handleExpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingExp ? `/api/profile/experiences/${editingExp.id}` : "/api/profile/experiences";
      const method = editingExp ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expFormData),
      });

      if (res.ok) {
        setShowExpForm(false);
        setEditingExp(null);
        resetExpForm();
        fetchExperiences();
      }
    } catch (error) {
      console.error("Failed to save experience:", error);
    }
  };

  const handleDeleteExp = async (id: string) => {
    if (!confirm("Delete this experience?")) return;
    try {
      const res = await fetch(`/api/profile/experiences/${id}`, { method: "DELETE" });
      if (res.ok) fetchExperiences();
    } catch (error) {
      console.error("Failed to delete experience:", error);
    }
  };

  const handleAddBullet = async (experienceId: string, manual = true) => {
    if (!bulletContent.trim()) return;
    try {
      const res = await fetch("/api/profile/bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experience_id: experienceId, content: bulletContent, manual }),
      });
      if (res.ok) {
        setBulletContent("");
        setShowBulletForm(null);
        fetchBullets(experienceId);
      }
    } catch (error) {
      console.error("Failed to add bullet:", error);
    }
  };

  const handleDeleteBullet = async (bulletId: string, experienceId: string) => {
    if (!confirm("Delete this bullet?")) return;
    try {
      const res = await fetch(`/api/profile/bullets/${bulletId}`, { method: "DELETE" });
      if (res.ok) fetchBullets(experienceId);
    } catch (error) {
      console.error("Failed to delete bullet:", error);
    }
  };

  const startMetricMining = async (bullet: Bullet, experience: Experience) => {
    try {
      const res = await fetch("/api/profile/mine-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullet_id: bullet.id,
          context: {
            job_title: experience.title,
            company: experience.company,
            bullet_content: bullet.content,
          },
        }),
      });
      const data = await res.json();
      if (data.questions) {
        setMiningBullet({
          id: bullet.id,
          questions: data.questions,
          answers: new Array(data.questions.length).fill(""),
        });
      }
    } catch (error) {
      console.error("Failed to generate questions:", error);
    }
  };

  const submitMetricAnswers = async (experienceId: string) => {
    if (!miningBullet) return;
    try {
      const res = await fetch("/api/profile/mine-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullet_id: miningBullet.id,
          answers: miningBullet.answers,
        }),
      });
      const data = await res.json();
      if (data.enhanced_content) {
        alert("Bullet enhanced!");
        setMiningBullet(null);
        fetchBullets(experienceId);
      }
    } catch (error) {
      console.error("Failed to enhance bullet:", error);
    }
  };

  const resetExpForm = () => {
    setExpFormData({
      company: "",
      title: "",
      location: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className=" flex items-center justify-center">
        <div className="text-[#1A237E] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-[#1A237E]">
          <span className="text-[#26A69A]">CV</span>Scan
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/profile" className="text-[#607086] hover:text-[#1A237E]">
            Profile
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#1A237E] mb-2">Work Experience</h1>
              <p className="text-[#607086]/80">Add your professional history with metrics</p>
            </div>
            {!showExpForm && (
              <button
                onClick={() => {
                  resetExpForm();
                  setEditingExp(null);
                  setShowExpForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-[#1A237E] px-6 py-2 rounded-lg"
              >
                Add Experience
              </button>
            )}
          </div>

          {/* Experience Form */}
          {showExpForm && (
            <form onSubmit={handleExpSubmit} className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-black/[0.06] mb-8">
              <h3 className="text-xl font-bold text-[#1A237E] mb-6">
                {editingExp ? "Edit Experience" : "Add Experience"}
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#1A237E] mb-2">Company *</label>
                    <input
                      type="text"
                      value={expFormData.company}
                      onChange={(e) => setExpFormData({ ...expFormData, company: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#1A237E] mb-2">Job Title *</label>
                    <input
                      type="text"
                      value={expFormData.title}
                      onChange={(e) => setExpFormData({ ...expFormData, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#1A237E] mb-2">Location</label>
                  <input
                    type="text"
                    value={expFormData.location}
                    onChange={(e) => setExpFormData({ ...expFormData, location: e.target.value })}
                    className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#1A237E] mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={expFormData.start_date}
                      onChange={(e) => setExpFormData({ ...expFormData, start_date: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#1A237E] mb-2">End Date</label>
                    <input
                      type="date"
                      value={expFormData.end_date}
                      onChange={(e) => setExpFormData({ ...expFormData, end_date: e.target.value })}
                      disabled={expFormData.is_current}
                      className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] disabled:opacity-50"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-[#1A237E]">
                  <input
                    type="checkbox"
                    checked={expFormData.is_current}
                    onChange={(e) => setExpFormData({ ...expFormData, is_current: e.target.checked, end_date: "" })}
                    className="w-4 h-4"
                  />
                  Currently working here
                </label>

                <div className="flex gap-4">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-[#1A237E] px-6 py-2 rounded-lg">
                    {editingExp ? "Update" : "Add"} Experience
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExpForm(false);
                      setEditingExp(null);
                      resetExpForm();
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-[#1A237E] px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Experiences List */}
          {experiences.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-12 border border-black/[0.06] text-center">
              <p className="text-[#607086]/80 mb-4">No experience added yet</p>
              <button
                onClick={() => setShowExpForm(true)}
                className="text-[#26A69A] hover:text-[#26A69A]"
              >
                Add your first experience →
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-black/[0.06]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-[#1A237E]">{exp.title}</h3>
                      <p className="text-[#26A69A] text-lg">{exp.company}</p>
                      {exp.location && <p className="text-[#607086]/80">{exp.location}</p>}
                      <p className="text-[#607086]/80 text-sm mt-1">
                        {new Date(exp.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })} -{" "}
                        {exp.is_current ? "Present" : new Date(exp.end_date!).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingExp(exp);
                          setExpFormData({
                            company: exp.company,
                            title: exp.title,
                            location: exp.location || "",
                            start_date: exp.start_date,
                            end_date: exp.end_date || "",
                            is_current: exp.is_current,
                            description: exp.description || "",
                          });
                          setShowExpForm(true);
                        }}
                        className="text-[#26A69A] hover:text-[#26A69A]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExp(exp.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Bullets */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[#1A237E] font-semibold">Achievements & Responsibilities</h4>
                      <button
                        onClick={() => setShowBulletForm(exp.id)}
                        className="text-sm text-[#26A69A] hover:text-[#26A69A]"
                      >
                        + Add Bullet
                      </button>
                    </div>

                    {showBulletForm === exp.id && (
                      <div className="mb-4 flex gap-2">
                        <input
                          type="text"
                          value={bulletContent}
                          onChange={(e) => setBulletContent(e.target.value)}
                          placeholder="Enter bullet point..."
                          className="flex-1 px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E]"
                        />
                        <button
                          onClick={() => handleAddBullet(exp.id, true)}
                          className="bg-blue-600 hover:bg-blue-700 text-[#1A237E] px-4 py-2 rounded-lg"
                        >
                          Add (Manual)
                        </button>
                        <button
                          onClick={() => {
                            setShowBulletForm(null);
                            setBulletContent("");
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-[#1A237E] px-4 py-2 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <ul className="space-y-3">
                      {bullets[exp.id]?.map((bullet) => (
                        <li key={bullet.id} className="flex gap-3 group">
                          <span className="text-[#26A69A] mt-1">•</span>
                          <div className="flex-1">
                            <p className="text-[#607086]">{bullet.content}</p>
                            {bullet.manual && (
                              <span className="text-xs text-yellow-400 block mt-1">manually added — not from your verified profile</span>
                            )}
                            {bullet.mined_metrics && (
                              <span className="text-xs text-green-400 block mt-1">✓ Enhanced with metrics</span>
                            )}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                            {!bullet.mined_metrics && (
                              <button
                                onClick={() => startMetricMining(bullet, exp)}
                                className="text-xs text-[#26A69A] hover:text-[#26A69A]"
                              >
                                Mine Metrics
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteBullet(bullet.id, exp.id)}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Metric Mining Dialog */}
          {miningBullet && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-[#F8FCFC] rounded-2xl p-8 max-w-2xl w-full border border-[#26A69A]/30">
                <h3 className="text-2xl font-bold text-[#1A237E] mb-4">Metric Mining</h3>
                <p className="text-[#607086]/80 mb-6">Answer these questions to enhance your bullet with quantifiable metrics:</p>

                <div className="space-y-4 mb-6">
                  {miningBullet.questions.map((question, i) => (
                    <div key={i}>
                      <label className="block text-[#1A237E] mb-2">{question}</label>
                      <input
                        type="text"
                        value={miningBullet.answers[i]}
                        onChange={(e) => {
                          const newAnswers = [...miningBullet.answers];
                          newAnswers[i] = e.target.value;
                          setMiningBullet({ ...miningBullet, answers: newAnswers });
                        }}
                        className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E]"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      const expId = experiences.find(e =>
                        bullets[e.id]?.some(b => b.id === miningBullet.id)
                      )?.id;
                      if (expId) submitMetricAnswers(expId);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-[#1A237E] px-6 py-2 rounded-lg"
                  >
                    Enhance Bullet
                  </button>
                  <button
                    onClick={() => setMiningBullet(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-[#1A237E] px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
