/**
 * ETHAN — Destination financière.
 *
 * La direction n'est pas un souhait : c'est une cible chiffrée à partir
 * de laquelle tout se rétro-planifie. Objectif central : 400 000 € / mois.
 */

export const DESTINATION_MONTHLY_EUR = 400_000;

export interface Milestone {
  label: string;
  monthlyEUR: number;
  /** Part du chemin parcouru pour atteindre la destination. */
  share: number;
}

/** Paliers intermédiaires vers la destination. */
export const MILESTONES: Milestone[] = [
  { label: "Palier 1 — stabilité", monthlyEUR: 25_000, share: 0.0625 },
  { label: "Palier 2 — structure", monthlyEUR: 60_000, share: 0.15 },
  { label: "Palier 3 — machine", monthlyEUR: 150_000, share: 0.375 },
  { label: "Palier 4 — empire", monthlyEUR: 400_000, share: 1 },
];

export interface BackPlan {
  yearlyEUR: number;
  monthlyEUR: number;
  weeklyEUR: number;
  /** Nombre de ventes/mois nécessaires à commission moyenne donnée. */
  salesPerMonth: number;
  nextMilestone: Milestone;
  progress: number;
}

/**
 * Rétro-planification depuis la destination.
 * @param currentMonthlyEUR commissions mensuelles actuelles
 * @param avgCommissionEUR commission moyenne par vente
 */
export function backPlan(currentMonthlyEUR: number, avgCommissionEUR = 12_000): BackPlan {
  const progress = Math.min(100, Math.round((currentMonthlyEUR / DESTINATION_MONTHLY_EUR) * 100));
  const nextMilestone =
    MILESTONES.find((m) => m.monthlyEUR > currentMonthlyEUR) ?? MILESTONES[MILESTONES.length - 1];
  return {
    yearlyEUR: DESTINATION_MONTHLY_EUR * 12,
    monthlyEUR: DESTINATION_MONTHLY_EUR,
    weeklyEUR: Math.round(DESTINATION_MONTHLY_EUR / 4.33),
    salesPerMonth: Math.ceil(DESTINATION_MONTHLY_EUR / Math.max(avgCommissionEUR, 1)),
    nextMilestone,
    progress,
  };
}
