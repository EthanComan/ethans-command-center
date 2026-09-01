import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { History, User, Compass, Crown, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createIdentityEntry,
  deleteIdentityEntry,
  listArchetypeScores,
  listIdentityEntries,
  setArchetypeScore,
  type IdentityKind,
} from "@/lib/identite.functions";
import {
  archetypeScore,
  LUCIOUS_TRAITS,
  weakestTraits,
} from "@/modules/archetype/lucious";
import { backPlan, DESTINATION_MONTHLY_EUR } from "@/modules/identite/destination";
import { commissionsSignedThisMonthEUR } from "@/modules/business/analytics";
import { formatEUR } from "@/modules/business/data";

export const Route = createFileRoute("/_authenticated/identite")({
  head: () => ({
    meta: [
      { title: "Identité — Historique, présent, direction" },
      {
        name: "description",
        content:
          "Le socle d'ETHAN : d'où tu viens, qui tu es aujourd'hui, où tu vas. Et la grille de leadership qui te challenge.",
      },
      { property: "og:title", content: "Identité — Fondations d'ETHAN" },
      {
        property: "og:description",
        content: "Historique, identité actuelle, direction et archétype de leadership.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IdentitePage,
});

const SECTIONS: Array<{ kind: IdentityKind; label: string; icon: typeof History; help: string }> = [
  {
    kind: "historique",
    label: "Historique",
    icon: History,
    help: "Ce que tu as vécu. ETHAN s'en sert comme point de comparaison — jamais comme définition de qui tu es.",
  },
  {
    kind: "identite",
    label: "Identité actuelle",
    icon: User,
    help: "L'homme que tu es aujourd'hui : ce que tu tiens, ce que tu ne tolères plus.",
  },
  {
    kind: "direction",
    label: "Direction",
    icon: Compass,
    help: "L'homme que tu as choisi de devenir. Toute action du système est jugée à cette aune.",
  },
];

function IdentitePage() {
  const qc = useQueryClient();
  const fetchEntries = useServerFn(listIdentityEntries);
  const fetchScores = useServerFn(listArchetypeScores);
  const add = useServerFn(createIdentityEntry);
  const remove = useServerFn(deleteIdentityEntry);
  const rate = useServerFn(setArchetypeScore);

  const entries = useQuery({ queryKey: ["identite", "entries"], queryFn: () => fetchEntries() });
  const scores = useQuery({ queryKey: ["identite", "scores"], queryFn: () => fetchScores() });

  const [openKind, setOpenKind] = useState<IdentityKind | null>(null);

  const rows = useMemo(
    () => (scores.data ?? []).map((s) => ({ trait: s.trait, score: s.score, note: s.note })),
    [scores.data],
  );
  const global = archetypeScore(rows);
  const weak = weakestTraits(rows);
  const plan = backPlan(commissionsSignedThisMonthEUR());

  const invalidate = (key: string) => qc.invalidateQueries({ queryKey: ["identite", key] });

  const create = useMutation({
    mutationFn: (v: { kind: IdentityKind; form: FormData }) =>
      add({
        data: {
          kind: v.kind,
          title: String(v.form.get("title") || ""),
          body: String(v.form.get("body") || "") || null,
          lesson: String(v.form.get("lesson") || "") || null,
          occurred_on: String(v.form.get("occurred_on") || "") || null,
        },
      }),
    onSuccess: () => {
      setOpenKind(null);
      toast.success("Enregistré. ETHAN en tient compte à partir de maintenant.");
      void invalidate("entries");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => void invalidate("entries"),
    onError: (e: Error) => toast.error(e.message),
  });

  const score = useMutation({
    mutationFn: (v: { trait: string; score: number }) =>
      rate({ data: { trait: v.trait, score: v.score, note: null } }),
    onSuccess: () => void invalidate("scores"),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gold">
        <Compass className="h-3.5 w-3.5" /> Fondations · Identité
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">D'où tu viens, qui tu es, où tu vas</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        ETHAN distingue strictement ton historique de ton identité actuelle. Le passé sert de repère
        de progression, jamais de définition.
      </p>

      {/* Destination financière */}
      <section className="mt-6 rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.06] to-transparent p-5">
        <div className="text-[10px] uppercase tracking-[0.24em] text-gold">Destination</div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <div className="text-2xl font-semibold">{formatEUR(DESTINATION_MONTHLY_EUR)} / mois</div>
          <div className="text-sm text-muted-foreground">
            soit {formatEUR(plan.yearlyEUR)} / an · {formatEUR(plan.weeklyEUR)} / semaine ·{" "}
            {plan.salesPerMonth} ventes par mois
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full bg-gold" style={{ width: `${plan.progress}%` }} />
        </div>
        <div className="mt-2 text-[12px] text-muted-foreground">
          Position actuelle : {plan.progress}% · prochain palier : {plan.nextMilestone.label} (
          {formatEUR(plan.nextMilestone.monthlyEUR)} / mois)
        </div>
      </section>

      {/* Historique / Identité / Direction */}
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {SECTIONS.map((s) => {
          const list = (entries.data ?? []).filter((e) => e.kind === s.kind);
          return (
            <section key={s.kind} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <s.icon className="h-4 w-4 text-gold" /> {s.label}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenKind(openKind === s.kind ? null : s.kind)}
                >
                  {openKind === s.kind ? "Fermer" : "Ajouter"}
                </Button>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{s.help}</p>

              {openKind === s.kind && (
                <form
                  className="mt-3 space-y-3 rounded-lg border border-border bg-elevated p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    create.mutate({ kind: s.kind, form: new FormData(e.currentTarget) });
                  }}
                >
                  <div>
                    <Label htmlFor={`t-${s.kind}`}>Intitulé</Label>
                    <Input id={`t-${s.kind}`} name="title" required className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor={`b-${s.kind}`}>Détail</Label>
                    <Textarea id={`b-${s.kind}`} name="body" rows={3} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor={`l-${s.kind}`}>
                      {s.kind === "direction" ? "Ce que ça exige de moi" : "Ce que j'en retiens"}
                    </Label>
                    <Textarea id={`l-${s.kind}`} name="lesson" rows={2} className="mt-1.5" />
                  </div>
                  {s.kind !== "direction" && (
                    <div>
                      <Label htmlFor={`d-${s.kind}`}>Date</Label>
                      <Input id={`d-${s.kind}`} name="occurred_on" type="date" className="mt-1.5" />
                    </div>
                  )}
                  <Button type="submit" size="sm" disabled={create.isPending}>
                    Enregistrer
                  </Button>
                </form>
              )}

              <ul className="mt-3 space-y-2">
                {list.length === 0 && (
                  <li className="rounded-lg border border-dashed border-border px-3 py-4 text-[12px] text-muted-foreground">
                    Rien pour l'instant. Ce que tu écris ici pilote le comportement d'ETHAN.
                  </li>
                )}
                {list.map((e) => (
                  <li key={e.id} className="group rounded-lg border border-border bg-elevated p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[13px] font-medium">{e.title}</div>
                      <button
                        type="button"
                        aria-label="Supprimer"
                        className="opacity-0 transition group-hover:opacity-100"
                        onClick={() => del.mutate(e.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    {e.occurred_on && (
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{e.occurred_on}</div>
                    )}
                    {e.body && <p className="mt-1 text-[12px] text-muted-foreground">{e.body}</p>}
                    {e.lesson && (
                      <p className="mt-1.5 border-l-2 border-gold/40 pl-2 text-[12px] text-gold/90">
                        {e.lesson}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Archétype */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Crown className="h-4 w-4 text-gold" /> Grille de leadership
            </div>
            <p className="mt-1 max-w-2xl text-[12px] text-muted-foreground">
              Une grille d'exigence stratégique (archétype Lucious Lyon) : ETHAN l'utilise pour te
              challenger. Elle ne remplace jamais ETHAN, elle règle son niveau d'exigence.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-gold">{global}</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Score</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {LUCIOUS_TRAITS.map((t) => {
            const current = rows.find((r) => r.trait === t.id)?.score ?? 50;
            return (
              <div key={t.id} className="rounded-xl border border-border bg-elevated p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-medium">{t.label}</div>
                  <div className="text-[13px] tabular-nums text-gold">{current}</div>
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">{t.standard}</p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  defaultValue={current}
                  className="mt-3 w-full accent-[hsl(var(--gold))]"
                  onMouseUp={(e) =>
                    score.mutate({ trait: t.id, score: Number((e.target as HTMLInputElement).value) })
                  }
                  onTouchEnd={(e) =>
                    score.mutate({ trait: t.id, score: Number((e.target as HTMLInputElement).value) })
                  }
                />
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.06] to-transparent p-5">
          <div className="text-[10px] uppercase tracking-[0.24em] text-gold">
            Ce qu'ETHAN va te demander
          </div>
          <ul className="mt-3 space-y-2">
            {weak.map((t) => (
              <li key={t.id} className="text-sm">
                <span className="text-muted-foreground">{t.label} ({t.score}) — </span>
                {t.challenge}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
