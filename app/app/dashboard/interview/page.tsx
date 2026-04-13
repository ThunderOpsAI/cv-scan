"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { planMeetsMinimum, type PlanTier } from "@/lib/billing/plan-tier";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
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
  const [errorMessage, setErrorMessage] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const planTier = (session?.user?.planTier ?? "free") as PlanTier;
  const interviewUnlocked = planMeetsMinimum(planTier, "starter");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startInterview = async () => {
    if (!interviewUnlocked) {
      setErrorMessage("Starter plan or higher required for interview prep. Subscribe on Buy credits.");
      return;
    }
    setErrorMessage("");
    setIsStarted(true);
    setMessages([{ 
      id: Date.now().toString(), 
      role: "assistant", 
      content: `Hello! I'm the hiring manager at ${company}. Thanks for taking the time to interview for the ${role} position today. To start us off, could you walk me through your background and why you're interested in this role?` 
    }]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    if (!interviewUnlocked) {
      setErrorMessage("Starter plan or higher required for interview prep.");
      return;
    }

    if ((session?.user?.credits || 0) < 1) {
      setErrorMessage("You need at least 1 credit to send a mock interview reply.");
      return;
    }

    const userMessage = input;
    setInput("");
    setSending(true);
    setErrorMessage("");

    const newMessages: ChatMessage[] = [
      ...messages,
      { id: Date.now().toString(), role: "user", content: userMessage }
    ];
    
    setMessages(newMessages);

    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          role,
          company
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
        { id: (Date.now() + 1).toString(), role: "assistant", content: data.response }
      ]);
      
      router.refresh(); // refresh credits in header
    } catch (error) {
      console.error("Failed to send message:", error);
      setErrorMessage("Failed to send your reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-white">
          <span className="text-blue-400">CV</span>Scan
        </Link>
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/dashboard" className="text-gray-300 hover:text-white">
            Dashboard
          </Link>
          <div className="text-white text-sm">
            <span className="text-gray-400">Plan:</span>{" "}
            <span className="font-semibold text-indigo-300">{planTier}</span>
          </div>
          <div className="text-white">
            <span className="text-gray-400">Credits:</span>{" "}
            <span className="font-bold text-blue-400">{session?.user?.credits || 0}</span>
          </div>
        </div>
      </nav>

      {!interviewUnlocked && (
        <div className="container mx-auto px-4 pt-4">
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-100 text-sm">
            Interview prep is a <strong>subscription</strong> feature (Starter or higher). Credits alone do not unlock
            this page&apos;s API.{" "}
            <Link href="/buy-credits" className="underline font-semibold text-amber-200">
              View plans and subscribe
            </Link>
            .
          </div>
        </div>
      )}

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex flex-col h-[calc(100vh-100px)]">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 flex flex-col flex-1 overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🎙️ Mock Interview Simulator
              </h2>
              {isStarted && <p className="text-sm text-gray-400">Interviewing for: {role} @ {company}</p>}
            </div>
            {isStarted && (
              <button 
                onClick={() => {
                  if(confirm("End current practice session?")) setIsStarted(false);
                }}
                className="text-xs bg-red-500/20 text-red-300 hover:bg-red-500/40 px-3 py-1 rounded"
              >
                End Session
              </button>
            )}
          </div>

          {/* Setup / Chat Area */}
          {!isStarted ? (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
              <div className="bg-white/5 p-8 rounded-2xl max-w-md w-full border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-2">Setup Your Interview</h3>
                <p className="text-gray-400 mb-6 text-sm">Our AI hiring manager will adapt its questions to your target role and company.</p>
                
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Target Role</label>
                    <input 
                      type="text" 
                      value={role} 
                      onChange={e => setRole(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Target Company</label>
                    <input 
                      type="text" 
                      value={company} 
                      onChange={e => setCompany(e.target.value)}
                      placeholder="e.g. Google, OpenAI, Stripe"
                      className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button 
                    onClick={startInterview}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors"
                  >
                    Start Interview
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-md ${
                        msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-700 text-gray-100 rounded-bl-none border border-white/10"
                      }`}>
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    </div>
                  </div>
                ))}
                
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-gray-100 rounded-2xl rounded-bl-none px-5 py-4 border border-white/10 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-4 bg-black/20 border-t border-white/10">
                {errorMessage && (
                  <div
                    role="alert"
                    className="mb-3 rounded-lg border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100"
                  >
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
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    Reply
                  </button>
                </div>
                <div className="text-center text-xs text-gray-500 mt-2">
                  1 credit per message. The AI will evaluate your answer and ask the next question.
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
