/**
 * ETHAN — Mode Execution.
 *
 * Principe 6 : environnement zero-distraction pendant l'action.
 * Affiche : mission + actions + ressources + chrono + protocoles.
 */

export interface ExecutionSession {
  mission: string; // pourquoi on execute
  objectiveId?: string;
  actions: string[];
  resources: { label: string; href?: string }[];
  protocols: string[];
  durationMin: number; // duree du bloc
}

/** Session par defaut suggeree par ETHAN — remplacee dynamiquement V2. */
export const DEFAULT_SESSION: ExecutionSession = {
  mission: "Combler l'ecart hebdo prospection — 14 appels a passer d'ici dimanche",
  objectiveId: "obj-week-prospection",
  actions: [
    "Bloc 1 : 8 appels de la shortlist chaude",
    "Bloc 2 : 6 appels tiedes + relances mail",
    "Bloc 3 : logger chaque contact dans le CRM avec next step",
  ],
  resources: [
    { label: "Script d'ouverture v3" },
    { label: "Shortlist chaude (CRM)", href: "/crm" },
    { label: "Objectif hebdo lie", href: "/objectifs" },
  ],
  protocols: [
    "Telephone en mode avion apres chaque bloc",
    "Pas de mails, pas de Slack, pas de LinkedIn",
    "Debout, respiration 4-4-4 avant chaque appel",
  ],
  durationMin: 90,
};