/**
 * Monte le moteur de notifications côté client.
 * - délivre les notifications système dues (si autorisées)
 * - affiche systématiquement le flux interne via un toast
 */
import { useEffect } from "react";
import { toast } from "sonner";
import { onNotification, startNotificationEngine, stopNotificationEngine } from "@/modules/notifications/native";

export function NotificationEngine() {
  useEffect(() => {
    const off = onNotification((n) => {
      toast(n.title, { description: n.body, duration: n.priority === "critique" ? 12000 : 6000 });
    });
    startNotificationEngine();
    return () => {
      off();
      stopNotificationEngine();
    };
  }, []);
  return null;
}
