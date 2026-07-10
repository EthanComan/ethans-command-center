/**
 * ETHAN — Helper de définition de module.
 *
 * Sucre syntaxique au-dessus du contrat `EthanModule`. Deux bénéfices :
 *   1. Uniformité : chaque module suit la même forme, quel que soit
 *      l'auteur et l'époque.
 *   2. Inférence : le type du snapshot est déduit du `snapshot()` fourni,
 *      pas besoin de le répéter en paramètre générique.
 *
 * Usage :
 *   export const monModule = defineModule({
 *     id: "sport",
 *     snapshot: () => state,
 *     getSignals: (ctx) => [...],
 *     onEvent: (e, ctx) => { ... },
 *   });
 */

import type { EthanModule } from "./contracts";

export function defineModule<T>(mod: EthanModule<T>): EthanModule<T> {
  return mod;
}