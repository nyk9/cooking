import { google } from "@ai-sdk/google";

export type ModelId = "gemini-2.0-flash" | "gemini-2.5-flash";

export const MODELS: { id: ModelId; label: string }[] = [
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
];

export function getModel(modelId: ModelId) {
  switch (modelId) {
    case "gemini-2.0-flash":
      return google("gemini-2.0-flash");
    case "gemini-2.5-flash":
      return google("gemini-2.5-flash");
  }
}
