/**
 * ETHAN — Module ADN.
 *
 * Le socle du système. Toutes les décisions d'ETHAN (recommandations
 * du Cerveau, priorisation, alertes) sont filtrées par cet ADN.
 *
 * V1 : seed statique. V2 : édition dans l'UI et persistance via `Store`.
 */

export interface Value { name: string; description: string }
export interface Principle { title: string; body: string }
export interface HonorRule { rule: string; why: string }

export interface AdnState {
  identity: string;
  mission: string;
  vision: string;
  values: Value[];
  honorCode: HonorRule[];
  principles: Principle[];
  /** Règles impératives utilisées par Le Cerveau pour filtrer les recommandations. */
  decisionRules: string[];
}

export const adn: AdnState = {
  identity:
    "Un homme calme, précis, ancré. Il construit dans la durée, refuse le bruit, protège ceux qu'il aime et transmet ce qu'il apprend.",
  mission:
    "Renaître — aider des femmes brisées par la violence à se reconstruire, retrouver confiance et goût à la vie.",
  vision:
    "Un empire discret, une famille solide, un corps d'athlète, une œuvre transmissible.",
  values: [
    { name: "Vérité", description: "Voir ce qui est, pas ce qui arrange." },
    { name: "Discipline", description: "Choisir long-terme quand court-terme séduit." },
    { name: "Souveraineté", description: "Ne dépendre de personne pour décider de sa vie." },
    { name: "Bienveillance forte", description: "Protéger sans faiblir, aider sans se perdre." },
    { name: "Excellence", description: "Faire moins de choses, les faire irréprochables." },
  ],
  honorCode: [
    { rule: "Je ne trahis jamais ma parole.", why: "La parole est le socle de la confiance." },
    { rule: "Je ne remets jamais à demain ce qui me rapproche de ma mission.", why: "Le report est une fuite déguisée." },
    { rule: "Je ne fuis jamais devant la difficulté.", why: "C'est là que se construit l'homme." },
    { rule: "Je protège ma famille avant tout.", why: "Elle est la raison de tout le reste." },
    { rule: "Je ne consomme pas ce que je peux créer.", why: "Créer libère, consommer enchaîne." },
  ],
  principles: [
    { title: "Priorité > urgence", body: "L'urgent tue l'important. Je choisis l'important même sous pression." },
    { title: "Un jour = un vote", body: "Chaque action est un vote pour l'homme que je veux devenir." },
    { title: "Corps d'abord", body: "Sans corps, pas de mission. Sport, sommeil, nutrition sont non-négociables." },
    { title: "Systèmes > motivation", body: "Je m'appuie sur des protocoles, pas sur l'humeur du jour." },
    { title: "Silence stratégique", body: "Je construis, je ne commente pas." },
  ],
  decisionRules: [
    "Toute action doit remonter à un objectif, qui doit remonter à la Mission.",
    "Si une décision met en péril la famille ou la santé, elle est rejetée.",
    "En cas de doute, choisir l'option la plus alignée avec le long terme.",
    "Aucune journée ne se termine sans une action pour Renaître, un pas Business et un investissement corps.",
  ],
};

export function readAdn(): AdnState { return adn; }