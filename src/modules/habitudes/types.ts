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
  frequency: HabitFrequency;
  recommendedTime?: string;
  priority: HabitPriority;
  estimatedMinutes: number;
  createdAt: string;
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
