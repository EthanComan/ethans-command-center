import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Briefcase,
  Building2,
  Phone,
  Search,
  Presentation,
  Handshake,
  Lock,
  Megaphone,
  BarChart3,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Gavel,
  Euro,
  Flame,
  Timer,
} from "lucide-react";
import {
  DEALS,
  PROGRAMS,
  OFF_MARKET,
  FUNNEL,
  MARKETING_LEVERS,
  analyzeFunnel,
  weakestLink,
  pipelineValueEUR,
  weightedForecastEUR,
  dealsByStage,
  directives,
  formatEUR,
} from "@/modules/business/data";
import {
  BTOB_PROFILE_LABEL,
  COMMISSION_TIER,
  LEAD_CHANNEL_LABEL,
  PROGRAM_STATUS_LABEL,
  STAGE_GATE,
  STAGE_LABEL,
  STAGE_ORDER,
  tierOf,
} from "@/modules/business/types";
import {
  ANCIEN_TRADEOFFS,
  DISCOVERY_FRAMEWORK,
  NEUF_ADVANTAGES,
  OBJECTIONS,
  PHONE_PLAYBOOK,
  VEFA_GUARANTEES,
  VEFA_PROCESS,
} from "@/modules/business/vefa";
import { verdicts, weeklyDecision, hotList } from "@/modules/business/coach";
import {
  activityGaps,
  ACTIVITY_LABEL,
  analyzeSources,
  byChannel,
  byCity,
  byDeveloper,
  byTypology,
  cashFlowSchedule,
  caSignedThisMonthEUR,
  commissionsCashedEUR,
  commissionsPendingEUR,
  commissionsSignedThisMonthEUR,
  pipelineCounters,
  temperatureMix,
  weekHours,
} from "@/modules/business/analytics";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Business — Immobilier neuf VEFA | ETHAN" },
      {
        name: "description",
        content:
          "Directeur commercial personnel spécialisé en immobilier neuf : pipeline VEFA, off-market, marketing, performance et maîtrise du métier.",
      },
      { property: "og:title", content: "Business — Immobilier neuf VEFA | ETHAN" },
      {
        property: "og:description",
        content:
          "Pilotage complet de l'activité de commercialisation VEFA : prospects, appels, découverte, recherche, présentation, vente et opérations de prestige.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BusinessPage,
});

type TabId =
  | "decisions"
  | "pilotage"
  | "commissions"
  | "pipeline"
  | "programmes"
  | "offmarket"
  | "marketing"
  | "metier";

const TABS: { id: TabId; label: string; icon: typeof Briefcase }[] = [
  { id: "decisions", label: "Décisions", icon: Gavel },
  { id: "pilotage", label: "Pilotage", icon: BarChart3 },
  { id: "commissions", label: "Commissions", icon: Euro },
  { id: "pipeline", label: "Pipeline", icon: Handshake },
  { id: "programmes", label: "Programmes", icon: Building2 },
  { id: "offmarket", label: "Off-market", icon: Lock },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "metier", label: "Le métier", icon: GraduationCap },
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-elevated/40 p-4 ${className}`}>{children}</div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{children}</div>
  );
}

function BusinessPage() {
  const [tab, setTab] = useState<TabId>("decisions");
  const funnel = useMemo(() => analyzeFunnel(), []);
  const weak = useMemo(() => weakestLink(), []);
  const orders = useMemo(() => directives().slice(0, 5), []);
  const byStage = useMemo(() => dealsByStage(), []);
  const calls = useMemo(() => verdicts(), []);
  const decision = useMemo(() => weeklyDecision(), []);
  const hot = useMemo(() => hotList(), []);
  const counters = useMemo(() => pipelineCounters(), []);
  const temps = useMemo(() => temperatureMix(), []);
  const sources = useMemo(() => analyzeSources(), []);
  const activity = useMemo(() => activityGaps(), []);
  const cash = useMemo(() => cashFlowSchedule(), []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <header>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5 text-gold" />
          Business · Immobilier neuf (VEFA)
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Ton directeur commercial
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Attirer plus de clients qualifiés, vendre mieux que la concurrence, bâtir un réseau
          exceptionnel. Chaque commission finance Renaître — et chaque dossier construit l'homme
          capable de tenir une activité d'excellence.
        </p>
      </header>

      {/* Compteurs du pipeline — la photo complète en un regard */}
      <section className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {counters.map((c) => (
          <Card key={c.id} className="p-3">
            <Label>{c.label}</Label>
            <div
              className={`mt-1 text-lg font-semibold tabular-nums ${c.money ? "text-gold" : ""}`}
            >
              {c.value}
            </div>
            <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{c.hint}</div>
          </Card>
        ))}
      </section>

      {/* Tabs */}
      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-t-md px-3 py-2 text-xs transition-colors ${
                active
                  ? "border-b-2 border-gold text-gold"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </nav>

      {tab === "decisions" && (
        <div className="mt-6 space-y-6">
          {decision && (
            <section>
              <Label>La décision de la semaine</Label>
              <div className="mt-2 rounded-xl border border-gold/40 bg-gold/[0.06] p-4">
                <div className="text-base font-semibold leading-snug">{decision.statement}</div>
                <div className="mt-2 text-xs text-muted-foreground">{decision.evidence}</div>
                <div className="mt-3 flex items-start gap-1.5 text-sm text-gold">
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {decision.order}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Link
                    to="/execution"
                    className="rounded-md border border-gold/50 bg-gold/10 px-3 py-1.5 text-xs text-gold transition-colors hover:bg-gold/20"
                  >
                    Exécuter maintenant
                  </Link>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {decision.minutes} min · priorité {decision.score}
                  </span>
                </div>
              </div>
            </section>
          )}

          <section className="grid grid-cols-3 gap-2">
            {(["chaud", "tiede", "froid"] as const).map((t) => (
              <Card key={t} className="p-3">
                <Label>{t === "chaud" ? "Chauds" : t === "tiede" ? "Tièdes" : "Froids"}</Label>
                <div
                  className={`mt-1 text-xl font-semibold tabular-nums ${
                    t === "chaud" ? "text-gold" : t === "froid" ? "text-muted-foreground" : ""
                  }`}
                >
                  {temps[t]}
                </div>
              </Card>
            ))}
          </section>

          <section>
            <h2 className="text-sm font-semibold">Ce que te dit ton directeur commercial</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Des verdicts, pas des tableaux. Chaque phrase se termine par un ordre.
            </p>
            <div className="mt-3 space-y-2">
              {calls.map((v) => (
                <Card
                  key={v.id}
                  className={
                    v.tone === "challenge"
                      ? "border-red-400/30 bg-red-500/[0.05]"
                      : v.tone === "decision"
                        ? "border-gold/30"
                        : ""
                  }
                >
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
                    <span
                      className={
                        v.tone === "challenge"
                          ? "text-red-300"
                          : v.tone === "decision"
                            ? "text-gold"
                            : "text-muted-foreground"
                      }
                    >
                      {v.tone === "challenge"
                        ? "Challenge"
                        : v.tone === "decision"
                          ? "Décision"
                          : "Diagnostic"}
                    </span>
                    <span className="text-muted-foreground">{v.minutes} min</span>
                  </div>
                  <div className="mt-1.5 text-sm font-medium leading-snug">{v.statement}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{v.evidence}</div>
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-foreground/90">
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                    {v.order}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Flame className="h-3.5 w-3.5 text-gold" /> Ordre de traitement des dossiers
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Commission × probabilité × urgence. Tu descends la liste, tu ne choisis pas.
            </p>
            <div className="mt-3 space-y-1.5">
              {hot.map((h, i) => (
                <Card key={h.deal.id} className="flex items-center gap-3 p-3">
                  <span className="text-xs font-semibold tabular-nums text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{h.deal.client}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {STAGE_LABEL[h.deal.stage]} · {h.deal.daysSinceContact} j sans contact
                    </div>
                  </div>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                      h.temperature === "chaud"
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : h.temperature === "tiede"
                          ? "border-border text-foreground/70"
                          : "border-border text-muted-foreground"
                    }`}
                  >
                    {h.temperature}
                  </span>
                  <span className="text-xs tabular-nums text-gold">
                    {formatEUR(h.deal.commissionEUR)}
                  </span>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Timer className="h-3.5 w-3.5 text-gold" /> Où part réellement ton temps ·{" "}
              {weekHours()} h cette semaine
            </h2>
            <div className="mt-3 space-y-2">
              {activity.map((a) => (
                <div key={a.kind}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-foreground/90">{ACTIVITY_LABEL[a.kind]}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {a.hours} h · {a.share}%{" "}
                      <span className={a.gap > 5 ? "text-red-300" : a.gap < -5 ? "text-amber-300" : "text-emerald-300"}>
                        (cible {a.target}%)
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-elevated">
                    <div
                      className={a.gap > 5 ? "h-1.5 bg-red-400/70" : "h-1.5 bg-gold/70"}
                      style={{ width: `${Math.min(100, a.share)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "commissions" && (
        <div className="mt-6 space-y-6">
          <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Card>
              <Label>CA signé ce mois</Label>
              <div className="mt-1 text-xl font-semibold tabular-nums">
                {formatEUR(caSignedThisMonthEUR())}
              </div>
            </Card>
            <Card>
              <Label>Commissions signées</Label>
              <div className="mt-1 text-xl font-semibold tabular-nums text-gold">
                {formatEUR(commissionsSignedThisMonthEUR())}
              </div>
            </Card>
            <Card>
              <Label>En attente de versement</Label>
              <div className="mt-1 text-xl font-semibold tabular-nums">
                {formatEUR(commissionsPendingEUR())}
              </div>
            </Card>
            <Card>
              <Label>Déjà encaissé</Label>
              <div className="mt-1 text-xl font-semibold tabular-nums">
                {formatEUR(commissionsCashedEUR())}
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Encaissements projetés</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {cash.map((c) => (
                <Card key={c.offset}>
                  <Label>{c.offset === 0 ? "Ce mois-ci" : `Dans ${c.offset} mois`}</Label>
                  <div className="mt-1 text-lg font-semibold tabular-nums text-gold">
                    {formatEUR(c.securedEUR)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    sécurisé
                    {c.projectedEUR > 0 && ` · +${formatEUR(c.projectedEUR)} pipeline pondéré`}
                  </div>
                </Card>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Pipeline total : {formatEUR(pipelineValueEUR())} · prévision honnête pondérée :{" "}
              {formatEUR(weightedForecastEUR())} sur {DEALS.length} dossiers actifs.
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Promoteur le plus rentable", rows: byDeveloper() },
              { title: "Type de bien le plus rentable", rows: byTypology() },
              { title: "Secteur le plus performant", rows: byCity() },
              { title: "Canal d'acquisition le plus rentable", rows: byChannel() },
            ].map((block) => (
              <div key={block.title}>
                <h2 className="text-sm font-semibold">{block.title}</h2>
                <div className="mt-2 space-y-1.5">
                  {block.rows.map((r) => (
                    <Card key={r.key} className="p-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm">{r.label}</span>
                        <span className="shrink-0 text-xs tabular-nums text-gold">
                          {formatEUR(r.commissionEUR)} · {r.share}%
                        </span>
                      </div>
                      <div className="mt-1 h-1 rounded-full bg-elevated">
                        <div className="h-1 rounded-full bg-gold/70" style={{ width: `${r.share}%` }} />
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        {r.count} vente{r.count > 1 ? "s" : ""} · {formatEUR(r.volumeEUR)} de volume
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section>
            <h2 className="text-sm font-semibold">Rentabilité par source d'acquisition</h2>
            <div className="mt-2 space-y-1.5">
              {sources.map((s) => (
                <Card key={s.source} className="p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">{s.source}</span>
                    <span className="text-xs tabular-nums text-gold">
                      {formatEUR(s.valuePerLeadEUR)} / lead
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {LEAD_CHANNEL_LABEL[s.channel]} · {s.leads} leads · {s.convRdv}% en RDV ·{" "}
                    {s.ventes} vente{s.ventes > 1 ? "s" : ""} · {formatEUR(s.commissionEUR)}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "pilotage" && (
        <div className="mt-6 space-y-6">
          <section>
            <h2 className="text-sm font-semibold">Les ordres du directeur commercial</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Classés par impact sur le chiffre. Fais-les dans l'ordre.
            </p>
            <div className="mt-3 space-y-2">
              {orders.map((d, i) => (
                <Card key={d.id} className="flex items-start gap-3">
                  <div className="mt-0.5 text-xs font-semibold tabular-nums text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{d.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{d.why}</div>
                    <div className="mt-1 text-xs text-foreground/80">{d.impact}</div>
                    <div className="mt-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      <span>Score {d.score}</span>
                      <span>{d.minutes} min</span>
                    </div>
                  </div>
                  <Link
                    to="/execution"
                    className="shrink-0 rounded-md border border-gold/40 px-2.5 py-1 text-[11px] text-gold transition-colors hover:bg-gold/10"
                  >
                    Exécuter
                  </Link>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Performance commerciale — entonnoir du mois</h2>
            <div className="mt-3 space-y-2">
              {FUNNEL.map((s, i) => {
                const conv = funnel[i - 1];
                const width = Math.max(6, Math.round((s.value / FUNNEL[0].value) * 100));
                return (
                  <div key={s.id}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-foreground/90">{s.label}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {s.value}
                        {conv && (
                          <span className={conv.gap < 0 ? " text-red-300" : " text-emerald-300"}>
                            {" "}
                            · {conv.rate}% (cible {conv.target}%)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-elevated">
                      <div
                        className="h-1.5 rounded-full bg-gold/70"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {weak && (
              <Card className="mt-4 border-red-400/30 bg-red-500/[0.06]">
                <Label>Point faible identifié</Label>
                <div className="mt-1 text-sm">
                  {weak.from} → {weak.to} : {weak.rate}% contre {weak.target}% attendus.
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Tant que ce maillon n'est pas corrigé, augmenter le volume en amont ne fera que
                  gaspiller des prospects.
                </div>
              </Card>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold">Paliers de commission</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {Object.entries(COMMISSION_TIER).map(([k, t]) => (
                <Card key={k}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium">{t.label}</span>
                    <span className="text-xs tabular-nums text-gold">
                      {formatEUR(t.fromEUR)}
                      {t.toEUR ? ` – ${formatEUR(t.toEUR)}` : " +"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{t.note}</div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "pipeline" && (
        <div className="mt-6 space-y-5">
          {byStage.map(({ stage, deals }) => (
            <section key={stage}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold">{STAGE_LABEL[stage]}</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {deals.length} dossier{deals.length > 1 ? "s" : ""}
                </span>
              </div>
              <p className="mt-1 text-xs italic text-muted-foreground">{STAGE_GATE[stage]}</p>
              {deals.length > 0 && (
                <div className="mt-2 space-y-2">
                  {deals.map((d) => (
                    <Card key={d.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div className="text-sm font-medium">
                          {d.client}
                          {d.confidential && (
                            <Lock className="ml-1.5 inline h-3 w-3 text-gold" aria-label="Confidentiel" />
                          )}
                        </div>
                        <div className="text-xs tabular-nums text-gold">
                          {formatEUR(d.commissionEUR)} · {d.probability}%
                        </div>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-[0.14em]">
                        <span className="rounded border border-border bg-background/40 px-1.5 py-0.5 text-muted-foreground">
                          {d.clientType === "btob"
                            ? d.btobProfile
                              ? BTOB_PROFILE_LABEL[d.btobProfile]
                              : "BtoB"
                            : "BtoC"}
                        </span>
                        <span className="rounded border border-border bg-background/40 px-1.5 py-0.5 text-muted-foreground">
                          {LEAD_CHANNEL_LABEL[d.channel]}
                        </span>
                        <span className="rounded border border-border bg-background/40 px-1.5 py-0.5 text-muted-foreground">
                          {COMMISSION_TIER[tierOf(d.commissionEUR)].label}
                        </span>
                        {d.program && (
                          <span className="rounded border border-border bg-background/40 px-1.5 py-0.5 text-muted-foreground">
                            {d.program}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-foreground/85">
                        <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                        {d.nextAction}
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        Dernier contact il y a {d.daysSinceContact} j
                        {d.notes ? ` · ${d.notes}` : ""}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {tab === "programmes" && (
        <div className="mt-6 space-y-2">
          {PROGRAMS.map((p) => (
            <Card key={p.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-sm font-medium">
                  {p.name}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {p.developer} · {p.city}
                  </span>
                </div>
                <div className="text-xs tabular-nums text-gold">
                  dès {formatEUR(p.priceFromEUR)} · honoraires {p.feeRate}%
                </div>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-[0.14em]">
                <span
                  className={`rounded border px-1.5 py-0.5 ${
                    p.prestige
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-border bg-background/40 text-muted-foreground"
                  }`}
                >
                  {PROGRAM_STATUS_LABEL[p.status]}
                </span>
                <span className="rounded border border-border bg-background/40 px-1.5 py-0.5 text-muted-foreground">
                  {p.lotsAvailable} lots
                </span>
                {p.typologies.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-border bg-background/40 px-1.5 py-0.5 text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-xs text-foreground/85">{p.angle}</div>
            </Card>
          ))}
        </div>
      )}

      {tab === "offmarket" && (
        <div className="mt-6 space-y-3">
          <Card className="border-gold/30 bg-gold/[0.05]">
            <div className="flex items-center gap-2 text-xs text-gold">
              <ShieldCheck className="h-3.5 w-3.5" />
              Confidentialité maximale
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ces dossiers proviennent du réseau des promoteurs. Aucune diffusion sans NDA, aucun nom
              de vendeur communiqué, honoraires cadrés avant toute présentation.
            </p>
          </Card>
          {OFF_MARKET.map((o) => (
            <Card key={o.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-sm font-medium">{o.codename}</div>
                <div className="text-xs tabular-nums text-gold">{formatEUR(o.valueEUR)}</div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {o.developerNetwork} · {o.location}
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>Honoraires</Label>
                  <div className="text-xs">
                    Mandat {o.mandate} · {o.feeRate}% · à la charge de l'{o.feePaidBy === "acquereur" ? "acquéreur" : o.feePaidBy}
                  </div>
                  {o.conditions && (
                    <div className="mt-1 text-[11px] text-muted-foreground">{o.conditions}</div>
                  )}
                </div>
                <div>
                  <Label>Intervenants</Label>
                  <ul className="text-xs text-muted-foreground">
                    {o.stakeholders.map((s) => (
                      <li key={s.name}>
                        <span className="text-foreground/90">{s.name}</span> — {s.role}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-2 flex items-start gap-1.5 text-xs text-foreground/85">
                <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                {o.nextStep}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Étape : {o.stage} · Confidentialité {o.confidentiality}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "marketing" && (
        <div className="mt-6 space-y-2">
          <p className="text-xs text-muted-foreground">
            Objectif : devenir la référence nationale. Chaque détail se teste et s'améliore.
          </p>
          {MARKETING_LEVERS.map((l) => (
            <Card key={l.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-sm font-medium">{l.asset}</div>
                <div className="text-xs tabular-nums">
                  <span className={l.current < l.target ? "text-red-300" : "text-emerald-300"}>
                    {l.current}
                    {l.unit}
                  </span>
                  <span className="text-muted-foreground"> / cible {l.target}{l.unit}</span>
                </div>
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {LEAD_CHANNEL_LABEL[l.channel]} · {l.metric}
              </div>
              <div className="mt-2 text-xs text-foreground/85">{l.optimisation}</div>
            </Card>
          ))}
        </div>
      )}

      {tab === "metier" && (
        <div className="mt-6 space-y-6">
          <section>
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Phone className="h-3.5 w-3.5 text-gold" /> Playbook téléphone
            </h2>
            <div className="mt-3 space-y-2">
              {PHONE_PLAYBOOK.map((p) => (
                <Card key={p.id}>
                  <div className="text-sm font-medium">{p.phase}</div>
                  <div className="text-xs text-muted-foreground">{p.goal}</div>
                  <ul className="mt-2 space-y-1 text-xs text-foreground/85">
                    {p.moves.map((m) => (
                      <li key={m} className="flex gap-1.5">
                        <span className="text-gold">·</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Search className="h-3.5 w-3.5 text-gold" /> Découverte du projet de vie
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Le bien est une conséquence du projet. Les 6 dimensions sont obligatoires avant toute
              recherche.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {DISCOVERY_FRAMEWORK.map((d) => (
                <Card key={d.id}>
                  <div className="text-sm font-medium">{d.label}</div>
                  <div className="mt-1 text-xs italic text-gold/90">« {d.question} »</div>
                  <div className="mt-1 text-xs text-muted-foreground">{d.why}</div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Building2 className="h-3.5 w-3.5 text-gold" /> Fonctionnement de la VEFA
            </h2>
            <div className="mt-3 space-y-2">
              {VEFA_PROCESS.map((k) => (
                <Card key={k.id}>
                  <div className="text-sm font-medium">{k.title}</div>
                  <div className="text-xs text-gold/90">{k.summary}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{k.detail}</div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" /> Garanties du neuf
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {VEFA_GUARANTEES.map((k) => (
                <Card key={k.id}>
                  <div className="text-sm font-medium">{k.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{k.detail}</div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Presentation className="h-3.5 w-3.5 text-gold" /> Neuf vs ancien — argumentaire
              objectif
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Avantages du neuf</Label>
                {NEUF_ADVANTAGES.map((k) => (
                  <Card key={k.id}>
                    <div className="text-sm font-medium">{k.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{k.detail}</div>
                  </Card>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Ce que l'ancien garde pour lui</Label>
                {ANCIEN_TRADEOFFS.map((k) => (
                  <Card key={k.id}>
                    <div className="text-sm font-medium">{k.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{k.detail}</div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Objections courantes</h2>
            <div className="mt-3 space-y-2">
              {OBJECTIONS.map((o) => (
                <Card key={o.id}>
                  <div className="text-sm font-medium">« {o.objection} »</div>
                  <div className="mt-1 text-xs text-foreground/85">{o.answer}</div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Double expertise BtoC / BtoB</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.values(BTOB_PROFILE_LABEL).map((l) => (
                <span
                  key={l}
                  className="rounded border border-border bg-elevated/60 px-2 py-1 text-[11px] text-muted-foreground"
                >
                  {l}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              En BtoB, la décision est financière : rendement, remise de bloc, calendrier de
              livraison, sortie. En BtoC, elle est émotionnelle et validée par la raison. Les deux
              exigent la même découverte, pas le même vocabulaire.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Étapes du métier</h2>
            <ol className="mt-3 space-y-2">
              {STAGE_ORDER.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="text-xs tabular-nums text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div className="text-sm font-medium">{STAGE_LABEL[s]}</div>
                    <div className="text-xs text-muted-foreground">{STAGE_GATE[s]}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </div>
  );
}