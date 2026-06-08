"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Conversation, Message } from "@/types/intelligence";
import { CopilotPageSkeleton } from "@/components/ui/dashboard-skeletons";

export default function CopilotPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchConversations();
    }
  }, [status, router]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/copilot/conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  const loadConversation = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/copilot/conversations/${id}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setCurrentConversation(id);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    const userMessage = input;
    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        conversation_id: currentConversation || "",
        role: "user",
        content: userMessage,
        created_at: new Date().toISOString(),
      },
    ]);

    try {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: currentConversation,
          content: userMessage,
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      if (!currentConversation) {
        setCurrentConversation(data.conversation_id);
        fetchConversations();
      }

      if (data.assistant_message) {
        setMessages((prev) => [...prev, data.assistant_message]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  if (status === "loading") {
    return <CopilotPageSkeleton />;
  }

  return (
    <div className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav className="container mx-auto flex flex-none items-center justify-between gap-4 px-4 py-4 sm:py-6">
        <Link href="/dashboard" className="text-2xl font-bold text-[#1A237E]">
          <span className="text-[#26A69A]">CV</span>Scan
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
          <Link href="/dashboard" className="text-[#607086] hover:text-[#1A237E]">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="container mx-auto flex min-h-0 flex-1 px-4 pb-4 pt-2 sm:pb-6 md:py-8">
        <div className="mx-auto flex min-h-0 w-full max-w-7xl">
          <div className="grid min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] gap-4 md:grid-cols-4 md:grid-rows-1 md:gap-6">
            {/* Sidebar */}
            <div className="max-h-44 overflow-y-auto rounded-2xl border border-black/[0.06] bg-white/60 p-4 backdrop-blur-lg md:col-span-1 md:max-h-none">
              <button
                onClick={startNewConversation}
                className="w-full bg-blue-600 hover:bg-blue-700 text-[#1A237E] px-4 py-2 rounded-lg mb-4"
              >
                New Chat
              </button>

              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      currentConversation === conv.id
                        ? "bg-blue-600 text-[#1A237E]"
                        : "text-[#607086] hover:bg-white/60"
                    }`}
                  >
                    <div className="truncate text-sm">{conv.title}</div>
                    <div className="text-xs text-[#607086]/80 mt-1">
                      {new Date(conv.last_message_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white/60 backdrop-blur-lg md:col-span-3">
              {/* Messages */}
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                {messages.length === 0 && !currentConversation && (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <h2 className="text-2xl font-bold text-[#1A237E] mb-2">Job Search Copilot</h2>
                      <p className="text-[#607086]/80">
                        Ask me anything about your job search, resume, or interview prep
                      </p>
                      <div className="mt-6 text-sm text-[#607086]/80">
                        <p>Try asking:</p>
                        <ul className="mt-2 space-y-1">
                          <li>• "Help me tailor my resume for a software engineer role"</li>
                          <li>• "What should I know about working at Google?"</li>
                          <li>• "How do I prepare for a technical interview?"</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex justify-center">
                    <div className="w-full max-w-2xl animate-pulse space-y-3">
                      <div className="h-20 w-3/4 rounded-2xl bg-white/60" />
                      <div className="ml-auto h-16 w-1/2 rounded-2xl bg-white/60" />
                      <div className="h-24 w-2/3 rounded-2xl bg-white/60" />
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-lg px-4 py-2 sm:max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-blue-600 text-[#1A237E]"
                          : "bg-white/20 text-gray-100"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-white/20 text-gray-100 rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="flex-none border-t border-black/[0.06] p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    disabled={sending}
                    className="min-w-0 flex-1 px-4 py-3 bg-white/40 border border-black/[0.06] rounded-lg text-[#1A237E] placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="shrink-0 bg-blue-600 hover:bg-blue-700 text-[#1A237E] px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:px-6"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
