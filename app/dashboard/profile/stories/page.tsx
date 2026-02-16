"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StarStory } from "@/types/profile";

export default function StarStoriesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stories, setStories] = useState<StarStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<StarStory | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        situation: "",
        task: "",
        action: "",
        result: "",
        tags: "",
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (status === "authenticated") {
            fetchStories();
        }
    }, [status, router]);

    const fetchStories = async () => {
        try {
            const res = await fetch("/api/profile/stories");
            const data = await res.json();
            setStories(data.stories || []);
        } catch (error) {
            console.error("Failed to fetch stories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editing ? `/api/profile/stories/${editing.id}` : "/api/profile/stories";
            const method = editing ? "PUT" : "POST";

            const payload = {
                ...formData,
                tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
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
                fetchStories();
            }
        } catch (error) {
            console.error("Failed to save story:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this story?")) return;
        try {
            const res = await fetch(`/api/profile/stories/${id}`, { method: "DELETE" });
            if (res.ok) fetchStories();
        } catch (error) {
            console.error("Failed to delete story:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            situation: "",
            task: "",
            action: "",
            result: "",
            tags: "",
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
                            <h1 className="text-4xl font-bold text-white mb-2">STAR Stories</h1>
                            <p className="text-gray-400">Structure your interview answers with the STAR method</p>
                        </div>
                        {!showForm && (
                            <button
                                onClick={() => {
                                    resetForm();
                                    setEditing(null);
                                    setShowForm(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                            >
                                Add Story
                            </button>
                        )}
                    </div>

                    {/* Story Form */}
                    {showForm && (
                        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
                            <h3 className="text-xl font-bold text-white mb-6">
                                {editing ? "Edit Story" : "Add Story"}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white mb-2">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., Solving a Critical Production Bug"
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Situation *</label>
                                    <p className="text-gray-400 text-xs mb-2">Describe the context within which you performed a job or faced a challenge.</p>
                                    <textarea
                                        value={formData.situation}
                                        onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                                        rows={3}
                                        placeholder="e.g., During the peak holiday season, our servers started crashing due to high traffic..."
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Task *</label>
                                    <p className="text-gray-400 text-xs mb-2">Describe your responsibility in that situation.</p>
                                    <textarea
                                        value={formData.task}
                                        onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                                        rows={3}
                                        placeholder="e.g., My task was to identify the bottleneck and optimize the database queries..."
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Action *</label>
                                    <p className="text-gray-400 text-xs mb-2">Describe how you completed the task or endeavored to meet the challenge.</p>
                                    <textarea
                                        value={formData.action}
                                        onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                                        rows={3}
                                        placeholder="e.g., I implemented Redis caching for frequently accessed data and indexed key columns..."
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Result *</label>
                                    <p className="text-gray-400 text-xs mb-2">Explain the outcomes or results generated by the action taken.</p>
                                    <textarea
                                        value={formData.result}
                                        onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                                        rows={3}
                                        placeholder="e.g., Server load decreased by 40% and we handled 2x more traffic without downtime..."
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Tags</label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="e.g., leadership, technical, problem-solving (comma separated)"
                                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                                        {editing ? "Update" : "Add"} Story
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

                    {/* Stories List */}
                    {stories.length === 0 ? (
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
                            <p className="text-gray-400 mb-4">No STAR stories added yet</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="text-blue-400 hover:text-blue-300"
                            >
                                Create your first story →
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {stories.map((story) => (
                                <div key={story.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-blue-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">{story.title}</h3>
                                            <div className="flex gap-2 mt-2">
                                                {story.tags?.map((tag) => (
                                                    <span key={tag} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-500/30">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditing(story);
                                                    setFormData({
                                                        title: story.title,
                                                        situation: story.situation,
                                                        task: story.task,
                                                        action: story.action,
                                                        result: story.result,
                                                        tags: story.tags?.join(", ") || "",
                                                    });
                                                    setShowForm(true);
                                                }}
                                                className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 bg-white/5 rounded-lg border border-white/10"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(story.id)}
                                                className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-white/5 rounded-lg border border-white/10"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                                <h4 className="text-blue-400 font-bold text-sm mb-1 uppercase tracking-wider">Situation</h4>
                                                <p className="text-gray-300 text-sm">{story.situation}</p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                                <h4 className="text-blue-400 font-bold text-sm mb-1 uppercase tracking-wider">Task</h4>
                                                <p className="text-gray-300 text-sm">{story.task}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                                <h4 className="text-green-400 font-bold text-sm mb-1 uppercase tracking-wider">Action</h4>
                                                <p className="text-gray-300 text-sm">{story.action}</p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                                <h4 className="text-green-400 font-bold text-sm mb-1 uppercase tracking-wider">Result</h4>
                                                <p className="text-gray-300 text-sm">{story.result}</p>
                                            </div>
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
