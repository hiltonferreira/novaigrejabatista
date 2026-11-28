#!/usr/bin/env python3
"""Organiza os backups e pastas de publicação na pasta inicial do cPanel (/home/novaigre).

Problema (28/11/2026): pastas de backup e de publicação ficaram soltas na pasta inicial
(nib-backup-nxt-*, nib-v197.xxxx, nib-backups-publicacao...) e misturadas dentro de nib-manutencao.
Este script junta tudo em ~/nib-manutencao, numa estrutura fixa, e escreve um LEIA-ME com o índice.

Uso, no Terminal do cPanel, na pasta onde está este arquivo:
  python3 organizar-servidor.py                      -> só mostra o plano (nada muda)
  python3 organizar-servidor.py --apply              -> move as pastas (só mover, nada é apagado)
  python3 organizar-servidor.py --retencao           -> mostra o que a regra de retenção apagaria
  python3 organizar-servidor.py --retencao --apply   -> apaga só o que a regra manda (lista antes)

Nunca toca em: public_html, nib-app-privado, nib-inscricoes-privado, mail, etc, ssl, logs, tmp e pastas ocultas do cPanel.

Estrutura final:
  ~/nib-manutencao/
    LEIA-ME.md                 índice gerado por este script (o que é cada pasta e o tamanho)
    ferramentas/               scripts que ficam no servidor (backup-diario.php, dump-banco.php)
    backups/app/               cópia do /app antes de cada publicação (app-vNNN-DATA-xxxx)
    backups/banco/             dumps do banco antes de migrações (antes-*.sql.gz e pastas antes-*)
    backups/banco/diario/      dump automático diário (backup-diario.php)
    backups/inscricoes/diario/ cópia diária dos dados das inscrições (nib-inscricoes-privado)
    backups/site/              backups de mudanças no site, formulários e painel (NXT, células, comprovantes...)
    backups/completo/          backups completos de referência (backup-completo-DATA)
    backups/outros/            o que não deu para classificar pelo nome (conferir à mão)
    publicacoes/               área de trabalho de cada publicação (pacote + script), uma pasta por versão
    publicacoes/antigas/       pastas de publicação que estavam soltas na pasta inicial (nib-vNNN.xxxx)
    historico/                 registro de cada organização (o que saiu de onde e foi para onde)

Regra de retenção (combinada em 09/11/2026 e ajustada em 28/11/2026):
  - backups/app: ficam as 5 publicações mais recentes (backups/app-teste: 3).
  - publicacoes e publicacoes/antigas: ficam as 3 mais recentes (os pacotes estão no GitHub e nos arquivos do projeto).
  - backups/site e backups/outros: apaga o que tiver mais de 60 dias.
  - backups/banco: ficam os 10 mais recentes (antes de migração). backups/banco/diario e inscricoes/diario se
    limpam sozinhos (backup-diario.php: 14 dias + o primeiro de cada mês por 6 meses).
  - backups/completo: nunca apaga sozinho.
"""
import os, sys, re, shutil, time, json
from pathlib import Path

HOME = Path(os.environ.get('NIB_HOME', '/home/novaigre'))
MAN = HOME / 'nib-manutencao'
APPLY = '--apply' in sys.argv
RETENCAO = '--retencao' in sys.argv
PROTEGIDAS = {'public_html', 'public_ftp', 'nib-app-privado', 'nib-inscricoes-privado', 'nib-manutencao', 'mail', 'etc', 'ssl', 'logs', 'tmp', 'lscache', 'access-logs', 'www'}
ESTRUTURA = ['ferramentas', 'backups/app', 'backups/app-teste', 'backups/banco/diario', 'backups/inscricoes/diario', 'backups/site', 'backups/completo', 'backups/outros', 'publicacoes/antigas', 'historico']
FIXAS = {'LEIA-ME.md', 'ferramentas', 'backups', 'publicacoes', 'historico'}

def stop(m): print('INTERROMPIDO:', m); sys.exit(1)
def tamanho(p: Path) -> int:
    if p.is_symlink(): return 0
    if p.is_file(): return p.stat().st_size
    t = 0
    for r, _, fs in os.walk(p):
        for f in fs:
            try: t += os.lstat(os.path.join(r, f)).st_size
            except OSError: pass
    return t
def mb(n): return f'{n / 1048576:.1f} MB' if n >= 1048576 else f'{n // 1024} KB'

def destino_solta(nome: str):
    """Pastas soltas na pasta inicial."""
    if re.match(r'^nib-backup-', nome): return 'backups/site'
    if re.match(r'^nib-v\d+[.-]', nome): return 'publicacoes/antigas'
    if nome == 'nib-backups-publicacao': return 'backups/outros'
    if re.match(r'^(app-v\d+|antes-|backup-completo)', nome): return destino_interno(nome)
    return None

def destino_interno(nome: str):
    """Itens que já estão dentro de nib-manutencao, fora da estrutura."""
    if re.match(r'^app-v\d+', nome): return 'backups/app'
    if re.match(r'^antes-', nome) or nome.endswith('.sql.gz'): return 'backups/banco'
    if re.match(r'^backup-completo', nome): return 'backups/completo'
    if nome in ('publicacoes',): return None
    if re.match(r'^(publicacao|pub-|nib-v\d+)', nome): return 'publicacoes/antigas'
    if re.match(r'^(nxt|celulas|comprovante|obra|imagens|site|home|painel|inscric|mulheres|jornada|eventos|nib-backup)', nome, re.I): return 'backups/site'
    if re.match(r'^(dump-banco|backup-diario)\.php$', nome): return 'ferramentas'
    return 'backups/outros'

if not HOME.is_dir(): stop(f'pasta inicial não encontrada: {HOME}')
if not (HOME / 'public_html').is_dir(): stop('public_html não encontrado; confira NIB_HOME')

plano = []  # (origem, pasta_destino)
for p in sorted(HOME.iterdir()):
    n = p.name
    if n.startswith('.') or n in PROTEGIDAS or p.is_symlink(): continue
    d = destino_solta(n)
    if d: plano.append((p, d))
if MAN.is_dir():
    for p in sorted(MAN.iterdir()):
        n = p.name
        if n in FIXAS or n.startswith('.') or p.is_symlink(): continue
        d = destino_interno(n)
        if d: plano.append((p, d))

def alvo(origem: Path, pasta: str) -> Path:
    d = MAN / pasta / origem.name
    k = 2
    while d.exists(): d = MAN / pasta / f'{origem.name}-{k}'; k += 1
    return d

def escrever_leia_me():
    linhas = ['# nib-manutencao: backups e publicações da Nova Igreja Batista', '',
              f'Atualizado automaticamente por organizar-servidor.py em {time.strftime("%d/%m/%Y %H:%M")}.',
              'Documentação completa no GitHub: docs/SERVIDOR-ORGANIZACAO.md (repositório hiltonferreira/novaigrejabatista).', '',
              '## Regras', '',
              '- Nada de pasta solta na pasta inicial (/home/novaigre). Toda publicação trabalha em `publicacoes/vNNN-DATA/`.',
              '- Backup antes de publicar vai para `backups/<área>/`. Dump do banco antes de migração vai para `backups/banco/`.',
              '- Backup automático diário (banco + inscrições): `ferramentas/backup-diario.php`, pelo Cron do cPanel.',
              '- Retenção: `python3 organizar-servidor.py --retencao` mostra o que pode sair; com `--apply` apaga.', '',
              '## Conteúdo', '', '| Pasta | Itens | Tamanho |', '|---|---|---|']
    for sub in ESTRUTURA:
        p = MAN / sub
        if p.is_dir():
            itens = [x for x in p.iterdir() if not (sub in ('backups/banco',) and x.name == 'diario')]
            linhas.append(f'| `{sub}/` | {len(itens)} | {mb(tamanho(p))} |')
    linhas += ['', f'Total da pasta: {mb(tamanho(MAN))}.', '']
    (MAN / 'LEIA-ME.md').write_text('\n'.join(linhas), encoding='utf-8')

if RETENCAO:
    apagar = []
    def mais_novos(pasta, fica):
        p = MAN / pasta
        if not p.is_dir(): return
        itens = sorted([x for x in p.iterdir() if x.name not in ('antigas', 'diario')], key=lambda x: x.stat().st_mtime, reverse=True)
        apagar.extend(itens[fica:])
    mais_novos('backups/app', 5); mais_novos('backups/app-teste', 3); mais_novos('backups/banco', 10); mais_novos('publicacoes', 3); mais_novos('publicacoes/antigas', 3)
    limite = time.time() - 60 * 86400
    for pasta in ('backups/site', 'backups/outros'):
        p = MAN / pasta
        if p.is_dir(): apagar.extend(x for x in p.iterdir() if x.stat().st_mtime < limite)
    total = sum(tamanho(x) for x in apagar)
    print(f'RETENCAO: {len(apagar)} itens, {mb(total)}')
    for x in apagar: print('   APAGAR', x.relative_to(MAN), mb(tamanho(x)), time.strftime('%d/%m/%Y', time.localtime(x.stat().st_mtime)))
    if not APPLY: print('MODO_CONFERENCIA: nada foi apagado. Para apagar: python3 organizar-servidor.py --retencao --apply'); sys.exit(0)
    reg = MAN / 'historico' / f'retencao-{time.strftime("%Y%m%d-%H%M%S")}.txt'; reg.parent.mkdir(parents=True, exist_ok=True)
    reg.write_text('\n'.join(f'{x} {tamanho(x)}' for x in apagar) + '\n')
    for x in apagar:
        if x.is_dir() and not x.is_symlink(): shutil.rmtree(x)
        else: x.unlink()
    escrever_leia_me(); print('RETENCAO_OK registro em', reg); sys.exit(0)

total = 0
print(f'PLANO: {len(plano)} itens para organizar')
for origem, pasta in plano:
    t = tamanho(origem); total += t
    print(f'   {origem}  ->  ~/nib-manutencao/{pasta}/  ({mb(t)})')
print(f'TOTAL {mb(total)}')
if not APPLY:
    print('MODO_CONFERENCIA: nada foi alterado. Para organizar: python3 organizar-servidor.py --apply'); sys.exit(0)

MAN.mkdir(mode=0o700, exist_ok=True)
for sub in ESTRUTURA: (MAN / sub).mkdir(mode=0o700, parents=True, exist_ok=True)
registro = []
for origem, pasta in plano:
    d = alvo(origem, pasta)
    os.rename(origem, d)  # mesma partição: move sem copiar, nada é apagado
    registro.append({'de': str(origem), 'para': str(d)})
    print('MOVIDO', origem, '->', d)
reg = MAN / 'historico' / f'organizacao-{time.strftime("%Y%m%d-%H%M%S")}.json'
reg.write_text(json.dumps(registro, indent=1, ensure_ascii=False))
escrever_leia_me()
soltas = [p.name for p in HOME.iterdir() if not p.name.startswith('.') and p.name not in PROTEGIDAS and p.is_dir()]
print('ORGANIZACAO_OK', len(registro), 'itens; registro em', reg)
print('PASTA_INICIAL agora:', ', '.join(sorted(soltas)) or '(só as pastas do cPanel e as protegidas)')
print('PARA_DESFAZER: python3 -c "import json,os; [os.rename(x[\'para\'], x[\'de\']) for x in json.load(open(\'%s\'))]"' % reg)
