# Linha de trabalho NIB

## Entrada e coordenação

Hilton informa a necessidade no chat de coordenação com Codex. O coordenador verifica escopo, versão atual e documentação, escolhe o executor conforme a tarefa e registra o resultado esperado no GitHub.

Cada demanda precisa de: objetivo, critérios de aceite, branch e commit de base, arquivos ou módulos envolvidos, responsável, revisor e situação. Situações: recebida, em análise, pronta para execução, em desenvolvimento, em revisão, em validação, concluída ou bloqueada.

## Execução

1. Confira se há alterações de produção que ainda não estão no Git.
2. Abra uma branch por tarefa, separada das branches dos outros executores.
3. Implemente e teste com dados fictícios.
4. Abra PR com problema, comportamento final, testes e limitações.
5. O outro executor revisa e responde no mesmo PR. A conclusão do agente deve ser verificada, não apenas repetida.
6. Corrija divergências e valide no ambiente adequado.
7. Publique somente quando isso estiver no escopo autorizado; faça backup antes e confira o resultado depois.
8. Atualize o estado atual e as decisões no repositório.

## Comunicação inicial Codex ↔ Claude

Canal proposto: comentários GitHub no mesmo PR ou issue, iniciados pelo coordenador com `@claude /nib `.

Apenas comentários novos do proprietário `hiltonferreira` disparam o workflow. Respostas do Claude não disparam outro ciclo. Não há agenda, polling em segundo plano ou conversa infinita. O Codex acompanha a discussão enquanto executa a tarefa no chat; retorno fora de uma execução ativa exige agendamento ou serviço adicional.

A primeira integração é somente análise e resposta; não publica no cPanel e não recebe dados privados de participantes. O workflow usa autenticação oficial do Claude. Ele não lê automaticamente o histórico do projeto Claude web e não permite que Claude escreva diretamente nesta conversa do ChatGPT: o coordenador consulta as respostas e as apresenta aqui.

## Estado da integração

Integração ativa e validada. O exemplo histórico permanece em `docs/integracoes/claude-nib.yml.example`; a configuração executável atual é `.github/workflows/claude.yml`. Detalhes e evidências abaixo.


## Integração validada — 29/10/2026

- Workflow ativo: `.github/workflows/claude.yml`, instalado no PR #3 e corrigido nos PRs #4 e #5.
- Autenticação: assinatura Claude por `CLAUDE_CODE_OAUTH_TOKEN`, configurado pelo instalador oficial. Nenhum valor de credencial foi incluído no repositório.
- Acionamento: somente comentário novo do proprietário `hiltonferreira` iniciado por `@claude /nib `. A ação usa internamente a menção padrão `@claude`; o filtro do job mantém a restrição NIB.
- Limites: 10 minutos e 12 turnos; primeira etapa apenas análise e resposta. Sem deploy ou acesso ao cPanel por este canal.
- Teste final: https://github.com/hiltonferreira/novaigrejabatista/actions/runs/40821765561 — job e todas as etapas concluídos com sucesso.
- Resposta verificada de `claude[bot]`: https://github.com/hiltonferreira/novaigrejabatista/pull/5#issuecomment-6488525847 — `NIB-CONEXAO-OK-FINAL`; confirmou main `35eaf82d0b9edeb905590b0c5a0a3f6ef7d63f58` e leitura de AGENTS.md, CLAUDE.md, docs/ESTADO-ATUAL.md e docs/FLUXO-COLABORACAO.md.
- O primeiro teste não reconheceu o gatilho personalizado. O segundo publicou resposta, mas excedeu 6 turnos (9 contabilizados). Ambos foram corrigidos antes do teste final bem-sucedido.
- Esta conexão executa Claude no GitHub Actions. Não reutiliza a memória da sessão web e não envia mensagens diretamente ao ChatGPT. Codex consulta a resposta durante a tarefa e a apresenta neste chat. Não há acompanhamento permanente em segundo plano.
