import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, BellRing, Moon, Smartphone, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import {
  readPrefs,
  writePrefs,
  upcomingToday,
  readDelivered,
  markAllRead,
  clearDelivered,
} from "@/modules/notifications/data";
import {
  isInstalled,
  nativeSupported,
  permissionState,
  requestNativePermission,
  sendTestNotification,
  type PermissionState,
} from "@/modules/notifications/native";
import {
  KIND_LABEL,
  type DeliveredNotification,
  type EthanNotification,
  type NotificationKind,
  type NotificationPrefs,
  type NotificationPriority,
} from "@/modules/notifications/types";
import { phaseDefinition } from "@/modules/habitudes/data";
import {
  disableRemotePush,
  enableRemotePush,
  pushSupported,
  remoteState,
  syncRemoteSchedule,
  testRemotePush,
  type RemoteState,
} from "@/modules/notifications/push";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — ETHAN" },
      {
        name: "description",
        content:
          "Rappels intelligents d'habitudes délivrés sur ton téléphone, ton ordinateur et ta montre, même application fermée.",
      },
      { property: "og:title", content: "Notifications — ETHAN" },
      {
        property: "og:description",
        content: "ETHAN t'accompagne hors de l'application avec des rappels natifs pilotés par l'impact.",
      },
    ],
  }),
  component: NotificationsPage,
});

const PRIORITY_TONE: Record<NotificationPriority, string> = {
  critique: "text-red-300 border-red-400/30 bg-red-500/[0.08]",
  haute: "text-amber-300 border-amber-400/30 bg-amber-500/[0.08]",
  normale: "text-muted-foreground border-border bg-elevated",
  silencieuse: "text-muted-foreground border-border/60 bg-transparent",
};

function hhmm(ts: number) {
  return new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function NotificationsPage() {
  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>(readPrefs());
  const [permission, setPermission] = useState<PermissionState>("default");
  const [installed, setInstalled] = useState(false);
  const [upcoming, setUpcoming] = useState<EthanNotification[]>([]);
  const [delivered, setDelivered] = useState<DeliveredNotification[]>([]);

  const refresh = () => {
    setPrefs(readPrefs());
    setUpcoming(upcomingToday());
    setDelivered(readDelivered());
    setPermission(permissionState());
    setInstalled(isInstalled());
  };

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  const update = (patch: Partial<NotificationPrefs>) => {
    setPrefs(writePrefs(patch));
    setUpcoming(upcomingToday());
  };

  const enableNative = async () => {
    const state = await requestNativePermission();
    setPermission(state);
    if (state === "granted") {
      update({ nativeEnabled: true });
      sendTestNotification();
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gold">
            <Bell className="h-3.5 w-3.5" /> Accompagnement hors application
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Notifications</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            ETHAN ne t'attend pas dans un onglet. Il t'atteint au bon moment, sur le bon appareil,
            avec le bon niveau d'urgence — et se tait le reste du temps.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-elevated px-4 py-3 text-right">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Phase</p>
          <p className="mt-1 text-sm font-medium text-gold">{mounted ? phaseDefinition().label : "—"}</p>
        </div>
      </header>

      {/* Connexion au système */}
      <section className="mt-8 rounded-2xl border border-gold/30 bg-gold/[0.04] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Smartphone className="h-4 w-4 text-gold" /> Notifications système
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] text-muted-foreground">
              Une fois autorisées, les alertes s'affichent dans le centre de notifications de ton
              téléphone ou de ton ordinateur — et sont relayées automatiquement vers ta montre par
              le système. Installe ETHAN sur ton écran d'accueil pour une délivrance fiable sur mobile.
            </p>
            {mounted && (
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded border border-border bg-background/40 px-2 py-1 text-muted-foreground">
                  Autorisation : {permission === "granted" ? "accordée" : permission === "denied" ? "refusée" : permission === "unsupported" ? "non supportée" : "à demander"}
                </span>
                <span className="rounded border border-border bg-background/40 px-2 py-1 text-muted-foreground">
                  App installée : {installed ? "oui" : "non"}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={enableNative}
              disabled={!mounted || !nativeSupported() || permission === "denied"}
              className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <BellRing className="h-4 w-4" />
              {permission === "granted" ? "Reconnecter" : "Activer sur cet appareil"}
            </button>
            <button
              onClick={sendTestNotification}
              disabled={permission !== "granted"}
              className="rounded-md border border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-40"
            >
              Envoyer un test
            </button>
          </div>
        </div>
        {mounted && permission === "denied" && (
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/[0.06] p-3 text-[12px] text-red-200">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Les notifications ont été bloquées pour ce site. Réautorise-les dans les réglages du
            navigateur, puis reviens sur cette page.
          </p>
        )}
      </section>

      {/* Canal distant : app fermée */}
      <RemoteChannel />

      {/* Réglages */}
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-elevated p-5">
          <h2 className="text-sm font-semibold">Règles de délivrance</h2>
          <div className="mt-4 space-y-3 text-[13px]">
            <Toggle label="Module actif" checked={prefs.enabled} onChange={(v) => update({ enabled: v })} />
            <Toggle label="Notifications système" checked={prefs.nativeEnabled} onChange={(v) => update({ nativeEnabled: v })} />
            <Toggle
              label="Les non négociables passent en heures silencieuses"
              checked={prefs.bypassQuietForCritical}
              onChange={(v) => update({ bypassQuietForCritical: v })}
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Priorité minimale en natif</span>
              <select
                value={prefs.minNativePriority}
                onChange={(e) => update({ minNativePriority: e.target.value as NotificationPriority })}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-gold"
              >
                <option value="silencieuse">Toutes</option>
                <option value="normale">Normale et plus</option>
                <option value="haute">Haute et plus</option>
                <option value="critique">Critique uniquement</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-elevated p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Moon className="h-4 w-4 text-muted-foreground" /> Heures silencieuses & rituels
          </h2>
          <div className="mt-4 space-y-3 text-[13px]">
            <Toggle
              label="Heures silencieuses"
              checked={prefs.quietHours.enabled}
              onChange={(v) => update({ quietHours: { ...prefs.quietHours, enabled: v } })}
            />
            <div className="grid grid-cols-2 gap-3">
              <TimeField
                label="De"
                value={prefs.quietHours.from}
                onChange={(v) => update({ quietHours: { ...prefs.quietHours, from: v } })}
              />
              <TimeField
                label="À"
                value={prefs.quietHours.to}
                onChange={(v) => update({ quietHours: { ...prefs.quietHours, to: v } })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TimeField label="Brief du matin" value={prefs.dailyBriefingAt} onChange={(v) => update({ dailyBriefingAt: v })} />
              <TimeField label="Revue du soir" value={prefs.eveningReviewAt} onChange={(v) => update({ eveningReviewAt: v })} />
            </div>
          </div>
        </div>
      </section>

      {/* Types */}
      <section className="mt-4 rounded-2xl border border-border bg-elevated p-5">
        <h2 className="text-sm font-semibold">Types de rappels</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(Object.keys(KIND_LABEL) as NotificationKind[]).map((k) => (
            <Toggle
              key={k}
              label={KIND_LABEL[k]}
              checked={prefs.kinds[k]}
              onChange={(v) => update({ kinds: { ...prefs.kinds, [k]: v } })}
            />
          ))}
        </div>
      </section>

      {/* Plan de la journée */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Plan de la journée
        </h2>
        {!mounted ? (
          <div className="rounded-2xl border border-border bg-elevated p-6 text-sm text-muted-foreground">Calcul du plan...</div>
        ) : upcoming.length === 0 ? (
          <p className="rounded-2xl border border-border bg-elevated p-6 text-sm text-muted-foreground">
            Plus aucun rappel prévu aujourd'hui.
          </p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-elevated px-4 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs tabular-nums text-gold">{hhmm(n.at)}</span>
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${PRIORITY_TONE[n.priority]}`}>
                      {n.priority}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{KIND_LABEL[n.kind]}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{n.title}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{n.body}</p>
                </div>
                <Link to={n.to} className="shrink-0 text-[11px] text-muted-foreground hover:text-gold">
                  Ouvrir
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Historique */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Délivrées</h2>
          <div className="flex gap-2">
            <button
              onClick={() => { markAllRead(); refresh(); }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Tout marquer lu
            </button>
            <button
              onClick={() => { clearDelivered(); refresh(); }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-red-400/40 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" /> Vider
            </button>
          </div>
        </div>
        {!mounted || delivered.length === 0 ? (
          <p className="rounded-2xl border border-border bg-elevated p-6 text-sm text-muted-foreground">
            Aucune notification délivrée pour l'instant.
          </p>
        ) : (
          <div className="space-y-2">
            {delivered.map((n) => (
              <div key={n.id} className="rounded-xl border border-border bg-elevated px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="tabular-nums">{hhmm(n.deliveredAt)}</span>
                  <span>·</span>
                  <span>{KIND_LABEL[n.kind]}</span>
                </div>
                <p className="mt-1 text-sm">{n.title}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
          checked ? "border-gold/50 bg-gold/[0.25]" : "border-border bg-background"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${
            checked ? "left-[1.15rem] bg-gold" : "left-0.5 bg-muted-foreground"
          }`}
        />
      </span>
    </button>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-gold"
      />
    </div>
  );
}
