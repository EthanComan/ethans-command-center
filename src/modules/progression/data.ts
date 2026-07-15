/**
 * ETHAN — Progression de l'homme.
 *
 * Principe 4 : on ne mesure pas seulement les resultats, on mesure
 * l'evolution de l'homme sur 8 axes.
 *
 * V1 : seed + trajectoires trimestrielles. V2 : calcul depuis modules.
 */

export type AxeId =
  | "discipline"
  | "competences"
  | "reseau"
  | "sante"
  | "patrimoine"
  | "impact"
  | "constance"
  | "mission";

export interface Axe {
  id: AxeId;
  label: string;
  now: number; // 0-100
  trend: number[]; // 6 derniers trimestres
  source: string; // module principal qui alimente
  why: string; // ce que ca signifie devenir
}

export const AXES: Axe[] = [
  {
    id: "discipline",
    label: "Discipline",
    now: 72,
    trend: [40, 48, 55, 61, 68, 72],
    source: "habitudes",
    why: "Choisir long-terme quand court-terme seduit.",
  },
  {
    id: "competences",
    label: "Competences",
    now: 64,
    trend: [45, 50, 54, 58, 61, 64],
    source: "bibliotheque",
    why: "Ce que je sais faire mieux qu'il y a 6 mois.",
  },
  {
    id: "reseau",
    label: "Reseau",
    now: 58,
    trend: [30, 38, 44, 49, 54, 58],
    source: "partenaires",
    why: "Les personnes de qualite qui me tirent vers le haut.",
  },
  {
    id: "sante",
    label: "Sante",
    now: 69,
    trend: [55, 58, 61, 64, 67, 69],
    source: "sante",
    why: "Sans corps, pas de mission.",
  },
  {
    id: "patrimoine",
    label: "Patrimoine",
    now: 51,
    trend: [20, 25, 32, 38, 44, 51],
    source: "patrimoine",
    why: "Liberte concrete et securite pour la famille.",
  },
  {
    id: "impact",
    label: "Impact",
    now: 34,
    trend: [5, 8, 14, 20, 27, 34],
    source: "renaitre",
    why: "Nombre de femmes reconstruites grace a Renaitre.",
  },
  {
    id: "constance",
    label: "Constance",
    now: 66,
    trend: [35, 42, 48, 55, 60, 66],
    source: "habitudes",
    why: "Tenir dans la duree, meme sans motivation.",
  },
  {
    id: "mission",
    label: "Mission",
    now: 78,
    trend: [60, 63, 67, 70, 74, 78],
    source: "renaitre",
    why: "Alignement de mes journees avec Renaitre.",
  },
];

export function readAxes(): ReadonlyArray<Axe> { return AXES; }

export function globalManScore(): number {
  return Math.round(AXES.reduce((a, x) => a + x.now, 0) / AXES.length);
}