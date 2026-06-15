import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";

// E2E_MOCK_AI=1 により generateObject はモックモデルが献立JSONを返す。
test.beforeEach(async () => {
  await resetDb();
});

test("AIで献立を生成するとエントリが表示される", async ({ page }) => {
  await page.goto("/meal-plan");

  await page.getByRole("button", { name: /献立を生成/ }).click();

  // モック献立のエントリ（週開始日の朝食）が表示される
  await expect(page.getByText("E2Eテスト朝食")).toBeVisible();
});
