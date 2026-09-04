/**
 * ETHAN — notifications distantes (Web Push).
 *
 * Le plan de la journée est calculé côté client (il dépend des habitudes
 * locales), puis déposé ici. Le worker de rappel côté serveur envoie chaque
 * rappel à l'heure dite, même si ETHAN est fermé.
 */

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getPushPublicKey = createServerFn({ method: "GET" }).handler(async () => ({
  publicKey: process.env["VAPID_PUBLIC_KEY"] ?? "",
}));

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2000),
  p256dh: z.string().min(10).max(500),
  auth: z.string().min(4).max(500),
  timezone: z.string().max(64).default("Europe/Paris"),
  userAgent: z.string().max(300).optional(),
});

export const savePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => subscriptionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("ethan_push_subscriptions").upsert(
      {
        user_id: context.userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        timezone: data.timezone,
        user_agent: data.userAgent ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ endpoint: z.string().max(2000) }).parse(input))
  .handler(async ({ data, context }) => {
    await context.supabase.from("ethan_push_subscriptions").delete().eq("endpoint", data.endpoint);
    return { ok: true };
  });

const reminderSchema = z.object({
  reminders: z
    .array(
      z.object({
        key: z.string().min(1).max(120),
        title: z.string().min(1).max(160),
        body: z.string().max(400).default(""),
        url: z.string().max(200).default("/"),
        priority: z.enum(["silencieuse", "normale", "haute", "critique"]).default("normale"),
        sendAt: z.string().datetime(),
      })
    )
    .max(80),
});

/** Remplace le plan de rappels à venir par celui que le client vient de calculer. */
export const syncScheduledPush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => reminderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const nowIso = new Date().toISOString();

    // On ne touche jamais aux rappels déjà envoyés.
    await context.supabase
      .from("ethan_scheduled_push")
      .delete()
      .is("sent_at", null)
      .gte("send_at", nowIso);

    const rows = data.reminders
      .filter((r) => r.sendAt > nowIso)
      .map((r) => ({
        user_id: context.userId,
        key: r.key,
        title: r.title,
        body: r.body,
        url: r.url,
        priority: r.priority,
        send_at: r.sendAt,
      }));

    if (rows.length) {
      const { error } = await context.supabase
        .from("ethan_scheduled_push")
        .upsert(rows, { onConflict: "user_id,key" });
      if (error) throw new Error(error.message);
    }

    return { scheduled: rows.length };
  });

/** Envoi immédiat d'un rappel de test vers tous les appareils de l'utilisateur. */
export const sendTestPush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: subs } = await context.supabase
      .from("ethan_push_subscriptions")
      .select("endpoint, p256dh, auth");
    if (!subs?.length) return { sent: 0 };

    const { deliverPush } = await import("@/lib/web-push.server");
    let sent = 0;
    for (const s of subs) {
      const ok = await deliverPush(s, {
        title: "ETHAN — canal distant actif",
        body: "Tu recevras désormais tes rappels même application fermée.",
        url: "/notifications",
        priority: "haute",
      });
      if (ok) sent += 1;
    }
    return { sent };
  });
