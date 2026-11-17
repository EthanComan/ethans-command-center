import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/** Indique avec quel compte on est connecté, et permet d'entrer / sortir. */
export function AccountButton() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setEmail(session?.user.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (email === undefined) return null;
  if (!email) {
    return (
      <Link to="/auth" className="flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-xs text-foreground hover:border-border">
        <LogIn className="h-3.5 w-3.5" /> Se connecter
      </Link>
    );
  }
  return (
    <button
      type="button"
      title={`Connecté : ${email} — se déconnecter`}
      onClick={async () => {
        await supabase.auth.signOut();
        navigate({ to: "/auth" });
      }}
      className="flex max-w-[55vw] items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
    >
      <span className="truncate">{email}</span>
      <LogOut className="h-3.5 w-3.5 shrink-0" />
    </button>
  );
}
