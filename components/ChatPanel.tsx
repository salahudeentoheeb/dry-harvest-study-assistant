"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, MessageCircleQuestion } from "lucide-react";
import Markdown, { type Components } from "react-markdown";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconTooltip } from "@/components/IconTooltip";
import { useStudy } from "@/lib/study-context";
import { ACTIVE_BOOK } from "@/lib/books/config";
import { cn } from "@/lib/utils";

// Compact markdown rendering tuned for a narrow chat bubble — no
// document-style headings, tight list/paragraph spacing, real bold instead
// of literal asterisks.
const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  ul: ({ children }) => <ul className="mb-1.5 list-disc space-y-0.5 pl-4 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-1.5 list-decimal space-y-0.5 pl-4 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="leading-snug">{children}</li>,
  h1: ({ children }) => <p className="mt-1.5 mb-1 font-semibold first:mt-0">{children}</p>,
  h2: ({ children }) => <p className="mt-1.5 mb-1 font-semibold first:mt-0">{children}</p>,
  h3: ({ children }) => <p className="mt-1.5 mb-1 font-semibold first:mt-0">{children}</p>,
  code: ({ children }) => (
    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
      {children}
    </a>
  ),
};

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-0.5">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
    </span>
  );
}

// How many characters of the latest model reply are "typed out" on screen.
// Kept separate from the actual network-received content so the reveal
// stays smooth and progressive even if the underlying response arrives in
// one big burst (some proxying layers buffer streamed responses).
const REVEAL_CHARS_PER_TICK = 3;
const REVEAL_TICK_MS = 18;

export function ChatPanel() {
  const { currentPage, chatHistory, setChatHistory } = useStudy();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [revealedLength, setRevealedLength] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastMessage = chatHistory[chatHistory.length - 1];
  const lastIsModel = lastMessage?.role === "model";

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatHistory, revealedLength]);

  // Ticks revealedLength up toward however much of the last model message
  // has actually arrived so far — runs continuously while there's more to
  // reveal, regardless of whether new network chunks are still coming in.
  useEffect(() => {
    if (!lastIsModel) return;
    const target = lastMessage.content.length;
    const id = setInterval(() => {
      setRevealedLength((len) => (len >= target ? len : Math.min(len + REVEAL_CHARS_PER_TICK, target)));
    }, REVEAL_TICK_MS);
    return () => clearInterval(id);
  }, [lastIsModel, lastMessage?.content]);

  async function sendMessage(question: string) {
    if (!question.trim() || isStreaming) return;

    const historyForRequest = chatHistory.map((m) => ({ role: m.role, content: m.content }));
    setChatHistory((prev) => [...prev, { role: "user", content: question }, { role: "model", content: "" }]);
    setRevealedLength(0);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, currentPage, history: historyForRequest }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setChatHistory((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "model") {
            next[next.length - 1] = { ...last, content: last.content + chunk };
          }
          return next;
        });
      }
    } catch {
      setChatHistory((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "model" && !last.content) {
          next[next.length - 1] = { ...last, content: "Sorry, something went wrong. Please try again." };
        }
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="min-h-0 flex-1 px-4 py-4">
        {chatHistory.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <MessageCircleQuestion className="h-5 w-5 text-accent-foreground" />
            </div>
            <p className="max-w-[220px] text-sm text-muted-foreground">
              Ask anything about the page you&apos;re reading, or start a voice call.
            </p>
            {ACTIVE_BOOK.hasQaData && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => sendMessage("Quiz me on the current section using the practice questions.")}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Quiz me
              </Button>
            )}
          </div>
        )}
        <div className="flex flex-col gap-2.5">
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex items-end gap-2",
                msg.role === "user" ? "flex-row-reverse self-end" : "self-start"
              )}
            >
              {msg.role === "model" && (
                <div className="mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent">
                  <Sparkles className="h-3 w-3 text-accent-foreground" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[290px] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                  msg.role === "user"
                    ? "rounded-br-md bg-primary whitespace-pre-wrap text-primary-foreground"
                    : "rounded-bl-md border bg-card text-foreground"
                )}
              >
                {(() => {
                  const isLast = i === chatHistory.length - 1;
                  const shown =
                    msg.role === "model" && isLast ? msg.content.slice(0, revealedLength) : msg.content;
                  if (shown) {
                    return msg.role === "model" ? (
                      <Markdown components={markdownComponents}>{shown}</Markdown>
                    ) : (
                      shown
                    );
                  }
                  return isStreaming && isLast ? <TypingDots /> : "";
                })()}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form
        data-chat-form
        className="flex items-center gap-2 border-t bg-card p-3"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
      >
        {chatHistory.length > 0 && ACTIVE_BOOK.hasQaData && (
          <IconTooltip label="Quiz me on this section">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full"
              onClick={() => sendMessage("Quiz me on the current section using the practice questions.")}
              disabled={isStreaming}
            >
              <Sparkles className="h-5 w-5" />
            </Button>
          </IconTooltip>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this page…"
          className="flex-1 rounded-full border bg-background px-4 py-2 text-sm shadow-sm outline-none transition-shadow focus:ring-3 focus:ring-ring/50 focus:border-ring"
          disabled={isStreaming}
        />
        <IconTooltip label="Send">
          <Button
            type="submit"
            size="icon"
            className="shrink-0 rounded-full"
            disabled={isStreaming || !input.trim()}
            aria-label="Send"
          >
            <Send className="h-5 w-5" />
          </Button>
        </IconTooltip>
      </form>
    </div>
  );
}
