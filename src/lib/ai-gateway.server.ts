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

/** Repli : Gemini via la passerelle Lovable (utilisée seulement si GEMINI_API_KEY absente). */
export function createGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}
