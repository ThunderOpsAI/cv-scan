import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { searchJobs, formatAdzunaJob } from '@/lib/jobs/adzuna';
import { searchRemoteOk, formatRemoteOkJob } from '@/lib/jobs/remoteok';
import { searchJSearch, formatJSearchJob } from '@/lib/jobs/jsearch';
import { calculateMatchScore } from '@/lib/jobs/matcher';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const keywords = searchParams.get('keywords') || '';
    const location = searchParams.get('location') || 'us';
    const radius = parseInt(searchParams.get('radius') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const country = searchParams.get('country') || 'au';

    const supabase = createClient();

    const { data: profile } = await (supabase
      .from('profiles')
      .select as any)('*, experiences(*), skills(*), education(*)')
      .eq('user_id', session.user.id)
      .single();

    // Fetch from all providers in parallel
    const [adzunaRes, remoteOkRes, jsearchRes] = await Promise.allSettled([
      searchJobs({ keywords, location, radius, page, results_per_page: limit, country }),
      searchRemoteOk({ keywords }),
      searchJSearch({ keywords, location, page, results_per_page: limit })
    ]);

    let allFormattedJobs: any[] = [];

    // Process Adzuna results
    if (adzunaRes.status === 'fulfilled' && adzunaRes.value?.results) {
      allFormattedJobs = [
        ...allFormattedJobs,
        ...adzunaRes.value.results.map(formatAdzunaJob)
      ];
    }

    // Process RemoteOK results
    if (remoteOkRes.status === 'fulfilled' && remoteOkRes.value?.results) {
      allFormattedJobs = [
        ...allFormattedJobs,
        ...remoteOkRes.value.results.map(formatRemoteOkJob)
      ];
    }

    // Process JSearch results
    if (jsearchRes.status === 'fulfilled' && jsearchRes.value?.results) {
      allFormattedJobs = [
        ...allFormattedJobs,
        ...jsearchRes.value.results.map(formatJSearchJob)
      ];
    }

    // Calculate match scores for all aggregated jobs
    const jobsWithScores = allFormattedJobs.map((formattedJob) => {
      const { score, reasons } = calculateMatchScore(
        {
          title: formattedJob.title,
          company: formattedJob.company,
          description: formattedJob.description || '',
          location: formattedJob.location,
        },
        {
          experiences: profile?.experiences,
          skills: profile?.skills,
          education: profile?.education,
        }
      );

      return {
        ...formattedJob,
        match_score: score,
        match_reasons: reasons,
      };
    });

    jobsWithScores.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

    for (const job of jobsWithScores) {
      await (supabase
        .from('discovered_jobs')
        .upsert as any)({
          user_id: session.user.id,
          external_id: job.external_id,
          source: job.source,
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          url: job.url,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          posted_at: job.posted_at,
          match_score: job.match_score,
          match_reasons: job.match_reasons,
        }, {
          onConflict: 'user_id,external_id,source'
        });
    }

    return NextResponse.json({
      jobs: jobsWithScores,
      total: jobsWithScores.length,
      page,
      has_more: false, // Simplification for combined feed
    });
  } catch (error: any) {
    console.error('Job discovery error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to discover jobs' },
      { status: 500 }
    );
  }
}
