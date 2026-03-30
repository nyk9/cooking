import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
  steps: z.array(z.string()),
  cookTime: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  source: z.enum(["AI_GENERATED", "USER_CREATED"]).default("USER_CREATED"),
  rating: z.number().int().min(1).max(5).optional(),
  memo: z.string().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const recipes = await db.recipe.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { tags: { has: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(recipes);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const recipe = await db.recipe.create({ data: parsed.data });
  return NextResponse.json(recipe, { status: 201 });
}
