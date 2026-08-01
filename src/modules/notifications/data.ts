/**
 * ETHAN — Notifications : construction du plan de la journée.
 *
 * Le module ne "spamme" pas : il calcule, à partir des habitudes du jour,
 * de leur nature, de leur poids d'impact et de la phase courante, le petit
 * nombre de rappels qui changent réellement l'exécution.
 */

import { createStore } from "@/core/persistence";
import {
  currentPhase,
  effectiveWeight,
  notificationFor,
  phaseDefinition,
  readTodayHabits,
} from "@/modules/habitudes/data";
import type { HabitForToday } from "@/modules/habitudes/types";
import {
  DEFAULT_PREFS,
  PRIORITY_RANK,
  type DeliveredNotification,
  type EthanNotification,
  type NotificationPrefs,
  type NotificationPriority,
} from "./types";

const prefsStore = createStore<NotificationPrefs>("notifications", "prefs", DEFAULT_PREFS);
const deliveredStore = createStore<DeliveredNotification[]>("notifications", "delivered", []);

export function readPrefs(): NotificationPrefs {
  return { ...DEFAULT_PREFS, ...prefsStore.read() };
}

export function writePrefs(patch: Partial<NotificationPrefs>): NotificationPrefs {
  const next = { ...readPrefs(), ...patch };
  prefsStore.write(next);
  return next;
}

/* ---------------------------- utilitaires ---------------------------- */

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function atTime(day: Date, hhmm: string, offsetMinutes = 0): number {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d.getTime() + offsetMinutes * 60_000;
}

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Heures silencieuses — gère le passage de minuit. */
export function inQuietHours(date: Date, prefs: NotificationPrefs = readPrefs()): boolean {
  if (!prefs.quietHours.enabled) return false;
  const now = date.getHours() * 60 + date.getMinutes();
  const from = minutesOf(prefs.quietHours.from);
  const to = minutesOf(prefs.quietHours.to);
  return from <= to ? now >= from && now < to : now >= from || now < to;
}

function priorityFor(item: HabitForToday): NotificationPriority {
  if (item.habit.nature === "obligatoire" || item.habit.priority === "critique") return "critique";
  if (effectiveWeight(item.habit) >= 8 || item.habit.priority === "haute") return "haute";
  return "normale";
}

/* ------------------------- plan de la journée ------------------------- */

/**
 * Construit toutes les notifications prévues pour la journée.
 * Chaque id est stable (habitude + type + jour) → aucun doublon possible.
 */
export function buildDaySchedule(day: Date = new Date()): EthanNotification[] {
  const prefs = readPrefs();
  if (!prefs.enabled) return [];

  const key = isoDay(day);
  const items = readTodayHabits(day).filter((i) => i.dueToday);
  const out: EthanNotification[] = [];

  if (prefs.kinds.daily_briefing) {
    const pending = items.filter((i) => !i.doneToday);
    const top = pending[0];
    out.push({
      id: `brief-${key}`,
      kind: "daily_briefing",
      title: "Brief ETHAN — la journée est cadrée",
      body: top
        ? `${pending.length} habitudes aujourd'hui. Priorité : ${top.habit.title}.`
        : `Phase « ${phaseDefinition().label} ». Aucune habitude en attente.`,
      priority: "haute",
      at: atTime(day, prefs.dailyBriefingAt),
      to: "/",
      channels: ["in_app", "native"],
    });
  }

  for (const item of items) {
    const h = item.habit;
    const cfg = notificationFor(h);
    if (!cfg.enabled || !h.recommendedTime) continue;
    const priority = priorityFor(item);

    if (prefs.kinds.habit_upcoming) {
      out.push({
        id: `up-${h.id}-${key}`,
        kind: "habit_upcoming",
        title: h.title,
        body: `Dans ${cfg.leadMinutes} min · ${h.estimatedMinutes} min · ${h.why}`,
        priority,
        at: atTime(day, h.recommendedTime, -cfg.leadMinutes),
        to: "/habitudes",
        habitId: h.id,
        channels: ["in_app", "native"],
        actions: [
          { id: "done", label: "Fait" },
          { id: "later", label: "Plus tard" },
        ],
      });
    }

    if (prefs.kinds.habit_missed) {
      out.push({
        id: `miss-${h.id}-${key}`,
        kind: "habit_missed",
        title: `Toujours pas fait — ${h.title}`,
        body: `Coût de l'abandon : ${item.impact.costOfSkipping}/100. ${h.links[0]?.contribution ?? ""}`.trim(),
        priority,
        at: atTime(day, h.recommendedTime, cfg.missedAfterMinutes),
        to: "/habitudes",
        habitId: h.id,
        channels: ["in_app", "native"],
        actions: [{ id: "done", label: "Fait" }],
      });
    }

    if (prefs.kinds.habit_streak_risk && cfg.escalateOnStreakRisk && item.streak >= 3) {
      out.push({
        id: `streak-${h.id}-${key}`,
        kind: "habit_streak_risk",
        title: `Série de ${item.streak} jours en danger`,
        body: `${h.title} — il reste quelques heures pour ne pas casser la chaîne.`,
        priority: "critique",
        at: atTime(day, "20:30"),
        to: "/habitudes",
        habitId: h.id,
        channels: ["in_app", "native"],
        actions: [{ id: "done", label: "Fait" }],
      });
    }
  }

  if (prefs.kinds.evening_review) {
    out.push({
      id: `review-${key}`,
      kind: "evening_review",
      title: "Revue du soir",
      body: "Clôture la journée : ce qui est fait, ce qui a manqué, ce que tu retiens.",
      priority: "normale",
      at: atTime(day, prefs.eveningReviewAt),
      to: "/journal",
      channels: ["in_app", "native"],
    });
  }

  return out.sort((a, b) => a.at - b.at);
}

/** Notifications encore à venir aujourd'hui. */
export function upcomingToday(now: Date = new Date()): EthanNotification[] {
  return buildDaySchedule(now).filter((n) => n.at > now.getTime());
}

/** Notifications dues et pas encore délivrées. */
export function dueNotifications(now: Date = new Date()): EthanNotification[] {
  const seen = new Set(deliveredStore.read().map((d) => d.id));
  const habitsDone = new Set(
    readTodayHabits(now).filter((i) => i.doneToday).map((i) => i.habit.id)
  );
  return buildDaySchedule(now).filter(
    (n) =>
      n.at <= now.getTime() &&
      !seen.has(n.id) &&
      !(n.habitId && habitsDone.has(n.habitId) && n.kind !== "habit_done")
  );
}

export function shouldDeliverNatively(
  n: EthanNotification,
  now: Date = new Date(),
  prefs: NotificationPrefs = readPrefs()
): boolean {
  if (!prefs.enabled || !prefs.nativeEnabled) return false;
  if (!n.channels.includes("native")) return false;
  if (PRIORITY_RANK[n.priority] < PRIORITY_RANK[prefs.minNativePriority]) return false;
  if (inQuietHours(now, prefs)) {
    return prefs.bypassQuietForCritical && n.priority === "critique";
  }
  return true;
}

export function recordDelivered(n: EthanNotification): void {
  const list = deliveredStore.read();
  if (list.some((d) => d.id === n.id)) return;
  deliveredStore.write([{ ...n, deliveredAt: Date.now(), read: false }, ...list].slice(0, 200));
}

export function readDelivered(): DeliveredNotification[] {
  return deliveredStore.read();
}

export function markAllRead(): void {
  deliveredStore.write(deliveredStore.read().map((d) => ({ ...d, read: true })));
}

export function clearDelivered(): void {
  deliveredStore.write([]);
}

export function snapshotNotifications() {
  return {
    prefs: readPrefs(),
    phase: currentPhase(),
    upcoming: upcomingToday(),
    delivered: readDelivered(),
  };
}
