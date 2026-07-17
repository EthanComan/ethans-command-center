# Plan — Module Habitudes

## Philosophie

Le module Habitudes n'est pas une checklist. C'est le moteur qui transforme les objectifs de long terme et l'ADN en comportements répétés, mesurés et arbitrés automatiquement par ETHAN. Chaque habitude porte un sens, une fréquence, un contexte temporel et un poids dans la décision quotidienne.

## 1. Modèle de données

Nouveau fichier `src/modules/habitudes/types.ts` :

```text
HabitDomain  = business | sante | sport | spiritualite | lecture | developpement_personnel | relations | finances | renaitre
HabitCategory = fondamentale | performance | mission | personnalisee
HabitFrequency = { kind: "daily" } | { kind: "weekly"; days: number[] } | { kind: "monthly"; dates: number[] }
HabitPriority  = critique | haute | moyenne | basse

Habit {
  id: string
  title: string                 // verbe d'action : "Lire 30 min", "Appeler 5 prospects"
  why: string                   // raison d'existre, liée à l'identité ou à un objectif
  objectiveId?: string           // lien vers la chaîne Objectifs (optionnel)
  domain: HabitDomain
  category: HabitCategory
  frequency: HabitFrequency
  recommendedTime?: string       // "07:00" ou "matin", "soir"
  priority: HabitPriority
  estimatedMinutes: number
  createdAt: string             // ISO date
}

HabitLog {
  habitId: string
  date: string                  // ISO date
  status: "done" | "missed" | "partial" | "excused"
  note?: string
  doneAt?: string
}

HabitSnapshot {
  habits: Habit[]
  logs: HabitLog[]
  today: HabitForToday[]
  streaks: Record<habitId, number>
  consistency: Record<habitId, ConsistencyProfile>
}

ConsistencyProfile {
  last7Days: number             // 0-100
  last30Days: number
  last90Days: number
  last365Days: number
  currentStreak: number
  longestStreak: number
  weeklyTarget: number
  weeklyDone: number
}
```

## 2. Stockage et API (abstraction persistence)

Nouveau fichier `src/modules/habitudes/data.ts` :

- Utiliser `createStore(scope: "habitudes", key: "habits", initial)` et `createStore(scope: "habitudes", key: "logs", initial)` depuis `src/core/persistence.ts`.
- Fournir un seed de 8-12 habitudes cohérentes avec la mission et les objectifs existants (ex: prière du matin, deep work 90 min, appels de prospection, séance de sport, lecture, action Renaître).
- API pure : `readAllHabits()`, `readTodayHabits()`, `readLogsFor(habitId, since)`, `markDone(habitId)`, `markMissed(habitId)`, `addHabit(habit)`, `updateHabit(id, patch)`, `deleteHabit(id)`, `computeStreak(habitId)`, `computeConsistency(habitId)`.
- Les mutations publient des événements sur le bus (`habitudes:completed`, `habitudes:streak_at_risk`, `habitudes:updated`).

## 3. Module OS

Remplacer le stub actuel dans `src/core/modules/index.ts` par un vrai module `habitudesModule` dans un fichier dédié `src/core/modules/habitudes.ts` (importé puis enregistré via `register()` dans `bootstrap.ts`).

```text
id: "habitudes"
snapshot(): HabitSnapshot
getSignals(ctx): Signal[]
  - "streak_risk" pour chaque habitude du jour non faite avec une série > 0
  - "goal_gap" si une habitude liée à un objectif est manquée plusieurs jours
  - "recovery_needed" si habitude sommeil/récupération manquée
onEvent(e, ctx): réagit à "objectifs:progress_updated" pour réévaluer le lien
```

## 4. Route UI — `/habitudes`

Remplacer `src/routes/habitudes.tsx` (actuellement ComingSoon) par une page complète :

- En-tête : titre "Habitudes", nombre d'habitudes actives, taux de constance global 7j.
- Vue "Aujourd'hui" : liste des habitudes à réaliser aujourd'hui, triées par priorité et heure recommandée. Boutons "Fait" / "Manqué" / "Partiel".
- Chaque carte affiche : titre, badge domaine, badge catégorie, priorité, why, heure recommandée, série en cours, et chaine de sens (objectif parent si lié).
- Section "Constance" : mini heatmap des 90 derniers jours par habitude (ou grille hebdomadaire) avec streaks et scores 7j/30j/90j/1an.
- Section "Catalogue" : toutes les habitudes classées par catégorie (Fondamentale, Performance, Mission, Personnalisée) avec possibilité d'éditer/ajouter.
- Formulaire d'ajout minimal : titre, why, domaine, catégorie, fréquence, priorité, heure recommandée, durée estimée, lien objectif (optionnel).

## 5. Intégrations transversales

### 5.1 Centre de Commandement (`src/routes/index.tsx`)
- Nouveau contributeur NBA dans `src/brain/nba.ts` : "habitudes du jour non faites" qui propose l'habitude critique la plus importante en fonction de la série, la priorité et l'heure.
- Ajouter un mini-widget "Habitudes du jour" sur le Dashboard avec les 3 habitudes prioritaires et leur statut.

### 5.2 Planning (`src/modules/planning/data.ts` et `src/routes/planning.tsx`)
- Injecter automatiquement les habitudes du jour comme blocs de planning (kind: "habit") si elles ont une heure recommandée.
- Les blocs ont un `source: "habitudes"`, un lien vers l'objectif, et le badge Renaître si le domaine est `renaitre`.

### 5.3 Le Cerveau (`src/brain/signals.ts` et `src/brain/engine.ts`)
- La collecte de signaux inclut les habitudes actives non complétées.
- Le scoring booste les habitudes "fondamentales" et "mission" (Renaître) et les habitudes avec une série longue à protéger.
- Nouveau `compose` pour le signal `habitudes:completed` (prévu) : incrémenter le système de récompense.

### 5.4 Alignement / Progression
- Le module Progression (`src/modules/progression/data.ts`) récupère les scores de constance pour l'axe "Constancy" et l'axe lié au domaine (ex: sport → Health, prospection → Wealth/Impact).
- Le module Alignement (`src/brain/alignment.ts`) détecte une dérive si une habitude fondamentale est manquée > 2 jours dans la semaine.

## 6. Mémoire

Mettre à jour `mem://index.md` si le module Habitudes ajoute un principe durable ou modifie la structure du "Score d'homme". Sinon, pas de changement mémoire requis (les 7 principes existants couvrent déjà Mémoire, Sens, Effet domino, Progression, Alignement, Exécution, philosophie racine).

## 7. Fichiers créés / modifiés

Créés :
- `src/modules/habitudes/types.ts`
- `src/modules/habitudes/data.ts`
- `src/core/modules/habitudes.ts`
- `src/routes/habitudes.tsx` (remplace la version ComingSoon)

Modifiés :
- `src/core/modules/index.ts` : exporter le nouveau module
- `src/core/bootstrap.ts` : enregistrer le module
- `src/brain/signals.ts` : collecter les signaux habitudes
- `src/brain/nba.ts` : ajouter un contributeur Habitudes
- `src/routes/index.tsx` : widget Habitudes du jour
- `src/modules/planning/data.ts` : injecter les habitudes en blocs
- `src/modules/planning/types.ts` : ajouter kind "habit"
- `src/modules/progression/data.ts` : lire la constance pour les axes
- `src/config/modules.ts` : passer `habitudes` de `soon` à `live`

## 8. Livrables visibles

1. Page `/habitudes` fonctionnelle avec catalogue, suivi et constance.
2. Centre de Commandement affichant les habitudes du jour et proposant la bonne habitude au bon moment.
3. Planning Intelligent intégrant les habitudes comme blocs structurés.
4. Cerveau utilisant les habitudes pour prioriser l'action principale.
5. Progression de l'homme enrichie par les scores de constance.

## 9. Hors périmètre (V2)

- IA générative pour suggérer de nouvelles habitudes (gardé pour plus tard).
- Rappels push / notifications natives (module Notifications pas encore construit).
- Historique illimité sur plusieurs années (l'architecture le supporte, mais la visualisation 1an+ sera itérée).
- Synchro multi-device (dépend de Lovable Cloud, pas activé pour ce module V1).

## Prochaine étape

Validation de ce plan, puis implémentation fichier par fichier en commençant par le modèle de données et le stockage.