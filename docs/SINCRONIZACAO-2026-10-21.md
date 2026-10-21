# Sincronização com a produção — 21/10/2026

Origem: `/home/novaigre/public_html` no cPanel da Nova Igreja Batista.
Destino: branch `main` de `hiltonferreira/novaigrejabatista`.
Commit anterior: `4466047e134e10f445186e2a47871abf28a60afc`.

## Escopo

Cópia dos 153 arquivos regulares do site em produção, incluindo home, eventos, formulários, APIs, painel unificado, consulta, fontes, mídia, ícones, navegação e banner aprovado de compartilhamento (`assets/gestao-inscricoes-compartilhar-v416.png`). Todos esses arquivos são mantidos com o mesmo conteúdo da cópia do servidor. Os recursos antigos que continuam em produção também foram preservados.

Arquivos presentes no Git antigo e ausentes na produção foram retirados da árvore atual; continuam recuperáveis pelo histórico Git e pela branch de preservação anterior à sincronização. Isso inclui fontes e recursos que foram arquivados na auditoria do cPanel.

Não foram incluídos dados de participantes, comprovantes, senhas, arquivos privados, backups, logs ou desafios temporários de certificado. As configurações PHP versionadas são as existentes na raiz pública e não contêm credenciais.

## Dependências operacionais

O código acessa `../nib-inscricoes-privado/` em relação à raiz pública. As configurações `administracao-eventos.json`, `administracao-mulheres.json`, `administracao-nxt.json` e `eventos-catalogo.json` pertencem ao armazenamento privado do ambiente; não constam neste repositório. Novos ambientes precisam de configuração própria antes de receber inscrições reais.

## Integridade

Arquivo de origem privado no servidor: `nib-git-snapshot-20261021.zip`.
SHA-256: `9a161e3afc3dfcc1f587b5c40fb5636f6b80f9995772f9bfbe1bb5b107b5bbc9`.

A sincronização não altera arquivos do site ativo. A conferência compara os hashes Git de todos os 153 arquivos copiados e verifica a sintaxe dos PHP no servidor.
