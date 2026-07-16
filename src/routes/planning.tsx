import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, Lock, Target, ArrowRight, Zap } from "lucide-react";
import { readToday, readWeek, currentBlock, nextBlock, BLOCK_KIND_META, type PlanningBlock } from "@/modules/planning/data";
import { get as getObjective, ancestorsOf } from "@/modules/objectifs/data";
import { readRenaitre } from "@/modules/renaitre/data";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/planning")({
  head: () => ({
    meta: [
      { title: "Planning Intelligent — ETHAN" },
      { name: "description", content: "Le pont entre le Centre de Commandement et l'execution : jour, semaine, rendez-vous, blocs de travail, sport, habitudes et taches generees par les autres modules." },
    ],
  }),
  component: PlanningPage,
});

function PlanningPage() {
  const day = readToday();
  const week = readWeek();
  const now = currentBlock();
  const next = nextBlock();
  const mission = readRenaitre();
  const missionBlocks = day.blocks.filter((b) => {
    if (!b.objectiveId) return false;
    if (b.objectiveId === "mission") return true;
    return ancestorsOf(b.objectiveId).some((a) => a.id === "mission");
  });
  const missionMinutes = missionBlocks.reduce((acc, b) => {
    const [sh, sm] = b.start.split(":").map(Number);
    const [eh, em] = b.end.split(":").map(Number);
    return acc + (eh * 60 + em - sh * 60 - sm);
  }, 0);
  const totalMinutes = day.blocks.reduce((acc, b) => {
    const [sh, sm] = b.start.split(":").map(Number);
    const [eh, em] = b.end.split(":").map(Number);
    return acc + (eh * 60 + em - sh * 60 - sm);
  }, 0);
  const missionPct = totalMinutes ? Math.round((missionMinutes / totalMinutes) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      {/* En-tete */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gold">
            <CalendarDays className="h-3.5 w-3.5" /> Planning Intelligent
          </div>
          <h1 className="mt-2 text-3xl font-semibold">La journee, transformee en execution.</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Objectifs, priorites, rendez-vous, protocoles, sport et habitudes s'assemblent ici pour construire la meilleure journee possible, alignee avec la mission.
          </p>
        </div>
        <div className="rounded-xl border border-gold/30 bg-gold/[0.06] px-4 py-3 text-right">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Alignement du jour</p>
          <p className="text-2xl font-semibold text-gold">{day.alignmentScore}%</p>
        </div>
      </header>

      {/* Intention + maintenant/prochain */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 rounded-2xl border border-border bg-elevated p-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Intention</p>
          <p className="mt-2 text-[15px] leading-snug text-foreground/90">{day.intention}</p>
        </div>
        <div className="rounded-2xl border border-gold/40 bg-gradient-to-b from-gold/[0.10] to-transparent p-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Maintenant</p>
          {now ? (
            <>
              <p className="mt-2 text-[15px] font-medium">{now.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{now.start} → {now.end}</p>
              <Link to="/execution" className="mt-3 inline-flex items-center gap-1.5 text-xs text-gold hover:underline">
                <Zap className="h-3.5 w-3.5" /> Entrer en Mode Execution
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Marge — respire.</p>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-elevated p-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Prochain bloc</p>
          {next ? (
            <>
              <p className="mt-2 text-[15px] font-medium">{next.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{next.start} → {next.end}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Fin de journee.</p>
          )}
        </div>
      </section>

      {/* Bandeau Mission Renaître */}
      <section className="rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/[0.08] via-transparent to-transparent p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gold">
              <Heart className="h-3.5 w-3.5" /> Mission de vie — Renaître
            </div>
            <p className="mt-2 text-[15px] leading-snug text-foreground/90">{mission.north}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Chaque bloc de la journée doit, directement ou indirectement, remonter à cette mission. Le planning n'est pas une liste — c'est un acte au service de Renaître.
            </p>
          </div>
          <div className="rounded-xl border border-gold/30 bg-background/40 px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Temps au service de Renaître</p>
            <p className="text-2xl font-semibold text-gold">{missionPct}%</p>
            <p className="text-[10px] text-muted-foreground">{missionBlocks.length} bloc(s) rattaché(s)</p>
          </div>
        </div>
      </section>

      {/* Timeline du jour */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Aujourd'hui — {day.date}</h2>
          <span className="text-xs text-muted-foreground">{day.blocks.length} blocs</span>
        </div>
        <ol className="space-y-2">
          {day.blocks.map((b) => (
            <BlockRow key={b.id} block={b} isNow={now?.id === b.id} />
          ))}
        </ol>
      </section>

      {/* Vue semaine */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Semaine du {week.weekOf}</h2>
          <span className="text-xs text-gold">{week.theme}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-7">
          {week.days.map((d) => {
            const isToday = d.date === day.date;
            return (
              <div
                key={d.date}
                className={`rounded-xl border p-3 ${isToday ? "border-gold/50 bg-gold/[0.06]" : "border-border bg-elevated"}`}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{d.date.slice(5)}</p>
                <p className="mt-2 text-xs leading-snug text-foreground/90 line-clamp-3">{d.intention}</p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{d.blocks.length} blocs</span>
                  <span className={isToday ? "text-gold" : ""}>{d.alignmentScore}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Note V2 — Le Cerveau */}
      <section className="rounded-2xl border border-dashed border-gold/30 bg-gold/[0.04] p-5">
        <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Prochaine etape — Le Cerveau</p>
        <p className="mt-2 text-sm text-foreground/90">
          En V2, ETHAN construira automatiquement la meilleure journee possible : lecture des objectifs actifs, energie mentale, seances de sport, protocoles, rendez-vous CRM et taches emises par les autres modules — puis arbitrage sous contrainte de temps et d'energie.
        </p>
      </section>
    </div>
  );
}

function BlockRow({ block, isNow }: { block: PlanningBlock; isNow: boolean }) {
  const meta = BLOCK_KIND_META[block.kind];
  const objective = block.objectiveId ? getObjective(block.objectiveId) : undefined;
  const chain = block.objectiveId ? [...ancestorsOf(block.objectiveId), objective].filter(Boolean) : [];
  const servesMission = chain.some((o) => o?.id === "mission");
  return (
    <li className={`flex items-stretch gap-3 rounded-xl border px-4 py-3 transition-colors ${isNow ? "border-gold/60 bg-gold/[0.06]" : servesMission ? "border-gold/30 bg-gold/[0.03] hover:border-gold/50" : "border-border bg-elevated hover:border-gold/30"}`}>
      <div className="flex w-20 shrink-0 flex-col text-xs tabular-nums text-muted-foreground">
        <span className="text-foreground/90">{block.start}</span>
        <span>{block.end}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${meta.tone}`}>{meta.label}</span>
          <p className="text-sm font-medium">{block.title}</p>
          {block.locked && <Lock className="h-3 w-3 text-muted-foreground" aria-label="Verrouille" />}
          {servesMission && (
            <span className="inline-flex items-center gap-1 rounded border border-gold/40 bg-gold/[0.08] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-gold">
              <Heart className="h-3 w-3" /> Renaître
            </span>
          )}
        </div>
        {chain.length > 0 && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {chain.map((o) => o!.title).join("  ›  ")}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          {block.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{block.location}</span>}
          {objective && (
            <Link to="/objectifs" className="inline-flex items-center gap-1 hover:text-gold">
              <Target className="h-3 w-3" /> {objective.title}
            </Link>
          )}
          {block.linkedModule && (
            <span className="inline-flex items-center gap-1">
              <ArrowRight className="h-3 w-3" /> {block.linkedModule}
            </span>
          )}
          <span className="inline-flex items-center gap-1 opacity-70">
            <Clock className="h-3 w-3" /> source : {block.source}
          </span>
        </div>
        {block.note && (
          <p className="mt-1 text-[11px] italic text-muted-foreground/80">{block.note}</p>
        )}
      </div>
    </li>
  );
}