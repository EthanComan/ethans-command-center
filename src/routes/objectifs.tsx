import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  Target,
  Calendar,
  Flame,
  Link2,
  TrendingUp,
} from "lucide-react";
import {
  readAll,
  childrenOf,
  ancestorsOf,
  get,
} from "@/modules/objectifs/data";
import {
  HORIZON_LABEL,
  HORIZON_ORDER,
  type Horizon,
  type Objective,
  type Priority,
} from "@/modules/objectifs/types";

export const Route = createFileRoute("/objectifs")({
  component: ObjectifsPage,
});

const PRIORITY_COLOR: Record<Priority, string> = {
  critique: "text-gold border-gold/40",
  haute: "text-foreground border-border",
  moyenne: "text-muted-foreground border-border/60",
  basse: "text-muted-foreground/70 border-border/40",
};

function formatDate(iso: string | null): string {
  if (!iso) return "Intemporel";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function ObjectifsPage() {
  const all = readAll();
  const [selectedId, setSelectedId] = useState<string>("year-ca");
  const selected = get(selectedId);

  const byHorizon = useMemo(() => {
    const map: Record<Horizon, Objective[]> = {} as Record<Horizon, Objective[]>;
    for (const h of HORIZON_ORDER) map[h] = [];
    for (const o of all) map[o.horizon].push(o);
    return map;
  }, [all]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Module Objectifs
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            De la Mission au geste{" "}
            <span className="text-gold">de ce matin</span>.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Toute action d'ETHAN doit remonter, de proche en proche, jusqu'à la
            Mission « Renaître ». C'est ici que la chaîne se construit.
          </p>
        </div>
        <div className="rounded-md border border-border bg-elevated px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {all.length} objectifs · 9 horizons
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Colonne 1 — Timeline verticale des horizons */}
        <aside className="rounded-2xl border border-border bg-elevated p-4">
          <div className="mb-3 px-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Hiérarchie
          </div>
          <ol className="relative space-y-1">
            {HORIZON_ORDER.map((h, i) => {
              const items = byHorizon[h];
              return (
                <li key={h}>
                  <div className="flex items-center gap-2 px-2 py-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-[10px] tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {HORIZON_LABEL[h]}
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground/70">
                      {items.length}
                    </span>
                  </div>
                  <ul className="ml-6 space-y-0.5 border-l border-border/60 pl-3">
                    {items.length === 0 && (
                      <li className="py-1 text-[11px] italic text-muted-foreground/60">
                        — aucun —
                      </li>
                    )}
                    {items.map((o) => (
                      <li key={o.id}>
                        <button
                          onClick={() => setSelectedId(o.id)}
                          className={`w-full rounded-md px-2 py-1.5 text-left text-[13px] leading-snug transition-colors ${
                            selectedId === o.id
                              ? "bg-background text-foreground"
                              : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                          }`}
                        >
                          {o.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* Colonne 2 — Détail objectif sélectionné */}
        <section className="space-y-6">
          {selected ? (
            <ObjectiveDetail
              objective={selected}
              onSelect={setSelectedId}
            />
          ) : (
            <div className="rounded-2xl border border-border bg-elevated p-10 text-sm text-muted-foreground">
              Sélectionne un objectif pour voir sa chaîne complète.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ObjectiveDetail({
  objective,
  onSelect,
}: {
  objective: Objective;
  onSelect: (id: string) => void;
}) {
  const ancestors = ancestorsOf(objective.id);
  const children = childrenOf(objective.id);

  return (
    <>
      {/* Chaîne d'ascendance — Mission → ... → objectif courant */}
      <div className="rounded-2xl border border-border bg-elevated p-5">
        <div className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Chaîne de sens
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[13px]">
          {ancestors.map((a) => (
            <span key={a.id} className="flex items-center gap-1.5">
              <button
                onClick={() => onSelect(a.id)}
                className="rounded-md border border-border/60 bg-background/40 px-2 py-1 text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
              >
                <span className="mr-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  {HORIZON_LABEL[a.horizon]}
                </span>
                {a.title.length > 40 ? a.title.slice(0, 40) + "…" : a.title}
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            </span>
          ))}
          <span className="rounded-md border border-gold/40 bg-gold/5 px-2 py-1 text-gold">
            <span className="mr-1.5 text-[10px] uppercase tracking-wider">
              {HORIZON_LABEL[objective.horizon]}
            </span>
            {objective.title}
          </span>
        </div>
      </div>

      {/* Carte principale */}
      <div className="overflow-hidden rounded-2xl border border-border bg-elevated shadow-[var(--shadow-elegant)]">
        <div className="border-b border-border/60 bg-gradient-to-b from-gold/[0.05] to-transparent p-6">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="rounded-sm border border-border/60 px-1.5 py-0.5">
              {HORIZON_LABEL[objective.horizon]}
            </span>
            <span
              className={`rounded-sm border px-1.5 py-0.5 ${PRIORITY_COLOR[objective.priority]}`}
            >
              {objective.priority}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {formatDate(objective.targetDate)}
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-medium tracking-tight md:text-3xl">
            {objective.title}
          </h2>
          {objective.description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {objective.description}
            </p>
          )}

          {/* Barre de progression */}
          <div className="mt-6">
            <div className="flex items-baseline justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Avancement</span>
              <span className="text-gold tabular-nums">{objective.progress}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/60">
              <div
                className="h-full bg-gold transition-all"
                style={{ width: `${objective.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Grille : KPIs, Modules liés */}
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <TrendingUp className="h-3 w-3" /> KPI associés
            </div>
            {objective.kpis.length === 0 ? (
              <p className="text-[13px] italic text-muted-foreground/70">
                Aucun KPI — cet horizon est qualitatif.
              </p>
            ) : (
              <ul className="space-y-3">
                {objective.kpis.map((k) => {
                  const pct = Math.min(100, Math.round((k.current / k.target) * 100));
                  return (
                    <li key={k.label}>
                      <div className="flex items-baseline justify-between text-[13px]">
                        <span>{k.label}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {k.current.toLocaleString("fr-FR")}
                          {k.unit ?? ""} /{" "}
                          <span className="text-foreground">
                            {k.target.toLocaleString("fr-FR")}
                            {k.unit ?? ""}
                          </span>
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-background/60">
                        <div
                          className="h-full bg-foreground/70"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <Link2 className="h-3 w-3" /> Modules connectés
            </div>
            {objective.linkedModules.length === 0 ? (
              <p className="text-[13px] italic text-muted-foreground/70">
                Aucun module rattaché.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {objective.linkedModules.map((m) => (
                  <li
                    key={m}
                    className="rounded-md border border-border/60 bg-background/40 px-2 py-1 text-[11px] capitalize text-muted-foreground"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Sous-objectifs */}
      <div className="rounded-2xl border border-border bg-elevated p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Target className="h-3 w-3" /> Sous-objectifs
          </div>
          <span className="text-[11px] text-muted-foreground">
            {children.length} nœud{children.length > 1 ? "s" : ""}
          </span>
        </div>
        {children.length === 0 ? (
          <p className="text-[13px] italic text-muted-foreground/70">
            Aucun sous-objectif — c'est un nœud terminal. Ajoute des actions
            quotidiennes pour l'exécuter.
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {children.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => onSelect(c.id)}
                  className="group flex w-full items-center gap-4 py-3 text-left transition-colors hover:text-gold"
                >
                  <span className="w-24 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {HORIZON_LABEL[c.horizon]}
                  </span>
                  <span className="flex-1 text-sm">{c.title}</span>
                  <span className="hidden w-32 md:block">
                    <div className="h-1 overflow-hidden rounded-full bg-background/60">
                      <div
                        className="h-full bg-gold/80"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </span>
                  <span className="w-10 text-right text-[11px] tabular-nums text-muted-foreground">
                    {c.progress}%
                  </span>
                  {c.priority === "critique" && (
                    <Flame className="h-3.5 w-3.5 text-gold" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
