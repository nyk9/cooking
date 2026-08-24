import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";

test.beforeEach(async () => {
  await resetDb();
});

test("買い物リストを作成・削除できる", async ({ page }) => {
  await page.goto("/shopping");

  await page.getByRole("button", { name: "新しいリスト" }).click();
  await page.getByPlaceholder("今週の買い物").fill("E2Eテストリスト");
  await page.getByRole("button", { name: "作成" }).click();

  await expect(page.getByRole("heading", { name: "E2Eテストリスト" })).toBeVisible();

  // カード内の削除ボタン
  await page.getByRole("button", { name: "削除" }).click();
  await expect(page.getByText("E2Eテストリスト")).toHaveCount(0);
});
