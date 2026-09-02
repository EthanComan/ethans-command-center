import { createFileRoute } from "@tanstack/react-router";
import { Activity, Dumbbell, HeartPulse, Brain } from "lucide-react";
import {
  METRICS,
  PILLAR_LABEL,
  energyIndex,
  performanceVerdict,
  pillarScore,
  type Pillar,
} from "@/modules/performance/data";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Performance — ETHAN" },
      { name: "description", content: "Sport, sante et mental reunis : la capacite reelle d'execution du systeme." },
      { property: "og:title", content: "Performance — ETHAN" },
      { property: "og:description", content: "Sport, sante, mental : le socle physique de l'execution commerciale." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PerformancePage,
});

const ICONS: Record<Pillar, typeof Dumbbell> = {
  sport: Dumbbell,
  sante: HeartPulse,
  mental: Brain,
};

const TONE: Record<string, string> = {
  rouge: "border-destructive/40 text-destructive",
  orange: "border-gold/40 text-gold",
  vert: "border-emerald-500/40 text-emerald-400",
};

function PerformancePage() {
  const verdict = performanceVerdict();
  const index = energyIndex();
  const pillars: Pillar[] = ["sport", "sante", "mental"];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Performance</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Le corps est <span className="text-gold">l'infrastructure de l'exécution</span>
      </h1>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.08] to-transparent p-6">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Capacité d'exécution
            <Activity className="h-3.5 w-3.5 text-gold" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tabular-nums text-gold">{index}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className={`md:col-span-2 rounded-2xl border bg-elevated p-6 ${TONE[verdict.level]}`}>
          <p className="text-[10px] uppercase tracking-[0.2em]">Verdict</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">{verdict.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{verdict.why}</p>
          <p className="mt-3 text-sm font-medium text-foreground">→ {verdict.order}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {pillars.map((p) => {
          const Icon = ICONS[p];
          const score = pillarScore(p);
          return (
            <section key={p} className="rounded-2xl border border-border bg-elevated p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4 text-gold" /> {PILLAR_LABEL[p]}
                </h3>
                <span className="text-sm font-semibold tabular-nums text-gold">{score}</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-gold" style={{ width: `${score}%` }} />
              </div>
              <ul className="mt-4 space-y-3">
                {METRICS.filter((m) => m.pillar === p).map((m) => (
                  <li key={m.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{m.label}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {m.value}{m.unit} <span className="text-muted-foreground/60">/ {m.target}{m.unit}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/80">{m.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
