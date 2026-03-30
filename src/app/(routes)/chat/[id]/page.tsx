import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ChatInterface } from "@/components/features/chat-interface";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChatDetailPage({ params }: Props) {
  const { id } = await params;
  const conversation = await db.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) notFound();

  const initialMessages = conversation.messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold line-clamp-1">{conversation.title ?? "無題の会話"}</h1>
      <ChatInterface conversationId={id} initialMessages={initialMessages} />
    </div>
  );
}
