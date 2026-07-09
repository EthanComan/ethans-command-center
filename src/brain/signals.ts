import type { Signal } from "./types";

/**
 * Collecteur de signaux.
 *
 * V1 : signaux simulés (mock) pour valider l'architecture visuelle.
 * V2 : chaque module poussera ses propres signaux via `pushSignal()`
 *      ou une souscription Cloud (Realtime). L'API publique ne change pas.
 */

const HOUR = 60 * 60 * 1000;
const now = Date.now();

const mockSignals: Signal[] = [
  {
    id: "prospection-inactivity",
    source: "prospection",
    kind: "inactivity",
    intensity: 0.92,
    updatedAt: now - 48 * HOUR,
    context: {
      hoursSinceLastCall: 48,
      weeklyTarget: 25,
      weeklyDone: 11,
    },
  },
  {
    id: "crm-hot-deal",
    source: "crm",
    kind: "opportunity",
    intensity: 0.78,
    updatedAt: now - 3 * HOUR,
    context: {
      deal: "Alpha Ventures",
      stage: "Proposition envoyée",
      lastTouch: "il y a 3 jours",
    },
  },
  {
    id: "habit-deep-work",
    source: "habitudes",
    kind: "streak_risk",
    intensity: 0.64,
    updatedAt: now - 20 * HOUR,
    context: {
      habit: "Deep work 90 min",
      streak: 14,
    },
  },
  {
    id: "mental-energy",
    source: "mental",
    kind: "energy_state",
    intensity: 0.45,
    updatedAt: now - 1 * HOUR,
    context: {
      energy: 6.4,
      sleepHours: 6.1,
    },
  },
  {
    id: "goal-weekly-revenue",
    source: "objectifs",
    kind: "goal_gap",
    intensity: 0.71,
    updatedAt: now - 6 * HOUR,
    context: {
      objective: "CA hebdomadaire",
      progress: 42,
      target: 100,
    },
  },
  {
    id: "sport-recovery",
    source: "sport",
    kind: "recovery_needed",
    intensity: 0.30,
    updatedAt: now - 12 * HOUR,
    context: { hrv: "basse", lastSession: "hier — jambes" },
  },
];

let signalStore: Signal[] = [...mockSignals];

export function getSignals(): Signal[] {
  return signalStore;
}

/** API prête pour la V2 — chaque module pousse ses signaux ici. */
export function pushSignal(signal: Signal) {
  signalStore = [...signalStore.filter((s) => s.id !== signal.id), signal];
}

export function clearSignals() {
  signalStore = [];
}