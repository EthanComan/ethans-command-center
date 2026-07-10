/**
 * ETHAN — Module Objectifs.
 *
 * Cœur du système : toute action de l'application doit pouvoir remonter
 * jusqu'à un objectif, et tout objectif doit remonter à la Mission de vie.
 *
 * Hiérarchie (9 horizons, du plus lointain au plus proche) :
 *   mission → vision → 10y → 5y → year → quarter → month → week → day
 *
 * Chaque nœud possède un `parentId` qui pointe vers le nœud du niveau
 * supérieur. Un nœud `day` remonte donc, de proche en proche, jusqu'à la
 * Mission. C'est ce qui permet à ETHAN de dire, pour toute tâche du jour,
 * *pourquoi* elle existe.
 */

import type { ModuleId } from "@/core/contracts";

export type Horizon =
  | "mission"
  | "vision"
  | "10y"
  | "5y"
  | "year"
  | "quarter"
  | "month"
  | "week"
  | "day";

export const HORIZON_ORDER: Horizon[] = [
  "mission",
  "vision",
  "10y",
  "5y",
  "year",
  "quarter",
  "month",
  "week",
  "day",
];

export const HORIZON_LABEL: Record<Horizon, string> = {
  mission: "Mission de vie",
  vision: "Vision de vie",
  "10y": "Horizon 10 ans",
  "5y": "Horizon 5 ans",
  year: "Année",
  quarter: "Trimestre",
  month: "Mois",
  week: "Semaine",
  day: "Jour",
};

export type Priority = "critique" | "haute" | "moyenne" | "basse";

export interface ObjectiveKPI {
  label: string;
  current: number;
  target: number;
  unit?: string;
}

export interface Objective {
  id: string;
  horizon: Horizon;
  parentId: string | null;
  title: string;
  description?: string;
  /** 0 à 100 — recalculé automatiquement à partir des enfants s'ils existent. */
  progress: number;
  /** Date cible ISO (YYYY-MM-DD). `null` pour la Mission (intemporel). */
  targetDate: string | null;
  priority: Priority;
  kpis: ObjectiveKPI[];
  /** Modules alimentant / alimentés par cet objectif. */
  linkedModules: ModuleId[];
}