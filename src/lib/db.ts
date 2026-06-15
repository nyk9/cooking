import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  // DB_DRIVER=pg のときは素のPostgres（ローカルDocker等）に標準ドライバで接続する。
  // 未指定時は従来どおり Neon serverless アダプタを使う。
  const adapter =
    process.env.DB_DRIVER === "pg"
      ? new PrismaPg({ connectionString })
      : new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
