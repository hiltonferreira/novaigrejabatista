# Comunicação com Claude no GitHub

A instalação oficial foi concluída pela conta de Hilton. A configuração ativa está em `.github/workflows/claude.yml`. O arquivo `.example` registra a proposta inicial e não é a fonte da configuração atual.

Para novas demandas, o coordenador publica um comentário iniciado pelo prefixo autorizado no PR ou issue apropriado, verifica a execução e lê a resposta. Não basta postar uma mensagem para declarar sucesso.

Em revisões, consultar explicitamente o head e o diff do PR pela API; checkout da main fornece as instruções confiáveis. Não executar código do PR com credenciais. Dados privados de inscritos e segredos ficam fora desse canal público.


## Integração validada — 29/10/2026

- Workflow ativo: `.github/workflows/claude.yml`, instalado no PR #3 e corrigido nos PRs #4 e #5.
- Autenticação: assinatura Claude por `CLAUDE_CODE_OAUTH_TOKEN`, configurado pelo instalador oficial. Nenhum valor de credencial foi incluído no repositório.
- Acionamento: somente comentário novo do proprietário `hiltonferreira` iniciado por `@claude /nib `. A ação usa internamente a menção padrão `@claude`; o filtro do job mantém a restrição NIB.
- Limites: 10 minutos e 12 turnos; primeira etapa apenas análise e resposta. Sem deploy ou acesso ao cPanel por este canal.
- Teste final: https://github.com/hiltonferreira/novaigrejabatista/actions/runs/40821765561 — job e todas as etapas concluídos com sucesso.
- Resposta verificada de `claude[bot]`: https://github.com/hiltonferreira/novaigrejabatista/pull/5#issuecomment-6488525847 — `NIB-CONEXAO-OK-FINAL`; confirmou main `35eaf82d0b9edeb905590b0c5a0a3f6ef7d63f58` e leitura de AGENTS.md, CLAUDE.md, docs/ESTADO-ATUAL.md e docs/FLUXO-COLABORACAO.md.
- O primeiro teste não reconheceu o gatilho personalizado. O segundo publicou resposta, mas excedeu 6 turnos (9 contabilizados). Ambos foram corrigidos antes do teste final bem-sucedido.
- Esta conexão executa Claude no GitHub Actions. Não reutiliza a memória da sessão web e não envia mensagens diretamente ao ChatGPT. Codex consulta a resposta durante a tarefa e a apresenta neste chat. Não há acompanhamento permanente em segundo plano.
