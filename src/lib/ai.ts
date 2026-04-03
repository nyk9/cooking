import { google } from "@ai-sdk/google";

export type ModelId =
  | "gemini-3.1-flash-lite-preview"
  | "gemini-2.5-flash"
  | "gemini-2.0-flash";

export const DEFAULT_MODEL: ModelId = "gemini-3.1-flash-lite-preview";

export const MODELS: { id: ModelId; label: string }[] = [
  { id: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash Lite Preview (無料)" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
];

export function getModel(modelId: ModelId) {
  return google(modelId);
}
