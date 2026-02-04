import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { gemini } from '@/lib/gemini';
import { SendMessageRequest } from '@/types/intelligence';
import { buildCopilotContext, buildSystemPrompt } from '@/lib/copilot/utils';

const CREDIT_COST = 1;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SendMessageRequest = await req.json();

    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: user } = await (supabase
      .from('users')
      .select as any)('credits')
      .eq('id', session.user.id)
      .single();

    if (!user || user.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please purchase more credits.' },
        { status: 402 }
      );
    }

    let conversationId = body.conversation_id;

    if (!conversationId) {
      const title = body.content.slice(0, 50) + (body.content.length > 50 ? '...' : '');
      const { data: newConversation, error: convError } = await (supabase
        .from('conversations')
        .insert as any)({
        user_id: session.user.id,
        title,
      })
        .select()
        .single();

      if (convError || !newConversation) {
        console.error('Failed to create conversation:', convError);
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        );
      }

      conversationId = newConversation.id;
    }

    const { data: userMessage, error: msgError } = await (supabase
      .from('messages')
      .insert as any)({
      conversation_id: conversationId,
      role: 'user',
      content: body.content,
    })
      .select()
      .single();

    if (msgError) {
      console.error('Failed to save user message:', msgError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    const { data: conversationMessages } = await (supabase
      .from('messages')
      .select as any)('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    const context = await buildCopilotContext(session.user.id, body.context, supabase);
    const systemPrompt = buildSystemPrompt(context);

    const conversationHistory = (conversationMessages || [])
      .slice(0, -1)
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const fullPrompt = `${systemPrompt}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ''}User: ${body.content}