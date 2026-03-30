import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  ingredients: z.array(z.object({ name: z.string(), amount: z.string() })).optional(),
  steps: z.array(z.string()).optional(),
  cookTime: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string()).optional(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  memo: z.string().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const recipe = await db.recipe.findUnique({ where: { id } });
  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(recipe);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const recipe = await db.recipe.update({ where: { id }, data: parsed.data });
  return NextResponse.json(recipe);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.recipe.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
