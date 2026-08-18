# Roadmap até produção

## Fase A — Base local funcional ✅

- interface e navegação;
- persistência local;
- humores;
- rotina;
- áudio;
- comunicação/AAC simplificada;
- pedido de ajuda demonstrativo;
- área do responsável e relatórios;
- ferramentas de regulação e acessibilidade.

## Fase B — V3 autenticação Supabase ✅

- cadastro real por e-mail e senha;
- perfis `dependent` e `guardian`;
- criação automática de `profiles` por trigger;
- sessão persistente;
- restauração automática da sessão;
- validação do papel pelo banco;
- logout real;
- atualização online do nome do perfil;
- `.env` separado do GitHub.

## Fase C — Dados compartilhados

- Repository local + remoto;
- CRUD real de humor;
- CRUD real de rotina e conclusões;
- preferências sensoriais sincronizadas;
- sessões de relaxamento sincronizadas;
- pedidos de ajuda reais;
- cartões de comunicação personalizados;
- cache offline e fila de sincronização.

## Fase D — Vínculo real

- dependente chama `create_pairing_code()`;
- responsável chama `claim_pairing_code()`;
- criação de `connections`;
- seleção de dependente para responsáveis com mais de um vínculo;
- remoção de vínculo com confirmação;
- auditoria das políticas RLS para contas vinculadas e não vinculadas.

## Fase E — Push real

- EAS project ID;
- development build;
- Expo Push Token;
- registro de dispositivo;
- deploy da Edge Function;
- push para responsáveis;
- deep link direto para o pedido;
- receipts/retry e desativação de token inválido.

## Fase F — Qualidade

- testes unitários das regras;
- testes de integração com Supabase;
- testes E2E dos dois perfis;
- auditoria RLS;
- teste de acessibilidade;
- teste em aparelhos Android de entrada;
- validação de consumo de bateria e áudio.

## Fase G — Produto

- onboarding melhor;
- recuperação de senha completa;
- exportar dados;
- exclusão de conta;
- política de privacidade;
- suporte e feedback;
- analytics mínimos e não invasivos;
- crash reporting sem conteúdo sensível.

## Ideias futuras, somente se fizerem sentido em testes com usuários

- histórias sociais personalizáveis;
- biblioteca visual própria de ícones/fotos;
- calendário semanal com mudanças destacadas;
- aviso “houve mudança de plano” com preparação visual;
- comunicação com escola/profissional mediante permissão granular;
- múltiplos responsáveis com níveis de acesso;
- exportação de relatório em PDF escolhido pelo usuário;
- modo de baixa estimulação visual global;
- sincronização opcional de rotinas entre casa e escola;
- widgets/atalhos rápidos do sistema;
- ações interativas na notificação do responsável;
- backup e restauração controlados pelo usuário.

Nenhum recurso futuro deve ser adicionado apenas por parecer “inteligente”: primeiro deve ser avaliado se reduz esforço, aumenta autonomia e respeita a preferência da pessoa que usa o app.
