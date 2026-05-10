const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

export async function searchJSearch(params: {
  keywords?: string;
  location?: string;
  page?: number;
  results_per_page?: number;
}) {
  if (!RAPIDAPI_KEY) {
    console.warn("JSearch: RAPIDAPI_KEY not configured. Skipping JSearch provider.");
    return { results: [] };
  }

  const { keywords = "", location = "us", page = 1, results_per_page = 10 } = params;
  const query = encodeURIComponent(`${keywords} in ${location}`);
  const url = `https://jsearch.p.rapidapi.com/search?query=${query}&page=${page}&num_pages=1`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
    });

    if (!response.ok) {
      console.error("JSearch API returned an error:", response.status);
      return { results: [] };
    }

    const json = await response.json();
    return { results: json.data || [] };
  } catch (error) {
    console.error("JSearch search error:", error);
    return { results: [] };
  }
}

export function formatJSearchJob(job: any) {
  return {
    external_id: `jsearch-${job.job_id}`,
    source: "jsearch" as const,
    title: job.job_title,
    company: job.employer_name,
    location: `${job.job_city || ""}, ${job.job_state || ""}, ${job.job_country || ""}`.replace(/^,\s*|,\s*$/g, "").trim() || "Remote",
    description: job.job_description || "",
    url: job.job_apply_link || job.job_google_link,
    salary_min: job.job_min_salary || null,
    salary_max: job.job_max_salary || null,
    posted_at: job.job_posted_at_datetime_utc || new Date().toISOString(),
  };
}
