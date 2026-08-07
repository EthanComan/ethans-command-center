/**
 * ETHAN — Next Best Action (NBA).
 *
 * Principe fondateur : à chaque ouverture, ETHAN doit répondre à UNE
 * seule question — « Quelle est la meilleure chose que je puisse
 * faire maintenant ? ». L'utilisateur ne doit jamais avoir à
 * réfléchir à sa prochaine priorité.
 *
 * Architecture pensée pour devenir plus intelligente à chaque version :
 *
 *   V1 (actuelle) — Un ensemble de "contributeurs" (scorers) analyse
 *   des sources hétérogènes (signaux du Cerveau, dérives d'alignement,
 *   objectifs du jour) et propose chacun UN candidat scoré. Le
 *   meilleur devient l'action prioritaire ; les suivants deviennent
 *   des alternatives.
 *
 *   V2 — Ajouter un contributeur "ADN" (règles de décision, code
 *   d'honneur) qui pénalise ou boost les candidats. Ajouter un
 *   contributeur "énergie/contexte temporel" (heure, sommeil, HRV).
 *
 *   V3 — Passer les candidats à un moteur LLM local (Le Cerveau
 *   augmenté) qui compose une justification narrative et arbitre
 *   entre plusieurs options équivalentes en score.
 *
 *   V4 — Apprentissage : mémoriser les actions acceptées / reportées
 *   pour ré-entraîner les poids des contributeurs.
 *
 * Ajouter un contributeur = 1 fonction + 1 `register()`. Aucun
 * changement d'API pour les consommateurs.
 */

import { analyze as analyzeBrain } from "./engine";
import { computeAlignment } from "./alignment";
import { todayObjectives, ancestorsOf } from "@/modules/objectifs/data";
import { readTodayHabits } from "@/modules/habitudes/data";
import { directives as businessDirectives } from "@/modules/business/data";
import { verdicts as businessVerdicts } from "@/modules/business/coach";
import { HABIT_PRIORITY_WEIGHT, HABIT_CATEGORY_LABEL } from "@/modules/habitudes/types";
import { HORIZON_LABEL, type Priority } from "@/modules/objectifs/types";

const PRIORITY_WEIGHT: Record<Priority, number> = {
  critique: 5,
  haute: 4,
  moyenne: 3,
  basse: 2,
};

export interface NbaCandidate {
  id: string;
  /** Titre court, orienté action ("Verbe + objet"). */
  title: string;
  /** Contributeur d'origine — utile pour le debug et le tri. */
  source: string;
  /** Score 0-100. Le plus élevé gagne. */
  score: number;
  /** Pourquoi maintenant — 1 phrase. */
  why: string;
  /** À quel objectif de long terme cette action se rattache. */
  linkedTo?: string;
  /** Durée estimée en minutes. */
  estimatedMinutes: number;
  /** Route à ouvrir. */
  to: string;
  /** Impact projeté — 1 phrase. */
  impact?: string;
}

export interface NextBestAction {
  question: string;
  primary: NbaCandidate | null;
  alternatives: NbaCandidate[];
  /** Nombre de contributeurs ayant produit un candidat. */
  contributors: number;
  /** Signaux totaux analysés (Cerveau + alignement + objectifs). */
  sourcesAnalyzed: number;
  generatedAt: number;
}

type Contributor = () => NbaCandidate[];

const contributors: Contributor[] = [];

export function registerContributor(c: Contributor) {
  contributors.push(c);
}

/* ------------------------------------------------------------------ */
/*  Contributeurs V1                                                   */
/* ------------------------------------------------------------------ */

// 1) Signal dominant du Cerveau (moteur existant).
registerContributor(() => {
  const state = analyzeBrain();
  const all = state.primary ? [state.primary, ...state.secondary] : [];
  return all.map((a) => ({
    id: `brain:${a.id}`,
    title: a.title,
    source: "cerveau",
    score: a.score,
    why: a.reason,
    estimatedMinutes: a.estimatedMinutes,
    to: a.to,
    impact: a.impact,
  }));
});

// 2) Écart critique détecté par l'aligneur.
registerContributor(() => {
  const { drifts } = computeAlignment();
  return drifts.map((d) => ({
    id: `drift:${d.id}`,
    title: d.correction,
    source: "alignement",
    // Un écart de 70% → score 75 ; écart de 40% → score 55.
    score: Math.min(95, 35 + Math.round(d.gap * 0.6)),
    why: `Écart de ${d.gap}% sur « ${d.objective} ». ${d.risk}`,
    linkedTo: d.objective,
    estimatedMinutes: 90,
    to: "/objectifs",
    impact: "Remet la trajectoire au vert avant décrochage.",
  }));
});

// 3) Objectif du jour non complété — action ancrée à la hiérarchie.
registerContributor(() => {
  const todays = todayObjectives().filter((o) => o.progress < 100);
  return todays.map((o) => {
    const chain = ancestorsOf(o.id);
    const parent = chain[chain.length - 1];
    return {
      id: `today:${o.id}`,
      title: o.title,
      source: "objectifs",
      // Priorité brute (1-5) → 55 à 90.
      score: 45 + PRIORITY_WEIGHT[o.priority] * 9,
      why: parent
        ? `Rattaché à ${HORIZON_LABEL[parent.horizon]} · « ${parent.title} ».`
        : "Objectif du jour non encore complété.",
      linkedTo: parent?.title,
      estimatedMinutes: 45,
      to: "/objectifs",
      impact: "Chaque action du jour doit servir un objectif supérieur.",
    };
    });
});

// 4) Habitudes du jour — protéger les séries, privilégier fondamentales/mission.
registerContributor(() => {
  return readTodayHabits()
    .filter((i) => i.dueToday && !i.doneToday)
    .map((i) => {
      const h = i.habit;
      const streakBoost = Math.min(25, i.streak / 2);
      const missionBoost = h.category === "mission" ? 15 : h.category === "fondamentale" ? 10 : 0;
      const score = 40 + HABIT_PRIORITY_WEIGHT[h.priority] * 12 + streakBoost + missionBoost;
      return {
        id: `habit:${h.id}`,
        title: h.title,
        source: "habitudes",
        score: Math.min(98, Math.round(score)),
        why: i.streak > 0
          ? `Série de ${i.streak} jours en cours. La rompre coûte plus que l'exécuter maintenant.`
          : `Habitude ${HABIT_CATEGORY_LABEL[h.category] ?? h.category} du jour — elle construit l'identité à long terme.`,
        linkedTo: h.objectiveId,
        estimatedMinutes: h.estimatedMinutes,
        to: "/habitudes",
        impact: "Renforce la constance, l'axe Discipline et l'alignement avec la mission.",
      };
    });
});

/* ------------------------------------------------------------------ */
/*  Pipeline d'agrégation                                              */
/* ------------------------------------------------------------------ */

// 5) Directeur commercial — dossiers qui refroidissent, maillon faible,
//    leviers marketing et opérations off-market.
registerContributor(() =>
  businessDirectives()
    .slice(0, 4)
    .map((d) => ({
      id: `business:${d.id}`,
      title: d.title,
      source: "business",
      score: d.score,
      why: d.why,
      linkedTo: "Activité VEFA — financement de Renaître",
      estimatedMinutes: d.minutes,
      to: "/business",
      impact: d.impact,
    })),
);

// 6) Directeur commercial — verdicts : décisions et challenges, pas des tâches.
registerContributor(() =>
  businessVerdicts()
    .slice(0, 3)
    .map((v) => ({
      id: `verdict:${v.id}`,
      title: v.order,
      source: "directeur commercial",
      score: v.score,
      why: v.statement,
      linkedTo: "Activité VEFA — financement de Renaître",
      estimatedMinutes: v.minutes,
      to: "/business",
      impact: v.evidence,
    })),
);

export function computeNextBestAction(): NextBestAction {
  const buckets = contributors.map((c) => {
    try {
      return c();
    } catch {
      return [] as NbaCandidate[];
    }
  });
  const candidates = buckets.flat().sort((a, b) => b.score - a.score);

  // Dédup par titre pour éviter les doublons entre contributeurs.
  const seen = new Set<string>();
  const unique = candidates.filter((c) => {
    const k = c.title.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const [primary, ...rest] = unique;
  return {
    question: "Quelle est la meilleure chose que tu puisses faire maintenant ?",
    primary: primary ?? null,
    alternatives: rest.slice(0, 3),
    contributors: buckets.filter((b) => b.length > 0).length,
    sourcesAnalyzed: candidates.length,
    generatedAt: Date.now(),
  };
}