# ConectaTEA V6 — Site + Supabase

Versão web do ConectaTEA com autenticação, banco de dados real e vínculo entre a conta do dependente com TEA e a conta do responsável.

## O que funciona

- Cadastro e login reais com Supabase Auth.
- Dois tipos de conta: **Dependente** e **Responsável**.
- O tipo da conta fica bloqueado depois do cadastro.
- Conta nova começa sem vínculo e sem dados fictícios.
- Dependente gera um código temporário `TEA-XXXXXXXX`.
- Responsável usa o código e o Supabase cria o vínculo real.
- Um responsável só consegue consultar o dependente realmente vinculado.
- Registro de emoções e histórico.
- Rotina com atividades e conclusão diária.
- Pedidos de ajuda com níveis normal/urgente.
- Responsável pode marcar pedido como “Eu vi” e “Resolvido”.
- Ferramentas locais: respiração guiada, grounding 5-4-3-2-1, timer visual e comunicação por voz.
- Atualização automática aproximadamente a cada 15 segundos + botão manual de atualizar.
- Site responsivo para celular e computador.
- Publicação preparada para GitHub Pages.

## Banco de dados e segurança

O arquivo `supabase/setup_v6.sql` cria do zero somente as estruturas públicas do ConectaTEA:

- `profiles`
- `connections`
- `pairing_codes`
- `mood_entries`
- `routine_items`
- `routine_completions`
- `help_requests`

Ele também configura triggers, funções de vínculo e políticas **RLS (Row Level Security)**.

### Atenção ao executar o SQL

O `setup_v6.sql` apaga os dados das versões antigas do ConectaTEA nas tabelas públicas para evitar conflito. **As contas existentes no Supabase Authentication são preservadas** e os perfis são recriados a partir dos metadados das contas.

Para um projeto/TCC que ainda está em testes, isso deixa o banco limpo e evita carregar vínculos antigos ou dados demonstrativos.

## Configuração

1. Abra o projeto Supabase usado pelo ConectaTEA.
2. Vá em **SQL Editor > New query**.
3. Copie todo o arquivo `supabase/setup_v6.sql` e clique em **Run**.
4. Em **Authentication > Providers**, mantenha **Email** ativado.
5. Para facilitar a apresentação do TCC, você pode desativar a confirmação obrigatória de e-mail. Se mantiver ligada, o site também trata esse fluxo.
6. As credenciais públicas do projeto já estão em `config.js`. Use apenas URL + **Publishable Key** no navegador; nunca coloque `service_role` no site.

## Teste correto

1. Crie uma conta como **Dependente**.
2. Entre em **Mais > Vincular responsável > Gerar código**.
3. Abra outro navegador/perfil/anônimo e crie uma conta como **Responsável**.
4. Entre em **Mais > Vincular dependente**, digite o código e confirme.
5. No dependente, registre um humor, uma atividade e um pedido de ajuda.
6. No responsável, toque em **Atualizar** ou aguarde até 15 segundos e confira os dados.

> Para testar duas contas no mesmo computador, use navegadores diferentes ou uma janela anônima. Duas abas normais compartilham a mesma sessão de autenticação.

## Publicar no GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` está incluído. Depois de enviar os arquivos ao repositório, deixe **Settings > Pages > Source** em **GitHub Actions**.

## Escopo acadêmico

O ConectaTEA é uma ferramenta de apoio à organização, comunicação e acompanhamento. Não realiza diagnóstico de TEA, não substitui profissionais de saúde e não deve ser utilizado como serviço de emergência.
