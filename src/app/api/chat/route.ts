import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getModel, ModelId } from "@/lib/ai";

const uiMessagePartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
}).passthrough();

const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(uiMessagePartSchema).optional().default([]),
  metadata: z.unknown().optional(),
}).passthrough();

const bodySchema = z.object({
  conversationId: z.string().optional(),
  id: z.string().optional(),
  messages: z.array(uiMessageSchema),
  modelId: z.string().optional(),
  trigger: z.string().optional(),
  messageId: z.string().optional(),
});

function getUIMessageText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
  return (msg.parts ?? [])
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("");
}

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
    const firstUserMessage = [...messages].find((m) => m.role === "user");
    const title = firstUserMessage
      ? getUIMessageText(firstUserMessage).slice(0, 50)
      : "新しい会話";
    const conv = await db.conversation.create({ data: { title } });
    convId = conv.id;
  }

  // ユーザーメッセージをDBに保存（最後のユーザーメッセージのみ）
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (lastUserMessage) {
    const content = getUIMessageText(lastUserMessage);
    if (content) {
      const existing = await db.message.findFirst({
        where: { conversationId: convId, content, role: "user" },
        orderBy: { createdAt: "desc" },
      });
      if (!existing) {
        await db.message.create({
          data: { conversationId: convId, role: "user", content },
        });
      }
    }
  }

  // UIMessage[] -> ModelMessage[] に変換
  const modelMessages = await convertToModelMessages(messages as UIMessage[]);

  const result = streamText({
    model,
    system: systemPrompt,
    messages: modelMessages,
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

  // conversationIdをヘッダーで返す
  return result.toUIMessageStreamResponse({
    headers: { "X-Conversation-Id": convId! },
  });
}
