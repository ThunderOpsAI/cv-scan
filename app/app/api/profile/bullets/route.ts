import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CreateBulletRequest } from '@/types/profile';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const experienceId = searchParams.get('experience_id');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'experience_id is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: bullets, error } = await (supabase
      .from('bullets')
      .select as any)('*')
      .eq('experience_id', experienceId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Get bullets error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bullets' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bullets: bullets || [] });
  } catch (error: any) {
    console.error('Get bullets error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bullets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateBulletRequest = await req.json();

    if (!body.experience_id || !body.content) {
      return NextResponse.json(
        { error: 'experience_id and content are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: maxSort } = await (supabase
      .from('bullets')
      .select as any)('sort_order')
      .eq('experience_id', body.experience_id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = maxSort ? maxSort.sort_order + 1 : 0;

    const { data: bullet, error } = await (supabase
      .from('bullets')
      .insert as any)({
      experience_id: body.experience_id,
      content: body.content,
      sort_order: nextSortOrder,
    })
      .select()
      .single();

    if (error) {
      console.error('Create bullet error:', error);
      return NextResponse.json(
        { error: 'Failed to create bullet' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bullet }, { status: 201 });
  } catch (error: any) {
    console.error('Create bullet error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create bullet' },
      { status: 500 }
    );
  }
}
