# Minha igreja — versão 0.1 de teste

Primeira implementação de interface do novo módulo; não usa o projeto descontinuado de células. Fonte: issue #11. Base: main d4889c4955cc991d93ec82a0b5378bbb9975d5da.

## O que funciona nesta versão

- Navegação do membro, com identidade derivada do painel atual: Acumin, logo oficial, azul #041e42 e marfim #ebebdf.
- Solicitação fictícia de atualização de cadastro, visível na gestão durante a mesma sessão.
- Experiências demonstrativas de Secretaria e Liderança Pastoral.
- Registro de apresentação passada com confirmação explícita, autoria e horário demonstrativos.
- Áreas de eventos, células externas, informações e Generosidade com estados sem integração.
- Validação de campos e simulação de contribuição, sem cobrança.

## Limites

O seletor de experiência NÃO é autenticação/autorização. Não inserir dados reais. Tudo fica em memória e desaparece ao recarregar. Não há conta real, banco, auditoria persistente, inscrição, integração de células, Pix ou pagamentos. Formulário e reunião são pré-registrados no exemplo; cadastro completo, histórico de membros antigos e matriz final serão próximos recortes. Não usar como sistema operacional da Secretaria.

## Teste e Preview

Servir apenas esta pasta, que contém todos os recursos necessários. Exemplo local: `python3 -m http.server 8080 --directory aplicativo` a partir da raiz do repo. Abrir http://localhost:8080/.

Na Vercel: projeto separado de teste com Root Directory `aplicativo`, framework Other, sem build; criar deployment com target Preview. Não usar o antigo projeto de Células, promover a produção ou copiar o site PHP inteiro para Vercel. O vercel.json desta pasta declara cabeçalhos noindex e CSP sem conexões/formulários externos. Preview remoto depende da autorização da equipe Vercel.

Não subir esta pasta ao cPanel nesta etapa. Nenhum arquivo de home, APIs ou inscrições foi alterado. Os PRs #9 e #10 descrevem mudanças de produção não integradas na main; não substituir esses arquivos por esta branch.

## Contraste e validação

`node --check aplicativo/app.js` e `node --test aplicativo/contrast.test.cjs`.

A verificação calcula luminância relativa para 18 pares de cores (texto >=4,5:1, contornos/foco >=3:1). Não equivale a auditoria completa de acessibilidade. Textos secundários foram escurecidos; laranja claro é destaque sobre azul, não texto pequeno sobre branco. Foco azul em superfície clara e marfim na navegação azul.

Roteiro: navegar pelas áreas; enviar contato/observação fictícios e consultar na gestão; rejeitar apresentação futura; registrar apresentação passada como Secretaria e como Pastoral em sessões separadas; confirmar ausência de pagamento e integrações reais. Conferir teclado, foco, largura estreita e desktop.
