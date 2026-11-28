#!/usr/bin/env python3
"""Monta aplicativo/app.js e aplicativo/app.css a partir das partes em aplicativo/fonte/.

Por que existe: app.js e app.css passam de 300 KB cada. Editar em partes menores (por tela/assunto) é mais
seguro. O arquivo que vai ao ar continua sendo um só (app.js e app.css), montado juntando as partes na ordem
do nome (01-, 02-, ...). Nada muda para o celular.

Uso, na raiz do repositório:
  python3 scripts/montar-app.py              -> junta as partes e grava app.js e app.css
  python3 scripts/montar-app.py --conferir   -> só confere se app.js/app.css estão iguais às partes (usado nos testes)
Regra: edite as partes em aplicativo/fonte/ e rode este script. Se editar app.js/app.css direto, a conferência
falha; nesse caso rode  python3 scripts/montar-app.py --separar  para levar a mudança de volta às partes.
"""
import sys
from pathlib import Path
APP = Path(__file__).resolve().parent.parent / 'aplicativo'
ALVOS = {'app.js': APP / 'fonte' / 'js', 'app.css': APP / 'fonte' / 'css'}

def partes(pasta): return sorted(pasta.glob('*.' + ('js' if pasta.name == 'js' else 'css')))
def juntar(pasta): return ''.join(p.read_text(encoding='utf-8') for p in partes(pasta))

def separar(nome, pasta):
    """Leva o conteúdo atual de app.js/app.css de volta às partes, mantendo os mesmos pontos de corte
    (cada parte começa pela mesma primeira linha de antes)."""
    texto = (APP / nome).read_text(encoding='utf-8'); arquivos = partes(pasta)
    inicios = [p.read_text(encoding='utf-8').split('\n', 1)[0] + '\n' for p in arquivos]
    pos = [0]; cursor = 0
    for ini in inicios[1:]:
        i = texto.find('\n' + ini, cursor)
        if i < 0: sys.exit(f'ERRO: não achei o começo da parte "{ini.strip()[:60]}" em {nome}. Separe à mão.')
        pos.append(i + 1); cursor = i + 1
    pos.append(len(texto))
    for arq, a, b in zip(arquivos, pos, pos[1:]): arq.write_text(texto[a:b], encoding='utf-8')

modo = sys.argv[1] if len(sys.argv) > 1 else ''
erros = 0
for nome, pasta in ALVOS.items():
    if modo == '--separar':
        separar(nome, pasta); print('SEPARADO', nome); continue
    montado = juntar(pasta)
    if modo == '--conferir':
        if (APP / nome).read_text(encoding='utf-8') != montado:
            print(f'DIFERENTE: aplicativo/{nome} não é a junção de aplicativo/fonte/{pasta.name}/. Rode python3 scripts/montar-app.py (ou --separar se editou o {nome} direto).'); erros += 1
        else: print('OK', nome, len(partes(pasta)), 'partes')
    else:
        (APP / nome).write_text(montado, encoding='utf-8'); print('MONTADO', nome, len(partes(pasta)), 'partes', len(montado.encode()), 'bytes')
sys.exit(1 if erros else 0)
