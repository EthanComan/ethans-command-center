import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Library } from "lucide-react";
import { CATEGORY_LABEL, protocolsByCategory } from "@/modules/protocoles/data";

export const Route = createFileRoute("/protocoles")({
  head: () => ({
    meta: [
      { title: "Protocoles — ETHAN" },
      { name: "description", content: "Playbooks et rituels executables : business VEFA, performance, mental, mission." },
      { property: "og:title", content: "Protocoles — ETHAN" },
      { property: "og:description", content: "Les procedures que tu executes sans reflechir, avec leurs references." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProtocolesPage,
});

function ProtocolesPage() {
  const groups = protocolsByCategory();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Protocoles</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Ne plus décider : <span className="text-gold">exécuter la procédure</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Chaque situation récurrente a son protocole. Les lectures et références utiles sont
        rattachées directement au protocole qu'elles servent.
      </p>

      {groups.map(({ category, items }) => (
        <section key={category} className="mt-8">
          <h2 className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <ClipboardList className="h-3.5 w-3.5" /> {CATEGORY_LABEL[category]}
          </h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {items.map((p) => (
              <article key={p.id} className="rounded-2xl border border-border bg-elevated p-5">
                <h3 className="text-base font-medium">{p.name}</h3>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-gold">Déclencheur</p>
                <p className="text-sm text-muted-foreground">{p.trigger}</p>
                <ol className="mt-4 space-y-2">
                  {p.steps.map((s, i) => (
                    <li key={s.label} className="flex gap-3 text-sm">
                      <span className="tabular-nums text-gold">{i + 1}.</span>
                      <span>
                        {s.label}
                        {s.detail ? (
                          <span className="block text-[11px] text-muted-foreground">{s.detail}</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-sm">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Résultat attendu · </span>
                  {p.outcome}
                </p>
                {p.sources?.length ? (
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      <Library className="h-3 w-3" /> Références
                    </p>
                    <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
                      {p.sources.map((s) => <li key={s}>— {s}</li>)}
                    </ul>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
