# ETHAN — Architecture

ETHAN n'est **pas** une collection d'écrans. C'est un système d'exploitation
personnel, conçu pour accueillir des dizaines de modules pendant des années
**sans reconstruction**.

## Les 4 couches

```
┌─────────────────────────────────────────────┐
│  UI (src/routes, src/components)            │  ← lit les snapshots
├─────────────────────────────────────────────┤
│  Le Cerveau (src/brain)                     │  ← agrège, score, décide
├─────────────────────────────────────────────┤
│  Modules (src/core/modules/*)               │  ← business logic isolée
├─────────────────────────────────────────────┤
│  Core (src/core)                            │  ← bus • registry • store
└─────────────────────────────────────────────┘
```

**Règle d'or :** un module ne dépend jamais d'un autre module. Il dépend
uniquement du core. Toute communication passe par le bus et le contexte.

## Ajouter un module (recette pérenne)

1. Créer `src/core/modules/mon-module.ts` :

```ts
import { defineModule } from "@/core/define-module";
import { createStore } from "@/core/persistence";
import { publish } from "@/core/bus";

interface State { /* ... */ }
const store = createStore<State>("sport", "state", { /* défaut */ });

export const sportModule = defineModule({
  id: "sport",
  snapshot: () => store.read(),
  getSignals: (ctx) => [ /* signaux pour Le Cerveau */ ],
  onEvent: (event, ctx) => { /* réactions au bus */ },
});
```

2. Ajouter une ligne dans `src/core/modules/index.ts` (`ALL_MODULES`).
3. C'est fini. Sidebar, Cerveau, autres modules — tout se branche seul.

## Contrats invariants

Ces interfaces sont **stables**. Elles ne changent pas au fil des modules :

- `EthanModule` (`contracts.ts`) — forme d'un module
- `DomainEvent` + `EventKind` (`bus.ts`) — vocabulaire inter-modules
- `Signal` (`brain/types.ts`) — vocabulaire vers le Cerveau
- `Store<T>` (`persistence.ts`) — vocabulaire vers le stockage

Étendre = ajouter un `EventKind` ou un `SignalKind`. Jamais casser.

## Pourquoi ça tiendra 10 ans

- **Couplage zéro** : `ModuleContext.get(id)` retourne un snapshot ; aucun
  module n'importe un autre module.
- **Bus asynchrone** : Sport peut publier `sport:session_completed` sans
  savoir que Mental et Le Cerveau écoutent.
- **Persistance abstraite** : passer de mémoire → Lovable Cloud → sync
  multi-device = 1 seul appel à `setStoreFactory()`. Les modules ne
  changent pas.
- **Le Cerveau agnostique** : il consomme `collectSignals()`. Chaque
  nouveau module l'enrichit automatiquement.