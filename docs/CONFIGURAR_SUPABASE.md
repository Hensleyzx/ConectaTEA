# Configurar o Supabase — ConectaTEA V3

A V3 já usa o Supabase para **cadastro, login, sessão e perfil**. Os módulos de humor, rotina, relaxamento e ajuda ainda serão sincronizados na próxima etapa.

## 1. Projeto Supabase

Use o projeto em que o schema do ConectaTEA foi executado. Guarde somente:

- Project URL;
- Publishable key.

Nunca use `service_role`, secret key ou senha do banco dentro do aplicativo.

## 2. Banco

O arquivo oficial desta versão é:

```text
supabase/schema.sql
```

Ele corresponde ao schema V2.1 revisado e contém tabelas, índices, triggers, RPCs, RLS e proteções de integridade.

Se você já executou a V2.1 revisada no projeto Supabase, **não precisa executar novamente apenas para usar a V3 do app**.

Para verificar a estrutura sem alterar dados, execute:

```text
supabase/verify_setup.sql
```

## 3. `.env` local

Na raiz do projeto, crie `.env` a partir de `.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxx
```

Depois reinicie limpando o cache:

```powershell
npx expo start -c
```

O `.env` está no `.gitignore` e não deve ser enviado ao GitHub.

## 4. Autenticação implementada

O cadastro chama `supabase.auth.signUp` e envia:

```ts
{
  role: 'dependent' | 'guardian',
  display_name: 'Nome'
}
```

A trigger `handle_new_user` cria a linha correspondente em `public.profiles`.

No login, o app consulta `public.profiles.role`. Ele não usa apenas metadata para decidir qual ambiente abrir.

## 5. Confirmação de e-mail

Se a confirmação de e-mail estiver habilitada no Supabase, o cadastro pode retornar usuário sem sessão. Nesse caso, o ConectaTEA informa que é necessário confirmar o e-mail antes do primeiro login.

## 6. Teste mínimo

Teste pelo menos:

1. criar Dependente A;
2. confirmar que aparece em `Authentication > Users`;
3. confirmar que `profiles.role = dependent`;
4. sair e entrar novamente;
5. fechar e reabrir o app e verificar restauração da sessão;
6. criar Responsável A;
7. confirmar `profiles.role = guardian`;
8. tentar entrar com Responsável A pela opção Dependente e confirmar que o app recusa.

## 7. Vínculo seguro — próxima integração

O banco já contém as RPCs:

- `create_pairing_code()`;
- `claim_pairing_code(code)`.

A próxima etapa do app substituirá o vínculo demonstrativo pela chamada dessas funções e pela tabela `connections`.

## 8. Sincronização — próxima integração

Os próximos módulos a migrar para o Supabase são:

- `mood_entries`;
- `routine_items` e `routine_completions`;
- `relax_sessions`;
- `sensory_preferences`;
- `app_settings`;
- `help_requests`;
- `communication_cards`.

O cache local continuará útil para funcionamento offline, mas o servidor passará a ser a fonte compartilhada entre os dois celulares.
