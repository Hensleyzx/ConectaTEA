# Privacidade e segurança — checklist de produto

O ConectaTEA pode armazenar informações pessoais e emocionais. Por isso, segurança precisa ser requisito de arquitetura, não apenas uma tela de “privacidade”.

## Princípios adotados no projeto

- coletar apenas o necessário;
- mostrar ao dependente o que está sendo registrado;
- evitar linguagem de diagnóstico;
- evitar ranking de emoções;
- não classificar dias como “bons” ou “ruins”;
- responsáveis só acessam dependentes vinculados;
- códigos de vínculo expiram e são armazenados como hash na proposta online;
- secrets ficam no servidor;
- RLS protege as tabelas no banco;
- push notification deve expor o mínimo possível na tela bloqueada.

## Antes de produção

- política de privacidade revisada por profissional qualificado;
- termos adequados à faixa etária e ao contexto de uso;
- consentimento e regras claras para responsáveis/dependentes;
- fluxo para exportar dados;
- fluxo para excluir conta e dados;
- auditoria de RLS;
- revisão de logs para não registrar textos sensíveis desnecessariamente;
- criptografia e backups configurados no provedor;
- plano de resposta a incidentes;
- análise das obrigações legais aplicáveis no país e ao público-alvo.

## Não incluído por padrão

A V2 não coleta localização, contatos, microfone, câmera ou biometria. Se algum desses recursos for adicionado no futuro, deve existir justificativa clara, permissão explícita e alternativa para quem não quiser habilitá-lo.
