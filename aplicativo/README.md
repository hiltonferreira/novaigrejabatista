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

A verificação calcula luminância relativa para 23 pares de cores (texto >=4,5:1, contornos/foco >=3:1). Não equivale a auditoria completa de acessibilidade. Textos secundários foram escurecidos; laranja claro é destaque sobre azul, não texto pequeno sobre branco. Foco azul em superfície clara e marfim na navegação azul.

Roteiro: navegar pelas áreas; enviar contato/observação fictícios e consultar na gestão; rejeitar apresentação futura; registrar apresentação passada como Secretaria e como Pastoral em sessões separadas; confirmar ausência de pagamento e integrações reais. Conferir teclado, foco, largura estreita e desktop.


## Revisão Claude e correções

Revisão no PR #12: comentário 6563071101. O Claude leu o checkout, mas não confirmou SHAs completos via API nem executou testes; workflow terminou com erro após publicar análise, portanto revisão parcial. Codex verificou e corrigiu foco de navegação, contornos reais de inputs/atalhos, placeholder, seletor restaurado, estado vivo de mensagens, semântica do menu e tamanho de campos mobile. Testes finais: 24 verificações passaram, incluindo 23 pares de cores e ligação dos controles aos tokens CSS. Navegador confirmou foco no título e cores computadas de borda/placeholder. Sem auditoria completa de leitores de tela. Fuso dos registros demonstrativos: America/Manaus; política temporal definitiva do produto ainda não aprovada.


## Revisão visual posterior

O primeiro Preview foi rejeitado por Hilton. A revisão atual reaproveita os CSS originais do painel, estrutura de header/sidebar/main, dimensões e pesos reais; campos seguem referência marfim do NXT. Detalhes em docs/APLICATIVO-COERENCIA-VISUAL-2026-11-01.md. O seletor está no botão Versão de teste. Navegação principal e catálogo são demonstrativos.

Mobile segue o módulo de Eventos/Inscrições (menu superior/drawer e retorno no cabeçalho); a barra inferior experimental foi retirada. Voltar é histórico interno da demonstração e não intercepta o botão de voltar do navegador.

Atualização mais recente: a pedido de Hilton, aplicada a proposta de Claude para barra flutuante mobile de5acessos (Início/Eventos/Contribuir/Cadastro/Mais), preservando drawer e controlador do módulo de Eventos. Esta decisão supera o registro anterior de barra retirada. Gestão usa só o menu; campos focados ocultam a barra.
