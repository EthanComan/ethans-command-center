/**
 * Monte le moteur de notifications côté client.
 * - délivre les notifications système dues (si autorisées)
 * - affiche systématiquement le flux interne via un toast
 */
import { useEffect } from "react";
import { toast } from "sonner";
import { onNotification, startNotificationEngine, stopNotificationEngine } from "@/modules/notifications/native";
import { registerServiceWorker, syncRemoteSchedule } from "@/modules/notifications/push";

export function NotificationEngine() {
  useEffect(() => {
    const off = onNotification((n) => {
      toast(n.title, { description: n.body, duration: n.priority === "critique" ? 12000 : 6000 });
    });
    startNotificationEngine();

    // Canal distant : on tient le serveur à jour du plan du jour.
    const sync = () => {
      void syncRemoteSchedule().catch(() => undefined);
    };
    void registerServiceWorker().then(sync);
    const onVisible = () => document.visibilityState === "visible" && sync();
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(sync, 30 * 60_000);

    return () => {
      off();
      stopNotificationEngine();
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
