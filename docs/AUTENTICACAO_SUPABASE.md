# Autenticação real do ConectaTEA — V3

A V3 troca o login demonstrativo por **Supabase Auth real**.

## O que já funciona

- cadastro por e-mail e senha para dependente;
- cadastro por e-mail e senha para responsável;
- metadata de cadastro com `role` e `display_name`;
- criação automática do perfil pela trigger `on_auth_user_created`;
- login com validação do tipo de conta usando `public.profiles.role`;
- sessão persistente no aparelho usando AsyncStorage;
- restauração automática da sessão ao reabrir o app;
- logout real;
- atualização do nome diretamente em `public.profiles`;
- bloqueio da interface quando o `.env` não está configurado.

## Arquivo `.env`

Crie o arquivo `.env` somente no seu computador, na raiz do projeto:

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxx
```

Nunca coloque `service_role`, secret key ou senha do banco dentro do app.

O `.gitignore` já impede que `.env` seja enviado ao GitHub.

## Configuração de e-mail no Supabase

No painel do Supabase, em **Authentication**, o cadastro por e-mail precisa estar habilitado.

Se **Confirm email** estiver ligado, o cadastro cria o usuário, mas o app informa que é necessário confirmar o e-mail antes do primeiro login.

Para testes rápidos de desenvolvimento, você pode optar por desativar temporariamente a confirmação de e-mail no painel. Em produção, recomenda-se manter confirmação e configurar corretamente o fluxo de e-mail.

## Teste recomendado

1. Inicie o app com `npx expo start -c`.
2. Escolha **Dependente**.
3. Crie uma conta nova com e-mail real.
4. No Supabase, confira `Authentication > Users`.
5. No Table Editor, confira a nova linha em `profiles` com `role = dependent`.
6. Saia da conta pelo menu **Mais**.
7. Entre novamente.
8. Feche e abra o app e confirme que a sessão é restaurada.
9. Repita o processo criando uma conta de **Responsável**.
10. Tente entrar pela opção errada. O app deve rejeitar a conta e informar o tipo correto.

## Segurança do tipo de conta

O app não confia apenas no `user_metadata`. Durante o login, ele consulta `public.profiles.role` no banco. Assim, o roteamento da interface usa o papel persistido no banco, enquanto as políticas RLS continuam sendo a camada efetiva de autorização dos dados.

A V2.1 do schema também contém a trigger `protect_profile_role`, que impede a troca direta de `dependent` para `guardian` por atualização comum do perfil.

## Próxima etapa

A autenticação já está online, mas os dados de humor, rotina, relaxamento e pedidos de ajuda ainda são local-first nesta V3. A próxima etapa deve migrar essas operações para as tabelas do Supabase e implementar sincronização entre dependente e responsável.
