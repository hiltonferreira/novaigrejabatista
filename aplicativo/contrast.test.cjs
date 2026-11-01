const { test } = require('node:test');
const assert = require('node:assert/strict');
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
];
for (const [name, foreground, background, minimum] of pairs) {
  test(name, () => {
    const [high, low] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    const ratio = (high + 0.05) / (low + 0.05);
    assert.ok(ratio >= minimum, `${ratio.toFixed(2)}:1 < ${minimum}:1`);
    console.log(`${name}: ${ratio.toFixed(2)}:1`);
  });
}
