/**
 * ETHAN — Contrat de persistance.
 *
 * Les modules ne parlent JAMAIS directement à une base de données ou à
 * localStorage. Ils demandent un `Store<T>` au core. Aujourd'hui c'est
 * un in-memory ; demain ce sera Lovable Cloud, IndexedDB, ou une
 * synchro multi-device — sans qu'un seul module change de code.
 *
 * C'est la clé de la longévité : les modules restent stables même quand
 * l'infrastructure sous-jacente évolue.
 */

import type { ModuleId } from "./contracts";

export interface Store<T> {
  read(): T;
  write(next: T): void;
  subscribe(fn: (value: T) => void): () => void;
}

/** Implémentation V1 : mémoire du process. */
function createMemoryStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<(v: T) => void>();
  return {
    read: () => value,
    write: (next) => {
      value = next;
      listeners.forEach((fn) => fn(value));
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

/**
 * Fabrique de stores injectable — remplacée en V2 par un backend Cloud
 * sans que les modules le remarquent.
 */
let factory = <T>(_scope: ModuleId, _key: string, initial: T): Store<T> =>
  createMemoryStore(initial);

export function createStore<T>(scope: ModuleId, key: string, initial: T): Store<T> {
  return factory(scope, key, initial);
}

export function setStoreFactory(f: typeof factory): void {
  factory = f;
}