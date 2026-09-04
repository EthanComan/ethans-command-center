/**
 * ETHAN — canal distant : abonnement du navigateur et synchronisation
 * du plan de rappels. Fonctionne même lorsque l'application est fermée.
 * Code strictement client.
 */

import {
  getPushPublicKey,
  removePushSubscription,
  savePushSubscription,
  sendTestPush,
  syncScheduledPush,
} from "@/lib/push.functions";
import { buildDaySchedule, readPrefs, shouldDeliverNatively } from "./data";

export type RemoteState = "unsupported" | "off" | "on";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

function keyToBase64(sub: PushSubscription, name: "p256dh" | "auth"): string {
  const key = sub.getKey(name);
  if (!key) return "";
  return btoa(String.fromCharCode(...new Uint8Array(key)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!pushSupported()) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null;
  }
}

export async function remoteState(): Promise<RemoteState> {
  if (!pushSupported()) return "unsupported";
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  return sub ? "on" : "off";
}

/** Autorise et enregistre l'appareil côté serveur. */
export async function enableRemotePush(): Promise<{ ok: boolean; reason?: string }> {
  if (!pushSupported()) return { ok: false, reason: "unsupported" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "denied" };

  const reg = (await registerServiceWorker()) ?? (await navigator.serviceWorker.ready);
  if (!reg) return { ok: false, reason: "no-sw" };
  await navigator.serviceWorker.ready;

  const { publicKey } = await getPushPublicKey();
  if (!publicKey) return { ok: false, reason: "no-key" };

  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    }));

  await savePushSubscription({
    data: {
      endpoint: sub.endpoint,
      p256dh: keyToBase64(sub, "p256dh"),
      auth: keyToBase64(sub, "auth"),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris",
      userAgent: navigator.userAgent.slice(0, 300),
    },
  });

  await syncRemoteSchedule();
  return { ok: true };
}

export async function disableRemotePush(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await removePushSubscription({ data: { endpoint: sub.endpoint } });
  await sub.unsubscribe();
}

/** Envoie au serveur les rappels restants de la journée. */
export async function syncRemoteSchedule(): Promise<number> {
  if (!pushSupported()) return 0;
  const state = await remoteState();
  if (state !== "on") return 0;

  const now = Date.now();
  const prefs = readPrefs();
  const reminders = buildDaySchedule(new Date())
    .filter((n) => n.at > now + 30_000 && shouldDeliverNatively(n, new Date(n.at), prefs))
    .map((n) => ({
      key: n.id,
      title: n.title,
      body: n.body,
      url: n.to,
      priority: n.priority,
      sendAt: new Date(n.at).toISOString(),
    }));

  const res = await syncScheduledPush({ data: { reminders } });
  return res.scheduled;
}

export async function testRemotePush(): Promise<number> {
  const res = await sendTestPush({});
  return res.sent;
}
