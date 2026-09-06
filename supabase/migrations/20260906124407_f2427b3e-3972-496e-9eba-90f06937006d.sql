-- CONTACTS
CREATE TABLE public.ethan_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  company text,
  role_title text,
  contact_type text NOT NULL DEFAULT 'prospect',
  phone text,
  email text,
  linkedin text,
  source text,
  notes text,
  last_contact_at timestamptz,
  next_action text,
  follow_up_on date,
  status text NOT NULL DEFAULT 'actif',
  priority text NOT NULL DEFAULT 'normale',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_contacts TO authenticated;
GRANT ALL ON public.ethan_contacts TO service_role;
ALTER TABLE public.ethan_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own contacts" ON public.ethan_contacts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ethan_contacts_updated_at BEFORE UPDATE ON public.ethan_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX ethan_contacts_user_idx ON public.ethan_contacts(user_id);

-- DOSSIERS
CREATE TABLE public.ethan_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  contact_id uuid REFERENCES public.ethan_contacts(id) ON DELETE SET NULL,
  client_name text,
  operation_type text,
  location text,
  budget_eur numeric,
  need text,
  program text,
  developer text,
  stakeholders text,
  status text NOT NULL DEFAULT 'actif',
  stage text NOT NULL DEFAULT 'nouveau',
  commission_eur numeric,
  probability integer NOT NULL DEFAULT 50,
  notes text,
  last_action text,
  next_action text,
  due_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_deals TO authenticated;
GRANT ALL ON public.ethan_deals TO service_role;
ALTER TABLE public.ethan_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own deals" ON public.ethan_deals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ethan_deals_updated_at BEFORE UPDATE ON public.ethan_deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX ethan_deals_user_idx ON public.ethan_deals(user_id);

-- HISTORIQUE
CREATE TABLE public.ethan_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  contact_id uuid REFERENCES public.ethan_contacts(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES public.ethan_deals(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'note',
  content text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_activities TO authenticated;
GRANT ALL ON public.ethan_activities TO service_role;
ALTER TABLE public.ethan_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own activities" ON public.ethan_activities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ethan_activities_user_idx ON public.ethan_activities(user_id);

-- RENDEZ-VOUS
CREATE TABLE public.ethan_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  duration_min integer NOT NULL DEFAULT 60,
  location text,
  kind text NOT NULL DEFAULT 'rdv',
  contact_id uuid REFERENCES public.ethan_contacts(id) ON DELETE SET NULL,
  deal_id uuid REFERENCES public.ethan_deals(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_appointments TO authenticated;
GRANT ALL ON public.ethan_appointments TO service_role;
ALTER TABLE public.ethan_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own appointments" ON public.ethan_appointments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ethan_appointments_updated_at BEFORE UPDATE ON public.ethan_appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX ethan_appointments_user_idx ON public.ethan_appointments(user_id);

-- TACHES
CREATE TABLE public.ethan_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  detail text,
  due_on date,
  priority text NOT NULL DEFAULT 'normale',
  domain text NOT NULL DEFAULT 'business',
  status text NOT NULL DEFAULT 'a_faire',
  contact_id uuid REFERENCES public.ethan_contacts(id) ON DELETE SET NULL,
  deal_id uuid REFERENCES public.ethan_deals(id) ON DELETE SET NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_tasks TO authenticated;
GRANT ALL ON public.ethan_tasks TO service_role;
ALTER TABLE public.ethan_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own tasks" ON public.ethan_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ethan_tasks_updated_at BEFORE UPDATE ON public.ethan_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX ethan_tasks_user_idx ON public.ethan_tasks(user_id);

-- NOTES
CREATE TABLE public.ethan_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  tags text[] NOT NULL DEFAULT '{}',
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_notes TO authenticated;
GRANT ALL ON public.ethan_notes TO service_role;
ALTER TABLE public.ethan_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own notes" ON public.ethan_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ethan_notes_updated_at BEFORE UPDATE ON public.ethan_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX ethan_notes_user_idx ON public.ethan_notes(user_id);

-- HABITUDES
CREATE TABLE public.ethan_habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  detail text,
  frequency text NOT NULL DEFAULT 'quotidienne',
  time_of_day text,
  domain text NOT NULL DEFAULT 'general',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_habits TO authenticated;
GRANT ALL ON public.ethan_habits TO service_role;
ALTER TABLE public.ethan_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own habits" ON public.ethan_habits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ethan_habits_updated_at BEFORE UPDATE ON public.ethan_habits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX ethan_habits_user_idx ON public.ethan_habits(user_id);

CREATE TABLE public.ethan_habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  habit_id uuid NOT NULL REFERENCES public.ethan_habits(id) ON DELETE CASCADE,
  done_on date NOT NULL DEFAULT (now() AT TIME ZONE 'Europe/Paris')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (habit_id, done_on)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_habit_logs TO authenticated;
GRANT ALL ON public.ethan_habit_logs TO service_role;
ALTER TABLE public.ethan_habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own habit logs" ON public.ethan_habit_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ethan_habit_logs_user_idx ON public.ethan_habit_logs(user_id);

-- OBJECTIFS
CREATE TABLE public.ethan_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  description text,
  horizon text NOT NULL DEFAULT 'month',
  parent_id uuid REFERENCES public.ethan_goals(id) ON DELETE SET NULL,
  progress integer NOT NULL DEFAULT 0,
  target_value numeric,
  current_value numeric,
  unit text,
  target_date date,
  priority text NOT NULL DEFAULT 'normale',
  status text NOT NULL DEFAULT 'actif',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ethan_goals TO authenticated;
GRANT ALL ON public.ethan_goals TO service_role;
ALTER TABLE public.ethan_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own goals" ON public.ethan_goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ethan_goals_updated_at BEFORE UPDATE ON public.ethan_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX ethan_goals_user_idx ON public.ethan_goals(user_id);