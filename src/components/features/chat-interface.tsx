"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { MODELS, ModelId, DEFAULT_MODEL } from "@/lib/ai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Props {
  conversationId?: string;
  initialMessages?: Message[];
}

let msgCounter = 0;
function newId() {
  return `msg-${++msgCounter}-${Date.now()}`;
}

export function ChatInterface({ conversationId, initialMessages = [] }: Props) {
  const router = useRouter();
  const [modelId, setModelId] = useState<ModelId>(DEFAULT_MODEL);
  const [savedConvId, setSavedConvId] = useState<string | undefined>(conversationId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { id: newId(), role: "user", content: text };
    const assistantId = newId();

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: savedConvId,
          modelId,
          messages: [...messages, { role: "user", content: text }],
        }),
        signal: abortRef.current.signal,
      });

      const convId = res.headers.get("X-Conversation-Id");
      if (convId && !savedConvId) {
        setSavedConvId(convId);
      }

      if (!res.body) return;

      // ストリーミング読み込み
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated } : m
          )
        );
      }

      // ストリーミング完了後にURLを更新（ナビゲーションによるアンマウントを防ぐ）
      if (convId && !conversationId) {
        router.replace(`/chat/${convId}`);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Chat error:", err);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [input, isLoading, messages, modelId, router, savedConvId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* モデル選択 */}
      <div className="flex items-center justify-end pb-3 border-b">
        <select
          value={modelId}
          onChange={(e) => setModelId(e.target.value as ModelId)}
          className="h-8 rounded-md border bg-background px-2 text-xs"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <span className="text-4xl">🍳</span>
            <p className="text-muted-foreground text-sm">
              今日は何を作りますか？<br />食材や気分を教えてください
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm whitespace-pre-wrap"
                  : "bg-muted rounded-bl-sm prose prose-sm dark:prose-invert max-w-none"
              }`}
            >
              {m.role === "assistant" ? (
                <ReactMarkdown>{m.content}</ReactMarkdown>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-muted-foreground">
              考え中...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (Enterで送信、Shift+Enterで改行)"
          rows={1}
          className="flex-1 rounded-2xl border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none min-h-[40px] max-h-32"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors shrink-0 self-end"
        >
          ↑
        </button>
      </form>
    </div>
  );
}
