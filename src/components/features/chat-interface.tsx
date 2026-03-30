"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MODELS, ModelId } from "@/lib/ai";

interface InitialMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Props {
  conversationId?: string;
  initialMessages?: InitialMessage[];
}

export function ChatInterface({ conversationId, initialMessages = [] }: Props) {
  const router = useRouter();
  const routerRef = useRef(router);
  const [modelId, setModelId] = useState<ModelId>("gemini-2.0-flash");
  const [input, setInput] = useState("");

  const savedConvIdRef = useRef<string | undefined>(conversationId);
  const modelIdRef = useRef<ModelId>("gemini-2.0-flash");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { modelIdRef.current = modelId; }, [modelId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          conversationId: savedConvIdRef.current,
          modelId: modelIdRef.current,
        }),
        fetch: async (input, init) => {
          const response = await globalThis.fetch(input as RequestInfo, init);
          const newConvId = response.headers.get("X-Conversation-Id");
          if (newConvId && !savedConvIdRef.current) {
            savedConvIdRef.current = newConvId;
            routerRef.current.replace(`/chat/${newConvId}`);
          }
          return response;
        },
      }),
    []
  );

  // Convert initial messages to UIMessage format
  const uiInitialMessages = useMemo(
    () =>
      initialMessages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        parts: [{ type: "text" as const, text: m.content }],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: uiInitialMessages,
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
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
        {messages.map((m) => {
          const text = m.parts
            .filter((p): p is { type: "text"; text: string } => p.type === "text")
            .map((p) => p.text)
            .join("");
          return (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                }`}
              >
                {text}
              </div>
            </div>
          );
        })}
        {isLoading && (
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
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 h-10 rounded-full border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          ↑
        </button>
      </form>
    </div>
  );
}
