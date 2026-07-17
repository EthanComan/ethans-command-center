import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Compass,
  Heart,
  Activity,
  Brain,
  Zap,
  TrendingUp,
  Repeat,
  Flame,
} from "lucide-react";
import { useEffect, useState } from "react";
import { analyze } from "@/brain/engine";
import { computeAlignment, type DomainState } from "@/brain/alignment";
import { computeNextBestAction } from "@/brain/nba";
import { NextBestActionHero } from "@/components/next-best-action";
import { readAdn } from "@/modules/adn/data";
import { readRenaitre } from "@/modules/renaitre/data";
import { RecommendedActionCard } from "@/components/recommended-action";
import { Link } from "@tanstack/react-router";
import { todayObjectives, ancestorsOf } from "@/modules/objectifs/data";
import { HORIZON_LABEL } from "@/modules/objectifs/types";
import { globalManScore } from "@/modules/progression/data";
import { readTodayHabits, markDone, markMissed } from "@/modules/habitudes/data";
import { HABIT_PRIORITY_WEIGHT, type HabitForToday } from "@/modules/habitudes/types";

export const Route = createFileRoute("/")({
  component: Index,
});

const STATUS_COLOR: Record<DomainState["status"], string> = {
  excellent: "text-emerald-400",
  bon: "text-gold",
  attention: "text-amber-400",
  critique: "text-red-400",
};
const STATUS_DOT: Record<DomainState["status"], string> = {
  excellent: "bg-emerald-400",
  bon: "bg-gold",
  attention: "bg-amber-400",
  critique: "bg-red-400",
};

function Index() {
  const brain = analyze();
  const align = computeAlignment();
  const nba = computeNextBestAction();
  const adn = readAdn();
  const renaitre = readRenaitre();
  const todays = todayObjectives();
  const manScore = globalManScore();
  const [mounted, setMounted] = useState(false);
  const [habitItems, setHabitItems] = useState<HabitForToday[]>([]);

  useEffect(() => {
    setMounted(true);
    setHabitItems(readTodayHabits());
  }, []);

  // Rendu date côté client uniquement — évite le hydration mismatch.
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    );
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* En-tête — Centre de Commandement */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold">
            Centre de Commandement · {today || "\u00a0"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            <span className="text-gold">Qui dois-tu être aujourd'hui ?</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            {adn.identity}
          </p>
        </div>
        <Link
          to="/ia"
          className="group inline-flex items-center gap-2 rounded-md border border-border bg-elevated px-3.5 py-2 text-sm font-medium transition-colors hover:border-gold/40 hover:text-gold"
        >
          Voir l'analyse ETHAN
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* NBA — La question fondatrice d'ETHAN */}
      <NextBestActionHero nba={nba} />

      {/* Bandeau philosophie + lancement Mode Execution */}
      <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/25 bg-gradient-to-r from-gold/[0.06] via-transparent to-transparent px-5 py-4">
        <div className="flex items-center gap-4">
          <Link to="/progression" className="group inline-flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-gold" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Score d'homme</div>
              <div className="text-lg font-semibold tabular-nums text-gold transition-opacity group-hover:opacity-80">{manScore}/100</div>
            </div>
          </Link>
          <p className="max-w-md text-[12px] italic leading-relaxed text-muted-foreground">
            « ETHAN ne mesure pas seulement ce que tu fais. Il t'aide à devenir l'homme que tu as choisi d'être. »
          </p>
        </div>
        <Link
          to="/execution"
          className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          <Zap className="h-4 w-4" /> Entrer en Mode Exécution
        </Link>
      </section>

      {/* Bandeau Mission + Alignement */}
      <section className="mt-8 grid gap-3 md:grid-cols-3">
        <MissionCard
          icon={Compass}
          label="Mission du jour"
          value={align.missionToday}
        />
        <MissionCard
          icon={Heart}
          label="Mission de vie"
          value={renaitre.north}
          to="/renaitre"
        />
        <div className="rounded-xl border border-gold/30 bg-gradient-to-b from-gold/[0.08] to-transparent p-4">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Alignement global
            <Activity className="h-3.5 w-3.5 text-gold" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums text-gold">{align.globalScore}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border/40">
            <div className="h-full bg-gold" style={{ width: `${align.globalScore}%` }} />
          </div>
        </div>
      </section>

      {/* Le Cerveau — Action recommandée */}
      <RecommendedActionCard state={brain} />

      {/* État des domaines de vie */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            État des domaines de vie
          </h3>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            mis à jour en direct
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {align.domains.map((d) => (
            <div key={d.id} className="rounded-xl border border-border bg-elevated p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {d.label}
                </span>
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[d.status]}`} />
              </div>
              <div className={`mt-3 text-2xl font-semibold tabular-nums ${STATUS_COLOR[d.status]}`}>
                {d.score}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {d.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Priorités + Risques */}
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-elevated p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium tracking-tight">Priorités absolues du jour</h3>
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

        <div className="rounded-2xl border border-amber-500/30 bg-elevated p-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Risques si tu n'agis pas
          </div>
          <ul className="mt-4 space-y-3 text-[13px] text-muted-foreground">
            {align.risksIfNoAction.map((r) => (
              <li key={r} className="flex gap-2"><span className="text-amber-400">⚠</span><span className="text-foreground/90">{r}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* Habitudes du jour */}
      <section className="mt-8 rounded-2xl border border-border bg-elevated p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-gold" />
            <h3 className="text-sm font-medium tracking-tight">Habitudes du jour</h3>
          </div>
          <Link to="/habitudes" className="text-[11px] text-muted-foreground transition-colors hover:text-gold">
            Voir tout →
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-border/60">
          {habitItems
            .filter((i) => i.dueToday)
            .sort((a, b) => {
              if (a.doneToday !== b.doneToday) return a.doneToday ? 1 : -1;
              return (HABIT_PRIORITY_WEIGHT[b.habit.priority] ?? 0) - (HABIT_PRIORITY_WEIGHT[a.habit.priority] ?? 0);
            })
            .slice(0, 4)
            .map((i) => (
              <li key={i.habit.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => {
                      i.doneToday ? markMissed(i.habit.id) : markDone(i.habit.id);
                      setHabitItems(readTodayHabits());
                    }}
                    className="mt-0.5 text-muted-foreground transition-colors hover:text-gold"
                    aria-label={i.doneToday ? "Marquer non fait" : "Marquer fait"}
                  >
                    {i.doneToday ? (
                      <CheckCircle2 className="h-4 w-4 text-gold" />
                    ) : (
                      <Circle className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </button>
                  <div>
                    <p className={`text-sm ${i.doneToday ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {i.habit.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      <Flame className="mb-0.5 inline h-3 w-3 text-gold" /> {i.streak} j · {i.habit.estimatedMinutes} min
                    </p>
                  </div>
                </div>
                <span className="rounded border border-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {i.habit.category}
                </span>
              </li>
            ))}
          {habitItems.filter((i) => i.dueToday).length === 0 && (
            <li className="py-3 text-sm text-muted-foreground">Aucune habitude aujourd'hui.</li>
          )}
        </ul>
      </section>

      {/* Écarts détectés — plan de correction */}
      <section className="mt-8 rounded-2xl border border-border bg-elevated p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium tracking-tight">Écarts détectés par ETHAN</h3>
          <Link to="/ia" className="text-[11px] text-muted-foreground transition-colors hover:text-gold">
            Analyse complète →
          </Link>
        </div>
        {align.drifts.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Aucun écart significatif. Trajectoire tenue.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {align.drifts.map((d) => (
              <li key={d.id} className="py-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-sm border border-amber-500/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-amber-400">
                    écart {d.gap}%
                  </span>
                  <span className="font-medium">{d.objective}</span>
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground">{d.risk}</div>
                <div className="mt-1 text-[12px] text-gold">→ {d.correction}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Rappel ADN */}
      <section className="mt-8 rounded-2xl border border-border bg-elevated p-6">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gold">
          <Brain className="h-3.5 w-3.5" /> Rappel de ton ADN
        </div>
        <p className="mt-3 text-[13px] italic leading-relaxed text-muted-foreground">
          « {adn.principles[1]?.body ?? adn.principles[0]?.body} »
        </p>
        <Link to="/adn" className="mt-3 inline-block text-[11px] text-muted-foreground hover:text-gold">
          Voir l'ADN complet →
        </Link>
      </section>
    </div>
  );
}

function MissionCard({ icon: Icon, label, value, to }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; to?: string }) {
  const body = (
    <>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="mt-3 text-sm leading-snug text-foreground/95">{value}</div>
    </>
  );
  const cls = "block rounded-xl border border-border bg-elevated p-4 transition-colors hover:border-gold/40";
  return to ? <Link to={to} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}
