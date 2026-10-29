# Ativação da comunicação com Claude no GitHub

## O que está preparado

Modelo `docs/integracoes/claude-nib.yml.example`, que só será um workflow ao ser instalado em `.github/workflows/claude-nib.yml`, usando `anthropics/claude-code-action@v1`. Recebe comentários novos de `hiltonferreira` iniciados por `@claude /nib ` e solicita resposta em português no mesmo PR/issue. Execução limitada a 10 minutos e 6 turnos. Não há deploy, acesso ao cPanel, segredos de produção ou envio de dados de inscritos.

O arquivo está guardado como exemplo de configuração, fora de `.github/workflows/`. Ele não executa no GitHub Actions e não representa uma conexão automática em funcionamento. A primeira troca de revisão foi registrada nos comentários do PR #1 por uma sessão Claude Code já existente, não por este workflow.

## Autenticação — escolha uma rota

- **Assinatura Claude:** em Claude Code local, execute `claude setup-token` e salve o token apenas como secret `CLAUDE_CODE_OAUTH_TOKEN` no GitHub. Não cole o token em chats, commits, issues ou PRs.
- **API:** salve a chave da Anthropic apenas como secret `ANTHROPIC_API_KEY` no GitHub. Execuções usam o consumo da API; configure limites na conta antes de ativar.

Se houver as duas credenciais, o workflow prioriza a API. Para usar exclusivamente a assinatura, mantenha somente o secret de OAuth.

O uso com assinatura ou API e a instalação do App são configurações da conta de Hilton. O coordenador não deve afirmar que elas existem antes de confirmar uma execução bem-sucedida.

## Instalação oficial

Documentação: https://code.claude.com/docs/en/github-actions

A configuração guiada oficial é `/install-github-app` no Claude Code local. Ela pode gerar outro PR de workflow; compare-o com este para não criar duas automações que respondam à mesma menção.

Alternativamente, siga a configuração manual oficial: instalar o Claude GitHub App apenas no repositório necessário, cadastrar a credencial em Settings → Secrets and variables → Actions e copiar o modelo revisado para `.github/workflows/claude-nib.yml` em uma tarefa de ativação separada.

## Teste de aceite

1. Com a instalação concluída, o coordenador posta `@claude /nib Responda NIB-CONEXAO-OK e informe o commit analisado. Não altere arquivos.` em um PR.
2. Confirmar que o workflow executou e que uma resposta foi publicada. Apenas postar a mensagem não comprova comunicação.
3. Conferir o autor e conteúdo da resposta.
4. Codex devolve o resultado no chat de coordenação.

Depois do teste, enviar a revisão do PR #1 e confrontar a resposta com a reprodução do erro do formulário.

## Limitações

A ação GitHub é uma execução do Claude com o contexto do repositório e da discussão, não a sessão web anterior. Não há sincronização automática da memória entre os produtos. Mensagens/arquivos públicos não podem conter dados pessoais dos inscritos. O responsável pode desativar o workflow e revogar App/credencial nas configurações das contas.

## Contexto de revisão

O checkout de main preserva instruções confiáveis. Em uma revisão, consultar o SHA atual do head do PR e seus arquivos/diff explicitamente pela API GitHub; informar base e head na resposta. Não executar código da branch revisada com credenciais. A cópia de main não representa automaticamente o código do PR.
