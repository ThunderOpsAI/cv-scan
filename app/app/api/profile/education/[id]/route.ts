import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getOwnedProfileId } from '@/lib/supabase/user-scope';
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
    const updateData: UpdateEducationRequest = {
      institution: body.institution,
      degree: body.degree,
      field_of_study: body.field_of_study,
      location: body.location,
      start_date: body.start_date,
      end_date: body.end_date,
      gpa: body.gpa,
      honors: body.honors,
      description: body.description,
    };
    const supabase = createClient();
    const profileId = await getOwnedProfileId(supabase, session.user.id);

    if (!profileId) {
      return NextResponse.json({ error: 'Education not found' }, { status: 404 });
    }

    const { data: education, error } = await (supabase
      .from('education')
      .update as any)(updateData)
      .eq('id', params.id)
      .eq('profile_id', profileId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Update education error:', error);
      return NextResponse.json(
        { error: 'Failed to update education' },
        { status: 500 }
      );
    }

    if (!education) {
      return NextResponse.json({ error: 'Education not found' }, { status: 404 });
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
    const profileId = await getOwnedProfileId(supabase, session.user.id);

    if (!profileId) {
      return NextResponse.json({ error: 'Education not found' }, { status: 404 });
    }

    const { data: deletedEducation, error } = await (supabase
      .from('education')
      .delete as any)()
      .eq('id', params.id)
      .eq('profile_id', profileId)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('Delete education error:', error);
      return NextResponse.json(
        { error: 'Failed to delete education' },
        { status: 500 }
      );
    }

    if (!deletedEducation) {
      return NextResponse.json({ error: 'Education not found' }, { status: 404 });
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
