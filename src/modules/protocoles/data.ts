export type ProtocolCategory = "business" | "performance" | "mental" | "mission";

export interface ProtocolStep {
  label: string;
  detail?: string;
}

export interface Protocol {
  id: string;
  name: string;
  category: ProtocolCategory;
  trigger: string;
  outcome: string;
  steps: ProtocolStep[];
  sources?: string[]; // bibliothèque : lectures / références fusionnées ici
}

export const CATEGORY_LABEL: Record<ProtocolCategory, string> = {
  business: "Business",
  performance: "Performance",
  mental: "Mental",
  mission: "Mission",
};

export const PROTOCOLS: Protocol[] = [
  {
    id: "p-promoteur",
    name: "Ouverture d'un compte promoteur",
    category: "business",
    trigger: "Nouveau promoteur identifié sur une zone cible",
    outcome: "Convention de partenariat signée + accès aux grilles de prix",
    steps: [
      { label: "Qualifier le pipeline du promoteur", detail: "Programmes en cours, stock, délais de livraison" },
      { label: "Prise de contact directeur commercial", detail: "Angle : volume écoulé, pas courtage générique" },
      { label: "Présenter le canal de distribution", detail: "BtoC direct + réseau BtoB prescripteurs" },
      { label: "Négocier la commission", detail: "Cible 5 % HT, plancher 4 % avec exclusivité de lot" },
      { label: "Signer la convention et charger les lots" },
    ],
    sources: ["Guide VEFA — mécanique d'appels de fonds", "Loi Pinel / dispositifs en vigueur"],
  },
  {
    id: "p-rdv-acquereur",
    name: "RDV acquéreur BtoC",
    category: "business",
    trigger: "Lead qualifié avec capacité de financement confirmée",
    outcome: "Réservation signée ou raison de refus documentée",
    steps: [
      { label: "Diagnostic patrimonial", detail: "Objectif, horizon, fiscalité, capacité d'emprunt" },
      { label: "Cadrage VEFA", detail: "Appels de fonds, GFA, délais, garanties" },
      { label: "Sélection de 2 lots maximum", detail: "Jamais de catalogue : une décision, pas un choix infini" },
      { label: "Traitement des objections prix / délai" },
      { label: "Réservation + dossier de financement lancé sous 48 h" },
    ],
    sources: ["Playbook objections VEFA"],
  },
  {
    id: "p-reset",
    name: "Protocole de reset (journée cassée)",
    category: "mental",
    trigger: "Deux blocs d'exécution manqués dans la journée",
    outcome: "Sortie de spirale en moins de 30 minutes",
    steps: [
      { label: "Arrêt total 10 minutes, sans écran" },
      { label: "Écrire la cause réelle dans le Journal" },
      { label: "Choisir UNE action de 25 minutes" },
      { label: "Mode Exécution, zéro distraction" },
    ],
  },
  {
    id: "p-semaine",
    name: "Revue hebdomadaire",
    category: "performance",
    trigger: "Dimanche 18 h",
    outcome: "Semaine suivante planifiée, dérives corrigées",
    steps: [
      { label: "Lire les verdicts Business et Performance" },
      { label: "Comparer aux jalons de la destination 400 k€/mois" },
      { label: "Corriger les habitudes à faible constance" },
      { label: "Poser les blocs non négociables de la semaine" },
    ],
  },
  {
    id: "p-renaitre",
    name: "Avancement Renaître",
    category: "mission",
    trigger: "Chaque semaine, sans exception",
    outcome: "Un geste concret pour la mission humanitaire",
    steps: [
      { label: "Identifier une action concrète au service des femmes accompagnées" },
      { label: "Bloquer le créneau dans le Planning" },
      { label: "Consigner l'avancement dans le module Renaître" },
    ],
  },
];

export function protocolsByCategory(): Array<{ category: ProtocolCategory; items: Protocol[] }> {
  const cats: ProtocolCategory[] = ["business", "performance", "mental", "mission"];
  return cats.map((category) => ({ category, items: PROTOCOLS.filter((p) => p.category === category) }));
}
