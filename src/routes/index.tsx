import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Flame,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react";
import { analyze } from "@/brain/engine";
import { RecommendedActionCard } from "@/components/recommended-action";
import { Link } from "@tanstack/react-router";
import { todayObjectives, ancestorsOf } from "@/modules/objectifs/data";
import { HORIZON_LABEL } from "@/modules/objectifs/types";

export const Route = createFileRoute("/")({
  component: Index,
});

const today = new Date().toLocaleDateString("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const kpis = [
  { label: "Focus", value: "4h 20", delta: "+18%", icon: Clock },
  { label: "Deals actifs", value: "12", delta: "+2", icon: TrendingUp },
  { label: "Habitudes", value: "6/7", delta: "streak 14j", icon: Flame },
  { label: "Énergie", value: "8.2", delta: "sur 10", icon: Sparkles },
];

function Index() {
  const brain = analyze();
  const todays = todayObjectives();
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {today}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Bonjour. Voici la meilleure action{" "}
            <span className="text-gold">à exécuter maintenant</span>.
          </h1>
        </div>
        <button className="group inline-flex items-center gap-2 rounded-md border border-border bg-elevated px-3.5 py-2 text-sm font-medium transition-colors hover:border-gold/40 hover:text-gold">
          Ouvrir ETHAN
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Le Cerveau — Action recommandée */}
      <RecommendedActionCard state={brain} />

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
            <Link
              to="/objectifs"
              className="text-[11px] text-muted-foreground transition-colors hover:text-gold"
            >
              Voir la hiérarchie →
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border/60">
            {todays.map((o) => {
              const chain = ancestorsOf(o.id);
              const parent = chain[chain.length - 1];
              return (
                <li key={o.id} className="py-3">
                  <Link
                    to="/objectifs"
                    className="group flex items-start gap-3"
                  >
                    {o.progress >= 100 ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-gold" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                    )}
                    <div className="flex-1">
                      <div className="text-sm transition-colors group-hover:text-gold">
                        {o.title}
                      </div>
                      {parent && (
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          ← {HORIZON_LABEL[parent.horizon]} · {parent.title}
                        </div>
                      )}
                    </div>
                    <span className="rounded-sm border border-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {o.linkedModules[0] ?? "personnel"}
                    </span>
                  </Link>
                </li>
              );
            })}
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
