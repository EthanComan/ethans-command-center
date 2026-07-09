import type { LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  category?: string;
}

export function ComingSoon({ title, description, icon: Icon, category }: ComingSoonProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 -z-10 rounded-full bg-gold/10 blur-3xl" aria-hidden />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-elevated shadow-[var(--shadow-elegant)]">
          <Icon className="h-7 w-7 text-gold" strokeWidth={1.5} />
        </div>
      </div>

      {category && (
        <span className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground/70">
          {category}
        </span>
      )}
      <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-elevated/60 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_10px_var(--gold)]" />
        Bientôt disponible
      </div>

      <p className="mt-8 max-w-sm text-xs leading-relaxed text-muted-foreground/70">
        Ce module fait partie de l'architecture ETHAN. Il sera activé
        progressivement, sans jamais rompre la continuité du système.
      </p>
    </div>
  );
}