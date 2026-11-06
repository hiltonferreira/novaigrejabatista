/* Service worker da Plataforma Nib.
   Guarda os arquivos do app no celular para abrir rápido e funcionar com internet fraca.
   Ao mudar qualquer arquivo do app, aumente VERSION: o celular baixa a versão nova
   e mostra "Nova versão do app disponível". Dados de fora (obra.json, site) não ficam guardados. */
const VERSION = 'nib-app-c65483bd86';
const FILES = [
  './', 'index.html', 'conheca.html', 'manifest.webmanifest',
  'app.css', 'install.css', 'conheca.css', 'app.js', 'admin.js', 'icons.js', 'install.js', 'moderation.js', 'daily-content.js', 'verses.js', 'pix.js',
  'assets/vendor/qrcode-generator-2.0.4.js',
  'assets/painel-base.css', 'assets/resumo-base.css', 'assets/refino-mobile-base.css', 'assets/layout-mobile-base.css', 'assets/navegacao-base.css',
  'assets/acumin-regular.woff2', 'assets/acumin-medium.woff2', 'assets/acumin-semibold.woff2', 'assets/acumin-bold.woff2', 'assets/acumin-black.woff2',
  'assets/logo.svg', 'assets/splash-logo.webp', 'assets/splash-logo-final.webp', 'assets/brasao-branco.webp',
  'assets/hero-nib.webp', 'assets/social-instagram.webp', 'assets/social-youtube.webp', 'assets/social-site.webp',
  'assets/campanha-templo.webp', 'assets/jornada.webp', 'assets/mulheres.webp', 'assets/nxt.webp', 'assets/pix-qrcode.png',
  'assets/icons/icon-96.png', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/maskable-512.png', 'assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('nib-app-') && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // site, Instagram, obra.json: sempre pela internet
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return;
  if (url.pathname.includes('/api/')) return; // dados do servidor nunca ficam guardados

  if (req.mode === 'navigate') {
    // Página: tenta a internet (até 4 s) e, sem conexão, abre a cópia guardada.
    const page = url.pathname.endsWith('conheca.html') ? 'conheca.html' : 'index.html';
    e.respondWith((async () => {
      const cached = await caches.match(page, { ignoreSearch: true });
      try {
        const net = fetch(req);
        const res = cached ? await Promise.race([net, new Promise((_, no) => setTimeout(no, 4000))]) : await net;
        return res;
      } catch (_) {
        return cached || Response.error();
      }
    })());
    return;
  }

  // Arquivos do app: usa a cópia guardada; o que não estiver guardado vem da internet.
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  })));
});
