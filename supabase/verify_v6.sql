-- ConectaTEA V6 — verificação sem alterar dados
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles','connections','pairing_codes','mood_entries','routine_items','routine_completions','help_requests')
order by tablename;

select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('create_pairing_code','claim_pairing_code','unlink_current_connection','acknowledge_help_request','resolve_help_request')
order by routine_name;

select policyname, tablename, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles','connections','pairing_codes','mood_entries','routine_items','routine_completions','help_requests')
order by tablename, policyname;
