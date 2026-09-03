import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, PenLine } from "lucide-react";
import { addEntry, promptOfTheDay, readEntries, type JournalEntry } from "@/modules/journal/data";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — ETHAN" },
      { name: "description", content: "Ecriture quotidienne : decisions, lucidite, apprentissages de l'homme en construction." },
      { property: "og:title", content: "Journal — ETHAN" },
      { property: "og:description", content: "Ecriture quotidienne et memoire vivante de la transformation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [today, setToday] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [axis, setAxis] = useState("Discipline");

  useEffect(() => {
    setEntries(readEntries());
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const created = addEntry({ date: today, title: title.trim(), body: body.trim(), axis });
    setEntries([created, ...entries]);
    setTitle("");
    setBody("");
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Journal</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Écrire pour <span className="text-gold">rester lucide</span>
      </h1>

      <section className="mt-6 rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.06] to-transparent p-6">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <PenLine className="h-3.5 w-3.5 text-gold" /> Question du jour
        </div>
        <p className="mt-3 text-lg">{today ? promptOfTheDay(today) : "…"}</p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'entrée"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Sans filtre. Ce que tu as fait, évité, appris."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50"
          />
          <div className="flex items-center gap-3">
            <select
              value={axis}
              onChange={(e) => setAxis(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {["Discipline", "Leadership", "Business", "Santé", "Mental", "Mission", "Finances", "Spiritualité"].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <button type="submit" className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-gold-foreground">
              Consigner
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8 space-y-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" /> Entrées
        </div>
        {entries.map((e) => (
          <article key={e.id} className="rounded-2xl border border-border bg-elevated p-5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="tabular-nums">{e.date}</span>
              <span className="text-gold">{e.axis}</span>
            </div>
            <h2 className="mt-2 text-base font-medium">{e.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
