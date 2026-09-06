/**
 * Accès CRUD générique aux données réelles de l'utilisateur.
 * Toutes les tables sont protégées par RLS : chaque requête agit
 * en tant qu'utilisateur connecté.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const TABLES = [
  "ethan_contacts",
  "ethan_deals",
  "ethan_activities",
  "ethan_appointments",
  "ethan_tasks",
  "ethan_notes",
  "ethan_habits",
  "ethan_habit_logs",
  "ethan_goals",
] as const;

export type TableName = (typeof TABLES)[number];

const table = z.enum(TABLES);
const values = z.record(z.string(), z.unknown());

const filter = z.object({
  column: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
});

export const listRows = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        table,
        orderBy: z.string().default("created_at"),
        ascending: z.boolean().default(false),
        filters: z.array(filter).default([]),
        limit: z.number().default(500),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    let query = (context.supabase as never as SupabaseLike)
      .from(data.table)
      .select("*")
      .eq("user_id", context.userId);
    for (const f of data.filters) query = query.eq(f.column, f.value);
    const { data: rows, error } = await query
      .order(data.orderBy, { ascending: data.ascending })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return (rows ?? []) as Row[];
  });

export const insertRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ table, values }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await (context.supabase as never as SupabaseLike)
      .from(data.table)
      .insert({ ...data.values, user_id: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Row;
  });

export const updateRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ table, id: z.string().uuid(), values }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await (context.supabase as never as SupabaseLike)
      .from(data.table)
      .update(data.values)
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Row;
  });

export const deleteRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ table, id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as never as SupabaseLike)
      .from(data.table)
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type Cell = string | number | boolean | null | string[];
export type Row = { id: string } & Record<string, Cell>;

/** Typage minimal permissif : les tables sont validées par la whitelist ci-dessus. */
interface QueryLike {
  select(cols: string): QueryLike;
  insert(values: Record<string, unknown>): QueryLike;
  update(values: Record<string, unknown>): QueryLike;
  delete(): QueryLike;
  eq(column: string, value: unknown): QueryLike;
  order(column: string, opts: { ascending: boolean }): QueryLike;
  limit(n: number): PromiseLike<{ data: unknown; error: { message: string } | null }>;
  single(): PromiseLike<{ data: unknown; error: { message: string } | null }>;
  then: PromiseLike<{ data: unknown; error: { message: string } | null }>["then"];
}
interface SupabaseLike {
  from(table: string): QueryLike;
}
