/**
 * Le contexte qu'ETHAN possède déjà.
 * L'utilisateur ne doit jamais avoir à répéter ce que le système sait.
 */
import { formatEUR, FUNNEL } from "@/modules/business/data";
import {
  caSignedThisMonthEUR,
  commissionsCashedEUR,
  commissionsPendingEUR,
  commissionsSignedThisMonthEUR,
} from "@/modules/business/analytics";
import { hotList, verdicts, weeklyDecision } from "@/modules/business/coach";
import { readToday } from "@/modules/planning/data";
import { todayObjectives } from "@/modules/objectifs/data";
import { readTodayHabits } from "@/modules/habitudes/data";
import type { TrackedItem } from "@/brain/vigilance";
import { daysSince } from "@/brain/vigilance";

export function buildEthanContext(items: TrackedItem[] = []): string {
  const now = Date.now();
  const lines: string[] = [];

  lines.push("## Business (immobilier neuf VEFA, prestige, off-market)");
  lines.push(
    `CA signé ce mois : ${formatEUR(caSignedThisMonthEUR())} · Commissions signées : ${formatEUR(
      commissionsSignedThisMonthEUR(),
    )} · encaissées : ${formatEUR(commissionsCashedEUR())} · en attente : ${formatEUR(
      commissionsPendingEUR(),
    )}`,
  );
  lines.push(`Funnel : ${FUNNEL.map((f) => `${f.label} ${f.value}`).join(" · ")}`);

  const decision = weeklyDecision();
  if (decision) lines.push(`Décision de la semaine : ${decision.statement} — ordre : ${decision.order}`);
  const v = verdicts().slice(0, 3);
  if (v.length) lines.push(`Verdicts : ${v.map((x) => `${x.statement} (${x.evidence})`).join(" | ")}`);

  const hot = hotList().slice(0, 5);
  if (hot.length) {
    lines.push("Dossiers chauds :");
    hot.forEach(({ deal, temperature }) =>
      lines.push(
        `- ${deal.client} · ${deal.program} · ${deal.stage} · ${deal.probability}% · commission ${formatEUR(
          deal.commissionEUR,
        )} · dernier contact il y a ${deal.daysSinceContact} j · ${temperature}`,
      ),
    );
  }

  const day = readToday();
  lines.push("## Journée");
  lines.push(
    day.blocks.map((b) => `${b.start}-${b.end} ${b.title}`).join(" | ") || "Aucun bloc planifié.",
  );

  const objectives = todayObjectives();
  if (objectives.length) {
    lines.push("## Objectifs du jour");
    objectives.forEach((o) => lines.push(`- ${o.title} (${o.progress}%)`));
  }

  const habits = readTodayHabits().filter((h) => h.dueToday);
  if (habits.length) {
    lines.push("## Habitudes du jour");
    habits.forEach((h) =>
      lines.push(`- ${h.habit.title} — ${h.doneToday ? "faite" : "non faite"} · série ${h.streak}`),
    );
  }

  if (items.length) {
    lines.push("## Éléments suivis dans le temps");
    items.forEach((i) =>
      lines.push(
        `- [${i.kind}] ${i.title} · statut ${i.status} · attention ${i.attention} · dernière activité il y a ${daysSince(
          i.last_activity_at,
          now,
        )} j${i.missing ? ` · manque : ${i.missing}` : ""}${
          i.next_action ? ` · prochaine action : ${i.next_action}` : ""
        }${i.due_at ? ` · échéance ${i.due_at.slice(0, 10)}` : ""}`,
      ),
    );
  }

  return lines.join("\n");
}

export const ETHAN_SYSTEM_PROMPT = `Tu es ETHAN, le directeur général personnel de l'utilisateur — pas un assistant généraliste, pas un chatbot.

Ce que tu es :
- Un directeur commercial de haut niveau en immobilier neuf VEFA (promoteurs, prestige, off-market).
- Le cerveau commun de tous les modules du système : business, planning, habitudes, objectifs, finances, performance, mission "Renaître".
- Un système de transformation : la vie que l'utilisateur veut dépend de l'homme qu'il devient.

Ta manière de parler :
- Français, tutoiement, ton de dirigeant : direct, court, sans flatterie ni remplissage.
- Tu ne décris pas des données : tu rends des verdicts. Chaque analyse finit par un ordre concret.
- Tu utilises le contexte fourni. Tu ne redemandes jamais ce que tu sais déjà.
- Quand une information essentielle manque, tu poses UNE question précise, pas cinq.
- Quand aucune action n'est nécessaire, tu le dis en une phrase et tu t'arrêtes.

Structure quand tu recommandes une action :
SITUATION → CE QUI MANQUE → PROCHAINE ACTION → POURQUOI.
Reste bref : quelques lignes, pas un rapport.`;