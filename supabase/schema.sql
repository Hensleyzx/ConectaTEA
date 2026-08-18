-- ConectaTEA V2 - schema proposto para a fase online
-- Supabase/Postgres + Auth + RLS
-- Execute em um projeto NOVO. O app V2 funciona localmente mesmo sem este banco.

create extension if not exists pgcrypto;

-- ========= TIPOS =========
do $$ begin
  create type public.user_role as enum ('dependent', 'guardian');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.mood_type as enum ('very_happy', 'happy', 'neutral', 'anxious', 'sad');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.help_status as enum ('open', 'acknowledged', 'resolved');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.help_urgency as enum ('support', 'urgent');
exception when duplicate_object then null; end $$;

-- ========= TABELAS =========
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  display_name text not null check (char_length(display_name) between 1 and 80),
  birth_date date,
  avatar_emoji text not null default '🙂',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.profiles(id) on delete cascade,
  dependent_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (guardian_id, dependent_id),
  check (guardian_id <> dependent_id)
);

-- Guarda apenas hash do código, nunca o código em texto puro.
create table if not exists public.pairing_codes (
  id uuid primary key default gen_random_uuid(),
  dependent_id uuid not null references public.profiles(id) on delete cascade,
  code_hash bytea not null unique,
  expires_at timestamptz not null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  dependent_id uuid not null references public.profiles(id) on delete cascade,
  mood public.mood_type not null,
  reason text check (char_length(reason) <= 300),
  intensity smallint not null default 3 check (intensity between 1 and 5),
  tags text[] not null default '{}',
  support_need text,
  created_at timestamptz not null default now()
);

create table if not exists public.routine_items (
  id uuid primary key default gen_random_uuid(),
  dependent_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  scheduled_time time not null,
  emoji text not null default '🧩',
  category text not null default 'other',
  sort_order integer not null default 0,
  active boolean not null default true,
  reminder_enabled boolean not null default false,
  transition_minutes smallint not null default 5 check (transition_minutes between 0 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routine_completions (
  id uuid primary key default gen_random_uuid(),
  routine_item_id uuid not null references public.routine_items(id) on delete cascade,
  dependent_id uuid not null references public.profiles(id) on delete cascade,
  completed_on date not null default current_date,
  completed_at timestamptz not null default now(),
  unique (routine_item_id, completed_on)
);

create table if not exists public.help_requests (
  id uuid primary key default gen_random_uuid(),
  dependent_id uuid not null references public.profiles(id) on delete cascade,
  urgency public.help_urgency not null default 'support',
  message text not null default 'Preciso de apoio.' check (char_length(message) <= 250),
  status public.help_status not null default 'open',
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz
);

create table if not exists public.relax_sessions (
  id uuid primary key default gen_random_uuid(),
  dependent_id uuid not null references public.profiles(id) on delete cascade,
  tool text not null check (char_length(tool) <= 80),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.sensory_preferences (
  dependent_id uuid primary key references public.profiles(id) on delete cascade,
  reduced_motion boolean not null default false,
  high_contrast boolean not null default false,
  large_controls boolean not null default true,
  haptics boolean not null default true,
  default_volume numeric(3,2) not null default 0.55 check (default_volume between 0 and 1),
  preferred_tools text[] not null default '{}',
  avoid_triggers text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  simple_mode boolean not null default false,
  routine_reminders boolean not null default true,
  guardian_alerts boolean not null default true,
  show_celebrations boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Para push notifications. Cada instalação/dispositivo pode ter um token.
create table if not exists public.notification_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expo_push_token text not null,
  platform text,
  enabled boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

-- Cartões personalizados de comunicação/AAC.
create table if not exists public.communication_cards (
  id uuid primary key default gen_random_uuid(),
  dependent_id uuid not null references public.profiles(id) on delete cascade,
  label text not null check (char_length(label) <= 180),
  emoji text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ========= ÍNDICES =========
create index if not exists idx_connections_guardian on public.connections (guardian_id);
create index if not exists idx_connections_dependent on public.connections (dependent_id);
create index if not exists idx_moods_dependent_created on public.mood_entries (dependent_id, created_at desc);
create index if not exists idx_routine_dependent_time on public.routine_items (dependent_id, scheduled_time);
create index if not exists idx_completions_dependent_date on public.routine_completions (dependent_id, completed_on desc);
create index if not exists idx_help_dependent_created on public.help_requests (dependent_id, created_at desc);
create index if not exists idx_relax_dependent_created on public.relax_sessions (dependent_id, created_at desc);
create index if not exists idx_pairing_expires on public.pairing_codes (expires_at);
create index if not exists idx_devices_user on public.notification_devices (user_id);

-- ========= FUNÇÕES AUXILIARES =========
create or replace function public.is_linked_guardian(p_dependent uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.connections c
    where c.guardian_id = auth.uid() and c.dependent_id = p_dependent
  );
$$;

create or replace function public.is_linked_dependent(p_guardian uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.connections c
    where c.dependent_id = auth.uid() and c.guardian_id = p_guardian
  );
$$;

-- Cria perfil automaticamente ao cadastrar no Supabase Auth.
-- Ao chamar signUp, envie metadata: { role: 'dependent'|'guardian', display_name: '...' }
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
  v_name text;
begin
  v_role := case when new.raw_user_meta_data->>'role' = 'guardian' then 'guardian'::public.user_role else 'dependent'::public.user_role end;
  v_name := coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(coalesce(new.email, 'Usuário'), '@', 1));
  insert into public.profiles (id, role, display_name)
  values (new.id, v_role, left(v_name, 80))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Cria código temporário. Retorna o código uma única vez ao dependente.
create or replace function public.create_pairing_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
  v_code text;
begin
  select role into v_role from public.profiles where id = auth.uid();
  if v_role is distinct from 'dependent'::public.user_role then
    raise exception 'Somente dependentes podem gerar código de vínculo';
  end if;

  delete from public.pairing_codes
  where dependent_id = auth.uid() and (claimed_at is null or expires_at < now());

  loop
    v_code := 'TEA-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
    begin
      insert into public.pairing_codes (dependent_id, code_hash, expires_at)
      values (auth.uid(), digest(v_code, 'sha256'), now() + interval '15 minutes');
      exit;
    exception when unique_violation then
      -- tenta outro código
    end;
  end loop;

  return v_code;
end;
$$;

-- Responsável usa o código; o servidor valida e cria a relação.
create or replace function public.claim_pairing_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
  v_dependent uuid;
begin
  select role into v_role from public.profiles where id = auth.uid();
  if v_role is distinct from 'guardian'::public.user_role then
    raise exception 'Somente responsáveis podem reivindicar código de vínculo';
  end if;

  select dependent_id into v_dependent
  from public.pairing_codes
  where code_hash = digest(upper(trim(p_code)), 'sha256')
    and claimed_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if v_dependent is null then
    raise exception 'Código inválido ou expirado';
  end if;

  insert into public.connections (guardian_id, dependent_id)
  values (auth.uid(), v_dependent)
  on conflict (guardian_id, dependent_id) do nothing;

  update public.pairing_codes
  set claimed_at = now()
  where dependent_id = v_dependent
    and code_hash = digest(upper(trim(p_code)), 'sha256')
    and claimed_at is null;

  return v_dependent;
end;
$$;

revoke all on function public.create_pairing_code() from public;
revoke all on function public.claim_pairing_code(text) from public;
grant execute on function public.create_pairing_code() to authenticated;
grant execute on function public.claim_pairing_code(text) to authenticated;

-- ========= ROW LEVEL SECURITY =========
alter table public.profiles enable row level security;
alter table public.connections enable row level security;
alter table public.pairing_codes enable row level security;
alter table public.mood_entries enable row level security;
alter table public.routine_items enable row level security;
alter table public.routine_completions enable row level security;
alter table public.help_requests enable row level security;
alter table public.relax_sessions enable row level security;
alter table public.sensory_preferences enable row level security;
alter table public.app_settings enable row level security;
alter table public.notification_devices enable row level security;
alter table public.communication_cards enable row level security;

-- profiles
drop policy if exists "profiles read permitted" on public.profiles;
create policy "profiles read permitted" on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_linked_guardian(id) or public.is_linked_dependent(id));

drop policy if exists "profile owner updates self" on public.profiles;
create policy "profile owner updates self" on public.profiles
for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

-- connections
drop policy if exists "connection participants read" on public.connections;
create policy "connection participants read" on public.connections
for select to authenticated
using (guardian_id = auth.uid() or dependent_id = auth.uid());

drop policy if exists "connection participants delete" on public.connections;
create policy "connection participants delete" on public.connections
for delete to authenticated
using (guardian_id = auth.uid() or dependent_id = auth.uid());

-- pairing codes: apenas o dependente dono vê os metadados; criação real é via RPC.
drop policy if exists "dependent reads own pairing metadata" on public.pairing_codes;
create policy "dependent reads own pairing metadata" on public.pairing_codes
for select to authenticated using (dependent_id = auth.uid());

-- moods
drop policy if exists "dependent manages own moods" on public.mood_entries;
create policy "dependent manages own moods" on public.mood_entries
for all to authenticated
using (dependent_id = auth.uid()) with check (dependent_id = auth.uid());

drop policy if exists "guardian reads linked moods" on public.mood_entries;
create policy "guardian reads linked moods" on public.mood_entries
for select to authenticated using (public.is_linked_guardian(dependent_id));

-- routine items
drop policy if exists "dependent manages own routines" on public.routine_items;
create policy "dependent manages own routines" on public.routine_items
for all to authenticated
using (dependent_id = auth.uid()) with check (dependent_id = auth.uid());

drop policy if exists "guardian reads linked routines" on public.routine_items;
create policy "guardian reads linked routines" on public.routine_items
for select to authenticated using (public.is_linked_guardian(dependent_id));

-- completions
drop policy if exists "dependent manages own completions" on public.routine_completions;
create policy "dependent manages own completions" on public.routine_completions
for all to authenticated
using (dependent_id = auth.uid()) with check (dependent_id = auth.uid());

drop policy if exists "guardian reads linked completions" on public.routine_completions;
create policy "guardian reads linked completions" on public.routine_completions
for select to authenticated using (public.is_linked_guardian(dependent_id));

-- help
drop policy if exists "dependent reads own help" on public.help_requests;
create policy "dependent reads own help" on public.help_requests
for select to authenticated using (dependent_id = auth.uid());

drop policy if exists "dependent creates own help" on public.help_requests;
create policy "dependent creates own help" on public.help_requests
for insert to authenticated with check (dependent_id = auth.uid());

drop policy if exists "guardian reads linked help" on public.help_requests;
create policy "guardian reads linked help" on public.help_requests
for select to authenticated using (public.is_linked_guardian(dependent_id));

drop policy if exists "guardian updates linked help" on public.help_requests;
create policy "guardian updates linked help" on public.help_requests
for update to authenticated
using (public.is_linked_guardian(dependent_id))
with check (public.is_linked_guardian(dependent_id));

-- relax sessions
drop policy if exists "dependent manages relax sessions" on public.relax_sessions;
create policy "dependent manages relax sessions" on public.relax_sessions
for all to authenticated
using (dependent_id = auth.uid()) with check (dependent_id = auth.uid());

drop policy if exists "guardian reads linked relax sessions" on public.relax_sessions;
create policy "guardian reads linked relax sessions" on public.relax_sessions
for select to authenticated using (public.is_linked_guardian(dependent_id));

-- sensory
drop policy if exists "dependent manages sensory prefs" on public.sensory_preferences;
create policy "dependent manages sensory prefs" on public.sensory_preferences
for all to authenticated
using (dependent_id = auth.uid()) with check (dependent_id = auth.uid());

drop policy if exists "guardian reads linked sensory prefs" on public.sensory_preferences;
create policy "guardian reads linked sensory prefs" on public.sensory_preferences
for select to authenticated using (public.is_linked_guardian(dependent_id));

-- per-user app settings
drop policy if exists "user manages own app settings" on public.app_settings;
create policy "user manages own app settings" on public.app_settings
for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

-- devices
drop policy if exists "user manages own devices" on public.notification_devices;
create policy "user manages own devices" on public.notification_devices
for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

-- communication cards
drop policy if exists "dependent manages communication cards" on public.communication_cards;
create policy "dependent manages communication cards" on public.communication_cards
for all to authenticated
using (dependent_id = auth.uid()) with check (dependent_id = auth.uid());

drop policy if exists "guardian reads linked communication cards" on public.communication_cards;
create policy "guardian reads linked communication cards" on public.communication_cards
for select to authenticated using (public.is_linked_guardian(dependent_id));

-- ========= GRANTS =========
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, delete on public.connections to authenticated;
grant select on public.pairing_codes to authenticated;
grant select, insert, update, delete on public.mood_entries to authenticated;
grant select, insert, update, delete on public.routine_items to authenticated;
grant select, insert, update, delete on public.routine_completions to authenticated;
grant select, insert, update on public.help_requests to authenticated;
grant select, insert, update, delete on public.relax_sessions to authenticated;
grant select, insert, update, delete on public.sensory_preferences to authenticated;
grant select, insert, update, delete on public.app_settings to authenticated;
grant select, insert, update, delete on public.notification_devices to authenticated;
grant select, insert, update, delete on public.communication_cards to authenticated;
