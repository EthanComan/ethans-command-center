import { createFileRoute } from "@tanstack/react-router";
import { readAxes, globalManScore } from "@/modules/progression/data";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/progression")({
  head: () => ({
    meta: [
      { title: "Progression — ETHAN" },
      { name: "description", content: "L'evolution de l'homme sur 8 axes : discipline, competences, reseau, sante, patrimoine, impact, constance, mission." },
    ],
  }),
  component: ProgressionPage,
});

function ProgressionPage() {
  const axes = readAxes();
  const score = globalManScore();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Principe 4 · Progression de l'homme</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Deviens-tu <span className="text-gold">l'homme que tu as choisi d'etre</span> ?
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        On ne mesure pas seulement des resultats. On mesure l'evolution sur 8 axes qui construisent l'homme.
      </p>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <div className="md:col-span-1 rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.08] to-transparent p-6">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Score d'homme
            <TrendingUp className="h-3.5 w-3.5 text-gold" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tabular-nums text-gold">{score}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Moyenne des 8 axes fondamentaux. Chaque trimestre, cette valeur raconte qui tu deviens.
          </p>
        </div>
        <div className="md:col-span-2 rounded-2xl border border-border bg-elevated p-6">
          <h3 className="text-sm font-medium tracking-tight">Philosophie</h3>
          <p className="mt-3 text-[13px] italic leading-relaxed text-muted-foreground">
            « ETHAN ne mesure pas seulement ce que je fais. Il m'aide a devenir l'homme que j'ai choisi d'etre. »
          </p>
        </div>
      </div>

      <section className="mt-8 grid gap-3 md:grid-cols-2">
        {axes.map((a) => {
          const delta = a.now - a.trend[0];
          const max = Math.max(...a.trend, a.now);
          return (
            <div key={a.id} className="rounded-xl border border-border bg-elevated p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{a.label}</h4>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">via {a.source}</span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tabular-nums text-gold">{a.now}</span>
                <span className={`text-xs font-medium ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {delta >= 0 ? "+" : ""}{delta} sur 6 trimestres
                </span>
              </div>
              <div className="mt-3 flex h-10 items-end gap-1">
                {a.trend.map((v, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-border" style={{ height: `${(v / max) * 100}%` }} />
                ))}
                <div className="flex-1 rounded-sm bg-gold" style={{ height: `${(a.now / max) * 100}%` }} />
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{a.why}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}