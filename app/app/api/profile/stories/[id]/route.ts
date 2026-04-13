import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getOwnedProfileId } from '@/lib/supabase/user-scope';
import { UpdateStarStoryRequest } from '@/types/profile';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body: UpdateStarStoryRequest = await req.json();
        const supabase = createClient();
        const profileId = await getOwnedProfileId(supabase, session.user.id);
        if (!profileId) {
            return NextResponse.json({ error: 'Story not found' }, { status: 404 });
        }

        const { data: updatedStory, error } = await (supabase
            .from('star_stories') as any)
            .update({
                title: body.title,
                situation: body.situation,
                task: body.task,
                action: body.action,
                result: body.result,
                tags: body.tags,
            })
            .eq('id', id)
            .eq('profile_id', profileId)
            .select()
            .maybeSingle();

        if (error) throw error;
        if (!updatedStory) {
            return NextResponse.json({ error: 'Story not found' }, { status: 404 });
        }

        return NextResponse.json({ story: updatedStory });
    } catch (error: any) {
        console.error('Update story error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update story' },
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
            return NextResponse.json({ error: 'Story not found' }, { status: 404 });
        }

        const { data: deletedStory, error } = await supabase
            .from('star_stories')
            .delete()
            .eq('id', id)
            .eq('profile_id', profileId)
            .select('id')
            .maybeSingle();

        if (error) throw error;
        if (!deletedStory) {
            return NextResponse.json({ error: 'Story not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete story error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete story' },
            { status: 500 }
        );
    }
}
