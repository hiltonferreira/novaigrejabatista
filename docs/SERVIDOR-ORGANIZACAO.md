# Organização do servidor, backups e ambiente de teste

Atualizado em 28/11/2026. Vale para todos que publicam no cPanel (GPT/Codex, Claude). Substitui a seção "Regra para publicações" de 09/11/2026 em `docs/ESTRUTURA-PASTAS.md`.

## Por que

Em 28/11/2026 a pasta inicial do cPanel (`/home/novaigre`) tinha mais de 20 pastas soltas de backup e de publicação (`nib-backup-nxt-*`, `nib-v197.xxxx` a `nib-v201.xxxx`, `nib-backups-publicacao`), além de backups misturados dentro de `nib-manutencao`. Ficou difícil saber o que é cada coisa e o que pode sair. A partir daqui tudo tem lugar fixo e a ferramenta `organizar-servidor.py` mantém a ordem.

## Pasta inicial (`/home/novaigre`)

Só ficam estas pastas, além das do cPanel (`mail`, `etc`, `ssl`, `logs`, `tmp`, `lscache`, `public_ftp` e as ocultas):

| Pasta | O que é | Pode apagar? |
|---|---|---|
| `public_html/` | Site, app (`public_html/app`) e app de teste (`public_html/app-teste`). | Não. |
| `nib-app-privado/` | Configuração do app (`config.php`: banco, chaves do Google) e do teste (`config-teste.php`). | Não. |
| `nib-inscricoes-privado/` | Dados das inscrições (JSON) e configuração do painel. | Não. |
| `nib-manutencao/` | Backups, publicações e ferramentas. Estrutura abaixo. | Segue a retenção. |
| `teste.novaigrejabatista.com.br/` | Reservado para uma futura versão de teste do **site** (Hilton, 28/11/2026). O app de teste não fica aqui. | Não apague sem combinar. |

**Nenhuma outra pasta solta.** Quem publica trabalha dentro de `nib-manutencao/publicacoes/`.

## Dentro de `nib-manutencao/`

```
nib-manutencao/
  LEIA-ME.md                 índice com tamanhos, gerado pelo organizar-servidor.py
  ferramentas/               backup-diario.php, dump-banco.php, preparar-teste.php, organizar-servidor.py
  backups/app/               cópia do /app antes de cada publicação (publicar-app.py grava aqui)
  backups/app-teste/         idem, para o ambiente de teste
  backups/banco/             dump do banco antes de migração (antes-vNNN-DATA.sql.gz)
  backups/banco/diario/      dump automático diário (app-AAAAMMDD.sql.gz)
  backups/inscricoes/diario/ cópia diária de nib-inscricoes-privado (inscricoes-AAAAMMDD.tar.gz)
  backups/site/              backups de mudanças no site, formulários e painel (NXT, células, comprovantes...)
  backups/completo/          backups completos de referência (backup-completo-DATA)
  backups/outros/            o que não deu para classificar pelo nome
  backups/backup-diario.log  uma linha por dia com o resultado do backup automático
  publicacoes/vNNN-DATA/     área de trabalho de cada publicação (zip + script). Apague o zip depois de confirmar.
  publicacoes/antigas/       pastas de publicação antigas que estavam soltas
  historico/                 registro de cada organização e de cada limpeza (de onde saiu, para onde foi)
```

## Retenção (o que pode sair)

`python3 ~/nib-manutencao/ferramentas/organizar-servidor.py --retencao` lista o que sai; com `--apply` apaga e registra em `historico/`.

| Pasta | Fica |
|---|---|
| `backups/app` | as 5 publicações mais recentes |
| `backups/banco` | os 10 dumps mais recentes antes de migração |
| `backups/banco/diario`, `backups/inscricoes/diario` | 14 dias + o dia 1º de cada mês por 6 meses (o próprio backup-diario.php limpa) |
| `publicacoes`, `publicacoes/antigas` | as 3 mais recentes (pacotes também estão no GitHub e nos arquivos do projeto) |
| `backups/site`, `backups/outros` | o que tiver até 60 dias |
| `backups/completo` | tudo (nunca apaga sozinho) |

## Backup automático diário

`ferramentas/backup-diario.php`, pelo Cron do cPanel, todo dia às 3h15 (horário do servidor):

```
15 3 * * * php /home/novaigre/nib-manutencao/ferramentas/backup-diario.php >/dev/null 2>&1
```

Faz o dump do banco do app pelo PHP (o PHP do servidor não chama o `mysqldump`), com as colunas binárias (fotos, capas) em hexadecimal; copia `nib-inscricoes-privado` em `.tar.gz`; aplica a retenção; limpa sessões vencidas do app; escreve o resultado em `backups/backup-diario.log`. Arquivos com permissão 600.

Conferir: `tail -5 ~/nib-manutencao/backups/backup-diario.log` (cada linha começa com `OK` ou `FALHA`).

Fotos de perfil e capas das pílulas (a maior parte do banco quando houver 1.500 pessoas, uns 60 MB) vão em `fotos-AAAAMMDD.sql.gz` só aos domingos, no dia 1º e quando ainda não houver nenhum (ou com `--fotos`); ficam as 4 últimas semanas + o dia 1º de cada mês por 6 meses. O resto do banco vai todo dia em `app-AAAAMMDD.sql.gz`.

Restaurar o banco (só com combinação prévia com Hilton): primeiro `gzip -dc backups/banco/diario/app-AAAAMMDD.sql.gz | mysql <banco>`, depois o `fotos-*.sql.gz` mais recente do mesmo jeito.

Estimativa com 1.500 pessoas (28/11/2026): banco ~100 MB após um ano (fotos ~60 MB, check-ins ~25 MB/ano); backup diário < 10 MB; total de backups abaixo de 1 GB. Plano atual: 19,5 GB de disco.

## Publicar o app (fluxo atualizado)

1. Claude abre o PR e comenta o pedido de publicação com o SHA do pacote.
2. O GPT cria `~/nib-manutencao/publicacoes/vNNN-AAAAMMDD/`, coloca ali o `nib-app-vNNN.zip` e o `publicar-app.py`, e roda dali.
3. Se houver migração: antes, `php ~/nib-manutencao/ferramentas/dump-banco.php ~/nib-manutencao/backups/banco/antes-vNNN-AAAAMMDD.sql.gz`.
4. `python3 publicar-app.py` (confere) e `python3 publicar-app.py --apply` (publica; backup em `backups/app/`).
5. Depois de confirmar, apaga o zip da pasta da publicação.

## App de teste (`novaigrejabatista.com.br/app-teste`)

Serve para conferir uma versão nova (e principalmente uma migração do banco) antes de ir para o app real. Fica em `public_html/app-teste` (Hilton, 28/11/2026: o subdomínio `teste.` fica para uma futura versão de teste do site).

- **Banco próprio** (`novaigre_appteste`), configurado em `~/nib-app-privado/config-teste.php`. O servidor reconhece o caminho `/app-teste/` (e também o endereço `teste.`) e usa só esse arquivo; se ele não existir, o teste para com erro em vez de usar o banco real (`aplicativo/api/conta-lib.php`, `nib_ambiente_teste`).
- **Separado do app oficial no mesmo navegador**: o cookie de sessão do teste vale só para `/app-teste/`; os dados guardados no aparelho ganham o prefixo `teste:` (`aplicativo/ambiente.js`); o cache do service worker do teste se chama `nib-teste-…` e o do oficial `nib-app-…`, e um nunca apaga o do outro.
- **Dados inventados (decisão do Hilton, 28/11/2026)**: `php ~/nib-manutencao/ferramentas/preparar-teste.php --ficticio --apply` cria as tabelas, traz só as contas da administração (nome, e-mail e senha) e inventa pessoas, pedidos, avisos e check-ins. Nenhum dado de membro sai do banco real. (Existe também a cópia protegida, sem `--ficticio`, só com novo pedido do Hilton.)
- **Publicar no teste**: `python3 publicar-app.py --teste --apply` (mesmo pacote; grava em `public_html/app-teste`, backup em `backups/app-teste/`).
- O teste tem `noindex` (não aparece no Google), precisa de login e não envia notificações (o banco de teste não tem inscrições de notificação).

Banco de teste (já criado em 28/11/2026): `novaigre_appteste`, com usuário próprio. A senha fica só no `config-teste.php` (permissão 600; nunca no Git nem em comentário do GitHub).
