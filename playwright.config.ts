import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// E2E用の環境変数を読み込む（DATABASE_URL / DB_DRIVER / E2E_MOCK_AI など）
loadEnv({ path: ".env.e2e" });

export default defineConfig({
  testDir: "./e2e",
  // 単一のテストDBを共有するため直列実行する
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  // 起動前にマイグレーション適用＋DBリセット
  globalSetup: "./e2e/global-setup.ts",
  use: {
    // 通常の開発サーバ(3000)と衝突しないよう専用ポート3100を使う
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // ローカルDX重視で next dev。CIでは next build && next start に切替も可
    command: "next dev -p 3100",
    url: "http://localhost:3100",
    // 別アプリが3000等で動いていても誤って再利用しないよう、常に専用サーバを起動する
    reuseExistingServer: false,
    timeout: 120_000,
    // テストDB・モックAIを使うよう環境変数を注入（Next の .env より env vars が優先される）
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      DB_DRIVER: "pg",
      E2E_MOCK_AI: "1",
      GOOGLE_GENERATIVE_AI_API_KEY:
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "dummy-key-for-e2e",
    },
  },
});
