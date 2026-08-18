# Recursos implementados na V2

## Dependente

### Início
- resumo do humor mais recente;
- progresso da rotina;
- próxima atividade;
- atalhos para regulação, comunicação, timer e ajuda.

### Emoções
- cinco estados visuais;
- intensidade de 1 a 5;
- texto livre do motivo;
- marcadores de contexto;
- necessidade de apoio;
- histórico cronológico.

### Rotina
- atividades com horário e ícone;
- conclusão diária;
- criação, edição e exclusão;
- lembrete configurável;
- aviso de transição;
- progresso do dia;
- quadro **Primeiro → Depois** com os próximos dois passos.

### Relaxar e autorregulação
- seis faixas de áudio locais;
- volume padrão configurável;
- respiração guiada;
- grounding 5-4-3-2-1;
- timer visual;
- registro de duração das sessões;
- plano de calma usando preferências do próprio usuário.

### Comunicação
- cartões de frases rápidas;
- leitura da frase em voz alta;
- campo para frase personalizada;
- frases úteis quando a fala estiver difícil.

### Pedido de ajuda
- pedido de apoio;
- pedido urgente;
- mensagem pronta ou personalizada;
- pressão prolongada para reduzir acionamento urgente acidental;
- status aberto, reconhecido e resolvido.

## Responsável

- visão do dependente vinculado;
- último humor e motivo;
- rotina do dia;
- lista de pedidos de ajuda;
- confirmação “Estou indo / Eu vi”;
- resolução do pedido;
- histórico semanal de humor;
- contextos mais recorrentes;
- percentual de rotina concluída por dia;
- tempo registrado em ferramentas de relaxamento;
- insights apenas descritivos.

## Acessibilidade e personalização

- modo simples;
- preferência de movimento reduzido;
- feedback háptico desligável;
- volume padrão;
- controles grandes previstos no estado;
- alto contraste previsto no estado;
- ferramentas calmantes preferidas;
- gatilhos/estímulos a evitar;
- textos simples e cards grandes.

## Base técnica

- React Native + Expo + TypeScript;
- estado local persistente;
- áudios embarcados;
- schema Supabase com RLS;
- cliente Supabase preparado;
- Edge Function de push preparada;
- EAS build profile para APK de teste.
