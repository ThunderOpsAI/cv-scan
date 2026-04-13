import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getOwnedProfileId } from '@/lib/supabase/user-scope';
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
        const profileId = await getOwnedProfileId(supabase, session.user.id);
        if (!profileId) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        const { data: updatedGoal, error } = await (supabase
            .from('smart_goals') as any)
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
            .eq('profile_id', profileId)
            .select()
            .maybeSingle();

        if (error) throw error;
        if (!updatedGoal) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

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
        const profileId = await getOwnedProfileId(supabase, session.user.id);
        if (!profileId) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        const { data: deletedGoal, error } = await supabase
            .from('smart_goals')
            .delete()
            .eq('id', id)
            .eq('profile_id', profileId)
            .select('id')
            .maybeSingle();

        if (error) throw error;
        if (!deletedGoal) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete goal error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete goal' },
            { status: 500 }
        );
    }
}
