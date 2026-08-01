/**
 * ETHAN — Le Cerveau
 * Moteur central de décision. Tous les modules alimentent le Cerveau
 * via des "signaux" typés. Le Cerveau agrège, score, et retourne
 * l'action recommandée du moment.
 */

export type ModuleSource =
  | "business"
  | "prospection"
  | "crm"
  | "pipeline"
  | "kpi"
  | "sport"
  | "sante"
  | "mental"
  | "habitudes"
  | "finances"
  | "patrimoine"
  | "investissements"
  | "vision"
  | "objectifs"
  | "journal"
  | "protocoles"
  | "planning"
  | "notifications";

export type SignalKind =
  | "inactivity"        // absence d'action sur une métrique clé
  | "streak_risk"       // rupture imminente d'une habitude
  | "deferred_task"     // tâche reportée plusieurs fois
  | "energy_state"      // niveau d'énergie / sommeil
  | "goal_gap"          // écart avec un objectif hebdo/mensuel
  | "opportunity"       // fenêtre de forte valeur (deal chaud, RDV)
  | "recovery_needed"   // récupération physique / mentale requise
  | "financial_alert";  // alerte cashflow ou budget

export interface Signal {
  id: string;
  source: ModuleSource;
  kind: SignalKind;
  /** Intensité brute du signal — 0 à 1. */
  intensity: number;
  /** Fraîcheur — timestamp ms de la dernière mise à jour. */
  updatedAt: number;
  /** Contexte lisible utilisé pour composer la justification. */
  context: Record<string, string | number>;
}

export type ActionCategory =
  | "business"
  | "performance"
  | "patrimoine"
  | "personnel";

export interface RecommendedAction {
  id: string;
  title: string;
  category: ActionCategory;
  /** Module d'origine du signal dominant. */
  source: ModuleSource;
  /** Pourquoi cette action maintenant — 1 à 2 phrases. */
  reason: string;
  /** Impact projeté sur les objectifs. */
  impact: string;
  /** Durée estimée en minutes. */
  estimatedMinutes: number;
  /** Score final calculé par le Cerveau — 0 à 100. */
  score: number;
  /** Signaux ayant contribué à la décision. */
  contributingSignals: Signal[];
  /** Route de destination lorsque l'utilisateur clique "Commencer". */
  to: string;
}