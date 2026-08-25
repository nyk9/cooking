import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";

test.beforeEach(async () => {
  await resetDb();
});

// ローカル日付 YYYY-MM-DD
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

test("食材を追加すると期限が近いグループに表示され、削除できる", async ({ page }) => {
  await page.goto("/ingredients");

  await page.getByRole("button", { name: "+ 食材を追加" }).click();
  await page.getByPlaceholder("例: 卵").fill("E2Eテスト食材");
  // 消費期限を今日に設定（3日以内なので「期限が近い」グループに入る）
  await page.getByLabel("消費期限").fill(todayStr());
  await page.getByRole("button", { name: "追加する" }).click();

  await expect(page.getByText("E2Eテスト食材")).toBeVisible();
  await expect(page.getByText("消費期限が近い食材")).toBeVisible();

  // 削除（confirm ダイアログを承認）
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "削除" }).click();

  await expect(page.getByText("E2Eテスト食材")).toHaveCount(0);
});
