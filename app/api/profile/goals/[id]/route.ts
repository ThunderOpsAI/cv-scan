import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { UpdateSmartGoalRequest } from '@/types/profile';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body: UpdateSmartGoalRequest = await req.json();
        const supabase = createClient();

        // Verify ownership
        const { data: goal } = await supabase
            .from('smart_goals')
            .select('profile_id')
            .eq('id', id)
            .single() as { data: { profile_id: string } | null };

        if (!goal) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('id', goal.profile_id)
            .single() as { data: { id: string } | null };

        if (!profile) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { data: updatedGoal, error } = await supabase
            .from('smart_goals')
            .update({
                goal: body.goal,
                specific: body.specific,
                measurable: body.measurable,
                achievable: body.achievable,
                relevant: body.relevant,
                time_bound: body.time_bound,
                status: body.status,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ goal: updatedGoal });
    } catch (error: any) {
        console.error('Update goal error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update goal' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const supabase = createClient();

        // Verify ownership indirectly
        const { data: goal } = await supabase
            .from('smart_goals')
            .select('profile_id')
            .eq('id', id)
            .single() as { data: { profile_id: string } | null };

        if (!goal) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('id', goal.profile_id)
            .single() as { data: { id: string } | null };

        if (!profile) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { error } = await supabase
            .from('smart_goals')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete goal error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete goal' },
            { status: 500 }
        );
    }
}
