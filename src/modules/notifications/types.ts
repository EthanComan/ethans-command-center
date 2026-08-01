/**
 * ETHAN — Module Notifications.
 *
 * Deux niveaux :
 *  1. Interne  — le flux de notifications visible dans ETHAN.
 *  2. Natif    — les notifications système (téléphone, ordinateur, montre)
 *                délivrées même quand l'application est fermée, via la
 *                Notification API et le service worker (app installée).
 */

export type NotificationChannel = "in_app" | "native";

export type NotificationPriority = "critique" | "haute" | "normale" | "silencieuse";

export type NotificationKind =
  | "habit_upcoming"      // rappel avant l'heure recommandée
  | "habit_missed"        // relance : toujours non faite
  | "habit_streak_risk"   // escalade : série en danger
  | "habit_done"          // confirmation / renforcement
  | "phase_changed"       // la phase de vie a changé
  | "daily_briefing"      // brief du matin
  | "evening_review";     // revue du soir

export interface EthanNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  priority: NotificationPriority;
  /** Timestamp de déclenchement prévu (ms). */
  at: number;
  /** Route ouverte au clic. */
  to: string;
  habitId?: string;
  channels: NotificationChannel[];
  /** Actions proposées dans la notification native. */
  actions?: { id: string; label: string }[];
}

export interface DeliveredNotification extends EthanNotification {
  deliveredAt: number;
  read: boolean;
}

export interface QuietHours {
  enabled: boolean;
  /** "22:30" */
  from: string;
  /** "06:00" */
  to: string;
}

export interface NotificationPrefs {
  /** Interrupteur général du module. */
  enabled: boolean;
  /** Notifications système (OS / téléphone / montre). */
  nativeEnabled: boolean;
  /** Priorité minimale délivrée en natif. */
  minNativePriority: NotificationPriority;
  quietHours: QuietHours;
  /** Les habitudes non négociables passent même en heures silencieuses. */
  bypassQuietForCritical: boolean;
  dailyBriefingAt: string;
  eveningReviewAt: string;
  kinds: Record<NotificationKind, boolean>;
}

export const PRIORITY_RANK: Record<NotificationPriority, number> = {
  critique: 3,
  haute: 2,
  normale: 1,
  silencieuse: 0,
};

export const KIND_LABEL: Record<NotificationKind, string> = {
  habit_upcoming: "Rappel d'habitude",
  habit_missed: "Relance — habitude non faite",
  habit_streak_risk: "Série en danger",
  habit_done: "Renforcement",
  phase_changed: "Changement de phase",
  daily_briefing: "Brief du matin",
  evening_review: "Revue du soir",
};

export const DEFAULT_PREFS: NotificationPrefs = {
  enabled: true,
  nativeEnabled: false,
  minNativePriority: "normale",
  quietHours: { enabled: true, from: "22:30", to: "06:00" },
  bypassQuietForCritical: true,
  dailyBriefingAt: "06:15",
  eveningReviewAt: "21:15",
  kinds: {
    habit_upcoming: true,
    habit_missed: true,
    habit_streak_risk: true,
    habit_done: false,
    phase_changed: true,
    daily_briefing: true,
    evening_review: true,
  },
};
