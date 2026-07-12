import { createFileRoute } from "@tanstack/react-router";
import { Dna, Shield, Compass, Scale, Flame } from "lucide-react";
import { readAdn } from "@/modules/adn/data";

export const Route = createFileRoute("/adn")({
  component: AdnPage,
});

function AdnPage() {
  const a = readAdn();
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gold">
        <Dna className="h-3.5 w-3.5" /> Fondations · ADN
      </div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
        L'ADN d'ETHAN
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Le socle du système. Toute décision, toute recommandation, toute
        alerte est filtrée par ces principes. Modifier l'ADN modifie l'ensemble
        du comportement d'ETHAN.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Card icon={Compass} label="Identité">
          <p className="text-sm text-muted-foreground">{a.identity}</p>
        </Card>
        <Card icon={Flame} label="Mission de vie">
          <p className="text-sm text-muted-foreground">{a.mission}</p>
        </Card>
        <Card icon={Compass} label="Vision" span>
          <p className="text-sm text-muted-foreground">{a.vision}</p>
        </Card>
      </section>

      <section className="mt-8">
        <SectionTitle icon={Scale}>Valeurs cardinales</SectionTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {a.values.map((v) => (
            <div key={v.name} className="rounded-xl border border-border bg-elevated p-4">
              <div className="text-sm font-medium">{v.name}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{v.description}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle icon={Shield}>Code d'honneur</SectionTitle>
        <ul className="mt-4 divide-y divide-border/60 rounded-xl border border-border bg-elevated">
          {a.honorCode.map((h) => (
            <li key={h.rule} className="px-4 py-3">
              <div className="text-sm">{h.rule}</div>
              <div className="mt-1 text-[12px] text-muted-foreground">{h.why}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <SectionTitle icon={Compass}>Principes de vie</SectionTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {a.principles.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-elevated p-4">
              <div className="text-sm font-medium text-gold">{p.title}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{p.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.06] to-transparent p-6">
        <SectionTitle icon={Scale}>Règles de décision d'ETHAN</SectionTitle>
        <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
          {a.decisionRules.map((r, i) => (
            <li key={r} className="flex gap-3">
              <span className="text-gold">{i + 1}.</span>
              <span className="text-foreground/90">{r}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Card({ icon: Icon, label, children, span }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode; span?: boolean }) {
  return (
    <div className={`rounded-xl border border-border bg-elevated p-5 ${span ? "md:col-span-2" : ""}`}>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </div>
  );
}