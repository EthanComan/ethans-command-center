import {
  LayoutDashboard,
  Briefcase,
  Activity,
  Target,
  Users,
  Handshake,
  GitBranch,
  BarChart3,
  Dumbbell,
  HeartPulse,
  Brain,
  Repeat,
  Wallet,
  Landmark,
  TrendingUp,
  Eye,
  Flag,
  BookOpen,
  Library,
  ClipboardList,
  Settings,
  Sparkles,
  Bell,
  Dna,
  Heart,
  History,
  TrendingUp as TrendingUpIcon,
  Zap,
  CalendarDays,
  MessagesSquare,
  Radar,
  Compass,
  type LucideIcon,
} from "lucide-react";

export type ModuleStatus = "live" | "soon";

export interface ModuleDef {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  status: ModuleStatus;
  description?: string;
}

export interface ModuleCategory {
  id: string;
  label: string;
  modules: ModuleDef[];
}

/**
 * Source unique de vérité pour la navigation ETHAN.
 * Ajouter un module = ajouter une ligne. La sidebar, les routes de démo
 * et les pages "Coming soon" s'alimentent depuis ce registre.
 */
export const MODULE_CATEGORIES: ModuleCategory[] = [
  {
    id: "fondations",
    label: "Fondations",
    modules: [
      { id: "identite", label: "Identité", to: "/identite", icon: Compass, status: "live", description: "Historique, identité actuelle, direction — et grille de leadership" },
      { id: "adn", label: "ADN", to: "/adn", icon: Dna, status: "live", description: "Mission, valeurs, code d'honneur, principes" },
      { id: "renaitre", label: "Renaître", to: "/renaitre", icon: Heart, status: "live", description: "Mission de vie — projet humanitaire" },
      { id: "memoire", label: "Mémoire", to: "/memoire", icon: History, status: "live", description: "Histoire de ton évolution — décisions, réussites, échecs, apprentissages" },
      { id: "progression", label: "Progression", to: "/progression", icon: TrendingUpIcon, status: "live", description: "L'évolution de l'homme sur 8 axes fondamentaux" },
    ],
  },
  {
    id: "business",
    label: "Business",
    modules: [
      { id: "dashboard", label: "Dashboard", to: "/", icon: LayoutDashboard, status: "live", description: "Vue d'ensemble de la journée" },
      { id: "planning", label: "Planning", to: "/planning", icon: CalendarDays, status: "live", description: "Planning Intelligent — jour, semaine, RDV, blocs, sport, habitudes, tâches inter-modules" },
      { id: "business", label: "Business", to: "/business", icon: Briefcase, status: "live", description: "Directeur commercial — pipeline, CRM, partenaires, KPI, prospection VEFA" },
    ],
  },
  {
    id: "performance",
    label: "Performance",
    modules: [
      { id: "performance", label: "Performance", to: "/performance", icon: Activity, status: "live", description: "Sport, santé et mental — capacité réelle d'exécution" },
      { id: "habitudes", label: "Habitudes", to: "/habitudes", icon: Repeat, status: "live", description: "Moteur de comportements quotidiens" },
    ],
  },
  {
    id: "patrimoine",
    label: "Patrimoine",
    modules: [
      { id: "finances", label: "Finances", to: "/finances", icon: Wallet, status: "live", description: "Cash-flow, patrimoine et investissements — cap 400 k€/mois" },
    ],
  },
  {
    id: "personnel",
    label: "Personnel",
    modules: [
      { id: "objectifs", label: "Objectifs", to: "/objectifs", icon: Flag, status: "live", description: "Vision, trimestres et cibles" },
      { id: "journal", label: "Journal", to: "/journal", icon: BookOpen, status: "live", description: "Écriture quotidienne" },
      { id: "protocoles", label: "Protocoles", to: "/protocoles", icon: ClipboardList, status: "live", description: "Playbooks, rituels et références" },
    ],
  },
  {
    id: "systeme",
    label: "Système",
    modules: [
      { id: "ethan", label: "ETHAN", to: "/ethan", icon: MessagesSquare, status: "live", description: "Conversation globale — parle de n'importe quel sujet" },
      { id: "suivi", label: "Suivi", to: "/suivi", icon: Radar, status: "live", description: "Ce qu'ETHAN observe dans le temps et te signale" },
      { id: "execution", label: "Mode Exécution", to: "/execution", icon: Zap, status: "live", description: "Environnement zéro-distraction pour exécuter" },
      { id: "notifications", label: "Notifications", to: "/notifications", icon: Bell, status: "live", description: "Rappels natifs et alertes système" },
      { id: "parametres", label: "Paramètres", to: "/parametres", icon: Settings, status: "live", description: "Préférences du système" },
    ],
  },
];


export const ALL_MODULES: ModuleDef[] = MODULE_CATEGORIES.flatMap((c) => c.modules);

export function getModuleByPath(path: string): ModuleDef | undefined {
  return ALL_MODULES.find((m) => m.to === path);
}