/**
 * ETHAN — Module Finances (cash-flow, patrimoine, investissements).
 *
 * Une seule vérité financière : ce qui rentre, ce qui sort, ce qui reste,
 * et la distance qui sépare l'homme de sa destination (400 000 €/mois).
 */

import { commissionsCashedEUR, commissionsPendingEUR, cashFlowSchedule } from "@/modules/business/analytics";
import { backPlan, DESTINATION_MONTHLY_EUR } from "@/modules/identite/destination";

export interface Flow {
  id: string;
  label: string;
  amountEUR: number;
  kind: "revenu" | "charge";
  category: string;
  recurrent: boolean;
}

export const FLOWS: Flow[] = [
  { id: "f1", label: "Commissions VEFA", amountEUR: 0, kind: "revenu", category: "Business", recurrent: true },
  { id: "f2", label: "Apport off-market / prestige", amountEUR: 4_500, kind: "revenu", category: "Business", recurrent: false },
  { id: "f3", label: "Loyer & charges", amountEUR: 1_850, kind: "charge", category: "Vie", recurrent: true },
  { id: "f4", label: "Véhicule & déplacements", amountEUR: 620, kind: "charge", category: "Business", recurrent: true },
  { id: "f5", label: "Outils, CRM, publicité", amountEUR: 780, kind: "charge", category: "Business", recurrent: true },
  { id: "f6", label: "Vie courante", amountEUR: 1_400, kind: "charge", category: "Vie", recurrent: true },
  { id: "f7", label: "Impôts & cotisations (provision)", amountEUR: 2_300, kind: "charge", category: "Fiscal", recurrent: true },
];

export interface Asset {
  id: string;
  label: string;
  valueEUR: number;
  debtEUR: number;
  kind: "immobilier" | "liquidites" | "financier" | "entreprise";
  yieldPct?: number;
}

export const ASSETS: Asset[] = [
  { id: "a1", label: "Trésorerie de sécurité", valueEUR: 28_000, debtEUR: 0, kind: "liquidites" },
  { id: "a2", label: "Appartement locatif VEFA", valueEUR: 245_000, debtEUR: 198_000, kind: "immobilier", yieldPct: 4.1 },
  { id: "a3", label: "PEA / ETF monde", valueEUR: 34_500, debtEUR: 0, kind: "financier", yieldPct: 7.2 },
  { id: "a4", label: "Activité commerciale (valeur de flux)", valueEUR: 120_000, debtEUR: 0, kind: "entreprise" },
];

export function monthlyIncomeEUR(): number {
  const business = commissionsCashedEUR();
  return business + FLOWS.filter((f) => f.kind === "revenu").reduce((s, f) => s + f.amountEUR, 0);
}

export function monthlyChargesEUR(): number {
  return FLOWS.filter((f) => f.kind === "charge").reduce((s, f) => s + f.amountEUR, 0);
}

export function netMonthlyEUR(): number {
  return monthlyIncomeEUR() - monthlyChargesEUR();
}

export function savingsRatePct(): number {
  const income = monthlyIncomeEUR();
  if (income <= 0) return 0;
  return Math.round((netMonthlyEUR() / income) * 100);
}

/** Nombre de mois tenables sans aucune rentrée. */
export function runwayMonths(): number {
  const cash = ASSETS.filter((a) => a.kind === "liquidites").reduce((s, a) => s + a.valueEUR, 0);
  const charges = monthlyChargesEUR();
  if (charges <= 0) return 99;
  return Math.round((cash / charges) * 10) / 10;
}

export function netWorthEUR(): number {
  return ASSETS.reduce((s, a) => s + a.valueEUR - a.debtEUR, 0);
}

export function grossWorthEUR(): number {
  return ASSETS.reduce((s, a) => s + a.valueEUR, 0);
}

export function debtEUR(): number {
  return ASSETS.reduce((s, a) => s + a.debtEUR, 0);
}

export function allocation() {
  const gross = grossWorthEUR() || 1;
  const byKind = new Map<Asset["kind"], number>();
  for (const a of ASSETS) byKind.set(a.kind, (byKind.get(a.kind) ?? 0) + a.valueEUR);
  return [...byKind.entries()]
    .map(([kind, value]) => ({ kind, value, share: Math.round((value / gross) * 100) }))
    .sort((a, b) => b.value - a.value);
}

export function destination() {
  return { ...backPlan(monthlyIncomeEUR()), targetEUR: DESTINATION_MONTHLY_EUR };
}

export function upcomingCash() {
  return cashFlowSchedule(4);
}

export function pendingEUR() {
  return commissionsPendingEUR();
}

export interface FinanceVerdict {
  level: "critique" | "attention" | "solide";
  title: string;
  why: string;
  order: string;
}

/** Le verdict financier : pas un constat, un ordre. */
export function financeVerdict(): FinanceVerdict {
  const runway = runwayMonths();
  const rate = savingsRatePct();
  const d = destination();

  if (runway < 3) {
    return {
      level: "critique",
      title: `Runway ${runway} mois — zone rouge`,
      why: "Sous 3 mois de trésorerie, chaque décision commerciale devient une décision de survie, pas de stratégie.",
      order: "Encaisser les commissions en attente et geler toute dépense non productive cette semaine.",
    };
  }
  if (rate < 25) {
    return {
      level: "attention",
      title: `Taux d'épargne ${rate}% — trop faible pour bâtir`,
      why: "Un revenu qui monte sans taux d'épargne ne construit pas de patrimoine : il finance un train de vie.",
      order: "Fixer un prélèvement automatique de 30% des commissions vers la réserve avant toute dépense.",
    };
  }
  return {
    level: "solide",
    title: `${d.progress}% de la destination — cap tenu`,
    why: "La base est saine. Le sujet n'est plus la sécurité, c'est la vitesse vers 400 000 €/mois.",
    order: `Passer au ${d.nextMilestone.label} : viser ${d.nextMilestone.monthlyEUR.toLocaleString("fr-FR")} €/mois.`,
  };
}

export function eur(value: number): string {
  return `${Math.round(value).toLocaleString("fr-FR")} €`;
}
