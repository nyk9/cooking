import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  category: z.enum(["LIKE", "DISLIKE", "ALLERGY", "OTHER"]),
  value: z.string().min(1).max(100),
});

export async function GET() {
  const preferences = await db.preference.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(preferences);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const preference = await db.preference.create({ data: parsed.data });
  return NextResponse.json(preference, { status: 201 });
}
