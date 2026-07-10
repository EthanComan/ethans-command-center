/**
 * ETHAN — Contrat de module.
 *
 * Chaque module de l'application implémente `EthanModule`. Le core ne
 * connaît QUE ce contrat : il n'importe jamais un module directement.
 * C'est ce qui permet à ETHAN de scaler à 30, 50, 100 modules sans
 * couplage.
 *
 * Un module :
 *   1. Expose son état courant via `snapshot()` (lu par les autres
 *      modules et par Le Cerveau).
 *   2. Émet des signaux (voir `src/brain/types.ts`) pour alimenter
 *      le moteur de décision.
 *   3. Publie des événements sur le bus (`src/core/bus.ts`) quand
 *      son état change.
 *   4. Peut réagir aux événements des autres modules via `onEvent`.
 */

import type { Signal } from "@/brain/types";
import type { DomainEvent } from "./bus";

export type ModuleId =
  | "prospection"
  | "crm"
  | "pipeline"
  | "kpi"
  | "business"
  | "sport"
  | "sante"
  | "mental"
  | "habitudes"
  | "finances"
  | "patrimoine"
  | "investissements"
  | "vision"
  | "objectifs"
  | "journal"
  | "protocoles"
  | "planning";

export interface EthanModule<TSnapshot = unknown> {
  id: ModuleId;
  /** État courant, lisible par tout autre module et par Le Cerveau. */
  snapshot(): TSnapshot;
  /** Signaux poussés vers Le Cerveau à chaque cycle d'analyse. */
  getSignals(ctx: ModuleContext): Signal[];
  /** Réaction aux événements publiés par d'autres modules. */
  onEvent?(event: DomainEvent, ctx: ModuleContext): void;
}

/**
 * Contexte injecté à chaque module — lui donne accès aux snapshots
 * des autres modules SANS les importer directement (loose coupling).
 */
export interface ModuleContext {
  get<T = unknown>(id: ModuleId): T | undefined;
}