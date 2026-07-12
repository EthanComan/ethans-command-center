import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, AlertTriangle, Target, ShieldCheck, Lightbulb, Brain } from "lucide-react";
import { analyze } from "@/brain/engine";
import { computeAlignment } from "@/brain/alignment";
import { readAdn } from "@/modules/adn/data";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/ia")({
  component: IaPage,
});

function IaPage() {
  const brain = analyze();
  const align = computeAlignment();
  const adn = readAdn();

  const diagnostic = [
    `Score global d'alignement : ${align.globalScore}/100.`,
    `Signaux analysés en direct : ${brain.totalSignals}.`,
    `Domaine le plus critique : ${weakest(align)}.`,
    `Énergie estimée du jour : ${Math.round(brain.energy * 10)}/10.`,
  ];

  const challenges = [
    "Reporter la prospection est un vote pour la médiocrité — pas pour la stratégie.",
    "Renaître restera une intention tant que tu n'auras pas posé un geste concret cette semaine.",
    "Optimiser le business sans corps solide, c'est construire sur du sable.",
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gold">
        <Brain className="h-3.5 w-3.5" /> IA ETHAN · Conseiller personnel
      </div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
        Le regard d'ETHAN sur ta situation
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Analyse continue de tous les modules, filtrée par ton ADN. Diagnostic,
        risques, recommandations, remises en question.
      </p>

      <Section icon={Target} title="Diagnostic — ce que je vois">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {diagnostic.map((d) => (
            <li key={d} className="flex gap-3"><span className="text-gold">→</span><span className="text-foreground/90">{d}</span></li>
          ))}
        </ul>
      </Section>

      <Section icon={AlertTriangle} title="Risques si tu n'agis pas" tone="warn">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {align.risksIfNoAction.map((r) => (
            <li key={r} className="flex gap-3"><span className="text-gold">⚠</span><span className="text-foreground/90">{r}</span></li>
          ))}
        </ul>
      </Section>

      <Section icon={Lightbulb} title="Recommandation prioritaire" tone="gold">
        {brain.primary ? (
          <div>
            <div className="text-lg font-medium">{brain.primary.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{brain.primary.reason}</p>
            <p className="mt-1 text-[13px] text-gold">Impact — {brain.primary.impact}</p>
            <Link to={brain.primary.to} className="mt-4 inline-flex rounded-md bg-gold px-4 py-2 text-sm font-medium text-gold-foreground">
              Ouvrir le module concerné
            </Link>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Pas assez de signaux pour une recommandation.</p>
        )}
      </Section>

      <Section icon={ShieldCheck} title="Ce que ton ADN me dicte">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {adn.decisionRules.map((r) => (
            <li key={r} className="flex gap-3"><span className="text-gold">§</span><span className="text-foreground/90">{r}</span></li>
          ))}
        </ul>
      </Section>

      <Section icon={Sparkles} title="Remises en question">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {challenges.map((c) => (
            <li key={c} className="flex gap-3"><span className="text-gold">?</span><span className="text-foreground/90">{c}</span></li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function weakest(a: ReturnType<typeof computeAlignment>): string {
  const w = [...a.domains].sort((x, y) => x.score - y.score)[0];
  return `${w.label} (${w.score}/100)`;
}

function Section({ icon: Icon, title, children, tone }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode; tone?: "gold" | "warn" }) {
  const border = tone === "gold" ? "border-gold/30 bg-gradient-to-b from-gold/[0.06] to-transparent" : tone === "warn" ? "border-amber-500/30" : "border-border";
  return (
    <section className={`mt-6 rounded-2xl border bg-elevated p-6 ${border}`}>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
