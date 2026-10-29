# Trabalho no ecossistema NIB

Leia `docs/ESTADO-ATUAL.md` e `docs/FLUXO-COLABORACAO.md` antes de alterar o projeto. As decisões compartilhadas ficam nesses arquivos; este documento vale para qualquer agente ou desenvolvedor.

- O site principal concentra o ecossistema. Eventos pertencem ao site; inscrições são um módulo vinculado a eventos. Portal NIB é outro sistema e continua em Preview quando a tarefa for do Portal.
- Preserve a identidade aprovada: azul #041e42, marfim, fontes oficiais já presentes, banners e recortes existentes, botões sem ícones salvo instrução específica de Hilton.
- Antes de implementar, confira a branch e o commit de base. Produção pode ter alterações realizadas no cPanel depois do último commit. Nunca substitua a home pelo arquivo do Git sem comparar com a produção.
- Trabalhe em branch própria. Não mova a branch de outro executor, não faça force push e não integre PRs alheios automaticamente.
- Dados de participantes, comprovantes, senhas, tokens, CSVs reais e arquivos de `nib-inscricoes-privado` ficam fora do repositório público. Use exemplos fictícios nos testes.
- Mantenha autenticação geral e proteção das exportações. A importação do Google Forms não implica pagamento nem conferência manual concluída.
- Datas de encerramento, valores e critérios de participação são decisões da organização; não invente regras de negócio.
- Faça backup privado antes de publicar no servidor. Preserve registros existentes e possibilidade de restauração. Publicar depende do escopo autorizado por Hilton na tarefa; uma revisão de PR não autoriza deploy.
- Teste comportamento, além de sintaxe. Para formulários, confira navegação entre etapas, reenvio, mensagens de erro e conclusão com dados fictícios.
- Na entrega, informe arquivos alterados, testes executados e limitações. Não declare contato com outro agente, publicação ou validação que não ocorreu.
