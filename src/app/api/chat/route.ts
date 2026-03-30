import { streamText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getModel, ModelId } from "@/lib/ai";

const bodySchema = z.object({
  conversationId: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  modelId: z.string().optional(),
});

async function buildSystemPrompt(): Promise<string> {
  const [preferences, recipes] = await Promise.all([
    db.preference.findMany({ orderBy: { createdAt: "asc" } }),
    db.recipe.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { name: true, rating: true, tags: true },
    }),
  ]);

  const prefLines = preferences.length
    ? preferences.map((p) => `- [${p.category}] ${p.value}`).join("\n")
    : "（なし）";

  const recipeLines = recipes.length
    ? recipes
        .map((r) => `- ${r.name}${r.rating ? ` (評価: ${r.rating}/5)` : ""}`)
        .join("\n")
    : "（なし）";

  return `あなたは自炊をサポートするAI料理アシスタントです。日本語で親切に、実用的なアドバイスをしてください。

# ユーザーの好み設定
${prefLines}

# 最近保存したレシピ（直近10件）
${recipeLines}

上記の情報を踏まえてレシピの提案・相談に答えてください。レシピを提案するときは材料・手順・調理時間を具体的に教えてください。`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { conversationId, messages, modelId } = parsed.data;
  const model = getModel((modelId as ModelId) ?? "gemini-2.0-flash");
  const systemPrompt = await buildSystemPrompt();

  // 会話を保存/更新
  let convId = conversationId;
  if (!convId) {
    const firstUserMessage = messages.find((m) => m.role === "user")?.content ?? "新しい会話";
    const title = firstUserMessage.slice(0, 50);
    const conv = await db.conversation.create({ data: { title } });
    convId = conv.id;
  }

  // ユーザーメッセージをDBに保存（最後のユーザーメッセージのみ）
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (lastUserMessage) {
    const existing = await db.message.findFirst({
      where: { conversationId: convId, content: lastUserMessage.content, role: "user" },
      orderBy: { createdAt: "desc" },
    });
    if (!existing) {
      await db.message.create({
        data: { conversationId: convId, role: "user", content: lastUserMessage.content },
      });
    }
  }

  const result = streamText({
    model,
    system: systemPrompt,
    messages,
    onFinish: async ({ text }) => {
      // AIの返答をDBに保存
      await db.message.create({
        data: { conversationId: convId!, role: "assistant", content: text },
      });
      await db.conversation.update({
        where: { id: convId! },
        data: { updatedAt: new Date() },
      });
    },
  });

  const response = result.toDataStreamResponse();
  // conversationIdをヘッダーで返す
  const headers = new Headers(response.headers);
  headers.set("X-Conversation-Id", convId);
  return new Response(response.body, { headers, status: response.status });
}
