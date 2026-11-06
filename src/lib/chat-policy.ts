export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";

export function chatErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/API key|401|403|permission/i.test(message)) return "Clé IA invalide ou refusée côté serveur.";
  if (/429|quota/i.test(message)) return "Quota Google atteint. Réessaie plus tard.";
  if (/503|UNAVAILABLE|overload/i.test(message)) return "Google est temporairement indisponible. Réessaie dans quelques instants.";
  if (/404|not found/i.test(message)) return "Le modèle Google configuré est introuvable.";
  return "L'IA n'a pas pu répondre. Réessaie dans quelques instants.";
}