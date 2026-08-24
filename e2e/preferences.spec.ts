import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";

test.beforeEach(async () => {
  await resetDb();
});

test("好みを追加・削除できる", async ({ page }) => {
  await page.goto("/preferences");

  await page.getByPlaceholder("例: 鶏肉、辛いもの、卵...").fill("E2Eテスト好み");
  await page.getByRole("button", { name: "追加" }).click();

  await expect(page.getByText("E2Eテスト好み")).toBeVisible();

  // チップ内の × ボタン（aria-label="削除"）で削除
  await page.getByRole("button", { name: "削除" }).click();
  await expect(page.getByText("E2Eテスト好み")).toHaveCount(0);
});
