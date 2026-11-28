#!/usr/bin/env python3
"""Instala o comprovante mais leve nos formulários do site (pedido de Hilton, 09/11/2026).

Copia assets/comprovante-leve.js para public_html/assets/ e acrescenta a linha
  <script defer src="/assets/comprovante-leve.js?v=1"></script>
logo antes do </body> das três páginas que recebem comprovante de Pix:
  mulheres-virtuosas.html, next/camp-sbgp1-nov26/inscricao.html e eventos/index.php.
Edita os arquivos de PRODUÇÃO (que podem ser diferentes do Git) só nesse ponto.

Uso, no Terminal do cPanel, com este script e o comprovante-leve.js na mesma pasta:
  python3 comprovante-leve-instalar.py /home/novaigre/public_html            -> só confere
  python3 comprovante-leve-instalar.py /home/novaigre/public_html --apply    -> grava, com backup
"""
import os, shutil, sys, time

PAGINAS = ['mulheres-virtuosas.html', 'next/camp-sbgp1-nov26/inscricao.html', 'eventos/index.php']
LINHA = '<script defer src="/assets/comprovante-leve.js?v=1"></script>\n'
JS = 'comprovante-leve.js'

def main():
  if len(sys.argv) < 2: sys.exit(__doc__)
  raiz, apply = sys.argv[1].rstrip('/'), '--apply' in sys.argv
  aqui = os.path.dirname(os.path.abspath(__file__))
  js = os.path.join(aqui, JS)
  if not os.path.isfile(js): sys.exit('FALTA: ' + JS + ' na mesma pasta deste script')
  novos = {}
  for p in PAGINAS:
    f = os.path.join(raiz, p)
    if not os.path.isfile(f): sys.exit('NAO_ENCONTRADO: ' + f)
    s = open(f, encoding='utf-8').read()
    if 'comprovante-leve.js' in s: print('JA_TEM: ' + p); continue
    if 'name="receipt"' not in s and "name='receipt'" not in s: print('PULADO_SEM_CAMPO_RECEIPT: ' + p + ' (inscrições encerradas, nada a fazer)'); continue
    n = s.count('</body>')
    if n != 1: sys.exit(f'BODY_{n}x: ' + p)
    novos[f] = s.replace('</body>', LINHA + '</body>')
    print('CONFERIDO: ' + p)
  if not novos: sys.exit('NADA_A_FAZER')
  if not apply: print('Nada foi alterado. Rode de novo com --apply para gravar.'); return
  bak = os.path.expanduser('~/nib-manutencao/comprovante-leve-' + time.strftime('%Y%m%d-%H%M%S'))
  os.makedirs(bak, mode=0o700)
  for f in novos: shutil.copy2(f, os.path.join(bak, f[len(raiz) + 1:].replace('/', '__')))
  destino = os.path.join(raiz, 'assets', JS)
  if os.path.exists(destino): shutil.copy2(destino, os.path.join(bak, 'assets__' + JS))
  shutil.copy2(js, destino); os.chmod(destino, 0o644)
  for f, s in novos.items():
    tmp = f + '.novo'; open(tmp, 'w', encoding='utf-8').write(s); shutil.copymode(f, tmp); os.replace(tmp, f)
  print('APLICADO. Backup: ' + bak)

main()
