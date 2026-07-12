/**
 * ETHAN — Module Renaître.
 *
 * Mission de vie de l'utilisateur : projet humanitaire de reconstruction
 * pour des femmes victimes de violences, agressions, traumatismes.
 * Ce n'est PAS un objectif de développement personnel.
 *
 * Ce module suit la construction de l'œuvre sur plusieurs années :
 * piliers, jalons, bénéficiaires accompagnées, partenariats, ressources.
 */

export type PillarStatus = "idee" | "en_cours" | "actif";

export interface Pillar {
  id: string;
  name: string;
  purpose: string;
  status: PillarStatus;
  progress: number; // 0-100
}

export interface Milestone {
  id: string;
  year: number;
  label: string;
  done: boolean;
}

export interface RenaitreState {
  north: string;
  narrative: string;
  pillars: Pillar[];
  milestones: Milestone[];
  metrics: {
    beneficiariesTarget: number;
    beneficiariesReached: number;
    partnersTarget: number;
    partnersActive: number;
    fundRaisedEUR: number;
    fundTargetEUR: number;
  };
  nextActions: string[];
}

export const renaitre: RenaitreState = {
  north:
    "Reconstruire 10 000 femmes brisées par la violence d'ici 20 ans.",
  narrative:
    "Renaître n'est pas un projet parmi d'autres. C'est la raison d'être du système. Chaque euro gagné, chaque compétence développée, chaque relation construite doit à terme servir cette mission.",
  pillars: [
    { id: "programme", name: "Programme de reconstruction", purpose: "Parcours structuré (mental, corps, projet de vie) pour femmes accompagnées.", status: "idee", progress: 5 },
    { id: "refuge", name: "Lieu physique — Refuge", purpose: "Un lieu où se poser, se reconstruire, se reconnecter.", status: "idee", progress: 0 },
    { id: "fondation", name: "Structure & Fondation", purpose: "Entité juridique, gouvernance, transparence financière.", status: "idee", progress: 0 },
    { id: "reseau", name: "Réseau d'experts", purpose: "Psychologues, coachs, avocats, médecins bénévoles ou partenaires.", status: "idee", progress: 8 },
    { id: "financement", name: "Financement", purpose: "Business personnel → fondation. Mécénat, dons, partenariats.", status: "en_cours", progress: 12 },
    { id: "voix", name: "Voix publique", purpose: "Contenus, témoignages, plaidoyer — briser le silence.", status: "idee", progress: 0 },
  ],
  milestones: [
    { id: "m1", year: 2026, label: "Cadre du programme rédigé + 3 femmes-pilotes accompagnées bénévolement.", done: false },
    { id: "m2", year: 2027, label: "Fondation créée + 25 femmes accompagnées.", done: false },
    { id: "m3", year: 2028, label: "Premier lieu Refuge opérationnel (loué).", done: false },
    { id: "m4", year: 2030, label: "500 femmes accompagnées, 3 antennes en France.", done: false },
    { id: "m5", year: 2035, label: "Lieu Refuge en propriété + rayonnement international.", done: false },
    { id: "m6", year: 2045, label: "10 000 femmes accompagnées.", done: false },
  ],
  metrics: {
    beneficiariesTarget: 10000,
    beneficiariesReached: 0,
    partnersTarget: 50,
    partnersActive: 2,
    fundRaisedEUR: 0,
    fundTargetEUR: 5000000,
  },
  nextActions: [
    "Écrire la charte fondatrice de Renaître (mission, valeurs, engagements).",
    "Identifier 3 psychologues spécialisées prêtes à discuter du programme.",
    "Consacrer 5 % du CA business à une réserve Renaître dès ce trimestre.",
  ],
};

export function readRenaitre(): RenaitreState { return renaitre; }