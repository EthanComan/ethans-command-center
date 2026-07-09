import type {
  ActionCategory,
  ModuleSource,
  RecommendedAction,
  Signal,
  SignalKind,
} from "./types";
import { getSignals } from "./signals";

/**
 * Le Cerveau — moteur de décision.
 *
 * Chaque signal est scoré selon :
 *   score = intensité × poids(kind) × fraîcheur × alignement(énergie)
 *
 * Le signal dominant devient l'action recommandée. Les autres signaux
 * pertinents restent disponibles comme "actions secondaires".
 */

const KIND_WEIGHT: Record<SignalKind, number> = {
  goal_gap: 1.0,
  inactivity: 0.95,
  opportunity: 0.9,
  deferred_task: 0.85,
  streak_risk: 0.7,
  financial_alert: 0.9,
  energy_state: 0.4,      // module de contexte, rarement action directe
  recovery_needed: 0.6,
};

const SOURCE_CATEGORY: Record<ModuleSource, ActionCategory> = {
  business: "business",
  prospection: "business",
  crm: "business",
  pipeline: "business",
  kpi: "business",
  finances: "patrimoine",
  patrimoine: "patrimoine",
  investissements: "patrimoine",
  sport: "performance",
  sante: "performance",
  mental: "performance",
  habitudes: "performance",
  vision: "personnel",
  objectifs: "personnel",
  journal: "personnel",
  protocoles: "personnel",
  planning: "personnel",
};

const SOURCE_ROUTE: Record<ModuleSource, string> = {
  business: "/business",
  prospection: "/prospection",
  crm: "/crm",
  pipeline: "/pipeline",
  kpi: "/kpi",
  finances: "/finances",
  patrimoine: "/patrimoine",
  investissements: "/investissements",
  sport: "/sport",
  sante: "/sante",
  mental: "/mental",
  habitudes: "/habitudes",
  vision: "/vision",
  objectifs: "/objectifs",
  journal: "/journal",
  protocoles: "/protocoles",
  planning: "/",
};

function freshness(updatedAt: number): number {
  const hours = (Date.now() - updatedAt) / (60 * 60 * 1000);
  // Décroissance douce : 1.0 sous 6h, ~0.7 à 48h, ~0.5 à 96h.
  return 1 / (1 + hours / 48);
}

function scoreSignal(signal: Signal, energy: number): number {
  const base = signal.intensity * (KIND_WEIGHT[signal.kind] ?? 0.5);
  const time = freshness(signal.updatedAt);
  // Faible énergie → on booste les actions simples (appels, admin),
  // on atténue légèrement les actions à forte charge créative.
  const creativeSources: ModuleSource[] = ["vision", "journal", "protocoles"];
  const energyFit = creativeSources.includes(signal.source)
    ? 0.5 + energy / 2
    : 1;
  return base * time * energyFit * 100;
}

function compose(signal: Signal, energy: number): Omit<RecommendedAction, "score" | "contributingSignals"> {
  const ctx = signal.context;
  switch (signal.kind) {
    case "inactivity":
      return {
        id: signal.id,
        source: signal.source,
        category: SOURCE_CATEGORY[signal.source],
        title: "Relancer 5 prospects prioritaires",
        reason: `Aucun nouvel appel de prospection depuis ${ctx.hoursSinceLastCall}h. C'est le levier avec le plus fort impact sur ton objectif hebdomadaire (${ctx.weeklyDone}/${ctx.weeklyTarget}).`,
        impact: "Comble ~30 % de l'écart avec l'objectif de la semaine.",
        estimatedMinutes: 45,
        to: SOURCE_ROUTE[signal.source],
      };
    case "opportunity":
      return {
        id: signal.id,
        source: signal.source,
        category: SOURCE_CATEGORY[signal.source],
        title: `Relancer ${ctx.deal}`,
        reason: `Deal en phase « ${ctx.stage} », dernier contact ${ctx.lastTouch}. La fenêtre de closing se referme rapidement.`,
        impact: "Fait progresser un deal à fort potentiel dans le pipeline.",
        estimatedMinutes: 15,
        to: SOURCE_ROUTE[signal.source],
      };
    case "streak_risk":
      return {
        id: signal.id,
        source: signal.source,
        category: SOURCE_CATEGORY[signal.source],
        title: `Protéger la série « ${ctx.habit} »`,
        reason: `Série de ${ctx.streak} jours en cours. La rompre coûte plus que de l'exécuter maintenant.`,
        impact: "Préserve un actif de discipline long-terme.",
        estimatedMinutes: 90,
        to: SOURCE_ROUTE[signal.source],
      };
    case "goal_gap":
      return {
        id: signal.id,
        source: signal.source,
        category: SOURCE_CATEGORY[signal.source],
        title: `Réduire l'écart sur : ${ctx.objective}`,
        reason: `Progression ${ctx.progress}% vs cible ${ctx.target}%. Le rattrapage tardif coûte plus cher.`,
        impact: "Remet la trajectoire hebdomadaire au vert.",
        estimatedMinutes: 60,
        to: SOURCE_ROUTE[signal.source],
      };
    case "energy_state":
      return {
        id: signal.id,
        source: signal.source,
        category: SOURCE_CATEGORY[signal.source],
        title: "Adapter le plan à ton énergie",
        reason: `Énergie à ${ctx.energy}/10 (sommeil ${ctx.sleepHours}h). Commence par des tâches simples ; garde le créatif pour l'après-midi.`,
        impact: "Évite la dette de fatigue et protège la journée.",
        estimatedMinutes: 10,
        to: SOURCE_ROUTE[signal.source],
      };
    case "recovery_needed":
      return {
        id: signal.id,
        source: signal.source,
        category: SOURCE_CATEGORY[signal.source],
        title: "Séance de récupération légère",
        reason: `HRV ${ctx.hrv}, dernière séance : ${ctx.lastSession}. Une récup active vaut mieux qu'une séance forcée.`,
        impact: "Protège la performance de demain.",
        estimatedMinutes: 25,
        to: SOURCE_ROUTE[signal.source],
      };
    case "deferred_task":
      return {
        id: signal.id,
        source: signal.source,
        category: SOURCE_CATEGORY[signal.source],
        title: "Exécuter la tâche reportée",
        reason: "Cette tâche a été reportée plusieurs fois. Il est temps de l'exécuter.",
        impact: "Libère de la charge mentale.",
        estimatedMinutes: 20,
        to: SOURCE_ROUTE[signal.source],
      };
    case "financial_alert":
      return {
        id: signal.id,
        source: signal.source,
        category: SOURCE_CATEGORY[signal.source],
        title: "Traiter l'alerte financière",
        reason: "Signal financier détecté — à traiter avant la fin de journée.",
        impact: "Protège le cashflow.",
        estimatedMinutes: 15,
        to: SOURCE_ROUTE[signal.source],
      };
  }
}

export interface BrainState {
  primary: RecommendedAction | null;
  secondary: RecommendedAction[];
  totalSignals: number;
  /** Énergie estimée du jour — 0 à 1. */
  energy: number;
}

export function analyze(): BrainState {
  const signals = getSignals();
  if (signals.length === 0) {
    return { primary: null, secondary: [], totalSignals: 0, energy: 0.7 };
  }

  const energySignal = signals.find((s) => s.kind === "energy_state");
  const energy = energySignal
    ? (Number(energySignal.context.energy) || 7) / 10
    : 0.7;

  const ranked = signals
    .map((s) => {
      const score = scoreSignal(s, energy);
      const draft = compose(s, energy);
      return { ...draft, score: Math.round(score), contributingSignals: [s] } as RecommendedAction;
    })
    .sort((a, b) => b.score - a.score);

  const [primary, ...rest] = ranked;
  return {
    primary: primary ?? null,
    secondary: rest.slice(0, 3),
    totalSignals: signals.length,
    energy,
  };
}