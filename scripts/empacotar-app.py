#!/usr/bin/env python3
"""Gera nib-app-v87.zip a partir de aplicativo/ (mesma lista do sw.js + sw.js + .htaccess).
Uso, na raiz do repositório: python3 scripts/empacotar-app.py  -> cria scripts/nib-app-v87.zip
O publicar-app.py confere cada arquivo pelo SHA-256 antes de publicar."""
import re, zipfile
from pathlib import Path
REPO = Path(__file__).resolve().parent.parent
APP = REPO / 'aplicativo'
sw = (APP / 'sw.js').read_text()
files = [f for f in re.findall(r"'([^']+)'", re.search(r"const FILES = \[([\s\S]*?)\];", sw).group(1)) if f != './']
out = Path(__file__).resolve().parent / 'nib-app-v87.zip'
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for n in sorted(files + ['sw.js', '.htaccess']):
        zi = zipfile.ZipInfo(n, (2026, 11, 6, 0, 0, 0)); zi.compress_type = zipfile.ZIP_DEFLATED; zi.external_attr = 0o644 << 16
        z.writestr(zi, (APP / n).read_bytes())
print('OK', out)
