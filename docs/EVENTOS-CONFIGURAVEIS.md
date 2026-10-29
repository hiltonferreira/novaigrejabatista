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

## Controles visuais compartilhados (5.1)

`assets/controles-nib.css` reutiliza azul #041e42 e marfim #f5f3eb, preservando a fonte herdada de cada página. Aplicado ao painel, gestão, consulta e formulários nativo, Mulheres e NXT. Campos têm raio de 8 px; botões de formulário mantêm o formato arredondado aprovado; checkboxes usam marca clara no azul, foco visível e alternativa nativa em alto contraste. O editor agrupa as opções de campo e divulgação com bordas finas e seleção em marfim. A alteração não modifica regras, textos dos eventos, menus ou registros. Validar visualmente desktop/mobile e navegação por teclado na prévia; ainda não publicado em produção.

## Página pública de novos eventos (5.2)

O template segue a composição dos formulários existentes: fundo marfim, banner e informações à esquerda, formulário sem cartão branco à direita, cabeçalho público compartilhado e botão de consulta. Fonte Acumin local, títulos bold e demais destaques semibold, botões arredondados e resumo em duas colunas no mobile. Mensagem de prévia tem apresentação informativa, sem parecer erro. O banner fictício da prévia agora é visível e identificado; não substitui banners aprovados. Esta mudança não altera etapas, validação, pagamento, disponibilidade nem formulários legados.

## Comparação com eventos reais (5.3)

Medições no navegador de produção confirmaram diferenças entre os próprios legados: Mulheres usa system-ui no desktop e Acumin no mobile; NXT usa Manrope e ainda tem legendas Montserrat 800. A página nova adota a referência consolidada de Mulheres: system-ui no desktop, Acumin no mobile, resumo em duas colunas, legendas semibold e campos de 52 px. Não afirma identidade tipográfica total com o NXT. Os títulos são o texto cadastrado; não há recorte automático do nome em um destaque em itálico.

A prévia administrativa agora mostra os campos desativados e não aceita envios. Nos eventos pagos publicados, JS progressivo divide Dados, Pagamento e Comprovante, valida cada etapa e mantém os valores ao voltar; sem JS todos os campos ficam visíveis com validação nativa. O servidor continua responsável pela validação final e disponibilidade.

O retorno NXT estava com padding horizontal zero por declarações antigas `!important`. Foram removidas as regras antigas `.back-site` do CSS NXT, deixando o cabeçalho compartilhado controlar o botão e evitando novos `!important`. Destino, texto, conteúdo e regras do evento permanecem preservados. A prévia copia também páginas públicas legadas para comparação, sem dados privados. Produção não foi atualizada por este PR.

Revisão independente do Claude confirmou a causa do botão e recomendou remover as declarações antigas. Em erros de POST, todas as etapas ficam visíveis e a mensagem recebe foco; a opção de consentimento é preservada. Arquivos de comprovante precisam ser selecionados novamente por limitação do navegador.

## Seleções compartilhadas (5.4)

Caixas de marcar, radios e listas de seleção usam o mesmo CSS no painel, consulta e formulários. Bordas #7d8896, raio 8 px nos selects, indicador azul, fundo branco, seleção marfim e foco visível. Mantêm controles HTML nativos, teclado e suporte de alto contraste; o menu aberto pode seguir a apresentação do sistema operacional. Regras antigas do NXT que aplicavam altura de campo de texto em qualquer input agora excluem checkbox e radio. Cache atualizado nos seis pontos de entrada. Sem alteração de opções, valores, dados ou regras de inscrição.

## Ajuste de checkbox (5.5)

O consentimento do NXT ainda podia receber altura e padding das regras legadas. As caixas de marcar e radios têm agora limites explícitos de 22 × 22 px na folha compartilhada, incluindo mínimos, máximos e flex-basis; o consentimento alinha pela primeira linha. Nenhum conteúdo ou opção foi alterado. Corrigido também o achado do Claude: Enter no primeiro passo pago avança somente ao Pix, sem saltar para o comprovante; cenário incluído no teste de etapas.
