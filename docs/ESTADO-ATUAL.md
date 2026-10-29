# Estado verificado — 29/10/2026

## Sistemas

- Produção: https://novaigrejabatista.com.br/ — hospedagem cPanel, HTML/CSS/JS e PHP.
- Painel: `/inscricoes/`, autenticação geral para todos os eventos, consulta pública em `/consulta-inscricao/`.
- Eventos: Mulheres Virtuosas, Jornada DNA e NXT CAMP. NXT já está lançado e publicado; a restrição antiga de não exibir na home foi superada.
- NXT: página `/next/camp-sbgp1-nov26/`; compartilhamento `/nxt-camp/`.
- Portal: sistema separado em Vercel Preview; não confundir com o painel PHP de inscrições.

## Alterações em produção posteriores à sincronização de 21/10

1. `inscricoes/index.php`: registros importados da Jornada DNA passam a aparecer no painel; detalhes e CSV preservam os campos de origem. Resumo por turma; turma também abaixo do telefone no bloco do participante.
2. `index.html`: carrossel, seção e card da Jornada DNA indicam inscrições encerradas; links de inscrição da DNA na home foram retirados ou substituídos por navegação institucional. Botão da Jornada removido da hero principal.

Conteúdo dos dois arquivos desta proposta conferido por SHA-256 com o servidor:

- `index.html`: `489da079386def5a708706ac765452ed90aebdbe467dafc73a4e9fb4b6934f0d`
- `inscricoes/index.php`: `d758d1c8c6a92a6f86b3ea1e92b1ffe6dc4ad64820fd222c1b7a78372d39b96f`

A integração da DNA depende dos registros e metadados privados existentes no servidor. Esses dados não são incluídos neste repositório nem criados ao clonar o código. O Google Forms não foi fechado por esta integração. A importação não é sincronização automática contínua. O futuro formulário nativo da próxima edição ainda é trabalho posterior.

## Revisão do PR #1

Base: `6972c5c6a6264d20abf68cba57c131c060387030`.
Head analisado: `1c88531a9b77e61e03b4596b1ef7a7227797ebf8`.

- Bloqueador reproduzido: `checkOpen` é declarada dentro de `go()` e chamada pelo handler de avanço fora desse escopo; o formulário não avança e informa `checkOpen is not defined`.
- `requestId` e `newRequestId` também ficam dentro de `go()`; há referência fora do escopo no sucesso e geração de novos inputs a cada navegação. A chave de reenvio deve ser estável durante a mesma inscrição.
- A home do PR ainda contém o link externo da DNA no carrossel, sem a regra `data-expira` aplicada em outros pontos. Reconciliar com a versão atual de produção.
- Datas fixas nas APIs de Mulheres e NXT foram propostas pelo executor e precisam de validação de negócio antes de publicar.
- Melhorias úteis propostas: validar nascimento e idade no servidor, exigir consentimento e consolidar painéis antigos. Ainda não publicadas.

## Correção entregue e revisão independente

O Claude entregou a correção de escopo em `c4fb08e218d725de9c14557eb0fb4dca3f40a15a`, alterando o JS e apenas o cache (`v=11.2`) na página do formulário. A resposta de revisão e os testes relatados estão no PR #1.

O Codex verificou a sintaxe e executou uma simulação JS independente com DOM e API fictícios: avanço ao Pix; uma única chave estável ao voltar/avançar; sucesso com protocolo sem mensagem de erro; renovação da chave após sucesso; bloqueio no passo 1 ao receber HTTP 410. Esses testes não verificam upload real nem armazenamento PHP. O Claude relatou separadamente testes Playwright/Chromium com `php -S`, dados fictícios, upload, persistência e reenvio, com suas limitações registradas nos comentários do PR.

A correção de escopo foi confirmada. O PR #1 completo continua pendente de reconciliação da home com a produção e validação dos horários de encerramento. Não foi integrado nem publicado.

## Comunicação entre executores

A integração automática foi ativada e validada. Veja evidências e limites abaixo.


## Integração validada — 29/10/2026

- Workflow ativo: `.github/workflows/claude.yml`, instalado no PR #3 e corrigido nos PRs #4 e #5.
- Autenticação: assinatura Claude por `CLAUDE_CODE_OAUTH_TOKEN`, configurado pelo instalador oficial. Nenhum valor de credencial foi incluído no repositório.
- Acionamento: somente comentário novo do proprietário `hiltonferreira` iniciado por `@claude /nib `. A ação usa internamente a menção padrão `@claude`; o filtro do job mantém a restrição NIB.
- Limites: 10 minutos e 12 turnos; primeira etapa apenas análise e resposta. Sem deploy ou acesso ao cPanel por este canal.
- Teste final: https://github.com/hiltonferreira/novaigrejabatista/actions/runs/40821765561 — job e todas as etapas concluídos com sucesso.
- Resposta verificada de `claude[bot]`: https://github.com/hiltonferreira/novaigrejabatista/pull/5#issuecomment-6488525847 — `NIB-CONEXAO-OK-FINAL`; confirmou main `35eaf82d0b9edeb905590b0c5a0a3f6ef7d63f58` e leitura de AGENTS.md, CLAUDE.md, docs/ESTADO-ATUAL.md e docs/FLUXO-COLABORACAO.md.
- O primeiro teste não reconheceu o gatilho personalizado. O segundo publicou resposta, mas excedeu 6 turnos (9 contabilizados). Ambos foram corrigidos antes do teste final bem-sucedido.
- Esta conexão executa Claude no GitHub Actions. Não reutiliza a memória da sessão web e não envia mensagens diretamente ao ChatGPT. Codex consulta a resposta durante a tarefa e a apresenta neste chat. Não há acompanhamento permanente em segundo plano.
