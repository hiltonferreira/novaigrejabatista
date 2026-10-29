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

Preparada nesta proposta, ainda NÃO ativada. Exige integrar o workflow à branch principal, instalar o Claude GitHub App no repositório e configurar uma credencial em GitHub Actions Secrets. Depois é obrigatório um teste com mensagem enviada e resposta recebida.

Detalhes: `docs/integracoes/CLAUDE-GITHUB.md`.
