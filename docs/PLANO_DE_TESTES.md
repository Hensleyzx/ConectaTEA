# Plano de testes da V2

## Teste 1 — persistência
1. registrar um novo humor;
2. marcar uma atividade;
3. fechar completamente o app;
4. abrir novamente;
5. confirmar que os dados continuam.

## Teste 2 — humor
1. selecionar cada uma das cinco emoções;
2. variar intensidade;
3. adicionar motivo, tags e necessidade;
4. salvar;
5. conferir no histórico;
6. abrir modo responsável e conferir no painel.

## Teste 3 — rotina
1. criar tarefa;
2. editar horário e emoji;
3. ligar aviso de transição;
4. concluir tarefa;
5. conferir progresso;
6. abrir Primeiro → Depois;
7. excluir tarefa.

## Teste 4 — áudio
1. tocar cada som;
2. trocar de som enquanto outro toca;
3. pausar;
4. alterar volume no perfil sensorial;
5. conferir relatório de tempo de relaxamento.

## Teste 5 — regulação
- respiração em 1, 3 e 5 minutos;
- grounding até o final;
- timer: iniciar, pausar e reiniciar;
- plano de calma: marcar passos e abrir atalhos.

## Teste 6 — comunicação
1. tocar frase pronta;
2. confirmar leitura em voz alta;
3. digitar frase personalizada;
4. testar texto vazio.

## Teste 7 — pedido de ajuda
1. enviar pedido de apoio;
2. enviar urgente usando pressão prolongada;
3. trocar para modo responsável;
4. confirmar “Estou indo / Eu vi”;
5. marcar resolvido;
6. conferir histórico.

## Teste 8 — relatórios
- conferir se novos registros alteram os números;
- conferir dias sem humor;
- conferir rotina vazia;
- conferir dados depois de restaurar demonstração.

## Teste 9 — acessibilidade
- movimento reduzido;
- vibração desligada;
- modo simples;
- textos longos;
- dispositivo com fonte maior;
- tela pequena Android;
- iPhone com notch/safe area.

## Testes obrigatórios para fase Supabase

- sessão expirada;
- internet offline durante gravação;
- reconexão;
- duas edições concorrentes;
- conta não vinculada tentando acessar dados;
- código de vínculo expirado;
- código já utilizado;
- push token inválido;
- notificação negada pelo sistema;
- responsável com dois aparelhos;
- dependente com mais de um responsável autorizado.
