# Configurar o Supabase

A V2 funciona localmente sem Supabase. Faça esta etapa quando quiser transformar o protótipo em sistema multi-dispositivo.

## 1. Criar projeto

Crie um projeto novo no Supabase. Guarde:

- Project URL;
- Publishable key.

Não use secret/service-role key no aplicativo.

## 2. Criar banco

Abra o SQL Editor do projeto e execute todo o arquivo:

```text
supabase/schema.sql
```

O script cria tabelas, índices, funções de vínculo e políticas RLS.

## 3. Criar `.env`

Copie `.env.example` para `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICAVEL
```

Depois reinicie o Expo.

## 4. Autenticação

O trigger `handle_new_user` espera metadata no cadastro:

```ts
{
  role: 'dependent' | 'guardian',
  display_name: 'Nome'
}
```

A tela de autenticação da V2 ainda opera em modo local; a camada de produção deve chamar `supabase.auth.signUp` e `supabase.auth.signInWithPassword` e então hidratar o estado com o perfil autenticado.

## 5. Vínculo seguro

Fluxo de produção previsto:

1. dependente chama RPC `create_pairing_code()`;
2. servidor cria um código temporário e salva somente o hash;
3. responsável digita o código;
4. responsável chama RPC `claim_pairing_code(code)`;
5. o servidor cria `connections`;
6. as políticas RLS passam a permitir as leituras autorizadas.

## 6. Sincronização recomendada

Para produção, implemente um Repository que:

- carregue dados do servidor depois do login;
- mantenha cache local;
- registre fila de mudanças offline;
- tente sincronizar quando a conexão voltar;
- evite apagar dados locais antes da confirmação do servidor;
- use IDs UUID do servidor em registros sincronizados.

## 7. Teste RLS antes de publicar

Teste ao menos três contas:

- Dependente A;
- Responsável A vinculado ao Dependente A;
- Responsável B sem vínculo.

O Responsável B nunca deve conseguir ler humor, rotina, preferências ou pedidos do Dependente A, mesmo fazendo chamadas diretas à API.
