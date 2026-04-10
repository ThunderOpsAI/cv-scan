import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CreateApplicationRequest, ApplicationListResponse } from '@/types/applications';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateApplicationRequest = await req.json();

    if (!body.company?.trim() || !body.title?.trim()) {
      return NextResponse.json(
        { error: 'Company and title are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: application, error } = await (supabase
      .from('applications')
      .insert as any)({
        user_id: session.user.id,
        company: body.company,
        title: body.title,
        url: body.url,
        job_description: body.job_description,
        location: body.location,
        salary_range: body.salary_range,
        source: body.source,
        status: body.status || 'saved',
        priority: body.priority || 'medium',
        applied_at: body.applied_at,
        notes: body.notes,
        job_pack_id: body.job_pack_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create application:', error);
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      );
    }

    return NextResponse.json({ application });
  } catch (error: any) {
    console.error('Application creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create application' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const archived = searchParams.get('archived') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = (supabase
      .from('applications')
      .select as any)('*', { count: 'exact' })
      .eq('user_id', session.user.id)
      .eq('is_archived', archived);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: applications, error, count } = await query
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    const response: ApplicationListResponse = {
      applications: applications || [],
      total: count || 0,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
