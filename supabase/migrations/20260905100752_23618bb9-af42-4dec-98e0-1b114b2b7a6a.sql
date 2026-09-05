-- lovable-cron-fallback-reviewed: 1440 runs/day; rappels d'habitudes planifiés à la minute près, doivent partir même application fermée
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.unschedule('ethan-push-worker') where exists (select 1 from cron.job where jobname = 'ethan-push-worker');

select cron.schedule(
  'ethan-push-worker',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://project--4b4aa5aa-d6c2-42c2-ada4-53262c866d5b.lovable.app/api/public/cron/push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-ethan-cron-secret', '1ed8936170f21c4478d5661801f8a83431765800e63e8079'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
  $$
);