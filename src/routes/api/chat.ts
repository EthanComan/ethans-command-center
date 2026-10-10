import { createGatewayProvider, createGeminiProvider } from "@/lib/ai-gateway.server";
import { ETHAN_SYSTEM_PROMPT } from "@/lib/ethan-context";
import {
  ETHAN_BUILDER_PROJECT_MAP,
  ETHAN_BUILDER_SYSTEM_PROMPT,
} from "@/lib/builder-context";
import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

type Body = {
  messages?: unknown;
  context?: unknown;
  mode?: "builder" | "ethan";
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, context, mode } =
          (await request.json()) as Body;

        if (!Array.isArray(messages)) {
          return new Response("Messages requis", { status: 400 });
        }

        // Moteur par défaut : IA Lovable (clé auto-provisionnée, zéro configuration).
        // Gemini direct uniquement si GEMINI_API_KEY est renseignée.
        const geminiKey = process.env["GEMINI_API_KEY"];
        const lovableKey = process.env["LOVABLE_API_KEY"];
        if (!geminiKey && !lovableKey) {
          return new Response(
            "Aucun moteur IA configuré côté serveur.",
            { status: 500 },
          );
        }
        const model = geminiKey
          ? createGeminiProvider(geminiKey)(process.env["GEMINI_MODEL"] || "gemini-2.5-flash")
          : createGatewayProvider(lovableKey!)("google/gemini-2.5-flash");

        try {
          const isBuilder = mode === "builder";

          const system = isBuilder
            ? ETHAN_BUILDER_SYSTEM_PROMPT +
              ETHAN_BUILDER_PROJECT_MAP
            : ETHAN_SYSTEM_PROMPT +
              "\n\n# CONTEXTE ACTUEL DU SYSTÈME (déjà connu, ne le redemande pas)\n" +
              (typeof context === "string"
                ? context
                : "Aucun contexte fourni.");

          const result = streamText({
            model,
            system,
            messages:
              await convertToModelMessages(
                messages as UIMessage[],
              ),
          });

          return result.toUIMessageStreamResponse({
            originalMessages:
              messages as UIMessage[],
            onError: (err) => {
              console.error("[chat]", err);
              const msg = err instanceof Error ? err.message : String(err);
              if (/API key|401|403|permission/i.test(msg))
                return "Clé IA invalide ou refusée côté serveur.";
              if (/429|quota/i.test(msg)) return "Quota IA atteint, réessaie plus tard.";
              if (/404|not found/i.test(msg)) return "Modèle IA introuvable.";
              return "L'IA n'a pas pu répondre.";
            },
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Erreur inconnue";

          return new Response(
            message,
            { status: 500 },
          );
        }
      },
    },
  },
});
