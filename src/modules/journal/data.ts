export interface JournalEntry {
  id: string;
  date: string; // ISO
  title: string;
  body: string;
  axis: string; // axe de progression touché
}

export const DAILY_PROMPTS: string[] = [
  "Quelle décision d'aujourd'hui t'a rapproché de l'homme que tu as choisi d'être ?",
  "Qu'as-tu évité aujourd'hui, et pourquoi ?",
  "Quelle action a créé un effet domino positif ?",
  "Où as-tu manqué de discipline, sans excuse ?",
  "Qu'as-tu appris que tu ne savais pas hier ?",
];

export const SEED_ENTRIES: JournalEntry[] = [
  {
    id: "j-3",
    date: "2026-09-01",
    title: "Relance promoteur — sortie de zone de confort",
    body: "J'ai relancé trois promoteurs sans attendre le bon moment. Le confort, c'est d'attendre. La discipline, c'est d'appeler.",
    axis: "Discipline",
  },
  {
    id: "j-2",
    date: "2026-08-28",
    title: "Clarté sur Renaître",
    body: "Renaître n'avance pas par intention mais par geste concret. J'ai posé la première brique du cadre d'accompagnement.",
    axis: "Mission",
  },
  {
    id: "j-1",
    date: "2026-08-24",
    title: "Le corps porte l'exécution",
    body: "Deux séances manquées ont suffi à faire chuter mon niveau de décision. Le corps n'est pas un module secondaire.",
    axis: "Santé",
  },
];

const STORAGE_KEY = "ethan.journal.entries";

export function readEntries(): JournalEntry[] {
  if (typeof window === "undefined") return SEED_ENTRIES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const local = raw ? (JSON.parse(raw) as JournalEntry[]) : [];
    return [...local, ...SEED_ENTRIES];
  } catch {
    return SEED_ENTRIES;
  }
}

export function addEntry(entry: Omit<JournalEntry, "id">): JournalEntry {
  const created: JournalEntry = { ...entry, id: `j-${Date.now()}` };
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const local = raw ? (JSON.parse(raw) as JournalEntry[]) : [];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([created, ...local]));
    } catch {
      /* storage indisponible */
    }
  }
  return created;
}

export function promptOfTheDay(dateISO: string): string {
  const n = dateISO.split("-").reduce((a, p) => a + Number(p), 0);
  return DAILY_PROMPTS[n % DAILY_PROMPTS.length];
}
