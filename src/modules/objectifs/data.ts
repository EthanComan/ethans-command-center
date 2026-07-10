/**
 * ETHAN — Données & API du module Objectifs.
 *
 * V1 : arbre en mémoire (seed cohérent avec la Mission « Renaître »).
 * V2 : `readAll()` / `write()` seront branchés à Lovable Cloud via
 * `createStore()` sans modifier les consommateurs.
 */

import type { Objective, Horizon } from "./types";
import { HORIZON_ORDER } from "./types";

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const addMonths = (d: Date, n: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
};

const tree: Objective[] = [
  {
    id: "mission",
    horizon: "mission",
    parentId: null,
    title: "Renaître — devenir la version irréductible de moi-même",
    description:
      "Construire une vie de puissance calme : liberté financière, corps performant, esprit clair, transmission durable.",
    progress: 12,
    targetDate: null,
    priority: "critique",
    kpis: [],
    linkedModules: ["vision", "protocoles", "journal"],
  },
  {
    id: "vision",
    horizon: "vision",
    parentId: "mission",
    title: "Un homme libre, ancré, et à la tête d'un empire discret",
    description:
      "Indépendance totale (temps, lieu, décision), corps d'athlète, famille solide, œuvre transmissible.",
    progress: 15,
    targetDate: null,
    priority: "critique",
    kpis: [],
    linkedModules: ["vision", "patrimoine", "sante"],
  },
  {
    id: "10y-empire",
    horizon: "10y",
    parentId: "vision",
    title: "Bâtir un patrimoine de 10 M€ et une œuvre reconnue",
    progress: 4,
    targetDate: iso(addMonths(today, 12 * 10)),
    priority: "critique",
    kpis: [
      { label: "Patrimoine net", current: 180000, target: 10000000, unit: "€" },
    ],
    linkedModules: ["patrimoine", "investissements", "business"],
  },
  {
    id: "5y-business",
    horizon: "5y",
    parentId: "10y-empire",
    title: "Business à 1 M€ ARR — équipe de 8, marge > 40 %",
    progress: 8,
    targetDate: iso(addMonths(today, 12 * 5)),
    priority: "haute",
    kpis: [
      { label: "ARR", current: 80000, target: 1000000, unit: "€" },
      { label: "Équipe", current: 1, target: 8 },
    ],
    linkedModules: ["business", "crm", "pipeline"],
  },
  {
    id: "year-ca",
    horizon: "year",
    parentId: "5y-business",
    title: "Passer le cap des 250 K€ de CA cette année",
    progress: 32,
    targetDate: iso(new Date(today.getFullYear(), 11, 31)),
    priority: "critique",
    kpis: [
      { label: "CA annuel", current: 80000, target: 250000, unit: "€" },
      { label: "Clients signés", current: 6, target: 20 },
    ],
    linkedModules: ["business", "prospection", "crm", "kpi"],
  },
  {
    id: "quarter-pipeline",
    horizon: "quarter",
    parentId: "year-ca",
    title: "Remplir un pipeline de 400 K€ ce trimestre",
    progress: 45,
    targetDate: iso(addMonths(today, 3)),
    priority: "haute",
    kpis: [
      { label: "Pipeline pondéré", current: 180000, target: 400000, unit: "€" },
    ],
    linkedModules: ["prospection", "crm", "pipeline"],
  },
  {
    id: "month-prospection",
    horizon: "month",
    parentId: "quarter-pipeline",
    title: "100 prospects qualifiés ce mois-ci",
    progress: 38,
    targetDate: iso(addDays(today, 30)),
    priority: "haute",
    kpis: [
      { label: "Prospects qualifiés", current: 38, target: 100 },
      { label: "RDV pris", current: 9, target: 25 },
    ],
    linkedModules: ["prospection", "crm"],
  },
  {
    id: "week-calls",
    horizon: "week",
    parentId: "month-prospection",
    title: "25 appels de prospection cette semaine",
    progress: 44,
    targetDate: iso(addDays(today, 7)),
    priority: "critique",
    kpis: [
      { label: "Appels", current: 11, target: 25 },
      { label: "RDV", current: 2, target: 6 },
    ],
    linkedModules: ["prospection", "planning"],
  },
  {
    id: "day-alpha",
    horizon: "day",
    parentId: "week-calls",
    title: "Finaliser la proposition Alpha Ventures",
    progress: 60,
    targetDate: iso(today),
    priority: "critique",
    kpis: [],
    linkedModules: ["crm", "business"],
  },
  {
    id: "day-deadlift",
    horizon: "day",
    parentId: "week-calls",
    title: "Séance Deadlift — 5x5 @ 140 kg",
    progress: 0,
    targetDate: iso(today),
    priority: "haute",
    kpis: [],
    linkedModules: ["sport", "sante"],
  },
  {
    id: "day-journal",
    horizon: "day",
    parentId: "week-calls",
    title: "Journal du soir + revue de la journée",
    progress: 0,
    targetDate: iso(today),
    priority: "moyenne",
    kpis: [],
    linkedModules: ["journal", "mental"],
  },
];

export function readAll(): ReadonlyArray<Objective> {
  return tree;
}

export function get(id: string): Objective | undefined {
  return tree.find((o) => o.id === id);
}

export function childrenOf(id: string): Objective[] {
  return tree.filter((o) => o.parentId === id);
}

export function byHorizon(h: Horizon): Objective[] {
  return tree.filter((o) => o.horizon === h);
}

export function ancestorsOf(id: string): Objective[] {
  const chain: Objective[] = [];
  let cur = get(id);
  while (cur && cur.parentId) {
    const parent = get(cur.parentId);
    if (!parent) break;
    chain.unshift(parent);
    cur = parent;
  }
  return chain;
}

/** Objectifs du jour — consommés par le Dashboard. */
export function todayObjectives(): Objective[] {
  return byHorizon("day");
}

/** Priorité #1 de la semaine — utile au Cerveau. */
export function weeklyFocus(): Objective | undefined {
  return byHorizon("week").sort((a, b) => a.progress - b.progress)[0];
}

export { HORIZON_ORDER };