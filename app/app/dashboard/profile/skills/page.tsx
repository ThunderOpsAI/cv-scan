"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Skill, SkillCategory, SkillProficiency } from "@/types/profile";

export default function SkillsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [formData, setFormData] = useState<{
    category: SkillCategory;
    name: string;
    proficiency: SkillProficiency | "";
    years_of_experience: string;
  }>({
    category: "technical",
    name: "",
    proficiency: "",
    years_of_experience: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchSkills();
    }
  }, [status, router]);

  const fetchSkills = async () => {
    try {
      const res = await fetch("/api/profile/skills");
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/profile/skills/${editing.id}` : "/api/profile/skills";
      const method = editing ? "PUT" : "POST";

      const payload = {
        ...formData,
        proficiency: formData.proficiency || undefined,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowForm(false);
        setEditing(null);
        resetForm();
        fetchSkills();
      }
    } catch (error) {
      console.error("Failed to save skill:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    try {
      const res = await fetch(`/api/profile/skills/${id}`, { method: "DELETE" });
      if (res.ok) fetchSkills();
    } catch (error) {
      console.error("Failed to delete skill:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      category: "technical",
      name: "",
      proficiency: "",
      years_of_experience: "",
    });
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<SkillCategory, Skill[]>);

  const categoryLabels: Record<SkillCategory, string> = {
    technical: "Technical Skills",
    soft: "Soft Skills",
    language: "Languages",
    certification: "Certifications",
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
              <h1 className="text-4xl font-bold text-[#1A237E] mb-2">Skills</h1>
              <p className="text-[#607086]/80">Showcase your expertise and capabilities</p>
            </div>
            {!showForm && (
              <button
                onClick={() => {
                  resetForm();
                  setEditing(null);
                  setShowForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-[#1A237E] px-6 py-2 rounded-lg"
              >
                Add Skill
              </button>
            )}
          </div>

          {/* Skill Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-black/[0.06] mb-8">
              <h3 className="text-xl font-bold text-[#1A237E] mb-6">
                {editing ? "Edit Skill" : "Add Skill"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#1A237E] mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as SkillCategory })}
                    required
                    className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E]"
                  >
                    <option value="technical">Technical</option>
                    <option value="soft">Soft Skills</option>
                    <option value="language">Language</option>
                    <option value="certification">Certification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1A237E] mb-2">Skill Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., React, Leadership, Spanish, AWS Certified"
                    required
                    className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#1A237E] mb-2">Proficiency</label>
                    <select
                      value={formData.proficiency}
                      onChange={(e) => setFormData({ ...formData, proficiency: e.target.value as SkillProficiency | "" })}
                      className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E]"
                    >
                      <option value="">Select proficiency</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#1A237E] mb-2">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.years_of_experience}
                      onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                      placeholder="e.g., 3"
                      className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E]"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-[#1A237E] px-6 py-2 rounded-lg">
                    {editing ? "Update" : "Add"} Skill
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditing(null);
                      resetForm();
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-[#1A237E] px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Skills List */}
          {skills.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-12 border border-black/[0.06] text-center">
              <p className="text-[#607086]/80 mb-4">No skills added yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-[#26A69A] hover:text-[#26A69A]"
              >
                Add your first skill →
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {(Object.keys(groupedSkills) as SkillCategory[]).map((category) => (
                <div key={category} className="bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-black/[0.06]">
                  <h3 className="text-xl font-bold text-[#1A237E] mb-4">{categoryLabels[category]}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {groupedSkills[category].map((skill) => (
                      <div
                        key={skill.id}
                        className="bg-white/40 rounded-lg p-4 border border-white/10 flex justify-between items-start group"
                      >
                        <div className="flex-1">
                          <h4 className="text-[#1A237E] font-semibold">{skill.name}</h4>
                          <div className="flex gap-2 mt-1 text-sm text-[#607086]/80">
                            {skill.proficiency && (
                              <span className="capitalize">{skill.proficiency}</span>
                            )}
                            {skill.proficiency && skill.years_of_experience && <span>•</span>}
                            {skill.years_of_experience && (
                              <span>{skill.years_of_experience} years</span>
                            )}
                          </div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                          <button
                            onClick={() => {
                              setEditing(skill);
                              setFormData({
                                category: skill.category,
                                name: skill.name,
                                proficiency: skill.proficiency || "",
                                years_of_experience: skill.years_of_experience?.toString() || "",
                              });
                              setShowForm(true);
                            }}
                            className="text-[#26A69A] hover:text-[#26A69A] text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(skill.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
