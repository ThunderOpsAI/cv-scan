"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DiscoveredJob, SavedSearch } from "@/types/intelligence";
import { JobsPageSkeleton } from "@/components/ui/dashboard-skeletons";

export default function JobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<DiscoveredJob[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [lastSearch, setLastSearch] = useState({ keywords: "", location: "" });
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchSavedSearches();
    }
  }, [status, router]);

  const fetchSavedSearches = async () => {
    try {
      const res = await fetch("/api/jobs/searches");
      const data = await res.json();
      setSavedSearches(data.searches || []);
    } catch (error) {
      console.error("Failed to fetch saved searches:", error);
    }
  };

  const searchJobs = async (
    e?: React.FormEvent,
    override?: { keywords?: string; location?: string }
  ) => {
    if (e) e.preventDefault();
    setLoading(true);
    const searchedKeywords = (override?.keywords ?? keywords).trim();
    const searchedLocation = (override?.location ?? location).trim();
    setLastSearch({ keywords: searchedKeywords, location: searchedLocation });

    try {
      const params = new URLSearchParams();
      if (searchedKeywords) params.set("keywords", searchedKeywords);
      if (searchedLocation) params.set("location", searchedLocation);

      const res = await fetch(`/api/jobs/discover?${params.toString()}`);
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Failed to search jobs:", error);
      alert("Failed to search jobs");
    } finally {
      setLoading(false);
    }
  };

  const saveSearch = async () => {
    if (!searchName.trim()) return;

    try {
      const res = await fetch("/api/jobs/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: searchName,
          query_params: {
            keywords,
            location,
          },
          frequency: "never",
        }),
      });

      if (res.ok) {
        setShowSaveSearch(false);
        setSearchName("");
        fetchSavedSearches();
      }
    } catch (error) {
      console.error("Failed to save search:", error);
    }
  };

  const loadSavedSearch = async (search: SavedSearch) => {
    const savedKeywords = search.query_params.keywords || "";
    const savedLocation = search.query_params.location || "";
    setKeywords(savedKeywords);
    setLocation(savedLocation);
    searchJobs(undefined, { keywords: savedKeywords, location: savedLocation });
  };

  const deleteSavedSearch = async (id: string) => {
    if (!confirm("Delete this saved search?")) return;

    try {
      const res = await fetch(`/api/jobs/searches/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSavedSearches();
      }
    } catch (error) {
      console.error("Failed to delete saved search:", error);
    }
  };

  const getBroaderSearchSuggestion = (term: string) => {
    const normalized = term.toLowerCase();
    if (normalized.includes("pilot")) return "aviation";
    if (normalized.includes("teacher")) return "education";
    if (normalized.includes("nurse")) return "healthcare";
    if (normalized.includes("developer") || normalized.includes("engineer")) return "technology";
    if (normalized.includes("driver")) return "transport";
    return "";
  };

  const broaderSuggestion = getBroaderSearchSuggestion(lastSearch.keywords);

  if (status === "loading") {
    return <JobsPageSkeleton />;
  }

  return (
    <div className="">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Sidebar - Saved Searches */}
            <div className="md:col-span-1">
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-4 border border-black/[0.06] mb-4">
                <h3 className="text-[#1A237E] font-bold mb-3">Saved Searches</h3>
                {savedSearches.length === 0 ? (
                  <p className="text-[#607086]/80 text-sm">No saved searches yet</p>
                ) : (
                  <div className="space-y-2">
                    {savedSearches.map((search) => (
                      <div
                        key={search.id}
                        className="bg-white/40 rounded-lg p-2 group"
                      >
                        <button
                          onClick={() => loadSavedSearch(search)}
                          className="w-full text-left"
                        >
                          <div className="text-[#1A237E] text-sm font-medium">{search.name}</div>
                          <div className="text-[#607086]/80 text-xs mt-1">
                            {search.query_params.keywords || "All jobs"}
                          </div>
                        </button>
                        <button
                          onClick={() => deleteSavedSearch(search.id)}
                          className="text-red-400 hover:text-red-300 text-xs mt-1 opacity-0 group-hover:opacity-100"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              {/* Search Form */}
              <form onSubmit={searchJobs} className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-black/[0.06] mb-6">
                <h2 className="text-2xl font-bold text-[#1A237E] mb-4">Discover Jobs</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Job title, skills, or keywords"
                    className="px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location (city, state, or country)"
                    className="px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#26A69A] hover:bg-[#168579] text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Searching..." : "Search Jobs"}
                  </button>
                  {keywords || location ? (
                    <button
                      type="button"
                      onClick={() => setShowSaveSearch(true)}
                      className="bg-white border border-black/[0.08] hover:bg-gray-50 text-[#1A237E] px-4 py-2 rounded-lg transition-colors"
                    >
                      Save Search
                    </button>
                  ) : null}
                </div>
              </form>

              {/* Jobs List */}
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-2xl border border-black/[0.06] bg-white/60 p-6"
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="h-7 w-3/5 rounded-lg bg-white/60" />
                          <div className="h-5 w-2/5 rounded-lg bg-white/60" />
                          <div className="h-4 w-1/3 rounded-lg bg-white/60" />
                        </div>
                        <div className="h-14 w-16 rounded-2xl bg-white/60" />
                      </div>
                      <div className="mb-3 h-4 w-1/4 rounded-lg bg-white/60" />
                      <div className="mb-2 h-4 w-full rounded-lg bg-white/60" />
                      <div className="mb-2 h-4 w-11/12 rounded-lg bg-white/60" />
                      <div className="mb-4 h-4 w-2/3 rounded-lg bg-white/60" />
                      <div className="text-sm text-[#26A69A]">
                        Discovering jobs and calculating match scores...
                      </div>
                    </div>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-12 border border-black/[0.06] text-center">
                  <p className="text-[#607086] mb-2">No jobs found yet.</p>
                  <p className="text-gray-500 text-sm">
                    Try broadening your search
                    {broaderSuggestion ? (
                      <>
                        {" "}
                        from {lastSearch.keywords} to {broaderSuggestion}
                      </>
                    ) : (
                      " with a wider field, industry, or skill"
                    )}
                    . Career Copilot can help you explore related fields or career paths.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-black/[0.06] hover:border-[#26A69A]/30 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-[#1A237E] mb-1">{job.title}</h3>
                          <p className="text-[#26A69A] text-lg">{job.company}</p>
                          {job.location && (
                            <p className="text-[#607086]/80 text-sm">{job.location}</p>
                          )}
                        </div>
                        {job.match_score !== undefined && (
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-400">
                              {job.match_score}%
                            </div>
                            <div className="text-xs text-[#607086]/80">Match</div>
                          </div>
                        )}
                      </div>

                      {job.salary_min && job.salary_max && (
                        <p className="text-[#607086] text-sm mb-2">
                          ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                        </p>
                      )}

                      {job.description && (
                        <p className="text-[#607086] text-sm mb-3 line-clamp-3">
                          {job.description}
                        </p>
                      )}

                      {job.match_reasons && job.match_reasons.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[#607086]/80 text-xs font-semibold mb-1">
                            Why this matches:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {job.match_reasons.slice(0, 3).map((reason, i) => (
                              <span
                                key={i}
                                className="bg-[#26A69A]/10 text-[#26A69A] text-xs px-2 py-1 rounded"
                              >
                                {reason.type}: {reason.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#26A69A] hover:bg-[#168579] text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          View Job
                        </a>
                        {job.posted_at && (
                          <span className="text-[#607086]/80 text-sm flex items-center">
                            Posted {new Date(job.posted_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Search Modal */}
      {showSaveSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-black/[0.06] shadow-xl">
            <h3 className="text-2xl font-bold text-[#1A237E] mb-4">Save Search</h3>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search name"
              className="w-full px-4 py-2 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] mb-4"
            />
            <div className="flex gap-4">
              <button
                onClick={saveSearch}
                className="bg-[#26A69A] hover:bg-[#168579] text-white px-6 py-2 rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveSearch(false);
                  setSearchName("");
                }}
                className="bg-gray-200 hover:bg-gray-300 text-[#1A237E] px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
