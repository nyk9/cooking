import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

export type ModelId = "claude-sonnet-4-6" | "gpt-4o" | "gpt-4o-mini";

export const MODELS: { id: ModelId; label: string }[] = [
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
];

export function getModel(modelId: ModelId) {
  switch (modelId) {
    case "claude-sonnet-4-6":
      return anthropic("claude-sonnet-4-6");
    case "gpt-4o":
      return openai("gpt-4o");
    case "gpt-4o-mini":
      return openai("gpt-4o-mini");
  }
}
