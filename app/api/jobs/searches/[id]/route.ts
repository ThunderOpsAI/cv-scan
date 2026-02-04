import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { UpdateSavedSearchRequest } from '@/types/intelligence';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateSavedSearchRequest = await req.json();
    const supabase = createClient();

    const { data: search, error } = await (supabase
      .from('saved_searches')
      .update as any)(body)
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Update saved search error:', error);
      return NextResponse.json(
        { error: 'Failed to update saved search' },
        { status: 500 }
      );
    }

    return NextResponse.json({ search });
  } catch (error: any) {
    console.error('Update saved search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update saved search' },
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
      .from('saved_searches')
      .delete as any)()
      .eq('id', params.id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Delete saved search error:', error);
      return NextResponse.json(
        { error: 'Failed to delete saved search' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete saved search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete saved search' },
      { status: 500 }
    );
  }
}
