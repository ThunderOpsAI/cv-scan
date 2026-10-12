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

  const { keywords = "", location = "us", page = 1 } = params;
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

export interface JSearchRawJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city?: string | null;
  job_state?: string | null;
  job_country?: string | null;
  job_description?: string;
  job_apply_link?: string;
  job_google_link?: string;
  job_min_salary?: number | null;
  job_max_salary?: number | null;
  job_posted_at_datetime_utc?: string;
}

export function formatJSearchJob(job: JSearchRawJob) {
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
