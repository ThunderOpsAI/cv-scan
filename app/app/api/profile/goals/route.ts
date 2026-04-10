import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CreateSmartGoalRequest } from '@/types/profile';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();

        // Get profile first
        const { data: profile } = await (supabase
            .from('profiles') as any)
            .select('id')
            .eq('user_id', session.user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ goals: [] });
        }

        const { data: goals, error } = await supabase
            .from('smart_goals')
            .select('*')
            .eq('profile_id', profile.id)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ goals: goals || [] });
    } catch (error: any) {
        console.error('Fetch goals error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch goals' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: CreateSmartGoalRequest = await req.json();
        const supabase = createClient();

        // Verify profile ownership
        const { data: profile } = await (supabase
            .from('profiles') as any)
            .select('id')
            .eq('user_id', session.user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // Get max sort_order
        const { data: maxOrder } = await (supabase
            .from('smart_goals') as any)
            .select('sort_order')
            .eq('profile_id', profile.id)
            .order('sort_order', { ascending: false })
            .limit(1)
            .single();

        const nextOrder = (maxOrder?.sort_order ?? -1) + 1;

        const { data: goal, error } = await (supabase
            .from('smart_goals') as any)
            .insert({
                profile_id: profile.id,
                goal: body.goal,
                specific: body.specific,
                measurable: body.measurable,
                achievable: body.achievable,
                relevant: body.relevant,
                time_bound: body.time_bound,
                status: body.status || 'in_progress',
                sort_order: nextOrder,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ goal }, { status: 201 });
    } catch (error: any) {
        console.error('Create goal error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create goal' },
            { status: 500 }
        );
    }
}
