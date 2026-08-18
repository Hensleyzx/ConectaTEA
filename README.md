# ConectaTEA — V2 Completa (base funcional + arquitetura de produção)

Aplicativo mobile criado do zero a partir do conceito do ConectaTEA: apoiar organização de rotina, comunicação de emoções, autorregulação e pedido de apoio entre dependente e responsável.

> **Escopo responsável:** o ConectaTEA é uma ferramenta de organização, comunicação e apoio. Não realiza diagnóstico, não classifica a pessoa e não substitui atendimento profissional ou serviço de emergência.

## O que funciona nesta V2 sem servidor

A V2 foi construída como **local-first** para ser testável antes de existir um backend:

- Fluxo de abertura, escolha de perfil, login/cadastro demonstrativo.
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

## Coisas avançadas já preparadas

Além da interface, o repositório contém uma base de produção:

- `supabase/schema.sql`: banco PostgreSQL completo com Auth, vínculos, humores, rotinas, conclusões, pedidos de ajuda, sessões de relaxamento, dispositivos e cartões de comunicação.
- Políticas **Row Level Security (RLS)** para separar dados de usuários e permitir leitura somente entre contas vinculadas.
- Código de vínculo temporário com hash no servidor, em vez de armazenar o código em texto puro.
- `src/services/supabase.ts`: cliente Supabase preparado para receber URL e publishable key via `.env`.
- `src/services/notifications.ts`: registro de Expo Push Token, canais de notificação e chamada da Edge Function.
- `supabase/functions/send-help-notification/index.ts`: Edge Function para enviar o pedido de ajuda aos dispositivos dos responsáveis vinculados.
- `eas.json`: perfil de build `preview` preparado para gerar APK de teste.

## O que ainda precisa de credenciais/serviços externos

Estas partes **não podem funcionar entre dois celulares sem configurar os serviços reais**:

1. autenticação real no Supabase;
2. sincronização dos dados locais com o banco;
3. vínculo real entre duas contas em aparelhos diferentes;
4. registro do push token do aparelho do responsável;
5. envio remoto de push notification;
6. recuperação de senha/e-mail;
7. build assinado e publicação em loja.

A estrutura para essas etapas já acompanha o projeto, mas a V2 não inventa credenciais nem finge que existe um servidor configurado.

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
ConectaTEA_V2_COMPLETO/
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

## Dados de demonstração

O app inicia com Lucas e Fernanda e alguns registros fictícios para que os gráficos, rotina e relatórios possam ser testados de imediato. Em **Mais → Perfil e preferências** existe a opção de restaurar os dados de demonstração.

## Observação sobre segurança

Nunca coloque uma `service_role`, secret key ou segredo privado dentro do aplicativo. O app cliente deve usar somente a chave publicável; operações privilegiadas ficam no servidor/Edge Function.
