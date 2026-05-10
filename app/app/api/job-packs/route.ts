import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { deductCredits } from '@/lib/supabase/credits';
import { debitReferenceFromRequest } from '@/lib/billing/idempotency';
import { analyzeJobDescription } from '@/lib/ats/scanner';
import { tailorResumeToJob, generateCoverLetter } from '@/lib/ats/tailor';
import { detectCulturalWarnings } from '@/lib/ats/cultural-analysis';
import { loadProfileForTailoring } from '@/lib/ats/profile-loader';
import { extractCoverLetterEvidence } from '@/lib/generation/cover-letter-evidence';
import {
  findUngroundedCandidateClaimLines,
  groundingErrorMessage,
} from '@/lib/generation/grounding';
import { CreateJobPackRequest, JobPackResponse, JobPackListResponse } from '@/types/job-packs';

const CREDIT_COST = 5;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateJobPackRequest = await req.json();

    if (!body.job_title?.trim() || !body.company?.trim() || !body.job_description?.trim()) {
      return NextResponse.json(
        { error: 'Job title, company, and job description are required' },
        { status: 400 }
      );
    }

    const supabase = createClient() as any;

    // Check credits
    const { data: user } = await supabase
      .from('users')
      .select('credits')
      .eq('id', session.user.id)
      .single() as { data: { credits: number } | null };

    if (!user || user.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: `Insufficient credits. Job packs cost ${CREDIT_COST} credits.` },
        { status: 402 }
      );
    }

    // Load profile
    const profile = await loadProfileForTailoring(session.user.id, supabase);

    if (!profile) {
      return NextResponse.json(
        { error: 'Please import your resume and approve profile facts before creating a job pack' },
        { status: 400 }
      );
    }

    // Run all analyses in parallel
    const [atsAnalysis, tailoredResume, coverLetter, culturalWarnings] = await Promise.all([
      analyzeJobDescription(body.job_description, profile),
      tailorResumeToJob(profile, body.job_description),
      generateCoverLetter(profile, body.job_title, body.company, body.job_description),
      detectCulturalWarnings(body.job_description),
    ]);

    const ungroundedResumeLines = findUngroundedCandidateClaimLines(
      tailoredResume,
      profile.approved_facts
    );
    const coverEvidence = extractCoverLetterEvidence(coverLetter, profile.approved_facts);

    if (ungroundedResumeLines.length > 0 || coverEvidence.has_ungrounded_claims) {
      return NextResponse.json(
        {
          error:
            ungroundedResumeLines.length > 0
              ? groundingErrorMessage('resume')
              : groundingErrorMessage('cover_letter'),
          grounding: {
            ungrounded_resume_line_count: ungroundedResumeLines.length,
            cover_letter_missing_grounding: coverEvidence.missing_grounding_notes,
          },
        },
        { status: 422 }
      );
    }

    // Deduct credits
    const { data: deductResult, error: deductError } = await deductCredits(supabase as any, {
      p_user_id: session.user.id,
      p_amount: CREDIT_COST,
      p_description: `Job pack: ${body.job_title} at ${body.company}`,
      p_reference_id: debitReferenceFromRequest(req, 'job-pack'),
    });

    // Create job pack
    const { data: jobPack, error: jobPackError } = await supabase
      .from('job_packs')
      .insert({
        user_id: session.user.id,
        job_title: body.job_title,
        company: body.company,
        job_description: body.job_description,
        resume_version: tailoredResume,
        cover_letter: coverLetter,
        ats_score: atsAnalysis.score,
        cultural_fit_warnings: culturalWarnings,
      } as any)
      .select()
      .single();

    if (jobPackError) {
      console.error('Failed to create job pack:', jobPackError);
      return NextResponse.json(
        { error: 'Failed to create job pack' },
        { status: 500 }
      );
    }

    // Store ATS scan linked to job pack
    const { data: atsScan } = await supabase
      .from('ats_scans')
      .insert({
        user_id: session.user.id,
        job_pack_id: jobPack.id,
        job_description: body.job_description,
        ats_score: atsAnalysis.score,
        keyword_matches: atsAnalysis.keyword_matches,
        section_scores: atsAnalysis.section_scores,
        recommendations: atsAnalysis.recommendations,
        is_free_scan: false,
      } as any)
      .select()
      .single();

    const response: JobPackResponse = {
      job_pack: jobPack,
      ats_scan: (atsScan || undefined) as any,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Job pack creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create job pack' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get job packs
    const { data: jobPacks, error } = await supabase
      .from('job_packs')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch job packs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch job packs' },
        { status: 500 }
      );
    }

    // Get total count
    const { count } = await supabase
      .from('job_packs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);

    const response: JobPackListResponse = {
      job_packs: jobPacks || [],
      total: count || 0,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching job packs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job packs' },
      { status: 500 }
    );
  }
}
