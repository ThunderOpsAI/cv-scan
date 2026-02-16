import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CreateEducationRequest } from '@/types/profile';

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
      return NextResponse.json({ education: [] }, { status: 200 });
    }

    const { data: education, error } = await (supabase
      .from('education') as any)
      .select('*')
      .eq('profile_id', profile.id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Get education error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch education' },
        { status: 500 }
      );
    }

    return NextResponse.json({ education: education || [] });
  } catch (error: any) {
    console.error('Get education error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch education' },
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

    const body: CreateEducationRequest = await req.json();

    if (!body.institution || !body.degree || !body.start_date) {
      return NextResponse.json(
        { error: 'Institution, degree, and start date are required' },
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
      .from('education') as any)
      .select('sort_order')
      .eq('profile_id', profile.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = maxSort ? maxSort.sort_order + 1 : 0;

    const { data: education, error } = await (supabase
      .from('education') as any)
      .insert({
        profile_id: profile.id,
        institution: body.institution,
        degree: body.degree,
        field_of_study: body.field_of_study,
        location: body.location,
        start_date: body.start_date,
        end_date: body.end_date,
        gpa: body.gpa,
        honors: body.honors,
        description: body.description,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Create education error:', error);
      return NextResponse.json(
        { error: 'Failed to create education' },
        { status: 500 }
      );
    }

    return NextResponse.json({ education }, { status: 201 });
  } catch (error: any) {
    console.error('Create education error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create education' },
      { status: 500 }
    );
  }
}
