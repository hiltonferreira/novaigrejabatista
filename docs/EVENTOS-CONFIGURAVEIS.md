# Eventos configuráveis — proposta 5.0

Implementação para novos eventos, sem migração de Mulheres, NXT ou DNA. A home da raiz não faz parte do deploy. Publicação pelo painel continua atualizando somente o bloco gerenciado com backup privado e comparação da home. O novo carregador acrescenta botão na hero e card de novos eventos sem substituir os institucionais.

## Formulário
Nome, WhatsApp e consentimento continuam obrigatórios. Nascimento, responsável e saúde usam os controles existentes. Perguntas próprias permitem texto curto/longo, número, data, seleção única, múltipla seleção e confirmação. Até 30 perguntas, até 50 opções por pergunta, com ativação, obrigatoriedade, orientação, ordem e destaque no resumo. Cada inscrição guarda `answers` e `form_schema`, preservando rótulos e respostas históricas. CSV usa união dos IDs históricos e protege fórmulas. Remover pergunta no editor não reescreve inscrições anteriores.

Sugestões: encontro, evento pago, acampamento, curso com turmas, informativo. São atalhos editáveis; turmas sugeridas devem ser revisadas antes de publicar. Upload personalizado fica fora desta primeira versão: permanece apenas o comprovante, com sua validação existente.

## Divulgação e encerramento
Controles independentes para hero, carrossel e seção Eventos, com opção de retirar cada um ao encerrar inscrições. Encerramento manual ou pela data não apaga página nem registros. Sem retirada, a divulgação muda para inscrições encerradas. Só um novo evento publicado pode ocupar a hero: conflito é recusado com mensagem, sem substituir outro evento silenciosamente. Não muda os destaques legados.

A home é estática. O carregador consulta `/eventos/divulgacao.php` sem cache na abertura e a cada minuto, e ao retornar à aba. O prazo é calculado no servidor; sem JavaScript ou com falha de rede, a retirada visual automática não é garantida. A página do formulário sempre bloqueia inscrição no servidor. Rascunhos não são retornados pelo endpoint; dados privados, Pix e respostas não são expostos nele.

## Operação e limites
Instalar os novos arquivos junto dos PHP alterados e do JS do carrossel, após comparar versões de produção. Fazer backup privado antes de qualquer deploy. Não substituir `index.html` do servidor pela cópia do Git. Eventos novos já publicados antes desta versão precisam ser salvos uma vez para marcar seus slides e instalar o carregador. Rascunhos são listados separadamente de ativos. Eventos gratuitos não têm aba financeira nem métricas monetárias.

Alterar o cadastro durante um preenchimento continua exigindo recarga pela verificação de revisão existente. Dados digitados são reapresentados; arquivo precisa ser selecionado novamente. Permanece a capacidade e a lixeira atuais. Não foi feita conciliação bancária, conexão Sipag ou migração dos eventos existentes.

## Validação
Workflow de PR sem segredos: sintaxe PHP/JS e testes com catálogo, arquivos e home fictícios em pasta temporária. Testes de navegador e envio HTTP real são necessários antes de produção, especialmente pagamentos, CSV, campos personalizados, múltipla escolha e hero/carrossel em celular. O fluxo de publicação de um evento livre/pago completo não deve ser declarado validado somente pelos testes de funções.

## Como experimentar localmente (rascunho)

Com Git e PHP 8.3+ disponíveis, faça um clone separado da branch `codex/eventos-configuraveis-5-0` e execute `php tests/preview.php`. O script aceita somente CLI, prepara uma cópia temporária dos arquivos públicos e um armazenamento privado fictício, depois abre um servidor preso a `127.0.0.1:8088`. Não lê credenciais, catálogo ou registros do cPanel. Não instalar `tests/` no servidor de produção.

Acesse `http://127.0.0.1:8088/inscricoes/`, senha de demonstração `NIB-TESTE-LOCAL-2026`. Use os dois eventos DEMONSTRAÇÃO (pago e gratuito), sem efetuar Pix, ou crie um novo. O cartão do evento pago usa chave explicitamente fictícia. Os três cartões legados podem aparecer indisponíveis porque não importamos seus dados. Para encerrar use Ctrl+C; uma nova execução cria outra cópia temporária, preservando a anterior.

Roteiro: adicionar pergunta obrigatória, selecionar turmas, ordenar, abrir prévia, publicar o evento fictício, preencher o formulário público, conferir dados no painel, testar seleção de superfícies e encerramento. Os bloqueadores documentados no PR #8 continuam pendentes: isto é uma prévia de avaliação, não uma versão pronta para produção.
