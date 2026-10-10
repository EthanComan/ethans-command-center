# ETHAN — Guide d'indépendance (sans Lovable)

À l'exécution, le code ne dépend plus de Lovable : si `GEMINI_API_KEY` est définie, l'IA passe directement par Google. Google Sign-In passe directement par la base hors des domaines Lovable.

## 1. Base de données (Supabase)
1. Crée un projet sur https://supabase.com.
2. `npx supabase link --project-ref <ton-ref>` puis `npx supabase db push` (applique `supabase/migrations/`).
3. Dans `.env`, remplace : `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, et ajoute `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement).
4. Auth → Providers : active Email et Google (identifiants Google Cloud OAuth). URL de redirection = l'adresse de ton site.
5. Données existantes : le dossier `data-export/` contient chaque table en JSON. Après ta première connexion, remplace l'ancien `user_id` par ton nouvel identifiant, puis importe (Table Editor → Import, ou un script).

## 2. IA (Directeur commercial + Builder)
- Clé gratuite : https://aistudio.google.com → Get API key.
- Variable serveur : `GEMINI_API_KEY` (optionnel : `GEMINI_MODEL`, par défaut `gemini-2.5-flash`).
- Ne définis PAS `ETHAN_AI_FALLBACK`.

## 3. Hébergement (Vercel)
1. Pousse le dossier sur GitHub, importe-le dans Vercel.
2. Build : `npm run build:standalone`.
3. Ajoute toutes les variables de `.env.example` dans Vercel → Settings → Environment Variables.

## 4. Notifications (même app fermée)
1. `npx web-push generate-vapid-keys` → `VAPID_PUBLIC_KEY`, `VITE_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` dans Vercel.
2. Dans le SQL Editor de ta nouvelle base :
```sql
insert into public.ethan_private_config(key, value) values
  ('app_url', 'https://TON-SITE.vercel.app'),
  ('cron_token', encode(gen_random_bytes(32), 'hex'))
on conflict (key) do update set value = excluded.value;
```
3. Vérifie que les extensions `pg_cron` et `pg_net` sont activées ; le job `ethan-push-worker` est créé par les migrations.

## 5. Mobile (Capacitor)
`ETHAN_APP_URL=https://TON-SITE.vercel.app npx cap sync`, puis ouvre `ios/` dans Xcode et `android/` dans Android Studio.

## 6. Nettoyage facultatif
Les paquets `@lovable.dev/*` ne servent qu'à l'aperçu Lovable. Avec `vite.standalone.config.ts`, ils ne sont pas utilisés ; tu peux les retirer de `package.json` ainsi que `src/integrations/lovable/`.
