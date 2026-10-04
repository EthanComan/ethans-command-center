import type { CapacitorConfig } from "@capacitor/cli";

/**
 * L'app mobile charge la version web déployée (SSR + fonctions serveur),
 * donc une seule base de code. Mets ETHAN_APP_URL = ton domaine de prod.
 */
const config: CapacitorConfig = {
  appId: "app.ethan.commandcenter",
  appName: "ETHAN",
  webDir: "mobile-shell",
  server: {
    url: process.env.ETHAN_APP_URL ?? "https://ethans-command-center.lovable.app",
    cleartext: false,
  },
  plugins: {
    SplashScreen: { launchShowDuration: 1200, backgroundColor: "#0a0a0a", showSpinner: false },
    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] },
  },
};

export default config;
