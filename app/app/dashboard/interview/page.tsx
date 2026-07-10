"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { planMeetsMinimum, type PlanTier } from "@/lib/billing/plan-tier";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface SessionSummary {
  questionsAsked: number;
  topicsDiscussed: string[];
  feedbackPoints: string[];
}

function generateSessionSummary(messages: ChatMessage[], role: string, company: string): SessionSummary {
  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const userMessages = messages.filter((m) => m.role === "user");
  const questionsAsked = assistantMessages.length;

  // Derive rough topics from assistant messages
  const topicsDiscussed: string[] = [];
  if (userMessages.some((m) => /background|experience|career/i.test(m.content))) {
    topicsDiscussed.push("Professional background & experience");
  }
  if (userMessages.some((m) => /team|collaboration|leadership/i.test(m.content))) {
    topicsDiscussed.push("Team collaboration & leadership");
  }
  if (userMessages.some((m) => /challenge|problem|obstacle/i.test(m.content))) {
    topicsDiscussed.push("Problem-solving & challenges");
  }
  if (userMessages.some((m) => /goal|growth|learn/i.test(m.content))) {
    topicsDiscussed.push("Career goals & growth");
  }
  if (topicsDiscussed.length === 0) {
    topicsDiscussed.push(`${role} interview competencies`);
  }

  const feedbackPoints = [
    `You completed ${questionsAsked} question${questionsAsked === 1 ? "" : "s"} for ${role} at ${company}.`,
    userMessages.length > 0
      ? `Average response length: ${Math.round(userMessages.reduce((acc, m) => acc + m.content.length, 0) / userMessages.length)} characters — try to keep answers concise but detailed.`
      : "Start by practising common behavioural and technical questions for this role.",
    "Next time, try using the STAR framework (Situation, Task, Action, Result) for behavioural answers.",
  ];

  return { questionsAsked, topicsDiscussed, feedbackPoints };
}

export default function InterviewPracticePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [role, setRole] = useState("Software Engineer");
  const [company, setCompany] = useState("Google");
  const [isStarted, setIsStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const planTier = "starter"; // Beta: emulate starter tier
  const interviewUnlocked = true; // Beta: unlock all features

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sessionSummary = useMemo(
    () => (messages.length > 2 ? generateSessionSummary(messages, role, company) : null),
    [messages, role, company]
  );

  const startInterview = async () => {
    if (!interviewUnlocked) {
      setErrorMessage("Starter plan or higher required for interview prep. Subscribe on Buy credits.");
      return;
    }
    setErrorMessage("");
    setIsStarted(true);
    setShowSummary(false);
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: `Hello! I'm the hiring manager at ${company}. Thanks for taking the time to interview for the ${role} position today. To start us off, could you walk me through your background and why you're interested in this role?`,
      },
    ]);
  };

  const endSession = () => {
    if (messages.length > 2) {
      setShowSummary(true);
    } else {
      setIsStarted(false);
      setMessages([]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    if (!interviewUnlocked) {
      setErrorMessage("Starter plan or higher required for interview prep.");
      return;
    }

    const userMessage = input;
    setInput("");
    setSending(true);
    setErrorMessage("");

    const newMessages: ChatMessage[] = [
      ...messages,
      { id: Date.now().toString(), role: "user", content: userMessage },
    ];

    setMessages(newMessages);

    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          role,
          company,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: (await res.text()) || "The server returned an unexpected response." };

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Failed to send your reply. Please try again.");
        return;
      }

      if (!data.response) {
        setErrorMessage("The interviewer did not return a response. Please try again.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: data.response },
      ]);

      router.refresh(); // refresh credits in header
    } catch {
      setErrorMessage("Failed to send your reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_22%),linear-gradient(180deg,#04080f_0%,#060b18_100%)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-4 w-32 animate-pulse rounded-lg bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_22%),linear-gradient(180deg,#04080f_0%,#060b18_100%)] flex flex-col">
      {/* Navbar */}
      <nav className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.05]">
            <span className="bg-[linear-gradient(135deg,#7dd3fc,#c4b5fd)] bg-clip-text text-sm font-semibold text-transparent">
              CV
            </span>
          </div>
          <div className="text-base font-semibold tracking-[-0.03em]">AI CV Scan</div>
        </Link>
        <Link href="/dashboard" className="text-sm text-slate-400 transition hover:text-white">
          Back to dashboard
        </Link>
      </nav>

      {/* Main area */}
      <div className="flex-1 container mx-auto px-4 pb-6 max-w-4xl flex flex-col h-[calc(100vh-80px)] sm:px-6">
        <div className="glass-card rounded-[2rem] border border-white/[0.08] flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] bg-black/20 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-white flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-300/16 bg-violet-300/10 text-sm">
                  🎙️
                </span>
                Mock Interview
              </h2>
              {isStarted && (
                <p className="mt-1 text-xs text-slate-500">
                  {role} · {company}
                </p>
              )}
            </div>
            {isStarted && !showSummary && (
              <button
                onClick={endSession}
                className="rounded-full border border-rose-300/16 bg-rose-300/10 px-3.5 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-300/20"
              >
                End session
              </button>
            )}
          </div>

          {/* Body */}
          <AnimatePresence mode="wait">
            {showSummary && sessionSummary ? (
              /* ───── Session Summary ───── */
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="flex-1 overflow-y-auto p-6 sm:p-8"
              >
                <div className="mx-auto max-w-2xl space-y-6">
                  <div className="text-center">
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/16 bg-emerald-300/10 text-2xl">
                      ✓
                    </div>
                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">Session Complete</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      You practised {sessionSummary.questionsAsked} question
                      {sessionSummary.questionsAsked === 1 ? "" : "s"} for{" "}
                      <span className="text-white">{role}</span> at{" "}
                      <span className="text-white">{company}</span>.
                    </p>
                  </div>

                  <GlassCard accent="violet" className="p-5">
                    <p className="eyebrow">Topics discussed</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sessionSummary.topicsDiscussed.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full border border-violet-300/16 bg-violet-300/10 px-3 py-1 text-xs text-violet-100"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </GlassCard>

                  <GlassCard accent="cyan" className="p-5">
                    <p className="eyebrow">Key feedback</p>
                    <ul className="mt-3 space-y-2.5">
                      {sessionSummary.feedbackPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm leading-7 text-slate-300">
                          <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/12 text-[10px] font-bold text-cyan-100">
                            {index + 1}
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <GradientButton
                      onClick={() => {
                        setShowSummary(false);
                        startInterview();
                      }}
                      className="flex-1"
                    >
                      Practice again
                    </GradientButton>
                    <GradientButton href="/dashboard" variant="secondary" className="flex-1">
                      Back to dashboard
                    </GradientButton>
                  </div>
                </div>
              </motion.div>
            ) : !isStarted ? (
              /* ───── Setup ───── */
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="flex-1 p-6 flex flex-col items-center justify-center text-center sm:p-8"
              >
                <div className="w-full max-w-md">
                  <div className="mb-6">
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/16 bg-violet-300/10 text-2xl">
                      🎯
                    </div>
                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">Set up your interview</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      The AI hiring manager will adapt questions to your target role and company.
                    </p>
                  </div>

                  <div className="space-y-4 text-left">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Target role</label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-300/40 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Target company</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Google, OpenAI, Stripe"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-300/40 focus:outline-none transition-colors"
                      />
                    </div>

                    {errorMessage && (
                      <div className="rounded-xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                        {errorMessage}
                      </div>
                    )}

                    <GradientButton onClick={startInterview} className="w-full mt-2">
                      Start interview
                    </GradientButton>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ───── Chat ───── */
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col flex-1 min-h-0"
              >
                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 sm:px-6">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                            msg.role === "user"
                              ? "bg-[linear-gradient(135deg,rgba(99,102,241,0.6),rgba(129,140,248,0.45))] text-white rounded-br-md"
                              : "rounded-bl-md border border-white/[0.06] bg-white/[0.04] text-slate-200"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-violet-300/12 bg-violet-300/8 text-[9px] text-violet-200">
                                AI
                              </span>
                              Interviewer
                            </div>
                          )}
                          <div className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  {sending && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex justify-start"
                    >
                      <div className="rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.04] px-5 py-4 flex items-center gap-3">
                        <span className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md border border-violet-300/12 bg-violet-300/8 text-[9px] text-violet-200">
                            AI
                          </span>
                          Thinking
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" />
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce"
                            style={{ animationDelay: "0.15s" }}
                          />
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce"
                            style={{ animationDelay: "0.3s" }}
                          />
                        </span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <form
                  onSubmit={sendMessage}
                  className="flex-none border-t border-white/[0.06] bg-black/20 px-4 py-4 sm:px-6"
                >
                  {errorMessage && (
                    <div className="mb-3 rounded-xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                      {errorMessage}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your answer..."
                      disabled={sending}
                      className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-300/40 focus:outline-none disabled:opacity-50 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || sending}
                      className="rounded-xl bg-[linear-gradient(135deg,rgba(99,102,241,0.8),rgba(129,140,248,0.7))] px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Reply
                    </button>
                  </div>
                  <div className="mt-2.5 text-center text-xs text-slate-600">
                    The AI evaluates your answer and asks the next question. Use STAR for behavioural questions.
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
