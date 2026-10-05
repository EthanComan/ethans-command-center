CREATE TABLE IF NOT EXISTS public.ethan_private_config (key text PRIMARY KEY, value text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
REVOKE ALL ON public.ethan_private_config FROM public, anon, authenticated;
GRANT ALL ON public.ethan_private_config TO service_role;
ALTER TABLE public.ethan_private_config ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.ethan_verify_cron_token(_token text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.ethan_private_config WHERE key = 'cron_token' AND value = _token AND length(_token) >= 32)
$$;
REVOKE ALL ON FUNCTION public.ethan_verify_cron_token(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ethan_verify_cron_token(text) TO service_role;