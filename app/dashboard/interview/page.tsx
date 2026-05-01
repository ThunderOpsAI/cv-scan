"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Message } from "@/types/intelligence";
import { APP_NAME, brandWordmark } from "@/lib/branding";

const brand = brandWordmark();

export default function InterviewPracticePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [company, setCompany] = useState("OpenAI");
  const [sending, setSending] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      loadSession();
    }
  }, [status, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSession = async () => {
    setLoadingSession(true);
    try {
      const res = await fetch("/api/interview/chat");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load interview session.");
      }

      if (data.conversation) {
        setConversationId(data.conversation.id);
        setMessages(data.messages || []);
        if (data.config?.role) setRole(data.config.role);
        if (data.config?.company) setCompany(data.config.company);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingSession(false);
    }
  };

  const startInterview = async () => {
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: true,
          role,
          company,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start interview.");
      }

      setConversationId(data.conversation.id);
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim() || sending || !conversationId) {
      return;
    }

    const userContent = input.trim();
    const optimisticMessage: Message = {
      id: `${Date.now()}`,
      conversation_id: conversationId,
      role: "user",
      content: userContent,
      created_at: new Date().toISOString(),
    };

    setInput("");
    setSending(true);
    setError("");
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          content: userContent,
          role,
          company,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      if (data.assistant_message) {
        setMessages((prev) => [
          ...prev.filter((message) => message.id !== optimisticMessage.id),
          data.user_message,
          data.assistant_message,
        ]);
      }

      router.refresh();
    } catch (err: any) {
      setMessages((prev) => prev.filter((message) => message.id !== optimisticMessage.id));
      setInput(userContent);
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const resetInterview = () => {
    setConversationId(null);
    setMessages([]);
    setInput("");
    setError("");
  };

  if (status === "loading" || loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
        <div className="text-sm text-slate-200">Loading interview workspace...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isStarted = Boolean(conversationId);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,_#081120_0%,_#0f172a_46%,_#081120_100%)]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-5">
        <Link href="/dashboard" className="text-xl font-semibold tracking-tight text-white">
          <span className="text-cyan-300">{brand.leading}</span>
          {brand.trailing}
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-slate-300 transition-colors hover:text-white">
            Dashboard
          </Link>
          <div className="text-white">
            <span className="text-slate-400">Credits:</span>{" "}
            <span className="font-semibold text-cyan-300">{session.user.credits || 0}</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto flex flex-1 px-4 pb-8">
        <div className="mx-auto flex h-[calc(100vh-7rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div>
              <h1 className="text-xl font-semibold text-white">Mock Interview</h1>
              <p className="text-sm text-slate-400">
                Multi-turn practice with saved chat history inside your current {APP_NAME} session.
              </p>
            </div>
            {isStarted && (
              <button
                onClick={resetInterview}
                className="rounded-full border border-white/15 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                Start new session
              </button>
            )}
          </div>

          {!isStarted ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/35 p-6">
                <h2 className="text-2xl font-semibold text-white">Set up your interview</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Choose the role and company you want to rehearse for. Your last session will reload automatically
                  until you start a new one.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">Target role</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Senior Frontend Engineer"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">Target company</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="OpenAI, Stripe, Canva"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

                <button
                  onClick={startInterview}
                  disabled={sending}
                  className="mt-6 w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-900 disabled:text-slate-300"
                >
                  {sending ? "Starting..." : "Start Interview"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-white/10 px-5 py-3 text-sm text-slate-300">
                Interviewing for <span className="font-semibold text-white">{role}</span> at{" "}
                <span className="font-semibold text-white">{company}</span>. 1 credit per candidate reply.
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-md ${
                        message.role === "user"
                          ? "rounded-br-md bg-cyan-400 text-slate-950"
                          : "rounded-bl-md border border-white/10 bg-slate-900/80 text-slate-100"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 rounded-3xl rounded-bl-md border border-white/10 bg-slate-900/80 px-4 py-3">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" style={{ animationDelay: "0.12s" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300" style={{ animationDelay: "0.24s" }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="border-t border-white/10 px-5 py-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your answer or ask for a hint..."
                    disabled={sending}
                    className="flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-900 disabled:text-slate-300"
                  >
                    Send
                  </button>
                </div>
                {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
