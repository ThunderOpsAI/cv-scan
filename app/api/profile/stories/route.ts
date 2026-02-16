import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CreateStarStoryRequest } from '@/types/profile';

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
            return NextResponse.json({ stories: [] });
        }

        const { data: stories, error } = await (supabase
            .from('star_stories') as any)
            .select('*')
            .eq('profile_id', profile.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ stories: stories || [] });
    } catch (error: any) {
        console.error('Fetch stories error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch stories' },
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

        const body: CreateStarStoryRequest = await req.json();
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

        const { data: story, error } = await (supabase
            .from('star_stories') as any)
            .insert({
                profile_id: profile.id,
                title: body.title,
                situation: body.situation,
                task: body.task,
                action: body.action,
                result: body.result,
                tags: body.tags || [],
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ story }, { status: 201 });
    } catch (error: any) {
        console.error('Create story error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create story' },
            { status: 500 }
        );
    }
}
