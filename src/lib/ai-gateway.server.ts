import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Direct Gemini provider — server-side API key only.
 * ETHAN's prompt, context and application logic remain unchanged.
 */
export function createGeminiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}
