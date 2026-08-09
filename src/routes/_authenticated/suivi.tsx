import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createItem, listItems, progressItem } from "@/lib/ethan.functions";
import { ATTENTION_META, interventions, type Attention } from "@/brain/vigilance";

export const Route = createFileRoute("/_authenticated/suivi")({
  head: () => ({
    meta: [
      { title: "Suivi ETHAN — Ce qui avance, ce qui bloque" },
      {
        name: "description",
        content:
          "ETHAN suit vos dossiers, prospects et échéances dans le temps et intervient uniquement quand c'est nécessaire.",
      },
      { property: "og:title", content: "Suivi ETHAN" },
      {
        property: "og:description",
        content: "Urgent, important, opportunité, information : chaque élément suivi dans le temps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuiviPage,
});

const ORDER: Attention[] = ["urgent", "important", "opportunite", "information"];

function SuiviPage() {
  const qc = useQueryClient();
  const fetchItems = useServerFn(listItems);
  const add = useServerFn(createItem);
  const progress = useServerFn(progressItem);
  const [open, setOpen] = useState(false);

  const items = useQuery({ queryKey: ["ethan", "items"], queryFn: () => fetchItems() });
  const list = useMemo(() => interventions(items.data ?? []), [items.data]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["ethan", "items"] });

  const create = useMutation({
    mutationFn: (form: FormData) =>
      add({
        data: {
          kind: String(form.get("kind") || "dossier"),
          title: String(form.get("title") || ""),
          context: String(form.get("context") || "") || null,
          missing: String(form.get("missing") || "") || null,
          next_action: String(form.get("next_action") || "") || null,
          why: String(form.get("why") || "") || null,
          attention: (String(form.get("attention") || "important") as Attention),
          value_eur: form.get("value_eur") ? Number(form.get("value_eur")) : null,
          due_at: String(form.get("due_at") || "") || null,
        },
      }),
    onSuccess: () => {
      setOpen(false);
      toast.success("Élément suivi. ETHAN prend le relais.");
      void invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const act = useMutation({
    mutationFn: (v: { id: string; event: "fait" | "reporte" | "cloture"; content: string }) =>
      progress({
        data: {
          id: v.id,
          event: v.event,
          content: v.content,
          next_action: null,
          why: null,
          missing: null,
          snooze_days: v.event === "reporte" ? 3 : null,
        },
      }),
    onSuccess: () => void invalidate(),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Suivi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ce qu'ETHAN observe dans le temps. Il ne parle que lorsqu'une action est nécessaire.
          </p>
        </div>
        <Button onClick={() => setOpen((v) => !v)}>{open ? "Fermer" : "Suivre un élément"}</Button>
      </div>

      {open && (
        <form
          className="mt-6 grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(new FormData(e.currentTarget));
          }}
        >
          <Field name="title" label="Intitulé" required placeholder="Vente Dupont — Résidence Horizon" />
          <Field name="kind" label="Type" placeholder="dossier · prospect · négociation · échéance" />
          <div className="sm:col-span-2">
            <Label htmlFor="context">Où nous en sommes</Label>
            <Textarea id="context" name="context" rows={2} className="mt-1.5" />
          </div>
          <Field name="missing" label="Ce qui manque" placeholder="Attestation de financement" />
          <Field name="next_action" label="Prochaine action" placeholder="Rappeler le notaire" />
          <Field name="why" label="Pourquoi c'est important" />
          <div>
            <Label htmlFor="attention">Niveau</Label>
            <select
              id="attention"
              name="attention"
              defaultValue="important"
              className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {ORDER.map((a) => (
                <option key={a} value={a}>
                  {ATTENTION_META[a].label}
                </option>
              ))}
            </select>
          </div>
          <Field name="value_eur" label="Valeur (€)" type="number" />
          <Field name="due_at" label="Échéance" type="date" />
          <div className="sm:col-span-2">
            <Button type="submit" disabled={create.isPending}>
              Confier à ETHAN
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-8">
        {ORDER.map((level) => {
          const group = list.filter((i) => i.attention === level);
          if (!group.length) return null;
          return (
            <section key={level}>
              <h2 className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {ATTENTION_META[level].label} · {group.length}
              </h2>
              <div className="mt-3 space-y-3">
                {group.map((i) => (
                  <article
                    key={i.itemId}
                    className={`rounded-xl border bg-card p-5 ${ATTENTION_META[level].tone}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-sm font-semibold text-foreground">{i.title}</h3>
                      <span className="text-[11px] uppercase tracking-wider">
                        {ATTENTION_META[level].label}
                      </span>
                    </div>
                    <dl className="mt-3 space-y-1.5 text-sm">
                      <Row label="Situation" value={i.situation} />
                      {i.missing && <Row label="Ce qui manque" value={i.missing} />}
                      <Row label="Prochaine action" value={i.nextAction} />
                      <Row label="Pourquoi" value={i.why} />
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => act.mutate({ id: i.itemId, event: "fait", content: i.nextAction })}
                      >
                        C'est fait
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          act.mutate({ id: i.itemId, event: "reporte", content: "Reporté de 3 jours" })
                        }
                      >
                        Reporter 3 j
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => act.mutate({ id: i.itemId, event: "cloture", content: "Clôturé" })}
                      >
                        Clôturer
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {!items.isLoading && list.length === 0 && (
          <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Rien ne nécessite ton attention. ETHAN reste en veille.
          </p>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-36 shrink-0 text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function Field({
  name,
  label,
  ...rest
}: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} className="mt-1.5" {...rest} />
    </div>
  );
}