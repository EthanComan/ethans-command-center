import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Target,
  Flame,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const today = new Date().toLocaleDateString("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const priorities = [
  { id: 1, label: "Finaliser la proposition Alpha Ventures", done: false, tag: "Business" },
  { id: 2, label: "Session Deadlift — 5x5", done: false, tag: "Sport" },
  { id: 3, label: "Journal du soir + revue de la journée", done: false, tag: "Personnel" },
];

const kpis = [
  { label: "Focus", value: "4h 20", delta: "+18%", icon: Clock },
  { label: "Deals actifs", value: "12", delta: "+2", icon: TrendingUp },
  { label: "Habitudes", value: "6/7", delta: "streak 14j", icon: Flame },
  { label: "Énergie", value: "8.2", delta: "sur 10", icon: Sparkles },
];

function Index() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {today}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Bonjour. Voici votre priorité{" "}
            <span className="text-gold">absolue</span>.
          </h1>
        </div>
        <button className="group inline-flex items-center gap-2 rounded-md border border-border bg-elevated px-3.5 py-2 text-sm font-medium transition-colors hover:border-gold/40 hover:text-gold">
          Ouvrir ETHAN
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Bloc priorité #1 */}
      <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-elevated shadow-[var(--shadow-elegant)]">
        <div className="relative border-b border-border/60 bg-gradient-to-b from-gold/[0.06] to-transparent p-8">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-gold">
            <Target className="h-3 w-3" strokeWidth={2} />
            Priorité #1
          </div>
          <h2 className="mt-4 max-w-2xl text-2xl font-medium leading-snug tracking-tight md:text-3xl">
            Structurer l'offre premium de conseil et signer le premier client
            avant la fin de la semaine.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Objectif à fort levier — impact direct sur le chiffre d'affaires
            et la validation du positionnement.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-medium text-gold-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5">
              Passer à l'action
            </button>
            <button className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground">
              Voir le protocole
            </button>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="group rounded-xl border border-border bg-elevated p-4 transition-colors hover:border-border/80"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {k.label}
                </span>
                <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-gold" strokeWidth={1.75} />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tracking-tight">{k.value}</span>
                <span className="text-[11px] text-muted-foreground">{k.delta}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Deux colonnes */}
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-elevated p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium tracking-tight">Objectifs du jour</h3>
            <span className="text-[11px] text-muted-foreground">3 tâches</span>
          </div>
          <ul className="mt-4 divide-y divide-border/60">
            {priorities.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                {p.done ? (
                  <CheckCircle2 className="h-4 w-4 text-gold" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                )}
                <span className="flex-1 text-sm">{p.label}</span>
                <span className="rounded-sm border border-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {p.tag}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-elevated p-6">
          <h3 className="text-sm font-medium tracking-tight">Rappel du protocole</h3>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            « Chaque décision est un vote pour l'homme que je veux devenir.
            Aujourd'hui, agir avec précision, calme et intensité. »
          </p>
          <div className="mt-6 h-px w-full bg-border/60" />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Prochaine action
              </div>
              <div className="mt-1 text-sm font-medium">Bloc de deep work — 90 min</div>
            </div>
            <span className="text-gold">→</span>
          </div>
        </div>
      </section>
    </div>
  );
}
