"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const starterPrompts = [
  "Summarize today's priorities in three bullets.",
  "Draft a friendly follow-up email for a client.",
  "Turn my rough notes into a polished proposal intro.",
];

export default function Home() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isSending]);

  const sendMessage = async (prompt?: string) => {
    const content = (prompt ?? message).trim();

    if (!content || isSending) return;

    const userMsg: Message = { role: "user", content };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");
    setError("");
    setIsSending(true);

    try {
      const res = await fetch("http://localhost:5678/webhook/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          userId: "1",
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const reply =
        typeof data.reply === "string" && data.reply.trim()
          ? data.reply
          : "I received your message, but the reply was empty.";

      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch {
      const fallback =
        "I couldn't reach the chat service just now. Please check the webhook and try again.";

      setError(fallback);
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fallback,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage();
  };

  const handleKeyDown = async (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await sendMessage();
    }
  };

  return (
    <main className="min-h-dvh bg-[#f3f4ef] font-sans text-slate-900">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 px-6 py-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between lg:block">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
                  Workspace
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  AI Chat
                </h1>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
                  A quiet, focused interface for fast questions, draft reviews,
                  and everyday writing tasks.
                </p>
              </div>

              <div className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 lg:mt-6">
                {isSending ? "Responding" : "Ready"}
              </div>
            </div>

            <div className="mt-8 hidden lg:block">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
                Suggested Prompts
              </p>
              <div className="mt-4 space-y-3">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    disabled={isSending}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm leading-6 text-slate-700 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 hidden lg:block rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">Interaction</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Press Enter to send. Use Shift + Enter when you want a new line.
              </p>
            </div>
          </aside>

          <section className="flex min-h-0 flex-1 flex-col">
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Conversation
                </p>
                <p className="text-sm text-slate-500">
                  Messages are sent to your local webhook endpoint.
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {chat.length} messages
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {chat.length === 0 ? (
                <div className="flex h-full min-h-[22rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 px-6 text-center">
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
                    No messages yet
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                    Start a clear conversation
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
                    Ask a question, share a draft, or use one of the prompt
                    ideas from the sidebar to begin.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chat.map((msg, index) => {
                    const isUser = msg.role === "user";

                    return (
                      <div
                        key={`${msg.role}-${index}-${msg.content.slice(0, 24)}`}
                        className={`flex ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[90%] rounded-3xl px-4 py-3 sm:max-w-[75%] ${
                            isUser
                              ? "bg-slate-900 text-white"
                              : "border border-slate-200 bg-slate-50 text-slate-900"
                          }`}
                        >
                          <p
                            className={`mb-2 text-[11px] uppercase tracking-[0.24em] ${
                              isUser ? "text-white/60" : "text-slate-500"
                            }`}
                          >
                            {isUser ? "You" : "Assistant"}
                          </p>
                          <p className="whitespace-pre-wrap text-sm leading-6">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {isSending ? (
                    <div className="flex justify-start">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-slate-500">
                          Assistant
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
                          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="border-t border-slate-200 px-5 py-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="sr-only" htmlFor="chat-message">
                  Message
                </label>
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-2">
                  <textarea
                    id="chat-message"
                    rows={3}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a message..."
                    className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <div className="flex flex-col gap-3 border-t border-slate-200 px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                      {error || "Connected to your local webhook endpoint."}
                    </p>
                    <button
                      type="submit"
                      disabled={isSending || !message.trim()}
                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
