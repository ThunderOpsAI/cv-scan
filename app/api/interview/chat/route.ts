import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { gemini } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { deductCredits } from "@/lib/supabase/credits";
import {
  buildInterviewConversationTitle,
  isInterviewConversationTitle,
  parseInterviewConversationTitle,
} from "@/lib/interview";

const CREDIT_COST = 1;

function buildOpeningMessage(role: string, company: string) {
  return `Hi, I’m your interviewer for the ${role} role at ${company}. Let’s run a realistic practice session. Start by giving me a concise overview of your background, the work you’re most proud of, and why this role is a strong fit for you.`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient() as any;

    const { data: conversations, error: conversationError } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", session.user.id)
      .order("last_message_at", { ascending: false })
      .limit(20);

    if (conversationError) {
      console.error("Interview conversations error:", conversationError);
      return NextResponse.json({ error: "Failed to load interview history." }, { status: 500 });
    }

    const conversation = (conversations || []).find((entry: { title: string }) =>
      isInterviewConversationTitle(entry.title)
    );

    if (!conversation) {
      return NextResponse.json({ conversation: null, messages: [] });
    }

    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Interview messages error:", messagesError);
      return NextResponse.json({ error: "Failed to load interview messages." }, { status: 500 });
    }

    return NextResponse.json({
      conversation,
      messages: messages || [],
      config: parseInterviewConversationTitle(conversation.title),
    });
  } catch (error: any) {
    console.error("Interview GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load interview session." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const role = (body.role || "Software Engineer").trim();
    const company = (body.company || "Hiring Team").trim();
    const conversationId = body.conversation_id as string | undefined;
    const isStart = Boolean(body.start);
    const content = typeof body.content === "string" ? body.content.trim() : "";

    const supabase = createClient() as any;

    if (isStart) {
      const title = buildInterviewConversationTitle(role, company);
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          user_id: session.user.id,
          title,
        })
        .select()
        .single();

      if (conversationError || !conversation) {
        console.error("Interview start error:", conversationError);
        return NextResponse.json({ error: "Failed to start interview session." }, { status: 500 });
      }

      const openingMessage = buildOpeningMessage(role, company);

      const { data: assistantMessage, error: assistantError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          role: "assistant",
          content: openingMessage,
        })
        .select()
        .single();

      if (assistantError) {
        console.error("Interview start message error:", assistantError);
        return NextResponse.json({ error: "Failed to initialize interview session." }, { status: 500 });
      }

      return NextResponse.json({
        conversation,
        messages: [assistantMessage],
        config: { role, company },
      });
    }

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation is required." }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Message content is required." }, { status: 400 });
    }

    const { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", session.user.id)
      .single();

    if (!conversation || !isInterviewConversationTitle(conversation.title)) {
      return NextResponse.json({ error: "Interview session not found." }, { status: 404 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("credits")
      .eq("id", session.user.id)
      .single();

    if (!user || user.credits < CREDIT_COST) {
      return NextResponse.json({ error: "Insufficient credits. Please top up to continue." }, { status: 402 });
    }

    const { data: userMessage, error: userMessageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "user",
        content,
      })
      .select()
      .single();

    if (userMessageError) {
      console.error("Interview user message error:", userMessageError);
      return NextResponse.json({ error: "Failed to save your answer." }, { status: 500 });
    }

    const { data: conversationMessages, error: historyError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(30);

    if (historyError) {
      console.error("Interview history error:", historyError);
      return NextResponse.json({ error: "Failed to load interview context." }, { status: 500 });
    }

    const promptContext = (conversationMessages || [])
      .map((message: { role: string; content: string }) =>
        `${message.role === "user" ? "Candidate" : "Interviewer"}: ${message.content}`
      )
      .join("\n\n");

    const systemPrompt = `You are a senior interviewer running a realistic mock interview for the ${role} role at ${company}.

Rules:
1. Stay in role as the interviewer.
2. Respond in under 170 words.
3. First give brief feedback on the candidate's last answer.
4. Then ask exactly one strong next question.
5. Keep the interview coherent and progressive.
6. If the candidate asks for help, give a concise hint and then restate the question.

Conversation:
${promptContext}

Now write the interviewer's next response.`;

    const result = await gemini.generateContent(systemPrompt);
    const assistantResponse = result.response.text().trim();

    if (!assistantResponse) {
      return NextResponse.json({ error: "Failed to generate the next interview prompt." }, { status: 500 });
    }

    const { data: deductResult, error: deductError } = await deductCredits(supabase, {
      p_user_id: session.user.id,
      p_amount: CREDIT_COST,
      p_description: "Interview practice message",
    });

    if (deductError || !deductResult?.[0]?.success) {
      console.error("Interview credit deduction error:", deductError);
      return NextResponse.json(
        { error: deductResult?.[0]?.error_message || "Failed to process credits." },
        { status: 500 }
      );
    }

    const { data: assistantMessage, error: assistantError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: assistantResponse,
      })
      .select()
      .single();

    if (assistantError) {
      console.error("Interview assistant message error:", assistantError);
      return NextResponse.json({ error: "Failed to save the interview response." }, { status: 500 });
    }

    await supabase
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        title: buildInterviewConversationTitle(role, company),
      })
      .eq("id", conversationId);

    return NextResponse.json({
      conversation_id: conversationId,
      user_message: userMessage,
      assistant_message: assistantMessage,
      creditsRemaining: deductResult[0].new_credits,
    });
  } catch (error: any) {
    console.error("Interview POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to continue interview session." },
      { status: 500 }
    );
  }
}
