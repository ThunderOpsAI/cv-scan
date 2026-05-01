"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Library() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [savedLetters, setSavedLetters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLetter, setSelectedLetter] = useState<any>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (status === "authenticated") {
            fetchSavedLetters();
        }
    }, [status, router]);

    const fetchSavedLetters = async () => {
        try {
            const res = await fetch("/api/generate/cover-letter");
            const data = await res.json();
            if (data.generations) {
                setSavedLetters(data.generations);
            }
        } catch (err) {
            console.error("Failed to load saved letters", err);
        } finally {
            setLoading(false);
        }
    };

    const deleteLetter = async (id: string) => {
        if (!confirm("Are you sure you want to delete this cover letter?")) {
            return;
        }

        try {
            const res = await fetch(`/api/generate/cover-letter?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setSavedLetters(savedLetters.filter((letter) => letter.id !== id));
                if (selectedLetter?.id === id) {
                    setSelectedLetter(null);
                }
            }
        } catch (err) {
            console.error("Failed to delete letter", err);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    if (status === "loading" || loading) {
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
                <Link href="/dashboard" className="text-2xl font-bold text-white">
                    <span className="text-blue-400">CV</span>Scan
                </Link>
                <div className="flex items-center gap-4">
                    <Link
                        href="/generate/cover-letter"
                        className="text-gray-300 hover:text-white transition-colors"
                    >
                        Generate
                    </Link>
                    <Link
                        href="/dashboard"
                        className="text-gray-300 hover:text-white transition-colors"
                    >
                        Dashboard
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">My Library</h1>
                        <p className="text-gray-400">
                            All your saved cover letters in one place
                        </p>
                    </div>

                    {savedLetters.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
                            <div className="text-6xl mb-4">📚</div>
                            <h2 className="text-2xl font-bold text-white mb-2">No saved cover letters yet</h2>
                            <p className="text-gray-400 mb-6">
                                Generate a cover letter and click "Save" to add it to your library
                            </p>
                            <Link
                                href="/generate/cover-letter"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                            >
                                Generate Cover Letter
                            </Link>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* List */}
                            <div className="lg:col-span-1 space-y-4">
                                {savedLetters.map((letter) => (
                                    <div
                                        key={letter.id}
                                        className={`bg-white/5 backdrop-blur-lg rounded-xl p-4 border transition-all cursor-pointer ${selectedLetter?.id === letter.id
                                                ? "border-blue-500 ring-2 ring-blue-500/30"
                                                : "border-white/20 hover:border-blue-500/50"
                                            }`}
                                        onClick={() => setSelectedLetter(letter)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-xs text-gray-400">
                                                {new Date(letter.created_at).toLocaleDateString()}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteLetter(letter.id);
                                                }}
                                                className="text-red-400 hover:text-red-300 text-xs"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <p className="text-white text-sm line-clamp-3">
                                            {letter.input.job_description?.substring(0, 100) || "No description"}...
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Preview */}
                            <div className="lg:col-span-2">
                                {selectedLetter ? (
                                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 sticky top-4">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-white">Cover Letter</h2>
                                            <button
                                                onClick={() => copyToClipboard(selectedLetter.output)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                                            >
                                                Copy
                                            </button>
                                        </div>

                                        <div className="bg-white/5 border border-white/20 rounded-xl p-6 mb-6">
                                            <div className="text-white whitespace-pre-wrap font-serif leading-relaxed">
                                                {selectedLetter.output}
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-400">
                                            Saved on {new Date(selectedLetter.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
                                        <div className="text-4xl mb-4">📄</div>
                                        <p className="text-gray-400">
                                            Select a cover letter from the list to view it
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
