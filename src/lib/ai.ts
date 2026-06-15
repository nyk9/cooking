import { google } from "@ai-sdk/google";

export const MODEL_IDS = [
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
] as const;

export type ModelId = (typeof MODEL_IDS)[number];

export const DEFAULT_MODEL: ModelId = "gemini-3.1-flash-lite-preview";

export const MODELS: { id: ModelId; label: string }[] = [
  { id: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite Preview (無料)" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
];

export async function getModel(modelId: ModelId) {
  // E2Eテスト時は実APIを呼ばずモックモデルを返す。
  // フラグ時のみ動的importし、ai/test がクライアント/通常ビルドに混入しないようにする。
  if (process.env.E2E_MOCK_AI === "1") {
    const { createMockModel } = await import("./ai-mock-model");
    return createMockModel();
  }
  return google(modelId);
}
