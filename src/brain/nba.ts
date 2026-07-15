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
import { HORIZON_LABEL } from "@/modules/objectifs/types";

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
      score: 45 + o.priority * 9,
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

/* ------------------------------------------------------------------ */
/*  Pipeline d'agrégation                                              */
/* ------------------------------------------------------------------ */

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