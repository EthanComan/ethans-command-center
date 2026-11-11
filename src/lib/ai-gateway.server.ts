import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Direct Gemini provider — server-side API key only.
 * Utilise l'API native Google (indispensable pour les appels d'outils :
 * l'endpoint compatible OpenAI rejette les functionCall sans thought_signature).
 */
export function createGeminiProvider(apiKey: string) {
  return createGoogleGenerativeAI({ apiKey });
}

