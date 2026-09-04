/**
 * ETHAN — worker de rappels : envoie les notifications dues.
 * Appelé toutes les minutes par la base (pg_cron). Protégé par un secret.
 */

import { createFileRoute } from "@tanstack/react-router";

async function run(request: Request): Promise<Response> {
  const secret = process.env["ETHAN_CRON_SECRET"];
  const provided = request.headers.get("x-ethan-cron-secret");
  if (!secret || provided !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { deliverPush } = await import("@/lib/web-push.server");

  const nowIso = new Date().toISOString();
  const { data: due, error } = await supabaseAdmin
    .from("ethan_scheduled_push")
    .select("id, user_id, title, body, url, priority, key")
    .is("sent_at", null)
    .lte("send_at", nowIso)
    .gte("send_at", new Date(Date.now() - 6 * 3600_000).toISOString())
    .order("send_at", { ascending: true })
    .limit(100);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!due?.length) return Response.json({ sent: 0, due: 0 });

  const userIds = [...new Set(due.map((d) => d.user_id))];
  const { data: subs } = await supabaseAdmin
    .from("ethan_push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  let sent = 0;
  const deadEndpoints: string[] = [];

  for (const item of due) {
    const targets = (subs ?? []).filter((s) => s.user_id === item.user_id);
    for (const t of targets) {
      const ok = await deliverPush(t, {
        title: item.title,
        body: item.body,
        url: item.url,
        priority: item.priority,
        tag: item.key,
      });
      if (ok) sent += 1;
      else deadEndpoints.push(t.endpoint);
    }
    await supabaseAdmin
      .from("ethan_scheduled_push")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", item.id);
  }

  if (deadEndpoints.length) {
    await supabaseAdmin.from("ethan_push_subscriptions").delete().in("endpoint", deadEndpoints);
  }

  return Response.json({ due: due.length, sent });
}

export const Route = createFileRoute("/api/public/cron/push")({
  server: {
    handlers: {
      POST: async ({ request }) => run(request),
      GET: async ({ request }) => run(request),
    },
  },
});
