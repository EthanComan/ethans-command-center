/** ETHAN — envoi Web Push (compatible runtime edge). */

import { buildPushPayload } from "@block65/webcrypto-web-push";
import { isExpiredPushStatus } from "./push-delivery-policy";

export type PushTarget = { endpoint: string; p256dh: string; auth: string };

export type PushContent = {
  title: string;
  body: string;
  url: string;
  priority?: string;
  tag?: string;
};

/** Renvoie false si l'abonnement est mort (à supprimer) ou si l'envoi échoue. */
export async function deliverPush(target: PushTarget, content: PushContent): Promise<boolean> {
  return (await deliverPushResult(target, content)).sent;
}

export async function deliverPushResult(target: PushTarget, content: PushContent): Promise<{ sent: boolean; expired: boolean }> {
  const vapid = {
    subject: process.env["VAPID_SUBJECT"] ?? "mailto:contact@ethan.app",
    publicKey: process.env["VAPID_PUBLIC_KEY"],
    privateKey: process.env["VAPID_PRIVATE_KEY"],
  };
  if (!vapid.publicKey || !vapid.privateKey) return { sent: false, expired: false };

  try {
    const payload = await buildPushPayload(
      {
        data: {
          title: content.title,
          body: content.body,
          url: content.url,
          priority: content.priority ?? "normale",
          tag: content.tag ?? content.title,
        },
        options: { ttl: 3600, urgency: content.priority === "critique" ? "high" : "normal" },
      },
      {
        endpoint: target.endpoint,
        expirationTime: null,
        keys: { auth: target.auth, p256dh: target.p256dh },
      },
      vapid
    );

    const res = await fetch(target.endpoint, payload as unknown as RequestInit);
    return { sent: res.ok, expired: isExpiredPushStatus(res.status) };
  } catch {
    return { sent: false, expired: false };
  }
}

/** 404/410 = abonnement expiré côté navigateur. */
export async function isGonePush(endpoint: string): Promise<boolean> {
  try {
    const res = await fetch(endpoint, { method: "HEAD" });
    return res.status === 404 || res.status === 410;
  } catch {
    return false;
  }
}
