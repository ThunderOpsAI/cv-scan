import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CreateSavedSearchRequest } from '@/types/intelligence';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    const { data: searches, error } = await (supabase
      .from('saved_searches')
      .select as any)('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get saved searches error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch saved searches' },
        { status: 500 }
      );
    }

    return NextResponse.json({ searches: searches || [] });
  } catch (error: any) {
    console.error('Get saved searches error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch saved searches' },
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

    const body: CreateSavedSearchRequest = await req.json();

    if (!body.name || !body.query_params) {
      return NextResponse.json(
        { error: 'Name and query parameters are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: search, error } = await (supabase
      .from('saved_searches')
      .insert as any)({
      user_id: session.user.id,
      name: body.name,
      query_params: body.query_params,
      frequency: body.frequency || 'never',
    })
      .select()
      .single();

    if (error) {
      console.error('Create saved search error:', error);
      return NextResponse.json(
        { error: 'Failed to create saved search' },
        { status: 500 }
      );
    }

    return NextResponse.json({ search }, { status: 201 });
  } catch (error: any) {
    console.error('Create saved search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create saved search' },
      { status: 500 }
    );
  }
}
