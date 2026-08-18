# ConectaTEA — V3 (Supabase Auth real + base funcional)

Aplicativo mobile criado do zero a partir do conceito do ConectaTEA: apoiar organização de rotina, comunicação de emoções, autorregulação e pedido de apoio entre dependente e responsável.

> **Escopo responsável:** o ConectaTEA é uma ferramenta de organização, comunicação e apoio. Não realiza diagnóstico, não classifica a pessoa e não substitui atendimento profissional ou serviço de emergência.

## O que funciona nesta V3

A V3 mantém a experiência local-first dos recursos do app, mas a camada de conta já está conectada ao backend:

- Fluxo de abertura e escolha de perfil.
- **Cadastro e login reais no Supabase Auth** para dependente e responsável.
- Sessão persistente e restauração automática ao reabrir o app.
- Validação do tipo de conta consultando `public.profiles.role`.
- Logout real.
- Atualização do nome do perfil no Supabase.
- Dois ambientes: **Dependente** e **Responsável**.
- Estado persistente local com AsyncStorage: fechar e abrir o app mantém os registros.
- Registro de humor com 5 opções, intensidade, motivo, contexto e necessidade de apoio.
- Histórico de emoções.
- Rotina editável: criar, editar, excluir e concluir tarefas.
- Horário, emoji, categoria, lembrete e aviso de transição por tarefa.
- Tela **Primeiro → Depois**, mostrando somente os próximos dois passos da rotina.
- Sons reais gerados para demonstração: chuva, oceano, floresta, pássaros, vento e ruído marrom.
- Player de áudio com controle de volume e registro de tempo de uso.
- Respiração guiada com durações configuráveis.
- Técnica de grounding 5-4-3-2-1.
- Timer visual.
- Quadro de comunicação com frases rápidas e leitura em voz alta (AAC simplificada).
- **Meu plano de calma**, combinando preferências sensoriais, passos e atalhos.
- Perfil sensorial: movimento reduzido, vibração, volume, ferramentas preferidas e estímulos a evitar.
- Pedido de ajuda com dois níveis: apoio e urgente.
- Prevenção de toque acidental no pedido urgente por pressão prolongada.
- Painel do responsável com pedidos abertos, confirmação de recebimento e resolução.
- Visualização da rotina do dependente pelo responsável.
- Relatório semanal calculado a partir dos próprios registros de humor, rotina e relaxamento.
- Insights descritivos sem diagnosticar, comparar ou rotular comportamento.
- Código de vínculo demonstrativo entre dependente e responsável.
- Modo simples e configurações de acessibilidade.

## Backend e recursos avançados já preparados

Além da interface, o repositório contém uma base de produção:

- `supabase/schema.sql`: schema V2.1 revisado do PostgreSQL/Supabase com Auth, vínculos, humores, rotinas, conclusões, pedidos de ajuda, sessões de relaxamento, dispositivos e cartões de comunicação.
- Políticas **Row Level Security (RLS)** para separar dados de usuários e permitir leitura somente entre contas vinculadas.
- Código de vínculo temporário com hash no servidor, em vez de armazenar o código em texto puro.
- `src/services/supabase.ts`: cliente Supabase preparado para receber URL e publishable key via `.env`.
- `src/services/notifications.ts`: registro de Expo Push Token, canais de notificação e chamada da Edge Function.
- `supabase/functions/send-help-notification/index.ts`: Edge Function para enviar o pedido de ajuda aos dispositivos dos responsáveis vinculados.
- `eas.json`: perfil de build `preview` preparado para gerar APK de teste.

## O que ainda falta para o modo multi-dispositivo completo

A autenticação já está real. As próximas etapas são:

1. sincronizar humor, rotina, preferências, relaxamento e pedidos de ajuda com o banco;
2. ativar o vínculo real por RPC entre duas contas em aparelhos diferentes;
3. registrar o push token do aparelho do responsável;
4. enviar push notification remota;
5. implementar o fluxo completo de recuperação de senha;
6. gerar build assinado e preparar publicação em loja.

A V3 não finge que dados locais já estão sincronizados: cada tela deixa claro o que está online e o que ainda usa AsyncStorage.

## Como rodar

No PowerShell, dentro da pasta do projeto:

```powershell
npm install
npx expo start
```

Para checar tipos depois de instalar as dependências:

```powershell
npm run typecheck
```

Para preparar um APK pelo EAS depois de configurar sua conta Expo:

```powershell
npm install -g eas-cli
eas login
eas build:configure
npm run build:apk
```

## Estrutura do projeto

```text
ConectaTEA_V3_SUPABASE_AUTH/
├─ App.tsx
├─ app.json
├─ eas.json
├─ package.json
├─ .env.example
├─ assets/
│  ├─ conectatea-logo.png
│  ├─ conectatea-mark.png
│  └─ audio/
├─ src/
│  ├─ components/
│  ├─ context/
│  ├─ data/
│  ├─ screens/
│  ├─ services/
│  ├─ theme/
│  ├─ types/
│  └─ utils/
├─ supabase/
│  ├─ schema.sql
│  └─ functions/
│     └─ send-help-notification/
└─ docs/
```

## Documentação complementar

- `docs/ARQUITETURA.md`
- `docs/CONFIGURAR_SUPABASE.md`
- `docs/NOTIFICACOES_E_AJUDA.md`
- `docs/PRIVACIDADE_E_SEGURANCA.md`
- `docs/PLANO_DE_TESTES.md`
- `docs/ROADMAP_PRODUCAO.md`
- `docs/RECURSOS_IMPLEMENTADOS.md`
- `docs/AUTENTICACAO_SUPABASE.md`
- `supabase/verify_setup.sql`

## Dados de demonstração

Os recursos ainda locais iniciam com Lucas e Fernanda e alguns registros fictícios para que gráficos, rotina e relatórios possam ser testados enquanto a sincronização completa não é ativada. Em **Mais → Perfil e preferências** existe a opção de restaurar os dados de demonstração.

## Observação sobre segurança

Nunca coloque uma `service_role`, secret key ou segredo privado dentro do aplicativo. O app cliente deve usar somente a chave publicável; operações privilegiadas ficam no servidor/Edge Function.
