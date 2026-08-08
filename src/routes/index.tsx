import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  MapPin,
  Phone,
  Target,
  TrendingUp,
  Wallet,
  Users,
} from "lucide-react";
import { FUNNEL, formatEUR, weightedForecastEUR, pipelineValueEUR } from "@/modules/business/data";
import {
  caSignedThisMonthEUR,
  commissionsSignedThisMonthEUR,
  commissionsCashedEUR,
  commissionsPendingEUR,
  cashFlowSchedule,
} from "@/modules/business/analytics";
import { hotList } from "@/modules/business/coach";
import { readToday, BLOCK_KIND_META } from "@/modules/planning/data";
import { todayObjectives, byHorizon } from "@/modules/objectifs/data";
import { readTodayHabits } from "@/modules/habitudes/data";
import type { HabitForToday } from "@/modules/habitudes/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Centre de commandement — ETHAN" },
      { name: "description", content: "KPI du jour, chiffre d'affaires, commissions, prospects, rendez-vous et objectifs : le tableau de bord de pilotage." },
      { property: "og:title", content: "Centre de commandement — ETHAN" },
      { property: "og:description", content: "Piloter l'activité en quelques secondes : CA, commissions, pipeline, agenda et objectifs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const day = readToday();
  const objectives = todayObjectives();
  const week = byHorizon("week");
  const hot = hotList().slice(0, 4);
  const meetings = day.blocks.filter((b) => b.kind === "meeting");
  const forecast3 = cashFlowSchedule()[3];

  const [today, setToday] = useState("");
  const [habits, setHabits] = useState<HabitForToday[]>([]);
  useEffect(() => {
    setToday(new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }));
    setHabits(readTodayHabits());
  }, []);

  const due = habits.filter((h) => h.dueToday);
  const doneCount = due.filter((h) => h.doneToday).length;
  const habitPct = due.length ? Math.round((doneCount / due.length) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold">
            Centre de commandement · {today || "\u00a0"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Pilotage</h1>
        </div>
        <Link
          to="/business"
          className="group inline-flex items-center gap-2 rounded-md border border-border bg-elevated px-3.5 py-2 text-sm font-medium transition-colors hover:border-gold/40 hover:text-gold"
        >
          Ouvrir Business
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </header>

      {/* KPI financiers */}
      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="CA signé (mois)" value={formatEUR(caSignedThisMonthEUR())} sub="Volume de biens vendus" accent />
        <Kpi label="Commissions du mois" value={formatEUR(commissionsSignedThisMonthEUR())} sub="Signées sur la période" />
        <Kpi label="Encaissées" value={formatEUR(commissionsCashedEUR())} sub="Déjà sur le compte" />
        <Kpi label="En attente" value={formatEUR(commissionsPendingEUR())} sub="Signées, non versées" />
      </section>

      {/* KPI activité */}
      <section className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Prospects" value={String(FUNNEL[0]?.value ?? 0)} sub="Générés sur la période" icon={Users} />
        <Kpi label="Rendez-vous" value={String(FUNNEL[3]?.value ?? 0)} sub={`${meetings.length} aujourd'hui`} icon={Phone} />
        <Kpi label="Pipeline pondéré" value={formatEUR(weightedForecastEUR())} sub={`sur ${formatEUR(pipelineValueEUR())} en jeu`} icon={TrendingUp} />
        <Kpi
          label="Encaissement à 3 mois"
          value={formatEUR((forecast3?.securedEUR ?? 0) + (forecast3?.projectedEUR ?? 0))}
          sub="Sécurisé + pondéré"
          icon={Wallet}
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Agenda du jour */}
        <Panel title="Aujourd'hui" to="/planning" linkLabel="Planning">
          <ul className="divide-y divide-border/60">
            {day.blocks.slice(0, 6).map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-2.5">
                <span className="w-12 shrink-0 text-xs tabular-nums text-muted-foreground">{b.start}</span>
                <span className="flex-1 truncate text-sm">{b.title}</span>
                <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${BLOCK_KIND_META[b.kind].tone}`}>
                  {BLOCK_KIND_META[b.kind].label}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Dossiers prioritaires */}
        <Panel title="Dossiers prioritaires" to="/business" linkLabel="Pipeline">
          <ul className="divide-y divide-border/60">
            {hot.map(({ deal, temperature }) => (
              <li key={deal.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm">{deal.client}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {deal.program} · {deal.probability}% · {deal.daysSinceContact} j
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums text-gold">{formatEUR(deal.commissionEUR)}</p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{temperature}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Tâches prioritaires */}
        <Panel title="Tâches prioritaires" to="/objectifs" linkLabel="Objectifs">
          <ul className="divide-y divide-border/60">
            {objectives.map((o) => (
              <li key={o.id} className="flex items-start gap-3 py-2.5">
                {o.progress >= 100 ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                )}
                <span className="flex-1 text-sm">{o.title}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{o.progress}%</span>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Objectifs de la semaine */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-elevated p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium tracking-tight">Objectifs de la semaine</h3>
            <Link to="/objectifs" className="text-[11px] text-muted-foreground transition-colors hover:text-gold">
              Voir tout →
            </Link>
          </div>
          <ul className="mt-4 space-y-4">
            {week.map((o) => (
              <li key={o.id}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{o.title}</span>
                  <span className="tabular-nums text-muted-foreground">{o.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/40">
                  <div className="h-full bg-gold" style={{ width: `${o.progress}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* État de performance */}
        <div className="rounded-2xl border border-border bg-elevated p-6">
          <h3 className="text-sm font-medium tracking-tight">État de performance</h3>
          <div className="mt-4 space-y-4">
            <Metric icon={Flame} label="Habitudes du jour" value={`${doneCount}/${due.length}`} pct={habitPct} to="/habitudes" />
            <Metric icon={Target} label="Conversion RDV → offre" value={`${FUNNEL[4]?.value ?? 0}/${FUNNEL[3]?.value ?? 0}`} pct={FUNNEL[3]?.value ? Math.round(((FUNNEL[4]?.value ?? 0) / FUNNEL[3].value) * 100) : 0} to="/business" />
            <Metric icon={Clock} label="Blocs planifiés" value={String(day.blocks.length)} pct={Math.min(100, day.blocks.length * 8)} to="/planning" />
          </div>
        </div>
      </section>

      {meetings.length > 0 && (
        <section className="mt-6 rounded-2xl border border-border bg-elevated p-6">
          <h3 className="text-sm font-medium tracking-tight">Rendez-vous du jour</h3>
          <ul className="mt-4 divide-y divide-border/60">
            {meetings.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <span className="w-24 shrink-0 tabular-nums text-muted-foreground">{m.start} → {m.end}</span>
                <span className="flex-1">{m.title}</span>
                {m.location && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {m.location}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "border-gold/35 bg-gradient-to-b from-gold/[0.08] to-transparent" : "border-border bg-elevated"}`}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
        {Icon && <Icon className="h-3.5 w-3.5" />}
      </div>
      <div className={`mt-3 text-2xl font-semibold tabular-nums ${accent ? "text-gold" : "text-foreground"}`}>{value}</div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Panel({
  title,
  to,
  linkLabel,
  children,
}: {
  title: string;
  to: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-elevated p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium tracking-tight">{title}</h3>
        <Link to={to} className="text-[11px] text-muted-foreground transition-colors hover:text-gold">
          {linkLabel} →
        </Link>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  pct,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  pct: number;
  to: string;
}) {
  return (
    <Link to={to} className="block">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-gold" /> {label}
        </span>
        <span className="tabular-nums text-foreground">{value}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/40">
        <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
