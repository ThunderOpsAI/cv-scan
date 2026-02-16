"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SmartGoal } from "@/types/profile";

export default function SmartGoalsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [goals, setGoals] = useState<SmartGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<SmartGoal | null>(null);
    const [formData, setFormData] = useState({
        goal: "",
        specific: "",
        measurable: "",
        achievable: "",
        relevant: "",
        time_bound: "",
        status: "in_progress" as "in_progress" | "completed",
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (status === "authenticated") {
            fetchGoals();
        }
    }, [status, router]);

    const fetchGoals = async () => {
        try {
            const res = await fetch("/api/profile/goals");
            const data = await res.json();
            setGoals(data.goals || []);
        } catch (error) {
            console.error("Failed to fetch goals:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editing ? `/api/profile/goals/${editing.id}` : "/api/profile/goals";
            const method = editing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowForm(false);
                setEditing(null);
                resetForm();
                fetchGoals();
            }
        } catch (error) {
            console.error("Failed to save goal:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this goal?")) return;
        try {
            const res = await fetch(`/api/profile/goals/${id}`, { method: "DELETE" });
            if (res.ok) fetchGoals();
        } catch (error) {
            console.error("Failed to delete goal:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            goal: "",
            specific: "",
            measurable: "",
            achievable: "",
            relevant: "",
            time_bound: "",
            status: "in_progress",
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
                            <h1 className="text-4xl font-bold text-white mb-2">SMART Goals</h1>
                            <p className="text-gray-400">Set actionable goals for your career (Specific, Measurable, Achievable, Relevant, Time-bound)</p>
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
                                Add Goal
                            </button>
                        )}
                    </div>

                    {/* Goal Form */}
                    {showForm && (
                        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
                            <h3 className="text-xl font-bold text-white mb-6">
                                {editing ? "Edit Goal" : "Add Goal"}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white mb-2">Goal Summary *</label>
                                    <input
                                        type="text"
                                        value={formData.goal}
                                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                        placeholder="e.g., Secure a Senior Engineer role"
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white mb-2">Specific (What)</label>
                                        <textarea
                                            value={formData.specific}
                                            onChange={(e) => setFormData({ ...formData, specific: e.target.value })}
                                            rows={2}
                                            placeholder="What exactly do you want to accomplish?"
                                            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white mb-2">Measurable (How Much)</label>
                                        <textarea
                                            value={formData.measurable}
                                            onChange={(e) => setFormData({ ...formData, measurable: e.target.value })}
                                            rows={2}
                                            placeholder="How will you know when it is accomplished?"
                                            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white mb-2">Achievable (How)</label>
                                        <textarea
                                            value={formData.achievable}
                                            onChange={(e) => setFormData({ ...formData, achievable: e.target.value })}
                                            rows={2}
                                            placeholder="How can the goal be accomplished?"
                                            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white mb-2">Relevant (Why)</label>
                                        <textarea
                                            value={formData.relevant}
                                            onChange={(e) => setFormData({ ...formData, relevant: e.target.value })}
                                            rows={2}
                                            placeholder="Does this seem worthwhile?"
                                            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Time-bound (When)</label>
                                    <input
                                        type="text"
                                        value={formData.time_bound}
                                        onChange={(e) => setFormData({ ...formData, time_bound: e.target.value })}
                                        placeholder="e.g., By Q3 2024"
                                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "in_progress" | "completed" })}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                                    >
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                                        {editing ? "Update" : "Add"} Goal
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

                    {/* Goals List */}
                    {goals.length === 0 ? (
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
                            <p className="text-gray-400 mb-4">No SMART goals set yet</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="text-blue-400 hover:text-blue-300"
                            >
                                Set your first goal →
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {goals.map((goal) => (
                                <div key={goal.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-bold text-white">{goal.goal}</h3>
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${goal.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                    {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                                                </span>
                                            </div>
                                            {goal.time_bound && (
                                                <p className="text-gray-400 text-sm mt-1">Target: {goal.time_bound}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditing(goal);
                                                    setFormData({
                                                        goal: goal.goal,
                                                        specific: goal.specific || "",
                                                        measurable: goal.measurable || "",
                                                        achievable: goal.achievable || "",
                                                        relevant: goal.relevant || "",
                                                        time_bound: goal.time_bound || "",
                                                        status: goal.status as "in_progress" | "completed",
                                                    });
                                                    setShowForm(true);
                                                }}
                                                className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 bg-white/5 rounded-lg border border-white/10"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(goal.id)}
                                                className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-white/5 rounded-lg border border-white/10"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                                        {goal.specific && (
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                                <h4 className="text-gray-400 text-xs uppercase mb-1">Specific</h4>
                                                <p className="text-gray-200 text-sm">{goal.specific}</p>
                                            </div>
                                        )}
                                        {goal.measurable && (
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                                <h4 className="text-gray-400 text-xs uppercase mb-1">Measurable</h4>
                                                <p className="text-gray-200 text-sm">{goal.measurable}</p>
                                            </div>
                                        )}
                                        {goal.achievable && (
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                                <h4 className="text-gray-400 text-xs uppercase mb-1">Achievable</h4>
                                                <p className="text-gray-200 text-sm">{goal.achievable}</p>
                                            </div>
                                        )}
                                        {goal.relevant && (
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                                <h4 className="text-gray-400 text-xs uppercase mb-1">Relevant</h4>
                                                <p className="text-gray-200 text-sm">{goal.relevant}</p>
                                            </div>
                                        )}
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
