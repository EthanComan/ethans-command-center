/**
 * Fondations d'identité : Historique · Identité actuelle · Direction,
 * et auto-évaluation de l'archétype de leadership.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type IdentityKind = "historique" | "identite" | "direction";

export interface IdentityEntry {
  id: string;
  kind: IdentityKind;
  title: string;
  body: string | null;
  lesson: string | null;
  occurred_on: string | null;
  created_at: string;
}

export interface ArchetypeRow {
  trait: string;
  score: number;
  note: string | null;
}

const KINDS = ["historique", "identite", "direction"] as const;

export const listIdentityEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ethan_identity_entries")
      .select("id, kind, title, body, lesson, occurred_on, created_at")
      .order("occurred_on", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as IdentityEntry[];
  });

export const createIdentityEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        kind: z.enum(KINDS),
        title: z.string().min(1),
        body: z.string().nullable().default(null),
        lesson: z.string().nullable().default(null),
        occurred_on: z.string().nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("ethan_identity_entries")
      .insert({ ...data, user_id: context.userId })
      .select("id, kind, title, body, lesson, occurred_on, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row as unknown as IdentityEntry;
  });

export const deleteIdentityEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("ethan_identity_entries")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listArchetypeScores = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("ethan_archetype_scores")
      .select("trait, score, note");
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as ArchetypeRow[];
  });

export const setArchetypeScore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        trait: z.string().min(1),
        score: z.number().min(0).max(100),
        note: z.string().nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("ethan_archetype_scores")
      .upsert({ ...data, user_id: context.userId }, { onConflict: "user_id,trait" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
