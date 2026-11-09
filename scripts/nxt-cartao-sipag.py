#!/usr/bin/env python3
"""Adiciona o pagamento com cartão (link Sipag) ao formulário do NXT CAMP.

Uso: python3 scripts/nxt-cartao-sipag.py CAMINHO/inscricao.html [--apply]
     python3 scripts/nxt-cartao-sipag.py CAMINHO/index.html [--apply]   (página do evento)
Edita o arquivo de PRODUÇÃO por troca de trechos (ele difere do repositório).
Sem --apply só confere se todos os trechos existem uma vez. Faça backup antes.
Pedido de Hilton (06/11/2026): R$ 80 no crédito em até 2x ou no débito, informado já no preenchimento.
"""
import sys

LINK = 'https://web.sipag.com.br/pagamento/link/bb7f44da-2976-471b-b129-a421b0285aa0'

ESTILO = '''<style id="nib-cartao">
.nib-pay-note{margin:18px 0 12px;padding:14px 16px;border-radius:14px;background:#eef3f9;border:1px solid #d5e0ee;color:#041e42;font-size:.95rem;line-height:1.45}
.nib-pay-note strong{display:block;margin-bottom:2px}
.nib-card-pay{margin:18px 0;padding:16px;border-radius:16px;border:1px solid #d5e0ee;background:#fff;color:#041e42}
.nib-card-pay h3{margin:0 0 4px;font-size:1.05rem}
.nib-card-pay p{margin:0 0 12px;color:#536176;font-size:.95rem;line-height:1.45}
.nib-card-pay .button{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;text-decoration:none}
.nib-pay-or{display:flex;align-items:center;gap:12px;margin:18px 0 6px;color:#536176;font-size:.85rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.nib-pay-or::before,.nib-pay-or::after{content:"";flex:1;height:1px;background:#d5e0ee}
</style>
'''

TROCAS = [
  # 1. Estilo do bloco de cartão.
  ('<link rel="stylesheet" href="/consulta-inscricao/cabecalho.css?v=2.9"></head>',
   '<link rel="stylesheet" href="/consulta-inscricao/cabecalho.css?v=2.9">\n' + ESTILO + '</head>'),
  # 2. No preenchimento dos dados: formas de pagamento visíveis.
  ('<button class="button primary" id="next-data" type="button">Continuar para o Pix</button>',
   '<p class="nib-pay-note"><strong>Inscrição: R$ 80,00</strong>Pague com Pix ou com cartão: crédito em até 2x ou débito.</p>\n'
   '        <button class="button primary" id="next-data" type="button">Continuar para o pagamento</button>'),
  # 3. Etapa de pagamento: título e cartão antes do Pix.
  ('<legend>Pagamento via Pix</legend>', '<legend>Pagamento</legend>'),
  ('<p class="step-intro">Use o Pix Copia e Cola ou leia o QR Code no aplicativo do seu banco. Depois, volte para enviar o comprovante.</p>',
   '<p class="step-intro">Escolha pagar com cartão ou com Pix. Depois, volte aqui para enviar o comprovante.</p>\n'
   '        <div class="nib-card-pay">\n'
   '          <h3>Cartão de crédito ou débito</h3>\n'
   '          <p>Crédito em até 2x ou débito, pela página segura da Sipag (Sicoob). Ao terminar, salve ou tire um print do comprovante.</p>\n'
   '          <a class="button primary" href="' + LINK + '" target="_blank" rel="noopener noreferrer">Pagar com cartão</a>\n'
   '        </div>\n'
   '        <p class="nib-pay-or">ou pague com Pix</p>'),
  # 4. Comprovante e quem pagou: vale para Pix e cartão.
  ('<p class="step-intro">Anexe a imagem ou o PDF do pagamento de R$ 80.</p>',
   '<p class="step-intro">Anexe a imagem ou o PDF do pagamento de R$ 80 (Pix ou cartão).</p>'),
  ('<span>O Pix foi feito por outra pessoa?</span>', '<span>O pagamento foi feito por outra pessoa?</span>'),
  ('<label for="payer">Nome de quem fez o Pix</label>', '<label for="payer">Nome de quem pagou</label>'),
]

# Página do evento (index.html): os dois textos que citavam só o Pix.
TROCAS_PAGINA = [
  ('faça o pagamento via Pix e envie o comprovante', 'faça o pagamento (Pix ou cartão) e envie o comprovante', 2),
]

def main():
  if len(sys.argv) < 2: sys.exit(__doc__)
  path, apply = sys.argv[1], '--apply' in sys.argv
  s = open(path, encoding='utf-8').read()
  if path.endswith('inscricao.html'):
    if 'id="nib-cartao"' in s: sys.exit('JA_APLICADO')
    trocas = [(a, b, 1) for a, b in TROCAS]
  else:
    if 'pagamento (Pix ou cartão)' in s: sys.exit('JA_APLICADO')
    trocas = TROCAS_PAGINA
  for a, b, esperado in trocas:
    n = s.count(a)
    if n != esperado: sys.exit(f'TRECHO_NAO_ENCONTRADO ({n}x): {a[:70]}')
    s = s.replace(a, b)
  if apply:
    open(path, 'w', encoding='utf-8').write(s); print('APLICADO')
  else:
    print('CONFERIDO: todos os trechos existem uma vez (use --apply para gravar)')

main()
