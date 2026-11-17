/** Traduit les erreurs de connexion en français clair. */
export function authErrorMessage(raw: string | undefined | null): string {
  const m = (raw ?? "").toLowerCase();
  if (m.includes("invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (m.includes("email not confirmed")) return "Email pas encore confirmé : ouvre le lien reçu par mail.";
  if (m.includes("user already registered")) return "Un compte existe déjà avec cet email : connecte-toi.";
  if (m.includes("password should be at least")) return "Mot de passe trop court (6 caractères minimum).";
  if (m.includes("rate limit") || m.includes("too many")) return "Trop de tentatives : réessaie dans quelques minutes.";
  if (m.includes("weak") || m.includes("pwned")) return "Mot de passe trop faible ou déjà divulgué : choisis-en un autre.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Connexion internet impossible : vérifie ton réseau.";
  return raw || "Connexion impossible.";
}

/** Google géré n'est disponible que sur les adresses hébergées par Lovable. */
export function isManagedOAuthHost(hostname: string): boolean {
  return ["lovable.app", "lovableproject.com", "lovable.dev"].some(
    (z) => hostname === z || hostname.endsWith("." + z),
  );
}
