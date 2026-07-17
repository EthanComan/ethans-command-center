/**
 * ETHAN — Module Habitudes.
 * Données, API et persistance (Store abstrait).
 */

import { createStore } from "@/core/persistence";
import { publish } from "@/core/bus";
import type {
  ConsistencyProfile,
  Habit,
  HabitCategory,
  HabitDomain,
  HabitForToday,
  HabitFrequency,
  HabitLog,
  HabitLogStatus,
  HabitPriority,
  HabitSnapshot,
} from "./types";

const today = () => new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const HABIT_ID = {
  morningRitual: "hab-morning-ritual",
  deepWork: "hab-deep-work",
  prospectionCalls: "hab-prospection-calls",
  sport: "hab-sport",
  reading: "hab-reading",
  prayer: "hab-prayer",
  renaitreAction: "hab-renaitre-action",
  journal: "hab-journal",
  financeReview: "hab-finance-review",
  network: "hab-network",
} as const;

const SEED_HABITS: Habit[] = [
  {
    id: HABIT_ID.morningRitual,
    title: "Rituel du matin — respiration, intention, lecture",
    why: "Ancrer la journée sur l'ADN et la mission avant toute distraction.",
    objectiveId: "mission",
    domain: "spiritualite",
    category: "fondamentale",
    frequency: { kind: "daily" },
    recommendedTime: "06:30",
    priority: "critique",
    estimatedMinutes: 45,
    createdAt: iso(addDays(today(), -30)),
  },
  {
    id: HABIT_ID.deepWork,
    title: "Deep work 90 min — bloc prioritaire",
    why: "Produire chaque jour un output de haute valeur avant d'ouvrir les canaux entrants.",
    objectiveId: "week-calls",
    domain: "business",
    category: "performance",
    frequency: { kind: "daily" },
    recommendedTime: "09:00",
    priority: "critique",
    estimatedMinutes: 90,
    createdAt: iso(addDays(today(), -45)),
  },
  {
    id: HABIT_ID.prospectionCalls,
    title: "Appeler 5 prospects qualifiés",
    why: "Le pipeline est le sang de l'empire. Sans appels, pas d'offres. Sans offres, pas de financement pour Renaître.",
    objectiveId: "week-calls",
    domain: "business",
    category: "performance",
    frequency: { kind: "weekly", days: [1, 2, 3, 4, 5] },
    recommendedTime: "11:00",
    priority: "haute",
    estimatedMinutes: 60,
    createdAt: iso(addDays(today(), -30)),
  },
  {
    id: HABIT_ID.sport,
    title: "Séance de sport — force ou mobilité",
    why: "Sans corps, pas de mission. L'énergie physique est le carburant de la décision.",
    objectiveId: "day-deadlift",
    domain: "sport",
    category: "fondamentale",
    frequency: { kind: "weekly", days: [1, 3, 5] },
    recommendedTime: "07:30",
    priority: "haute",
    estimatedMinutes: 75,
    createdAt: iso(addDays(today(), -60)),
  },
  {
    id: HABIT_ID.reading,
    title: "Lire 30 min — livre de fond",
    why: "Penser à long terme demande de nouveaux modèles mentaux chaque jour.",
    domain: "lecture",
    category: "fondamentale",
    frequency: { kind: "daily" },
    recommendedTime: "21:00",
    priority: "moyenne",
    estimatedMinutes: 30,
    createdAt: iso(addDays(today(), -90)),
  },
  {
    id: HABIT_ID.prayer,
    title: "Prière / méditation — recalibrage intérieur",
    why: "L'homme que j'ai choisi d'être dépasse les résultats. L'ancrage spirituel guide les décisions.",
    domain: "spiritualite",
    category: "fondamentale",
    frequency: { kind: "daily" },
    recommendedTime: "06:00",
    priority: "haute",
    estimatedMinutes: 15,
    createdAt: iso(addDays(today(), -45)),
  },
  {
    id: HABIT_ID.renaitreAction,
    title: "Action concrète pour Renaître — contact, doc, ou avancée",
    why: "Chaque jour, la mission doit avancer d'un pas concret, même petit.",
    objectiveId: "mission",
    domain: "renaitre",
    category: "mission",
    frequency: { kind: "daily" },
    recommendedTime: "17:15",
    priority: "critique",
    estimatedMinutes: 45,
    createdAt: iso(addDays(today(), -20)),
  },
  {
    id: HABIT_ID.journal,
    title: "Journal du soir + revue de la journée",
    why: "La mémoire du système. Transformer l'expérience en apprentissage.",
    objectiveId: "day-journal",
    domain: "developpement_personnel",
    category: "fondamentale",
    frequency: { kind: "daily" },
    recommendedTime: "21:30",
    priority: "haute",
    estimatedMinutes: 20,
    createdAt: iso(addDays(today(), -40)),
  },
  {
    id: HABIT_ID.financeReview,
    title: "Revue des finances — 5 min",
    why: "La clarté financière quotidienne protège la liberté à long terme.",
    domain: "finances",
    category: "performance",
    frequency: { kind: "weekly", days: [1, 3, 5] },
    recommendedTime: "08:45",
    priority: "moyenne",
    estimatedMinutes: 5,
    createdAt: iso(addDays(today(), -25)),
  },
  {
    id: HABIT_ID.network,
    title: "Contacter 1 personne clé du réseau",
    why: "Le réseau est un actif qui se cultive un point de contact à la fois.",
    domain: "relations",
    category: "performance",
    frequency: { kind: "weekly", days: [2, 4] },
    recommendedTime: "14:00",
    priority: "moyenne",
    estimatedMinutes: 15,
    createdAt: iso(addDays(today(), -35)),
  },
];

function isDueOn(habit: Habit, date: Date): boolean {
  const dow = date.getDay();
  const dom = date.getDate();
  switch (habit.frequency.kind) {
    case "daily":
      return true;
    case "weekly":
      return habit.frequency.days.includes(dow);
    case "monthly":
      return habit.frequency.dates.includes(dom);
  }
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSeedLogs(): HabitLog[] {
  const logs: HabitLog[] = [];
  const now = today();
  const reference = new Date(now);
  // Générateur pseudo-aléatoire déterministe pour des séries reproductibles
  // entre les rechargements du serveur de développement.
  const randFor = (key: string) => {
    let seed = 0;
    for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
    return mulberry32(seed);
  };
  // Génère 90 jours de logs pour créer des séries réalistes.
  for (let i = -89; i <= 0; i++) {
    const d = addDays(reference, i);
    const dateStr = iso(d);
    for (const h of SEED_HABITS) {
      if (!isDueOn(h, d)) continue;
      const rand = randFor(`${h.id}-${dateStr}`)();
      let status: HabitLogStatus = "done";
      if (rand > 0.92) status = "missed";
      else if (rand > 0.85) status = "partial";
      else if (rand > 0.82) status = "excused";
      // Booste les fondamentales et mission pour les rendre plus stables.
      if (h.category === "fondamentale" || h.category === "mission") {
        if (rand > 0.97) status = "missed";
        else if (rand > 0.9) status = "partial";
      }
      if (status === "done") {
        logs.push({
          habitId: h.id,
          date: dateStr,
          status,
          doneAt: `${d.toISOString().slice(0, 10)}T${h.recommendedTime ?? "08:00"}:00`,
        });
      } else {
        logs.push({ habitId: h.id, date: dateStr, status });
      }
    }
  }
  return logs;
}

const habitsStore = createStore<Habit[]>("habitudes", "habits", SEED_HABITS);
const logsStore = createStore<HabitLog[]>("habitudes", "logs", buildSeedLogs());

export function readAllHabits(): Habit[] {
  return habitsStore.read();
}

export function readHabit(id: string): Habit | undefined {
  return habitsStore.read().find((h) => h.id === id);
}

export function readAllLogs(): HabitLog[] {
  return logsStore.read();
}

export function readLogsFor(habitId: string, since?: string): HabitLog[] {
  return logsStore
    .read()
    .filter((l) => l.habitId === habitId && (!since || l.date >= since));
}

export function computeStreak(habitId: string, upTo: Date = today()): number {
  const logs = logsStore.read().filter((l) => l.habitId === habitId);
  const map = new Map(logs.map((l) => [l.date, l.status]));
  const habit = readHabit(habitId);
  if (!habit) return 0;
  let streak = 0;
  let d = new Date(upTo);
  // Normalise à minuit pour éviter les effets d'heure.
  d.setHours(0, 0, 0, 0);
  while (true) {
    const dateStr = iso(d);
    const due = isDueOn(habit, d);
    if (!due) {
      d = addDays(d, -1);
      continue;
    }
    const status = map.get(dateStr);
    if (status === "done" || status === "excused") {
      streak++;
      d = addDays(d, -1);
    } else {
      break;
    }
  }
  return streak;
}

export function computeLongestStreak(habitId: string): number {
  const logs = logsStore.read().filter((l) => l.habitId === habitId);
  const habit = readHabit(habitId);
  if (!habit) return 0;
  const map = new Map(logs.map((l) => [l.date, l.status]));
  const dates = Array.from(map.keys()).sort();
  let longest = 0;
  let current = 0;
  let last: Date | null = null;
  for (const dateStr of dates) {
    const d = new Date(`${dateStr}T00:00:00`);
    if (last) {
      const diff = (d.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
      if (diff > 1) {
        longest = Math.max(longest, current);
        current = 0;
      }
    }
    if (map.get(dateStr) === "done" || map.get(dateStr) === "excused") {
      current++;
    } else {
      longest = Math.max(longest, current);
      current = 0;
    }
    last = d;
  }
  return Math.max(longest, current);
}

export function computeConsistency(
  habitId: string,
  upTo: Date = today()
): ConsistencyProfile {
  const habit = readHabit(habitId);
  if (!habit) {
    return {
      last7Days: 0,
      last30Days: 0,
      last90Days: 0,
      last365Days: 0,
      currentStreak: 0,
      longestStreak: 0,
      weeklyTarget: 0,
      weeklyDone: 0,
    };
  }
  const logs = logsStore.read().filter((l) => l.habitId === habitId);
  const map = new Map(logs.map((l) => [l.date, l.status]));

  const rate = (days: number) => {
    let due = 0;
    let done = 0;
    for (let i = 0; i < days; i++) {
      const d = addDays(upTo, -i);
      if (!isDueOn(habit, d)) continue;
      due++;
      const s = map.get(iso(d));
      if (s === "done" || s === "excused") done++;
    }
    return due ? Math.round((done / due) * 100) : 0;
  };

  const startOfWeek = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    const dow = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - dow);
    return x;
  };

  let weeklyTarget = 0;
  let weeklyDone = 0;
  const wStart = startOfWeek(upTo);
  for (let i = 0; i < 7; i++) {
    const d = addDays(wStart, i);
    if (!isDueOn(habit, d)) continue;
    weeklyTarget++;
    const s = map.get(iso(d));
    if (s === "done" || s === "excused") weeklyDone++;
  }

  return {
    last7Days: rate(7),
    last30Days: rate(30),
    last90Days: rate(90),
    last365Days: rate(365),
    currentStreak: computeStreak(habitId, upTo),
    longestStreak: computeLongestStreak(habitId),
    weeklyTarget,
    weeklyDone,
  };
}

export function readTodayHabits(refDate: Date = today()): HabitForToday[] {
  const habits = habitsStore.read();
  const dateStr = iso(refDate);
  const logs = logsStore.read();
  const todayMap = new Map(logs.filter((l) => l.date === dateStr).map((l) => [l.habitId, l]));
  return habits
    .map((habit) => {
      const dueToday = isDueOn(habit, refDate);
      const log = todayMap.get(habit.id);
      const doneToday = log?.status === "done" || log?.status === "excused";
      return {
        habit,
        dueToday,
        doneToday,
        log,
        streak: computeStreak(habit.id, refDate),
        consistency: computeConsistency(habit.id, refDate),
      };
    })
    .sort((a, b) => {
      if (a.dueToday !== b.dueToday) return a.dueToday ? -1 : 1;
      if (a.doneToday !== b.doneToday) return a.doneToday ? 1 : -1;
      return b.consistency.currentStreak - a.consistency.currentStreak;
    });
}

export function snapshotHabits(refDate: Date = today()): HabitSnapshot {
  const habits = habitsStore.read();
  const logs = logsStore.read();
  const todayHabits = readTodayHabits(refDate);
  const streaks: Record<string, number> = {};
  const consistency: Record<string, ConsistencyProfile> = {};
  for (const h of habits) {
    streaks[h.id] = computeStreak(h.id, refDate);
    consistency[h.id] = computeConsistency(h.id, refDate);
  }
  return { habits, logs, today: todayHabits, streaks, consistency };
}

export function logHabit(habitId: string, status: HabitLogStatus, note?: string): void {
  const dateStr = iso(today());
  const next = logsStore.read().filter((l) => !(l.habitId === habitId && l.date === dateStr));
  const entry: HabitLog = {
    habitId,
    date: dateStr,
    status,
    note,
    doneAt: status === "done" || status === "partial" ? new Date().toISOString() : undefined,
  };
  logsStore.write([...next, entry]);
  if (status === "done" || status === "partial") {
    publish({
      kind: "habitudes:completed",
      source: "habitudes",
      at: Date.now(),
      payload: { habitId, status, date: dateStr },
    });
  } else {
    publish({
      kind: "habitudes:streak_at_risk",
      source: "habitudes",
      at: Date.now(),
      payload: { habitId, date: dateStr },
    });
  }
  publish({
    kind: "habitudes:updated",
    source: "habitudes",
    at: Date.now(),
    payload: { habitId },
  });
}

export function markDone(habitId: string, note?: string): void {
  logHabit(habitId, "done", note);
}

export function markPartial(habitId: string, note?: string): void {
  logHabit(habitId, "partial", note);
}

export function markMissed(habitId: string, note?: string): void {
  logHabit(habitId, "missed", note);
}

export function markExcused(habitId: string, note?: string): void {
  logHabit(habitId, "excused", note);
}

export function addHabit(input: Omit<Habit, "id" | "createdAt">): Habit {
  const id = `hab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const habit: Habit = { ...input, id, createdAt: iso(today()) };
  habitsStore.write([...habitsStore.read(), habit]);
  publish({
    kind: "habitudes:updated",
    source: "habitudes",
    at: Date.now(),
    payload: { habitId: id },
  });
  return habit;
}

export function updateHabit(id: string, patch: Partial<Omit<Habit, "id" | "createdAt">>): Habit | undefined {
  const habits = habitsStore.read();
  const idx = habits.findIndex((h) => h.id === id);
  if (idx === -1) return undefined;
  const updated = { ...habits[idx], ...patch };
  const next = [...habits];
  next[idx] = updated;
  habitsStore.write(next);
  publish({
    kind: "habitudes:updated",
    source: "habitudes",
    at: Date.now(),
    payload: { habitId: id },
  });
  return updated;
}

export function deleteHabit(id: string): boolean {
  const habits = habitsStore.read();
  if (!habits.some((h) => h.id === id)) return false;
  habitsStore.write(habits.filter((h) => h.id !== id));
  logsStore.write(logsStore.read().filter((l) => l.habitId !== id));
  publish({
    kind: "habitudes:updated",
    source: "habitudes",
    at: Date.now(),
    payload: { habitId: id },
  });
  return true;
}

export function globalConsistency(refDate: Date = today()): number {
  const habits = habitsStore.read();
  if (habits.length === 0) return 0;
  const sum = habits.reduce((acc, h) => acc + computeConsistency(h.id, refDate).last7Days, 0);
  return Math.round(sum / habits.length);
}
