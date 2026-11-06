import { DefaultChatTransport } from "ai";
import { supabase } from "@/integrations/supabase/client";

export function createChatTransport() {
  return new DefaultChatTransport({
    api: "/api/chat",
    headers: async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("Connecte-toi pour parler à ETHAN.");
      return { Authorization: `Bearer ${data.session.access_token}` };
    },
  });
}