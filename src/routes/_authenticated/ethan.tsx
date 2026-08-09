import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { buildEthanContext } from "@/lib/ethan-context";
import { clearConversation, listItems, listMessages, saveMessages } from "@/lib/ethan.functions";
import { interventions, solicitations } from "@/brain/vigilance";

export const Route = createFileRoute("/_authenticated/ethan")({
  head: () => ({
    meta: [
      { title: "Conversation ETHAN — Ton directeur au quotidien" },
      {
        name: "description",
        content:
          "Parle librement à ETHAN : il connaît ton business, ton planning, tes objectifs et tes dossiers suivis.",
      },
      { property: "og:title", content: "Conversation ETHAN" },
      {
        property: "og:description",
        content: "Un espace de conversation unique connecté à tout ton système.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EthanChat,
});

const SUGGESTIONS = [
  "Qu'est-ce que je dois faire maintenant ?",
  "Fais le point sur mes dossiers chauds.",
  "Où en sont mes commissions ce mois-ci ?",
  "Sur quoi je perds du temps en ce moment ?",
];

function EthanChat() {
  const qc = useQueryClient();
  const fetchMessages = useServerFn(listMessages);
  const fetchItems = useServerFn(listItems);
  const persist = useServerFn(saveMessages);
  const wipe = useServerFn(clearConversation);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  const history = useQuery({ queryKey: ["ethan", "messages"], queryFn: () => fetchMessages() });
  const items = useQuery({ queryKey: ["ethan", "items"], queryFn: () => fetchItems() });

  const initial = useMemo<UIMessage[]>(
    () =>
      (history.data ?? []).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        parts: [{ type: "text", text: m.content }],
      })),
    [history.data],
  );

  const pending = useMemo(
    () => solicitations(interventions(items.data ?? [])).slice(0, 3),
    [items.data],
  );

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: "ethan-conversation",
    transport,
    onError: (e) => toast.error(e.message || "ETHAN n'a pas pu répondre."),
  });

  const save = useMutation({
    mutationFn: (payload: { role: "user" | "assistant"; content: string }[]) =>
      persist({ data: { messages: payload } }),
  });

  // Restaure la conversation continue une fois l'historique chargé.
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current || history.isLoading) return;
    restored.current = true;
    if (initial.length) setMessages(initial);
    textareaRef.current?.focus();
  }, [history.isLoading, initial, setMessages]);

  const busy = status === "submitted" || status === "streaming";

  // Persiste chaque échange complet.
  const persisted = useRef(new Set<string>());
  useEffect(() => {
    if (status !== "ready" || messages.length < 2) return;
    const last = messages[messages.length - 1];
    const prev = messages[messages.length - 2];
    if (last.role !== "assistant" || prev.role !== "user") return;
    if (persisted.current.has(last.id)) return;
    persisted.current.add(last.id);
    save.mutate([
      { role: "user", content: textOf(prev) },
      { role: "assistant", content: textOf(last) },
    ]);
    textareaRef.current?.focus();
  }, [messages, status, save]);

  function send(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    setInput("");
    void sendMessage(
      { text: value },
      { body: { context: buildEthanContext(items.data ?? []) } },
    );
  }

  return (
    <main className="flex h-[calc(100svh-3.5rem)] flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Conversation</h1>
          <p className="text-xs text-muted-foreground">
            ETHAN connaît ton business, ton planning et tes dossiers suivis.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await wipe({ data: undefined });
            setMessages([]);
            persisted.current.clear();
            void qc.invalidateQueries({ queryKey: ["ethan", "messages"] });
          }}
        >
          Nouvelle conversation
        </Button>
      </header>

      {pending.length > 0 && (
        <div className="border-b border-border bg-card/40 px-6 py-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            ETHAN veut te parler
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {pending.map((i) => (
              <button
                key={i.itemId}
                onClick={() => send(`Où en est "${i.title}" et que dois-je faire maintenant ?`)}
                className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent"
              >
                {i.title} · {i.attention}
              </button>
            ))}
          </div>
        </div>
      )}

      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.length === 0 && !history.isLoading && (
            <div className="py-10">
              <p className="text-sm text-muted-foreground">
                Parle-moi normalement. Business, dossier, doute, décision, fatigue — tout part d'ici.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent"
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
                <MessageResponse>{textOf(m)}</MessageResponse>
              </MessageContent>
            </Message>
          ))}

          {status === "submitted" && <Shimmer>ETHAN réfléchit…</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border px-6 py-4">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput
            onSubmit={(_, e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Parle à ETHAN…"
              autoFocus
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={!input.trim() || busy} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </main>
  );
}

function textOf(message: UIMessage): string {
  return message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}