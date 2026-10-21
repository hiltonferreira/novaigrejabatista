# Nova Igreja Batista — site e inscrições

Código do site ativo em https://novaigrejabatista.com.br/, sincronizado do cPanel em 21/10/2026.

## Estrutura

- `index.html`: site principal e carrossel de eventos.
- `assets/`, `fonts/`, `img/`, `video/`: recursos do site.
- `inscricoes/`: painel unificado, gestão de eventos e autenticação geral.
- `consulta-inscricao/`: consulta pública de inscrições.
- `eventos/`: páginas e formulários de eventos cadastrados no painel.
- `next/camp-sbgp1-nov26/`: página, formulário e API do NXT CAMP.
- `mulheres-virtuosas.html` e `api/mulheres-inscricao.php`: inscrição Mulheres Virtuosas.
- `mulheres-virtuosas/`, `jornada-dna/` e `nxt-camp/`: URLs de compartilhamento.
- `linkdabio/`: página de links da igreja.
- `inscricoes-mulheres.php`, `inscricoes-nxt.php` e `next-camp/`: interfaces anteriores ainda presentes em produção.
- `.htaccess`: compatibilidade das rotas antigas e configuração Apache.

## Execução e implantação

O ambiente ativo usa Apache/PHP no cPanel. Os scripts requerem PHP 8.1 ou superior e armazenamento gravável fora da raiz pública. Servidores estáticos, incluindo GitHub Pages, não executam o painel nem as APIs PHP. O Portal NIB é outro repositório e continua separado deste site.

A pasta privada `nib-inscricoes-privado/` fica ao lado de `public_html/`, fora deste repositório. Ela contém catálogo, configurações de acesso, inscrições e comprovantes. Esses dados e senhas devem permanecer no servidor. Copiar somente o repositório para outro ambiente não transfere os registros nem configura o acesso administrativo.

Este commit registra os arquivos de produção; atualizar o Git não publica automaticamente alterações no cPanel. Antes de implantar mudanças, fazer backup e preservar integralmente o armazenamento privado. Não executar sincronização destrutiva sobre a pasta privada nem copiar senhas para o Git.

## Pagamentos

A integração por cartão Sipag para o NXT CAMP ainda está em discussão. Nenhuma integração automática de pagamento foi adicionada nesta sincronização.

Ver `docs/SINCRONIZACAO-2026-10-21.md` para o escopo e a verificação desta cópia.
