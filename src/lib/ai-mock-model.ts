// E2E用のモック言語モデル。getModel() から E2E_MOCK_AI=1 のときだけ動的importされる。
// 実際の Gemini を呼ばず、決定的な応答を返すことでE2Eを高速・安定・無課金にする。
import { MockLanguageModelV3, simulateReadableStream } from "ai/test";

// V3 はモック側にデフォルトが無いので、usage / finishReason を最小構成で用意する。
const MOCK_USAGE = {
  inputTokens: { total: 0, noCache: 0, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 0, text: 0, reasoning: 0 },
};
const MOCK_FINISH = { unified: "stop", raw: undefined } as const;

// チャット（streamText）用の固定応答
const CHAT_REPLY = `親子丼はいかがですか？簡単に作れます。

## 材料（1人分）
- 鶏もも肉 100g
- 卵 2個
- 玉ねぎ 1/4個

## 作り方
1. 鶏肉と玉ねぎを煮る
2. 溶き卵を回し入れる
3. ご飯にのせて完成`;

// レシピ抽出（generateObject）用の固定オブジェクト（extractionSchema 準拠）
const EXTRACTION = {
  isRecipe: true,
  name: "親子丼",
  description: "鶏肉と卵の定番丼",
  ingredients: [
    { name: "鶏もも肉", amount: "100g" },
    { name: "卵", amount: "2個" },
    { name: "玉ねぎ", amount: "1/4個" },
  ],
  steps: ["鶏肉と玉ねぎを煮る", "溶き卵を回し入れる", "ご飯にのせて完成"],
  cookTime: 15,
  tags: ["和食", "丼", "簡単"],
};

// 献立生成（generateObject）用のオブジェクト（mealPlanEntrySchema 準拠）。
// プロンプトに含まれる最初の日付を使い、実在する日付で返す。
function mealPlanObject(promptText: string) {
  const date = promptText.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "2026-06-15";
  return {
    entries: [
      { date, mealType: "BREAKFAST", recipeName: "E2Eテスト朝食", note: "モック献立" },
      { date, mealType: "LUNCH", recipeName: "E2Eテスト昼食" },
      { date, mealType: "DINNER", recipeName: "E2Eテスト夕食" },
    ],
  };
}

export function createMockModel() {
  return new MockLanguageModelV3({
    // streamText 用
    doStream: async () => ({
      stream: simulateReadableStream({
        initialDelayInMs: 0,
        chunkDelayInMs: 0,
        chunks: [
          { type: "stream-start", warnings: [] },
          { type: "text-start", id: "0" },
          { type: "text-delta", id: "0", delta: CHAT_REPLY },
          { type: "text-end", id: "0" },
          { type: "finish", finishReason: MOCK_FINISH, usage: MOCK_USAGE },
        ],
      }),
    }),
    // generateObject 用。プロンプト内容で抽出/献立を出し分ける。
    doGenerate: async (options) => {
      const promptText = JSON.stringify(options.prompt);
      const obj = promptText.includes("献立") ? mealPlanObject(promptText) : EXTRACTION;
      return {
        content: [{ type: "text", text: JSON.stringify(obj) }],
        finishReason: MOCK_FINISH,
        usage: MOCK_USAGE,
        warnings: [],
      };
    },
  });
}
