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
