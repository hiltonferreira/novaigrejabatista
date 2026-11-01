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
