import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getOwnedProfileId } from '@/lib/supabase/user-scope';
import { UpdateExperienceRequest } from '@/types/profile';

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

    const body: UpdateExperienceRequest = await req.json();
    const updateData: UpdateExperienceRequest = {
      company: body.company,
      title: body.title,
      location: body.location,
      start_date: body.start_date,
      end_date: body.end_date,
      is_current: body.is_current,
      description: body.description,
    };
    const supabase = createClient();
    const profileId = await getOwnedProfileId(supabase, session.user.id);

    if (!profileId) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    const { data: experience, error } = await (supabase
      .from('experiences')
      .update as any)(updateData)
      .eq('id', params.id)
      .eq('profile_id', profileId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Update experience error:', error);
      return NextResponse.json(
        { error: 'Failed to update experience' },
        { status: 500 }
      );
    }

    if (!experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
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
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const profileId = await getOwnedProfileId(supabase, session.user.id);

    if (!profileId) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    const { data: deletedExperience, error } = await (supabase
      .from('experiences')
      .delete as any)()
      .eq('id', params.id)
      .eq('profile_id', profileId)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('Delete experience error:', error);
      return NextResponse.json(
        { error: 'Failed to delete experience' },
        { status: 500 }
      );
    }

    if (!deletedExperience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
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
