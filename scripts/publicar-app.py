#!/usr/bin/env python3
"""Publica a Plataforma Nib (versão de teste v87) em https://novaigrejabatista.com.br/app/

Uso, no Terminal do cPanel, na pasta onde estão este arquivo e o nib-app-v87.zip:
  python3 publicar-app.py            -> só confere, não altera nada
  python3 publicar-app.py --apply    -> publica, com backup privado do que existir em /app
Mexe somente em public_html/app. Home, eventos, inscrições, APIs e dados não são tocados.
"""
import os, sys, json, hashlib, zipfile, tempfile, shutil, time
from pathlib import Path

PKG = json.loads('{"zip_sha256": "31f3cbe7051b447d6e3479f50e1b411a55a1aae1956a5c76024d453e72c89754", "files": {".htaccess": "07486be404718871d8c0af9ff577cd0435766f9de51dcf57838111d6583bafac", "admin.js": "4b4caa09cfe86aa07e1df593f6d5c736c473485c0532f24390a4924e17522836", "app.css": "a762533810199c1975317fced1ab977295b4432948f5c7cdf82d4458df359e87", "app.js": "2d737f74798893210165fcff4a336878b4fecfe9c01a5dd11170ef07df16abf3", "assets/acumin-black.woff2": "e5accab4d43335b9aa08568282d84a70158b7b3644e65152cdd6a42ff5b97538", "assets/acumin-bold.woff2": "8feab6d75d28f63227b44eca73c6af664edc636f21e97372f4a95d533170aaa4", "assets/acumin-medium.woff2": "f39faead28e67320eb6603e073cb41be2eff511f569957517488ca7673df7537", "assets/acumin-regular.woff2": "975f9503ad69133b0b5c3cec766e93c77ab868d270c93167288c3553c31b7b6e", "assets/acumin-semibold.woff2": "6c8aaec0d7e225f1a1ddb9b072fe4e9e0fc602c610394eb2bc97b0c7a50fb9bb", "assets/brasao-branco.webp": "e857b4275851fdbf7159ee199a69d096635674297a61a39d20552b9a93e4bb49", "assets/campanha-templo.webp": "e83158ba8b8533cd117c4a0afe8d48e0d59a66bb038afbef565465c1049a51ab", "assets/hero-nib.webp": "5432e1f2ed62798a46bb794cdc0b6dc2459f96c057dece17fb16221b9dd01304", "assets/icons/apple-touch-icon.png": "73bcfa940ebe080f2100d48bd4c255300aa1dfc2585ef2fc177a2ddee924aafd", "assets/icons/icon-192.png": "69bbefe02ceaf34ae6e1388d0f88de8ded07f4f20c3ff986f8e7ae4a265fcd41", "assets/icons/icon-512.png": "993ec9ac2519b19d9ef2fecb4b4c16af0435eb2c3d9aabf8dc3ac5a3200d54e4", "assets/icons/icon-96.png": "3860d22e7d35634909b57c637ad52adad746177ad95eb1db0a0f8be7a81e6ab8", "assets/icons/maskable-512.png": "e39aa1258ee7c011ce1241dad4e2360acdf2fa0a7de220c7f6c0a54d40d01dd6", "assets/jornada.webp": "e2c3d6e4de2201c7844cbaa8544297349115aad8530bca2d242bd38bcae0143f", "assets/layout-mobile-base.css": "0c1071fb5c3f7f136be7a1b099decd22bf316b9ca88934177627b28c1ac2d5af", "assets/logo.svg": "564d6dd53b567edba44e0c602d1c433831a6d4e1135833bddf7859d9fee99b36", "assets/mulheres.webp": "d4c657f6368772c06d65775a79b600bea70e40c7cc4185e572378b09030a25fd", "assets/navegacao-base.css": "a4a99d9926bcb0dd335fb00470c241b30bec4593e285a9fc8402b6cdd0521b84", "assets/nxt.webp": "185d7c65be1cbc45320e6e41bab99b20df46d29454a3b9c3aeaa0626e46c785c", "assets/painel-base.css": "5562ef9383b54b5f3dac4926b3ccf46a1512d146b38cc956cf201451e5e42c15", "assets/pix-qrcode.png": "19c78550aedcc9784aa830158d49108abbda0d72f55ad791063f4605f232fd66", "assets/refino-mobile-base.css": "002d7fb230dacfeab6a2c99e0856386fa1e543084b8889b678f9d9f90eba081b", "assets/resumo-base.css": "aaa02dea1210ebc3530b57afed98342415b38e17816877841604ef6a76c48122", "assets/social-instagram.webp": "2e5ad60006110fc2ce7ea4a0ed1cc5bbe57b5b5d18da2089c51888b6a5e3bb5c", "assets/social-site.webp": "b1c55076d5afc06d0e91d1c23ad3efea7999a0abfcc077cb4f6080614b9c04b7", "assets/social-youtube.webp": "65bb0f5ded8b5a5bd9dad3577f2b81ff1e7ae141bc47b1e5ae727868cfccd6a3", "assets/splash-logo-final.webp": "57f583c7db6b04169633f03569e000a116e769c3ace1749e955b48874804c201", "assets/splash-logo.webp": "6d2f812fcbe76f17349f55b2e962252831aea62b7e42a8c691bace05a7399cef", "assets/vendor/qrcode-generator-2.0.4.js": "79ec86f82856005b1c887905cfccfcfbec3821ca61c7fd5a952faa5f778f791c", "conheca.css": "f68515ca75df7d8376bd2dc90f02772061d64dc1ee80535afee17c801a633f70", "conheca.html": "fbb4e6243d6a4119c97fc8adabe4cde657e463539c2cb1490336d792d46ba4e3", "daily-content.js": "094ecce7859c444543576aa3f2c898ff72fbc789954b2cf299953905f05381d7", "icons.js": "ccdb2e8668643269529573b8c1c9e4e6765bdfc197b789eb2379f8481bdc6dad", "index.html": "9df085be309b6002a612d9c6b72b678f14dd8dc45bfb6915421a853058544300", "install.css": "26ade2f3c1e9481ef8939f75898c885531cf6ebbf86c4f13f238cebb5ec203f3", "install.js": "974eae248ab148a90546904a4542b551e9a06671b66a22f234643059d3bbda86", "manifest.webmanifest": "0546a0d7d11cbdd3c0f94d59fd96cc2f7078d52f1527d31f0e38dd46ce32708d", "moderation.js": "6d417e0168029329133b6fe275f0f79e513b6f7a759fca54f172b21f7543bb2c", "pix.js": "d5c061763e337de7849bea90f0f07bb847d1a20261d9042c6591e10ec98d9136", "sw.js": "4c3bbf8b35d0621d34e48419f14c67c02c029e163a39964392f3f905504fb4c2", "verses.js": "16053d51d3e21f74d38a4d9a9479701a29928993019b80eeac7118dabee48f74"}}')
HERE = Path(__file__).resolve().parent
ZIP = HERE / 'nib-app-v87.zip'
HOME = Path(os.environ.get('NIB_HOME', '/home/novaigre'))
ROOT = HOME / 'public_html'
APP = ROOT / 'app'
BACKUPS = HOME / 'nib-manutencao'

def sha(b): return hashlib.sha256(b).hexdigest()
def stop(msg): print('INTERROMPIDO:', msg); sys.exit(1)

if not ROOT.is_dir(): stop('public_html não encontrado em ' + str(ROOT))
if not ZIP.is_file(): stop('nib-app-v87.zip não está na mesma pasta deste script')
if sha(ZIP.read_bytes()) != PKG['zip_sha256']: stop('o zip não confere (arquivo incompleto ou diferente). Envie de novo.')
z = zipfile.ZipFile(ZIP)
names = sorted(i.filename for i in z.infolist() if not i.is_dir())
if names != sorted(PKG['files']): stop('lista de arquivos do zip não confere')
for n in names:
    if n.startswith('/') or '..' in Path(n).parts: stop('caminho inválido no zip: ' + n)
    if sha(z.read(n)) != PKG['files'][n]: stop('arquivo do zip não confere: ' + n)
print('PACOTE_OK', len(names), 'arquivos')

if APP.is_symlink(): stop('public_html/app é um atalho (symlink); conferir antes de publicar')
if APP.exists() and not APP.is_dir(): stop('public_html/app existe e não é pasta')
existing = sorted(str(p.relative_to(APP)) for p in APP.rglob('*')) if APP.exists() else []
print('APP_ATUAL', 'pasta com %d itens' % len(existing) if APP.exists() else 'não existe (será criada)')
for p in existing[:30]: print('   ', p)
if len(existing) > 30: print('    ...')
ht = ROOT / '.htaccess'
if ht.is_file():
    hits = [l.strip() for l in ht.read_text(errors='replace').splitlines() if 'app' in l.lower() and not l.strip().startswith('#')]
    print('HTACCESS_RAIZ linhas com "app":', len(hits))
    for l in hits: print('   ', l)

if '--apply' not in sys.argv:
    print('MODO_CONFERENCIA: nada foi alterado. Para publicar: python3 publicar-app.py --apply'); sys.exit(0)

stamp = time.strftime('%Y%m%d-%H%M%S')
BACKUPS.mkdir(mode=0o700, exist_ok=True)
backup = Path(tempfile.mkdtemp(prefix='app-v87-' + stamp + '-', dir=BACKUPS)); os.chmod(backup, 0o700)
new = Path(tempfile.mkdtemp(prefix='.app-novo-', dir=ROOT))
moved = False
try:
    for n in names:
        dest = new / n; dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(z.read(n)); os.chmod(dest, 0o644)
    for d in [new] + [p for p in new.rglob('*') if p.is_dir()]: os.chmod(d, 0o755)
    for n in names:
        if sha((new / n).read_bytes()) != PKG['files'][n]: raise RuntimeError('gravação não confere: ' + n)
    if APP.exists():
        os.rename(APP, backup / 'app'); moved = True
    os.rename(new, APP)
    for n in names:
        if sha((APP / n).read_bytes()) != PKG['files'][n]: raise RuntimeError('conferência final falhou: ' + n)
except BaseException as e:
    placed = APP.exists() and not new.exists()
    if placed: shutil.rmtree(APP)
    if moved: os.rename(backup / 'app', APP)
    if new.exists(): shutil.rmtree(new)
    print('FALHOU e foi desfeito:', e); sys.exit(1)

(backup / 'manifesto.json').write_text(json.dumps({'publicado': 'app-v87', 'zip_sha256': PKG['zip_sha256'], 'app_anterior': bool(existing), 'quando': stamp}, indent=2))
print('PUBLICACAO_OK https://novaigrejabatista.com.br/app/')
print('BACKUP_PRIVADO', backup)
if existing:
    print('PARA_DESFAZER: mv %s %s && mv %s %s' % (APP, backup / 'app-v87-removido', backup / 'app', APP))
else:
    print('PARA_DESFAZER: mv %s %s' % (APP, backup / 'app-v87-removido'))
