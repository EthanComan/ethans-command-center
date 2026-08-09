import {
  LayoutDashboard,
  Briefcase,
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
      { id: "business", label: "Business", to: "/business", icon: Briefcase, status: "live", description: "Directeur commercial — immobilier neuf VEFA, prestige et off-market" },
      { id: "prospection", label: "Prospection", to: "/prospection", icon: Target, status: "soon", description: "Séquences et opportunités" },
      { id: "crm", label: "CRM", to: "/crm", icon: Users, status: "soon", description: "Contacts et interactions" },
      { id: "partenaires", label: "Partenaires", to: "/partenaires", icon: Handshake, status: "soon", description: "Réseau et alliances" },
      { id: "pipeline", label: "Pipeline", to: "/pipeline", icon: GitBranch, status: "soon", description: "Suivi des deals" },
      { id: "kpi", label: "KPI", to: "/kpi", icon: BarChart3, status: "soon", description: "Indicateurs de performance" },
    ],
  },
  {
    id: "performance",
    label: "Performance",
    modules: [
      { id: "sport", label: "Sport", to: "/sport", icon: Dumbbell, status: "soon", description: "Entraînements et progression" },
      { id: "sante", label: "Santé", to: "/sante", icon: HeartPulse, status: "soon", description: "Biomarqueurs et récupération" },
      { id: "mental", label: "Mental", to: "/mental", icon: Brain, status: "soon", description: "Focus, énergie, sommeil" },
      { id: "habitudes", label: "Habitudes", to: "/habitudes", icon: Repeat, status: "live", description: "Moteur de comportements quotidiens" },
    ],
  },
  {
    id: "patrimoine",
    label: "Patrimoine",
    modules: [
      { id: "finances", label: "Finances", to: "/finances", icon: Wallet, status: "soon", description: "Cash-flow personnel" },
      { id: "patrimoine", label: "Patrimoine", to: "/patrimoine", icon: Landmark, status: "soon", description: "Bilan et allocation" },
      { id: "investissements", label: "Investissements", to: "/investissements", icon: TrendingUp, status: "soon", description: "Portefeuille et rendements" },
    ],
  },
  {
    id: "personnel",
    label: "Personnel",
    modules: [
      { id: "vision", label: "Vision", to: "/vision", icon: Eye, status: "soon", description: "Cap de vie à long terme" },
      { id: "objectifs", label: "Objectifs", to: "/objectifs", icon: Flag, status: "soon", description: "Trimestres et cibles" },
      { id: "journal", label: "Journal", to: "/journal", icon: BookOpen, status: "soon", description: "Écriture quotidienne" },
      { id: "bibliotheque", label: "Bibliothèque", to: "/bibliotheque", icon: Library, status: "soon", description: "Notes et lectures" },
      { id: "protocoles", label: "Protocoles", to: "/protocoles", icon: ClipboardList, status: "soon", description: "Playbooks et rituels" },
    ],
  },
  {
    id: "systeme",
    label: "Système",
    modules: [
      { id: "ethan", label: "ETHAN", to: "/ethan", icon: MessagesSquare, status: "live", description: "Conversation globale — parle de n'importe quel sujet" },
      { id: "suivi", label: "Suivi", to: "/suivi", icon: Radar, status: "live", description: "Ce qu'ETHAN observe dans le temps et te signale" },
      { id: "execution", label: "Mode Exécution", to: "/execution", icon: Zap, status: "live", description: "Environnement zéro-distraction pour exécuter" },
      { id: "parametres", label: "Paramètres", to: "/parametres", icon: Settings, status: "soon", description: "Préférences du système" },
      { id: "ia", label: "IA ETHAN", to: "/ia", icon: Sparkles, status: "soon", description: "Directeur général personnel" },
      { id: "notifications", label: "Notifications", to: "/notifications", icon: Bell, status: "live", description: "Rappels natifs et alertes système" },
    ],
  },
];

export const ALL_MODULES: ModuleDef[] = MODULE_CATEGORIES.flatMap((c) => c.modules);

export function getModuleByPath(path: string): ModuleDef | undefined {
  return ALL_MODULES.find((m) => m.to === path);
}