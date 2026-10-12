-- ConectaTEA V6 — esquema limpo para SITE + Supabase
-- ATENÇÃO: este script apaga APENAS os dados/tabelas públicas do ConectaTEA.
-- As contas em Authentication (auth.users) são preservadas e os perfis são recriados a partir dos metadados.

begin;

-- Remover objetos antigos do ConectaTEA para evitar conflito entre versões.
drop function if exists public.acknowledge_help_request(uuid) cascade;
drop function if exists public.resolve_help_request(uuid) cascade;
drop function if exists public.unlink_current_connection() cascade;
drop function if exists public.claim_pairing_code(text) cascade;
drop function if exists public.create_pairing_code() cascade;
drop function if exists public.is_linked_guardian(uuid) cascade;
drop function if exists public.is_linked_dependent(uuid) cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.prevent_profile_role_change() cascade;
drop function if exists public.touch_updated_at() cascade;

drop table if exists public.notification_devices cascade;
drop table if exists public.communication_cards cascade;
drop table if exists public.app_settings cascade;
drop table if exists public.sensory_preferences cascade;
drop table if exists public.relax_sessions cascade;
drop table if exists public.help_requests cascade;
drop table if exists public.routine_completions cascade;
drop table if exists public.routine_items cascade;
drop table if exists public.mood_entries cascade;
drop table if exists public.pairing_codes cascade;
drop table if exists public.connections cascade;
drop table if exists public.profiles cascade;

drop type if exists public.help_status cascade;
drop type if exists public.help_urgency cascade;
drop type if exists public.mood_type cascade;
drop type if exists public.user_role cascade;

create type public.user_role as enum ('dependent', 'guardian');
create type public.mood_type as enum ('very_happy', 'happy', 'neutral', 'anxious', 'sad');
create type public.help_status as enum ('open', 'acknowledged', 'resolved');
create type public.help_urgency as enum ('support', 'urgent');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  display_name text not null check (char_length(trim(display_name)) between 2 and 80),
  birth_date date,
  avatar_emoji text not null default '🙂',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Nesta versão: uma conta de responsável acompanha um dependente e vice-versa.
create table public.connections (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null unique references public.profiles(id) on delete cascade,
  dependent_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (guardian_id <> dependent_id)
);

-- O código é temporário. A tabela não fica legível para responsáveis;
-- o uso do código passa pela função SECURITY DEFINER claim_pairing_code().
create table public.pairing_codes (
  id uuid primary key default gen_random_uuid(),
  dependent_id uuid not null references public.profiles(id) on delete cascade,
  code text not null unique check (code ~ '^TEA-[A-F0-9]{8}$'),
  expires_at timestamptz not null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  dependent_id uuid not null references public.profiles(id) on delete cascade,
  mood public.mood_type not null,
  reason text check (char_length(reason) <= 500),
  intensity smallint not null default 3 check (intensity between 1 and 5),
  support_need text check (char_length(support_need) <= 300),
  created_at timestamptz not null default now()
);

create table public.routine_items (
  id uuid primary key default gen_random_uuid(),
  dependent_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 100),
  scheduled_time time not null,
  emoji text not null default '🧩',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routine_completions (
  id uuid primary key default gen_random_uuid(),
  routine_item_id uuid not null references public.routine_items(id) on delete cascade,
  dependent_id uuid not null references public.profiles(id) on delete cascade,
  completed_on date not null default current_date,
  completed_at timestamptz not null default now(),
  unique (routine_item_id, completed_on)
);

create table public.help_requests (
  id uuid primary key default gen_random_uuid(),
  dependent_id uuid not null references public.profiles(id) on delete cascade,
  urgency public.help_urgency not null default 'support',
  message text not null default 'Preciso de apoio.' check (char_length(message) <= 500),
  status public.help_status not null default 'open',
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz
);

create index idx_connections_guardian on public.connections(guardian_id);
create index idx_connections_dependent on public.connections(dependent_id);
create index idx_pairing_codes_code on public.pairing_codes(code);
create index idx_mood_dep_created on public.mood_entries(dependent_id, created_at desc);
create index idx_routine_dep_time on public.routine_items(dependent_id, scheduled_time);
create index idx_completion_dep_date on public.routine_completions(dependent_id, completed_on desc);
create index idx_help_dep_created on public.help_requests(dependent_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger touch_routine_items_updated_at
before update on public.routine_items
for each row execute function public.touch_updated_at();

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role then
    raise exception 'O tipo da conta não pode ser alterado depois do cadastro';
  end if;
  return new;
end;
$$;

create trigger protect_profile_role
before update on public.profiles
for each row execute function public.prevent_profile_role_change();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
  v_name text;
begin
  v_role := case
    when new.raw_user_meta_data->>'role' = 'guardian' then 'guardian'::public.user_role
    else 'dependent'::public.user_role
  end;

  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Usuário'
  );
  if char_length(trim(v_name)) < 2 then
    v_name := 'Usuário';
  end if;

  insert into public.profiles(id, role, display_name, avatar_emoji)
  values (
    new.id,
    v_role,
    left(v_name, 80),
    case when v_role = 'guardian' then '👤' else '🧩' end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Recria perfis das contas já existentes no Authentication.
insert into public.profiles(id, role, display_name, avatar_emoji)
select
  u.id,
  case when u.raw_user_meta_data->>'role' = 'guardian' then 'guardian'::public.user_role else 'dependent'::public.user_role end,
  left(case
    when char_length(trim(coalesce(nullif(u.raw_user_meta_data->>'display_name', ''), split_part(coalesce(u.email, 'usuario'), '@', 1), 'Usuário'))) >= 2
      then coalesce(nullif(trim(u.raw_user_meta_data->>'display_name'), ''), split_part(coalesce(u.email, 'usuario'), '@', 1), 'Usuário')
    else 'Usuário'
  end, 80),
  case when u.raw_user_meta_data->>'role' = 'guardian' then '👤' else '🧩' end
from auth.users u
on conflict (id) do nothing;

create or replace function public.is_linked_guardian(p_dependent uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.connections c
    where c.guardian_id = auth.uid()
      and c.dependent_id = p_dependent
  );
$$;

create or replace function public.is_linked_dependent(p_guardian uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.connections c
    where c.dependent_id = auth.uid()
      and c.guardian_id = p_guardian
  );
$$;

-- Gera um código temporário para a conta DEPENDENTE.
create or replace function public.create_pairing_code()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
  v_code text;
begin
  select p.role into v_role
  from public.profiles p
  where p.id = auth.uid()
  for update;

  if v_role is distinct from 'dependent'::public.user_role then
    raise exception 'Somente contas de dependente podem gerar um código';
  end if;

  if exists (select 1 from public.connections c where c.dependent_id = auth.uid()) then
    raise exception 'Este dependente já possui um responsável vinculado';
  end if;

  delete from public.pairing_codes
  where dependent_id = auth.uid();

  loop
    v_code := 'TEA-' || upper(substr(md5(random()::text || clock_timestamp()::text || auth.uid()::text), 1, 8));
    begin
      insert into public.pairing_codes(dependent_id, code, expires_at)
      values (auth.uid(), v_code, now() + interval '15 minutes');
      exit;
    exception when unique_violation then
      -- tenta novamente em caso de colisão extremamente improvável
    end;
  end loop;

  return v_code;
end;
$$;

-- Responsável usa o código; o servidor cria o vínculo real.
create or replace function public.claim_pairing_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.user_role;
  v_dependent uuid;
begin
  select p.role into v_role
  from public.profiles p
  where p.id = auth.uid()
  for update;

  if v_role is distinct from 'guardian'::public.user_role then
    raise exception 'Somente contas de responsável podem usar um código';
  end if;

  if exists (select 1 from public.connections c where c.guardian_id = auth.uid()) then
    raise exception 'Esta conta de responsável já possui um dependente vinculado';
  end if;

  select pc.dependent_id into v_dependent
  from public.pairing_codes pc
  where pc.code = upper(trim(p_code))
    and pc.claimed_at is null
    and pc.expires_at > now()
  order by pc.created_at desc
  limit 1
  for update;

  if v_dependent is null then
    raise exception 'Código inválido ou expirado';
  end if;

  if exists (select 1 from public.connections c where c.dependent_id = v_dependent) then
    raise exception 'Este dependente já possui um responsável vinculado';
  end if;

  insert into public.connections(guardian_id, dependent_id)
  values (auth.uid(), v_dependent);

  update public.pairing_codes
  set claimed_at = now()
  where dependent_id = v_dependent
    and code = upper(trim(p_code))
    and claimed_at is null;

  return v_dependent;
end;
$$;

create or replace function public.unlink_current_connection()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.connections
  where guardian_id = auth.uid() or dependent_id = auth.uid();

  delete from public.pairing_codes
  where dependent_id = auth.uid();
end;
$$;

create or replace function public.acknowledge_help_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_dependent uuid;
begin
  select h.dependent_id into v_dependent
  from public.help_requests h
  where h.id = p_request_id;

  if v_dependent is null or not public.is_linked_guardian(v_dependent) then
    raise exception 'Pedido não encontrado ou acesso negado';
  end if;

  update public.help_requests
  set status = case when status = 'resolved' then status else 'acknowledged'::public.help_status end,
      acknowledged_at = case when status = 'resolved' then acknowledged_at else coalesce(acknowledged_at, now()) end
  where id = p_request_id;
end;
$$;

create or replace function public.resolve_help_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_dependent uuid;
begin
  select h.dependent_id into v_dependent
  from public.help_requests h
  where h.id = p_request_id;

  if v_dependent is null or not public.is_linked_guardian(v_dependent) then
    raise exception 'Pedido não encontrado ou acesso negado';
  end if;

  update public.help_requests
  set status = 'resolved'::public.help_status,
      acknowledged_at = coalesce(acknowledged_at, now()),
      resolved_at = coalesce(resolved_at, now())
  where id = p_request_id;
end;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.connections enable row level security;
alter table public.pairing_codes enable row level security;
alter table public.mood_entries enable row level security;
alter table public.routine_items enable row level security;
alter table public.routine_completions enable row level security;
alter table public.help_requests enable row level security;

-- PROFILES
create policy profiles_select_self_or_linked
on public.profiles for select to authenticated
using (
  id = auth.uid()
  or public.is_linked_guardian(id)
  or public.is_linked_dependent(id)
);

create policy profiles_update_self
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- CONNECTIONS: leitura somente pelos dois participantes.
create policy connections_select_participant
on public.connections for select to authenticated
using (guardian_id = auth.uid() or dependent_id = auth.uid());

-- PAIRING CODES: somente o dependente dono pode enxergar o próprio código ativo.
create policy pairing_select_own
on public.pairing_codes for select to authenticated
using (dependent_id = auth.uid());

-- MOODS
create policy moods_select
on public.mood_entries for select to authenticated
using (dependent_id = auth.uid() or public.is_linked_guardian(dependent_id));

create policy moods_insert_own
on public.mood_entries for insert to authenticated
with check (dependent_id = auth.uid());

create policy moods_delete_own
on public.mood_entries for delete to authenticated
using (dependent_id = auth.uid());

-- ROUTINE ITEMS
create policy routine_select
on public.routine_items for select to authenticated
using (dependent_id = auth.uid() or public.is_linked_guardian(dependent_id));

create policy routine_insert_own
on public.routine_items for insert to authenticated
with check (dependent_id = auth.uid());

create policy routine_update_own
on public.routine_items for update to authenticated
using (dependent_id = auth.uid())
with check (dependent_id = auth.uid());

create policy routine_delete_own
on public.routine_items for delete to authenticated
using (dependent_id = auth.uid());

-- ROUTINE COMPLETIONS
create policy completions_select
on public.routine_completions for select to authenticated
using (dependent_id = auth.uid() or public.is_linked_guardian(dependent_id));

create policy completions_insert_own
on public.routine_completions for insert to authenticated
with check (
  dependent_id = auth.uid()
  and exists (
    select 1 from public.routine_items r
    where r.id = routine_item_id and r.dependent_id = auth.uid()
  )
);

create policy completions_delete_own
on public.routine_completions for delete to authenticated
using (dependent_id = auth.uid());

-- HELP REQUESTS
create policy help_select
on public.help_requests for select to authenticated
using (dependent_id = auth.uid() or public.is_linked_guardian(dependent_id));

create policy help_insert_own
on public.help_requests for insert to authenticated
with check (dependent_id = auth.uid());

-- Permissões Data API: RLS continua sendo a barreira real de autorização.
grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.connections to authenticated;
grant select on public.pairing_codes to authenticated;
grant select, insert, delete on public.mood_entries to authenticated;
grant select, insert, update, delete on public.routine_items to authenticated;
grant select, insert, delete on public.routine_completions to authenticated;
grant select, insert on public.help_requests to authenticated;

revoke all on function public.is_linked_guardian(uuid) from public;
revoke all on function public.is_linked_dependent(uuid) from public;
grant execute on function public.is_linked_guardian(uuid) to authenticated;
grant execute on function public.is_linked_dependent(uuid) to authenticated;

revoke all on function public.create_pairing_code() from public;
revoke all on function public.claim_pairing_code(text) from public;
revoke all on function public.unlink_current_connection() from public;
revoke all on function public.acknowledge_help_request(uuid) from public;
revoke all on function public.resolve_help_request(uuid) from public;

grant execute on function public.create_pairing_code() to authenticated;
grant execute on function public.claim_pairing_code(text) to authenticated;
grant execute on function public.unlink_current_connection() to authenticated;
grant execute on function public.acknowledge_help_request(uuid) to authenticated;
grant execute on function public.resolve_help_request(uuid) to authenticated;

-- Avisa o PostgREST para recarregar o schema imediatamente.
notify pgrst, 'reload schema';

commit;

-- Verificação rápida. Deve retornar todas as tabelas abaixo.
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles','connections','pairing_codes','mood_entries',
    'routine_items','routine_completions','help_requests'
  )
order by tablename;
