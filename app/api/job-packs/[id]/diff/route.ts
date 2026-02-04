import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { loadProfileForTailoring, buildOriginalResume } from '@/lib/ats/profile-loader';
import { computeDetailedDiff } from '@/lib/ats/diff';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createClient();

    // Get job pack
    const { data: jobPack, error } = await (supabase
      .from('job_packs')
      .select as any)('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error || !jobPack) {
      return NextResponse.json(
        { error: 'Job pack not found' },
        { status: 404 }
      );
    }

    if (!jobPack.resume_version) {
      return NextResponse.json(
        { error: 'No tailored resume available' },
        { status: 400 }
      );
    }

    // Load profile to build original resume
    const profile = await loadProfileForTailoring(session.user.id, supabase);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 400 }
      );
    }

    // Build original resume and compute diff
    const originalResume = buildOriginalResume(profile);
    const diff = computeDetailedDiff(originalResume, jobPack.resume_version);

    return NextResponse.json(diff);
  } catch (error: any) {
    console.error('Error computing diff:', error);
    return NextResponse.json(
      { error: 'Failed to compute diff' },
      { status: 500 }
    );
  }
}
