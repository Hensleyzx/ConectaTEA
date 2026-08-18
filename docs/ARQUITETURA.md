# Arquitetura do ConectaTEA

## 1. Estratégia

A V2 usa uma arquitetura **local-first**: primeiro o app funciona no próprio aparelho; depois a mesma experiência pode ser conectada ao backend sem bloquear o desenvolvimento visual e funcional.

```text
Interface Expo/React Native
        │
        ▼
AppContext / regras do app
        │
   ┌────┴───────────┐
   │                │
AsyncStorage     Serviços online
(local)          (Supabase/Push)
                    │
                    ▼
             PostgreSQL + Auth
                    │
             Edge Functions
                    │
                    ▼
             Expo Push Service
```

## 2. Camadas

### Apresentação
`src/screens` e `src/components`.

Responsável por telas, navegação simples, feedback visual, interação e acessibilidade.

### Estado e regras
`src/context/AppContext.tsx`.

Centraliza operações como registrar humor, concluir rotina, criar pedido de ajuda e alterar preferências.

### Dados locais
AsyncStorage salva um snapshot do estado do app. Isso permite prototipar e testar sem internet.

### Serviços externos
`src/services/supabase.ts` e `src/services/notifications.ts`.

São o ponto de entrada para autenticação, banco, sincronização e push quando o ambiente online for ativado.

### Banco e autorização
`supabase/schema.sql`.

O acesso não deve depender apenas da interface. As políticas RLS verificam o usuário autenticado e os vínculos no banco.

### Notificação remota
`supabase/functions/send-help-notification/index.ts`.

O cliente cria um pedido, o servidor verifica a identidade e o vínculo, busca os tokens dos responsáveis e envia a notificação. Segredos ficam somente no servidor.

## 3. Modelo de dados principal

```text
profiles
  │
  ├── connections ───────────── guardian ↔ dependent
  │
  ├── mood_entries
  ├── routine_items ── routine_completions
  ├── help_requests
  ├── relax_sessions
  ├── sensory_preferences
  ├── communication_cards
  └── notification_devices
```

## 4. Evolução para produção

O próximo passo técnico é trocar operações locais por um repositório híbrido:

```text
Tela
 ↓
Repository
 ├─ LocalStore
 └─ SupabaseStore
```

Assim o app pode escrever localmente, sincronizar quando houver internet e resolver conflitos de forma previsível.
