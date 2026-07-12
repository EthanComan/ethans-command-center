/**
 * ETHAN — Moteur d'alignement & de dérive.
 *
 * Agrège les données des modules pour répondre aux questions du
 * Centre de Commandement :
 *   - Score global d'alignement (0-100)
 *   - État de chaque domaine de vie (Business, Santé, Mental, Finances, Relations, Renaître)
 *   - Écarts (drift) entre objectifs & réalité
 *   - Plan de correction proposé
 */

import { readAll as readObjectives, byHorizon } from "@/modules/objectifs/data";
import { readRenaitre } from "@/modules/renaitre/data";

export type DomainStatus = "excellent" | "bon" | "attention" | "critique";

export interface DomainState {
  id: "business" | "sante" | "mental" | "finances" | "relations" | "renaitre";
  label: string;
  score: number; // 0-100
  status: DomainStatus;
  trend: "up" | "flat" | "down";
  summary: string;
}

export interface Drift {
  id: string;
  objective: string;
  gap: number; // % d'écart
  risk: string;
  correction: string;
}

export interface AlignmentReport {
  globalScore: number;
  domains: DomainState[];
  drifts: Drift[];
  identityToday: string;
  missionToday: string;
  risksIfNoAction: string[];
}

function statusFromScore(s: number): DomainStatus {
  if (s >= 80) return "excellent";
  if (s >= 60) return "bon";
  if (s >= 40) return "attention";
  return "critique";
}

export function computeAlignment(): AlignmentReport {
  const objectives = readObjectives();
  const weeks = byHorizon("week");
  const months = byHorizon("month");
  const quarters = byHorizon("quarter");

  // Score par domaine — simple agrégation en V1 (modules cross-influencés).
  const businessObjs = objectives.filter((o) => o.linkedModules.some((m) => ["business", "prospection", "crm", "pipeline", "kpi"].includes(m)));
  const businessScore = avg(businessObjs.map((o) => o.progress));

  const santeScore = 62; // V2 : depuis snapshot sante
  const mentalScore = 58; // V2 : depuis snapshot mental (énergie 6.4/10)
  const financesScore = 45;
  const relationsScore = 55;
  const renaitreScore = avg(readRenaitre().pillars.map((p) => p.progress));

  const domains: DomainState[] = [
    { id: "renaitre", label: "Renaître", score: renaitreScore, status: statusFromScore(renaitreScore), trend: "flat", summary: "Fondations à poser — mission de vie en attente d'un premier geste concret." },
    { id: "business", label: "Business", score: businessScore, status: statusFromScore(businessScore), trend: "up", summary: "Pipeline en construction, cadence de prospection en retard." },
    { id: "sante", label: "Santé", score: santeScore, status: statusFromScore(santeScore), trend: "flat", summary: "Récupération basse — HRV faible, sommeil 6h1." },
    { id: "mental", label: "Mental", score: mentalScore, status: statusFromScore(mentalScore), trend: "down", summary: "Énergie 6.4/10 — commencer par des tâches mécaniques." },
    { id: "finances", label: "Finances", score: financesScore, status: statusFromScore(financesScore), trend: "flat", summary: "Réserve à consolider avant nouveaux engagements." },
    { id: "relations", label: "Relations", score: relationsScore, status: statusFromScore(relationsScore), trend: "flat", summary: "Temps famille à protéger cette semaine." },
  ];

  const globalScore = Math.round(avg(domains.map((d) => d.score)));

  const drifts: Drift[] = [];
  for (const w of weeks) {
    if (w.progress < 60) {
      drifts.push({
        id: `drift-${w.id}`,
        objective: w.title,
        gap: 100 - w.progress,
        risk: "Impact direct sur l'objectif mensuel parent.",
        correction: `Bloquer 90 min demain matin pour rattraper « ${w.title} ».`,
      });
    }
  }
  for (const m of months) {
    if (m.progress < 50) {
      drifts.push({
        id: `drift-${m.id}`,
        objective: m.title,
        gap: 100 - m.progress,
        risk: "Sans correction cette semaine, l'objectif du trimestre décroche.",
        correction: `Redéfinir la cadence hebdo pour tenir « ${m.title} ».`,
      });
    }
  }
  for (const q of quarters) {
    if (q.progress < 40) {
      drifts.push({
        id: `drift-${q.id}`,
        objective: q.title,
        gap: 100 - q.progress,
        risk: "Le trimestre bascule dans le rouge — trajectoire annuelle menacée.",
        correction: `Réunion de recadrage : réduire la charge secondaire, concentrer sur « ${q.title} ».`,
      });
    }
  }

  return {
    globalScore,
    domains,
    drifts: drifts.slice(0, 5),
    identityToday: "L'homme qui construit calmement, sans céder à l'urgence.",
    missionToday: "Faire un pas visible pour Renaître + tenir la cadence business.",
    risksIfNoAction: [
      "Cadence de prospection sous la cible : deal Alpha fragilisé.",
      "Mission Renaître reste théorique une semaine de plus.",
      "Dette de sommeil qui compromet la séance de demain.",
    ],
  };
}

function avg(xs: number[]): number {
  if (xs.length === 0) return 0;
  return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
}