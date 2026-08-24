import { test, expect, describe, beforeEach, mock } from "bun:test";

// generateObject が返す抽出結果の形（route が参照するフィールドのみ）
type Extraction = {
  isRecipe: boolean;
  name: string;
  description: string | null;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  cookTime: number | null;
  tags: string[];
};

// 各テストで差し替えられるよう、可変の実装にデリゲートする
let generateObjectImpl: () => Promise<{ object: Extraction }>;

const createMock = mock((args: { data: Record<string, unknown> }) =>
  Promise.resolve({ id: "recipe-1", ...args.data })
);

// route の import より前にモジュールをモックする
mock.module("ai", () => ({
  generateObject: () => generateObjectImpl(),
}));
mock.module("@/lib/ai", () => ({
  getModel: () => ({}),
  DEFAULT_MODEL: "gemini-3.1-flash-lite-preview",
  MODEL_IDS: [
    "gemini-3.1-flash-lite-preview",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
  ],
}));
mock.module("@/lib/db", () => ({
  db: { recipe: { create: createMock } },
}));

const { POST } = await import("@/app/api/recipes/extract/route");

const postJson = (body: string) =>
  POST(
    new Request("http://localhost/api/recipes/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    })
  );

const validExtraction = (overrides: Partial<Extraction> = {}): Extraction => ({
  isRecipe: true,
  name: "親子丼",
  description: "簡単な親子丼",
  ingredients: [{ name: "鶏もも肉", amount: "150g" }],
  steps: ["切る", "煮る"],
  cookTime: 15,
  tags: ["和食", "丼"],
  ...overrides,
});

describe("POST /api/recipes/extract", () => {
  beforeEach(() => {
    createMock.mockClear();
    // デフォルトは正常な抽出結果
    generateObjectImpl = () => Promise.resolve({ object: validExtraction() });
  });

  test("不正なJSON本文は 400", async () => {
    const res = await postJson("not json");
    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  test("スキーマ不一致（content 空）は 400", async () => {
    const res = await postJson(JSON.stringify({ content: "" }));
    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  test("generateObject が失敗したら 502（error は文字列）", async () => {
    generateObjectImpl = () => Promise.reject(new Error("AI down"));
    const res = await postJson(JSON.stringify({ content: "レシピ教えて" }));
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(typeof data.error).toBe("string");
    expect(createMock).not.toHaveBeenCalled();
  });

  test("レシピでない（isRecipe=false）は 422", async () => {
    generateObjectImpl = () =>
      Promise.resolve({ object: validExtraction({ isRecipe: false }) });
    const res = await postJson(JSON.stringify({ content: "こんにちは" }));
    expect(res.status).toBe(422);
    expect(typeof (await res.json()).error).toBe("string");
    expect(createMock).not.toHaveBeenCalled();
  });

  test("材料が空なら 422", async () => {
    generateObjectImpl = () =>
      Promise.resolve({ object: validExtraction({ ingredients: [] }) });
    const res = await postJson(JSON.stringify({ content: "材料なし" }));
    expect(res.status).toBe(422);
    expect(createMock).not.toHaveBeenCalled();
  });

  test("正常な抽出は 201 で保存される", async () => {
    const res = await postJson(JSON.stringify({ content: "親子丼の作り方" }));
    expect(res.status).toBe(201);
    expect(createMock).toHaveBeenCalledTimes(1);
    const created = await res.json();
    expect(created.name).toBe("親子丼");
    // AI 由来として保存される
    const callArg = createMock.mock.calls[0][0];
    expect(callArg.data.source).toBe("AI_GENERATED");
  });
});
