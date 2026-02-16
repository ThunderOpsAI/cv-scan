import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
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

        // Verify ownership
        const { data: story } = await supabase
            .from('star_stories')
            .select('profile_id')
            .eq('id', id)
            .single() as { data: { profile_id: string } | null };

        if (!story) {
            return NextResponse.json({ error: 'Story not found' }, { status: 404 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('id', story.profile_id)
            .single() as { data: { id: string } | null };

        if (!profile) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }


        // @ts-ignore - Supabase type inference issue
        const { data: updatedStory, error } = await supabase
            .from('star_stories')
            .update({
                title: body.title,
                situation: body.situation,
                task: body.task,
                action: body.action,
                result: body.result,
                tags: body.tags,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

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

        // Verify ownership indirectly via RLS or explicit check
        // Explicit check is safer if RLS policy relies on complex joins
        const { data: story } = await supabase
            .from('star_stories')
            .select('profile_id')
            .eq('id', id)
            .single() as { data: { profile_id: string } | null };

        if (!story) {
            return NextResponse.json({ error: 'Story not found' }, { status: 404 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('id', story.profile_id)
            .single() as { data: { id: string } | null };

        if (!profile) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { error } = await supabase
            .from('star_stories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete story error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete story' },
            { status: 500 }
        );
    }
}
