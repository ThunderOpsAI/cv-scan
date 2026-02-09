import { AdzunaSearchResponse, AdzunaJob } from '@/types/intelligence';

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

export async function searchJobs(params: {
  keywords?: string;
  location?: string;
  radius?: number;
  page?: number;
  results_per_page?: number;
  country?: string;
}): Promise<AdzunaSearchResponse> {
  if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
    throw new Error('Adzuna API credentials not configured');
  }

  const {
    keywords = '',
    location = 'us',
    radius = 50,
    page = 1,
    results_per_page = 20,
    country = 'au', // Default to Australia as requested
  } = params;

  const queryParams = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_API_KEY,
    results_per_page: results_per_page.toString(),
    what: keywords,
    where: location, // 'where' is the location query (e.g. "New York")
    distance: radius.toString(),
  });

  // Default to 'us' for the endpoint country code, or extract if provided
  // For now we'll stick to 'us' as the base endpoint but query 'where' globally or specific
  const countryCode = country.toLowerCase();

  // URL structure: https://api.adzuna.com/v1/api/jobs/{country}/search/{page}
  const url = `${ADZUNA_BASE_URL}/${countryCode}/search/${page}?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.statusText}`);
    }

    const data: AdzunaSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Adzuna API error:', error);
    throw error;
  }
}

export function formatAdzunaJob(job: AdzunaJob) {
  return {
    external_id: job.id,
    source: 'adzuna' as const,
    title: job.title,
    company: job.company.display_name,
    location: job.location.display_name,
    description: job.description,
    url: job.redirect_url,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    posted_at: new Date(job.created).toISOString(),
  };
}
