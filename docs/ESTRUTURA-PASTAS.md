# Estrutura das pastas (repositório e servidor)

Atualizado em 09/11/2026. O repositório espelha o `public_html` do site: cada pasta da raiz é um endereço de novaigrejabatista.com.br. Mudar uma pasta de lugar quebra o link correspondente. Por isso a raiz não é reorganizada; este documento explica o que é cada coisa.

## Raiz do repositório = raiz do site

| Pasta ou arquivo | Endereço | O que é |
|---|---|---|
| `index.html` | `/` | Página inicial do site. O painel de inscrições reescreve trechos marcados (NIB-MANAGED), então compare com produção antes de subir. |
| `aplicativo/` | `/app/` | App da igreja (Plataforma Nib). No servidor fica em `public_html/app`. Publicação por pacote: `scripts/empacotar-app.py` e `scripts/publicar-app.py`. |
| `inscricoes/` | `/inscricoes/` | Painel administrativo de inscrições e eventos (PWA). |
| `eventos/` | `/eventos/` | Página pública de cada evento, gerada pelo catálogo de eventos. |
| `consulta-inscricao/` | `/consulta-inscricao/` | Consulta da inscrição pelo participante. |
| `next/camp-sbgp1-nov26/` | `/next/camp-sbgp1-nov26/` | Formulário de inscrição do NXT CAMP. |
| `api/` | `/api/` | Recebimento das inscrições do Mulheres Virtuosas. |
| `linkdabio/` | `/linkdabio/` | Página de links do Instagram. |
| `jornada-dna/` | `/jornada-dna/` | Página da Jornada DNA. |
| `mulheres-virtuosas.html` | `/mulheres-virtuosas.html` | Página do Mulheres Virtuosas. |
| `privacidade.html`, `robots.txt`, `sitemap.xml` | mesmos nomes | Política de privacidade e arquivos para buscadores. |
| `dados/obra.json` | `/dados/obra.json` | Fonte única do andamento da obra (site e app leem daqui). |
| `assets/`, `img/`, `fonts/`, `video/` | mesmos nomes | Estilos, imagens, fontes e vídeos do site. |
| `.htaccess`, `.user.ini`, `php.ini` | não abrem no navegador | Configuração do Apache e do PHP. Os dois `.ini` são gerados pelo cPanel. |

### Endereços antigos mantidos de propósito

Estes arquivos só redirecionam para o endereço atual. Ficam porque os links já foram divulgados em grupos e redes sociais.

| Arquivo | Redireciona para |
|---|---|
| `nxt-camp/index.html` | `/next/camp-sbgp1-nov26/` |
| `next-camp/index.php` | endereço antigo do NXT CAMP |
| `mulheres-virtuosas/index.html` | `/mulheres-virtuosas.html` |
| `inscricoes-mulheres.php`, `inscricoes-nxt.php` | painéis antigos, substituídos por `/inscricoes/` |

### Imagens em JPG/PNG que parecem sem uso

As versões `.webp` substituíram várias imagens em 06/11/2026. Os originais `.jpg`/`.png` continuam no repositório e no servidor. O `index.html` de produção e os JSON privados do painel (fora do Git) podem ainda apontar para eles. Não apague sem antes procurar o nome do arquivo em produção (`public_html` e `nib-inscricoes-privado`).

Os únicos candidatos claros a remoção são as versões antigas da imagem de compartilhamento do painel: `assets/gestao-inscricoes-compartilhar-v411.png`, `-v412.png` e `-v415.png`, cerca de 3,2 MB no total. A versão atual é a `-v416`.

## Fora do Git

| Pasta | O que é |
|---|---|
| `scripts/` | Ferramentas de publicação e manutenção, que rodam no Terminal do cPanel e não vão para o site. Os `.zip` gerados ficam fora do Git. |
| `docs/` | Decisões, estado atual e fluxo de trabalho entre Claude e Codex. |
| `.github/` | Integração do Claude com o GitHub. |

## Servidor (pasta inicial `/home/novaigre`)

| Pasta | Pode apagar? |
|---|---|
| `public_html/` | Não. É o site e o app. |
| `nib-inscricoes-privado/` | Não. Dados das inscrições e configuração do painel. |
| `nib-app-privado/` | Não. Configuração do app, com as chaves do Google e do banco. |
| `mail/`, `etc/`, `ssl/`, `logs/`, `.` (arquivos ocultos) | Não. São do cPanel. |
| `nib-manutencao/` | Backups e cópias de publicação. Seguem a regra abaixo. |

### Regra para publicações (combinada em 09/11/2026)

1. Cada publicação nova trabalha dentro de `~/nib-manutencao/publicacoes/`, nunca solta na pasta inicial.
2. Ao terminar, apague o `source.tgz` (cópia inteira do repositório, cerca de 56 MB) e qualquer arquivo extraído para montar o pacote.
3. Guarde só o backup dos arquivos substituídos e o dump do banco (`antes.sql.gz`).
4. Mantenha os backups das 3 publicações mais recentes do app e da última de cada outra área (site, painel, NXT). Apague os mais antigos depois que a publicação seguinte for confirmada.
5. O backup completo de 20/10/2026 (`nib-manutencao/auditoria-2026-10-20`) fica como referência até existir outro backup completo mais novo.
