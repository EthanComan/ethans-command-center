/**
 * ETHAN — Modules du système.
 *
 * Chaque objet ci-dessous est un module conforme au contrat
 * `EthanModule`. Ils publient/écoutent le bus et exposent des
 * snapshots consommés par les autres modules et par Le Cerveau.
 *
 * V1 : les données sont simulées (in-memory) pour valider les câblages.
 * V2 : `snapshot()` sera alimenté par Lovable Cloud / stores locaux.
 */

import type { EthanModule } from "@/core/contracts";
import type { Signal } from "@/brain/types";
import { publish } from "@/core/bus";
import { habitudesModule } from "./habitudes";
import {
  readAll as readObjectives,
  byHorizon as objectivesByHorizon,
  todayObjectives,
  weeklyFocus,
} from "@/modules/objectifs/data";
import type { Objective } from "@/modules/objectifs/types";

const HOUR = 60 * 60 * 1000;
const now = () => Date.now();

// ─────────────────────────────────────────────────────────────
// MENTAL — source de vérité de l'énergie du jour.
// Lit : sport (récupération) → module cross-influence.
// ─────────────────────────────────────────────────────────────
interface MentalState { energy: number; sleepHours: number; updatedAt: number }
const mentalState: MentalState = { energy: 6.4, sleepHours: 6.1, updatedAt: now() };

export const mentalModule: EthanModule<MentalState> = {
  id: "mental",
  snapshot: () => mentalState,
  getSignals: () => [{
    id: "mental-energy",
    source: "mental",
    kind: "energy_state",
    intensity: 1 - mentalState.energy / 10,
    updatedAt: mentalState.updatedAt,
    context: { energy: mentalState.energy, sleepHours: mentalState.sleepHours },
  }],
  onEvent: (e) => {
    // Une séance de sport intense abaisse l'énergie disponible.
    if (e.kind === "sport:session_completed") {
      mentalState.energy = Math.max(3, mentalState.energy - 1.2);
      mentalState.updatedAt = now();
      publish({ kind: "mental:energy_updated", source: "mental", at: now(), payload: mentalState });
    }
  },
};

// ─────────────────────────────────────────────────────────────
// SPORT — dernière séance, besoin de récupération.
// ─────────────────────────────────────────────────────────────
interface SportState { lastSession: string; hrv: "basse" | "moyenne" | "haute"; hoursSince: number }
const sportState: SportState = { lastSession: "hier — jambes", hrv: "basse", hoursSince: 12 };

export const sportModule: EthanModule<SportState> = {
  id: "sport",
  snapshot: () => sportState,
  getSignals: () => [{
    id: "sport-recovery",
    source: "sport",
    kind: "recovery_needed",
    intensity: sportState.hrv === "basse" ? 0.6 : 0.3,
    updatedAt: now() - sportState.hoursSince * HOUR,
    context: { hrv: sportState.hrv, lastSession: sportState.lastSession },
  }],
};

// ─────────────────────────────────────────────────────────────
// HABITUDES — moteur de comportements quotidiens.
// ─────────────────────────────────────────────────────────────
export { habitudesModule } from "./habitudes";

// ─────────────────────────────────────────────────────────────
// PROSPECTION — cadence hebdomadaire.
// ─────────────────────────────────────────────────────────────
interface ProspectionState { weeklyTarget: number; weeklyDone: number; hoursSinceLastCall: number }
const prospectionState: ProspectionState = { weeklyTarget: 25, weeklyDone: 11, hoursSinceLastCall: 48 };

export const prospectionModule: EthanModule<ProspectionState> = {
  id: "prospection",
  snapshot: () => prospectionState,
  getSignals: (ctx) => {
    // Module cross-influence : si l'énergie est basse, on augmente le poids
    // de la prospection (tâche mécanique → parfaite quand l'énergie manque).
    const mental = ctx.get<MentalState>("mental");
    const energyBoost = mental && mental.energy < 6 ? 1.1 : 1;
    return [{
      id: "prospection-inactivity",
      source: "prospection",
      kind: "inactivity",
      intensity: Math.min(1, 0.7 * energyBoost + prospectionState.hoursSinceLastCall / 120),
      updatedAt: now() - prospectionState.hoursSinceLastCall * HOUR,
      context: prospectionState as unknown as Record<string, string | number>,
    }];
  },
};

// ─────────────────────────────────────────────────────────────
// CRM — deals chauds. Émet un rappel Planning à l'ouverture.
// ─────────────────────────────────────────────────────────────
interface Deal { name: string; stage: string; lastTouch: string; heat: number }
const deals: Deal[] = [
  { name: "Alpha Ventures", stage: "Proposition envoyée", lastTouch: "il y a 3 jours", heat: 0.78 },
];

export const crmModule: EthanModule<Deal[]> = {
  id: "crm",
  snapshot: () => deals,
  getSignals: () => deals.map((d) => ({
    id: `crm-${d.name}`,
    source: "crm",
    kind: "opportunity" as const,
    intensity: d.heat,
    updatedAt: now() - 3 * HOUR,
    context: { deal: d.name, stage: d.stage, lastTouch: d.lastTouch },
  })),
};

// ─────────────────────────────────────────────────────────────
// OBJECTIFS — arbre hiérarchique complet (mission → jour).
// Source de vérité pour le Dashboard, le Planning et Le Cerveau.
// ─────────────────────────────────────────────────────────────
interface ObjectifsSnapshot {
  all: ReadonlyArray<Objective>;
  today: Objective[];
  week: Objective[];
  focus: Objective | undefined;
}

export const objectifsModule: EthanModule<ObjectifsSnapshot> = {
  id: "objectifs",
  snapshot: () => ({
    all: readObjectives(),
    today: todayObjectives(),
    week: objectivesByHorizon("week"),
    focus: weeklyFocus(),
  }),
  getSignals: () => {
    // Un signal `goal_gap` par objectif hebdo en retard.
    // Le Cerveau agrège et compose l'action.
    return objectivesByHorizon("week").flatMap<Signal>((w) => {
      const gap = Math.max(0, (100 - w.progress) / 100);
      if (gap < 0.15) return [];
      return [{
        id: `goal-week-${w.id}`,
        source: "objectifs",
        kind: "goal_gap",
        intensity: gap,
        updatedAt: now() - 6 * HOUR,
        context: { objective: w.title, progress: w.progress, target: 100 },
      }];
    });
  },
};

// ─────────────────────────────────────────────────────────────
// PLANNING — reçoit les rappels CRM et les expose au Dashboard.
// ─────────────────────────────────────────────────────────────
interface Reminder { id: string; label: string; from: string; at: number }
const reminders: Reminder[] = [];

export const planningModule: EthanModule<Reminder[]> = {
  id: "planning",
  snapshot: () => reminders,
  getSignals: () => [],
  onEvent: (e) => {
    if (e.kind === "crm:followup_due") {
      const p = e.payload as { deal: string };
      reminders.push({ id: `r-${Date.now()}`, label: `Relancer ${p.deal}`, from: "crm", at: e.at });
      publish({ kind: "planning:reminder_created", source: "planning", at: now(), payload: p });
    }
  },
};

export const ALL_MODULES = [
  mentalModule,
  sportModule,
  habitudesModule,
  prospectionModule,
  crmModule,
  objectifsModule,
  planningModule,
];