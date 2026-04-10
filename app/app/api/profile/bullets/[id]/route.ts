import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { UpdateBulletRequest } from '@/types/profile';

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

    const body: UpdateBulletRequest = await req.json();
    const supabase = createClient();

    const { data: bullet, error } = await (supabase
      .from('bullets')
      .update as any)(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Update bullet error:', error);
      return NextResponse.json(
        { error: 'Failed to update bullet' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bullet });
  } catch (error: any) {
    console.error('Update bullet error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update bullet' },
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
      .from('bullets')
      .delete as any)()
      .eq('id', params.id);

    if (error) {
      console.error('Delete bullet error:', error);
      return NextResponse.json(
        { error: 'Failed to delete bullet' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete bullet error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete bullet' },
      { status: 500 }
    );
  }
}
