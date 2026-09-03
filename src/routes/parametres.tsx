import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings, BellRing, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/parametres")({
  head: () => ({
    meta: [
      { title: "Paramètres — ETHAN" },
      { name: "description", content: "Preferences du systeme ETHAN : notifications natives, intensite du coaching, phase de vie." },
      { property: "og:title", content: "Paramètres — ETHAN" },
      { property: "og:description", content: "Configurer le comportement du systeme ETHAN." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ParametresPage,
});

const STORAGE_KEY = "ethan.settings";

interface Settings {
  intensity: "cadrage" | "direct" | "lucious";
  phase: "lancement" | "croisiere" | "recuperation" | "vacances";
  briefHour: string;
}

const DEFAULTS: Settings = { intensity: "direct", phase: "lancement", briefHour: "06:30" };

function ParametresPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [perm, setPerm] = useState<string>("default");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
    if (typeof Notification !== "undefined") setPerm(Notification.permission);
  }, []);

  function update(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }

  async function askPermission() {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === "granted") new Notification("ETHAN", { body: "Notifications natives activées." });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Paramètres</p>
      <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight">
        <Settings className="h-6 w-6 text-gold" /> Comportement du système
      </h1>

      <section className="mt-6 rounded-2xl border border-border bg-elevated p-6">
        <h2 className="text-sm font-medium">Intensité du coaching</h2>
        <p className="mt-1 text-xs text-muted-foreground">Définit le ton d'ETHAN dans les verdicts et interventions.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {([
            ["cadrage", "Cadrage", "Factuel, sans confrontation"],
            ["direct", "Direct", "Verdicts francs, ordres clairs"],
            ["lucious", "Lucious", "Confrontation maximale"],
          ] as const).map(([v, label, desc]) => (
            <button
              key={v}
              onClick={() => update({ intensity: v })}
              className={`rounded-xl border p-3 text-left text-sm transition ${settings.intensity === v ? "border-gold/60 bg-gold/[0.08]" : "border-border hover:border-gold/30"}`}
            >
              <span className="font-medium">{label}</span>
              <span className="mt-1 block text-[11px] text-muted-foreground">{desc}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-elevated p-6">
        <h2 className="text-sm font-medium">Phase de vie</h2>
        <p className="mt-1 text-xs text-muted-foreground">Active ou suspend automatiquement certaines habitudes.</p>
        <select
          value={settings.phase}
          onChange={(e) => update({ phase: e.target.value as Settings["phase"] })}
          className="mt-4 rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="lancement">Lancement</option>
          <option value="croisiere">Croisière</option>
          <option value="recuperation">Récupération</option>
          <option value="vacances">Vacances</option>
        </select>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-elevated p-6">
        <h2 className="flex items-center gap-2 text-sm font-medium"><BellRing className="h-4 w-4 text-gold" /> Notifications natives</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Statut de l'autorisation : <span className="text-foreground">{perm}</span>
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-sm text-muted-foreground">
            Brief du matin
            <input
              type="time"
              value={settings.briefHour}
              onChange={(e) => update({ briefHour: e.target.value })}
              className="ml-3 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
            />
          </label>
          {perm !== "granted" && (
            <button onClick={askPermission} className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-gold-foreground">
              Autoriser les notifications
            </button>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-elevated p-6">
        <h2 className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-gold" /> Données</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Les préférences sont stockées sur cet appareil. Les conversations et le suivi ETHAN
          restent dans ton espace sécurisé.
        </p>
      </section>
    </div>
  );
}
