import { config as loadEnv } from "dotenv";
import { execSync } from "node:child_process";
import { resetDb } from "./helpers/db";

// 全テスト実行前に1回だけ走る。テストDBにマイグレーションを適用し、初期状態にリセットする。
export default async function globalSetup() {
  loadEnv({ path: ".env.e2e" });

  // prisma.config.ts は process.env.DATABASE_URL を datasource url として参照する。
  // 上で .env.e2e を読み込み済みなので、テストDBに対して migrate deploy される。
  execSync("bunx prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
  });

  await resetDb();
}
