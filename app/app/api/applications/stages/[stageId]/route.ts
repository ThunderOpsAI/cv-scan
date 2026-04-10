import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { UpdateStageRequest } from '@/types/applications';
import { structureInterviewNotes } from '@/lib/applications/notes-structurer';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ stageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stageId } = await params;
    const supabase = createClient();

    // Get stage with application ownership check
    const { data: stage, error } = await (supabase
      .from('application_stages')
      .select as any)('*, applications!inner(user_id)')
      .eq('id', stageId)
      .single();

    if (error || !stage || stage.applications.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }

    // Remove joined data
    delete stage.applications;

    return NextResponse.json({ stage });
  } catch (error: any) {
    console.error('Error fetching stage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stage' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ stageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stageId } = await params;
    const body: UpdateStageRequest = await req.json();
    const supabase = createClient();

    // Verify ownership
    const { data: existing } = await (supabase
      .from('application_stages')
      .select as any)('*, applications!inner(user_id)')
      .eq('id', stageId)
      .single();

    if (!existing || existing.applications.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }

    // If raw_notes provided and changed, structure them
    let ai_structured = existing.ai_structured;
    if (body.raw_notes && body.raw_notes !== existing.raw_notes) {
      ai_structured = await structureInterviewNotes(body.raw_notes);
    }

    const { data: stage, error } = await (supabase
      .from('application_stages')
      .update as any)({
        ...body,
        ai_structured,
        updated_at: new Date().toISOString(),
      })
      .eq('id', stageId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update stage:', error);
      return NextResponse.json(
        { error: 'Failed to update stage' },
        { status: 500 }
      );
    }

    return NextResponse.json({ stage });
  } catch (error: any) {
    console.error('Error updating stage:', error);
    return NextResponse.json(
      { error: 'Failed to update stage' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ stageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stageId } = await params;
    const supabase = createClient();

    // Verify ownership before delete
    const { data: existing } = await (supabase
      .from('application_stages')
      .select as any)('*, applications!inner(user_id)')
      .eq('id', stageId)
      .single();

    if (!existing || existing.applications.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }

    const { error } = await (supabase
      .from('application_stages')
      .delete as any)()
      .eq('id', stageId);

    if (error) {
      console.error('Failed to delete stage:', error);
      return NextResponse.json(
        { error: 'Failed to delete stage' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting stage:', error);
    return NextResponse.json(
      { error: 'Failed to delete stage' },
      { status: 500 }
    );
  }
}
