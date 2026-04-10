import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CreateExperienceRequest } from '@/types/profile';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    const { data: profile } = await (supabase
      .from('profiles') as any)
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ experiences: [] }, { status: 200 });
    }

    const { data: experiences, error } = await (supabase
      .from('experiences') as any)
      .select('*')
      .eq('profile_id', profile.id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Get experiences error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch experiences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ experiences: experiences || [] });
  } catch (error: any) {
    console.error('Get experiences error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch experiences' },
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

    const body: CreateExperienceRequest = await req.json();

    if (!body.company || !body.title || !body.start_date) {
      return NextResponse.json(
        { error: 'Company, title, and start date are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: profile } = await (supabase
      .from('profiles') as any)
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found. Please create a profile first.' },
        { status: 404 }
      );
    }

    const { data: maxSort } = await (supabase
      .from('experiences') as any)
      .select('sort_order')
      .eq('profile_id', profile.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = maxSort ? maxSort.sort_order + 1 : 0;

    const { data: experience, error } = await (supabase
      .from('experiences') as any)
      .insert({
        profile_id: profile.id,
        company: body.company,
        title: body.title,
        location: body.location,
        start_date: body.start_date,
        end_date: body.end_date,
        is_current: body.is_current,
        description: body.description,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Create experience error:', error);
      return NextResponse.json(
        { error: 'Failed to create experience' },
        { status: 500 }
      );
    }

    return NextResponse.json({ experience }, { status: 201 });
  } catch (error: any) {
    console.error('Create experience error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create experience' },
      { status: 500 }
    );
  }
}
