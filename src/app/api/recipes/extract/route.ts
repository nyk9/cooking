import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { getModel, DEFAULT_MODEL, MODEL_IDS } from "@/lib/ai";

const bodySchema = z.object({
  content: z.string().min(1),
  modelId: z.enum(MODEL_IDS).optional(),
});

// Gemini構造化出力ではoptionalよりnullableのほうが安定する
const extractionSchema = z.object({
  isRecipe: z
    .boolean()
    .describe("テキストに具体的なレシピ（材料と手順）が含まれているか"),
  name: z.string().describe("料理名"),
  description: z.string().nullable().describe("料理の簡単な説明（1〜2文）"),
  ingredients: z
    .array(z.object({ name: z.string(), amount: z.string() }))
    .describe("材料リスト。分量が不明な場合はamountを「適量」とする"),
  steps: z.array(z.string()).describe("調理手順。1要素につき1ステップ"),
  cookTime: z.number().int().nullable().describe("調理時間（分）。不明ならnull"),
  tags: z.array(z.string()).describe("料理のタグ（和食、時短、麺類など）最大5個"),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストボディをJSONとして解釈できませんでした" },
      { status: 400 }
    );
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { content, modelId } = parsed.data;
  const model = getModel(modelId ?? DEFAULT_MODEL);

  let object: z.infer<typeof extractionSchema>;
  try {
    ({ object } = await generateObject({
      model,
      schema: extractionSchema,
      prompt: `以下はAI料理アシスタントの応答です。この中からレシピ情報を抽出してください。
複数のレシピが含まれる場合は、最も詳しく説明されているメインのレシピを1つ抽出してください。
材料と手順が揃った具体的なレシピが含まれない場合は isRecipe を false にしてください。

---
${content}`,
    }));
  } catch (err) {
    console.error("recipe extraction failed:", err);
    return NextResponse.json(
      { error: "レシピの抽出に失敗しました。時間をおいて再試行してください" },
      { status: 502 }
    );
  }

  if (!object.isRecipe || object.ingredients.length === 0 || object.steps.length === 0) {
    return NextResponse.json(
      { error: "このメッセージからレシピを抽出できませんでした" },
      { status: 422 }
    );
  }

  const recipe = await db.recipe.create({
    data: {
      name: object.name,
      description: object.description ?? undefined,
      ingredients: object.ingredients,
      steps: object.steps,
      cookTime: object.cookTime && object.cookTime > 0 ? object.cookTime : undefined,
      tags: object.tags.slice(0, 5),
      source: "AI_GENERATED",
    },
  });

  return NextResponse.json(recipe, { status: 201 });
}
