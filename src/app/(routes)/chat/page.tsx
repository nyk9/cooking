import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ChatListPage() {
  const conversations = await db.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">チャット</h1>
        <Link
          href="/chat/new"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          新しい会話
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <span className="text-5xl">💬</span>
          <p className="text-muted-foreground">まだ会話がありません</p>
          <Link
            href="/chat/new"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            最初の会話を始める
          </Link>
        </div>
      ) : (
        <div className="divide-y rounded-lg border overflow-hidden">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/chat/${conv.id}`}
              className="flex flex-col gap-1 px-4 py-3 hover:bg-accent transition-colors"
            >
              <span className="font-medium text-sm line-clamp-1">
                {conv.title ?? "無題の会話"}
              </span>
              {conv.messages[0] && (
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {conv.messages[0].content}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(conv.updatedAt).toLocaleDateString("ja-JP", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
