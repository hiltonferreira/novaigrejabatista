const { test } = require('node:test');
const assert = require('node:assert/strict');
const css = require('node:fs').readFileSync(require('node:path').join(__dirname, 'app.css'), 'utf8');
const token = name => {
  const value = css.match(new RegExp(`--${name}:(#[0-9a-fA-F]{6})`));
  assert.ok(value, `Token ${name} ausente`);
  return value[1];
};
function luminance(hex) {
  const values = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return values.reduce((n, v, i) => n + v * [0.2126, 0.7152, 0.0722][i], 0);
}
const pairs = [
  ['Texto principal', '#041e42', '#ffffff', 4.5],
  ['Texto principal no fundo', '#041e42', '#f4f6f8', 4.5],
  ['Seleção e hover marfim', '#041e42', '#ebebdf', 4.5],
  ['Texto secundário no fundo', '#536176', '#f4f6f8', 4.5],
  ['Texto secundário em cartão', '#536176', '#ffffff', 4.5],
  ['Texto de destaque', '#a64b25', '#f4f6f8', 4.5],
  ['Menu e seleção escura', '#d2ddeb', '#041e42', 4.5],
  ['Rótulos do menu', '#aebfd4', '#041e42', 4.5],
  ['Rodapé lateral', '#afc1d7', '#041e42', 4.5],
  ['Texto do bloco azul', '#c9d6e6', '#041e42', 4.5],
  ['Destaque no bloco azul', '#ffb38a', '#041e42', 4.5],
  ['Situação de membro', '#24674e', '#e9f3ed', 4.5],
  ['Texto desabilitado', '#536176', '#eef1f4', 4.5],
  ['Contorno no branco', '#65768e', '#ffffff', 3],
  ['Contorno no marfim', '#65768e', '#ebebdf', 3],
  ['Contorno no fundo', '#65768e', '#f4f6f8', 3],
  ['Foco no fundo claro', '#041e42', '#f4f6f8', 3],
  ['Foco no menu', '#ebebdf', '#041e42', 3],
  ['Campo: texto real', token('nib-field-text'), token('nib-field-surface'), 4.5],
  ['Campo: placeholder real', token('nib-placeholder'), token('nib-field-surface'), 4.5],
  ['Campo: contorno real', token('nib-control-outline'), token('nib-field-surface'), 3],
  ['Botão: contorno em hover real', token('nib-control-outline'), token('nib-control-hover'), 3],
  ['Botão: desabilitado em hover real', token('nib-placeholder'), token('nib-control-disabled'), 4.5],
  ['Tag ativo', '#ffffff', '#245c45', 4.5],
  ['Tag encerrado', '#43516a', '#eef1f4', 4.5],
  ['Contorno do recolhimento da lateral', '#aebfd4', '#041e42', 3],
];
for (const [name, foreground, background, minimum] of pairs) {
  test(name, () => {
    const [high, low] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    const ratio = (high + 0.05) / (low + 0.05);
    assert.ok(ratio >= minimum, `${ratio.toFixed(2)}:1 < ${minimum}:1`);
    console.log(`${name}: ${ratio.toFixed(2)}:1`);
  });
}
test('Campos e atalhos usam o contorno verificado no CSS', () => {
  assert.match(css, /input,#nib-proposta textarea,#nib-proposta select\{border:1px solid var\(--nib-control-outline\)/);
  assert.match(css, /input::placeholder,#nib-proposta textarea::placeholder\{color:var\(--nib-placeholder\);opacity:1\}/);
});

test('Base visual do painel preservada sem alterações', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const base = path.resolve(__dirname, '..');
  for (const [source, copy] of [['painel.css','painel-base.css'],['navegacao-painel.css','navegacao-base.css'],['refino-mobile.css','refino-mobile-base.css'],['layout-mobile.css','layout-mobile-base.css'],['resumo-eventos.css','resumo-base.css']]) {
    assert.deepEqual(fs.readFileSync(path.join(base,'inscricoes',source)),fs.readFileSync(path.join(__dirname,'assets',copy)));
  }
});

// A navegação mobile compartilha exatamente o comportamento já usado nos eventos.
test('Controlador mobile original do painel preservado', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const original = fs.readFileSync(path.join(__dirname,'..','inscricoes','navegacao-painel.js'),'utf8');
  assert.equal(fs.readFileSync(path.join(__dirname,'assets','navegacao-mobile-base.js'),'utf8'), original.slice(0,original.indexOf('/* NIB 4.9')));
});
