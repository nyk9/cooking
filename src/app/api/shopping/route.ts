import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  recipeIds: z.array(z.string()).optional(),
});

export async function GET() {
  const lists = await db.shoppingList.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      items: { orderBy: { name: "asc" } },
      recipes: { include: { recipe: { select: { id: true, name: true } } } },
    },
  });
  return NextResponse.json(lists);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, recipeIds = [] } = parsed.data;

  // レシピの材料から買い物アイテムを生成
  type Ingredient = { name: string; amount: string };
  const items: { name: string; quantity: string }[] = [];

  if (recipeIds.length > 0) {
    const recipes = await db.recipe.findMany({
      where: { id: { in: recipeIds } },
      select: { ingredients: true },
    });
    for (const recipe of recipes) {
      const ingredients = recipe.ingredients as Ingredient[];
      for (const ing of ingredients) {
        items.push({ name: ing.name, quantity: ing.amount });
      }
    }
  }

  const list = await db.shoppingList.create({
    data: {
      name,
      recipes: {
        create: recipeIds.map((id) => ({ recipeId: id })),
      },
      items: {
        create: items,
      },
    },
    include: {
      items: { orderBy: { name: "asc" } },
      recipes: { include: { recipe: { select: { id: true, name: true } } } },
    },
  });

  return NextResponse.json(list, { status: 201 });
}
