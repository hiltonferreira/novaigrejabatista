# Aplicativo Minha igreja — primeira versão de teste

Responsável: Codex. Revisor: Claude, pelo fluxo GitHub. Validação: Hilton.
Branch: codex/aplicativo-v1-preview. Base: d4889c4955cc991d93ec82a0b5378bbb9975d5da. Issue #11.

## Escopo autorizado

Em 01/11/2026 Hilton autorizou aplicar a primeira versão após corrigir a identidade visual e pediu análise de contraste sempre. Implementação isolada em aplicativo/, sem alterações de home, APIs ou inscrições em produção. O antigo módulo de Células foi descontinuado e não é a base deste aplicativo novo.

## Comportamento entregue

Interface estática responsiva com fontes e logo oficiais. Navegação do membro; solicitação fictícia de atualização, visível na gestão na mesma sessão; apresentação no culto com data passada e confirmação explícita para Secretaria ou Pastoral. Áreas de eventos, células e Generosidade indicam integrações pendentes. Não há pagamento real, login, persistência ou permissões de servidor. O seletor de demonstração não é controle de acesso. Recarregar reinicia todos os exemplos.

O reconhecimento como membro decorre da apresentação no culto, com reunião de integração e formulário. Não foi acrescentada aprovação pastoral obrigatória depois da Secretaria. Formulário atual em papel ainda indisponível; campos completos, menores, datas históricas desconhecidas e matriz de edição permanecem pendentes.

## Contraste

23 pares verificados: textos >=4,5:1 e foco/contornos >=3:1. Texto azul no branco 16,54:1; no marfim 13,77:1; texto secundário no fundo 5,80:1; contorno no marfim 3,85:1. Corrigidos cinza claro e contorno anteriores que falhavam. Laranja claro apenas em destaque sobre azul, sem texto pequeno laranja claro no branco.

Diretriz permanente: toda mudança visual deve conferir texto normal/hover/selecionado/desabilitado, foco de teclado e superfícies reais. Teste de pares não substitui auditoria completa de acessibilidade.

## Verificação

- node --check aplicativo/app.js.
- node --test aplicativo/contrast.test.cjs: 24 testes passaram (23 pares e ligação dos controles aos tokens reais do CSS).
- Navegador real: logo/fontes e navegação desktop; solicitação fictícia visível na Secretaria; rejeição de apresentação futura; apresentação passada registrada com autoria.
- Largura de 360px inspecionada em iframe de QA local; não equivale a dispositivo físico.
- Sem operação em cPanel, banco ou dados reais. Produção possui ajustes dos PRs #9 e #10 não integrados na main; não sobrescrever esses arquivos.

## Publicação

Vercel retornou 403 para a equipe; autorização solicitada. Preview remoto ainda não publicado. A pasta aplicativo/ está preparada para ser raiz de projeto separado com deployment Preview. Não configurar nem reutilizar o antigo projeto de Células automaticamente. Sem merge em main ou promoção a produção.


## Revisão Claude e correções

Revisão no PR #12: comentário 6563071101. O Claude leu o checkout, mas não confirmou SHAs completos via API nem executou testes; workflow terminou com erro após publicar análise, portanto revisão parcial. Codex verificou e corrigiu foco de navegação, contornos reais de inputs/atalhos, placeholder, seletor restaurado, estado vivo de mensagens, semântica do menu e tamanho de campos mobile. Testes finais: 24 verificações passaram, incluindo 23 pares de cores e ligação dos controles aos tokens CSS. Navegador confirmou foco no título e cores computadas de borda/placeholder. Sem auditoria completa de leitores de tela. Fuso dos registros demonstrativos: America/Manaus; política temporal definitiva do produto ainda não aprovada.
