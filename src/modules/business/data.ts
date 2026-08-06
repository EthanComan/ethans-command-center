/**
 * ETHAN — Données et moteur du module Business (VEFA).
 *
 * V1 : données en mémoire, déterministes (aucun Date.now() au module
 * scope) pour rester stable entre le rendu serveur et le client.
 * V2 : alimentation par Lovable Cloud.
 */

import {
  STAGE_ORDER,
  STAGE_LABEL,
  tierOf,
  type Deal,
  type DealStage,
  type FunnelStep,
  type MarketingLever,
  type OffMarketDeal,
  type Program,
} from "./types";

/* ------------------------------------------------------------------ */
/*  Programmes partenaires                                             */
/* ------------------------------------------------------------------ */

export const PROGRAMS: Program[] = [
  {
    id: "beauvallon",
    name: "Beauvallon",
    developer: "Aream",
    city: "Grimaud",
    status: "lancement",
    typologies: ["Villa 4P", "Villa 5P"],
    lotsAvailable: 4,
    priceFromEUR: 3200000,
    feeRate: 6,
    angle: "Villas de prestige vue mer, clientèle internationale, une seule vente peut porter l'année.",
    prestige: true,
  },
  {
    id: "horizon-lyon",
    name: "Horizon Confluence",
    developer: "Nexity",
    city: "Lyon 2e",
    status: "travaux",
    typologies: ["T2", "T3", "T4"],
    lotsAvailable: 17,
    priceFromEUR: 289000,
    feeRate: 5,
    angle: "Livraison T4 2027, RE2020, forte demande locative étudiante et cadre.",
  },
  {
    id: "cote-jardins",
    name: "Côté Jardins",
    developer: "Bouygues Immobilier",
    city: "Aix-en-Provence",
    status: "livre",
    typologies: ["T3", "T4"],
    lotsAvailable: 6,
    priceFromEUR: 415000,
    feeRate: 5.5,
    angle: "Stock résiduel livré : emménagement immédiat + marge de négociation promoteur.",
  },
  {
    id: "villa-azur",
    name: "Résidence Azur (confidentiel)",
    developer: "Réseau promoteur",
    city: "Cap d'Antibes",
    status: "off_market",
    typologies: ["Villa", "Penthouse"],
    lotsAvailable: 3,
    priceFromEUR: 4800000,
    feeRate: 4,
    angle: "Opération non diffusée — accès réservé aux apporteurs de confiance du promoteur.",
    prestige: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Pipeline                                                           */
/* ------------------------------------------------------------------ */

export const DEALS: Deal[] = [
  {
    id: "d1",
    client: "Famille Morel",
    clientType: "btoc",
    channel: "portail",
    stage: "decouverte",
    program: "Horizon Confluence",
    developer: "Nexity",
    city: "Lyon 2e",
    priceEUR: 342000,
    commissionEUR: 15400,
    probability: 45,
    daysSinceContact: 2,
    nextAction: "Terminer la découverte : financement et priorités réelles non écrites.",
  },
  {
    id: "d2",
    client: "M. Belkacem",
    clientType: "btoc",
    channel: "recommandation",
    stage: "offre",
    program: "Côté Jardins",
    developer: "Bouygues Immobilier",
    city: "Aix-en-Provence",
    priceEUR: 468000,
    commissionEUR: 22300,
    probability: 70,
    daysSinceContact: 5,
    nextAction: "Relancer sur la proposition : 5 jours de silence, la fenêtre se referme.",
  },
  {
    id: "d3",
    client: "Groupe Valmont (SCI)",
    clientType: "btob",
    btobProfile: "societe_patrimoniale",
    channel: "partenariat",
    stage: "presentation",
    program: "Horizon Confluence — 6 lots",
    developer: "Nexity",
    city: "Lyon 2e",
    priceEUR: 1740000,
    commissionEUR: 61000,
    probability: 40,
    daysSinceContact: 9,
    nextAction: "Envoyer l'analyse de rendement lot par lot + conditions de bloc.",
  },
  {
    id: "d4",
    client: "Client international — Beauvallon",
    clientType: "btoc",
    channel: "reseaux_sociaux",
    stage: "recherche",
    program: "Beauvallon",
    developer: "Aream",
    city: "Grimaud",
    priceEUR: 3400000,
    commissionEUR: 200000,
    probability: 25,
    daysSinceContact: 4,
    confidential: true,
    nextAction: "Organiser la visite privée du programme et sécuriser l'exclusivité de la relation.",
    notes: "Une seule signature ici change l'année entière.",
  },
  {
    id: "d5",
    client: "Foncière Astria",
    clientType: "btob",
    btobProfile: "fonciere",
    channel: "prospection",
    stage: "appel",
    priceEUR: 8200000,
    commissionEUR: 180000,
    probability: 15,
    daysSinceContact: 12,
    nextAction: "Rappeler le directeur des investissements — 12 jours sans contact.",
  },
  {
    id: "d6",
    client: "Mme Lorenzi",
    clientType: "btoc",
    channel: "publicite",
    stage: "reservation",
    program: "Côté Jardins",
    developer: "Bouygues Immobilier",
    city: "Aix-en-Provence",
    priceEUR: 424000,
    commissionEUR: 19800,
    probability: 90,
    daysSinceContact: 1,
    nextAction: "Suivre l'offre de prêt semaine par semaine jusqu'à l'accord définitif.",
  },
];

/* ------------------------------------------------------------------ */
/*  Off-market                                                         */
/* ------------------------------------------------------------------ */

export const OFF_MARKET: OffMarketDeal[] = [
  {
    id: "om1",
    codename: "Dossier Domaine — Golfe de Saint-Tropez",
    developerNetwork: "Réseau Aream",
    location: "Proche Saint-Tropez",
    valueEUR: 50000000,
    mandate: "recherche",
    feeRate: 3,
    feePaidBy: "acquereur",
    stage: "qualification",
    confidentiality: "maximal",
    stakeholders: [
      { name: "Aream", role: "Apporteur / réseau promoteur" },
      { name: "Propriétaire", role: "Vendeur — anonymat exigé" },
      { name: "Notaire", role: "Sécurisation juridique" },
    ],
    nextStep: "Faire signer un NDA à chaque intervenant avant toute diffusion du dossier.",
    conditions: "Honoraires à la charge de l'acquéreur, conditionnés à la preuve de fonds.",
  },
  {
    id: "om2",
    codename: "Résidence Azur — 3 lots réservés",
    developerNetwork: "Réseau promoteur régional",
    location: "Cap d'Antibes",
    valueEUR: 14400000,
    mandate: "simple",
    feeRate: 4,
    feePaidBy: "vendeur",
    stage: "sourcing",
    confidentiality: "eleve",
    stakeholders: [{ name: "Promoteur", role: "Vendeur" }],
    nextStep: "Obtenir la grille de prix confidentielle et la liste des lots réellement disponibles.",
  },
];

/* ------------------------------------------------------------------ */
/*  Performance commerciale                                            */
/* ------------------------------------------------------------------ */

/** Entonnoir du mois en cours. */
export const FUNNEL: FunnelStep[] = [
  { id: "leads", label: "Prospects générés", value: 132, targetRate: 65 },
  { id: "calls", label: "Appels décrochés", value: 71, targetRate: 60 },
  { id: "discovery", label: "Découvertes complètes", value: 34, targetRate: 70 },
  { id: "rdv", label: "Rendez-vous", value: 19, targetRate: 55 },
  { id: "offers", label: "Offres / propositions", value: 8, targetRate: 45 },
  { id: "reservations", label: "Réservations signées", value: 3, targetRate: 100 },
];

export interface FunnelAnalysis {
  from: string;
  to: string;
  rate: number;
  target: number;
  gap: number;
}

export function analyzeFunnel(): FunnelAnalysis[] {
  const out: FunnelAnalysis[] = [];
  for (let i = 0; i < FUNNEL.length - 1; i++) {
    const a = FUNNEL[i];
    const b = FUNNEL[i + 1];
    const rate = a.value === 0 ? 0 : Math.round((b.value / a.value) * 100);
    out.push({ from: a.label, to: b.label, rate, target: a.targetRate, gap: rate - a.targetRate });
  }
  return out;
}

/** Le maillon le plus faible de l'entonnoir — ce qu'ETHAN corrige en priorité. */
export function weakestLink(): FunnelAnalysis | null {
  const steps = analyzeFunnel();
  if (steps.length === 0) return null;
  return steps.reduce((worst, s) => (s.gap < worst.gap ? s : worst), steps[0]);
}

export function pipelineValueEUR(): number {
  return DEALS.filter((d) => d.stage !== "perdu").reduce((sum, d) => sum + d.commissionEUR, 0);
}

/** Commissions pondérées par la probabilité — la prévision honnête. */
export function weightedForecastEUR(): number {
  return Math.round(
    DEALS.filter((d) => d.stage !== "perdu").reduce(
      (sum, d) => sum + (d.commissionEUR * d.probability) / 100,
      0,
    ),
  );
}

export function dealsByStage(): { stage: DealStage; deals: Deal[] }[] {
  return STAGE_ORDER.map((stage) => ({ stage, deals: DEALS.filter((d) => d.stage === stage) }));
}

/** Répartition du chiffre par palier de commission. */
export function commissionMix() {
  const mix = { petite: 0, moyenne: 0, grosse: 0, exception: 0 } as Record<string, number>;
  DEALS.forEach((d) => (mix[tierOf(d.commissionEUR)] += d.commissionEUR));
  return mix;
}

/* ------------------------------------------------------------------ */
/*  Marketing                                                          */
/* ------------------------------------------------------------------ */

export const MARKETING_LEVERS: MarketingLever[] = [
  {
    id: "annonces",
    channel: "portail",
    asset: "Annonces portails — 14 lots en ligne",
    metric: "Taux de clic",
    current: 2.1,
    target: 4,
    unit: "%",
    optimisation: "Réécrire les 3 premières lignes en bénéfice de vie, pas en typologie. Photo 1 = vue extérieure au coucher du soleil.",
  },
  {
    id: "video",
    channel: "reseaux_sociaux",
    asset: "Visites vidéo verticales",
    metric: "Rétention à 3 s",
    current: 41,
    target: 65,
    unit: "%",
    optimisation: "Ouvrir sur le plan le plus fort du bien, texte incrusté dès la première seconde, aucune intro de présentation.",
  },
  {
    id: "contenu",
    channel: "contenu",
    asset: "Série « Comprendre la VEFA »",
    metric: "Leads / mois",
    current: 12,
    target: 40,
    unit: "leads",
    optimisation: "Un épisode par objection réelle du terrain. Le contenu qui répond aux objections génère les meilleurs appels.",
  },
  {
    id: "ads",
    channel: "publicite",
    asset: "Campagnes payantes programmes",
    metric: "Coût par appel",
    current: 74,
    target: 45,
    unit: "€",
    optimisation: "Segmenter par intention (primo / investisseur / prestige) et couper les créas sous 1 % de clic.",
  },
  {
    id: "recos",
    channel: "recommandation",
    asset: "Demande de recommandation post-livraison",
    metric: "Recos / client livré",
    current: 0.3,
    target: 1.5,
    unit: "recos",
    optimisation: "Demander systématiquement le jour de la remise des clés — le pic émotionnel est le meilleur moment.",
  },
];

/* ------------------------------------------------------------------ */
/*  Directeur commercial — diagnostics                                 */
/* ------------------------------------------------------------------ */

export interface BusinessDirective {
  id: string;
  title: string;
  why: string;
  impact: string;
  score: number; // 0-100
  minutes: number;
}

/**
 * Ce que dirait un directeur commercial en regardant l'activité :
 * les dossiers qui refroidissent, le maillon faible, le levier marketing.
 */
export function directives(): BusinessDirective[] {
  const out: BusinessDirective[] = [];

  // 1) Dossiers qui refroidissent, pondérés par la commission en jeu.
  DEALS.filter((d) => d.stage !== "perdu" && d.daysSinceContact >= 4).forEach((d) => {
    const money = Math.min(30, Math.round(d.commissionEUR / 7000));
    out.push({
      id: `deal-${d.id}`,
      title: `Relancer ${d.client} — ${STAGE_LABEL[d.stage]}`,
      why: `${d.daysSinceContact} jours sans contact sur un dossier à ${formatEUR(d.commissionEUR)} de commission.`,
      impact: d.nextAction,
      score: Math.min(97, 45 + d.daysSinceContact * 2 + money + Math.round(d.probability / 5)),
      minutes: 20,
    });
  });

  // 2) Maillon faible de l'entonnoir.
  const weak = weakestLink();
  if (weak && weak.gap < 0) {
    out.push({
      id: "funnel-weak",
      title: `Corriger la conversion « ${weak.from} → ${weak.to} »`,
      why: `${weak.rate} % de conversion contre ${weak.target} % attendus (${weak.gap} points).`,
      impact: "Le maillon le plus faible plafonne tout le chiffre d'affaires en aval.",
      score: Math.min(95, 60 + Math.abs(weak.gap)),
      minutes: 45,
    });
  }

  // 3) Levier marketing le plus en retard.
  const lever = MARKETING_LEVERS.map((l) => ({ l, gap: (l.current - l.target) / l.target }))
    .sort((a, b) => a.gap - b.gap)[0];
  if (lever) {
    out.push({
      id: `mkt-${lever.l.id}`,
      title: `Optimiser : ${lever.l.asset}`,
      why: `${lever.l.metric} à ${lever.l.current}${lever.l.unit} pour une cible de ${lever.l.target}${lever.l.unit}.`,
      impact: lever.l.optimisation,
      score: 62,
      minutes: 40,
    });
  }

  // 4) Off-market : rien ne doit dormir.
  OFF_MARKET.filter((o) => o.stage === "sourcing" || o.stage === "qualification").forEach((o) => {
    out.push({
      id: `om-${o.id}`,
      title: `Faire avancer « ${o.codename} »`,
      why: `Opération confidentielle de ${formatEUR(o.valueEUR)} au stade ${o.stage}.`,
      impact: o.nextStep,
      score: 74,
      minutes: 30,
    });
  });

  return out.sort((a, b) => b.score - a.score);
}

export function formatEUR(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1)} M€`;
  if (v >= 1000) return `${Math.round(v / 1000)} k€`;
  return `${v} €`;
}