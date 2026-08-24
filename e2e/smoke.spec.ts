import { test, expect } from "@playwright/test";

// 主要ページが見出し付きでエラーなく描画されることを確認するスモークテスト
const pages: { path: string; heading: string }[] = [
  { path: "/recipes", heading: "レシピ" },
  { path: "/chat/new", heading: "新しい会話" },
  { path: "/ingredients", heading: "食材管理" },
  { path: "/preferences", heading: "好み設定" },
  { path: "/shopping", heading: "買い物リスト" },
  { path: "/meal-plan", heading: "週間献立" },
];

for (const { path, heading } of pages) {
  test(`${path} が描画される`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  });
}
