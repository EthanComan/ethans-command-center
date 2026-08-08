import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Flame, Plus, Trash2, X } from "lucide-react";
import {
  readAllHabits,
  readTodayHabits,
  markDone,
  markMissed,
  addHabit,
  deleteHabit,
} from "@/modules/habitudes/data";
import type {
  Habit,
  HabitForToday,
  HabitFrequency,
  HabitPriority,
} from "@/modules/habitudes/types";

export const Route = createFileRoute("/habitudes")({
  head: () => ({
    meta: [
      { title: "Habitudes — ETHAN" },
      { name: "description", content: "Cocher ses habitudes du jour et tenir ses séries : une liste minimaliste, sans bruit." },
      { property: "og:title", content: "Habitudes — ETHAN" },
      { property: "og:description", content: "Une habitude, une heure, une fréquence, une série. Rien de plus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HabitudesPage,
});

const PRIORITY_DOT: Record<HabitPriority, string> = {
  critique: "bg-red-400",
  haute: "bg-gold",
  moyenne: "bg-muted-foreground",
  basse: "bg-border",
};

const PRIORITY_LABEL: Record<HabitPriority, string> = {
  critique: "Critique",
  haute: "Haute",
  moyenne: "Moyenne",
  basse: "Basse",
};

const DAYS = ["D", "L", "M", "M", "J", "V", "S"];

function frequencyLabel(f: HabitFrequency): string {
  if (f.kind === "daily") return "Tous les jours";
  if (f.kind === "weekly") return f.days.map((d) => DAYS[d]).join(" · ");
  return `Le ${f.dates.join(", ")} du mois`;
}

function HabitudesPage() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<HabitForToday[]>([]);
  const [all, setAll] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);

  const refresh = () => {
    setItems(readTodayHabits());
    setAll(readAllHabits());
  };

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  const due = items.filter((i) => i.dueToday);
  const done = due.filter((i) => i.doneToday).length;
  const pct = due.length ? Math.round((done / due.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Habitudes</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Discipline du jour</h1>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold tabular-nums text-gold">{mounted ? `${done}/${due.length}` : "—"}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">complétées</p>
        </div>
      </header>

      <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-border/40">
        <div className="h-full bg-gold transition-all duration-500" style={{ width: `${mounted ? pct : 0}%` }} />
      </div>

      {/* Aujourd'hui */}
      <section className="mt-8">
        <h2 className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Aujourd'hui</h2>
        <ul className="mt-4 space-y-2">
          {due.map((i) => (
            <li key={i.habit.id}>
              <button
                onClick={() => {
                  if (i.doneToday) markMissed(i.habit.id);
                  else markDone(i.habit.id);
                  refresh();
                }}
                className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                  i.doneToday ? "border-gold/40 bg-gold/[0.06]" : "border-border bg-elevated hover:border-gold/30"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    i.doneToday ? "border-gold bg-gold text-background" : "border-border text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${i.doneToday ? "text-muted-foreground line-through" : ""}`}>
                    {i.habit.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {i.habit.recommendedTime ? `${i.habit.recommendedTime} · ` : ""}
                    {i.habit.estimatedMinutes} min
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground">
                  <Flame className={`h-3.5 w-3.5 ${i.streak > 0 ? "text-gold" : ""}`} />
                  {i.streak}
                </span>
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[i.habit.priority]}`} title={PRIORITY_LABEL[i.habit.priority]} />
              </button>
            </li>
          ))}
          {mounted && due.length === 0 && (
            <li className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              Aucune habitude prévue aujourd'hui.
            </li>
          )}
        </ul>
      </section>

      {/* Toutes les habitudes */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Toutes mes habitudes</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs transition-colors hover:border-gold/40 hover:text-gold"
          >
            {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showForm ? "Fermer" : "Nouvelle"}
          </button>
        </div>

        {showForm && <HabitForm onDone={() => { setShowForm(false); refresh(); }} />}

        <ul className="mt-4 divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-elevated">
          {all.map((h) => (
            <li key={h.id} className="group flex items-center gap-4 px-4 py-3">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[h.priority]}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{h.title}</p>
                <p className="truncate text-[11px] text-muted-foreground">{h.why}</p>
              </div>
              <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">{frequencyLabel(h.frequency)}</span>
              <span className="w-12 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                {h.recommendedTime ?? "—"}
              </span>
              <button
                onClick={() => { deleteHabit(h.id); refresh(); }}
                aria-label={`Supprimer ${h.title}`}
                className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function HabitForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");
  const [freq, setFreq] = useState<"daily" | "weekly">("daily");
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [time, setTime] = useState("07:00");
  const [minutes, setMinutes] = useState(20);
  const [priority, setPriority] = useState<HabitPriority>("haute");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addHabit({
      title: title.trim(),
      why: why.trim(),
      domain: "developpement_personnel",
      category: "personnalisee",
      nature: "progression",
      frequency: freq === "daily" ? { kind: "daily" } : { kind: "weekly", days },
      recommendedTime: time,
      priority,
      estimatedMinutes: minutes,
      links: [],
      impactWeight: priority === "critique" ? 8 : priority === "haute" ? 6 : 4,
    });
    onDone();
  };

  const field = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/50";

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-xl border border-border bg-elevated p-4">
      <input className={field} placeholder="Nom de l'habitude" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className={field} placeholder="Description courte" value={why} onChange={(e) => setWhy(e.target.value)} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select className={field} value={freq} onChange={(e) => setFreq(e.target.value as "daily" | "weekly")}>
          <option value="daily">Tous les jours</option>
          <option value="weekly">Certains jours</option>
        </select>
        <input className={field} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <input className={field} type="number" min={5} step={5} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
        <select className={field} value={priority} onChange={(e) => setPriority(e.target.value as HabitPriority)}>
          <option value="critique">Critique</option>
          <option value="haute">Haute</option>
          <option value="moyenne">Moyenne</option>
          <option value="basse">Basse</option>
        </select>
      </div>
      {freq === "weekly" && (
        <div className="flex gap-1.5">
          {DAYS.map((d, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setDays((p) => (p.includes(idx) ? p.filter((x) => x !== idx) : [...p, idx]))}
              className={`h-8 w-8 rounded-md border text-xs transition-colors ${
                days.includes(idx) ? "border-gold bg-gold/15 text-gold" : "border-border text-muted-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}
      <button type="submit" className="w-full rounded-md bg-gold py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90">
        Ajouter
      </button>
    </form>
  );
}
