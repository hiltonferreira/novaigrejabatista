# App da Nova Igreja Batista (Nib)

Aplicativo dos membros, em produção em https://novaigrejabatista.com.br/app/ (no servidor: `public_html/app`). Instalável no celular (PWA), com contas reais em banco MySQL no cPanel.

Atualizado em 28/11/2026. O histórico das versões de teste de 01/11/2026 está em `docs/APLICATIVO-V1-2026-11-01.md` e `docs/APLICATIVO-COERENCIA-VISUAL-2026-11-01.md`.

## Dois modos no mesmo código

- **Oficial** (endereço novaigrejabatista.com.br ou teste.novaigrejabatista.com.br): só dados reais. Entrar/criar cadastro, caderno de oração, check-in, avisos, pílulas, agenda, células, contribuição por Pix e a área da equipe (Secretaria, Liderança Pastoral, administração), com o perfil conferido no servidor.
- **Demonstração** (`/app/?demo` ou qualquer outro endereço): dados fictícios em memória, usada para apresentar ideias. `admin.js` guarda a demonstração da gestão.

## Onde está cada coisa

| Arquivo/pasta | O que é |
|---|---|
| `index.html`, `conheca.html` | Página do app e página "Conheça o aplicativo". |
| `fonte/js/`, `fonte/css/` | O código do app em partes, por assunto. **Edite aqui** e rode `python3 scripts/montar-app.py` (gera `app.js` e `app.css`). Ver `fonte/LEIA-ME.md`. |
| `app.js`, `app.css` | Arquivos montados que vão ao ar. Não edite direto. |
| `conta.js` | Conversa com o servidor (contas, caderno, check-in, pílulas...). |
| `site-data.js` | Células, eventos e liderança vindos do site. |
| `daily-content.js`, `verses.js` | Versículo do dia. |
| `pix.js`, `moderation.js`, `icons.js`, `install.js` | Pix, filtro de palavras do caderno, ícones e instalação no celular. |
| `sw.js` | Guarda o app no celular. Ao mudar qualquer arquivo, rode `node sw-version.cjs --write` (o teste falha sem isso e o celular não recebe a versão nova). |
| `api/` | Servidor em PHP: `conta.php` (contas, membros, perfis), `caderno.php`, `checkin.php`, `avisos.php`, `eventos*.php`, `pilulas*.php`, `youtube*.php`, `lembretes.php` (cron). Biblioteca comum e migrações do banco em `conta-lib.php` (`NIB_MIGRACAO`). |
| `.htaccess` | Cabeçalhos de segurança (CSP, moldura), compressão e cache. Serviço externo novo (vídeo, imagens) precisa entrar na CSP. |
| `assets/` | Fontes Acumin (5 espessuras, todas usadas), imagens em WebP, ícones. |

A configuração com senhas fica fora do site: `~/nib-app-privado/config.php` (e `config-teste.php` no ambiente de teste). Nunca no Git.

## Testes

Na raiz do repositório:

```
python3 scripts/montar-app.py --conferir     # app.js/app.css iguais às partes
node --test aplicativo/*.test.cjs            # contraste, Pix, versículo, moderação, service worker
bash testes/app-api/rodar.sh                 # servidor: cadastro, entrada, perfis, caderno, senha, exclusão (precisa de MySQL/MariaDB local)
```

O GitHub roda tudo isso a cada PR (`.github/workflows/testes-app.yml`).

## Publicar

1. `python3 scripts/empacotar-app.py vNNN` gera o pacote e atualiza `scripts/publicar-app.py` com o SHA de cada arquivo.
2. PR + comentário com o pedido de publicação; o GPT publica seguindo `docs/SERVIDOR-ORGANIZACAO.md` (pasta da publicação, dump antes de migração, backup em `nib-manutencao/backups/app`).
3. Para testar antes: `python3 publicar-app.py --teste --apply` publica em teste.novaigrejabatista.com.br/app.

## Regras de design (Hilton)

- Nunca cortar texto com reticências ("…").
- Imagens sempre em WebP, cada vez mais leves sem perder qualidade.
- Capas de vídeo com bom enquadramento (sem cortar a cabeça) e a pessoa olhando para a câmera.
- Letra mínima de 12 px em textos de leitura; etiquetas em maiúsculas, selos e a barra inferior seguem o desenho atual.
