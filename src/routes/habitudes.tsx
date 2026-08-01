import { createFileRoute, Link } from "@tanstack/react-router";
import { Repeat, CheckCircle2, Circle, AlertCircle, Flame, TrendingUp, Target, Plus, X, ChevronDown, ChevronUp, Heart, Link2, Zap, Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  readAllHabits,
  readTodayHabits,
  markDone,
  markMissed,
  markPartial,
  addHabit,
  deleteHabit,
  globalConsistency,
  currentPhase,
  setPhase,
  phaseDefinition,
  globalImpactScore,
} from "@/modules/habitudes/data";
import {
  HABIT_DOMAIN_LABEL,
  HABIT_CATEGORY_LABEL,
  HABIT_PRIORITY_WEIGHT,
  HABIT_NATURE_LABEL,
  HABIT_LINK_LABEL,
  HABIT_PHASES,
  type Habit,
  type HabitCategory,
  type HabitDomain,
  type HabitForToday,
  type HabitFrequency,
  type HabitNature,
  type HabitPhase,
  type HabitPriority,
} from "@/modules/habitudes/types";
import { ancestorsOf } from "@/modules/objectifs/data";

export const Route = createFileRoute("/habitudes")({
  head: () => ({
    meta: [
      { title: "Habitudes — ETHAN" },
      { name: "description", content: "Le moteur de comportements quotidiens qui transforme les objectifs en actions concrètes." },
    ],
  }),
  component: HabitudesPage,
});

const DOMAIN_TONE: Record<HabitDomain, string> = {
  business: "text-sky-300 border-sky-400/30 bg-sky-500/[0.08]",
  sante: "text-emerald-300 border-emerald-400/30 bg-emerald-500/[0.08]",
  sport: "text-orange-300 border-orange-400/30 bg-orange-500/[0.08]",
  spiritualite: "text-violet-300 border-violet-400/30 bg-violet-500/[0.08]",
  lecture: "text-amber-300 border-amber-400/30 bg-amber-500/[0.08]",
  developpement_personnel: "text-teal-300 border-teal-400/30 bg-teal-500/[0.08]",
  relations: "text-pink-300 border-pink-400/30 bg-pink-500/[0.08]",
  finances: "text-lime-300 border-lime-400/30 bg-lime-500/[0.08]",
  renaitre: "text-gold border-gold/40 bg-gold/[0.12]",
};

const CATEGORY_TONE: Record<HabitCategory, string> = {
  fondamentale: "text-gold border-gold/40 bg-gold/[0.10]",
  performance: "text-sky-300 border-sky-400/30 bg-sky-500/[0.08]",
  mission: "text-rose-300 border-rose-400/30 bg-rose-500/[0.08]",
  personnalisee: "text-muted-foreground border-border bg-elevated",
};

const PRIORITY_TONE: Record<HabitPriority, string> = {
  critique: "text-red-300 border-red-400/30 bg-red-500/[0.08]",
  haute: "text-amber-300 border-amber-400/30 bg-amber-500/[0.08]",
  moyenne: "text-muted-foreground border-border bg-elevated",
  basse: "text-muted-foreground border-border/60 bg-transparent",
};

const NATURE_TONE: Record<HabitNature, string> = {
  obligatoire: "text-red-200 border-red-400/40 bg-red-500/[0.10]",
  progression: "text-sky-200 border-sky-400/30 bg-sky-500/[0.08]",
  contextuelle: "text-violet-200 border-violet-400/30 bg-violet-500/[0.08]",
};

function LinkChips({ habit }: { habit: Habit }) {
  if (habit.links.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {habit.links.map((l) => (
        <Link
          key={`${l.kind}-${l.id}`}
          to={l.to ?? "/"}
          className="inline-flex items-center gap-1 rounded border border-border bg-background/40 px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
          title={l.contribution}
        >
          <Link2 className="h-2.5 w-2.5" />
          <span className="uppercase tracking-[0.14em]">{HABIT_LINK_LABEL[l.kind]}</span>
          <span className="text-foreground/80">{l.label}</span>
        </Link>
      ))}
    </div>
  );
}

function HabitudesPage() {
  // Lecture côté client pour éviter le mismatch d'hydratation sur les dates.
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<HabitForToday[]>([]);
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [consistency, setConsistency] = useState(0);
  const [impactScore, setImpactScore] = useState(0);
  const [phase, setPhaseState] = useState<HabitPhase>("standard");
  const [showForm, setShowForm] = useState(false);

  const refresh = () => {
    setItems(readTodayHabits());
    setAllHabits(readAllHabits());
    setConsistency(globalConsistency());
    setImpactScore(globalImpactScore());
    setPhaseState(currentPhase());
  };

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  const stats = useMemo(() => {
    const due = items.filter((i) => i.dueToday);
    const done = items.filter((i) => i.dueToday && i.doneToday);
    const pending = due.filter((i) => !i.doneToday);
    return { due: due.length, done: done.length, pending: pending.length };
  }, [items]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* En-tête */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gold">
            <Repeat className="h-3.5 w-3.5" /> Moteur de comportements
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Habitudes</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Ce que tu répètes chaque jour devient qui tu es. Chaque habitude porte un sens, une fréquence et un poids dans la décision quotidienne.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-border bg-elevated px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Impact 30j</p>
            <p className="text-2xl font-semibold text-foreground">{mounted ? `${impactScore}%` : "—"}</p>
          </div>
          <div className="rounded-xl border border-border bg-elevated px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Constance 7j</p>
            <p className="text-2xl font-semibold text-gold">{mounted ? consistency : 0}%</p>
          </div>
          <div className="rounded-xl border border-border bg-elevated px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Aujourd'hui</p>
            <p className="text-2xl font-semibold text-foreground">{mounted ? `${stats.done}/${stats.due}` : "—"}</p>
          </div>
        </div>
      </header>

      {/* Phase de vie */}
      <section className="mt-6 rounded-2xl border border-border bg-elevated p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Phase actuelle</p>
            <p className="mt-1 text-sm font-medium text-foreground">{phaseDefinition(phase).label}</p>
            <p className="mt-1 max-w-xl text-[12px] text-muted-foreground">{phaseDefinition(phase).description}</p>
          </div>
          <Link
            to="/notifications"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
          >
            <Bell className="h-3.5 w-3.5" /> Rappels natifs
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {HABIT_PHASES.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPhase(p.id); refresh(); }}
              className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                p.id === phase
                  ? "border-gold/50 bg-gold/[0.10] text-gold"
                  : "border-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {mounted && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            {items.filter((i) => !i.activeInPhase).length} habitude(s) mise(s) en veille par cette phase — les non négociables restent actives.
          </p>
        )}
      </section>

      {/* Vue Aujourd'hui */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Aujourd'hui</h2>
          <span className="text-xs text-muted-foreground">{stats.pending} habitudes en attente</span>
        </div>
        {!mounted ? (
          <div className="rounded-2xl border border-border bg-elevated p-8 text-center text-sm text-muted-foreground">
            Chargement des habitudes du jour...
          </div>
        ) : (
          <div className="space-y-3">
            {items
              .filter((i) => i.dueToday)
              .map((item) => (
                <HabitRow key={item.habit.id} item={item} onChange={refresh} />
              ))}
            {items.filter((i) => i.dueToday).length === 0 && (
              <p className="rounded-2xl border border-border bg-elevated p-6 text-sm text-muted-foreground">
                Aucune habitude programmée aujourd'hui.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Catalogue + formulaire */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Catalogue</h2>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/[0.08]"
          >
            {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showForm ? "Fermer" : "Nouvelle habitude"}
          </button>
        </div>
        {showForm && <HabitForm onCreated={() => { refresh(); setShowForm(false); }} />}
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onDelete={refresh} />
          ))}
        </div>
      </section>
    </div>
  );
}

function HabitRow({ item, onChange }: { item: HabitForToday; onChange: () => void }) {
  const h = item.habit;
  const chain = h.objectiveId ? ancestorsOf(h.objectiveId) : [];
  const objective = chain[chain.length - 1];

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border px-5 py-4 transition-colors md:flex-row md:items-center md:justify-between ${
        item.doneToday
          ? "border-gold/40 bg-gold/[0.06]"
          : h.category === "mission"
          ? "border-gold/30 bg-gold/[0.04]"
          : "border-border bg-elevated"
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => {
            item.doneToday ? markMissed(h.id) : markDone(h.id);
            onChange();
          }}
          className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-gold"
          aria-label={item.doneToday ? "Marquer non fait" : "Marquer fait"}
        >
          {item.doneToday ? <CheckCircle2 className="h-5 w-5 text-gold" /> : <Circle className="h-5 w-5" strokeWidth={1.5} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${DOMAIN_TONE[h.domain]}`}>
              {HABIT_DOMAIN_LABEL[h.domain]}
            </span>
            <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${CATEGORY_TONE[h.category]}`}>
              {HABIT_CATEGORY_LABEL[h.category]}
            </span>
            <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${NATURE_TONE[h.nature]}`}>
              {HABIT_NATURE_LABEL[h.nature]}
            </span>
            <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${PRIORITY_TONE[h.priority]}`}>
              {h.priority}
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-gold/30 bg-gold/[0.06] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-gold">
              <Zap className="h-2.5 w-2.5" /> Impact {item.impact.weight}/10
            </span>
          </div>
          <p className={`mt-1.5 text-sm font-medium ${item.doneToday ? "text-muted-foreground line-through" : "text-foreground"}`}>
            {h.title}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">{h.why}</p>
          {objective && (
            <p className="mt-1.5 text-[11px] text-gold">
              <Target className="mb-0.5 inline h-3 w-3" /> {objective.title}
            </p>
          )}
          <LinkChips habit={h} />
        </div>
      </div>
      <div className="flex items-center gap-4 md:justify-end">
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
            <Flame className="h-3 w-3 text-gold" /> Série {item.streak} j
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <TrendingUp className="h-3 w-3" /> {item.consistency.last7Days}% 7j
          </div>
          <div className="mt-1 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
            <AlertCircle className="h-3 w-3 text-red-300" /> Coût d'abandon {item.impact.costOfSkipping}
          </div>
          {h.recommendedTime && (
            <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">{h.recommendedTime} · {h.estimatedMinutes} min</p>
          )}
        </div>
        {!item.doneToday && (
          <div className="flex gap-1">
            <button
              onClick={() => { markPartial(h.id); onChange(); }}
              className="rounded-md border border-border px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-amber-400/40 hover:text-amber-400"
            >
              Partiel
            </button>
            <button
              onClick={() => { markMissed(h.id); onChange(); }}
              className="rounded-md border border-border px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-red-400/40 hover:text-red-400"
            >
              Manqué
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HabitCard({ habit, onDelete }: { habit: Habit; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const chain = habit.objectiveId ? ancestorsOf(habit.objectiveId) : [];
  const objective = chain[chain.length - 1];

  return (
    <div className="rounded-2xl border border-border bg-elevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${DOMAIN_TONE[habit.domain]}`}>
            {HABIT_DOMAIN_LABEL[habit.domain]}
          </span>
          <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${CATEGORY_TONE[habit.category]}`}>
            {HABIT_CATEGORY_LABEL[habit.category]}
          </span>
          <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${NATURE_TONE[habit.nature]}`}>
            {HABIT_NATURE_LABEL[habit.nature]}
          </span>
        </div>
        <button
          onClick={() => { deleteHabit(habit.id); onDelete(); }}
          className="text-muted-foreground transition-colors hover:text-red-400"
          aria-label="Supprimer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-sm font-medium">{habit.title}</p>
      <p className="mt-1 text-[12px] text-muted-foreground">{habit.why}</p>
      {objective && (
        <Link to="/objectifs" className="mt-2 inline-block text-[11px] text-gold hover:underline">
          <Target className="mb-0.5 inline h-3 w-3" /> {objective.title}
        </Link>
      )}
      <LinkChips habit={habit} />
      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-gold"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />} Détails
      </button>
      {open && (
        <div className="mt-3 space-y-2 border-t border-border pt-3 text-[12px] text-muted-foreground">
          <p><span className="text-foreground">Fréquence :</span> {formatFrequency(habit.frequency)}</p>
          <p><span className="text-foreground">Priorité :</span> {habit.priority}</p>
          <p><span className="text-foreground">Poids d'impact :</span> {habit.impactWeight}/10</p>
          {habit.phases && habit.phases.length > 0 && (
            <p><span className="text-foreground">Phases actives :</span> {habit.phases.join(", ")}</p>
          )}
          {habit.pausedInPhases && habit.pausedInPhases.length > 0 && (
            <p><span className="text-foreground">Suspendue en :</span> {habit.pausedInPhases.join(", ")}</p>
          )}
          {habit.links.length > 0 && (
            <div>
              <p className="text-foreground">Ce qu'elle alimente :</p>
              <ul className="mt-1 space-y-0.5">
                {habit.links.map((l) => (
                  <li key={`${l.kind}-${l.id}`}>· {l.label} — {l.contribution}</li>
                ))}
              </ul>
            </div>
          )}
          {habit.recommendedTime && <p><span className="text-foreground">Horaire :</span> {habit.recommendedTime}</p>}
          <p><span className="text-foreground">Durée :</span> {habit.estimatedMinutes} min</p>
        </div>
      )}
    </div>
  );
}

function HabitForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");
  const [domain, setDomain] = useState<HabitDomain>("business");
  const [category, setCategory] = useState<HabitCategory>("fondamentale");
  const [nature, setNature] = useState<HabitNature>("progression");
  const [impactWeight, setImpactWeight] = useState(6);
  const [linkKind, setLinkKind] = useState<Habit["links"][number]["kind"]>("objectif");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkContribution, setLinkContribution] = useState("");
  const [priority, setPriority] = useState<HabitPriority>("haute");
  const [frequencyKind, setFrequencyKind] = useState<HabitFrequency["kind"]>("daily");
  const [recommendedTime, setRecommendedTime] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [objectiveId, setObjectiveId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !why.trim()) return;
    let frequency: HabitFrequency;
    if (frequencyKind === "weekly") frequency = { kind: "weekly", days: [1, 2, 3, 4, 5] };
    else if (frequencyKind === "monthly") frequency = { kind: "monthly", dates: [1, 15] };
    else frequency = { kind: "daily" };
    addHabit({
      title: title.trim(),
      why: why.trim(),
      domain,
      category,
      nature,
      impactWeight,
      links: linkLabel.trim()
        ? [
            {
              kind: linkKind,
              id: linkLabel.trim().toLowerCase().replace(/\s+/g, "-"),
              label: linkLabel.trim(),
              contribution: linkContribution.trim() || "Contribution directe",
              weight: 0.5,
            },
          ]
        : [],
      frequency,
      priority,
      recommendedTime: recommendedTime || undefined,
      estimatedMinutes,
      objectiveId: objectiveId || undefined,
    });
    setTitle("");
    setWhy("");
    setDomain("business");
    setCategory("fondamentale");
    setNature("progression");
    setImpactWeight(6);
    setLinkLabel("");
    setLinkContribution("");
    setPriority("haute");
    setFrequencyKind("daily");
    setRecommendedTime("");
    setEstimatedMinutes(30);
    setObjectiveId("");
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gold/30 bg-gold/[0.04] p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Titre de l'habitude</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Lire 30 min — livre de fond"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Pourquoi ?</label>
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="Pourquoi cette habitude est essentielle à l'homme que tu as choisi d'être ?"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
            rows={2}
            required
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Domaine</label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value as HabitDomain)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
          >
            {Object.entries(HABIT_DOMAIN_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Catégorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as HabitCategory)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
          >
            {Object.entries(HABIT_CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Fréquence</label>
          <select
            value={frequencyKind}
            onChange={(e) => setFrequencyKind(e.target.value as HabitFrequency["kind"])}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
          >
            <option value="daily">Quotidienne</option>
            <option value="weekly">Hebdomadaire (lun-ven)</option>
            <option value="monthly">Mensuelle (1er et 15)</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Priorité</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as HabitPriority)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
          >
            <option value="critique">Critique</option>
            <option value="haute">Haute</option>
            <option value="moyenne">Moyenne</option>
            <option value="basse">Basse</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Horaire recommandé</label>
          <input
            type="time"
            value={recommendedTime}
            onChange={(e) => setRecommendedTime(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Durée estimée (min)</label>
          <input
            type="number"
            min={1}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Lien objectif (ID optionnel)</label>
          <input
            value={objectiveId}
            onChange={(e) => setObjectiveId(e.target.value)}
            placeholder="Ex: week-calls, mission, day-journal"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
      >
        <Plus className="h-4 w-4" /> Créer l'habitude
      </button>
    </form>
  );
}

function formatFrequency(f: HabitFrequency): string {
  switch (f.kind) {
    case "daily":
      return "Quotidienne";
    case "weekly":
      return `Hebdomadaire — ${f.days.length} jours`;
    case "monthly":
      return `Mensuelle — ${f.dates.join(", ")}`;
  }
}
