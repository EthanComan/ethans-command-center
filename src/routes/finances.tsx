import { createFileRoute } from "@tanstack/react-router";
import { Wallet, Landmark, TrendingUp, AlertTriangle } from "lucide-react";
import {
  ASSETS,
  FLOWS,
  allocation,
  debtEUR,
  destination,
  eur,
  financeVerdict,
  monthlyChargesEUR,
  monthlyIncomeEUR,
  netMonthlyEUR,
  netWorthEUR,
  pendingEUR,
  runwayMonths,
  savingsRatePct,
  upcomingCash,
} from "@/modules/finances/data";

export const Route = createFileRoute("/finances")({
  head: () => ({
    meta: [
      { title: "Finances — ETHAN" },
      { name: "description", content: "Cash-flow, patrimoine et investissements reunis : ce qui rentre, ce qui reste, et la distance jusqu'a la destination." },
      { property: "og:title", content: "Finances — ETHAN" },
      { property: "og:description", content: "Cash-flow, patrimoine, investissements et destination financiere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FinancesPage,
});

const VERDICT_TONE: Record<string, string> = {
  critique: "border-destructive/40 text-destructive",
  attention: "border-gold/40 text-gold",
  solide: "border-emerald-500/40 text-emerald-400",
};

function FinancesPage() {
  const verdict = financeVerdict();
  const d = destination();
  const alloc = allocation();

  const kpis = [
    { label: "Revenus / mois", value: eur(monthlyIncomeEUR()) },
    { label: "Charges / mois", value: eur(monthlyChargesEUR()) },
    { label: "Net / mois", value: eur(netMonthlyEUR()) },
    { label: "Taux d'épargne", value: `${savingsRatePct()}%` },
    { label: "Runway", value: `${runwayMonths()} mois` },
    { label: "En attente", value: eur(pendingEUR()) },
    { label: "Patrimoine net", value: eur(netWorthEUR()) },
    { label: "Dette", value: eur(debtEUR()) },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Patrimoine</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Finances — <span className="text-gold">cash-flow, patrimoine, investissements</span>
      </h1>

      <section className={`mt-6 rounded-2xl border bg-elevated p-6 ${VERDICT_TONE[verdict.level]}`}>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
          <AlertTriangle className="h-3.5 w-3.5" /> Verdict financier
        </div>
        <h2 className="mt-3 text-xl font-semibold text-foreground">{verdict.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{verdict.why}</p>
        <p className="mt-3 text-sm font-medium text-foreground">→ {verdict.order}</p>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-elevated p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{k.label}</p>
            <p className="mt-2 text-lg font-semibold tabular-nums">{k.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.07] to-transparent p-6">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Destination · {eur(d.targetEUR)} / mois
          <TrendingUp className="h-3.5 w-3.5 text-gold" />
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-gold" style={{ width: `${Math.max(2, d.progress)}%` }} />
        </div>
        <div className="mt-3 grid gap-3 text-sm md:grid-cols-4">
          <p className="text-muted-foreground">Avancement <span className="font-semibold text-foreground">{d.progress}%</span></p>
          <p className="text-muted-foreground">Prochain palier <span className="font-semibold text-foreground">{eur(d.nextMilestone.monthlyEUR)}</span></p>
          <p className="text-muted-foreground">Rythme hebdo requis <span className="font-semibold text-foreground">{eur(d.weeklyEUR)}</span></p>
          <p className="text-muted-foreground">Ventes / mois <span className="font-semibold text-foreground">{d.salesPerMonth}</span></p>
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-elevated p-6">
          <h3 className="flex items-center gap-2 text-sm font-medium"><Wallet className="h-4 w-4 text-gold" /> Flux mensuels</h3>
          <ul className="mt-4 space-y-2">
            {FLOWS.map((f) => (
              <li key={f.id} className="flex items-center justify-between border-b border-border/60 pb-2 text-sm last:border-0">
                <span>
                  {f.label}
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">{f.category}{f.recurrent ? " · récurrent" : ""}</span>
                </span>
                <span className={`tabular-nums ${f.kind === "revenu" ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {f.kind === "revenu" ? "+" : "−"}{eur(f.amountEUR)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-elevated p-6">
          <h3 className="flex items-center gap-2 text-sm font-medium"><Landmark className="h-4 w-4 text-gold" /> Patrimoine & investissements</h3>
          <ul className="mt-4 space-y-2">
            {ASSETS.map((a) => (
              <li key={a.id} className="flex items-center justify-between border-b border-border/60 pb-2 text-sm last:border-0">
                <span>
                  {a.label}
                  {a.yieldPct != null && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-gold">{a.yieldPct}% / an</span>
                  )}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {eur(a.valueEUR - a.debtEUR)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {alloc.map((a) => (
              <span key={a.kind} className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground">
                {a.kind} · {a.share}%
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-elevated p-6">
        <h3 className="text-sm font-medium">Encaissements projetés</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {upcomingCash().map((m) => (
            <div key={m.label} className="rounded-xl border border-border p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{m.label}</p>
              <p className="mt-2 text-base font-semibold tabular-nums">{eur(m.amountEUR)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
