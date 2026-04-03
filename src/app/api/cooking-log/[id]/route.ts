import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: Request, { params }: Props) {
  const { id } = await params;
  await db.cookingLog.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
