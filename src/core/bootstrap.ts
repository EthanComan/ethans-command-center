/**
 * ETHAN — Bootstrap du système d'exploitation.
 *
 * Charge tous les modules dans le registre au démarrage de l'app.
 * Import unique depuis `src/routes/__root.tsx` (ou équivalent).
 */

import { register } from "./registry";
import { publish } from "./bus";
import { ALL_MODULES, crmModule } from "./modules";

let booted = false;

export function bootEthan(): void {
  if (booted) return;
  booted = true;

  ALL_MODULES.forEach(register);

  // Démonstration du câblage : à l'ouverture, le CRM signale un
  // follow-up dû → le Planning crée automatiquement un rappel.
  const [deal] = crmModule.snapshot();
  if (deal) {
    publish({
      kind: "crm:followup_due",
      source: "crm",
      at: Date.now(),
      payload: { deal: deal.name, stage: deal.stage },
    });
  }
}