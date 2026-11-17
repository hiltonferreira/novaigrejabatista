"""Atualiza o endereço das células Jeová Jireh e Casa de Israel (2026-11-17).

Mexe só em dois lugares, os únicos que guardam os endereços das células:
  1. public_html/index.html      -> cartões da seção #celulas da home (o app lê daqui)
  2. public_html/app/site-data.js -> cópia de reserva que o app usa se estiver sem internet

Uso, no Terminal do cPanel, na pasta deste arquivo:
  python3 celulas-enderecos-2026-11-17.py           -> só confere, não altera nada
  python3 celulas-enderecos-2026-11-17.py --apply   -> publica, com backup em ~/nib-manutencao
Teste local (sem servidor): python3 celulas-enderecos-2026-11-17.py --test index.html site-data.js
"""
import hashlib, os, shutil, sys, tempfile, time
from pathlib import Path

ANTIGO = 'Rua Moema, Jardim Jorge Teixeira'
NOVOS = {
    'Jeová Jireh': 'Rua Aracaju, 2655, Setor 03, abaixo da Avenida Tabapuã',
    'Casa de Israel': 'Rua São Vicente (10ª rua), 2122, Setor 03',
}


def trocar_no_bloco(s, inicio_nome, fim_bloco, antigo, novo, rotulo):
    """Troca `antigo` por `novo` só dentro do bloco da célula. Devolve (texto, situação)."""
    assert s.count(inicio_nome) == 1, rotulo + ': célula não encontrada uma única vez'
    i = s.index(inicio_nome)
    j = s.find(fim_bloco, i + len(inicio_nome))
    j = len(s) if j < 0 else j
    bloco = s[i:j]
    if bloco.count(novo) == 1 and antigo not in bloco:
        return s, 'já estava atualizado'
    assert bloco.count(antigo) == 1, rotulo + ': endereço antigo não confere (alguém mudou?)'
    return s[:i] + bloco.replace(antigo, novo, 1) + s[j:], 'atualizado'


def ajustar_html(data):
    s = data.decode('utf-8')
    for nome, novo in NOVOS.items():
        s, sit = trocar_no_bloco(s, '<span class="mc-nome">' + nome + '</span>', '<div class="mc">',
                                 '<span>' + ANTIGO + '</span>', '<span>' + novo + '</span>', 'home/' + nome)
        print('HOME', nome + ':', sit)
    return s.encode('utf-8')


def ajustar_js(data):
    s = data.decode('utf-8')
    for nome, novo in NOVOS.items():
        s, sit = trocar_no_bloco(s, '"nome": "' + nome + '"', '{"nome": ',
                                 '"local": "' + ANTIGO + '"', '"local": "' + novo + '"', 'app/' + nome)
        print('APP', nome + ':', sit)
    return s.encode('utf-8')


def gravar(p, novo, backup):
    antigo = p.read_bytes()
    if antigo == novo:
        return
    shutil.copy2(p, backup / p.name)
    assert (backup / p.name).read_bytes() == antigo
    fd, tmp = tempfile.mkstemp(prefix='.nib-celulas-', dir=p.parent)
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(novo)
        shutil.copymode(p, tmp)
        assert p.read_bytes() == antigo, str(p) + ' mudou durante a publicação'
        os.replace(tmp, p)
        assert p.read_bytes() == novo
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


if __name__ == '__main__':
    if '--test' in sys.argv:
        h, j = sys.argv[sys.argv.index('--test') + 1:][:2]
        Path(h).write_bytes(ajustar_html(Path(h).read_bytes()))
        Path(j).write_bytes(ajustar_js(Path(j).read_bytes()))
        sys.exit(0)
    home = Path.home()
    html = home / 'public_html' / 'index.html'
    js = home / 'public_html' / 'app' / 'site-data.js'
    for p in (html, js):
        assert p.is_file() and not p.is_symlink(), 'não encontrado: ' + str(p)
    novo_html = ajustar_html(html.read_bytes())
    novo_js = ajustar_js(js.read_bytes())
    if '--apply' not in sys.argv:
        print('MODO_CONFERENCIA: nada foi alterado. Para publicar: python3', Path(__file__).name, '--apply')
        sys.exit(0)
    base = home / 'nib-manutencao'
    base.mkdir(exist_ok=True)
    backup = Path(tempfile.mkdtemp(prefix='celulas-enderecos-' + time.strftime('%Y%m%d-%H%M%S') + '-', dir=base))
    os.chmod(backup, 0o700)
    gravar(html, novo_html, backup)
    gravar(js, novo_js, backup)
    print('PUBLICADO: endereços de Jeová Jireh e Casa de Israel')
    print('BACKUP:', backup)
    print('SHA256 index.html:', hashlib.sha256(html.read_bytes()).hexdigest())
    print('SHA256 app/site-data.js:', hashlib.sha256(js.read_bytes()).hexdigest())
