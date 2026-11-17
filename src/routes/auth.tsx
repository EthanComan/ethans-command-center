import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/google-button";
import { authErrorMessage, isManagedOAuthHost } from "@/lib/auth-errors";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Connexion — ETHAN" },
      {
        name: "description",
        content: "Accédez à votre centre de contrôle ETHAN : pilotage business, suivi et conversation.",
      },
      { property: "og:title", content: "Connexion — ETHAN" },
      { property: "og:description", content: "Accédez à votre centre de contrôle ETHAN." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleAvailable = isManagedOAuthHost(window.location.hostname);

  // Déjà connecté (ou retour de Google) : on entre directement.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/ethan" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/ethan" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Lien envoyé : ouvre le mail pour choisir un nouveau mot de passe.");
        setMode("signin");
        return;
      }
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return; // la redirection se fait via onAuthStateChange
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      if (!data.session) toast.success("Vérifie ta boîte mail pour confirmer ton compte.");
    } catch (err) {
      setError(authErrorMessage(err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    if (!googleAvailable) {
      setError(
        "Google n'est pas encore branché sur cette adresse. Connecte-toi avec ton email et ton mot de passe (ou « Mot de passe oublié »).",
      );
      return;
    }
    const { lovable } = await import("@/integrations/lovable");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      setError("Connexion Google impossible. Réessaie ou utilise ton email.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/ethan" });
  }

  const title =
    mode === "signin" ? "Connexion à ton centre de contrôle." : mode === "signup" ? "Crée ton accès." : "Reçois un lien pour choisir un nouveau mot de passe.";

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6">
        <h1 className="text-lg font-semibold tracking-tight">ETHAN</h1>
        <p className="mt-1 text-sm text-muted-foreground">{title}</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                {mode === "signin" && (
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => { setMode("forgot"); setError(null); }}>
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          {error && (
            <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "signin" ? "Se connecter" : mode === "signup" ? "Créer mon accès" : "Envoyer le lien"}
          </Button>
        </form>

        {mode !== "forgot" && <GoogleButton onClick={google} disabled={busy} />}

        <button
          type="button"
          className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground"
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
        >
          {mode === "signin" ? "Pas encore d'accès ? Créer un compte" : "J'ai déjà un accès"}
        </button>
      </div>
    </main>
  );
}
