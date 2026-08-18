# Atualizar o repositório GitHub para a V3

O repositório público não deve conter o arquivo `.env` real.

## Arquivos importantes desta atualização

A V3 altera principalmente:

- `App.tsx`
- `src/context/AppContext.tsx`
- `src/screens/AuthScreen.tsx`
- `src/screens/MoreScreen.tsx`
- `src/screens/SettingsScreen.tsx`
- `supabase/schema.sql`
- `package.json`
- `app.json`
- `README.md`

E adiciona/atualiza:

- `.gitignore`
- `.env.example`
- `docs/AUTENTICACAO_SUPABASE.md`
- `docs/ATUALIZAR_GITHUB_V3.md`
- `supabase/verify_setup.sql`

## Antes do upload

1. Remova o `.env` que estiver versionado no GitHub.
2. Mantenha o `.env` real somente no computador.
3. Não publique nenhuma `service_role`, secret key ou senha do banco.

A Publishable key não é uma chave administrativa, mas ainda assim o arquivo `.env` local não deve ser tratado como arquivo de projeto versionado.

## Depois do upload

No computador, confirme que existe:

```text
ConectaTEA/
├─ .env              ← somente local
├─ .env.example      ← pode ir para o GitHub
├─ .gitignore
├─ App.tsx
├─ package.json
├─ src/
└─ supabase/
```

Então execute:

```powershell
npm install
npx expo start -c
```

## Primeiro teste online

Crie uma conta nova no app e confirme no Supabase:

- `Authentication > Users`: usuário criado;
- `Table Editor > profiles`: perfil com o mesmo UUID;
- `role`: `dependent` ou `guardian` conforme a opção escolhida no app.
