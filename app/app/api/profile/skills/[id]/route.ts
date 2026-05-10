import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getOwnedProfileId } from '@/lib/supabase/user-scope';
import { UpdateSkillRequest } from '@/types/profile';

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

    const body: UpdateSkillRequest = await req.json();
    const updateData: UpdateSkillRequest = {
      category: body.category,
      name: body.name,
      proficiency: body.proficiency,
      years_of_experience: body.years_of_experience,
    };
    const supabase = createClient();
    const profileId = await getOwnedProfileId(supabase, session.user.id);

    if (!profileId) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    const { data: skill, error } = await (supabase
      .from('skills')
      .update as any)(updateData)
      .eq('id', params.id)
      .eq('profile_id', profileId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Update skill error:', error);
      return NextResponse.json(
        { error: 'Failed to update skill' },
        { status: 500 }
      );
    }

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    return NextResponse.json({ skill });
  } catch (error: any) {
    console.error('Update skill error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update skill' },
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
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    const { data: deletedSkill, error } = await (supabase
      .from('skills')
      .delete as any)()
      .eq('id', params.id)
      .eq('profile_id', profileId)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('Delete skill error:', error);
      return NextResponse.json(
        { error: 'Failed to delete skill' },
        { status: 500 }
      );
    }

    if (!deletedSkill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete skill error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete skill' },
      { status: 500 }
    );
  }
}
