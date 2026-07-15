/**
 * ETHAN — Memoire.
 *
 * Principe 1 : ETHAN conserve l'histoire de l'evolution.
 * Chaque decision, reussite, echec, apprentissage est un evenement
 * horodate qu'on doit pouvoir retrouver des annees plus tard.
 *
 * V1 : seed statique + API append-only. V2 : persistance Cloud.
 */

export type MemoryKind =
  | "decision"
  | "reussite"
  | "echec"
  | "apprentissage"
  | "jalon"
  | "engagement";

export interface MemoryEvent {
  id: string;
  at: number; // timestamp
  kind: MemoryKind;
  title: string;
  body: string;
  /** Modules impactes — rend l'effet domino visible. */
  impacts: string[];
  /** Objectif racine — pourquoi cet evenement compte. */
  linkedObjectiveId?: string;
}

export const MEMORY_KIND_LABEL: Record<MemoryKind, string> = {
  decision: "Decision",
  reussite: "Reussite",
  echec: "Echec",
  apprentissage: "Apprentissage",
  jalon: "Jalon",
  engagement: "Engagement",
};

const D = (y: number, m: number, d: number) => new Date(y, m - 1, d).getTime();

const events: MemoryEvent[] = [
  {
    id: "m-2026-01-01",
    at: D(2026, 1, 1),
    kind: "engagement",
    title: "Lancement d'ETHAN",
    body: "Debut du systeme d'exploitation personnel. Mission Renaitre posee comme cap absolu.",
    impacts: ["adn", "renaitre", "objectifs"],
  },
  {
    id: "m-2026-02-14",
    at: D(2026, 2, 14),
    kind: "decision",
    title: "Structuration de la hierarchie d'objectifs",
    body: "9 horizons de la Mission jusqu'a l'action du jour. Toute action doit remonter a la Mission.",
    impacts: ["objectifs", "planning"],
  },
  {
    id: "m-2026-04-03",
    at: D(2026, 4, 3),
    kind: "reussite",
    title: "Premier trimestre a 100% sur la cadence prospection",
    body: "25 appels/semaine tenus 12 semaines d'affilee. Discipline consolidee.",
    impacts: ["prospection", "business", "kpi", "objectifs"],
  },
  {
    id: "m-2026-05-20",
    at: D(2026, 5, 20),
    kind: "echec",
    title: "Deal Alpha Ventures perdu",
    body: "Proposition envoyee trop tard, relance oubliee. Apprentissage : sequencer les followups dans le CRM.",
    impacts: ["crm", "pipeline"],
  },
  {
    id: "m-2026-05-21",
    at: D(2026, 5, 21),
    kind: "apprentissage",
    title: "Regle : aucun deal chaud sans followup planifie",
    body: "Le CRM cree automatiquement un rappel Planning des qu'un deal atteint > 0.7 de chaleur.",
    impacts: ["crm", "planning"],
  },
  {
    id: "m-2026-06-30",
    at: D(2026, 6, 30),
    kind: "jalon",
    title: "Premier semestre 2026 boucle",
    body: "50% du CA annuel atteint. Trajectoire tenue sur Renaitre (proto atelier de reconstruction pose).",
    impacts: ["business", "kpi", "renaitre", "objectifs"],
  },
  {
    id: "m-2026-07-15",
    at: D(2026, 7, 15),
    kind: "engagement",
    title: "Ajout des 7 principes fondateurs",
    body: "Memoire, Sens, Effet domino, Progression, Alignement, Mode Execution, philosophie racine.",
    impacts: ["adn", "systeme"],
  },
];

export function readMemory(): ReadonlyArray<MemoryEvent> {
  return [...events].sort((a, b) => b.at - a.at);
}

export function memoryByYear(): Map<number, MemoryEvent[]> {
  const map = new Map<number, MemoryEvent[]>();
  for (const e of readMemory()) {
    const y = new Date(e.at).getFullYear();
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(e);
  }
  return map;
}

export function recordMemory(e: Omit<MemoryEvent, "id" | "at"> & { at?: number }): MemoryEvent {
  const full: MemoryEvent = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: e.at ?? Date.now(),
    kind: e.kind,
    title: e.title,
    body: e.body,
    impacts: e.impacts,
    linkedObjectiveId: e.linkedObjectiveId,
  };
  events.push(full);
  return full;
}