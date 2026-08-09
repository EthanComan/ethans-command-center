CREATE TABLE public.ethan_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_messages TO authenticated;
GRANT ALL ON public.ethan_messages TO service_role;
ALTER TABLE public.ethan_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own messages" ON public.ethan_messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ethan_messages_user_created_idx ON public.ethan_messages (user_id, created_at);

CREATE TABLE public.ethan_tracked_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  kind TEXT NOT NULL DEFAULT 'dossier',
  title TEXT NOT NULL,
  context TEXT,
  status TEXT NOT NULL DEFAULT 'actif',
  missing TEXT,
  next_action TEXT,
  why TEXT,
  attention TEXT NOT NULL DEFAULT 'important' CHECK (attention IN ('urgent','important','opportunite','information')),
  value_eur NUMERIC,
  due_at TIMESTAMPTZ,
  snooze_until TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_tracked_items TO authenticated;
GRANT ALL ON public.ethan_tracked_items TO service_role;
ALTER TABLE public.ethan_tracked_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own tracked items" ON public.ethan_tracked_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ethan_tracked_items_user_idx ON public.ethan_tracked_items (user_id, status, last_activity_at);

CREATE TABLE public.ethan_item_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  item_id UUID NOT NULL REFERENCES public.ethan_tracked_items(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'note',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_item_events TO authenticated;
GRANT ALL ON public.ethan_item_events TO service_role;
ALTER TABLE public.ethan_item_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own item events" ON public.ethan_item_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ethan_item_events_item_idx ON public.ethan_item_events (item_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_ethan_tracked_items_updated_at BEFORE UPDATE ON public.ethan_tracked_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();