CREATE TABLE public.ethan_identity_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  kind text NOT NULL DEFAULT 'historique',
  title text NOT NULL,
  body text,
  lesson text,
  occurred_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_identity_entries TO authenticated;
GRANT ALL ON public.ethan_identity_entries TO service_role;
ALTER TABLE public.ethan_identity_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own identity entries" ON public.ethan_identity_entries
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ethan_identity_entries_updated_at BEFORE UPDATE ON public.ethan_identity_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ethan_archetype_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  trait text NOT NULL,
  score integer NOT NULL DEFAULT 50,
  note text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, trait)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_archetype_scores TO authenticated;
GRANT ALL ON public.ethan_archetype_scores TO service_role;
ALTER TABLE public.ethan_archetype_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own archetype scores" ON public.ethan_archetype_scores
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ethan_archetype_scores_updated_at BEFORE UPDATE ON public.ethan_archetype_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();