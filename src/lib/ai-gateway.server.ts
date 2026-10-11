import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Direct Gemini provider — server-side API key only.
 * Utilise l'API native Google (indispensable pour les appels d'outils :
 * l'endpoint compatible OpenAI rejette les functionCall sans thought_signature).
 */
export function createGeminiProvider(apiKey: string) {
  return createGoogleGenerativeAI({ apiKey });
}

/** Repli : Gemini via la passerelle Lovable (utilisée seulement si GEMINI_API_KEY absente). */
export function createGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}
