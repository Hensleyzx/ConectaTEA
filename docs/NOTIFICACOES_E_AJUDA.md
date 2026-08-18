# Pedido de ajuda e notificações

## Fluxo planejado

```text
Dependente toca em "Preciso de ajuda"
          │
          ▼
Cria help_request no Supabase
          │
          ▼
Invoca send-help-notification
          │
          ▼
Edge Function valida usuário e vínculo
          │
          ▼
Busca notification_devices dos responsáveis
          │
          ▼
Expo Push Service
          │
          ▼
Celular do responsável
```

## Arquivos preparados

- `src/services/notifications.ts`
- `supabase/functions/send-help-notification/index.ts`
- tabela `notification_devices` no `schema.sql`.

## Antes de ativar

1. configurar projeto EAS e gerar `projectId`;
2. criar development build;
3. configurar credenciais de push Android/iOS;
4. registrar push token depois do login do responsável;
5. fazer deploy da Edge Function;
6. invocar a função após inserir um pedido de ajuda;
7. tratar push receipts e desativar tokens inválidos em produção.

## Segurança

- o aplicativo não conhece secret/service-role key;
- a função valida o JWT do dependente;
- a função confere se o `help_request` pertence ao usuário chamador;
- somente responsáveis vinculados recebem a mensagem;
- recomenda-se conteúdo de push curto, evitando expor detalhes íntimos na tela bloqueada.

## UX do pedido urgente

Na V2 o botão urgente usa pressão prolongada para reduzir acionamentos acidentais. Mesmo assim, o pedido de ajuda deve ser apresentado como canal de apoio do responsável, não como garantia de atendimento emergencial.
