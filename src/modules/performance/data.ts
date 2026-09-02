/**
 * ETHAN — Module Performance (sport, santé, mental réunis).
 *
 * Le corps est l'infrastructure de l'exécution. Ce module n'affiche pas
 * des statistiques : il dit si le système physique et mental peut encaisser
 * l'ambition commerciale de la semaine.
 */

import { computeConsistency, readAllHabits } from "@/modules/habitudes/data";

export type Pillar = "sport" | "sante" | "mental";

export interface PerfMetric {
  id: string;
  pillar: Pillar;
  label: string;
  value: number;
  unit: string;
  target: number;
  /** true si "plus haut = mieux" */
  higherIsBetter: boolean;
  note: string;
}

export const PILLAR_LABEL: Record<Pillar, string> = {
  sport: "Sport",
  sante: "Santé",
  mental: "Mental",
};

export const METRICS: PerfMetric[] = [
  { id: "seances", pillar: "sport", label: "Séances / semaine", value: 3, unit: "", target: 4, higherIsBetter: true, note: "Musculation + cardio. La régularité prime sur l'intensité." },
  { id: "volume", pillar: "sport", label: "Volume hebdo", value: 4.5, unit: "h", target: 5, higherIsBetter: true, note: "Temps réellement sous tension, pas temps passé à la salle." },
  { id: "pas", pillar: "sante", label: "Pas / jour", value: 7_400, unit: "", target: 9_000, higherIsBetter: true, note: "Marche = récupération active entre les rendez-vous." },
  { id: "sommeil", pillar: "sante", label: "Sommeil moyen", value: 6.6, unit: "h", target: 7.5, higherIsBetter: true, note: "Premier levier de décision : sous 7h, le jugement commercial baisse." },
  { id: "hydratation", pillar: "sante", label: "Hydratation", value: 2.1, unit: "L", target: 2.5, higherIsBetter: true, note: "Impacte directement la clarté en fin de journée." },
  { id: "focus", pillar: "mental", label: "Blocs de focus tenus", value: 6, unit: "/sem", target: 10, higherIsBetter: true, note: "Deep work réellement protégé, sans téléphone." },
  { id: "stress", pillar: "mental", label: "Charge mentale", value: 6, unit: "/10", target: 4, higherIsBetter: false, note: "Au-dessus de 5, tu réagis au lieu de diriger." },
  { id: "clarte", pillar: "mental", label: "Clarté au réveil", value: 7, unit: "/10", target: 8, higherIsBetter: true, note: "Indicateur avancé de la qualité des décisions du jour." },
];

export function pillarScore(pillar: Pillar): number {
  const items = METRICS.filter((m) => m.pillar === pillar);
  if (items.length === 0) return 0;
  const total = items.reduce((sum, m) => {
    const ratio = m.higherIsBetter ? m.value / m.target : m.target / Math.max(m.value, 0.1);
    return sum + Math.min(1, ratio);
  }, 0);
  return Math.round((total / items.length) * 100);
}

/** Capacité d'exécution disponible : 0-100. */
export function energyIndex(): number {
  const base = Math.round((pillarScore("sport") + pillarScore("sante") + pillarScore("mental")) / 3);
  const habits = readAllHabits();
  const consistency =
    habits.length === 0
      ? 0
      : Math.round(habits.reduce((s, h) => s + computeConsistency(h.id).rate, 0) / habits.length);
  return Math.round(base * 0.7 + consistency * 0.3);
}

export interface PerfVerdict {
  level: "rouge" | "orange" | "vert";
  title: string;
  why: string;
  order: string;
}

export function performanceVerdict(): PerfVerdict {
  const index = energyIndex();
  const weakest = (["sport", "sante", "mental"] as Pillar[])
    .map((p) => ({ p, score: pillarScore(p) }))
    .sort((a, b) => a.score - b.score)[0];

  if (index < 55) {
    return {
      level: "rouge",
      title: `Capacité d'exécution ${index}/100`,
      why: `Le pilier ${PILLAR_LABEL[weakest.p]} (${weakest.score}/100) plafonne tout le reste. Aucun objectif commercial ne tient sur ce socle.`,
      order: "Cette semaine : dormir 7h30 minimum et sanctuariser 3 séances. Le business suivra.",
    };
  }
  if (index < 75) {
    return {
      level: "orange",
      title: `Capacité d'exécution ${index}/100`,
      why: `${PILLAR_LABEL[weakest.p]} est le maillon faible (${weakest.score}/100). Tu tiens, mais sans marge pour une semaine intense.`,
      order: `Corriger un seul indicateur ${PILLAR_LABEL[weakest.p].toLowerCase()} sur 7 jours, pas trois.`,
    };
  }
  return {
    level: "vert",
    title: `Capacité d'exécution ${index}/100`,
    why: "Le socle physique et mental supporte une charge commerciale élevée.",
    order: "Utilise cette fenêtre : place tes rendez-vous les plus difficiles cette semaine.",
  };
}
