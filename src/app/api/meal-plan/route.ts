import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { getModel, DEFAULT_MODEL, ModelId } from "@/lib/ai";

const mealPlanEntrySchema = z.object({
  date: z.string(), // YYYY-MM-DD
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER"]),
  recipeName: z.string(),
  note: z.string().optional(),
});

const generateSchema = z.object({
  weekStart: z.string(), // YYYY-MM-DD (月曜日)
  modelId: z.string().optional(),
});

export async function GET() {
  const plans = await db.mealPlan.findMany({
    orderBy: { weekStart: "desc" },
    take: 4,
    include: {
      entries: {
        orderBy: [{ date: "asc" }, { mealType: "asc" }],
        include: {
          recipe: { select: { id: true, name: true } },
        },
      },
    },
  });
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { weekStart, modelId } = parsed.data;
  const weekStartDate = new Date(weekStart);

  const [preferences, savedRecipes, ingredients] = await Promise.all([
    db.preference.findMany(),
    db.recipe.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { name: true, cookTime: true, tags: true },
    }),
    db.ingredient.findMany({
      where: { expiresAt: { not: null } },
      orderBy: { expiresAt: "asc" },
      take: 20,
    }),
  ]);

  const prefText = preferences.length
    ? preferences.map((p) => `- [${p.category}] ${p.value}`).join("\n")
    : "（なし）";
  const recipesText = savedRecipes.length
    ? savedRecipes.map((r) => `- ${r.name}（${r.cookTime ?? "?"}分）`).join("\n")
    : "（なし）";
  const ingredientsText = ingredients.length
    ? ingredients
        .map(
          (i) =>
            `- ${i.name}${i.quantity ? ` ${i.quantity}${i.unit ?? ""}` : ""}${i.expiresAt ? `（期限: ${i.expiresAt.toLocaleDateString("ja-JP")}）` : ""}`
        )
        .join("\n")
    : "（なし）";

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const prompt = `初めて一人暮らしをして自炊を始めた人向けに、${weekStart}（月曜日）から始まる1週間の献立を考えてください。

# ユーザーの好み設定
${prefText}

# 冷蔵庫・在庫にある食材（消費期限順）
${ingredientsText}

# 保存済みレシピ（参考）
${recipesText}

# 条件
- 簡単に作れるものを中心に
- 食材を無駄にしないよう、在庫食材を優先して使う
- 同じ料理が連続しないようにする
- 朝食は特に手軽なもの（5〜10分）
- 対象の日付: ${days.join(", ")}

各エントリーのdateフィールドは上記の日付リストからいずれかを使ってください。`;

  const model = getModel((modelId as ModelId) ?? DEFAULT_MODEL);

  const { object } = await generateObject({
    model,
    schema: z.object({
      entries: z.array(mealPlanEntrySchema),
    }),
    prompt,
  });

  // DBに保存
  const mealPlan = await db.mealPlan.create({
    data: {
      weekStart: weekStartDate,
      entries: {
        create: object.entries.map((entry) => ({
          date: new Date(entry.date),
          mealType: entry.mealType,
          recipeName: entry.recipeName,
          note: entry.note,
        })),
      },
    },
    include: {
      entries: {
        orderBy: [{ date: "asc" }, { mealType: "asc" }],
        include: {
          recipe: { select: { id: true, name: true } },
        },
      },
    },
  });

  return NextResponse.json(mealPlan, { status: 201 });
}
