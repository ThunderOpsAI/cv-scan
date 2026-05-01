import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CreateSkillRequest } from '@/types/profile';

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
      return NextResponse.json({ skills: [] }, { status: 200 });
    }

    const { data: skills, error } = await (supabase
      .from('skills') as any)
      .select('*')
      .eq('profile_id', profile.id)
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Get skills error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch skills' },
        { status: 500 }
      );
    }

    return NextResponse.json({ skills: skills || [] });
  } catch (error: any) {
    console.error('Get skills error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch skills' },
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

    const body: CreateSkillRequest = await req.json();

    if (!body.category || !body.name) {
      return NextResponse.json(
        { error: 'Category and name are required' },
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
      .from('skills') as any)
      .select('sort_order')
      .eq('profile_id', profile.id)
      .eq('category', body.category)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = maxSort ? maxSort.sort_order + 1 : 0;

    const { data: skill, error } = await (supabase
      .from('skills') as any)
      .insert({
        profile_id: profile.id,
        category: body.category,
        name: body.name,
        proficiency: body.proficiency,
        years_of_experience: body.years_of_experience,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Create skill error:', error);
      return NextResponse.json(
        { error: 'Failed to create skill' },
        { status: 500 }
      );
    }

    return NextResponse.json({ skill }, { status: 201 });
  } catch (error: any) {
    console.error('Create skill error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create skill' },
      { status: 500 }
    );
  }
}
