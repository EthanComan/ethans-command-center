/**
 * ETHAN — Module OS Habitudes.
 *
 * Adapte le module Habitudes au contrat EthanModule.
 * Alimente Le Cerveau en signaux et réagit aux événements du système.
 */

import { defineModule } from "@/core/define-module";
import {
  readAllHabits,
  readAllLogs,
  readTodayHabits,
  snapshotHabits,
} from "@/modules/habitudes/data";
import type { HabitSnapshot } from "@/modules/habitudes/types";
import type { Signal } from "@/brain/types";

const HOUR = 60 * 60 * 1000;
const now = () => Date.now();

export const habitudesModule = defineModule<HabitSnapshot>({
  id: "habitudes",
  snapshot: () => snapshotHabits(),
  getSignals: () => {
    const today = readTodayHabits();
    const signals: Signal[] = [];

    for (const item of today) {
      if (item.doneToday) continue;
      if (!item.dueToday) continue;

      // Priorité de protection de série : plus la série est longue, plus on veut la préserver.
      const streakRisk = Math.min(0.95, 0.35 + item.streak / 25);

      // Boost mission/fondamentale : ces habitues sont l'ADN du système.
      const missionBoost = item.habit.category === "mission" ? 1.25 : 1;
      const fundamentalBoost = item.habit.category === "fondamentale" ? 1.15 : 1;

      signals.push({
        id: `habit-${item.habit.id}`,
        source: "habitudes",
        kind: "streak_risk",
        intensity: Math.min(0.98, streakRisk * missionBoost * fundamentalBoost),
        updatedAt: now() - 20 * HOUR,
        context: {
          habit: item.habit.title,
          streak: item.streak,
          category: item.habit.category,
          domain: item.habit.domain,
          priority: item.habit.priority,
          estimatedMinutes: item.habit.estimatedMinutes,
        },
      });

      // Si une habitude fondamentale est manquée dans la semaine, signal d'écart.
      if (
        (item.habit.category === "fondamentale" || item.habit.category === "mission") &&
        item.consistency.weeklyDone < item.consistency.weeklyTarget
      ) {
        const gap = item.consistency.weeklyTarget - item.consistency.weeklyDone;
        signals.push({
          id: `habit-gap-${item.habit.id}`,
          source: "habitudes",
          kind: "goal_gap",
          intensity: Math.min(0.95, 0.4 + gap * 0.15),
          updatedAt: now() - 6 * HOUR,
          context: {
            objective: item.habit.title,
            progress: Math.round((item.consistency.weeklyDone / item.consistency.weeklyTarget) * 100),
            target: 100,
            gap,
          },
        });
      }
    }

    return signals;
  },
  onEvent: (event) => {
    // Si un objectif progresse, on pourrait rafraîchir les liens habitudes/objectifs.
    // V2 : mise à jour automatique des objectiveId quand l'arbre d'objectifs change.
    if (event.kind === "objectifs:progress_updated") {
      // Trigger de recalcul : les snapshots sont lus à la volée, donc rien à faire ici.
    }
  },
});
