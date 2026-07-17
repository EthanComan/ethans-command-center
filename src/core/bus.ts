/**
 * ETHAN — Bus d'événements inter-modules.
 *
 * Chaque module publie des événements typés que les autres modules
 * (et Le Cerveau) peuvent écouter. C'est la colonne vertébrale de la
 * communication : aucun module n'importe directement un autre module.
 *
 * Exemples :
 *   - Sport publie `sport:session_completed` → Santé recalcule la charge,
 *     Mental met à jour l'énergie, Le Cerveau réévalue les priorités.
 *   - CRM publie `crm:followup_due` → Planning crée un rappel.
 *   - Habitudes publie `habitudes:streak_at_risk` → Le Cerveau escalade.
 */

import type { ModuleId } from "./contracts";

export type EventKind =
  // Business
  | "business:kpi_updated"
  | "prospection:call_logged"
  | "prospection:inactivity_detected"
  | "crm:deal_moved"
  | "crm:followup_due"
  | "pipeline:stage_changed"
  // Performance
  | "sport:session_completed"
  | "sport:recovery_needed"
  | "sante:biomarker_updated"
  | "mental:energy_updated"
  | "habitudes:completed"
  | "habitudes:streak_at_risk"
  | "habitudes:updated"
  // Patrimoine
  | "finances:cashflow_alert"
  | "investissements:position_updated"
  // Personnel
  | "objectifs:progress_updated"
  | "objectifs:goal_gap_detected"
  | "journal:entry_added"
  | "protocoles:started"
  | "protocoles:completed"
  // Planning (transverse)
  | "planning:slot_reserved"
  | "planning:reminder_created";

export interface DomainEvent<P = unknown> {
  kind: EventKind;
  source: ModuleId;
  at: number;
  payload: P;
}

type Handler = (event: DomainEvent) => void;

const handlers = new Map<EventKind, Set<Handler>>();
const wildcard = new Set<Handler>();

export function subscribe(kind: EventKind, handler: Handler): () => void {
  if (!handlers.has(kind)) handlers.set(kind, new Set());
  handlers.get(kind)!.add(handler);
  return () => handlers.get(kind)?.delete(handler);
}

export function subscribeAll(handler: Handler): () => void {
  wildcard.add(handler);
  return () => wildcard.delete(handler);
}

export function publish<P>(event: DomainEvent<P>): void {
  handlers.get(event.kind)?.forEach((h) => h(event));
  wildcard.forEach((h) => h(event));
}

/** Journal court d'événements pour debug et Cerveau (dernier en tête). */
const journal: DomainEvent[] = [];
const JOURNAL_LIMIT = 200;
subscribeAll((e) => {
  journal.unshift(e);
  if (journal.length > JOURNAL_LIMIT) journal.length = JOURNAL_LIMIT;
});

export function getEventJournal(): ReadonlyArray<DomainEvent> {
  return journal;
}