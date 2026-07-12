import { createFileRoute } from "@tanstack/react-router";
import { Heart, Users, Building2, HandCoins, Megaphone, Sparkles } from "lucide-react";
import { readRenaitre } from "@/modules/renaitre/data";

export const Route = createFileRoute("/renaitre")({
  component: RenaitrePage,
});

const STATUS_LABEL = { idee: "Idée", en_cours: "En cours", actif: "Actif" } as const;

function RenaitrePage() {
  const r = readRenaitre();
  const m = r.metrics;

  const stats = [
    { icon: Users, label: "Femmes accompagnées", value: `${m.beneficiariesReached} / ${m.beneficiariesTarget.toLocaleString("fr-FR")}` },
    { icon: Building2, label: "Partenaires actifs", value: `${m.partnersActive} / ${m.partnersTarget}` },
    { icon: HandCoins, label: "Fonds mobilisés", value: `${(m.fundRaisedEUR / 1000).toFixed(0)} k€ / ${(m.fundTargetEUR / 1000000).toFixed(0)} M€` },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gold">
        <Heart className="h-3.5 w-3.5" /> Mission de vie · Renaître
      </div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
        Renaître
      </h1>
      <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
        Projet humanitaire de reconstruction pour des femmes ayant subi
        violences, agressions ou traumatismes. Ce n'est pas un objectif
        personnel — c'est la raison d'être du système.
      </p>

      <section className="mt-8 rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.06] to-transparent p-6">
        <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Étoile polaire</div>
        <div className="mt-2 text-xl font-medium">{r.north}</div>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          {r.narrative}
        </p>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-border bg-elevated p-4">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {s.label}
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="mt-3 text-lg font-semibold tabular-nums">{s.value}</div>
            </div>
          );
        })}
      </section>

      <section className="mt-8">
        <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Piliers de l'œuvre</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {r.pillars.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-elevated p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{p.name}</div>
                <span className="rounded-sm border border-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground">{p.purpose}</div>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border/40">
                <div className="h-full bg-gold" style={{ width: `${p.progress}%` }} />
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{p.progress}%</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Chemin — 20 ans</div>
        <ol className="mt-4 space-y-2">
          {r.milestones.map((ms) => (
            <li key={ms.id} className="flex items-start gap-3 rounded-lg border border-border bg-elevated px-4 py-3">
              <span className="mt-0.5 rounded-sm border border-border/60 px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">{ms.year}</span>
              <span className="flex-1 text-sm">{ms.label}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-elevated p-6">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gold">
          <Sparkles className="h-3.5 w-3.5" /> Prochaines actions concrètes
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {r.nextActions.map((a) => (
            <li key={a} className="flex items-start gap-3">
              <Megaphone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}