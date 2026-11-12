// Calcula a versão do cache do app (sw.js) a partir do conteúdo dos arquivos guardados.
// Depois de mudar qualquer arquivo do app, rode: node sw-version.cjs --write
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const SW = path.join(__dirname, 'sw.js');

function files(src = fs.readFileSync(SW, 'utf8')) {
  const list = src.match(/const FILES = \[([\s\S]*?)\];/)[1];
  return [...list.matchAll(/'([^']+)'/g)].map(m => m[1]);
}
function version(src = fs.readFileSync(SW, 'utf8')) {
  const h = crypto.createHash('sha256');
  for (const f of files(src)) if (f !== './') { h.update(f); h.update(fs.readFileSync(path.join(__dirname, f))); }
  return 'nib-app-' + h.digest('hex').slice(0, 10);
}
module.exports = { files, version };

if (require.main === module) {
  const src = fs.readFileSync(SW, 'utf8');
  const v = version(src);
  if (process.argv.includes('--write')) fs.writeFileSync(SW, src.replace(/const VERSION = '[^']*';/, `const VERSION = '${v}';`));
  console.log(v);
}
