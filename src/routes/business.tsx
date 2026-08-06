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

type TabId = "pilotage" | "pipeline" | "programmes" | "offmarket" | "marketing" | "metier";

const TABS: { id: TabId; label: string; icon: typeof Briefcase }[] = [
  { id: "pilotage", label: "Pilotage", icon: BarChart3 },
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
  const [tab, setTab] = useState<TabId>("pilotage");
  const funnel = useMemo(() => analyzeFunnel(), []);
  const weak = useMemo(() => weakestLink(), []);
  const orders = useMemo(() => directives().slice(0, 5), []);
  const byStage = useMemo(() => dealsByStage(), []);

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

      {/* Chiffres clés */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <Label>Pipeline (commissions)</Label>
          <div className="mt-1 text-xl font-semibold tabular-nums text-gold">
            {formatEUR(pipelineValueEUR())}
          </div>
        </Card>
        <Card>
          <Label>Prévision pondérée</Label>
          <div className="mt-1 text-xl font-semibold tabular-nums">{formatEUR(weightedForecastEUR())}</div>
        </Card>
        <Card>
          <Label>Dossiers actifs</Label>
          <div className="mt-1 text-xl font-semibold tabular-nums">{DEALS.length}</div>
        </Card>
        <Card>
          <Label>Maillon faible</Label>
          <div className="mt-1 text-sm font-medium leading-tight">
            {weak ? `${weak.rate}% ${weak.to}` : "—"}
          </div>
        </Card>
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