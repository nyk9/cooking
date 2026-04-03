import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  recipeId: z.string(),
  cookedAt: z.string().datetime().optional(),
  note: z.string().optional(),
});

export async function GET() {
  const logs = await db.cookingLog.findMany({
    orderBy: { cookedAt: "desc" },
    include: {
      recipe: { select: { id: true, name: true, cookTime: true, tags: true } },
    },
  });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { recipeId, cookedAt, note } = parsed.data;
  const log = await db.cookingLog.create({
    data: {
      recipeId,
      cookedAt: cookedAt ? new Date(cookedAt) : undefined,
      note,
    },
    include: {
      recipe: { select: { id: true, name: true, cookTime: true, tags: true } },
    },
  });
  return NextResponse.json(log, { status: 201 });
}
