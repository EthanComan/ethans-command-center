/**
 * ETHAN — Module Business : Immobilier neuf (VEFA).
 *
 * ETHAN n'est pas un CRM. Il est le directeur commercial personnel de
 * l'utilisateur, spécialisé dans la commercialisation de programmes
 * immobiliers neufs (VEFA), les opérations de prestige et l'off-market.
 *
 * Philosophie ETHAN : chaque euro de commission finance Renaître, et
 * chaque étape du métier est une occasion de devenir l'homme capable de
 * construire cette vie (maîtrise, discipline, réseau, sang-froid).
 */

export type ClientType = "btoc" | "btob";

export type BtoBProfile =
  | "investisseur_pro"
  | "marchand_de_biens"
  | "fonciere"
  | "family_office"
  | "entreprise"
  | "holding"
  | "societe_patrimoniale"
  | "multi_lots"
  | "immeuble_complet"
  | "residence_entiere";

export const BTOB_PROFILE_LABEL: Record<BtoBProfile, string> = {
  investisseur_pro: "Investisseur professionnel",
  marchand_de_biens: "Marchand de biens",
  fonciere: "Foncière",
  family_office: "Family office",
  entreprise: "Entreprise",
  holding: "Holding",
  societe_patrimoniale: "Société patrimoniale",
  multi_lots: "Acquéreur multi-lots",
  immeuble_complet: "Immeuble complet",
  residence_entiere: "Résidence entière",
};

/** Canaux d'acquisition de prospects. */
export type LeadChannel =
  | "portail"
  | "reseaux_sociaux"
  | "contenu"
  | "publicite"
  | "recommandation"
  | "partenariat"
  | "prospection";

export const LEAD_CHANNEL_LABEL: Record<LeadChannel, string> = {
  portail: "Portails immobiliers",
  reseaux_sociaux: "Réseaux sociaux",
  contenu: "Marketing de contenu",
  publicite: "Publicité payante",
  recommandation: "Recommandation",
  partenariat: "Partenariat",
  prospection: "Prospection active",
};

/** Étapes du métier — de l'inconnu à la livraison. */
export type DealStage =
  | "lead"
  | "appel"
  | "decouverte"
  | "recherche"
  | "presentation"
  | "offre"
  | "reservation"
  | "financement"
  | "notaire"
  | "livraison"
  | "perdu";

export const STAGE_ORDER: DealStage[] = [
  "lead",
  "appel",
  "decouverte",
  "recherche",
  "presentation",
  "offre",
  "reservation",
  "financement",
  "notaire",
  "livraison",
];

export const STAGE_LABEL: Record<DealStage, string> = {
  lead: "Prospect entrant",
  appel: "Appel décroché",
  decouverte: "Découverte projet",
  recherche: "Recherche de biens",
  presentation: "Présentation",
  offre: "Offre / proposition",
  reservation: "Contrat de réservation",
  financement: "Financement",
  notaire: "Acte notarié",
  livraison: "Livraison",
  perdu: "Perdu",
};

/** Ce qu'ETHAN exige avant de laisser passer un dossier à l'étape suivante. */
export const STAGE_GATE: Record<DealStage, string> = {
  lead: "Rappeler en moins de 5 minutes. Un lead non rappelé est un lead mort.",
  appel: "Découverte réelle : écouter 70 % du temps, ne jamais pitcher un lot au premier appel.",
  decouverte: "Motivation profonde, budget, financement, famille, contraintes, priorités — les 6 sont écrits.",
  recherche: "Au moins 3 programmes comparés chez 2 promoteurs différents, avec analyse objective.",
  presentation: "Une présentation qui provoque le coup de cœur : visuels, projection, valeur, preuve.",
  offre: "Objections traitées à l'écrit. Le prospect sait exactement ce qui se passe ensuite.",
  reservation: "Contrat de réservation signé, dépôt de garantie versé, délai SRU de 10 jours expliqué.",
  financement: "Offre de prêt suivie semaine par semaine — c'est là que les ventes meurent.",
  notaire: "Acte authentique programmé, appels de fonds expliqués au client.",
  livraison: "Suivi jusqu'aux clés : chantier, GPA, réserves. C'est là que naissent les recommandations.",
  perdu: "Analyser la cause réelle et la consigner. Une vente perdue non analysée est perdue deux fois.",
};

export interface Deal {
  id: string;
  client: string;
  clientType: ClientType;
  btobProfile?: BtoBProfile;
  channel: LeadChannel;
  stage: DealStage;
  /** Programme / opération visée. */
  program?: string;
  developer?: string;
  city?: string;
  /** Prix du bien ou de l'opération, en euros. */
  priceEUR: number;
  /** Commission attendue, en euros. */
  commissionEUR: number;
  /** Probabilité de closing, 0-100. */
  probability: number;
  /** Jours depuis le dernier contact. */
  daysSinceContact: number;
  /** Prochaine action décidée. */
  nextAction: string;
  /** Confidentiel — off-market, opération sensible. */
  confidential?: boolean;
  notes?: string;
}

export type ProgramStatus = "lancement" | "travaux" | "livre" | "off_market";

export const PROGRAM_STATUS_LABEL: Record<ProgramStatus, string> = {
  lancement: "Lancement commercial",
  travaux: "En construction",
  livre: "Livré — stock restant",
  off_market: "Confidentiel / off-market",
};

export interface Program {
  id: string;
  name: string;
  developer: string;
  city: string;
  status: ProgramStatus;
  /** Typologies disponibles (T2, T3, villa…). */
  typologies: string[];
  lotsAvailable: number;
  priceFromEUR: number;
  /** Taux d'honoraires moyen négocié avec le promoteur (%). */
  feeRate: number;
  /** Ce qui fait vendre ce programme — angle commercial. */
  angle: string;
  prestige?: boolean;
}

export interface OffMarketDeal {
  id: string;
  codename: string;
  developerNetwork: string;
  location: string;
  valueEUR: number;
  /** Honoraires : mandat, taux, prise en charge. */
  mandate: "exclusif" | "simple" | "recherche" | "aucun";
  feeRate: number;
  feePaidBy: "acquereur" | "vendeur" | "partage";
  stage: "sourcing" | "qualification" | "presentation" | "negociation" | "closing";
  confidentiality: "eleve" | "maximal";
  stakeholders: { name: string; role: string }[];
  nextStep: string;
  conditions?: string;
}

/** Entonnoir commercial — mesure de chaque étape sur la période. */
export interface FunnelStep {
  id: string;
  label: string;
  value: number;
  /** Référence de marché / objectif de conversion vers l'étape suivante (%). */
  targetRate: number;
}

export interface MarketingLever {
  id: string;
  channel: LeadChannel;
  asset: string;
  /** Indicateur clé actuel. */
  metric: string;
  current: number;
  target: number;
  unit: string;
  /** L'optimisation à tester en priorité. */
  optimisation: string;
}

export type CommissionTier = "petite" | "moyenne" | "grosse" | "exception";

export const COMMISSION_TIER: Record<
  CommissionTier,
  { label: string; fromEUR: number; toEUR: number | null; note: string }
> = {
  petite: { label: "Vente petite", fromEUR: 4000, toEUR: 8000, note: "Volume — sert la cadence, pas l'année." },
  moyenne: { label: "Vente moyenne", fromEUR: 10000, toEUR: 25000, note: "Cœur de l'activité VEFA." },
  grosse: { label: "Grosse vente", fromEUR: 25000, toEUR: 80000, note: "Haut de gamme, multi-lots, BtoB." },
  exception: { label: "Opération d'exception", fromEUR: 80000, toEUR: null, note: "Prestige et off-market — quelques dossiers changent l'année." },
};

export function tierOf(commissionEUR: number): CommissionTier {
  if (commissionEUR >= 80000) return "exception";
  if (commissionEUR >= 25000) return "grosse";
  if (commissionEUR >= 10000) return "moyenne";
  return "petite";
}