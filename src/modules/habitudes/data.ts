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
import {
  DEFAULT_NOTIFICATION,
  HABIT_PHASES,
  HABIT_PRIORITY_WEIGHT,
  type HabitNotification,
  type HabitPhase,
  type ImpactProfile,
  type PhaseDefinition,
} from "./types";

const SEED_REFERENCE_DATE = new Date("2026-08-05T00:00:00");
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
  launchReview: "hab-launch-review",
  followUps: "hab-follow-ups",
  renaitreStructuring: "hab-renaitre-structuring",
  recovery: "hab-recovery",
} as const;

const SEED_HABITS: Habit[] = [
  {
    id: HABIT_ID.morningRitual,
    title: "Rituel du matin — respiration, intention, lecture",
    why: "Ancrer la journée sur l'ADN et la mission avant toute distraction.",
    objectiveId: "mission",
    domain: "spiritualite",
    category: "fondamentale",
    nature: "obligatoire",
    frequency: { kind: "daily" },
    recommendedTime: "06:30",
    priority: "critique",
    estimatedMinutes: 45,
    impactWeight: 9,
    links: [
      { kind: "objectif", id: "mission", label: "Mission Renaître", contribution: "Aligne la journée sur la mission", weight: 0.4, to: "/objectifs" },
      { kind: "progression", id: "discipline", label: "Axe Discipline", contribution: "+2 pts / mois de constance", weight: 0.35, to: "/progression" },
      { kind: "progression", id: "constance", label: "Axe Constance", contribution: "Socle du score d'homme", weight: 0.25, to: "/progression" },
    ],
    createdAt: iso(addDays(SEED_REFERENCE_DATE, -30)),
  },
  {
    id: HABIT_ID.deepWork,
    title: "Deep work 90 min — bloc prioritaire",
    why: "Produire chaque jour un output de haute valeur avant d'ouvrir les canaux entrants.",
    objectiveId: "week-calls",
    domain: "business",
    category: "performance",
    nature: "progression",
    frequency: { kind: "daily" },
    recommendedTime: "09:00",
    priority: "critique",
    estimatedMinutes: 90,
    impactWeight: 10,
    links: [
      { kind: "objectif", id: "week-calls", label: "Objectif hebdo business", contribution: "Avance le livrable clé", weight: 0.4, to: "/objectifs" },
      { kind: "kpi", id: "kpi-output", label: "KPI Output hebdomadaire", contribution: "+1 livrable / jour", weight: 0.35, to: "/kpi" },
      { kind: "progression", id: "competences", label: "Axe Compétences", contribution: "Approfondissement du métier", weight: 0.25, to: "/progression" },
    ],
    createdAt: iso(addDays(SEED_REFERENCE_DATE, -45)),
  },
  {
    id: HABIT_ID.prospectionCalls,
    title: "Appeler 5 prospects qualifiés",
    why: "Le pipeline est le sang de l'empire. Sans appels, pas d'offres. Sans offres, pas de financement pour Renaître.",
    objectiveId: "week-calls",
    domain: "business",
    category: "performance",
    nature: "progression",
    frequency: { kind: "weekly", days: [1, 2, 3, 4, 5] },
    recommendedTime: "11:00",
    priority: "haute",
    estimatedMinutes: 60,
    impactWeight: 9,
    links: [
      { kind: "kpi", id: "kpi-calls", label: "KPI Appels / semaine", contribution: "+25 appels / semaine", weight: 0.4, to: "/kpi" },
      { kind: "projet", id: "pipeline", label: "Pipeline commercial", contribution: "Alimente le haut de tunnel", weight: 0.3, to: "/pipeline" },
      { kind: "renaitre", id: "financement", label: "Renaître — financement", contribution: "Le CA finance le refuge", weight: 0.3, to: "/renaitre" },
    ],
    createdAt: iso(addDays(SEED_REFERENCE_DATE, -30)),
  },
  {
    id: HABIT_ID.sport,
    title: "Séance de sport — force ou mobilité",
    why: "Sans corps, pas de mission. L'énergie physique est le carburant de la décision.",
    objectiveId: "day-deadlift",
    domain: "sport",
    category: "fondamentale",
    nature: "obligatoire",
    frequency: { kind: "weekly", days: [1, 3, 5] },
    recommendedTime: "07:30",
    priority: "haute",
    estimatedMinutes: 75,
    impactWeight: 8,
    pausedInPhases: ["recuperation"],
    links: [
      { kind: "progression", id: "sante", label: "Axe Santé", contribution: "+3 pts / trimestre", weight: 0.5, to: "/progression" },
      { kind: "objectif", id: "day-deadlift", label: "Objectif force", contribution: "Progression de charge", weight: 0.3, to: "/objectifs" },
      { kind: "kpi", id: "kpi-energy", label: "KPI Énergie", contribution: "Énergie disponible pour le deep work", weight: 0.2, to: "/kpi" },
    ],
    createdAt: iso(addDays(SEED_REFERENCE_DATE, -60)),
  },
  {
    id: HABIT_ID.reading,
    title: "Lire 30 min — livre de fond",
    why: "Penser à long terme demande de nouveaux modèles mentaux chaque jour.",
    domain: "lecture",
    category: "fondamentale",
    nature: "progression",
    frequency: { kind: "daily" },
    recommendedTime: "21:00",
    priority: "moyenne",
    estimatedMinutes: 30,
    impactWeight: 5,
    links: [
      { kind: "progression", id: "competences", label: "Axe Compétences", contribution: "+1 modèle mental / semaine", weight: 0.6, to: "/progression" },
      { kind: "projet", id: "bibliotheque", label: "Bibliothèque", contribution: "Alimente les notes de lecture", weight: 0.4, to: "/bibliotheque" },
    ],
    createdAt: iso(addDays(SEED_REFERENCE_DATE, -90)),
  },
  {
    id: HABIT_ID.prayer,
    title: "Prière / méditation — recalibrage intérieur",
    why: "L'homme que j'ai choisi d'être dépasse les résultats. L'ancrage spirituel guide les décisions.",
    domain: "spiritualite",
    category: "fondamentale",
    nature: "obligatoire",
    frequency: { kind: "daily" },
    recommendedTime: "06:00",
    priority: "haute",
    estimatedMinutes: 15,
    impactWeight: 8,
    links: [
      { kind: "progression", id: "mission", label: "Axe Mission", contribution: "Maintient le cap intérieur", weight: 0.5, to: "/progression" },
      { kind: "objectif", id: "mission", label: "Mission Renaître", contribution: "Rappelle pour qui je me lève", weight: 0.5, to: "/objectifs" },
    ],
    createdAt: iso(addDays(SEED_REFERENCE_DATE, -45)),
  },
  {
    id: HABIT_ID.renaitreAction,
    title: "Action concrète pour Renaître — contact, doc, ou avancée",
    why: "Chaque jour, la mission doit avancer d'un pas concret, même petit.",
    objectiveId: "mission",
    domain: "renaitre",
    category: "mission",
    nature: "obligatoire",
    frequency: { kind: "daily" },
    recommendedTime: "17:15",
    priority: "critique",
    estimatedMinutes: 45,
    impactWeight: 10,
    links: [
      { kind: "renaitre", id: "refuge", label: "Renaître — pilier Refuge", contribution: "+1 pas concret / jour", weight: 0.5, to: "/renaitre" },
      { kind: "objectif", id: "mission", label: "Mission de vie", contribution: "Progression directe de la mission", weight: 0.3, to: "/objectifs" },
      { kind: "progression", id: "impact", label: "Axe Impact", contribution: "+4 pts / trimestre", weight: 0.2, to: "/progression" },
    ],
    createdAt: iso(addDays(SEED_REFERENCE_DATE, -20)),
  },
  {
    id: HABIT_ID.journal,
    title: "Journal du soir + revue de la journée",
    why: "La mémoire du système. Transformer l'expérience en apprentissage.",
    objectiveId: "day-journal",
    domain: "developpement_personnel",
    category: "fondamentale",
    nature: "obligatoire",
    frequency: { kind: "daily" },
    recommendedTime: "21:30",
    priority: "haute",
    estimatedMinutes: 20,
    impactWeight: 7,
    links: [
      { kind: "projet", id: "memoire", label: "Mémoire d'ETHAN", contribution: "+1 entrée d'apprentissage", weight: 0.5, to: "/memoire" },
      { kind: "progression", id: "discipline", label: "Axe Discipline", contribution: "Boucle de rétroaction quotidienne", weight: 0.5, to: "/progression" },
    ],
    createdAt: iso(addDays(SEED_REFERENCE_DATE, -40)),
  },
  {
    id: HABIT_ID.financeReview,
    title: "Revue des finances — 5 min",
    why: "La clarté financière quotidienne protège la liberté à long terme.",
    domain: "finances",
    category: "performance",
    nature: "progression",
    frequency: { kind: "weekly", days: [1, 3, 5] },
    recommendedTime: "08:45",
    priority: "moyenne",
    estimatedMinutes: 5,
    impactWeight: 5,
    links: [
      { kind: "kpi", id: "kpi-cashflow", label: "KPI Cash-flow", contribution: "Détection précoce des dérives", weight: 0.6, to: "/kpi" },
      { kind: "progression", id: "patrimoine", label: "Axe Patrimoine", contribution: "Pilotage du capital", weight: 0.4, to: "/progression" },
    ],
    createdAt: iso(addDays(SEED_REFERENCE_DATE, -25)),
  },
  {
    id: HABIT_ID.network,
    title: "Contacter 1 personne clé du réseau",
    why: "Le réseau est un actif qui se cultive un point de contact à la fois.",
    domain: "relations",
    category: "performance",
    nature: "progression",
    frequency: { kind: "weekly", days: [2, 4] },
    recommendedTime: "14:00",
    priority: "moyenne",
    estimatedMinutes: 15,
    impactWeight: 6,
    links: [
      { kind: "progression", id: "reseau", label: "Axe Réseau", contribution: "+2 relations actives / mois", weight: 0.6, to: "/progression" },
      { kind: "projet", id: "partenaires", label: "Partenaires", contribution: "Pipeline d'alliances", weight: 0.4, to: "/partenaires" },
    ],
    createdAt: iso(addDays(SEED_REFERENCE_DATE, -35)),
  },
  {
    id: HABIT_ID.launchReview,
    title: "Revue de lancement — métriques, retours, correctifs",
    why: "En phase de lancement, la vitesse d'itération décide du résultat.",
    domain: "business",
    category: "performance",
    nature: "contextuelle",
    frequency: { kind: "daily" },
    recommendedTime: "18:00",
    priority: "haute",
    estimatedMinutes: 30,
    impactWeight: 8,
    phases: ["lancement"],
    links: [
      { kind: "kpi", id: "kpi-launch", label: "KPI Lancement", contribution: "Boucle d'itération quotidienne", weight: 0.6, to: "/kpi" },
      { kind: "projet", id: "business", label: "Projet en lancement", contribution: "Réduit le temps de correction", weight: 0.4, to: "/business" },
    ],
    createdAt: iso(addDays(SEED_REFERENCE_DATE, -15)),
  },
  {
    id: HABIT_ID.followUps,
    title: "Relancer 10 prospects en attente",
    why: "En prospection intensive, la relance vaut plus que le nouveau contact.",
    domain: "business",
    category: "performance",
    nature: "contextuelle",
    frequency: { kind: "weekly", days: [1, 2, 3, 4, 5] },
    recommendedTime: "16:00",
    priority: "haute",
    estimatedMinutes: 40,
    impactWeight: 8,
    phases: ["prospection_intensive", "lancement"],
    links: [
      { kind: "kpi", id: "kpi-followups", label: "KPI Relances", contribution: "+50 relances / semaine", weight: 0.5, to: "/kpi" },
      { kind: "projet", id: "crm", label: "CRM", contribution: "Réduit les deals dormants", weight: 0.5, to: "/crm" },
    ],
    createdAt: iso(addDays(SEED_REFERENCE_DATE, -15)),
  },
  {
    id: HABIT_ID.renaitreStructuring,
    title: "Structuration Renaître — statuts, partenaires, financement",
    why: "La mission ne se construit pas par intention, mais par structure.",
    objectiveId: "mission",
    domain: "renaitre",
    category: "mission",
    nature: "contextuelle",
    frequency: { kind: "weekly", days: [2, 4, 6] },
    recommendedTime: "15:00",
    priority: "critique",
    estimatedMinutes: 90,
    impactWeight: 10,
    phases: ["renaitre"],
    links: [
      { kind: "renaitre", id: "structure", label: "Renaître — structuration", contribution: "Avance juridique et partenariale", weight: 0.6, to: "/renaitre" },
      { kind: "progression", id: "impact", label: "Axe Impact", contribution: "+6 pts / trimestre", weight: 0.4, to: "/progression" },
    ],
    createdAt: iso(addDays(SEED_REFERENCE_DATE, -10)),
  },
  {
    id: HABIT_ID.recovery,
    title: "Protocole de récupération — sommeil, mobilité, marche",
    why: "Récupérer n'est pas s'arrêter : c'est préparer la prochaine séquence d'intensité.",
    domain: "sante",
    category: "fondamentale",
    nature: "contextuelle",
    frequency: { kind: "daily" },
    recommendedTime: "20:00",
    priority: "haute",
    estimatedMinutes: 40,
    impactWeight: 7,
    phases: ["recuperation", "vacances"],
    links: [
      { kind: "progression", id: "sante", label: "Axe Santé", contribution: "Restaure la capacité d'exécution", weight: 0.7, to: "/progression" },
      { kind: "kpi", id: "kpi-energy", label: "KPI Énergie", contribution: "Remonte l'énergie disponible", weight: 0.3, to: "/kpi" },
    ],
    createdAt: iso(addDays(SEED_REFERENCE_DATE, -12)),
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
const phaseStore = createStore<HabitPhase>("habitudes", "phase", "standard");

/* ------------------------------------------------------------------ */
/*  Phases de vie                                                      */
/* ------------------------------------------------------------------ */

export function currentPhase(): HabitPhase {
  return phaseStore.read();
}

export function phaseDefinition(phase: HabitPhase = currentPhase()): PhaseDefinition {
  return HABIT_PHASES.find((p) => p.id === phase) ?? HABIT_PHASES[0];
}

export function setPhase(phase: HabitPhase): void {
  phaseStore.write(phase);
  publish({
    kind: "habitudes:updated",
    source: "habitudes",
    at: Date.now(),
    payload: { phase },
  });
}

/**
 * Une habitude est-elle active dans la phase courante ?
 *   - obligatoire  : toujours active, sauf suspension explicite.
 *   - progression  : masquée si son domaine est mis en sourdine par la phase.
 *   - contextuelle : active uniquement si la phase est listée.
 */
export function isActiveInPhase(habit: Habit, phase: HabitPhase = currentPhase()): boolean {
  if (habit.pausedInPhases?.includes(phase)) return false;
  if (habit.phases && habit.phases.length > 0) return habit.phases.includes(phase);
  if (habit.nature === "contextuelle") return false;
  if (habit.nature === "obligatoire") return true;
  const def = phaseDefinition(phase);
  return !def.mute.includes(habit.domain);
}

export function notificationFor(habit: Habit): HabitNotification {
  return { ...DEFAULT_NOTIFICATION, ...(habit.notification ?? {}) };
}

/* ------------------------------------------------------------------ */
/*  Impact                                                             */
/* ------------------------------------------------------------------ */

/** Poids effectif d'une habitude, amplifié par la phase courante. */
export function effectiveWeight(habit: Habit, phase: HabitPhase = currentPhase()): number {
  const def = phaseDefinition(phase);
  let w = habit.impactWeight;
  if (def.boost.includes(habit.domain)) w *= 1.25;
  if (def.mute.includes(habit.domain)) w *= 0.6;
  if (habit.nature === "obligatoire") w *= 1.15;
  return Math.max(1, Math.min(12, Math.round(w * 10) / 10));
}

export function computeImpact(habitId: string, refDate: Date = today()): ImpactProfile {
  const habit = readHabit(habitId);
  if (!habit) {
    return { weight: 0, weightedScore: 0, delivered30: 0, costOfSkipping: 0, systemLinks: 0 };
  }
  const c = computeConsistency(habitId, refDate);
  const weight = effectiveWeight(habit);
  const linkWeight = habit.links.reduce((acc, l) => acc + l.weight, 0);
  const delivered30 = Math.round((c.last30Days / 100) * weight * 10);
  const costOfSkipping = Math.min(
    100,
    Math.round(weight * 6 + HABIT_PRIORITY_WEIGHT[habit.priority] * 6 + linkWeight * 10 + Math.min(20, c.currentStreak))
  );
  return {
    weight,
    weightedScore: Math.round((c.last30Days * weight) / 12),
    delivered30: Math.min(100, delivered30),
    costOfSkipping,
    systemLinks: habit.links.length,
  };
}

/** Score d'impact global du système : constance pondérée par les poids. */
export function globalImpactScore(refDate: Date = today()): number {
  const habits = habitsStore.read().filter((h) => isActiveInPhase(h));
  if (habits.length === 0) return 0;
  let num = 0;
  let den = 0;
  for (const h of habits) {
    const w = effectiveWeight(h);
    num += computeConsistency(h.id, refDate).last30Days * w;
    den += w;
  }
  return den ? Math.round(num / den) : 0;
}

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
      const activeInPhase = isActiveInPhase(habit);
      const dueToday = activeInPhase && isDueOn(habit, refDate);
      const log = todayMap.get(habit.id);
      const doneToday = log?.status === "done" || log?.status === "excused";
      return {
        habit,
        dueToday,
        doneToday,
        log,
        streak: computeStreak(habit.id, refDate),
        consistency: computeConsistency(habit.id, refDate),
        activeInPhase,
        impact: computeImpact(habit.id, refDate),
      };
    })
    .sort((a, b) => {
      if (a.dueToday !== b.dueToday) return a.dueToday ? -1 : 1;
      if (a.doneToday !== b.doneToday) return a.doneToday ? 1 : -1;
      if (a.impact.costOfSkipping !== b.impact.costOfSkipping)
        return b.impact.costOfSkipping - a.impact.costOfSkipping;
      return b.consistency.currentStreak - a.consistency.currentStreak;
    });
}

export function snapshotHabits(refDate: Date = today()): HabitSnapshot {
  const habits = habitsStore.read();
  const logs = logsStore.read();
  const todayHabits = readTodayHabits(refDate);
  const streaks: Record<string, number> = {};
  const consistency: Record<string, ConsistencyProfile> = {};
  const impact: Record<string, ImpactProfile> = {};
  for (const h of habits) {
    streaks[h.id] = computeStreak(h.id, refDate);
    consistency[h.id] = computeConsistency(h.id, refDate);
    impact[h.id] = computeImpact(h.id, refDate);
  }
  return { habits, logs, today: todayHabits, streaks, consistency, impact, phase: currentPhase() };
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
