import { createGeminiProvider } from "@/lib/ai-gateway.server";
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

        const key = process.env["GEMINI_API_KEY"];

        if (!key) {
          return new Response(
            "Clé Gemini manquante : renseigne GEMINI_API_KEY côté serveur.",
            { status: 500 },
          );
        }

        const gateway = createGeminiProvider(key);

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
            model: gateway(process.env["GEMINI_MODEL"] || "gemini-2.5-flash"),
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
                return "Clé Gemini invalide ou refusée (GEMINI_API_KEY).";
              if (/429|quota/i.test(msg)) return "Quota Gemini atteint, réessaie plus tard.";
              if (/404|not found/i.test(msg)) return "Modèle Gemini introuvable (GEMINI_MODEL).";
              return "Gemini n'a pas pu répondre.";
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
