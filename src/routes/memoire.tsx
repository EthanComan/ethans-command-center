import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { History, ArrowUpRight } from "lucide-react";
import { memoryByYear, MEMORY_KIND_LABEL, type MemoryEvent, type MemoryKind } from "@/modules/memoire/data";

export const Route = createFileRoute("/memoire")({
  head: () => ({
    meta: [
      { title: "Memoire — ETHAN" },
      { name: "description", content: "L'histoire complete de ton evolution : decisions, reussites, echecs, apprentissages." },
    ],
  }),
  component: MemoirePage,
});

const KIND_COLOR: Record<MemoryKind, string> = {
  decision: "border-sky-500/40 text-sky-300",
  reussite: "border-emerald-500/40 text-emerald-300",
  echec: "border-red-500/40 text-red-300",
  apprentissage: "border-violet-500/40 text-violet-300",
  jalon: "border-gold/50 text-gold",
  engagement: "border-amber-500/40 text-amber-300",
};

function MemoirePage() {
  const years = Array.from(memoryByYear().entries()).sort((a, b) => b[0] - a[0]);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Principe 1 · Memoire</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">L'histoire de ton evolution</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Chaque decision, chaque reussite, chaque echec, chaque apprentissage construit ton parcours.
        Reviens en arriere et comprends comment tu es devenu qui tu es.
      </p>

      <div className="mt-10 space-y-12">
        {years.map(([year, events]) => (
          <section key={year}>
            <div className="flex items-center gap-3">
              <History className="h-4 w-4 text-gold" />
              <h2 className="text-lg font-semibold tabular-nums">{year}</h2>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {events.length} evenement{events.length > 1 ? "s" : ""}
              </span>
            </div>
            <ol className="mt-4 relative border-l border-border pl-6">
              {events.map((e) => (
                <TimelineItem key={e.id} event={e} />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ event }: { event: MemoryEvent }) {
  const [when, setWhen] = useState("");
  useEffect(() => {
    setWhen(new Date(event.at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }));
  }, [event.at]);

  return (
    <li className="mb-6 ml-2">
      <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-gold" />
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${KIND_COLOR[event.kind]}`}>
          {MEMORY_KIND_LABEL[event.kind]}
        </span>
        <span className="text-[11px] text-muted-foreground">{when || "\u00a0"}</span>
      </div>
      <h3 className="mt-1.5 text-sm font-medium">{event.title}</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{event.body}</p>
      {event.impacts.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Domino →</span>
          {event.impacts.map((i) => (
            <span key={i} className="rounded-sm border border-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {i}
            </span>
          ))}
        </div>
      )}
      {event.linkedObjectiveId && (
        <Link to="/objectifs" className="mt-2 inline-flex items-center gap-1 text-[11px] text-gold hover:underline">
          Objectif lie <ArrowUpRight className="h-3 w-3" />
        </Link>
      )}
    </li>
  );
}