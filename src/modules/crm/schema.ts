/**
 * Référentiel du CRM et des dossiers — champs, libellés, étapes.
 * Aucune donnée : uniquement la structure de ce que l'utilisateur saisit.
 */
import type { FieldDef } from "@/components/record-form";
import type { Row } from "@/lib/data.functions";

export interface Contact extends Row {
  first_name: string;
  last_name: string;
  company: string | null;
  role_title: string | null;
  contact_type: string;
  phone: string | null;
  email: string | null;
  linkedin: string | null;
  source: string | null;
  notes: string | null;
  last_contact_at: string | null;
  next_action: string | null;
  follow_up_on: string | null;
  status: string;
  priority: string;
}

export interface Deal extends Row {
  title: string;
  contact_id: string | null;
  client_name: string | null;
  operation_type: string | null;
  location: string | null;
  budget_eur: number | null;
  need: string | null;
  program: string | null;
  developer: string | null;
  stakeholders: string | null;
  status: string;
  stage: string;
  commission_eur: number | null;
  probability: number;
  notes: string | null;
  last_action: string | null;
  next_action: string | null;
  due_on: string | null;
}

export const CONTACT_TYPES = [
  { value: "client", label: "Client" },
  { value: "prospect", label: "Prospect" },
  { value: "promoteur", label: "Promoteur" },
  { value: "partenaire", label: "Partenaire" },
  { value: "investisseur", label: "Investisseur" },
  { value: "autre", label: "Autre" },
];

export const CONTACT_STATUS = [
  { value: "actif", label: "Actif" },
  { value: "en_attente", label: "En attente" },
  { value: "froid", label: "Froid" },
  { value: "gagne", label: "Gagné" },
  { value: "perdu", label: "Perdu" },
];

export const PRIORITIES = [
  { value: "haute", label: "Haute" },
  { value: "normale", label: "Normale" },
  { value: "basse", label: "Basse" },
];

export const CONTACT_FIELDS: FieldDef[] = [
  { name: "first_name", label: "Prénom", required: true },
  { name: "last_name", label: "Nom", required: true },
  { name: "company", label: "Société" },
  { name: "role_title", label: "Fonction" },
  { name: "contact_type", label: "Type de contact", type: "select", options: CONTACT_TYPES },
  { name: "source", label: "Source", placeholder: "Recommandation, portail, LinkedIn…" },
  { name: "phone", label: "Téléphone", type: "tel" },
  { name: "email", label: "Email", type: "email" },
  { name: "linkedin", label: "LinkedIn", full: true },
  { name: "status", label: "Statut", type: "select", options: CONTACT_STATUS },
  { name: "priority", label: "Priorité", type: "select", options: PRIORITIES },
  { name: "last_contact_at", label: "Dernier contact", type: "datetime-local" },
  { name: "follow_up_on", label: "Date de relance", type: "date" },
  { name: "next_action", label: "Prochaine action", full: true },
  { name: "notes", label: "Notes", type: "textarea" },
];

export const STAGES = [
  { value: "nouveau", label: "Nouveau" },
  { value: "contacte", label: "Contacté" },
  { value: "qualifie", label: "Qualifié" },
  { value: "recherche", label: "Recherche" },
  { value: "proposition", label: "Proposition" },
  { value: "negociation", label: "Négociation" },
  { value: "reservation", label: "Réservation" },
  { value: "vente", label: "Vente" },
  { value: "perdu", label: "Perdu" },
];

export const STAGE_LABEL: Record<string, string> = Object.fromEntries(
  STAGES.map((s) => [s.value, s.label]),
);

export const DEAL_STATUS = [
  { value: "actif", label: "Actif" },
  { value: "en_attente", label: "En attente" },
  { value: "bloque", label: "Bloqué" },
  { value: "gagne", label: "Gagné" },
  { value: "perdu", label: "Perdu" },
];

export function dealFields(contacts: Contact[]): FieldDef[] {
  return [
    { name: "title", label: "Nom du dossier", required: true, full: true },
    {
      name: "contact_id",
      label: "Contact associé",
      type: "select",
      options: contacts.map((c) => ({
        value: c.id,
        label: `${c.first_name} ${c.last_name}${c.company ? ` — ${c.company}` : ""}`.trim(),
      })),
    },
    { name: "client_name", label: "Client / entreprise" },
    { name: "operation_type", label: "Type d'opération", placeholder: "VEFA, ancien, immeuble…" },
    { name: "location", label: "Localisation" },
    { name: "budget_eur", label: "Budget (€)", type: "number" },
    { name: "commission_eur", label: "Commission attendue (€)", type: "number" },
    { name: "need", label: "Besoin", placeholder: "T3, 2 chambres, terrasse…", full: true },
    { name: "program", label: "Programme / opportunité" },
    { name: "developer", label: "Promoteur" },
    { name: "stakeholders", label: "Interlocuteurs", full: true },
    { name: "stage", label: "Étape commerciale", type: "select", options: STAGES },
    { name: "status", label: "Statut", type: "select", options: DEAL_STATUS },
    { name: "probability", label: "Probabilité (%)", type: "number" },
    { name: "due_on", label: "Échéance", type: "date" },
    { name: "last_action", label: "Dernière action", full: true },
    { name: "next_action", label: "Prochaine action", full: true },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
}

export const ACTIVITY_KINDS = [
  { value: "appel", label: "Appel" },
  { value: "email", label: "Email" },
  { value: "rdv", label: "Rendez-vous" },
  { value: "note", label: "Note" },
  { value: "etape", label: "Changement d'étape" },
];

export function contactName(c?: Contact | null): string {
  if (!c) return "";
  return `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.company || "Sans nom";
}

export const eur = (n: number | null | undefined) =>
  n === null || n === undefined
    ? "—"
    : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
