import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { ETHAN_SYSTEM_PROMPT } from "@/lib/ethan-context";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type Body = { messages?: unknown; context?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, context } = (await request.json()) as Body;
        if (!Array.isArray(messages)) {
          return new Response("Messages requis", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Clé IA manquante", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);

        try {
          const result = streamText({
            model: gateway("google/gemini-3.6-flash"),
            system:
              ETHAN_SYSTEM_PROMPT +
              "\n\n# CONTEXTE ACTUEL DU SYSTÈME (déjà connu, ne le redemande pas)\n" +
              (typeof context === "string" ? context : "Aucun contexte fourni."),
            messages: await convertToModelMessages(messages as UIMessage[]),
          });
          return result.toUIMessageStreamResponse({ originalMessages: messages as UIMessage[] });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erreur inconnue";
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});