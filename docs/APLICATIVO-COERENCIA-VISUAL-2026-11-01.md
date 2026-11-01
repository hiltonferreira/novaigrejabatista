# Correção visual com base nas telas fornecidas por Hilton

O primeiro Preview não foi validado visualmente. Hilton apontou largura limitada, proporções, espaçamento e tipografia diferentes do painel. Em 01/11 também forneceu o formulário NXT como base para campos e fundo marfim.

## Correção aplicada na branch de teste

- Copiados sem alteração os estilos oficiais do painel, navegação, refino/layout mobile e resumos para assets/*-base.css. Um teste compara os arquivos com os originais.
- Cabeçalho direto no body, 78px, logo e separador do painel; sem faixa demonstrativa permanente no topo. Seletor fica em Versão de teste, com aviso de dados fictícios e ausência de autenticação real.
- Largura total da janela, lateral 253px e conteúdo central máximo 1380px com os mesmos recuos de 38px; sidebar acompanha altura da janela e recolhe.
- Mesma tipografia desktop da base oficial (system-ui), com arquivos específicos Acumin 400/500/600/700 no mobile. Eliminado o mapeamento incorreto de um único arquivo Bold para pesos 600–800.
- Navegação com ícones reaproveitados do painel, ações sem ícones, cartões de eventos com banners públicos existentes e estados ilustrativos. Não copiados totais ou dados privados da captura de tela.
- Formulários de cadastro/apresentação em fundo marfim com campos brancos, usando a referência do formulário NXT. Regras de integração não alteradas.
- Contraste das adaptações, foco e controles preservados; ajuste visual não modifica produção.

## Limites

Catálogo de eventos estático para demonstrar layout, não integração em tempo real. Estados conhecidos em 01/11/2026; não usar para inscrição real. Dados pessoais fictícios e estado somente em memória. CSS é snapshot explícito da base, não sincronização contínua. Mudanças futuras do painel exigem reconciliação.

Responsável Codex; revisão Claude pelo PR #12; validação visual Hilton. O ajuste do botão do NXT é demanda separada, em branch própria, sem alterar formulário de produção por este PR.
