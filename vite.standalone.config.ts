/**
 * Configuration Vite standard, sans aucun paquet Lovable.
 * Utilisée hors Lovable : `npm run dev:standalone` / `npm run build:standalone`.
 * Cible de déploiement : NITRO_PRESET (vercel, cloudflare-module, node-server…), défaut vercel.
 */
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  server: { port: 8080 },
  resolve: { dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-query"] },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({ server: { entry: "server" } }),
    nitro({ preset: process.env.NITRO_PRESET ?? "vercel" }),
    viteReact(),
  ],
});
