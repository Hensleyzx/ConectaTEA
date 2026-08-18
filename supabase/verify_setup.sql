-- ConectaTEA — verificação segura da estrutura Supabase
-- Apenas consulta metadados. Não altera nem apaga dados.

-- 1) Tabelas esperadas
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles', 'connections', 'pairing_codes', 'mood_entries',
    'routine_items', 'routine_completions', 'help_requests',
    'relax_sessions', 'sensory_preferences', 'app_settings',
    'notification_devices', 'communication_cards'
  )
order by table_name;

-- 2) Triggers importantes
select event_object_schema, event_object_table, trigger_name
from information_schema.triggers
where trigger_name in (
  'on_auth_user_created',
  'protect_profile_role',
  'touch_profiles_updated_at',
  'validate_routine_completion_owner'
)
order by trigger_name;

-- 3) RLS nas tabelas públicas do ConectaTEA
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles', 'connections', 'pairing_codes', 'mood_entries',
    'routine_items', 'routine_completions', 'help_requests',
    'relax_sessions', 'sensory_preferences', 'app_settings',
    'notification_devices', 'communication_cards'
  )
order by tablename;

-- 4) Políticas RLS cadastradas
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 5) Funções/RPCs principais
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'handle_new_user',
    'create_pairing_code',
    'claim_pairing_code',
    'acknowledge_help_request',
    'resolve_help_request'
  )
order by routine_name;
