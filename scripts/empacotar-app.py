#!/usr/bin/env python3
"""Gera o pacote de publicação do app (pasta aplicativo/) e atualiza scripts/publicar-app.py.
Uso, na raiz do repositório: python3 scripts/empacotar-app.py v88
Cria scripts/nib-app-v88.zip (lista do sw.js + sw.js + .htaccess + api/) e grava no publicar-app.py
a versão e o SHA-256 de cada arquivo, que ele confere no servidor antes de publicar."""
import re, sys, json, hashlib, zipfile
from pathlib import Path
REPO = Path(__file__).resolve().parent.parent
APP = REPO / 'aplicativo'
HERE = Path(__file__).resolve().parent
ver = sys.argv[1] if len(sys.argv) > 1 else ''
if not re.fullmatch(r'v\d+', ver): sys.exit('Informe a versão, por exemplo: python3 scripts/empacotar-app.py v88')
sw = (APP / 'sw.js').read_text()
files = [f for f in re.findall(r"'([^']+)'", re.search(r"const FILES = \[([\s\S]*?)\];", sw).group(1)) if f != './']
files += ['sw.js', '.htaccess'] + [str(p.relative_to(APP)) for p in sorted((APP / 'api').glob('*.php'))]
out = HERE / f'nib-app-{ver}.zip'
man = {}
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for n in sorted(set(files)):
        data = (APP / n).read_bytes(); man[n] = hashlib.sha256(data).hexdigest()
        zi = zipfile.ZipInfo(n, (2026, 11, 6, 0, 0, 0)); zi.compress_type = zipfile.ZIP_DEFLATED; zi.external_attr = 0o644 << 16
        z.writestr(zi, data)
pkg = {'zip_sha256': hashlib.sha256(out.read_bytes()).hexdigest(), 'files': man}
pub = HERE / 'publicar-app.py'
s = pub.read_text()
s = re.sub(r"^PKG = json\.loads\(.*\)$", lambda m: 'PKG = json.loads(' + repr(json.dumps(pkg)) + ')', s, count=1, flags=re.M)
s = re.sub(r"(nib-app-|app-|versão de teste )v\d+", lambda m: m.group(1) + ver, s)
pub.write_text(s)
print('OK', out.name, len(man), 'arquivos', pkg['zip_sha256'])
