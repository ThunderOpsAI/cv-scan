import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CreateProfileRequest, UpdateProfileRequest } from '@/types/profile';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    const { data: profile, error } = await (supabase
      .from('profiles')
      .select as any)('*')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ profile: null }, { status: 200 });
      }
      console.error('Get profile error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const supabase = createClient();

    const { data: existingProfile } = await (supabase
      .from('profiles')
      .select as any)('id')
      .eq('user_id', session.user.id)
      .single();

    let profile;
    let error;

    if (existingProfile) {
      const updateData: UpdateProfileRequest = {
        ...body,
      };

      const result = await (supabase
        .from('profiles')
        .update as any)(updateData)
        .eq('user_id', session.user.id)
        .select()
        .single();

      profile = result.data;
      error = result.error;
    } else {
      const createData: CreateProfileRequest = {
        full_name: body.full_name,
        headline: body.headline,
        summary: body.summary,
        phone: body.phone,
        location: body.location,
        linkedin_url: body.linkedin_url,
        portfolio_url: body.portfolio_url,
        github_url: body.github_url,
      };

      const result = await (supabase
        .from('profiles')
        .insert as any)({
        user_id: session.user.id,
        ...createData,
      })
        .select()
        .single();

      profile = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Update/Create profile error:', error);
      return NextResponse.json(
        { error: 'Failed to save profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Update/Create profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save profile' },
      { status: 500 }
    );
  }
}
