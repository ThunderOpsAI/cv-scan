import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { UpdateApplicationRequest } from '@/types/applications';

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

    // Get application with stages
    const { data: application, error } = await (supabase
      .from('applications')
      .select as any)('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Get stages
    const { data: stages } = await (supabase
      .from('application_stages')
      .select as any)('*')
      .eq('application_id', application.id)
      .order('sort_order', { ascending: true });

    // Get generated emails
    const { data: emails } = await (supabase
      .from('generated_emails')
      .select as any)('*')
      .eq('application_id', application.id)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      application,
      stages: stages || [],
      emails: emails || [],
    });
  } catch (error: any) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
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
    const body: UpdateApplicationRequest = await req.json();
    const supabase = createClient();

    // Check ownership
    const { data: existing } = await (supabase
      .from('applications')
      .select as any)('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    let jobPackId = body.job_pack_id;

    if (jobPackId) {
      const { data: ownedJobPack, error: jobPackError } = await (supabase
        .from('job_packs')
        .select as any)('id')
        .eq('id', jobPackId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (jobPackError) {
        console.error('Failed to verify job pack ownership:', jobPackError);
        return NextResponse.json(
          { error: 'Failed to verify job pack' },
          { status: 500 }
        );
      }

      if (!ownedJobPack) {
        return NextResponse.json({ error: 'Job pack not found' }, { status: 404 });
      }

      jobPackId = ownedJobPack.id;
    }

    const updateData: UpdateApplicationRequest = {
      company: body.company,
      title: body.title,
      url: body.url,
      job_description: body.job_description,
      location: body.location,
      salary_range: body.salary_range,
      source: body.source,
      status: body.status,
      priority: body.priority,
      applied_at: body.applied_at,
      notes: body.notes,
      job_pack_id: jobPackId,
      is_archived: body.is_archived,
      ats_score: body.ats_score,
      cultural_score: body.cultural_score,
    };

    const { data: application, error } = await (supabase
      .from('applications')
      .update as any)({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update application:', error);
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      );
    }

    return NextResponse.json({ application });
  } catch (error: any) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
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

    const { error } = await (supabase
      .from('applications')
      .delete as any)()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Failed to delete application:', error);
      return NextResponse.json(
        { error: 'Failed to delete application' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
