import { Link } from "@tanstack/react-router";
import { ArrowRight, Brain, Clock, Sparkles, Target } from "lucide-react";
import type { NextBestAction } from "@/brain/nba";

/**
 * Hero du Centre de Commandement.
 *
 * Répond à la question fondatrice d'ETHAN : « Quelle est la meilleure
 * chose que je puisse faire maintenant ? ». L'utilisateur ne doit
 * jamais avoir à réfléchir à sa prochaine priorité.
 */
export function NextBestActionHero({ nba }: { nba: NextBestAction }) {
  const { primary, alternatives, contributors, sourcesAnalyzed } = nba;

  if (!primary) {
    return (
      <section className="mt-6 rounded-2xl border border-border bg-elevated p-8 text-sm text-muted-foreground">
        ETHAN attend davantage de signaux avant de trancher la prochaine action.
      </section>
    );
  }

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.08] via-elevated to-elevated shadow-[var(--shadow-elegant)]">
      <div className="flex items-center justify-between border-b border-gold/20 px-6 py-3">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-gold">
          <Brain className="h-3.5 w-3.5" strokeWidth={2} />
          ETHAN a tranché
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {contributors} moteurs · {sourcesAnalyzed} candidats
        </span>
      </div>

      <div className="px-6 py-7 md:px-8 md:py-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          La meilleure chose à faire maintenant
        </p>
        <h2 className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-gold md:text-3xl">
          {primary.title}
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="rounded-sm border border-border/60 px-1.5 py-0.5">
            source · {primary.source}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {primary.estimatedMinutes} min
          </span>
          <span className="inline-flex items-center gap-1 text-gold">
            <Sparkles className="h-3 w-3" /> score {primary.score}
          </span>
          {primary.linkedTo && (
            <span className="inline-flex items-center gap-1">
              <Target className="h-3 w-3" /> {primary.linkedTo}
            </span>
          )}
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          <span className="text-foreground/80">Pourquoi maintenant — </span>
          {primary.why}
        </p>

        {primary.impact && (
          <div className="mt-4 max-w-2xl rounded-lg border border-border/60 bg-background/40 px-4 py-3 text-[13px] text-muted-foreground">
            <span className="text-gold">Impact projeté · </span>
            {primary.impact}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to={primary.to}
            className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-background shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5"
          >
            Commencer maintenant
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/execution"
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
          >
            Entrer en Mode Exécution
          </Link>
        </div>
      </div>

      {alternatives.length > 0 && (
        <div className="border-t border-border/60 bg-background/20 px-6 py-4">
          <div className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Sinon, ces alternatives ont aussi été considérées
          </div>
          <ul className="divide-y divide-border/60">
            {alternatives.map((a) => (
              <li key={a.id}>
                <Link
                  to={a.to}
                  className="group flex items-center gap-3 py-2.5 text-sm transition-colors hover:text-gold"
                >
                  <span className="w-10 text-[11px] tabular-nums text-muted-foreground">
                    {a.score}
                  </span>
                  <span className="flex-1 truncate">{a.title}</span>
                  <span className="hidden text-[11px] uppercase tracking-wider text-muted-foreground md:inline">
                    {a.source}
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