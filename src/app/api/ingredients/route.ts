import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  category: z.string().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  purchasedAt: z.string().datetime().optional().nullable(),
});

export async function GET() {
  const ingredients = await db.ingredient.findMany({
    orderBy: [{ expiresAt: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(ingredients);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, quantity, unit, category, expiresAt, purchasedAt } = parsed.data;
  const ingredient = await db.ingredient.create({
    data: {
      name,
      quantity,
      unit,
      category,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      purchasedAt: purchasedAt ? new Date(purchasedAt) : null,
    },
  });
  return NextResponse.json(ingredient, { status: 201 });
}
