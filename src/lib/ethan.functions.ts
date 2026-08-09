/**
 * Accès serveur à la mémoire vivante d'ETHAN.
 * Conversation continue + éléments suivis dans le temps.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { TrackedItem } from "@/brain/vigilance";

const ATTENTIONS = ["urgent", "important", "opportunite", "information"] as const;

export const listMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ethan_messages")
      .select("id, role, content, created_at")
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        messages: z.array(
          z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) }),
        ),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const rows = data.messages.map((m) => ({ ...m, user_id: context.userId }));
    const { error } = await context.supabase.from("ethan_messages").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const clearConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("ethan_messages")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ethan_tracked_items")
      .select("*")
      .order("last_activity_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as TrackedItem[];
  });

const itemInput = z.object({
  kind: z.string().min(1).default("dossier"),
  title: z.string().min(1),
  context: z.string().nullable().default(null),
  missing: z.string().nullable().default(null),
  next_action: z.string().nullable().default(null),
  why: z.string().nullable().default(null),
  attention: z.enum(ATTENTIONS).default("important"),
  value_eur: z.number().nullable().default(null),
  due_at: z.string().nullable().default(null),
});

export const createItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => itemInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("ethan_tracked_items")
      .insert({ ...data, user_id: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as unknown as TrackedItem;
  });

export const progressItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        event: z.enum(["fait", "reporte", "note", "cloture"]),
        content: z.string().min(1),
        next_action: z.string().nullable().default(null),
        why: z.string().nullable().default(null),
        missing: z.string().nullable().default(null),
        snooze_days: z.number().nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const now = new Date();
    const patch: {
      last_activity_at: string;
      status?: string;
      next_action?: string | null;
      why?: string | null;
      missing?: string | null;
      snooze_until?: string | null;
    } = { last_activity_at: now.toISOString() };

    if (data.event === "cloture") patch.status = "clos";
    if (data.event === "fait") {
      patch.next_action = data.next_action;
      patch.why = data.why;
      patch.missing = data.missing;
      patch.snooze_until = null;
    }
    if (data.event === "reporte" && data.snooze_days) {
      patch.snooze_until = new Date(now.getTime() + data.snooze_days * 86_400_000).toISOString();
    }

    const { error: upErr } = await context.supabase
      .from("ethan_tracked_items")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (upErr) throw new Error(upErr.message);

    const { error: evErr } = await context.supabase.from("ethan_item_events").insert({
      user_id: context.userId,
      item_id: data.id,
      kind: data.event,
      content: data.content,
    });
    if (evErr) throw new Error(evErr.message);

    return { ok: true };
  });

export const itemHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("ethan_item_events")
      .select("id, kind, content, created_at")
      .eq("item_id", data.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });