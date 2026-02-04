"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Education } from "@/types/profile";

export default function EducationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);
  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    field_of_study: "",
    location: "",
    start_date: "",
    end_date: "",
    gpa: "",
    honors: "",
    description: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchEducation();
    }
  }, [status, router]);

  const fetchEducation = async () => {
    try {
      const res = await fetch("/api/profile/education");
      const data = await res.json();
      setEducation(data.education || []);
    } catch (error) {
      console.error("Failed to fetch education:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/profile/education/${editing.id}` : "/api/profile/education";
      const method = editing ? "PUT" : "POST";

      const payload = {
        ...formData,
        gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
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
        fetchEducation();
      }
    } catch (error) {
      console.error("Failed to save education:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this education entry?")) return;
    try {
      const res = await fetch(`/api/profile/education/${id}`, { method: "DELETE" });
      if (res.ok) fetchEducation();
    } catch (error) {
      console.error("Failed to delete education:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      institution: "",
      degree: "",
      field_of_study: "",
      location: "",
      start_date: "",
      end_date: "",
      gpa: "",
      honors: "",
      description: "",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-white">
          <span className="text-blue-400">CV</span>Scan
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/profile" className="text-gray-300 hover:text-white">
            Profile
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Education</h1>
              <p className="text-gray-400">Add your educational background</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditing(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Add Education
            </button>
          </div>

          {/* Education Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
              <h3 className="text-xl font-bold text-white mb-6">
                {editing ? "Edit Education" : "Add Education"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Institution *</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Degree *</label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      placeholder="e.g., Bachelor of Science"
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Field of Study</label>
                    <input
                      type="text"
                      value={formData.field_of_study}
                      onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                      placeholder="e.g., Computer Science"
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa}
                      onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                      placeholder="e.g., 3.85"
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Honors</label>
                    <input
                      type="text"
                      value={formData.honors}
                      onChange={(e) => setFormData({ ...formData, honors: e.target.value })}
                      placeholder="e.g., Summa Cum Laude"
                      className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Relevant coursework, achievements, etc."
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  />
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                    {editing ? "Update" : "Add"} Education
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditing(null);
                      resetForm();
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Education List */}
          {education.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
              <p className="text-gray-400 mb-4">No education added yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-400 hover:text-blue-300"
              >
                Add your first education →
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {education.map((edu) => (
                <div key={edu.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white">{edu.degree}</h3>
                      <p className="text-blue-400 text-lg">{edu.institution}</p>
                      {edu.field_of_study && (
                        <p className="text-gray-300 mt-1">{edu.field_of_study}</p>
                      )}
                      {edu.location && <p className="text-gray-400">{edu.location}</p>}
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(edu.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })} -{" "}
                        {edu.end_date ? new Date(edu.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Present"}
                      </p>

                      {edu.gpa && (
                        <p className="text-gray-300 mt-3">GPA: {edu.gpa}</p>
                      )}
                      {edu.honors && (
                        <p className="text-green-400 mt-1">{edu.honors}</p>
                      )}
                      {edu.description && (
                        <p className="text-gray-300 mt-3">{edu.description}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(edu);
                          setFormData({
                            institution: edu.institution,
                            degree: edu.degree,
                            field_of_study: edu.field_of_study || "",
                            location: edu.location || "",
                            start_date: edu.start_date,
                            end_date: edu.end_date || "",
                            gpa: edu.gpa?.toString() || "",
                            honors: edu.honors || "",
                            description: edu.description || "",
                          });
                          setShowForm(true);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(edu.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
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
