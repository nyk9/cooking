import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";

// E2E_MOCK_AI=1 により、AI応答はモックモデル（src/lib/ai-mock-model.ts）が返す。
// チャットの固定応答は親子丼レシピ。送信メッセージには「親子丼」を含めないことで
// アシスタント応答だけを検証できるようにしている。
test.beforeEach(async () => {
  await resetDb();
});

test("メッセージを送るとモックAIの応答が表示され、レシピとして保存できる", async ({ page }) => {
  await page.goto("/chat/new");

  await page.getByPlaceholder(/メッセージを入力/).fill("おすすめのレシピを教えて");
  await page.getByPlaceholder(/メッセージを入力/).press("Enter");

  // モック応答（親子丼）がストリーミング表示される
  await expect(page.getByText("親子丼", { exact: false })).toBeVisible();

  // 「レシピとして保存」→ extract APIもモックモデルが処理し、保存完了表示になる
  await page.getByRole("button", { name: /レシピとして保存/ }).click();
  await expect(page.getByText(/保存しました/)).toBeVisible();
});
