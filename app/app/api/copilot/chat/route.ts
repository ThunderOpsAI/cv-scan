import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { gemini } from '@/lib/gemini';
import { SendMessageRequest } from '@/types/intelligence';
import { buildCopilotContext, buildSystemPrompt } from '@/lib/copilot/utils';

const MAX_HISTORY_MESSAGES = 8;
const MAX_HISTORY_CHARS = 9000;
const MAX_SINGLE_HISTORY_MESSAGE_CHARS = 1800;
const MAX_USER_MESSAGE_CHARS = 12000;

function truncateText(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return value.slice(0, maxChars).trimEnd() + '\n[truncated]';
}

function formatConversationHistory(messages: Array<{ role: string; content: string }>): string {
  const historyLines = messages
    .slice(-MAX_HISTORY_MESSAGES)
    .map((msg) => `${msg.role}: ${truncateText(msg.content, MAX_SINGLE_HISTORY_MESSAGE_CHARS)}`)
    .join('\n\n');

  return truncateText(historyLines, MAX_HISTORY_CHARS);
}

export async function POST(req: NextRequest) {
  try {
    const requestId = crypto.randomUUID();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SendMessageRequest = await req.json();
    const rawContent = body.content?.trim() || '';

    if (!rawContent) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const userContent = truncateText(rawContent, MAX_USER_MESSAGE_CHARS);

    if (userContent !== rawContent) {
      console.warn('Copilot message truncated before generation', { requestId });
    }

    const supabase = createClient() as any;

    const { data: user } = await supabase
      .from('users')
      .select('credits')
      .eq('id', session.user.id)
      .single() as { data: { credits: number } | null };

    let conversationId = body.conversation_id;

    if (conversationId) {
      const { data: existingConversation, error: existingConversationError } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existingConversationError) {
        console.error('Failed to verify conversation ownership:', existingConversationError);
        return NextResponse.json(
          { error: 'Failed to verify conversation' },
          { status: 500 }
        );
      }

      if (!existingConversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
    } else {
      const title = userContent.slice(0, 50) + (userContent.length > 50 ? '...' : '');
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: session.user.id,
          title,
        } as any)
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

    const { data: userMessage, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: userContent,
      } as any)
      .select()
      .single();

    if (msgError) {
      console.error('Failed to save user message:', msgError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    const { data: conversationMessages, error: conversationMessagesError } = await supabase
      .from('messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(MAX_HISTORY_MESSAGES + 1);

    if (conversationMessagesError) {
      console.error('Failed to load conversation history:', conversationMessagesError);
    }

    const context = await buildCopilotContext(session.user.id, body.context, supabase);
    const systemPrompt = buildSystemPrompt(context);

    const conversationHistory = formatConversationHistory(
      (conversationMessages || [])
        .slice(1)
        .reverse()
        .map((msg: any) => ({ role: msg.role, content: msg.content }))
    );

    const fullPrompt = systemPrompt + '\n\n' +
      (conversationHistory ? 'Previous conversation:\n' + conversationHistory + '\n\n' : '') +
      'User: ' + userContent;

    const result = await gemini.generateContent(fullPrompt);
    const assistantResponse = result.response.text();

    const { data: assistantMessage, error: assistantError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantResponse,
      } as any)
      .select()
      .single();

    if (assistantError) {
      console.error('Failed to save assistant message:', assistantError);
    }

    await (supabase as any)
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
      } as any)
      .eq('id', conversationId)
      .eq('user_id', session.user.id);

    return NextResponse.json({
      conversation_id: conversationId,
      user_message: userMessage,
      assistant_message: assistantMessage,
      creditsRemaining: user?.credits ?? null,
    });
  } catch (error: any) {
    console.error('Copilot chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}
