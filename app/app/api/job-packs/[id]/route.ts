import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { UpdateJobPackRequest } from '@/types/job-packs';

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

    // Get associated ATS scan
    const { data: atsScan } = await (supabase
      .from('ats_scans')
      .select as any)('*')
      .eq('job_pack_id', id)
      .eq('user_id', session.user.id)
      .single();

    return NextResponse.json({
      job_pack: jobPack,
      ats_scan: atsScan,
    });
  } catch (error: any) {
    console.error('Error fetching job pack:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job pack' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body: UpdateJobPackRequest = await req.json();
    const supabase = createClient();
    const updateData: UpdateJobPackRequest = {
      job_title: body.job_title,
      company: body.company,
      job_description: body.job_description,
      resume_version: body.resume_version,
      cover_letter: body.cover_letter,
    };

    // Check ownership
    const { data: existing } = await (supabase
      .from('job_packs')
      .select as any)('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Job pack not found' },
        { status: 404 }
      );
    }

    // Update job pack
    const { data: jobPack, error } = await (supabase
      .from('job_packs')
      .update as any)({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update job pack:', error);
      return NextResponse.json(
        { error: 'Failed to update job pack' },
        { status: 500 }
      );
    }

    return NextResponse.json({ job_pack: jobPack });
  } catch (error: any) {
    console.error('Error updating job pack:', error);
    return NextResponse.json(
      { error: 'Failed to update job pack' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check ownership and delete
    const { error } = await (supabase
      .from('job_packs')
      .delete as any)()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Failed to delete job pack:', error);
      return NextResponse.json(
        { error: 'Failed to delete job pack' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting job pack:', error);
    return NextResponse.json(
      { error: 'Failed to delete job pack' },
      { status: 500 }
    );
  }
}
