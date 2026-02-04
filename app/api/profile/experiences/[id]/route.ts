import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { UpdateExperienceRequest } from '@/types/profile';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateExperienceRequest = await req.json();
    const supabase = createClient();

    const { data: experience, error } = await (supabase
      .from('experiences')
      .update as any)(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Update experience error:', error);
      return NextResponse.json(
        { error: 'Failed to update experience' },
        { status: 500 }
      );
    }

    return NextResponse.json({ experience });
  } catch (error: any) {
    console.error('Update experience error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update experience' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    const { error } = await (supabase
      .from('experiences')
      .delete as any)()
      .eq('id', params.id);

    if (error) {
      console.error('Delete experience error:', error);
      return NextResponse.json(
        { error: 'Failed to delete experience' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete experience error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete experience' },
      { status: 500 }
    );
  }
}
