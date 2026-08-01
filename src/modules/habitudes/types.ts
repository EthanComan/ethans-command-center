/**
 * ETHAN — Module Habitudes.
 * Types du moteur de comportements quotidiens.
 */

export type HabitDomain =
  | "business"
  | "sante"
  | "sport"
  | "spiritualite"
  | "lecture"
  | "developpement_personnel"
  | "relations"
  | "finances"
  | "renaitre";

export type HabitCategory =
  | "fondamentale"
  | "performance"
  | "mission"
  | "personnalisee";

export type HabitPriority = "critique" | "haute" | "moyenne" | "basse";

/**
 * Nature de l'habitude — distincte de la catégorie (domaine d'effort).
 * - obligatoire  : non négociable, elle définit l'homme. Jamais masquée.
 * - progression  : elle fait monter un axe. Peut être ajustée selon la phase.
 * - contextuelle : elle n'apparaît que dans certaines phases ou pour un objectif actif.
 */
export type HabitNature = "obligatoire" | "progression" | "contextuelle";

/** Phases de vie — activent / désactivent des ensembles d'habitudes. */
export type HabitPhase =
  | "standard"
  | "lancement"
  | "prospection_intensive"
  | "vacances"
  | "recuperation"
  | "renaitre";

/** Ce qu'une habitude alimente concrètement dans le système. */
export type HabitLinkKind = "objectif" | "kpi" | "projet" | "renaitre" | "progression";

export interface HabitLink {
  kind: HabitLinkKind;
  /** Identifiant dans le module cible (objectiveId, kpiId, axe de progression...). */
  id: string;
  label: string;
  /** Contribution lisible : « +5 appels / semaine », « axe Discipline +2 ». */
  contribution: string;
  /** Poids de la contribution 0-1 — utilisé pour le calcul d'impact. */
  weight: number;
  /** Route à ouvrir pour voir la cible. */
  to?: string;
}

/** Réglages de notification propres à une habitude. */
export interface HabitNotification {
  enabled: boolean;
  /** Minutes avant l'heure recommandée pour le rappel d'approche. */
  leadMinutes: number;
  /** Relance si l'habitude est toujours non faite X minutes après l'heure. */
  missedAfterMinutes: number;
  /** Escalade en notification critique si la série est en danger. */
  escalateOnStreakRisk: boolean;
}

export type HabitFrequency =
  | { kind: "daily" }
  | { kind: "weekly"; days: number[] }   // 0 = dimanche, 1 = lundi ... 6 = samedi
  | { kind: "monthly"; dates: number[] }; // 1-31

export type HabitLogStatus = "done" | "missed" | "partial" | "excused";

export interface Habit {
  id: string;
  title: string;
  why: string;
  objectiveId?: string;
  domain: HabitDomain;
  category: HabitCategory;
  nature: HabitNature;
  frequency: HabitFrequency;
  recommendedTime?: string;
  priority: HabitPriority;
  estimatedMinutes: number;
  createdAt: string;
  /** Ce que l'habitude alimente dans le système (objectifs, KPI, projets, Renaître, axes). */
  links: HabitLink[];
  /**
   * Poids d'impact 1-10. Une habitude critique ne pèse pas comme une secondaire
   * dans les scores d'impact, la NBA et la Progression.
   */
  impactWeight: number;
  /** Phases dans lesquelles l'habitude est active. Vide/absent = toutes les phases. */
  phases?: HabitPhase[];
  /** Phases dans lesquelles l'habitude est explicitement suspendue. */
  pausedInPhases?: HabitPhase[];
  notification?: HabitNotification;
}

export interface HabitLog {
  habitId: string;
  date: string;
  status: HabitLogStatus;
  note?: string;
  doneAt?: string;
}

export interface HabitForToday {
  habit: Habit;
  dueToday: boolean;
  doneToday: boolean;
  log?: HabitLog;
  streak: number;
  consistency: ConsistencyProfile;
  /** Active dans la phase courante. */
  activeInPhase: boolean;
  impact: ImpactProfile;
}

export interface ImpactProfile {
  /** Poids brut 1-10. */
  weight: number;
  /** Constance pondérée par le poids — 0-100. */
  weightedScore: number;
  /** Impact réellement délivré au système sur 30 jours — 0-100. */
  delivered30: number;
  /** Coût d'un abandon : ce qui casse si l'habitude tombe. */
  costOfSkipping: number;
  /** Nombre d'éléments du système alimentés. */
  systemLinks: number;
}

export interface ConsistencyProfile {
  last7Days: number;
  last30Days: number;
  last90Days: number;
  last365Days: number;
  currentStreak: number;
  longestStreak: number;
  weeklyTarget: number;
  weeklyDone: number;
}

export interface HabitSnapshot {
  habits: Habit[];
  logs: HabitLog[];
  today: HabitForToday[];
  streaks: Record<string, number>;
  consistency: Record<string, ConsistencyProfile>;
  impact: Record<string, ImpactProfile>;
  phase: HabitPhase;
}

export const HABIT_DOMAIN_LABEL: Record<HabitDomain, string> = {
  business: "Business",
  sante: "Santé",
  sport: "Sport",
  spiritualite: "Spiritualité",
  lecture: "Lecture",
  developpement_personnel: "Développement personnel",
  relations: "Relations",
  finances: "Finances",
  renaitre: "Renaître",
};

export const HABIT_CATEGORY_LABEL: Record<HabitCategory, string> = {
  fondamentale: "Fondamentale",
  performance: "Performance",
  mission: "Mission",
  personnalisee: "Personnalisée",
};

export const HABIT_PRIORITY_WEIGHT: Record<HabitPriority, number> = {
  critique: 4,
  haute: 3,
  moyenne: 2,
  basse: 1,
};

export const HABIT_NATURE_LABEL: Record<HabitNature, string> = {
  obligatoire: "Non négociable",
  progression: "Progression",
  contextuelle: "Contextuelle",
};

export const HABIT_LINK_LABEL: Record<HabitLinkKind, string> = {
  objectif: "Objectif",
  kpi: "KPI",
  projet: "Projet",
  renaitre: "Renaître",
  progression: "Progression",
};

export interface PhaseDefinition {
  id: HabitPhase;
  label: string;
  description: string;
  /** Domaines amplifiés pendant la phase (boost d'impact et de priorité). */
  boost: HabitDomain[];
  /** Domaines mis en sourdine (habitudes de progression masquées). */
  mute: HabitDomain[];
}

export const HABIT_PHASES: PhaseDefinition[] = [
  {
    id: "standard",
    label: "Rythme standard",
    description: "Le socle complet. Toutes les habitudes actives par défaut.",
    boost: [],
    mute: [],
  },
  {
    id: "lancement",
    label: "Période de lancement",
    description: "Toute l'énergie sur la mise sur le marché. Le reste passe en maintien.",
    boost: ["business", "developpement_personnel"],
    mute: ["lecture", "relations"],
  },
  {
    id: "prospection_intensive",
    label: "Prospection intensive",
    description: "Le pipeline avant tout : volume d'appels, relances, réseau.",
    boost: ["business", "relations"],
    mute: ["lecture"],
  },
  {
    id: "vacances",
    label: "Vacances",
    description: "On garde l'identité, on relâche la performance.",
    boost: ["spiritualite", "lecture", "relations"],
    mute: ["business", "finances"],
  },
  {
    id: "recuperation",
    label: "Récupération",
    description: "Le corps et le mental d'abord. Charge réduite, sommeil protégé.",
    boost: ["sante", "spiritualite"],
    mute: ["business", "sport"],
  },
  {
    id: "renaitre",
    label: "Développement de Renaître",
    description: "La mission passe en tête : structuration, financement, partenaires.",
    boost: ["renaitre", "relations"],
    mute: ["lecture"],
  },
];

export const DEFAULT_NOTIFICATION: HabitNotification = {
  enabled: true,
  leadMinutes: 10,
  missedAfterMinutes: 90,
  escalateOnStreakRisk: true,
};
