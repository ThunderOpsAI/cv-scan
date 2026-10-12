export async function searchRemoteOk(params: { keywords?: string }) {
  const { keywords = "" } = params;
  
  // RemoteOK API doesn't require an API key for basic access
  const url = `https://remoteok.com/api?tag=${encodeURIComponent(keywords)}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "AICVScan-Job-Aggregator/1.0",
      },
    });

    if (!response.ok) {
      console.error("RemoteOK API returned an error:", response.status);
      return { results: [] };
    }

    const data = await response.json();
    
    interface RemoteOkItem {
      id?: string | number;
      company?: string;
      position?: string;
      title?: string;
      location?: string;
      description?: string;
      url?: string;
      apply_url?: string;
      salary_min?: number;
      salary_max?: number;
      date?: string | number;
    }
    const jobs = Array.isArray(data) ? (data as RemoteOkItem[]).filter((item) => item.id && item.company) : [];
    
    return { results: jobs };
  } catch (error) {
    console.error("RemoteOK search error:", error);
    return { results: [] };
  }
}

export interface RemoteOkJobInput {
  id?: string | number;
  company?: string;
  position?: string;
  title?: string;
  location?: string;
  description?: string;
  url?: string;
  apply_url?: string;
  salary_min?: number;
  salary_max?: number;
  date?: string | number;
}

export function formatRemoteOkJob(job: RemoteOkJobInput) {
  return {
    external_id: `remoteok-${job.id}`,
    source: "remoteok" as const,
    title: job.position || job.title || "",
    company: job.company || "",
    location: job.location || "Remote",
    description: job.description || "",
    url: job.url || job.apply_url || "",
    salary_min: job.salary_min || null,
    salary_max: job.salary_max || null,
    posted_at: job.date ? new Date(job.date).toISOString() : new Date().toISOString(),
  };
}
