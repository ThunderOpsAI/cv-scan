import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getOwnedBullet } from '@/lib/supabase/user-scope';
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
    const updateData: UpdateBulletRequest = {
      content: body.content,
      mined_metrics: body.mined_metrics,
    };
    const supabase = createClient();
    const ownedBullet = await getOwnedBullet(supabase, session.user.id, params.id);

    if (!ownedBullet) {
      return NextResponse.json({ error: 'Bullet not found' }, { status: 404 });
    }

    const { data: bullet, error } = await (supabase
      .from('bullets')
      .update as any)(updateData)
      .eq('id', params.id)
      .eq('experience_id', ownedBullet.experience_id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Update bullet error:', error);
      return NextResponse.json(
        { error: 'Failed to update bullet' },
        { status: 500 }
      );
    }

    if (!bullet) {
      return NextResponse.json({ error: 'Bullet not found' }, { status: 404 });
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
    const ownedBullet = await getOwnedBullet(supabase, session.user.id, params.id);

    if (!ownedBullet) {
      return NextResponse.json({ error: 'Bullet not found' }, { status: 404 });
    }

    const { data: deletedBullet, error } = await (supabase
      .from('bullets')
      .delete as any)()
      .eq('id', params.id)
      .eq('experience_id', ownedBullet.experience_id)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('Delete bullet error:', error);
      return NextResponse.json(
        { error: 'Failed to delete bullet' },
        { status: 500 }
      );
    }

    if (!deletedBullet) {
      return NextResponse.json({ error: 'Bullet not found' }, { status: 404 });
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
