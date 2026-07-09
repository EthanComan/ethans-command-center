import { Link } from "@tanstack/react-router";
import { ArrowRight, Brain, Clock, Sparkles } from "lucide-react";
import type { BrainState } from "@/brain/engine";

interface Props {
  state: BrainState;
}

const CATEGORY_LABEL: Record<string, string> = {
  business: "Business",
  performance: "Performance",
  patrimoine: "Patrimoine",
  personnel: "Personnel",
};

export function RecommendedActionCard({ state }: Props) {
  const { primary, secondary, totalSignals } = state;

  if (!primary) {
    return (
      <section className="mt-8 rounded-2xl border border-border bg-elevated p-8 text-sm text-muted-foreground">
        Le Cerveau n'a pas encore reçu assez de signaux pour recommander une action.
      </section>
    );
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-elevated shadow-[var(--shadow-elegant)]">
      {/* En-tête Cerveau */}
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-3">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-gold">
          <Brain className="h-3.5 w-3.5" strokeWidth={2} />
          Le Cerveau — Action recommandée
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {totalSignals} signaux analysés
        </span>
      </div>

      {/* Action principale */}
      <div className="relative bg-gradient-to-b from-gold/[0.06] to-transparent p-8">
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="rounded-sm border border-border/60 px-1.5 py-0.5">
            {CATEGORY_LABEL[primary.category]}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {primary.estimatedMinutes} min
          </span>
          <span className="inline-flex items-center gap-1 text-gold">
            <Sparkles className="h-3 w-3" /> score {primary.score}
          </span>
        </div>

        <h2 className="mt-4 max-w-2xl text-2xl font-medium leading-snug tracking-tight md:text-3xl">
          {primary.title}
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          <span className="text-foreground/80">Pourquoi maintenant — </span>
          {primary.reason}
        </p>

        <div className="mt-4 max-w-2xl rounded-lg border border-border/60 bg-background/40 px-4 py-3 text-[13px] text-muted-foreground">
          <span className="text-gold">Impact projeté · </span>
          {primary.impact}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to={primary.to}
            className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-medium text-gold-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5"
          >
            Commencer
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            Reporter
          </button>
          <button className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Pourquoi cette action ?
          </button>
        </div>
      </div>

      {/* Actions secondaires */}
      {secondary.length > 0 && (
        <div className="border-t border-border/60 px-6 py-4">
          <div className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Autres actions à fort levier
          </div>
          <ul className="divide-y divide-border/60">
            {secondary.map((a) => (
              <li key={a.id}>
                <Link
                  to={a.to}
                  className="group flex items-center gap-3 py-3 text-sm transition-colors hover:text-gold"
                >
                  <span className="w-10 text-[11px] tabular-nums text-muted-foreground">
                    {a.score}
                  </span>
                  <span className="flex-1">{a.title}</span>
                  <span className="hidden text-[11px] uppercase tracking-wider text-muted-foreground md:inline">
                    {CATEGORY_LABEL[a.category]}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}