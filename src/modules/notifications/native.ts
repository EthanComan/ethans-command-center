/**
 * ETHAN — Pont vers les notifications système (OS, téléphone, montre).
 *
 * Utilise la Notification API du navigateur. Une fois ETHAN installé
 * (écran d'accueil iOS / Android, ou app de bureau), les notifications
 * apparaissent dans le centre de notifications du système et sont
 * relayées vers la montre connectée par l'OS lui-même.
 *
 * Ce moteur tourne côté client uniquement.
 */

import {
  dueNotifications,
  recordDelivered,
  shouldDeliverNatively,
} from "./data";
import type { EthanNotification } from "./types";

export type PermissionState = "unsupported" | "default" | "granted" | "denied";

export function nativeSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function permissionState(): PermissionState {
  if (!nativeSupported()) return "unsupported";
  return Notification.permission as PermissionState;
}

export async function requestNativePermission(): Promise<PermissionState> {
  if (!nativeSupported()) return "unsupported";
  const result = await Notification.requestPermission();
  return result as PermissionState;
}

/** L'app est-elle installée (mode standalone) ? Détermine la fiabilité mobile. */
export function isInstalled(): boolean {
  if (typeof window === "undefined") return false;
  const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
  return Boolean(standalone || iosStandalone);
}

function fire(n: EthanNotification): void {
  if (permissionState() !== "granted") return;
  try {
    const notif = new Notification(n.title, {
      body: n.body,
      tag: n.id,
      requireInteraction: n.priority === "critique",
      silent: n.priority === "silencieuse",
      data: { to: n.to, habitId: n.habitId },
    });
    notif.onclick = () => {
      window.focus();
      window.location.assign(n.to);
      notif.close();
    };
  } catch {
    /* le navigateur peut refuser hors interaction utilisateur */
  }
}

export function sendTestNotification(): void {
  fire({
    id: `test-${Date.now()}`,
    kind: "daily_briefing",
    title: "ETHAN est connecté à ton système",
    body: "Les rappels d'habitudes arriveront désormais ici, même écran verrouillé.",
    priority: "haute",
    at: Date.now(),
    to: "/notifications",
    channels: ["native"],
  });
}

type Listener = (n: EthanNotification) => void;
const listeners = new Set<Listener>();

export function onNotification(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let timer: ReturnType<typeof setInterval> | null = null;

/** Boucle de vérification : délivre les notifications dues. */
export function startNotificationEngine(intervalMs = 60_000): () => void {
  if (typeof window === "undefined") return () => {};
  if (timer) return stopNotificationEngine;

  const tick = () => {
    const now = new Date();
    for (const n of dueNotifications(now)) {
      if (shouldDeliverNatively(n, now)) fire(n);
      recordDelivered(n);
      listeners.forEach((l) => l(n));
    }
  };

  tick();
  timer = setInterval(tick, intervalMs);
  document.addEventListener("visibilitychange", tick);
  return stopNotificationEngine;
}

export function stopNotificationEngine(): void {
  if (timer) clearInterval(timer);
  timer = null;
}
