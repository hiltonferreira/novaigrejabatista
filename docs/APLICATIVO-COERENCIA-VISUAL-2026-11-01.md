# Correção visual com base nas telas fornecidas por Hilton

O primeiro Preview não foi validado visualmente. Hilton apontou largura limitada, proporções, espaçamento e tipografia diferentes do painel. Em 01/11 também forneceu o formulário NXT como base para campos. A referência inicial de fundo marfim foi posteriormente substituída por fundo claro uniforme a pedido de Hilton.

## Correção aplicada na branch de teste

- Copiados sem alteração os estilos oficiais do painel, navegação, refino/layout mobile e resumos para assets/*-base.css. Um teste compara os arquivos com os originais.
- Cabeçalho direto no body, 78px, logo e separador do painel; sem faixa demonstrativa permanente no topo. Seletor fica em Versão de teste, com aviso de dados fictícios e ausência de autenticação real.
- Largura total da janela, lateral 253px e conteúdo central máximo 1380px com os mesmos recuos de 38px; sidebar acompanha altura da janela e recolhe.
- Mesma tipografia desktop da base oficial (system-ui), com arquivos específicos Acumin 400/500/600/700 no mobile. Eliminado o mapeamento incorreto de um único arquivo Bold para pesos 600–800.
- Navegação com ícones reaproveitados do painel, ações sem ícones, cartões de eventos com banners públicos existentes e estados ilustrativos. Não copiados totais ou dados privados da captura de tela.
- Formulários com campos brancos e fundo claro uniforme #f4f6f8; referência NXT preservada nos controles. Regras de integração não alteradas.
- Contraste das adaptações, foco e controles preservados; ajuste visual não modifica produção.

## Limites

Catálogo de eventos estático para demonstrar layout, não integração em tempo real. Estados conhecidos em 01/11/2026; não usar para inscrição real. Dados pessoais fictícios e estado somente em memória. CSS é snapshot explícito da base, não sincronização contínua. Mudanças futuras do painel exigem reconciliação.

Responsável Codex; revisão Claude pelo PR #12; validação visual Hilton. O ajuste do botão do NXT é demanda separada, em branch própria, sem alterar formulário de produção por este PR.


## Conferência final

27 verificações passaram: 25 pares de contraste, aplicação dos tokens nos campos e comparação byte a byte de cinco CSS com o painel. Navegador confirmou header78px, lateral253px, largura sem limite de1560px, menu recolhível, navegação móvel e botões primários azuis. Textos secundários sobre o fundo claro:5,80:1; contorno do recolhimento:8,82:1. Não é auditoria completa de todo CSS herdado.

Claude publicou revisão parcial do checkout df364a1 (não executou testes nem confirmou SHAs pela API). Codex corrigiu os pontos confirmados: fonte Black800 local, retirada de Meu cadastro fictício da gestão e contorno/hover do recolhimento. Revisão está no PR#12. Testes são de código/cores, não aprovação visual de Hilton.

## Refinamento solicitado por Hilton — inicial e catálogo

Base remota: `633dc9be3fea4fb3fc0a7db91bcde32b9e63263a`, mesma branch/PR #12. Codex implementa; Claude revisa pelo workflow GitHub. Somente `aplicativo/`, sem publicação no cPanel ou dados reais.

- Inicial prioriza cinco atalhos com explicação: cadastro, eventos/inscrições, contribuições, células e programação/avisos. Texto: “Olá, Ana. Como você quer participar hoje?”; subtítulo orienta as ações disponíveis.
- Eventos ficam em cartões compactos na inicial, com acesso ao catálogo completo.
- Fundo de todas as telas passa a `#f4f6f8`, inclusive cadastro e apresentação; o marfim permanece apenas nos estados já aprovados de navegação/hover.
- Banner Mulheres reutiliza a classe e o recorte exato do painel original: proporção 1199/600 e imagem 133,36113428% deslocada -16,68056714%. Miniaturas mantêm o mesmo recorte.
- Imagens de eventos encerrados recebem escala de cinza e opacidade 48%; rótulo “Encerrado”, textos e ações permanecem legíveis, sem reduzir sua opacidade.
- Verificação: sintaxe JS e 27 testes de contraste/base visual passaram. Conferência de navegador registra atalhos, catálogo e fundos. Nenhuma integração real foi ativada.


## Ajustes finos — navegação, cadastro e Generosidade

Base `5e667af89d4348857d4becdbdda4f451e77439ee`; Codex implementa, Claude revisa no PR #12; Hilton valida em Preview.

- Eventos ativos primeiro em ambos os catálogos; banner acima do conteúdo nos cards da inicial, sem miniatura isolada. Tags sólidas/contornadas destacam status sem depender só da cor; textos e botões não ficam apagados. Hover/pressionamento azul #041e42 com letras brancas.
- Corrigida hierarquia h3 dos eventos na seção inicial, nomes acessíveis das ações e removidas regras conflitantes de miniaturas, conforme revisão anterior de Claude.
- Cabeçalhos, recuos e fundos compartilhados; quebras naturais com balance/pretty, sem largura estreita artificial no subtítulo. Gutter de rolagem estável evita deslocamento horizontal ao alternar telas.
- Cadastro organiza nome, novo e-mail, telefone e endereço em campos opcionais, com e-mail de retorno obrigatório, observações, limpar e envio de solicitação. Exige ao menos uma mudança ou observação. Solicitação só em memória e visível na gestão; não altera o cadastro imediatamente.
- Generosidade reutiliza dados públicos do site: Nova Igreja Batista, Ariquemes/RO, CNPJ 40.518.758/0001-30, Sicoob, agência3315/conta51.404-7 e arquivo original img/pix-qrcode.png. Não inventar chave ou QR. Aviso explícito: são dados reais, não realizar transferências no teste. Valor simulado não modifica QR nem gera cobrança; sem confirmação de pagamento.
- Referência mobile Ordem Leve analisada somente por leitura de HTML/CSS do projeto indicado, sem alterar esse projeto ou copiar seus dados/assets. Princípios adotados: navegação inferior fixa, safe-area e controles de toque amplos, mantendo visual NIB. Quatro atalhos inferiores, menu para demais seções e botão Voltar com histórico de telas da sessão. Campos reorganizam em coluna em telas estreitas.
- Validação: sintaxe JS; 28 testes de cores/base (tag ativo7,80:1, encerrado7,06:1); navegador com solicitação vazia recusada, telefone fictício aceito, QR carregado, atalho e Voltar em iframe de360px sem overflow horizontal. Não substitui teste em aparelho físico.


## Referência mobile corrigida por Hilton — módulo de eventos

A orientação mais recente substitui a referência Ordem Leve. Não usar barra inferior: o módulo Membros deve seguir os padrões existentes de Eventos/Inscrições.

Codex navegou nas páginas públicas NXT (formulário), consulta de inscrição e Mulheres (encerrado), sem preencher/enviar inscrições. O painel privado redirecionou ao login; suas telas internas não foram acessadas. Para navegação de gestão, a verificação foi pelo código existente: inscricoes/index.php, painel.css, refino-mobile.css, layout-mobile.css, navegacao-painel.css e o primeiro controlador de navegacao-painel.js.

Aplicação em Membros: retirados atalhos inferiores; retorno VOLTAR no cabeçalho com a classe mobile-backbar; faixa Navegação com tela atual, Menu/Fechar e drawer lateral original, seleção/indicador Atual, backdrop, trava de rolagem, inert, Escape, foco contido e medidas reais do cabeçalho. Reutilizado o controlador mobile original, sem seu controlador desktop separado; snapshots CSS mantidos. Botão Teste abre as experiências fictícias; rótulo compacto evita cortar cabeçalho. Tipografia, margens e campos seguem os CSS existentes. Não copiar conteúdo privado ou totais de participantes.

Revisão anterior de Claude (9ffc1bc) considerada nos pontos confirmados: foco preservado ao trocar finalidade de contribuição, mensagens roladas para visualização, aviso global distingue cadastros fictícios de dados bancários reais, atalhos em duas colunas intermediárias. Voltar usa histórico interno de telas, não intercepta o botão do navegador.

Verificação: sintaxe dos dois scripts, 29 testes incluindo igualdade do controlador mobile com o original, menu em iframe360px com drawer fixo abaixo de76+66px, backdrop/trava ativos, seleção de cadastro fecha menu e libera página, retorno de44px, sem overflow horizontal. Ambiente de teste; sem alteração na produção. Codex implementa, Claude revisa no PR12, Hilton valida visualmente.

## Proposta de Claude aplicada — barra flutuante e acabamento mobile

Hilton autorizou implementar a proposta em 01/11. Base544a01b, PR12. Autor do design: Claude, comentário6564102092; Codex revisou/corrigiu snippets e implementou; Hilton valida visualmente. Nenhuma mudança em produção.

Barra flutuante de5posições em até820px: Início, Eventos, Contribuir central com coração, Cadastro, Mais. Superfície branca, recuos12px e safe-area, raio28px, altura72px, alvos56px, íconesSVG22px, círculo60px com borda branca, sombra navy suave. Atual indicado por aria-current, peso e fundo de ícone. Links usam data-view; ícones outline não são preenchidos indiscriminadamente. Mais abre o drawer original com foco no destino atual; fecha Teste em toda abertura e restaura foco sem roubar foco do título após navegar. Gestão não mostra barra. Barra some ao focar inputs/textarea/select. Reserva de rolagem evita cobrir ações/rodapé. Voltar permanece no cabeçalho.

Blocos e cards mobile com raio18px, padding20px e sombra discreta; Eventos e inscrições recebe destaque navy/branco na inicial. Tipografia/logo e fundo claro NIB mantidos; desktop preservado. Nenhum sino, notificação ou dado inventado. Os cinco CSS-base e o controlador original continuam sem edição.

Verificação: sintaxe e30 testes passaram, incluindo novo contraste navy/eef1f4. Navegador360px validou Eventos, Mais→Células, Cadastro e ocultação da barra ao focar campo. Conferência adicional320/390px para dimensões/ausência de overflow. Limites: sem aparelho físico ou teste de pagamento; QR oficial real continua explicitamente identificado e não deve ser usado durante o teste.

## Cabeçalho único e menu em tela inteira — nova solicitação de Hilton

Base9da5d800. Removidos breadcrumb Minha igreja e faixa Navegação/tela/Menu redundantes. Cabeçalho mobile sticky único76px: marca alinhada à esquerda e dois ícones44px (avisos e menu) à direita; Voltar foi para o início do conteúdo, sem deslocar a marca. Avisos abre a área de informações existente, sem contador/avisos fictícios. Barra inferior mantém5destinos e substitui Mais por Células, eliminando o segundo gatilho de menu.

Menu passa a ocupar toda a viewport mobile (100dvh), com marca/Fechar, seções Seu acesso e Vida na igreja e cards em duas colunas com ícone, título, descrição e indicação Atual. Gestão tem grupo próprio. Seletor de teste disponível dentro do menu; versão desktop permanece no cabeçalho. Dialog nativo controla modalidade/foco/Escape, com bloqueio de rolagem e fechamento ao escolher destino. O controlador antigo de details permanece como snapshot intacto, porém não é mais carregado: estrutura de gatilho único/modal substitui details externo. Não alegar comportamento do script antigo em runtime.

Espaçamentos: tag/nome com12px, h2 com16px, ações24px acima e12px entre, alvos48px nos formulários; reserva inferior140px + safe-area e margens de rolagem145px para não cobrir fim do conteúdo com dock. Menu com safe-area e rolagem interna. QA320/390 verificou marca x12/18, botões44px, sem overflow; menu375x740 na viewport390, formulário/Generosidade e avisos navegáveis.30 testes de cores/snapshots e sintaxe passaram. Sem teste em aparelho físico. Autor da proposta visual Claude; refinamento/implementação Codex; validação Hilton. Sem alteração em produção.

## Seleção da barra inferior — correção de Hilton

Base17e0257. Removido somente o contorno visual do h1 focado programaticamente: o foco permanece no título para anunciar a tela a leitores de tela; links, botões e campos continuam com foco visível por teclado. Não usar blur indiscriminado nem desativar seleção de texto globalmente.

Cada um dos5ícones da barra tem variante SVG sólida própria quando selecionado, sem preencher indiscriminadamente paths outline; o item atual mantém aria-current e rótulo em destaque, os demais ficam outline. Casa preserva recorte da porta, calendário preserva área/data, cadastro usa cabeça/corpo sólidos; coração e células têm formas sólidas.30 verificações passaram; navegador percorreu5destinos e confirmou sempre1aria-current, SVGselecionado currentColor e outline do título none. Sem alterar layout, dados ou produção.


## Cards na inicial e menu compacto — preferência mais recente de Hilton

Base2614813. Os cards detalhados com ícone, título e descrição passam para a inicial mobile, em duas colunas e último acesso em largura total. O menu em tela inteira mantém grupos, mas usa blocos compactos com ícone e nome, sem descrição/sombra, em duas colunas ou uma em até350px. Estado Atual/aria-current preservado. Desktop e regras/dados inalterados. Codex implementa e verifica; Claude revisa no PR12; Hilton valida visualmente. Sintaxe e30 verificações passaram; conferir navegação no browser antes de entregar Preview.


## Inicial neutra e menu em lista

Solicitação mais recente de Hilton, base4bcd0fa: retirar destaque permanente do atalho Eventos na inicial, compactar cards e organizar menu como lista. Removidas as três regras especiais de Eventos; cards mobile padding15/14, gap9, ícone32px e mínimo138px. Menu permanece em tela inteira, grupos preservados, uma coluna com linhas de56px, ícone/nome/Atual, sem borda nos itens inativos. Hover de toque nos cards retorna à aparência neutra para não sugerir seleção persistente. Seleção de tela continua apenas na navegação. Codex implementa; revisãoClaude via PR12; Hilton valida. Produção/dados inalterados.

## Acabamento de vidro e popup de avisos

Pedido de Hilton: dar acabamento mais premium, mantendo identidade NIB. Basea94a3d2. Codex implementa, Claude revisão no PR12, Hilton valida visual. Vidro claro #fffffff0 com blur20/saturação135% em barras mobile, fallback branco, sombras em camadas, degradês claros e ícones com superfície sutil nos cards neutros. Foco e contornos legíveis preservados. Movimento discreto com prefers-reduced-motion e transparência reduzida respeitada.

Sino abre dialog de avisos: popup central no desktop, painel inferior arredondado no mobile, fundo navy translúcido/desfocado, botão de fechar44px, foco modal/Escape nativos, fechamento por fora e scroll bloqueado. Não inventar avisos nem contadores: estado vazio informa que os comunicados não estão disponíveis na demonstração. CTA navega para Informações e fecha popup.30 testes anteriores +2pares novos passaram(32): secundário no pior fundo de vidro5,52:1 e no degradê5,59:1. Browser390 confirmou modal real, blur20 e nenhum overflow do popup; Escape devolveu foco ao sino/desbloqueou, CTA320 foi a Informações/fechou sem overflow. Sem testes em aparelho físico. Nenhuma alteração de produção/dados.

## Vidro no menu e seleção uniforme da barra

Pedido atual de Hilton, basec7860a5: estender vidro a superfícies pertinentes, corrigir diferença de cor em Eventos e retirar borda branca da seleção. Lida novamente a referência de estilos do Ordem Leve: seleção por ícone/rótulo e cor, sem necessidade de anéis adicionais.

Menu100dvh e painel de teste usam superfície clara translúcida e blur, com fallback branco/preferência de transparência reduzida. Menu com blur24/saturação125%, fundo f4f6f8f2 e backdrop navy suave. Conteúdo não fica com opacidade reduzida. Card/botão não foi tornado transparente indiscriminadamente.

Barra: estado atual usa navy041e42, ícone preenchido e peso700; removidas cápsulas decorativas e borda branca4px do círculo central, sem alterar área de toque60px. Contribuir mantém ícone branco no círculo navy; rótulo selecionado usa mesmo navy dos demais. Hover/toque não introduzem fundo/contorno extra. Foco de teclado continua com outline3px. Removida transição de cor dos links/SVG para não capturar tom intermediário ao trocar: antes a medição pegou tons intermediários8,33,68 ou cor anterior83,97,118; agora Eventos/Cadastro/Contribuir medidos4,30,66 imediatamente, borda0. Menu medido semoverflow e blur24.33 testes passaram, incluindo texto no pior fundo de vidro do menu5,12:1. Sem teste em aparelho físico. Codex implementa/verifica, Claude revisa no PR12, Hilton valida; produção preservada.

## Menu da referência, versículo diário, agenda e oração — curadoria UI/UX

Pedidos adicionais de Hilton incorporados ao trabalho em andamento. Baseb776026 (inclui vidro e seleção sem anéis), branch/PR12. Referência: captura Ordem Leve com perfil e grupos de linhas com ícone/título/descrição/seta dentro de cards arredondados. NIB preserva navy/fontes/fundo claro, não copia foto, conta ou status de sincronização. Menu tem perfil fictício identificado como Teste, grupos de linhas em cards e seta de navegação; seleção sutil no ícone, sem transformar a linha inteira em bloco escuro.

Inicial: versículo diário curto com referência, seis acessos equilibrados(inclui pedido de oração), agenda e apenas evento ativo compacto. Removida repetição de banners encerrados na inicial; catálogo completo mantém histórico. Ícones de cadastro/pessoa e generosidade/coração clarificados. Conteúdo e cliques têm destinos reais dentro da demonstração, sem controles cenográficos.

Versículo em seleção determinística a partir da data local America/Porto_Velho, mesmo texto durante o dia e ao recarregar. Lista local curada de sete passagens, sem serviço externo/rastreamento. Data visível sob Minha igreja no cabeçalho fixo mobile, substitui subtítulo para não aumentar altura; time com datetime e nome acessível completo. Atualiza ao voltar ao aplicativo e a cada minuto; texto do versículo atualiza sem recriar formulário.

Agenda é protótipo de programação de referência, não integração/calendário oficial. Usa dados presentes no index.html do site: Quinta19h30 Culto da Fé; Domingo9h30 EBS e19h Noite de Glória. Próximos14dias e NXT21/22nov2026 do evento existente; exclui horários já passados hoje no bloco. Não inventar festividades nem exceções de cultos; interface informa referência sem sincronização e pede confirmar mudanças. Ver agenda abre lista completa. Alterações de programação continuam dependentes de cadastro oficial/equipe.

Pedido de oração é somente fluxo de teste: textarea obrigatório/limite1000, valida conteúdo não vazio, botão Enviar pedido de teste e Limpar. Não armazena pedido nem envia dados; sem backend, localStorage ou destinatário fictício. Recebimento, confidencialidade/perfis e guarda serão definidos antes de usar pedidos reais.

Curadoria aplicada: hierarquia da inicial(versículo, acessos, agenda), seis atalhos em duas colunas, menos repetição de eventos, grupos legíveis no menu, explicações de estados vazios/demonstração, títulos/ícones coerentes, alvos de toque/foco/voltar preservados.37 testes:33cores/snapshots +4 data local/versículo estável/agenda na virada de ano/NXT excluído após data. Navegador deve confirmar perfil/menu, data, oração e agenda antes de entregar. Codex implementa/verifica, Claude revisa no GitHub, Hilton valida visualmente. Produção/dados reais preservados.

## Data extensa, calendário mensal e caderno — 01/11/2026

Base 5cbc8c7, mesma branch de teste/PR12. Pedido de Hilton: nome Nova Igreja Batista no cabeçalho, data completa (ex. Domingo, 01 de novembro de 2026), saudação “Olá, Ana. Você está na plataforma NIB.”. Data usa linha própria no cabeçalho fixo mobile para manter legibilidade em 320px. Removida moldura azul causada pelo foco programático no item atual: abertura leva foco ao botão Voltar; contorno de teclado preservado por modalidade, toque não desenha moldura de seleção.

Agenda tem acesso Ver calendário completo, grade mensal segunda a domingo, anterior/próximo/Hoje, marcadores só onde há encontros e seleção de dia com lista de horários. Mantém a referência pública da programação, não inventa festividades, alterações ou sincronização. Lógica mensal cobre ano bissexto e virada de ano.

Caderno consultado no código index.html do repositório privado Ordem Leve: pessoa/motivo, data/hora opcionais, lista em oração/respondidas e excluir. Adaptado ao NIB como página com campos rotulados, textos escapados e avisos de teste. Somente memória da aba, apagada ao recarregar ou trocar perfil; não usa localStorage/API, não envia pedidos e não dispara lembretes. Data/hora são anotações. Sem cópia de fotos/mural/sincronização do outro app. Pedido de oração à igreja continua fluxo demonstrativo separado. Caderno acessível no menu e dentro da tela Pedido de oração.

Validação: sintaxe JS e 39 testes aprovados. Navegador em 320/390px: data extensa, menu sem moldura, 30 dias de novembro, seleção21/NXT, avançar dezembro e Hoje, caderno com pedido fictício adicionado/respondido/excluído. Sem overflow horizontal em320px (client305/scroll305). Correção de compatibilidade: identificador sequencial local substitui crypto.randomUUID indisponível no preview HTTP interno. Sem teste físico em iPhone. Codex implementa e testa; Claude acionado no GitHub para revisão; Hilton valida Preview. Nenhuma alteração em produção, dados reais ou autenticação.

Ajuste adicional de Hilton durante a publicação: versículo sem destaque. Card passa a navy041e42→0c3158, texto branco, referência d2ddeb e rótulo ff b3 8a. Contraste medido no extremo mais claro do degradê, além do navy já verificado. Sem mudança de conteúdo ou seleção diária.42 testes aprovados após inclusão dos três pares.

## Caderno comunitário — alteração de escopo de Hilton

Esta decisão substitui o caderno individual descrito acima. Hilton solicitou um bloco compartilhado/visível a todos; confirmou na pergunta de escolha que o contador deve representar PESSOAS ORANDO, semelhante a curtidas, não mensagens nem quantidades de orações atendidas.

Interface agora mostra mural na inicial e página Caderno de oração com autor, pedido, botão Estou orando/contador, estado pressionado reversível e status Oração atendida separado. Apenas autor fictício Ana tem ações de marcar atendida/excluir seus próprios exemplos. Há dois pedidos de demonstração, nomes fictícios, contadores começam em zero. Publicar pedido de teste inclui explicação de visibilidade comunitária antes dos campos e da ação; texto livre escapado. Não há datas pessoais/lembretes neste mural (foram retirados da proposta individual).

Limite de entrega: este Preview demonstra o fluxo público, mas NÃO compartilha dados entre navegadores/usuários. Contador e publicações só em memória nesta aba; reiniciam com recarga/perfil. Backend, autenticação, publicação com consentimento e moderação serão definidos para tornar o mural real. Não confundir indicação visual de autoria com segurança de servidor. Não reutilizar dados reais nem ativar publicação real nesta versão.

Revisão Claude a9cd462 recebida no PR12 e analisada: item1(data inválida) eliminado pela retirada dos campos de data do caderno comunitário; item2(logo levando gestão à inicial de membro) corrigido no roteamento; item3(nomes acessíveis repetidos) corrigido com título do pedido e foco pós-exclusão na lista; item4(calendário) usa região feedback fixa para anúncio; item5 altura dos dias44px, largura ainda limitada pelas7colunas em320px. Modalidade de teclado inclui Enter/espaço/setas; aviso do formulário de envio à igreja repetido antes do campo/autocompleteoff. Calendário explicita que recorrências de referência não são histórico. NXT21/22 confirmado no formulário público já capturado e usado neste projeto; card mostra data inicial, calendário mostra ambos os dias. Revisor não executou navegador/testes e não teve acesso ao Ordem Leve. Codex fez verificação local.

42 testes de contraste/integridade/data/calendário aprovados. Navegador: apoiar0→1→0 sem acumular, publicação fictícia com HTML exibido como texto(sem elemento injetado), mural acessível pela inicial. Controle de apoio atualiza só o botão/contador, preservando rascunho no formulário. Sem backend, persistência ou mudanças em produção.

## Cores sem marfim, categorias e cabeçalho — ajuste de Hilton

Base e8d77e8, branch de teste/PR12. Usuário substitui marfim no aplicativo: informação em azul-claro (eaf2fb/163e68), confirmação em verde(e9f3ed/1f513c), atenção em âmbar(fff3da/75420d). Aviso de QR real recebe atenção. Todos os usos de ebebdf no app.css foram substituídos por azul-claro(inclui menu/hover/contornos); cópias CSS de produção preservadas byte a byte. Mensagens recebem tipo explícito no código, não inferido do texto. Confirmação do formulário de oração muda para verde sem afirmar envio real.

Calendário adota o princípio do Ordem Leve de pontos por categoria e legenda, com paleta adaptada à NIB: culto azul2463a6, escola bíblica verde24674e e evento laranja b64e1a. Um dia pode mostrar até três pontos para seus tipos existentes; nenhum compromisso foi inventado. Categorias também aparecem no detalhe do dia. Pontos conservam cor no selecionado e usam contorno branco para separação do fundo navy; nomes acessíveis incluem data/quantidade, legenda explica cores.

Data completa movida para dentro do grupo de nome Nova Igreja Batista, imediatamente abaixo. Em320px quebra em duas linhas; em390px cabe em uma linha. Logo/ações44px preservados, cabeçalho estável90px. Texto da inicial passa a “Olá, Ana. Você está na plataforma Nib.”, conforme grafia pedida.

Revisão Claude e8d77e8 recebida no PR e avaliada: rótulo do botão Estou orando agora fixo(estado somente aria-pressed), anúncio do calendário em frase com separadores e região fixa, sem aria-live duplicado no bloco recriado. Publicar/excluir no mural não rola mais para longe do foco. Teclas Enter/espaço/setas referidas anteriormente só ativam indicador de foco; calendário navega via Tab, não foi alegada navegação entre dias por setas. Regras do mural para moderação, anonimato, menores, dados de terceiros e acesso da equipe continuam pendentes para backend, além de apoio ao próprio pedido(a demo permite). Visibilidade comunitária já foi escolhida por Hilton. Nenhuma decisão de permissão real foi implementada.

Validação: sintaxe e51 testes aprovados(9 pares novos de contraste, textos>=4,5:1 e indicadores>=3:1). Navegador320/390: sem overflow em320(client305/scroll305), data sob nome, confirmação verde,22/11 mostra três pontos distintos. Sem teste físico Safari/iPhone. Codex implementa/testa; Claude revisa no GitHub; Hilton valida Preview. Produção e dados reais preservados.

## Versículo suave, evento compacto e atalhos — 02/11/2026

Pedido de Hilton sobre6d1e280: inicial passa a “Olá, Ana! Você está na plataforma Nib.”. Barra inferior troca a antiga posição de Eventos por Calendário(destinoagenda/calendário completo), e Cadastro por Eventos(destinocatálogo). Ordem: Início, Calendário, Contribuir, Eventos, Células. Ícone de calendário específico paraagenda e ingresso paraEventos, incluindo versão preenchida de seleção. Cadastro continua na inicial e nos menus.

Versículo agora vidro azul suave com gradientes translúcidos, blur20/saturação135, contorno azul e brilho interno discreto; tipografia21px mobile/23px desktop(antes18/19), navy com rótulo/referência azuis. Mantém destaque cromático sem navy sólido; fallback opaco para redução de transparência. Três pares de contraste do teste atualizados para os textos atuais sobre o azul mais escurodce9f8.

Card de evento na inicial: grid com banner inteiro em thumbnail, status/data alinhados, título e botão em linha própria. Padding18px(16em320), contorno claro, radius22 e sombra suave. Sem recorte novo de banner;object-fitcontain. Compacto, altura174px em390, mantendo evento menos dominante que os acessos. Catálogo completo preservado.

Codex verificou sintaxe+51testes. Navegador320/390: Calendário da barra abre30diasnovembro e fica selecionado; Eventos abre3cards e fica selecionado; Início retorna ao texto correto; versículo21px; card339x174px em390, imagemcontain;320semoverflow(client305/scroll305). Sem validação em aparelho físico. Claude solicitado para revisão do head; Hilton valida aparência. Somente Preview/staging; produção/inscrições/dados reais preservados.

## Unificação de oração e banner da igreja — 02/11/2026

Base42624b9, mesma branch de teste/PR12. Hilton decidiu unificar Pedido de oração e Caderno de oração: removida tela separada de envio, formulário/handlerprayer-form e entrada duplicada no menu. Atalho inicial passa a Caderno de oração e abre diretamente mural/formulário existente. Destino interno legadooracao redireciona paracaderno. Mural, apoios e publicações continuam somente memória/sem compartilhamento real nesta fase.

Referência do versículo(cite) alinhada à direita. Entre atalhos e agenda incluído banner com img/hero-nib.webp original do site(cópiaaplicativo/assets/hero-nib.webp, blob785b34bbc489eca1a84bd020fab06252920424f9,223070bytes). Sem modificar a imagem original: composição CSS com blur2px, camada navy e painel de vidroblur14, fallbackopaco. Frase reaproveitada da hero do site: “Uma igreja que vive o amor de Cristo de casa em casa.”. Imagem decorativa, seção nomeada pelo título.

Cabeçalho da agenda reorganizado em grid: rótulo à esquerda e botãoVer calendário completo no canto superior direito, título na linha seguinte em largura total. Mantém destinoagenda e alvo44px, sem sobreposição nas larguras estreitas.

Codex verificou sintaxe e53testes de cores/integridade/data/calendário(2novos pares para vidro sobre pior fundo composto). Navegador320/390: cite text-alignright; atalho abreCaderno/formnotebook1/prayer-form0; menuCaderno1/Pedidodeoração0; botãoagenda23pxdastop/rightdo bloco390;320semoverflow(client305/scroll305). Captura visual conferida com banner original carregado. Sem teste físico. Claude solicitado para revisão; Hilton valida Preview. Produção e dados reais preservados.

## Banner limpo e cabeçalho externo da agenda — 02/11/2026

Base286ff6b. Pedido novo de Hilton substitui o tratamento anterior do banner: somente imagem originalhero-nib.webp, inteira em2048/861, sem blur, painel, texto acrescentado, gradiente ou pseudo-elementos. Figure comimgalt, width100%/heightauto, borda/radius do aplicativo preservados. Imagem não editada.

Agenda agora segue o cabeçalho deCaderno: título e ação fora do card que contém encontros, comVer calendário completo alinhado à direita e white-spacenowrap. Flexwrap permite que o botão vá para linha própria em telas estreitas, conservando o texto em uma única linha e evitando overflow. Destino calendário completo preservado.

Codex verificou sintaxe e51testes(removidos2pares de contraste do painelvidro que deixou de existir). Navegador320/390: imagem carregada2048px, filter:none, texto vazio, before/after:none; botão fora do card, nowrap,18px acima do card em320; semoverflow(client305/scroll305). Captura conferida. Claude solicitado para revisão; somente Preview/staging, produção preservada.

## Card de evento no formato original — 02/11/2026

Base7a38686. Hilton rejeitou as tentativas horizontais de compactação: pediu formato original do painel, apenas mais baixo sem distorcer banner. Inicial retorna ao card vertical: imagem em toda largura no topo, status/data, título e botão navy abaixo. Removida composição em grid/thumbnail. Altura reduzida nos espaçamentos14x16/gaps8 e conteúdo resumido, sem descrição repetitiva. Imagemwidth100/heightauto/aspectratioauto, sem corte ou esticamento; acervo original preservado. Catálogo completo permanece intacto.

Codex:51 testes existentes aprovados. Navegador390: card inicial308,8px versus catálogo391,5px(~21%menor); banner render337x168,5, proporção2:1 idêntica ao arquivo1440x720.320semoverflow(client305/scroll305). Captura em320/390 conferida. Sem teste físico. Codex implementa/testa/publica Preview; Claude solicitado para revisão; Hilton valida. Produção preservada.

## Interações e animações coerentes — 02/11/2026

Base d9ac72d. Hilton pediu hover desktop mais evidente nos atalhos e estendeu a orientação aos demais componentes onde pertinente. Atalhos desktop com ponteiro fino: brilho diagonal breve(550ms), gradiente azul suave, borda mais evidente, halo/sombra e elevação4px. Mesmo retorno emfocus-visible, mantendo contorno de teclado. Ao pressionar, elevação reduzida. Sem animação contínua.

Botões habilitados, cards de eventos, calendário, cabeçalho, itens de menu e navegação recebem retorno discreto com transições160–200ms; cards elevam2px, ações1px e navegação destaca superfície/contorno. Modais abrem comfade/deslocamento8px em200ms. No toque, feedback de pressão sem hover persistente novo. Preferência prefers-reduced-motion remove transições/animações/elevações; botão desabilitado excluído das novas respostas. Sem alteração de rotas, dados ou fluxos.

Codex:51 testes existentes aprovados. Navegador desktop confirmou estadofocus-visible dos atalhos com mesmo seletor visual dehover, fundo gradiente, halo, transform e shine550ms; captura do estado estabilizado conferida. Revisão CSS cobre escopo de ponteiro/desktop e redução de movimento; não houve emulação de preferência ou teste físico. Sem alegar medição automatizada de hover por ponteiro, pois API usada testou o estado equivalente via teclado. Claude solicitado para revisão delimitada; somente Preview, produção preservada.

## Ajustes da revisão de interações — 02/11/2026

Base 7853ad1. Claude aplicou os pontos menores da revisão delimitada do mesmo head, com autorização de Hilton nesta tarefa.

- Popup: removida a animação antiga `nib-popup-in` e seu `@keyframes`. Fica só `nib-surface-open`, que já era a regra vigente.
- Calendário: o hover genérico de botões (`main button:enabled:not(...)`) agora exclui `.calendar-day`, então o dia usa o próprio retorno de hover. O dia selecionado mantém a sombra do estado e ganha um halo claro ao passar o mouse.
- Toque: em `hover:none`, os atalhos da inicial recebem pressão (`scale(.98)`, 160 ms). A regra de movimento reduzido também zera `transform` dos atalhos.

Verificado: 51 testes existentes aprovados; Chromium sem erros de console, sem overflow em 390 e 1280 px; dia selecionado sob hover mantém fundo navy e sombra com halo; transição de toque aplicada em 390 px com toque emulado. Sem teste em aparelho físico. Produção preservada.

## Abertura animada e banners das redes — 02/11/2026

Pedido de Hilton, com vídeo de referência de outro aplicativo (padrões genéricos: tela de abertura azul com marca e carregamento; carrossel de banners com foto, chapéu, título forte e caixa azul translúcida com seta).

- **Abertura:** `#app-splash` em `index.html`, fundo azul NIB em degradê radial, logo branca (`assets/logo-branco.svg`, cópia da logo com preenchimento branco) que sobe e cresce levemente, rótulo "Plataforma NIB" e indicador de carregamento. Some sozinha em cerca de 2,3 s ou ao toque, com fade de 450 ms. Aparece uma vez por aba (`sessionStorage`, com try/catch). Com movimento reduzido não há animação e some em 0,7 s. Quando houver login, a abertura fica antes dele.
- **Banners das redes:** o banner único da hero foi substituído por "A NIB nas redes", com três cards (Instagram, YouTube e Facebook @nibcasadedeus, links oficiais já usados no site). Fotos da galeria do site recortadas em 5:6 e convertidas para WebP 640×768 (`assets/social-*.webp`). No celular, carrossel com snap, próximo card aparecendo e indicadores; no desktop, três cards lado a lado. Links abrem em nova aba e têm `aria-label` completo.

Verificado: 51 testes existentes aprovados, sintaxe do `app.js` válida. Chromium sem erros de console; sem overflow em 390 px; indicadores acompanham a rolagem; abertura some e não reaparece ao recarregar a mesma aba. Sem teste em aparelho físico.

## Abertura com a logo animada do site — 02/11/2026

Hilton pediu a animação da logo usada no site (`video/brasao-nib-alpha.webm`, seção "Somos a"), menor e na proporção da referência, com texto principal "Plataforma Nib" ao lado e "Nova Igreja Batista" abaixo, letras entrando, zoom inicial com zoom out fluido e barra de carregamento melhor.

- O vídeo com transparência foi convertido para WebP animado com alfa (`assets/splash-logo.webp`, 300×113, 48 quadros, cerca de 280 KB, toca uma vez e para no último quadro). WebM com alfa não funciona no Safari do iPhone, e o WebP animado funciona sem depender de autoplay. O último quadro fica em `assets/splash-logo-final.png` para quem usa movimento reduzido.
- Conjunto logo, divisória e texto começa em escala 1,9 e reduz até 1 em 2,3 s (`cubic-bezier(.16,1,.3,1)`). As letras do título entram uma a uma a partir de 1,5 s, e as do subtítulo a partir de 1,95 s, com subida curta e desfoque saindo. As letras são montadas por DOM com `style.setProperty`, compatível com a CSP `style-src 'self'`.
- Barra de carregamento: trilho de 132×4 px, preenchimento em degradê azul claro para branco com brilho, progresso em etapas suaves por 3 s e reflexo passando.
- Duração total de cerca de 3,5 s, com saída em fade de 0,5 s. Toque encerra antes. Uma vez por aba. Removida a `logo-branco.svg` da versão anterior.

Verificado: 51 testes aprovados, sem erros de console, capturas em 390 px a 0,15, 0,7, 1,4, 1,9, 2,6 e 3,3 s conferidas. Sem teste em iPhone físico.

Ajuste seguinte, a pedido de Hilton: a barra de carregamento voltou a ser um círculo. Agora é um arco com degradê do azul claro ao branco, ponta arredondada e brilho leve, girando em 0,85 s. Com movimento reduzido, o círculo não aparece.

## Abertura de 5 s e banners na proporção da referência — 02/11/2026

- **Abertura:** conjunto maior (logo até 200 px, título até 32 px), logo animada mais lenta (62 ms por quadro, cerca de 3 s), zoom out em 3,4 s, texto a partir de 2,3 s e saída em 4,5 s com fade de 0,5 s, total de cerca de 5 s. Em telas até 350 px o conjunto reduz para caber em 320 px.
- **Banners:** proporções medidas no vídeo de referência: card com cerca de 78% da largura no celular e formato 8:9, chapéu em peso regular de 15 px, título em negrito de 30 px com entrelinha 1,13, caixa azul com texto regular de 14 px, padding de 16 px e cantos de 10 px. Fonte Acumin da NIB em todas as larguras. Novas fotos da galeria do site: celebração com confete (Instagram), louvor com mãos levantadas (YouTube) e crianças da igreja (Facebook).

Verificado: 51 testes aprovados, sem erros de console; abertura cabe em 320 e 390 px e some em cerca de 5 s.

Ajuste seguinte: o carregamento passou a seguir o vídeo de referência. É um arco branco sólido em SVG, com 44 px, traço de 4 px e pontas arredondadas, que cresce e encolhe enquanto gira (1,4 s e 1,6 s). Os textos da caixa azul dos banners deixaram de repetir o @ e agora descrevem o que cada rede oferece.

Ajuste seguinte: o carregamento ficou maior (54 px) e mais lento (giro de 2,4 s e arco de 2 s). A caixa azul agora tem uma frase curta em duas linhas, terminada em ponto, seguida da ação em negrito (Seguir, Assistir, Compartilhar). As fotos ganharam paralaxe no carrossel do celular: a imagem tem 132% da largura do card e se desloca até 12% em sentido contrário ao deslizar, com `requestAnimationFrame`. A paralaxe fica desligada quando não há rolagem (desktop) e com movimento reduzido.

Ajuste seguinte, após teste de Hilton no iPhone:
- A foto não preenchia o lado direito porque a regra base de imagens limita `max-width` a 100%. O fundo do card agora usa `max-width:none`, e as fotos foram recortadas já na proporção da área de paralaxe (132% da largura do card em 8:9), com os rostos abaixo da área do título.
- Títulos mais curtos e maiores, como na referência (32 px, até 10 caracteres por linha): "A NIB no dia a dia", "Cultos e mensagens", "Nossa família reunida".
- Abertura: o conjunto subiu para o centro óptico (cerca de 45% da altura) e ficou um pouco menor, com mais respiro nas laterais. Logo e texto têm o mesmo centro vertical.

Ajuste seguinte, comparando com capturas da referência enviadas por Hilton:
- Banners mais próximos da referência: card com 84% da largura no celular, foto clara (só um leve escurecimento no topo, sem o véu azul), chapéu de 16 px, título de 32 px em três linhas ("Acompanhe a NIB no dia a dia", "Cultos e mensagens na íntegra", "Uma família que acolhe você"), caixa em azul vivo translúcido com texto de 16 px e chamada em negrito com exclamação ("Siga agora!", "Assista agora!", "Convide alguém!"). Recortes refeitos com os rostos abaixo do título e acima da caixa; o Facebook passou a usar a foto da equipe de recepção.
- Abertura: conjunto logo e texto menor (logo até 156 px, título até 25 px), com mais distância das bordas.

## Versículo do dia redesenhado — 02/11/2026

A pedido de Hilton, o bloco do versículo saiu do vidro claro e virou um cartão azul NIB, na mesma linguagem dos banners: degradê radial do azul médio ao navy, brasão branco em marca d'água (7%, `assets/brasao-branco.png`, recortado do último quadro da logo animada), ícone de livro, rótulo "Palavra para o seu dia", aspas grandes em laranja NIB e texto branco de 20 px no celular e 24 px no computador. No rodapé, separado por uma linha fina, ficam a referência e o botão "Compartilhar", que usa o compartilhamento nativo do aparelho (Web Share) e, sem ele, copia o versículo com a referência e avisa no status. A atualização diária do texto continua funcionando.

Verificado: 51 testes aprovados, sem erros de console; botão com alvo de 44 px e foco visível em laranja.

Ajuste seguinte: o brasão ao fundo ficou maior (270 px no celular, 320 px no computador), levemente girado (-8°), com desfoque de 3 px e opacidade de 12%.

Ajuste seguinte da abertura: logo maior (até 180 px, 32% da largura) e o bloco de texto alinhado ao centro óptico da palavra Nib da logo, e não ao centro da imagem. A palavra fica cerca de 5% abaixo do centro do arquivo, então o texto desce na mesma proporção do tamanho da logo. Medido em 414 px: centro do Nib em 348 px e do texto em 348,5 px.

Ajuste seguinte: o círculo de carregamento fica centralizado entre a base da logo e a borda inferior da tela, calculado a partir da posição e do tamanho da logo. Medido: 390×844 (logo termina em 407, círculo em 626, ponto médio 626) e 320×560 (417 e 417).

## Acesso e orientação de teste — 03/11/2026

Pedido de Hilton: pensar o login e o cadastro na entrada do aplicativo e, depois do acesso, telas de orientação com o resumo do que há no app.

Fluxo: abertura animada → tela de acesso → orientação em quatro telas → inicial. Tudo é demonstrativo: a CSP bloqueia conexões (`connect-src 'none'`, `form-action 'none'`), os envios são interceptados no JavaScript e os dados ficam só na memória da aba. A tela avisa para usar dados fictícios.

- **Acesso:** foto da igreja no topo com a logo branca e uma folha clara com abas "Entrar" e "Criar cadastro" (tabs acessíveis com setas).
  - Entrar: e-mail ou celular, senha com botão de mostrar/ocultar, "Esqueci minha senha" e "Receber código pelo WhatsApp". As duas últimas só explicam como funcionarão.
  - Criar cadastro: nome completo, celular com WhatsApp, e-mail, vínculo com a igreja (Sou membro, Frequento, Estou conhecendo), senha de pelo menos 8 caracteres e aceite da política de privacidade do site.
  - A validação é própria, com mensagem em `role=alert`, foco no campo e `aria-invalid`. Os campos não usam autocomplete do navegador.
- **Orientação:** quatro telas com foto, ícone, título e resumo (inicial, agenda e eventos, generosidade, células e oração). Deslizar, botão Próximo/Começar, Pular e setas do teclado. No celular, foto em cima e texto embaixo; no computador, lado a lado. A primeira tela cumprimenta pelo primeiro nome do cadastro.
- **Depois do acesso:** a inicial, o topo, o menu, o Meu cadastro e o Caderno usam o nome cadastrado. No login sem cadastro, continua a usuária Jéssica Exemplo.
- A tela de acesso aparece uma vez por aba. Em "Versão de teste" há o botão "Ver login e orientação de novo".
- Enquanto acesso ou orientação estão abertos, o restante do app fica `inert`.

Contraste conferido: bordas dos campos #7a879a (3,4:1 sobre o fundo), textos secundários #536176 (5,9:1), laranja do rótulo #b64e1a (4,8:1).

Verificado: 51 testes aprovados, sem erros de console. Navegador em 390 px: validação do cadastro, cadastro completo levando à orientação, quatro telas até "Começar", inicial com "Olá, Maria!" e sem overflow. Também em 1280 px.

Decisões em aberto para a versão real: forma de acesso (e-mail e senha, código por WhatsApp ou ambos), quem confirma o vínculo de quem se cadastra (secretaria), se haverá CPF, e se a orientação aparece só no primeiro acesso.

Ajustes seguintes no acesso, após teste de Hilton no iPhone:
- Vínculo em uma linha só, com três opções de largura igual: Membro, Frequento e Conhecendo.
- Senha com critérios visíveis e marcados em tempo real (8 caracteres, maiúscula, minúscula, número e símbolo) e campo "Repita a senha", que avisa se as senhas são iguais. O cadastro só avança com todos os critérios atendidos e as senhas iguais. Erros somem ao corrigir o campo.
- Orientação: a foto ficou reta embaixo e o texto sobe numa folha com cantos arredondados por cima, como na tela de acesso. O ícone fica na emenda.
- Ao tocar em "Começar" ou "Pular": tela azul com o brasão branco no centro (fade de 0,38 s, entrada de 0,65 s e pausa), depois zoom de 1 para 38 vezes, com origem no centro do brasão, enquanto a tela azul some e revela a inicial (1,3 s, `cubic-bezier(.65,0,.35,1)`). Total de cerca de 3 s, feito com Web Animations. Com movimento reduzido, vai direto para a inicial.
- Saudações neutras: "Boas-vindas, [nome]" na orientação e "BOAS-VINDAS" na inicial, porque o nome cadastrado pode ser de qualquer pessoa.

Ajuste seguinte: o brasão da entrada ficou menor (76 a 112 px de largura, 22% da tela) e centralizado de forma exata. A imagem `brasao-branco.png` foi recortada rente ao desenho e o brasão é posicionado pelo centro da tela, sem depender do alinhamento da grade. Medido em 390×844: centro em 422 px, igual ao centro da tela.

Teste alternativo pedido por Hilton: no lugar do zoom, a entrada agora clareia. Depois de o brasão aparecer, o fundo passa do azul NIB para o branco em 1,8 s, enquanto o brasão ganha brilho (`drop-shadow` branco crescente e `brightness` até 1,3) e se funde ao branco. Em seguida o branco se desfaz em 0,6 s e revela a inicial. Total de cerca de 3,8 s. A versão com zoom continua no histórico (commit 6902cb3), caso se volte a ela.

Terceira variação da entrada, após Hilton achar a anterior pouco fluida. Causas encontradas na versão de brilho:
1. A animação era feita de fases encadeadas com pausas (fade, entrada do brasão, espera, brilho, saída). Cada fase parava e recomeçava com outra curva, o que cria "degraus" de velocidade.
2. `filter: drop-shadow` com desfoque grande e `background-color` não são compostos na GPU. O navegador repinta a tela inteira a cada quadro, o que costuma travar no iPhone.
3. A troca da orientação para a inicial (layout da página toda) acontecia durante a animação visível.

Nova versão: uma única linha do tempo de 3 s, só com `transform` e `opacity`, em camadas com `will-change`. O brasão surge e cresce devagar sem parar (0,86 → 1,12). Atrás dele, uma luz radial pré-desenhada nasce como um halo e se expande 16 vezes até cobrir a tela. Uma camada branca completa o branco em 60–84% do tempo, e tudo se desfaz na inicial em 84–100%. A troca de telas acontece nos primeiros 320 ms, com a tela coberta, e a linha do tempo só começa dois quadros depois.

## Abertura empilhada (2026-11-03)

- Brasão + nome NIB em cima e "Plataforma Nib" / "NOVA IGREJA BATISTA" embaixo, tudo empilhado e centralizado na tela; divisor vertical removido.
- Carregamento continua no meio entre o conjunto e a borda inferior (conferido em 390x844, 320x560 e 1280x800).

## Transição pós-orientação mais refinada (2026-11-03)

- Sai o brilho grande e o branco estourado. Fundo azul profundo com leve vinheta, brasão assenta com desaceleração longa (sobe 10px e cresce de 94% a 100%), um reflexo de luz atravessa o desenho (máscara no formato do brasão) e a tela se dissolve sobre a inicial, que sobe 14px ao assentar.
- Total de cerca de 3s, só transform e opacity; com movimento reduzido, entra direto.

## Abertura só com "Nova Igreja Batista" e reflexo na logo (2026-11-03)

- Removido "Plataforma Nib". "NOVA IGREJA BATISTA" (mesma fonte, caixa alta) agora escala com a logo (7,6% da largura), ocupando a mesma largura do brasão + Nib.
- O mesmo reflexo de luz da transição passa pela logo (máscara com splash-logo-final.png) aos 3,05s, depois que o vídeo da logo termina. Desligado com movimento reduzido.

## Agenda, botões com seta e calendário a partir do domingo (2026-11-03)

- Bloco de data da agenda: cartão azul em degradê com mês (NOV), dia grande e dia da semana (QUI); tipo do encontro com o mesmo ponto colorido do calendário.
- "Ver calendário completo" saiu do cabeçalho e virou botão de largura total, centralizado no rodapé do bloco.
- Todos os botões de navegação secundários (`button()` não primário: Ver calendário completo, Ver caderno, Ver todos, Voltar à gestão) ganham seta à direita e texto centralizado; nos cabeçalhos ficam alinhados ao título.
- Calendário mensal começa no domingo (D S T Q Q S S); `monthInfo().offset` passou a contar a partir do domingo, com teste atualizado.

## Calendário: Hoje no topo, seleção e bloco do dia (2026-11-03)

- Botão "Hoje" saiu do fim da legenda e foi para baixo do nome do mês; fica destacado quando o dia de hoje está selecionado. Legenda centralizada em uma linha, com o quadradinho de contorno explicando "Hoje".
- Dias sem fundo cinza; número sempre na mesma altura. Dia selecionado vira um quadrado arredondado azul em degradê com sombra suave e pequena animação de entrada; hoje tem contorno azul.
- Bloco do dia selecionado: cartão de data (NOV / 22), dia da semana em destaque, data por extenso e contador de encontros. Cada encontro é um cartão com faixa colorida do tipo e horário em uma pílula ("Horário a definir" quando não houver).
- Ajuste a pedido: dias voltaram a ser círculos cinza (seleção em círculo azul com degradê, hoje com contorno azul) e o botão "Hoje" saiu do bloco: fica acima do calendário, centralizado (azul quando hoje está selecionado).

## Resumo de hoje com botão Hoje à direita e célula do membro no calendário (2026-11-03)

- Acima do calendário, um cartão com "HOJE", a data por extenso e o próximo encontro (com ponto da cor do tipo); botão "Hoje" com ícone no canto direito.
- Célula do membro (exemplo fictício: Célula Exemplo, quartas 19:30) entra no calendário e na agenda da inicial como tipo "Minha célula" (roxo #6a45b0), com local no bloco do dia. Item "Hoje" da legenda removido (o contorno continua).
- Em aberto: de onde vem o vínculo membro→célula (plataforma de células ou secretaria), mudanças/cancelamentos de encontro e quem pode ver o endereço.

## Terceiro banner: site da igreja (2026-11-03)

- Banner do Facebook trocado pelo site: "Site da igreja" / "A NIB em um só lugar" / "Cultos, células, eventos e inscrições. **Acesse o site!**", link https://novaigrejabatista.com.br/. Mesma foto, arquivo renomeado para social-site.webp (também usado no 4º slide da orientação).

## Caderno de oração: botão com coração e frase de apoio (2026-11-03)

- Botão "Vou orar" com coração em contorno; ao tocar vira "Orando", coração vermelho preenchido (#e11d48) com pequeno pulso e fundo rosado. O contador saiu do botão.
- Ao lado, uma frase em vez de "0 pessoas orando": "Seja o primeiro a orar por este pedido", "**3** pessoas estão orando", "**Você** está orando por este pedido" ou "**Você** e mais 2 pessoas estão orando".
- "Oração atendida" saiu do canto da linha do autor e virou selo com ícone de confirmação, alinhado à esquerda acima do título.
- Ajuste: selo "Oração atendida" voltou ao canto superior direito, alinhado ao topo do nome, em formato compacto (sem caixa alta). Corrigido o botão ficando azul preenchido ao desmarcar no celular (hover/active "preso" do toque herdava o estilo genérico de botão).
- Correção geral: os estilos de passar o mouse (botões, atalhos, menu lateral, pontos do calendário) agora só valem em aparelhos com mouse (`@media(hover:hover)`). No celular, depois do toque nenhum botão fica azul "preso"; o retorno do toque é o contorno suave já existente em `@media(hover:none)`.

## Caderno: ações do próprio pedido (2026-11-03)

- Os dois botões grandes ("Marcar em oração"/"Oração atendida" e "Excluir") viraram uma barra discreta no rodapé do card: rótulo "SEU PEDIDO" à esquerda e, à direita, pílulas compactas com ícone: "Marcar atendida" (ou "Reabrir", quando já atendida) em cinza e "Excluir" em vermelho suave.
