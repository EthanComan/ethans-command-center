/**
 * ETHAN — Registre de modules.
 *
 * Le registre est le point d'entrée du "système d'exploitation" :
 *   - il enregistre chaque module,
 *   - il expose leurs snapshots via un `ModuleContext` partagé,
 *   - il route les événements du bus vers les `onEvent` des modules,
 *   - il collecte les signaux pour Le Cerveau.
 *
 * Ajouter un nouveau module = 1 fichier + 1 `register(myModule)`.
 */

import { subscribeAll } from "./bus";
import type { EthanModule, ModuleContext, ModuleId } from "./contracts";
import type { Signal } from "@/brain/types";

const modules = new Map<ModuleId, EthanModule>();

const context: ModuleContext = {
  get<T>(id: ModuleId) {
    return modules.get(id)?.snapshot() as T | undefined;
  },
};

// Route bus → modules (une seule souscription globale).
subscribeAll((event) => {
  modules.forEach((m) => {
    if (m.id === event.source) return; // pas de renvoi à l'expéditeur
    m.onEvent?.(event, context);
  });
});

export function register(mod: EthanModule): void {
  modules.set(mod.id, mod);
}

export function getModule<T = unknown>(id: ModuleId): EthanModule<T> | undefined {
  return modules.get(id) as EthanModule<T> | undefined;
}

export function getContext(): ModuleContext {
  return context;
}

/** Snapshot global — utile pour Le Cerveau et le debug. */
export function snapshotAll(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  modules.forEach((m, id) => (out[id] = m.snapshot()));
  return out;
}

/** Collecte les signaux de tous les modules enregistrés. */
export function collectSignals(): Signal[] {
  const all: Signal[] = [];
  modules.forEach((m) => all.push(...m.getSignals(context)));
  return all;
}