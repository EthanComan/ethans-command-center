import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { clearConversation, listMessages, saveMessages } from "@/lib/ethan.functions";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";

import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ia")({
  ssr: false,

  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
  },

  head: () => ({
    meta: [
      {
        title: "ETHAN Builder — Construire l'application",
      },
      {
        name: "description",
        content:
          "Espace de construction et d'évolution du Command Center ETHAN.",
      },
    ],
  }),

  component: BuilderChat,
});

const STORAGE_KEY = "ethan-builder-messages";

const SUGGESTIONS = [
  "Audite le Command Center et donne-moi les 5 corrections prioritaires.",
  "Construis un vrai module Prospection connecté à Supabase.",
  "Améliore le Dashboard pour qu'il soit piloté par les priorités réelles.",
  "Donne-moi l'architecture pour rendre le Builder capable de modifier GitHub.",
];

function BuilderChat() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const {
    messages,
    sendMessage,
    status,
    setMessages,
  } = useChat({
    id: "ethan-builder",
    transport,

    onError: (e) =>
      toast.error(
        e.message || "Le Builder n'a pas pu répondre.",
      ),
  });

  const busy =
    status === "submitted" ||
    status === "streaming";

  const fetchMessages = useServerFn(listMessages);
  const persist = useServerFn(saveMessages);
  const wipe = useServerFn(clearConversation);
  const history = useQuery({
    queryKey: ["ethan", "messages", "builder"],
    queryFn: () => fetchMessages({ data: { channel: "builder" } }),
  });

  // Restaure l'historique Builder depuis la base.
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current || history.isLoading) return;
    restored.current = true;
    localStorage.removeItem(STORAGE_KEY);
    const rows = history.data ?? [];
    if (rows.length) {
      setMessages(
        rows.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          parts: [{ type: "text" as const, text: m.content }],
        })),
      );
    }
    textareaRef.current?.focus();
  }, [history.isLoading, history.data, setMessages]);

  // Enregistre chaque échange complet.
  const persisted = useRef(new Set<string>());
  useEffect(() => {
    if (status !== "ready" || messages.length < 2) return;
    const last = messages[messages.length - 1];
    const prev = messages[messages.length - 2];
    if (last.role !== "assistant" || prev.role !== "user") return;
    if (persisted.current.has(last.id)) return;
    const a = textOf(last);
    const u = textOf(prev);
    if (!a || !u) return;
    persisted.current.add(last.id);
    void persist({
      data: { channel: "builder", messages: [{ role: "user", content: u }, { role: "assistant", content: a }] },
    }).catch(() => toast.error("Échange non enregistré."));
  }, [messages, status, persist]);

  function send(text: string) {
    const value = text.trim();

    if (!value || busy) return;

    setInput("");

    void sendMessage(
      { text: value },
      {
        body: {
          mode: "builder",
        },
      },
    );
  }

  return (
    <main className="flex h-[calc(100svh-3.5rem)] flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">
            ETHAN Builder
          </h1>

          <p className="text-xs text-muted-foreground">
            Construis et fais évoluer le Command Center avec ton ingénieur IA.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void wipe({ data: { channel: "builder" } });
            setMessages([]);
            persisted.current.clear();
          }}
        >
          Nouvelle session
        </Button>
      </header>

      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-4xl">
          {messages.length === 0 && (
            <div className="py-10">
              <p className="text-sm text-muted-foreground">
                Décris ce que tu veux construire. Le Builder connaît
                l'architecture actuelle, les routes, Supabase, Gemini et
                les principaux modules ETHAN.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-lg border border-border p-3 text-left text-xs hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <Message from={m.role} key={m.id}>
              <MessageContent>
                <MessageResponse>
                  {textOf(m)}
                </MessageResponse>
              </MessageContent>
            </Message>
          ))}

          {status === "submitted" && (
            <Shimmer>
              Le Builder travaille…
            </Shimmer>
          )}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border px-6 py-4">
        <div className="mx-auto w-full max-w-4xl">
          <PromptInput
            onSubmit={(_, e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              placeholder="Qu'est-ce qu'on construit ?"
              autoFocus
            />

            <PromptInputFooter className="justify-end">
              <PromptInputSubmit
                status={status}
                disabled={!input.trim() || busy}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </main>
  );
}

function textOf(message: UIMessage): string {
  return message.parts
    .map((p) =>
      p.type === "text"
        ? p.text
        : "",
    )
    .join("")
    .trim();
}
