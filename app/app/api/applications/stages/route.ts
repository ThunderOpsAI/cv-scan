import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CreateStageRequest, UpdateStageRequest } from '@/types/applications';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateStageRequest = await req.json();

    if (!body.application_id || !body.stage_type) {
      return NextResponse.json(
        { error: 'Application ID and stage type are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Verify application ownership
    const { data: application } = await (supabase
      .from('applications')
      .select as any)('id')
      .eq('id', body.application_id)
      .eq('user_id', session.user.id)
      .single();

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Get max sort_order
    const { data: existingStages } = await (supabase
      .from('application_stages')
      .select as any)('sort_order')
      .eq('application_id', body.application_id)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = (existingStages?.[0]?.sort_order || 0) + 1;

    const { data: stage, error } = await (supabase
      .from('application_stages')
      .insert as any)({
        application_id: body.application_id,
        stage_type: body.stage_type,
        stage_name: body.stage_name,
        scheduled_at: body.scheduled_at,
        interviewers: body.interviewers || [],
        outcome: 'pending',
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create stage:', error);
      return NextResponse.json(
        { error: 'Failed to create stage' },
        { status: 500 }
      );
    }

    // Update application status if needed
    await (supabase
      .from('applications')
      .update as any)({
        status: 'interviewing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.application_id)
      .in('status', ['saved', 'applied', 'screening']);

    return NextResponse.json({ stage });
  } catch (error: any) {
    console.error('Stage creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create stage' },
      { status: 500 }
    );
  }
}
