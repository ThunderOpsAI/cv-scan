import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { UpdateEducationRequest } from '@/types/profile';

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateEducationRequest = await req.json();
    const supabase = createClient();

    const { data: education, error } = await (supabase
      .from('education')
      .update as any)(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Update education error:', error);
      return NextResponse.json(
        { error: 'Failed to update education' },
        { status: 500 }
      );
    }

    return NextResponse.json({ education });
  } catch (error: any) {
    console.error('Update education error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update education' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    const { error } = await (supabase
      .from('education')
      .delete as any)()
      .eq('id', params.id);

    if (error) {
      console.error('Delete education error:', error);
      return NextResponse.json(
        { error: 'Failed to delete education' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete education error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete education' },
      { status: 500 }
    );
  }
}
