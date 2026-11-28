const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { files, version } = require('./sw-version.cjs');
const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');

test('todo arquivo guardado pelo service worker existe', () => {
  for (const f of files()) if (f !== './') assert.ok(fs.existsSync(path.join(__dirname, f)), f);
});

test('tudo o que o app carrega do próprio endereço fica guardado', () => {
  const list = new Set(files());
  const src = ['index.html', 'conheca.html', 'app.js', 'admin.js', 'app.css', 'install.js', 'install.css', 'conheca.css', 'manifest.webmanifest'].map(read).join('\n');
  const refs = new Set([...src.matchAll(/(?:src|href)="((?!https?:|#|\.\/|mailto:)[^"]+\.(?:js|css|webp|png|svg|webmanifest|html))"|url\("?(assets\/[^")]+)"?\)|'(assets\/[^']+\.(?:webp|png|svg))'/g)].map(m => m[1] || m[2] || m[3]));
  for (const r of refs) assert.ok(list.has(r), `falta no sw.js: ${r}`);
});

test('a versão do cache acompanha o conteúdo dos arquivos', () => {
  const current = read('sw.js').match(/const VERSION = '([^']+)';/)[1];
  assert.strictEqual(current, version(), 'Arquivos do app mudaram: rode node sw-version.cjs --write');
});

test('manifesto aponta para ícones existentes e fica no escopo do app', () => {
  const m = JSON.parse(read('manifest.webmanifest'));
  assert.strictEqual(m.start_url, './'); assert.strictEqual(m.scope, './'); assert.strictEqual(m.display, 'standalone');
  assert.ok(m.icons.some(i => i.purpose === 'maskable'));
  for (const i of m.icons) assert.ok(fs.existsSync(path.join(__dirname, i.src)), i.src);
});
