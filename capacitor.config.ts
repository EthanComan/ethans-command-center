import type { CapacitorConfig } from "@capacitor/cli";

/**
 * L'app mobile charge la version web déployée (SSR + fonctions serveur),
 * donc une seule base de code. Mets ETHAN_APP_URL = ton domaine de prod.
 */
function requiredUrl(): string {
  const u = process.env.ETHAN_APP_URL;
  if (!u) throw new Error("ETHAN_APP_URL manquant (ex. https://ethan.mondomaine.com)");
  return u;
}

const config: CapacitorConfig = {
  appId: "app.ethan.commandcenter",
  appName: "ETHAN",
  webDir: "mobile-shell",
  server: {
    url: requiredUrl(),
    cleartext: false,
  },
  plugins: {
    SplashScreen: { launchShowDuration: 1200, backgroundColor: "#0a0a0a", showSpinner: false },
    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] },
  },
};

export default config;
