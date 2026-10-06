# ETHAN Command Center

Frontend (React / TanStack Start) → fonctions serveur → Supabase → Gemini → Web Push.
Lovable n'est qu'un outil de développement éventuel : l'app tourne sans lui.

## 1. Lancer en local (sans Lovable)
```bash
npm install
cp .env.example .env            # puis remplis les valeurs
npm run dev:standalone          # http://localhost:8080
npm run build:standalone        # build Vercel (.vercel/output)
```
`vite.standalone.config.ts` n'utilise aucun paquet Lovable. `vite.config.ts` ne sert qu'à l'éditeur Lovable.

## 2. Variables d'environnement
Voir `.env.example`. Règle : seules les variables `VITE_*` vont au navigateur.

| Variable | Où | Rôle |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` | client | connexion Supabase (publiques) |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | serveur | fonctions serveur |
| `SUPABASE_SERVICE_ROLE_KEY` | serveur | envoi push programmé (cron) |
| `GEMINI_API_KEY` | serveur | les deux IA (Directeur + Builder) |
| `GEMINI_MODEL` | serveur | optionnel, défaut `gemini-2.5-flash` |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | serveur | notifications push |
| `ETHAN_AI_FALLBACK` | serveur | optionnel : `lovable` = repli passerelle Lovable si pas de clé Gemini (jamais par défaut) |
| `ETHAN_APP_URL` | build mobile | domaine chargé par l'app iOS/Android |

Générer des clés VAPID : `npx web-push generate-vapid-keys`.

## 3. Supabase
1. Crée un projet sur supabase.com, récupère URL + clé publishable + service role.
2. Applique les migrations : `supabase db push` (dossiers `supabase/migrations` puis `drizzle/migrations`), ou colle les fichiers SQL dans l'éditeur SQL.
3. Auth → Providers : active Email ; pour Google, crée un client OAuth Google Cloud et colle ID/secret dans Supabase. Ajoute ton domaine dans *Redirect URLs*.
4. Cron des notifications (aucun secret dans le code ni les migrations) : extensions `pg_cron` + `pg_net`, puis dans l'éditeur SQL :
```sql
insert into public.ethan_private_config(key,value) values
 ('cron_token', encode(extensions.gen_random_bytes(32),'hex')),
 ('app_url','https://TON-DOMAINE')
on conflict (key) do update set value = excluded.value;
select cron.schedule('ethan-push-worker','* * * * *', $$
  select net.http_post(
    url := (select value from public.ethan_private_config where key='app_url') || '/api/public/cron/push',
    headers := jsonb_build_object('Content-Type','application/json','x-ethan-cron-secret',
      (select value from public.ethan_private_config where key='cron_token')),
    body := '{}'::jsonb, timeout_milliseconds := 20000) $$);
```
Le serveur valide le jeton via la fonction `ethan_verify_cron_token` (table privée, accessible au seul rôle service). Changer de domaine = mettre à jour la ligne `app_url`.
Toutes les tables ont la RLS activée, limitée à `auth.uid()`.

## 4. Gemini
Clé sur https://aistudio.google.com/apikey → `GEMINI_API_KEY`. Les appels passent uniquement par `/api/chat` côté serveur ; la clé n'est jamais envoyée au navigateur. Historiques séparés en base (`ethan_messages.channel` = `directeur` | `builder`).

## 5. Déployer sur Vercel
1. Pousse le code sur GitHub, importe-le dans Vercel (Framework : *Other*, build `bun run build`).
2. Build command : `npm run build:standalone` (preset Vercel par défaut, `NITRO_PRESET` pour une autre cible).
3. Ajoute toutes les variables de la section 2 dans Vercel (Production).
4. Mets à jour l'URL du cron (section 3) et les Redirect URLs Supabase avec ton domaine Vercel.

## 6. Application iPhone / Android (Capacitor)
L'app native charge ta version web déployée (`capacitor.config.ts`, `server.url`).
```bash
ETHAN_APP_URL=https://ton-domaine bunx cap sync
bunx cap open ios      # Xcode (Mac requis)
bunx cap open android  # Android Studio
```
- Bundle ID : `app.ethan.commandcenter` (modifiable dans `capacitor.config.ts`).
- Icône / écran de lancement : `bunx @capacitor/assets generate` à partir de `assets/icon.png` (1024×1024) et `assets/splash.png` (2732×2732).

### Publication App Store
1. Compte Apple Developer (99 $/an). Dans developer.apple.com : crée l'App ID `app.ethan.commandcenter` avec la capacité *Push Notifications*, et une clé APNs (.p8).
2. Xcode → target App → *Signing & Capabilities* : ton équipe, + *Push Notifications*, + *Background Modes › Remote notifications* (déjà déclaré dans Info.plist).
3. App Store Connect : crée l'app avec le même Bundle ID, remplis fiche, captures, politique de confidentialité.
4. Xcode → *Product › Archive* → *Distribute App* → App Store Connect → TestFlight puis soumission.

## Notifications
- **PWA (fonctionne aujourd'hui)** : sur iPhone, ouvre le site dans Safari → Partager → *Sur l'écran d'accueil*, ouvre ETHAN depuis l'icône, page Notifications → activer. Reçues app fermée (iOS 16.4+).
- **App native** : nécessite la clé APNs (.p8) côté serveur — prochaine étape.
