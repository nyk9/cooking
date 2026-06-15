import { test, expect } from "@playwright/test";
import { resetDb } from "./helpers/db";

test.beforeEach(async () => {
  await resetDb();
});

test("レシピが無いとき空状態が表示される", async ({ page }) => {
  await page.goto("/recipes");
  await expect(page.getByText("まだレシピがありません")).toBeVisible();
});

test("手動でレシピを登録し詳細ページに遷移できる", async ({ page }) => {
  await page.goto("/recipes/new");

  await page.getByPlaceholder("例: チキンカレー").fill("E2Eテストレシピ");
  await page.getByPlaceholder("食材名").first().fill("鶏もも肉");
  await page.getByPlaceholder("量").first().fill("100g");
  await page.getByPlaceholder("手順 1").fill("鍋で煮る");

  await page.getByRole("button", { name: "登録する" }).click();

  // 詳細ページ /recipes/<id> に遷移し、レシピ名が表示される
  await expect(page).toHaveURL(/\/recipes\/[a-z0-9]+$/i);
  await expect(page.getByText("E2Eテストレシピ")).toBeVisible();

  // 一覧にも表示される
  await page.goto("/recipes");
  await expect(page.getByText("E2Eテストレシピ")).toBeVisible();
});
