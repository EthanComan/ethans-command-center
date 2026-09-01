/**
 * ETHAN — Archétype de leadership « Lucious Lyon ».
 *
 * Ce n'est ni un thème graphique ni un personnage décoratif : c'est une
 * grille de lecture stratégique intégrée à l'identité de l'utilisateur.
 * ETHAN reste le système ; l'archétype est un MODE de fonctionnement
 * qu'ETHAN utilise pour challenger — jamais pour remplacer ETHAN.
 */

export interface ArchetypeTrait {
  id: string;
  label: string;
  /** Ce que le trait exige concrètement. */
  standard: string;
  /** La question de challenge qu'ETHAN pose quand le trait est faible. */
  challenge: string;
}

export const LUCIOUS_TRAITS: ArchetypeTrait[] = [
  {
    id: "ambition",
    label: "Ambition",
    standard: "Viser une destination qui dépasse le confort actuel, et la nommer sans trembler.",
    challenge: "Ce que tu fais aujourd'hui est-il à la hauteur de la destination que tu as fixée ?",
  },
  {
    id: "leadership",
    label: "Leadership",
    standard: "Assumer la direction : décider, porter, entraîner.",
    challenge: "Qui attend une décision de toi que tu n'as pas encore prise ?",
  },
  {
    id: "vision",
    label: "Vision",
    standard: "Voir la structure à 5 et 10 ans, pas seulement la semaine.",
    challenge: "Cette action a-t-elle un sens dans dix ans, ou seulement cette semaine ?",
  },
  {
    id: "autorite",
    label: "Autorité",
    standard: "Se faire respecter par la constance des actes, pas par le ton.",
    challenge: "Ta parole de la semaine dernière a-t-elle été suivie d'exécution ?",
  },
  {
    id: "exigence",
    label: "Exigence",
    standard: "Refuser le travail moyen, même quand personne ne regarde.",
    challenge: "Livrerais-tu ce travail à quelqu'un que tu veux impressionner ?",
  },
  {
    id: "discipline",
    label: "Discipline",
    standard: "Exécuter le plan quand l'envie est absente.",
    challenge: "Combien d'engagements pris envers toi-même as-tu tenus ces 7 derniers jours ?",
  },
  {
    id: "strategie",
    label: "Stratégie",
    standard: "Choisir un angle d'attaque, refuser la dispersion.",
    challenge: "Est-ce le levier le plus court vers le résultat, ou juste le plus confortable ?",
  },
  {
    id: "decision",
    label: "Capacité de décision",
    standard: "Trancher vite avec 70 % de l'information, corriger ensuite.",
    challenge: "Quelle décision traînes-tu depuis plus de 72 heures ?",
  },
  {
    id: "business",
    label: "Intelligence business",
    standard: "Connaître ses chiffres et le coût réel de chaque heure.",
    challenge: "Cette heure produit-elle du chiffre, ou seulement de l'activité ?",
  },
  {
    id: "negociation",
    label: "Négociation",
    standard: "Créer du levier avant d'entrer dans la pièce.",
    challenge: "Quel levier as-tu construit avant ce rendez-vous ?",
  },
  {
    id: "presence",
    label: "Présence",
    standard: "Occuper l'espace par le calme, pas par le bruit.",
    challenge: "Es-tu arrivé préparé, ou improvises-tu encore ?",
  },
  {
    id: "controle",
    label: "Contrôle de soi",
    standard: "Ne jamais décider sous émotion.",
    challenge: "As-tu répondu à chaud aujourd'hui à quelque chose qui méritait 24 heures ?",
  },
  {
    id: "empire",
    label: "Construction d'empire",
    standard: "Bâtir des actifs qui produisent sans ta présence.",
    challenge: "Qu'as-tu construit ce mois-ci qui continue de produire sans toi ?",
  },
  {
    id: "famille",
    label: "Protection de la famille",
    standard: "L'empire n'a de sens que s'il protège les siens.",
    challenge: "Ton rythme actuel protège-t-il ta famille, ou l'use-t-il ?",
  },
  {
    id: "anticipation",
    label: "Plusieurs coups à l'avance",
    standard: "Toujours connaître le coup 2 et le coup 3.",
    challenge: "Si cette action réussit, quelle est la suivante ? Et si elle échoue ?",
  },
];

export interface ArchetypeScore {
  trait: string;
  score: number;
  note: string | null;
}

export function traitById(id: string): ArchetypeTrait | undefined {
  return LUCIOUS_TRAITS.find((t) => t.id === id);
}

/** Score global 0-100 de l'archétype (traits non évalués = 50 par défaut). */
export function archetypeScore(scores: ArchetypeScore[]): number {
  const map = new Map(scores.map((s) => [s.trait, s.score]));
  const total = LUCIOUS_TRAITS.reduce((sum, t) => sum + (map.get(t.id) ?? 50), 0);
  return Math.round(total / LUCIOUS_TRAITS.length);
}

/** Les traits les plus faibles : c'est là qu'ETHAN challenge. */
export function weakestTraits(scores: ArchetypeScore[], count = 3): Array<ArchetypeTrait & { score: number }> {
  const map = new Map(scores.map((s) => [s.trait, s.score]));
  return LUCIOUS_TRAITS.map((t) => ({ ...t, score: map.get(t.id) ?? 50 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, count);
}
