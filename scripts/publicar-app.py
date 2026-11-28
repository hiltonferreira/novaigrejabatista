#!/usr/bin/env python3
"""Publica o app da Nib (versão v203) em https://novaigrejabatista.com.br/app/

Uso, no Terminal do cPanel, dentro de ~/nib-manutencao/publicacoes/v203/ (nunca solto na pasta inicial),
na pasta onde estão este arquivo e o nib-app-v203.zip:
  python3 publicar-app.py            -> só confere, não altera nada
  python3 publicar-app.py --apply    -> publica, com backup privado do que existir em /app
  python3 publicar-app.py --teste [--apply] -> o mesmo, no app de teste (novaigrejabatista.com.br/app-teste)
Mexe somente em public_html/app. Home, eventos, inscrições, APIs e dados não são tocados.
"""
import os, sys, json, hashlib, zipfile, tempfile, shutil, time
from pathlib import Path

PKG = json.loads('{"zip_sha256": "dbc2ac66dca90f9458a1b423ebafdd5dee44a0e1ed9754bd00f565896730311a", "files": {".htaccess": "570fcfc86e5b56c100491ec91b53c07c8d3b71bef9c340ae10b0fd69a826edd4", "admin.js": "b3cab95e10122c22434eeda668b6ee21862b627cf0d153c99013e749e1248529", "ambiente.js": "58042383aa100130aa8b8164299d1c4fdaf18d7f1314128e53c34948cb08a112", "api/avisos.php": "409c55d0a0a928b73a3031e64e6cc041f3ba7aeab324aeff13775782ac5c30f9", "api/caderno.php": "3f51b86ddfa9d7f7516014bb01c1093d2b0e9ff33627ffcfa5e7e8b2d16884c7", "api/checkin.php": "dd3a7c64f5676cae47a5a96365c69f6fd69bebfff4311ee404167a3453a62c7a", "api/compartilhar.php": "e9c6dd86b29a714358036efffe1179a8b8937c2974746683248f90a27b52f06e", "api/conta-lib.php": "a3ec0062e4c2d1baef7648e3ed08167741ccc2a44fe96a75fea8a971dae3ac63", "api/conta.php": "cadb92726e7afaf735291d46606fc4f5fb6773e67eea9a730f51c9b04afa2e3d", "api/eventos-app.php": "09de78ffcde38103ee868e3e0d3225e9943b6f35d1d2eba6ee4f41887513849b", "api/eventos.php": "f983b6f06529748cc060a78306955bc0b2cd2c490213f039e1966578243cb356", "api/inscricoes-lib.php": "c26c305e9381846782e94d208d870e10f88a37a7b2870cbad5ecfb07bc6a7b24", "api/lembretes.php": "10b4586921f53de245d4d4d707b18dad1e1306bc4977077ad75eac9ee877c594", "api/pilulas-agenda.php": "48ca503743c3304c8737ae3f36afa2fe6cb4280cf81e2cd4eea51f3fba0981b9", "api/pilulas.php": "41eae7a848c1899b349b62b232b07ef3079a2cc1b9199d3f17f1276b1134236e", "api/push-lib.php": "30c393fb9e179a709573f64ce8fdb072029fb168e6d77917c7a6fc460f08cd56", "api/youtube-lib.php": "26d1444acd4f41280569eebf106421c429d091c1f5bc8b214c4816077198ccb3", "api/youtube.php": "4a01041ca64d6ab31747a4b604a164126be7000af0a4a14ff94793c6ddd9c666", "app.css": "8b7eaeddf99c474a1d626a90a624acd996e643a7fabc3f796ea3186c257cd4e4", "app.js": "2f3c7448cfd107eccc937400c90418da62ca4cbce1527d97bbbebb3a3d6a24dd", "assets/acumin-black.woff2": "e5accab4d43335b9aa08568282d84a70158b7b3644e65152cdd6a42ff5b97538", "assets/acumin-bold.woff2": "8feab6d75d28f63227b44eca73c6af664edc636f21e97372f4a95d533170aaa4", "assets/acumin-medium.woff2": "f39faead28e67320eb6603e073cb41be2eff511f569957517488ca7673df7537", "assets/acumin-regular.woff2": "975f9503ad69133b0b5c3cec766e93c77ab868d270c93167288c3553c31b7b6e", "assets/acumin-semibold.woff2": "6c8aaec0d7e225f1a1ddb9b072fe4e9e0fc602c610394eb2bc97b0c7a50fb9bb", "assets/brasao-branco.webp": "e857b4275851fdbf7159ee199a69d096635674297a61a39d20552b9a93e4bb49", "assets/campanha-templo.webp": "e83158ba8b8533cd117c4a0afe8d48e0d59a66bb038afbef565465c1049a51ab", "assets/hero-nib.webp": "ce7fa56ec1710f4213065558546a37bc440dd4705de5d5a5358d448395a6392b", "assets/icons/apple-touch-icon.png": "73bcfa940ebe080f2100d48bd4c255300aa1dfc2585ef2fc177a2ddee924aafd", "assets/icons/icon-192.png": "69bbefe02ceaf34ae6e1388d0f88de8ded07f4f20c3ff986f8e7ae4a265fcd41", "assets/icons/icon-512.png": "993ec9ac2519b19d9ef2fecb4b4c16af0435eb2c3d9aabf8dc3ac5a3200d54e4", "assets/icons/icon-96.png": "3860d22e7d35634909b57c637ad52adad746177ad95eb1db0a0f8be7a81e6ab8", "assets/icons/maskable-512.png": "e39aa1258ee7c011ce1241dad4e2360acdf2fa0a7de220c7f6c0a54d40d01dd6", "assets/jornada.webp": "001fe2826f87a7ea1896df5a160debb315afa432ba5521ef8ba35c2f47d3c5af", "assets/layout-mobile-base.css": "0c1071fb5c3f7f136be7a1b099decd22bf316b9ca88934177627b28c1ac2d5af", "assets/lideranca/alex.webp": "9dc9047a8bf36c32b3fedc87ae4a74f7de682ff4232dfd6e46a389fce084253a", "assets/lideranca/sheila.webp": "51ba4bfa4694066395b1778a67e43d5484c63c717d0c13f0ca377b5a85181cb9", "assets/lideranca/sidiel.webp": "3b7cea5db800783d7e26452efb0e8dee1a321de9d3fecaafd4b6611fcf6a1714", "assets/logo.svg": "564d6dd53b567edba44e0c602d1c433831a6d4e1135833bddf7859d9fee99b36", "assets/mulheres.webp": "9b8abf65368c1fb43d80425ea17666149bcba75bdf437a4711cdbb0fd459e6fd", "assets/navegacao-base.css": "a4a99d9926bcb0dd335fb00470c241b30bec4593e285a9fc8402b6cdd0521b84", "assets/nxt.webp": "3e97be5f565191edd30134535cecb018e2fc4380ee94831f9d09e6bd38cd5b93", "assets/painel-base.css": "5562ef9383b54b5f3dac4926b3ccf46a1512d146b38cc956cf201451e5e42c15", "assets/pix-qrcode.png": "19c78550aedcc9784aa830158d49108abbda0d72f55ad791063f4605f232fd66", "assets/refino-mobile-base.css": "002d7fb230dacfeab6a2c99e0856386fa1e543084b8889b678f9d9f90eba081b", "assets/resumo-base.css": "aaa02dea1210ebc3530b57afed98342415b38e17816877841604ef6a76c48122", "assets/social-instagram.webp": "2e5ad60006110fc2ce7ea4a0ed1cc5bbe57b5b5d18da2089c51888b6a5e3bb5c", "assets/social-site.webp": "b1c55076d5afc06d0e91d1c23ad3efea7999a0abfcc077cb4f6080614b9c04b7", "assets/social-youtube.webp": "65bb0f5ded8b5a5bd9dad3577f2b81ff1e7ae141bc47b1e5ae727868cfccd6a3", "assets/splash-logo-final.webp": "57f583c7db6b04169633f03569e000a116e769c3ace1749e955b48874804c201", "assets/splash-logo.webp": "6d2f812fcbe76f17349f55b2e962252831aea62b7e42a8c691bace05a7399cef", "assets/vendor/qrcode-generator-2.0.4.js": "79ec86f82856005b1c887905cfccfcfbec3821ca61c7fd5a952faa5f778f791c", "conheca.css": "f68515ca75df7d8376bd2dc90f02772061d64dc1ee80535afee17c801a633f70", "conheca.html": "5a1c0f57d1bc79b3dde0485ef4096c7d8065043e2a6b4540eaa82f7f61df442e", "conta.js": "eab50178714686ed6f8861b461124f708b54a751692ad8c125f45adabdf541b1", "daily-content.js": "5d633c2df35de025eb8501c28fddbaaf5bf55bc4e7f8b9e12c545bd4e432adde", "icons.js": "b4e72c1f847a17938146a05b08abc574eb03570a3158388d3a6f10dd87357e2a", "index.html": "6e0b58fcd8598cd4a8f1fe00b62eaa94b4a551315958d1bf9f6428065cab04c3", "install.css": "5ab345ec920fb8571b8de937a1ac03bd82a8d11f93e58152f63839c2216551a0", "install.js": "7a13ec19f57bdbb962fad6c048775517d9146f2dcabae677332bbf44eb52ad62", "manifest.webmanifest": "0546a0d7d11cbdd3c0f94d59fd96cc2f7078d52f1527d31f0e38dd46ce32708d", "moderation.js": "6d417e0168029329133b6fe275f0f79e513b6f7a759fca54f172b21f7543bb2c", "pix.js": "62d97109249199d4cbbe47f70628305c7e4919fdf29361ebf45089e06882cabb", "site-data.js": "347364e71ecb6a34077f706693eedabf35eb58de99c58a7732226c78d22a63ce", "sw.js": "2d41106f641947163c9024aa6b300202b6f66115e4fe5d99e3dad7154e7b9c1d", "verses.js": "16053d51d3e21f74d38a4d9a9479701a29928993019b80eeac7118dabee48f74"}}')
HERE = Path(__file__).resolve().parent
ZIP = HERE / 'nib-app-v203.zip'
HOME = Path(os.environ.get('NIB_HOME', '/home/novaigre'))
TESTE = '--teste' in sys.argv  # publica no app de teste (novaigrejabatista.com.br/app-teste, banco próprio), nunca no /app
ROOT = HOME / 'public_html'
APP = ROOT / ('app-teste' if TESTE else 'app')
BACKUPS = HOME / 'nib-manutencao' / 'backups' / ('app-teste' if TESTE else 'app')  # organização de 28/11/2026 (docs/SERVIDOR-ORGANIZACAO.md)

def sha(b): return hashlib.sha256(b).hexdigest()
def stop(msg): print('INTERROMPIDO:', msg); sys.exit(1)

if not ROOT.is_dir(): stop('public_html não encontrado em ' + str(ROOT))
if not ZIP.is_file(): stop('nib-app-v203.zip não está na mesma pasta deste script')
if sha(ZIP.read_bytes()) != PKG['zip_sha256']: print('AVISO: zip gerado de novo (SHA diferente do original); conferindo arquivo por arquivo')
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
BACKUPS.mkdir(mode=0o700, parents=True, exist_ok=True)
backup = Path(tempfile.mkdtemp(prefix='app-v203-' + stamp + '-', dir=BACKUPS)); os.chmod(backup, 0o700)
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

(backup / 'manifesto.json').write_text(json.dumps({'publicado': 'app-v203', 'zip_sha256': PKG['zip_sha256'], 'app_anterior': bool(existing), 'quando': stamp}, indent=2))
print('PUBLICACAO_OK https://novaigrejabatista.com.br/' + ('app-teste' if TESTE else 'app') + '/')
print('BACKUP_PRIVADO', backup)
if existing:
    print('PARA_DESFAZER: mv %s %s && mv %s %s' % (APP, backup / 'app-v203-removido', backup / 'app', APP))
else:
    print('PARA_DESFAZER: mv %s %s' % (APP, backup / 'app-v203-removido'))
