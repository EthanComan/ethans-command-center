/**
 * ETHAN — Business : le directeur commercial qui décide.
 *
 * Cette couche ne présente pas des données : elle rend des verdicts.
 * Chaque verdict = un constat chiffré + une décision + un ordre.
 * Trois registres : DIAGNOSTIC (ce qui se passe), DÉCISION (ce qu'on fait
 * cette semaine), CHALLENGE (ce qu'on arrête de faire).
 */

import { DEALS, weakestLink, analyzeFunnel, formatEUR } from "./data";
import { STAGE_LABEL } from "./types";
import {
  activityGaps,
  ACTIVITY_LABEL,
  analyzeSources,
  byChannel,
  byDeveloper,
  byCity,
  byTypology,
  commissionsPendingEUR,
  sourceContrast,
  temperatureMix,
  temperatureOf,
  weekHours,
} from "./analytics";

export type VerdictTone = "diagnostic" | "decision" | "challenge";

export interface Verdict {
  id: string;
  tone: VerdictTone;
  /** Ce qu'ETHAN dit, à la première personne du directeur commercial. */
  statement: string;
  /** La preuve chiffrée derrière la phrase. */
  evidence: string;
  /** L'ordre concret, non négociable. */
  order: string;
  /** 0-100 — priorité de la décision. */
  score: number;
  minutes: number;
}

/* ------------------------------------------------------------------ */

function tempVerdict(): Verdict | null {
  const mix = temperatureMix();
  const hot = mix.chaud;
  const cold = mix.froid;
  if (hot === 0) return null;
  return {
    id: "temp-focus",
    tone: "diagnostic",
    statement: `Tu as ${hot} prospects chauds et ${cold} prospects froids. Tu ne dois pas les traiter avec la même énergie.`,
    evidence: `Un prospect chaud non rappelé sous 48 h perd en moyenne la moitié de sa probabilité. Les froids, eux, ne se réchauffent pas par la volonté : ils se réchauffent par le temps et le contenu.`,
    order: `Bloque la matinée sur les ${Math.min(hot, 12)} prospects les plus chauds. Les froids passent en séquence automatique, pas en appel manuel.`,
    score: 88,
    minutes: 120,
  };
}

function sourceVerdict(): Verdict | null {
  const c = sourceContrast();
  if (!c) return null;
  return {
    id: "source-contrast",
    tone: "decision",
    statement: `${c.winner.source} convertit ${c.ratio.toFixed(1)}× mieux que ${c.loser.source}. Continuer à répartir ton temps à l'identique est une erreur de gestion.`,
    evidence: `${c.winner.source} : ${c.winner.convRdv} % de leads en rendez-vous, ${formatEUR(c.winner.valuePerLeadEUR)} de commission par lead. ${c.loser.source} : ${c.loser.convRdv} % et ${formatEUR(c.loser.valuePerLeadEUR)} par lead.`,
    order: `Bascule le budget et le temps de ${c.loser.source} vers ${c.winner.source}. Même volume de production, ciblage identique, mesure à 14 jours.`,
    score: 82,
    minutes: 45,
  };
}

function funnelVerdict(): Verdict | null {
  const weak = weakestLink();
  if (!weak || weak.gap >= 0) return null;
  const steps = analyzeFunnel();
  const idx = steps.findIndex((s) => s.from === weak.from);
  const downstream = steps.slice(idx + 1);
  return {
    id: "funnel-weak",
    tone: "decision",
    statement: `Ton taux de transformation chute entre « ${weak.from} » et « ${weak.to} ». C'est là, et nulle part ailleurs, que se joue ton chiffre.`,
    evidence: `${weak.rate} % contre ${weak.target} % attendus (${weak.gap} points). ${downstream.length} étapes en aval subissent mécaniquement ce plafond.`,
    order: `Cette semaine, tu n'améliores rien d'autre. Réécris ton passage « ${weak.from} → ${weak.to} », teste-le sur 10 dossiers, mesure.`,
    score: 90,
    minutes: 60,
  };
}

function activityVerdict(): Verdict | null {
  const gaps = activityGaps();
  const over = gaps[0];
  const under = gaps[gaps.length - 1];
  if (!over || !under || over.gap < 8) return null;
  return {
    id: "activity-mix",
    tone: "challenge",
    statement: `Tu fais trop de ${ACTIVITY_LABEL[over.kind].toLowerCase()} et pas assez de ${ACTIVITY_LABEL[under.kind].toLowerCase()}. Ce n'est pas du travail, c'est de l'évitement confortable.`,
    evidence: `${over.hours} h cette semaine sur ${weekHours()} h — ${over.share} % du temps pour une cible de ${over.target} %. En face, ${ACTIVITY_LABEL[under.kind].toLowerCase()} : ${under.share} % pour une cible de ${under.target} %.`,
    order: `Reprends ${Math.max(2, Math.round((over.gap / 100) * weekHours()))} h sur ${ACTIVITY_LABEL[over.kind].toLowerCase()} et remets-les en ${ACTIVITY_LABEL[under.kind].toLowerCase()}. Décrocher le téléphone maintenant vaut mieux que comparer un lot de plus.`,
    score: 86,
    minutes: 90,
  };
}

function closeVsProspectVerdict(): Verdict | null {
  const advanced = DEALS.filter(
    (d) => ["offre", "reservation", "financement", "notaire"].includes(d.stage) && d.stage !== "perdu",
  );
  if (advanced.length === 0) return null;
  const value = advanced.reduce((n, d) => n + d.commissionEUR, 0);
  return {
    id: "week-focus",
    tone: "decision",
    statement: `Cette semaine, la priorité n'est pas de trouver de nouveaux prospects : c'est de signer les ${advanced.length} dossiers déjà avancés.`,
    evidence: `${formatEUR(value)} de commissions à portée immédiate, contre un cycle de 60 à 90 jours pour un lead créé aujourd'hui. Les commissions en attente de versement représentent déjà ${formatEUR(commissionsPendingEUR())}.`,
    order: `Une action de closing par dossier avant vendredi : ${advanced.map((d) => d.client).join(", ")}. La prospection reprend lundi.`,
    score: 92,
    minutes: 150,
  };
}

function dormantVerdict(): Verdict | null {
  const dormant = DEALS.filter((d) => d.stage !== "perdu" && d.daysSinceContact >= 5)
    .sort((a, b) => b.commissionEUR * b.daysSinceContact - a.commissionEUR * a.daysSinceContact)[0];
  if (!dormant) return null;
  return {
    id: `dormant-${dormant.id}`,
    tone: "challenge",
    statement: `Tu n'as pas relancé ${dormant.client} depuis ${dormant.daysSinceContact} jours alors que le potentiel est fort.`,
    evidence: `${formatEUR(dormant.commissionEUR)} de commission, ${dormant.probability} % de probabilité, étape « ${STAGE_LABEL[dormant.stage]} ». Chaque jour de silence coûte environ ${formatEUR(Math.round((dormant.commissionEUR * 0.03)))} d'espérance de gain.`,
    order: dormant.nextAction,
    score: Math.min(95, 60 + dormant.daysSinceContact * 3),
    minutes: 20,
  };
}

function financingVerdict(): Verdict | null {
  const steps = analyzeFunnel();
  const fin = DEALS.filter((d) => d.stage === "financement" || d.stage === "reservation");
  if (fin.length === 0 && steps.length === 0) return null;
  const exposure = fin.reduce((n, d) => n + d.commissionEUR, 0);
  return {
    id: "financing-leak",
    tone: "diagnostic",
    statement: `Tu perds des ventes à l'étape financement. C'est la fuite la plus chère du métier : le client a dit oui, la banque dit non.`,
    evidence: `${fin.length} dossiers exposés, ${formatEUR(exposure)} de commissions dépendantes d'un accord bancaire non piloté par toi.`,
    order: `Point courtier hebdomadaire fixe. Pour chaque dossier : date de dépôt, banque, date de réponse, plan B. Aucun dossier sans deuxième banque en parallèle.`,
    score: 84,
    minutes: 40,
  };
}

function volumeVerdict(): Verdict | null {
  const steps = analyzeFunnel();
  const rdvStep = steps.find((s) => s.to.toLowerCase().includes("rendez-vous"));
  if (!rdvStep) return null;
  return {
    id: "rdv-before-reservations",
    tone: "decision",
    statement: `Tu dois augmenter le nombre de rendez-vous avant de chercher à augmenter les réservations.`,
    evidence: `La conversion vers les rendez-vous est à ${rdvStep.rate} % (cible ${rdvStep.target} %). Sans volume de rendez-vous, aucun travail de closing ne produit de résultat mesurable.`,
    order: `Objectif : +5 rendez-vous cette semaine. Cela se joue au téléphone, pas dans les fiches programmes.`,
    score: 78,
    minutes: 60,
  };
}

function profitabilityVerdict(): Verdict | null {
  const dev = byDeveloper()[0];
  const typ = byTypology()[0];
  const city = byCity()[0];
  const chan = byChannel()[0];
  if (!dev) return null;
  return {
    id: "profitability",
    tone: "diagnostic",
    statement: `Ton argent vient d'un endroit précis : ${dev.label}. Le reste est du bruit tant que tu ne l'as pas industrialisé.`,
    evidence: `${dev.label} : ${formatEUR(dev.commissionEUR)} (${dev.share} % de tes commissions). Bien le plus rentable : ${typ?.label}. Secteur : ${city?.label}. Canal : ${chan?.label}.`,
    order: `Demande à ${dev.label} un accès prioritaire aux prochains lancements et une revalorisation d'honoraires. Tu es un canal de vente pour eux, négocie comme tel.`,
    score: 74,
    minutes: 30,
  };
}

/* ------------------------------------------------------------------ */

export function verdicts(): Verdict[] {
  return [
    closeVsProspectVerdict(),
    funnelVerdict(),
    tempVerdict(),
    activityVerdict(),
    dormantVerdict(),
    financingVerdict(),
    sourceVerdict(),
    volumeVerdict(),
    profitabilityVerdict(),
  ]
    .filter((v): v is Verdict => v !== null)
    .sort((a, b) => b.score - a.score);
}

/** La décision unique de la semaine — ce sur quoi tout le reste s'aligne. */
export function weeklyDecision(): Verdict | null {
  return verdicts().find((v) => v.tone === "decision") ?? verdicts()[0] ?? null;
}

/** Les dossiers à traiter en premier, classés comme le ferait un directeur. */
export function hotList() {
  return DEALS.filter((d) => d.stage !== "perdu")
    .map((d) => ({
      deal: d,
      temperature: temperatureOf(d.probability, d.daysSinceContact),
      urgency: Math.round(d.commissionEUR * (d.probability / 100) * (1 + d.daysSinceContact / 10)),
    }))
    .sort((a, b) => b.urgency - a.urgency);
}

export { analyzeSources };
