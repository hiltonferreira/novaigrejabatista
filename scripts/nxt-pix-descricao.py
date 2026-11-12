#!/usr/bin/env python3
"""Pix do NXT CAMP com descrição e identificador (pedido de Hilton, 08/11/2026).

Troca o Pix Copia e Cola e o QR Code da página de inscrição por um Pix de R$ 80 que leva
a descrição "Inscricao NXT Camp" (campo 26-02) e o identificador NXTCAMP (campo 62-05).
Assim, no banco da igreja, o Pix recebido mostra que é inscrição do NXT Camp.

Uso: python3 scripts/nxt-pix-descricao.py CAMINHO/next/camp-sbgp1-nov26/inscricao.html [--apply]
Edita o arquivo de PRODUÇÃO por troca de trechos. Sem --apply só confere.
Antes do --apply: copiar img/pix-nxt-camp-80-v2.png para a pasta img/ ao lado da página e fazer backup.
"""
import sys, os

ANTIGO = '00020126360014br.gov.bcb.pix011440518758000130520400005303986540580.005802BR5919NOVA IGREJA BATISTA6009ARIQUEMES62070503***63047D99'
NOVO = '00020126580014br.gov.bcb.pix0114405187580001300218Inscricao NXT Camp520400005303986540580.005802BR5919NOVA IGREJA BATISTA6009ARIQUEMES62110507NXTCAMP63043300'
TROCAS = [
  (ANTIGO, NOVO),
  ('src="img/pix-nxt-camp-80.png"', 'src="img/pix-nxt-camp-80-v2.png"'),
]

def crc16(t):
  c = 0xFFFF
  for ch in t:
    c ^= ord(ch) << 8
    for _ in range(8): c = ((c << 1) ^ 0x1021) & 0xFFFF if c & 0x8000 else (c << 1) & 0xFFFF
  return format(c, '04X')

def main():
  if len(sys.argv) < 2: sys.exit(__doc__)
  path, apply = sys.argv[1], '--apply' in sys.argv
  assert crc16(NOVO[:-4]) == NOVO[-4:] and crc16(ANTIGO[:-4]) == ANTIGO[-4:], 'CRC'
  s = open(path, encoding='utf-8').read()
  if NOVO in s: sys.exit('JA_APLICADO')
  img = os.path.join(os.path.dirname(os.path.abspath(path)), 'img', 'pix-nxt-camp-80-v2.png')
  if not os.path.isfile(img): sys.exit('FALTA_IMAGEM: ' + img)
  for a, b in TROCAS:
    n = s.count(a)
    if n != 1: sys.exit(f'TRECHO_NAO_ENCONTRADO ({n}x): {a[:70]}')
    s = s.replace(a, b)
  if apply:
    open(path, 'w', encoding='utf-8').write(s); print('APLICADO')
  else:
    print('CONFERIDO: trechos e imagem encontrados (use --apply para gravar)')

main()
