/**
 * ETHAN — Business : couche analytique du directeur commercial.
 *
 * Ici, on ne stocke pas des données : on produit des constats chiffrés
 * exploitables pour décider. Tout est déterministe (aucun Date.now() au
 * module scope) pour rester stable entre serveur et client.
 */

import { DEALS, FUNNEL, formatEUR } from "./data";
import { LEAD_CHANNEL_LABEL, type DealStage, type LeadChannel } from "./types";

/** Mois de référence de la période analysée (V1 : figé, V2 : Cloud). */
export const PERIOD_LABEL = "Mois en cours";

/* ------------------------------------------------------------------ */
/*  Historique des ventes — CA signé et encaissements                  */
/* ------------------------------------------------------------------ */

export type SaleStatus = "signe" | "acte" | "encaisse";

export interface Sale {
  id: string;
  client: string;
  developer: string;
  program: string;
  city: string;
  /** Typologie principale du bien vendu. */
  typology: string;
  channel: LeadChannel;
  /** Sous-source réelle (Instagram, Facebook, SeLoger…). */
  source: string;
  priceEUR: number;
  commissionEUR: number;
  status: SaleStatus;
  /** Mois de signature relatif au mois courant : 0 = ce mois, -1 = mois dernier. */
  monthOffset: number;
  /** Mois d'encaissement prévu, relatif au mois courant. */
  cashInOffset: number;
}

export const SALES: Sale[] = [
  { id: "s1", client: "Famille Andréani", developer: "Nexity", program: "Horizon Confluence", city: "Lyon 2e", typology: "T3", channel: "reseaux_sociaux", source: "Instagram", priceEUR: 318000, commissionEUR: 14300, status: "encaisse", monthOffset: -2, cashInOffset: -1 },
  { id: "s2", client: "M. Rossi", developer: "Bouygues Immobilier", program: "Côté Jardins", city: "Aix-en-Provence", typology: "T4", channel: "recommandation", source: "Client livré", priceEUR: 462000, commissionEUR: 22100, status: "encaisse", monthOffset: -2, cashInOffset: 0 },
  { id: "s3", client: "SCI Kervel", developer: "Nexity", program: "Horizon Confluence", city: "Lyon 2e", typology: "T2 x3", channel: "partenariat", source: "Réseau CGP", priceEUR: 741000, commissionEUR: 33400, status: "acte", monthOffset: -1, cashInOffset: 1 },
  { id: "s4", client: "Mme Tahar", developer: "Bouygues Immobilier", program: "Côté Jardins", city: "Aix-en-Provence", typology: "T3", channel: "portail", source: "SeLoger", priceEUR: 398000, commissionEUR: 18400, status: "acte", monthOffset: -1, cashInOffset: 2 },
  { id: "s5", client: "M. et Mme Vidal", developer: "Aream", program: "Beauvallon", city: "Grimaud", typology: "Villa 4P", channel: "reseaux_sociaux", source: "Instagram", priceEUR: 2950000, commissionEUR: 172000, status: "signe", monthOffset: 0, cashInOffset: 3 },
  { id: "s6", client: "Mme Lorenzi", developer: "Bouygues Immobilier", program: "Côté Jardins", city: "Aix-en-Provence", typology: "T3", channel: "publicite", source: "Meta Ads", priceEUR: 424000, commissionEUR: 19800, status: "signe", monthOffset: 0, cashInOffset: 3 },
  { id: "s7", client: "M. Cheval", developer: "Nexity", program: "Horizon Confluence", city: "Lyon 2e", typology: "T2", channel: "reseaux_sociaux", source: "Facebook", priceEUR: 246000, commissionEUR: 11200, status: "signe", monthOffset: 0, cashInOffset: 2 },
];

export function caSignedThisMonthEUR() {
  return SALES.filter((s) => s.monthOffset === 0).reduce((n, s) => n + s.priceEUR, 0);
}

export function commissionsSignedThisMonthEUR() {
  return SALES.filter((s) => s.monthOffset === 0).reduce((n, s) => n + s.commissionEUR, 0);
}

export function commissionsCashedEUR() {
  return SALES.filter((s) => s.status === "encaisse" && s.cashInOffset <= 0).reduce(
    (n, s) => n + s.commissionEUR,
    0,
  );
}

/** Signé mais pas encore encaissé — l'argent déjà gagné qui dort. */
export function commissionsPendingEUR() {
  return SALES.filter((s) => s.cashInOffset > 0).reduce((n, s) => n + s.commissionEUR, 0);
}

/** Encaissements projetés mois par mois (0 = ce mois-ci). */
export function cashFlowSchedule(months = 4) {
  return Array.from({ length: months }, (_, i) => {
    const fromSales = SALES.filter((s) => s.cashInOffset === i).reduce(
      (n, s) => n + s.commissionEUR,
      0,
    );
    // Le pipeline pondéré se transforme en encaissement avec ~3 mois de délai.
    const fromPipeline =
      i >= 3
        ? Math.round(
            DEALS.filter((d) => d.stage !== "perdu").reduce(
              (n, d) => n + (d.commissionEUR * d.probability) / 100,
              0,
            ) * 0.35,
          )
        : 0;
    return { offset: i, securedEUR: fromSales, projectedEUR: fromPipeline };
  });
}

/* ------------------------------------------------------------------ */
/*  Rentabilité par axe                                                */
/* ------------------------------------------------------------------ */

export interface Ranking {
  key: string;
  label: string;
  commissionEUR: number;
  volumeEUR: number;
  count: number;
  share: number;
}

function rank(getter: (s: Sale) => string, label?: (k: string) => string): Ranking[] {
  const map = new Map<string, Ranking>();
  SALES.forEach((s) => {
    const k = getter(s);
    const cur =
      map.get(k) ?? { key: k, label: label ? label(k) : k, commissionEUR: 0, volumeEUR: 0, count: 0, share: 0 };
    cur.commissionEUR += s.commissionEUR;
    cur.volumeEUR += s.priceEUR;
    cur.count += 1;
    map.set(k, cur);
  });
  const total = SALES.reduce((n, s) => n + s.commissionEUR, 0) || 1;
  return [...map.values()]
    .map((r) => ({ ...r, share: Math.round((r.commissionEUR / total) * 100) }))
    .sort((a, b) => b.commissionEUR - a.commissionEUR);
}

export const byDeveloper = () => rank((s) => s.developer);
export const byTypology = () => rank((s) => s.typology);
export const byCity = () => rank((s) => s.city);
export const byChannel = () =>
  rank(
    (s) => s.channel,
    (k) => LEAD_CHANNEL_LABEL[k as LeadChannel] ?? k,
  );

/* ------------------------------------------------------------------ */
/*  Performance par source d'acquisition                               */
/* ------------------------------------------------------------------ */

export interface SourcePerf {
  source: string;
  channel: LeadChannel;
  leads: number;
  rdv: number;
  ventes: number;
  commissionEUR: number;
  costEUR: number;
}

export const SOURCES: SourcePerf[] = [
  { source: "Instagram", channel: "reseaux_sociaux", leads: 38, rdv: 9, ventes: 2, commissionEUR: 186300, costEUR: 0 },
  { source: "Facebook", channel: "reseaux_sociaux", leads: 41, rdv: 5, ventes: 1, commissionEUR: 11200, costEUR: 0 },
  { source: "SeLoger", channel: "portail", leads: 29, rdv: 4, ventes: 1, commissionEUR: 18400, costEUR: 690 },
  { source: "Meta Ads", channel: "publicite", leads: 17, rdv: 3, ventes: 1, commissionEUR: 19800, costEUR: 1250 },
  { source: "Recommandation client", channel: "recommandation", leads: 5, rdv: 4, ventes: 1, commissionEUR: 22100, costEUR: 0 },
  { source: "Réseau CGP", channel: "partenariat", leads: 4, rdv: 3, ventes: 1, commissionEUR: 33400, costEUR: 0 },
];

export interface SourceAnalysis extends SourcePerf {
  convRdv: number;
  convVente: number;
  valuePerLeadEUR: number;
}

export function analyzeSources(): SourceAnalysis[] {
  return SOURCES.map((s) => ({
    ...s,
    convRdv: s.leads ? Math.round((s.rdv / s.leads) * 100) : 0,
    convVente: s.leads ? Math.round((s.ventes / s.leads) * 1000) / 10 : 0,
    valuePerLeadEUR: s.leads ? Math.round(s.commissionEUR / s.leads) : 0,
  })).sort((a, b) => b.valuePerLeadEUR - a.valuePerLeadEUR);
}

/** Deux sources du même canal dont l'écart de conversion est significatif. */
export function sourceContrast(): { winner: SourceAnalysis; loser: SourceAnalysis; ratio: number } | null {
  const list = analyzeSources().filter((s) => s.leads >= 15);
  let best: { winner: SourceAnalysis; loser: SourceAnalysis; ratio: number } | null = null;
  for (const a of list) {
    for (const b of list) {
      if (a.source === b.source || b.convRdv === 0) continue;
      const ratio = a.convRdv / b.convRdv;
      if (ratio >= 1.5 && (!best || ratio > best.ratio)) best = { winner: a, loser: b, ratio };
    }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/*  Emploi du temps commercial — où part réellement l'énergie          */
/* ------------------------------------------------------------------ */

export type ActivityKind =
  | "prospection"
  | "appels"
  | "rdv"
  | "recherche_programmes"
  | "administratif"
  | "contenu";

export const ACTIVITY_LABEL: Record<ActivityKind, string> = {
  prospection: "Prospection nouvelle",
  appels: "Appels clients / relances",
  rdv: "Rendez-vous",
  recherche_programmes: "Recherche & comparaison de programmes",
  administratif: "Administratif / montage",
  contenu: "Création de contenu",
};

/** Répartition idéale du temps d'un commercial VEFA performant (%). */
export const ACTIVITY_TARGET_SHARE: Record<ActivityKind, number> = {
  prospection: 20,
  appels: 25,
  rdv: 25,
  recherche_programmes: 10,
  administratif: 10,
  contenu: 10,
};

/** Heures réellement passées cette semaine. */
export const WEEK_ACTIVITY: Record<ActivityKind, number> = {
  prospection: 2.5,
  appels: 4,
  rdv: 6,
  recherche_programmes: 9,
  administratif: 5,
  contenu: 2,
};

export interface ActivityGap {
  kind: ActivityKind;
  hours: number;
  share: number;
  target: number;
  gap: number;
}

export function activityGaps(): ActivityGap[] {
  const total = Object.values(WEEK_ACTIVITY).reduce((a, b) => a + b, 0) || 1;
  return (Object.keys(WEEK_ACTIVITY) as ActivityKind[])
    .map((k) => {
      const share = Math.round((WEEK_ACTIVITY[k] / total) * 100);
      return { kind: k, hours: WEEK_ACTIVITY[k], share, target: ACTIVITY_TARGET_SHARE[k], gap: share - ACTIVITY_TARGET_SHARE[k] };
    })
    .sort((a, b) => b.gap - a.gap);
}

export function weekHours() {
  return Object.values(WEEK_ACTIVITY).reduce((a, b) => a + b, 0);
}

/* ------------------------------------------------------------------ */
/*  Température des prospects                                          */
/* ------------------------------------------------------------------ */

export type Temperature = "chaud" | "tiede" | "froid";

export function temperatureOf(probability: number, daysSinceContact: number): Temperature {
  const score = probability - daysSinceContact * 3;
  if (score >= 55) return "chaud";
  if (score >= 25) return "tiede";
  return "froid";
}

/** Compteurs bruts : prospects chauds / tièdes / froids dans le pipeline. */
export function temperatureMix() {
  const mix: Record<Temperature, number> = { chaud: 0, tiede: 0, froid: 0 };
  // Le pipeline nominatif ne représente que les dossiers suivis ; les leads
  // en amont de l'entonnoir complètent la photo réelle.
  DEALS.filter((d) => d.stage !== "perdu").forEach((d) => {
    mix[temperatureOf(d.probability, d.daysSinceContact)] += 1;
  });
  const leads = FUNNEL[0]?.value ?? 0;
  const qualified = FUNNEL[2]?.value ?? 0;
  mix.chaud += Math.round(qualified * 0.35);
  mix.tiede += Math.round(qualified * 0.65);
  mix.froid += Math.max(0, leads - qualified);
  return mix;
}

/* ------------------------------------------------------------------ */
/*  Tableau de bord pipeline — les 10 compteurs exigés                 */
/* ------------------------------------------------------------------ */

export interface PipelineCounter {
  id: string;
  label: string;
  value: string;
  raw: number;
  hint: string;
  money?: boolean;
}

const stageCount = (stages: DealStage[]) =>
  DEALS.filter((d) => stages.includes(d.stage)).length;

export function pipelineCounters(): PipelineCounter[] {
  const reservations = SALES.filter((s) => s.monthOffset === 0).length + stageCount(["reservation"]);
  const actes = SALES.filter((s) => s.status === "acte" || s.status === "encaisse").length;
  return [
    { id: "prospects", label: "Prospects", value: String(FUNNEL[0]?.value ?? 0), raw: FUNNEL[0]?.value ?? 0, hint: "Générés sur la période" },
    { id: "appels", label: "Appels décrochés", value: String(FUNNEL[1]?.value ?? 0), raw: FUNNEL[1]?.value ?? 0, hint: "Contact réel établi" },
    { id: "rdv", label: "Rendez-vous", value: String(FUNNEL[3]?.value ?? 0), raw: FUNNEL[3]?.value ?? 0, hint: "Physiques ou visio" },
    { id: "financement", label: "Dossiers en financement", value: String(stageCount(["financement"]) + 2), raw: stageCount(["financement"]) + 2, hint: "L'étape où meurent les ventes" },
    { id: "reservations", label: "Réservations", value: String(reservations), raw: reservations, hint: "Contrats signés + dépôt" },
    { id: "actes", label: "Actes notariés", value: String(actes), raw: actes, hint: "Ventes définitivement acquises" },
    { id: "ca", label: "CA signé (mois)", value: formatEUR(caSignedThisMonthEUR()), raw: caSignedThisMonthEUR(), hint: "Volume de biens vendus", money: true },
    { id: "comm-attendues", label: "Commissions attendues", value: formatEUR(commissionsPendingEUR()), raw: commissionsPendingEUR(), hint: "Signées, pas encore versées", money: true },
    { id: "comm-encaissees", label: "Commissions encaissées", value: formatEUR(commissionsCashedEUR()), raw: commissionsCashedEUR(), hint: "Déjà sur le compte", money: true },
    { id: "comm-3mois", label: "Encaissement à 3 mois", value: formatEUR(cashFlowSchedule()[3]?.securedEUR + (cashFlowSchedule()[3]?.projectedEUR ?? 0)), raw: 0, hint: "Sécurisé + pipeline pondéré", money: true },
  ];
}
