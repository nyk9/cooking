import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  purchasedAt: z.string().datetime().optional().nullable(),
});

export async function PATCH(req: Request, { params }: Props) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { expiresAt, purchasedAt, ...rest } = parsed.data;
  const ingredient = await db.ingredient.update({
    where: { id },
    data: {
      ...rest,
      ...(expiresAt !== undefined
        ? { expiresAt: expiresAt ? new Date(expiresAt) : null }
        : {}),
      ...(purchasedAt !== undefined
        ? { purchasedAt: purchasedAt ? new Date(purchasedAt) : null }
        : {}),
    },
  });
  return NextResponse.json(ingredient);
}

export async function DELETE(_req: Request, { params }: Props) {
  const { id } = await params;
  await db.ingredient.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
