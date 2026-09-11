-- ============================================================
-- ETHAN COMMAND CENTER — CORE DATABASE
-- Tables utilisées par ETHAN Directeur commercial
-- ============================================================

-- ============================================================
-- 1. MESSAGES ETHAN
-- ============================================================

create table if not exists public.ethan_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. ELEMENTS SUIVIS PAR ETHAN
-- ============================================================

create table if not exists public.ethan_tracked_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,

  type text not null,
  title text not null,
  description text,

  status text not null default 'active',

  priority text not null default 'normal',

  due_at timestamptz,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 3. HISTORIQUE DES EVENEMENTS
-- ============================================================

create table if not exists public.ethan_item_events (
  id uuid primary key default gen_random_uuid(),

  item_id uuid not null
    references public.ethan_tracked_items(id)
    on delete cascade,

  user_id uuid references auth.users(id) on delete cascade,

  event_type text not null,

  content text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

-- ============================================================
-- 4. INDEX
-- ============================================================

create index if not exists ethan_messages_user_id_idx
  on public.ethan_messages(user_id);

create index if not exists ethan_messages_created_at_idx
  on public.ethan_messages(created_at);

create index if not exists ethan_tracked_items_user_id_idx
  on public.ethan_tracked_items(user_id);

create index if not exists ethan_tracked_items_status_idx
  on public.ethan_tracked_items(status);

create index if not exists ethan_tracked_items_due_at_idx
  on public.ethan_tracked_items(due_at);

create index if not exists ethan_item_events_item_id_idx
  on public.ethan_item_events(item_id);

create index if not exists ethan_item_events_user_id_idx
  on public.ethan_item_events(user_id);

create index if not exists ethan_item_events_created_at_idx
  on public.ethan_item_events(created_at);

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

alter table public.ethan_messages enable row level security;
alter table public.ethan_tracked_items enable row level security;
alter table public.ethan_item_events enable row level security;

-- ============================================================
-- 6. POLICIES — MESSAGES
-- ============================================================

drop policy if exists "Users can view their own ETHAN messages"
on public.ethan_messages;

create policy "Users can view their own ETHAN messages"
on public.ethan_messages
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own ETHAN messages"
on public.ethan_messages;

create policy "Users can create their own ETHAN messages"
on public.ethan_messages
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own ETHAN messages"
on public.ethan_messages;

create policy "Users can update their own ETHAN messages"
on public.ethan_messages
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own ETHAN messages"
on public.ethan_messages;

create policy "Users can delete their own ETHAN messages"
on public.ethan_messages
for delete
to authenticated
using (auth.uid() = user_id);

-- ============================================================
-- 7. POLICIES — TRACKED ITEMS
-- ============================================================

drop policy if exists "Users can view their own tracked items"
on public.ethan_tracked_items;

create policy "Users can view their own tracked items"
on public.ethan_tracked_items
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own tracked items"
on public.ethan_tracked_items;

create policy "Users can create their own tracked items"
on public.ethan_tracked_items
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own tracked items"
on public.ethan_tracked_items;

create policy "Users can update their own tracked items"
on public.ethan_tracked_items
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own tracked items"
on public.ethan_tracked_items;

create policy "Users can delete their own tracked items"
on public.ethan_tracked_items
for delete
to authenticated
using (auth.uid() = user_id);

-- ============================================================
-- 8. POLICIES — EVENTS
-- ============================================================

drop policy if exists "Users can view their own item events"
on public.ethan_item_events;

create policy "Users can view their own item events"
on public.ethan_item_events
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own item events"
on public.ethan_item_events;

create policy "Users can create their own item events"
on public.ethan_item_events
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own item events"
on public.ethan_item_events;

create policy "Users can update their own item events"
on public.ethan_item_events
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own item events"
on public.ethan_item_events;

create policy "Users can delete their own item events"
on public.ethan_item_events
for delete
to authenticated
using (auth.uid() = user_id);

-- ============================================================
-- 9. UPDATED_AT
-- ============================================================

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_ethan_tracked_items_updated_at
on public.ethan_tracked_items;

create trigger update_ethan_tracked_items_updated_at
before update on public.ethan_tracked_items
for each row
execute function public.update_updated_at_column();

-- ============================================================
-- FIN
-- ============================================================
