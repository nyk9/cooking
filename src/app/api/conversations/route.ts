import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const conversations = await db.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  return NextResponse.json(conversations);
}
