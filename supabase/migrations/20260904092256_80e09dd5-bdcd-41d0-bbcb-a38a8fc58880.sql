CREATE TABLE public.ethan_push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  timezone text NOT NULL DEFAULT 'Europe/Paris',
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_push_subscriptions TO authenticated;
GRANT ALL ON public.ethan_push_subscriptions TO service_role;
ALTER TABLE public.ethan_push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own push subscriptions" ON public.ethan_push_subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ethan_scheduled_push (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  key text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  url text NOT NULL DEFAULT '/',
  priority text NOT NULL DEFAULT 'normale',
  send_at timestamptz NOT NULL,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);
CREATE INDEX ethan_scheduled_push_due_idx ON public.ethan_scheduled_push (send_at) WHERE sent_at IS NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_scheduled_push TO authenticated;
GRANT ALL ON public.ethan_scheduled_push TO service_role;
ALTER TABLE public.ethan_scheduled_push ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own scheduled push" ON public.ethan_scheduled_push FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);