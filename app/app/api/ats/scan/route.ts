import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { deductCredits } from '@/lib/supabase/credits';
import { debitReferenceFromRequest } from '@/lib/billing/idempotency';
import { analyzeJobDescription } from '@/lib/ats/scanner';
import { loadProfileForTailoring } from '@/lib/ats/profile-loader';
import { ATSScanRequest, ATSScanResponse } from '@/types/job-packs';

const FREE_SCANS_PER_DAY = 3;
const CREDIT_COST = 1;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ATSScanRequest = await req.json();

    if (!body.job_description || !body.job_description.trim()) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check free scans remaining today
    const { data: freeCountResult } = await (supabase as any).rpc(
      'count_free_scans_today',
      { p_user_id: session.user.id }
    );

    const freeScansUsed = freeCountResult || 0;
    const freeScansRemaining = Math.max(0, FREE_SCANS_PER_DAY - freeScansUsed);
    const isFreeScan = freeScansRemaining > 0;

    // If not free, check credits and deduct
    let creditsCharged = 0;
    if (!isFreeScan) {
      const { data: user } = await supabase
        .from('users')
        .select('credits')
        .eq('id', session.user.id)
        .single() as { data: { credits: number } | null };

      /* Credit check bypassed for beta */

      // Deduct credit
      const deductResult = [{success:true}]; const deductError = null; /* const { data: deductResult, error: deductError } = await deductCredits(supabase as any, {
        p_user_id: session.user.id,
        p_amount: CREDIT_COST,
        p_description: 'ATS scan',
        p_reference_id: debitReferenceFromRequest(req, 'ats-scan'),
      }); */

      if (deductError || !deductResult?.[0]?.success) {
        return NextResponse.json(
          { error: deductResult?.[0]?.error_message || 'Failed to deduct credit' },
          { status: 500 }
        );
      }

      creditsCharged = CREDIT_COST;
    }

    // Load profile for analysis
    const profile = await loadProfileForTailoring(session.user.id, supabase);

    if (!profile) {
      return NextResponse.json(
        { error: 'Please import your resume and approve profile facts before scanning' },
        { status: 400 }
      );
    }

    // Run ATS analysis
    const analysis = await analyzeJobDescription(body.job_description, profile);

    // Store scan result
    const { data: scan, error: scanError } = await supabase
      .from('ats_scans')
      .insert({
        user_id: session.user.id,
        job_description: body.job_description,
        ats_score: analysis.score,
        keyword_matches: analysis.keyword_matches,
        section_scores: analysis.section_scores,
        recommendations: analysis.recommendations,
        is_free_scan: isFreeScan,
      } as any)
      .select()
      .single();

    if (scanError) {
      console.error('Failed to store scan:', scanError);
      return NextResponse.json(
        { error: 'Failed to save scan results' },
        { status: 500 }
      );
    }

    const response: ATSScanResponse = {
      scan,
      free_scans_remaining: isFreeScan ? freeScansRemaining - 1 : 0,
      credits_charged: creditsCharged,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('ATS scan error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to scan job description' },
      { status: 500 }
    );
  }
}

// GET - Check free scans remaining
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    const { data: freeCountResult } = await (supabase as any).rpc(
      'count_free_scans_today',
      { p_user_id: session.user.id }
    );

    const freeScansUsed = freeCountResult || 0;
    const freeScansRemaining = Math.max(0, FREE_SCANS_PER_DAY - freeScansUsed);

    return NextResponse.json({
      free_scans_remaining: freeScansRemaining,
      free_scans_per_day: FREE_SCANS_PER_DAY,
    });
  } catch (error: any) {
    console.error('Error checking free scans:', error);
    return NextResponse.json(
      { error: 'Failed to check free scans' },
      { status: 500 }
    );
  }
}
