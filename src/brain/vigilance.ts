/**
 * ETHAN — Vigilance.
 *
 * La direction "ETHAN vient vers moi".
 *
 * Le moteur observe les éléments suivis dans le temps (dossiers, prospects,
 * ventes, négociations, objectifs, projets, échéances…), détecte ce qui
 * nécessite une intervention, et hiérarchise :
 *
 *   URGENT · IMPORTANT · OPPORTUNITÉ · INFORMATION
 *
 * Règle non négociable : si aucune action n'est nécessaire, ETHAN se tait.
 */

export type Attention = "urgent" | "important" | "opportunite" | "information";

export interface TrackedItem {
  id: string;
  kind: string;
  title: string;
  context: string | null;
  status: string;
  missing: string | null;
  next_action: string | null;
  why: string | null;
  attention: Attention;
  value_eur: number | null;
  due_at: string | null;
  snooze_until: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface Intervention {
  itemId: string;
  title: string;
  attention: Attention;
  /** Ce qui s'est passé → où nous en sommes. */
  situation: string;
  /** Ce qui manque. */
  missing?: string;
  /** Ce qui vient ensuite. */
  nextAction: string;
  /** Pourquoi maintenant. */
  why: string;
  /** Score de priorité 0-100. */
  score: number;
}

export const ATTENTION_META: Record<Attention, { label: string; tone: string }> = {
  urgent: { label: "Urgent", tone: "border-red-500/40 text-red-400" },
  important: { label: "Important", tone: "border-gold/40 text-gold" },
  opportunite: { label: "Opportunité", tone: "border-emerald-500/40 text-emerald-400" },
  information: { label: "Information", tone: "border-border text-muted-foreground" },
};

const DAY = 24 * 60 * 60 * 1000;

export function daysSince(iso: string, now: number): number {
  return Math.floor((now - new Date(iso).getTime()) / DAY);
}

/** Silence tant que l'élément est reporté. */
function isSnoozed(item: TrackedItem, now: number): boolean {
  return !!item.snooze_until && new Date(item.snooze_until).getTime() > now;
}

/**
 * Détermine le niveau d'attention réel d'un élément à l'instant T.
 * Le niveau déclaré est un plancher ; l'inactivité et l'échéance l'élèvent.
 */
export function evaluateAttention(item: TrackedItem, now: number): Attention {
  if (item.attention === "information") return "information";

  const inactivity = daysSince(item.last_activity_at, now);
  const dueInDays = item.due_at
    ? Math.ceil((new Date(item.due_at).getTime() - now) / DAY)
    : null;

  if (dueInDays !== null && dueInDays <= 1) return "urgent";
  if (item.missing && inactivity >= 3) return "urgent";
  if (inactivity >= 7) return "urgent";
  if (dueInDays !== null && dueInDays <= 5) return "important";
  if (inactivity >= 3) return "important";
  return item.attention;
}

function scoreOf(item: TrackedItem, attention: Attention, now: number): number {
  const base = { urgent: 70, important: 45, opportunite: 35, information: 10 }[attention];
  const inactivity = Math.min(daysSince(item.last_activity_at, now), 21);
  const value = item.value_eur ? Math.min(item.value_eur / 1_000_000, 1) * 20 : 0;
  return Math.min(100, Math.round(base + inactivity + value));
}

function situationOf(item: TrackedItem, now: number): string {
  const d = daysSince(item.last_activity_at, now);
  const activity =
    d <= 0 ? "Dernière activité : aujourd'hui." : `Dernière activité : il y a ${d} jour${d > 1 ? "s" : ""}.`;
  return item.context ? `${activity} ${item.context}` : activity;
}

/**
 * Ce qu'ETHAN a à dire, maintenant. Rien d'autre.
 * Un élément sans prochaine action ni information manquante ne produit
 * aucune sollicitation : le système reste silencieux.
 */
export function interventions(items: TrackedItem[], now: number = Date.now()): Intervention[] {
  return items
    .filter((i) => i.status === "actif" && !isSnoozed(i, now))
    .map((item) => {
      const attention = evaluateAttention(item, now);
      const nextAction =
        item.next_action ??
        (item.missing ? `Obtenir : ${item.missing}` : "");
      return {
        itemId: item.id,
        title: item.title,
        attention,
        situation: situationOf(item, now),
        missing: item.missing ?? undefined,
        nextAction,
        why:
          item.why ??
          (item.missing
            ? "Cette information est nécessaire avant de pouvoir décider de la suite."
            : "Sans relance, le dossier perd de la valeur avec le temps."),
        score: scoreOf(item, attention, now),
      } satisfies Intervention;
    })
    .filter((i) => i.nextAction.length > 0 || i.attention === "information")
    .sort((a, b) => b.score - a.score);
}

/** Ce qui mérite réellement une sollicitation (le reste attend l'ouverture du module). */
export function solicitations(list: Intervention[]): Intervention[] {
  return list.filter((i) => i.attention !== "information");
}