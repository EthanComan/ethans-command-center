/**
 * ETHAN — Planning Intelligent.
 *
 * Pilier au meme titre que Objectifs / Dashboard / CRM / KPI.
 * Ce n'est pas un calendrier : c'est le pont entre le Centre de
 * Commandement et l'execution reelle des journees.
 *
 * Il transforme :
 *   - objectifs (module objectifs)
 *   - priorites du jour (brain/nba)
 *   - rendez-vous (crm, externes)
 *   - protocoles (module protocoles)
 *   - habitudes (module habitudes)
 *   - seances (module sport)
 *   - taches emises par tout autre module
 * ...en une journee organisee, alignee avec la mission.
 *
 * V1 : donnees en memoire pour valider l'UX et les cablages.
 * V2 : construction automatique par Le Cerveau
 *      (energie mentale + charge cognitive + fenetres profondes + contraintes).
 */

import { readTodayHabits } from "@/modules/habitudes/data";

export type BlockKind =
  | "deep_work"      // bloc de travail profond
  | "meeting"        // rendez-vous
  | "sport"          // seance
  | "habit"          // habitude / rituel
  | "personal"       // temps personnel / famille / repos
  | "admin"          // taches mecaniques, low-energy
  | "buffer";        // marge / respiration

export type BlockSource =
  | "objectifs"
  | "nba"
  | "crm"
  | "sport"
  | "habitudes"
  | "protocoles"
  | "manuel";

export interface PlanningBlock {
  id: string;
  kind: BlockKind;
  title: string;
  start: string;              // HH:MM
  end: string;                // HH:MM
  source: BlockSource;
  objectiveId?: string;       // rattachement a l'arbre d'objectifs
  linkedModule?: string;      // module d'origine (ex: "crm", "sport")
  location?: string;
  protocolId?: string;        // protocole de focus/prep associe
  note?: string;
  locked?: boolean;           // ne peut pas etre replanifie par Le Cerveau
}

export interface PlanningDay {
  date: string;               // ISO YYYY-MM-DD
  intention: string;          // la journee en une phrase
  alignmentScore: number;     // 0-100 — coherence avec objectifs actifs
  blocks: PlanningBlock[];
}

export interface PlanningWeek {
  weekOf: string;             // ISO du lundi
  theme: string;              // fil rouge de la semaine
  focusObjectiveId?: string;  // objectif hebdo prioritaire
  days: PlanningDay[];
}

// ─────────────────────────────────────────────────────────────
// Seed cohérent avec l'arbre d'objectifs et le Mode Execution.
// ─────────────────────────────────────────────────────────────

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const mondayOf = (d: Date) => {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7; // 0 = lundi
  x.setDate(x.getDate() - dow);
  return x;
};

const TODAY_BLOCKS: PlanningBlock[] = [
  {
    id: "b-morning-ritual",
    kind: "habit",
    title: "Rituel du matin — respiration + lecture + intention",
    start: "06:30",
    end: "07:15",
    source: "habitudes",
    protocolId: "protocole-matin",
    objectiveId: "mission",
  },
  {
    id: "b-sport",
    kind: "sport",
    title: "Seance Deadlift — 5x5 @ 140 kg",
    start: "07:30",
    end: "08:45",
    source: "sport",
    objectiveId: "day-deadlift",
    linkedModule: "sport",
  },
  {
    id: "b-deep-1",
    kind: "deep_work",
    title: "Deep work — Proposition Alpha Ventures",
    start: "09:30",
    end: "11:00",
    source: "objectifs",
    objectiveId: "day-alpha",
    linkedModule: "business",
    protocolId: "protocole-focus-90",
    locked: true,
  },
  {
    id: "b-prospection",
    kind: "deep_work",
    title: "Bloc prospection — 14 appels shortlist chaude",
    start: "11:15",
    end: "12:45",
    source: "nba",
    objectiveId: "week-calls",
    linkedModule: "prospection",
  },
  {
    id: "b-lunch",
    kind: "personal",
    title: "Dejeuner — coupure sans ecran",
    start: "13:00",
    end: "13:45",
    source: "manuel",
    locked: true,
  },
  {
    id: "b-crm-followup",
    kind: "meeting",
    title: "Call — Julien (Alpha Ventures)",
    start: "14:00",
    end: "14:30",
    source: "crm",
    linkedModule: "crm",
    location: "Google Meet",
  },
  {
    id: "b-admin",
    kind: "admin",
    title: "Logging CRM + relances mail",
    start: "14:45",
    end: "15:30",
    source: "crm",
    linkedModule: "crm",
  },
  {
    id: "b-deep-2",
    kind: "deep_work",
    title: "Deep work — Redaction offre v2",
    start: "15:45",
    end: "17:15",
    source: "objectifs",
    objectiveId: "quarter-pipeline",
    linkedModule: "business",
  },
  {
    id: "b-renaitre",
    kind: "deep_work",
    title: "Charte fondatrice — rédaction",
    start: "17:15",
    end: "18:00",
    source: "objectifs",
    objectiveId: "mission",
    linkedModule: "renaitre",
  },
  {
    id: "b-buffer",
    kind: "buffer",
    title: "Marge — imprevus, respiration",
    start: "18:00",
    end: "18:15",
    source: "manuel",
  },
  {
    id: "b-personal",
    kind: "personal",
    title: "Temps famille",
    start: "18:15",
    end: "20:30",
    source: "manuel",
    locked: true,
  },
  {
    id: "b-journal",
    kind: "habit",
    title: "Journal du soir + revue de la journee",
    start: "21:30",
    end: "22:00",
    source: "habitudes",
    objectiveId: "day-journal",
  },
];

const buildDay = (offset: number, intention: string, blocks: PlanningBlock[] = []): PlanningDay => ({
  date: iso(addDays(today, offset)),
  intention,
  alignmentScore: Math.max(40, 82 - Math.abs(offset) * 6),
  blocks,
});

function blocksFromHabits(refDate: Date = today): PlanningBlock[] {
  const items = readTodayHabits(refDate);
  const blocks: PlanningBlock[] = [];
  for (const item of items) {
    if (!item.dueToday || item.doneToday) continue;
    if (!item.habit.recommendedTime) continue;
    const [h, m] = item.habit.recommendedTime.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) continue;
    const start = item.habit.recommendedTime;
    const endH = h + Math.floor((m + item.habit.estimatedMinutes) / 60);
    const endM = (m + item.habit.estimatedMinutes) % 60;
    const end = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
    blocks.push({
      id: `hab-${item.habit.id}`,
      kind: "habit",
      title: item.habit.title,
      start,
      end,
      source: "habitudes",
      objectiveId: item.habit.objectiveId,
      linkedModule: "habitudes",
    });
  }
  return blocks;
}

function mergeBlocks(base: PlanningBlock[], generated: PlanningBlock[]): PlanningBlock[] {
  const seen = new Set(base.map((b) => b.start));
  const merged = [...base];
  for (const b of generated) {
    if (seen.has(b.start)) continue;
    merged.push(b);
    seen.add(b.start);
  }
  return merged.sort((a, b) => a.start.localeCompare(b.start));
}

const TODAY: PlanningDay = {
  date: iso(today),
  intention: "Servir Renaître par le business : combler l'écart prospection, envoyer la proposition Alpha, avancer la charte fondatrice.",
  alignmentScore: 82,
  blocks: mergeBlocks(TODAY_BLOCKS, blocksFromHabits(today)),
};

const WEEK: PlanningWeek = {
  weekOf: iso(mondayOf(today)),
  theme: "Convertir le pipeline chaud pour financer Renaître — 25 appels, 2 offres signées, charte fondatrice v1.",
  focusObjectiveId: "week-calls",
  days: [
    buildDay(-((today.getDay() + 6) % 7), "Cadrage semaine — pipeline + priorites"),
    buildDay(-((today.getDay() + 6) % 7) + 1, "Prospection intensive"),
    TODAY,
    buildDay(1, "Rendez-vous clients — 3 demos"),
    buildDay(2, "Redaction offres + relances"),
    buildDay(3, "Sport long + revue hebdo + bloc Renaître (réseau experts)"),
    buildDay(4, "Repos actif — vision, lecture, écriture Renaître"),
  ],
};

export function readToday(): PlanningDay {
  return TODAY;
}

export function readWeek(): PlanningWeek {
  return WEEK;
}

export function currentBlock(nowDate: Date = new Date()): PlanningBlock | undefined {
  const hhmm = nowDate.toTimeString().slice(0, 5);
  return TODAY.blocks.find((b) => b.start <= hhmm && hhmm < b.end);
}

export function nextBlock(nowDate: Date = new Date()): PlanningBlock | undefined {
  const hhmm = nowDate.toTimeString().slice(0, 5);
  return TODAY.blocks.find((b) => b.start > hhmm);
}

export const BLOCK_KIND_META: Record<BlockKind, { label: string; tone: string }> = {
  deep_work: { label: "Deep work",   tone: "text-gold border-gold/40 bg-gold/[0.08]" },
  meeting:   { label: "Rendez-vous", tone: "text-sky-300 border-sky-400/30 bg-sky-500/[0.08]" },
  sport:     { label: "Sport",       tone: "text-emerald-300 border-emerald-400/30 bg-emerald-500/[0.08]" },
  habit:     { label: "Habitude",    tone: "text-violet-300 border-violet-400/30 bg-violet-500/[0.08]" },
  personal:  { label: "Personnel",   tone: "text-pink-300 border-pink-400/30 bg-pink-500/[0.08]" },
  admin:     { label: "Admin",       tone: "text-muted-foreground border-border bg-elevated" },
  buffer:    { label: "Marge",       tone: "text-muted-foreground border-dashed border-border bg-transparent" },
};