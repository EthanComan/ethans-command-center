import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Lock, MapPin, Zap } from "lucide-react";
import {
  readToday,
  readWeek,
  currentBlock,
  nextBlock,
  BLOCK_KIND_META,
  type PlanningBlock,
} from "@/modules/planning/data";

export const Route = createFileRoute("/planning")({
  head: () => ({
    meta: [
      { title: "Planning — ETHAN" },
      { name: "description", content: "Agenda du jour et de la semaine : rendez-vous, appels, deep work, sport et tâches, en une timeline lisible." },
      { property: "og:title", content: "Planning — ETHAN" },
      { property: "og:description", content: "Organiser la journée : blocs, priorités et rendez-vous, sans bruit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlanningPage,
});

const minutes = (b: PlanningBlock) => {
  const [sh, sm] = b.start.split(":").map(Number);
  const [eh, em] = b.end.split(":").map(Number);
  return eh * 60 + em - sh * 60 - sm;
};

function PlanningPage() {
  const day = readToday();
  const week = readWeek();
  const [now, setNow] = useState<PlanningBlock | undefined>(undefined);
  const [next, setNext] = useState<PlanningBlock | undefined>(undefined);
  const [label, setLabel] = useState("");

  useEffect(() => {
    setNow(currentBlock());
    setNext(nextBlock());
    setLabel(new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  const totalHours = Math.round((day.blocks.reduce((n, b) => n + minutes(b), 0) / 60) * 10) / 10;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gold">
            <CalendarDays className="h-3.5 w-3.5" /> Planning
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{label || "Aujourd'hui"}</h1>
        </div>
        <div className="text-right text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {day.blocks.length} blocs · {totalHours} h planifiées
        </div>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-gold/40 bg-gradient-to-b from-gold/[0.10] to-transparent p-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Maintenant</p>
          {now ? (
            <>
              <p className="mt-2 text-[15px] font-medium">{now.title}</p>
              <p className="mt-1 text-xs tabular-nums text-muted-foreground">{now.start} → {now.end}</p>
              <Link to="/execution" className="mt-3 inline-flex items-center gap-1.5 text-xs text-gold hover:underline">
                <Zap className="h-3.5 w-3.5" /> Mode exécution
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Aucun bloc en cours.</p>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-elevated p-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Prochain</p>
          {next ? (
            <>
              <p className="mt-2 text-[15px] font-medium">{next.title}</p>
              <p className="mt-1 text-xs tabular-nums text-muted-foreground">{next.start} → {next.end}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Fin de journée.</p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Journée</h2>
        <ol className="mt-4 space-y-1.5">
          {day.blocks.map((b) => (
            <BlockRow key={b.id} block={b} isNow={now?.id === b.id} />
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Semaine</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {week.days.map((d) => {
            const isToday = d.date === day.date;
            return (
              <div
                key={d.date}
                className={`rounded-xl border p-3 ${isToday ? "border-gold/50 bg-gold/[0.06]" : "border-border bg-elevated"}`}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{d.date.slice(8)}/{d.date.slice(5, 7)}</p>
                <p className={`mt-2 text-lg font-semibold tabular-nums ${isToday ? "text-gold" : "text-foreground"}`}>{d.blocks.length}</p>
                <p className="text-[10px] text-muted-foreground">blocs</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function BlockRow({ block, isNow }: { block: PlanningBlock; isNow: boolean }) {
  const meta = BLOCK_KIND_META[block.kind];
  return (
    <li
      className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors ${
        isNow ? "border-gold/60 bg-gold/[0.06]" : "border-border bg-elevated hover:border-gold/30"
      }`}
    >
      <div className="flex w-14 shrink-0 flex-col text-xs tabular-nums leading-tight text-muted-foreground">
        <span className="text-foreground/90">{block.start}</span>
        <span>{block.end}</span>
      </div>
      <span className={`hidden h-8 w-1 shrink-0 rounded-full sm:block ${isNow ? "bg-gold" : "bg-border"}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{block.title}</p>
          {block.locked && <Lock className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="Verrouillé" />}
        </div>
        {block.location && (
          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" /> {block.location}
          </p>
        )}
      </div>
      <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${meta.tone}`}>
        {meta.label}
      </span>
      <span className="hidden w-12 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground sm:block">
        {minutes(block)}′
      </span>
    </li>
  );
}
