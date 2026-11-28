/* Plataforma Nib como app instalável (PWA).
   - Registra o service worker (sw.js) para guardar o app no celular e abrir rápido.
   - Mostra "Instalar app" no Android/Chrome e o passo a passo no iPhone.
   - Avisa quando há uma versão nova e atualiza com um toque.
   A instalação só funciona no endereço oficial (https://novaigrejabatista.com.br/app/). */
(function () {
  const KEY = 'nib-install-hide';
  let deferred = null;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = isIOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|GSA/.test(ua);
  const hidden = () => { try { return localStorage.getItem(KEY) === '1'; } catch (_) { return false; } };
  const hide = () => { try { localStorage.setItem(KEY, '1'); } catch (_) {} };
  const changed = () => document.dispatchEvent(new CustomEvent('nib-install-change'));
  const mode = () => standalone() ? '' : deferred ? 'prompt' : isIOS ? 'ios' : '';

  const shareIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12 M8 7l4-4 4 4 M6 11H5v10h14V11h-1"/></svg>';
  const plusIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16v16H4z M12 8v8 M8 12h8"/></svg>';
  const phoneIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 2h10v20H7z M11 18h2 M12 7v6 M9.5 10.5 12 13l2.5-2.5"/></svg>';

  // Cartão na tela inicial (o app.js chama NibInstall.card()).
  function card() {
    const m = mode();
    if (!m || hidden()) return '';
    return `<section class="install-card" aria-labelledby="install-title"><span class="install-icon" aria-hidden="true"><img src="assets/icons/icon-96.png" alt="" width="48" height="48"></span><div class="install-text"><h2 id="install-title">Instale o app da Nib</h2><p>Fica na tela inicial do celular, abre mais rápido e funciona até com internet fraca.</p><div class="install-actions"><button type="button" class="action primary" data-install="1">${m === 'ios' ? 'Ver como instalar' : 'Instalar app'}</button><button type="button" class="install-later" data-install-later="1">Agora não</button></div></div></section>`;
  }

  // Botão no menu.
  function menuButton() {
    const drawer = document.getElementById('mobile-drawer');
    if (!drawer) return;
    let btn = document.getElementById('drawer-install');
    const m = mode();
    if (!m) { if (btn) btn.remove(); return; }
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button'; btn.id = 'drawer-install'; btn.className = 'drawer-install'; btn.dataset.install = '1';
      btn.innerHTML = `${phoneIcon}<span><strong>Instalar app</strong><small>Na tela inicial do celular</small></span>`;
      const anchor = document.getElementById('menu-profile');
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(btn, anchor.nextSibling); else drawer.append(btn);
    }
  }

  // Passo a passo do iPhone.
  function iosDialog() {
    let d = document.getElementById('install-dialog');
    if (!d) {
      d = document.createElement('dialog');
      d.id = 'install-dialog'; d.className = 'install-dialog'; d.setAttribute('aria-labelledby', 'install-dialog-title');
      d.innerHTML = `<div class="install-dialog-head"><img src="assets/icons/icon-96.png" alt="" width="56" height="56"><div><h2 id="install-dialog-title">Instalar no iPhone</h2><p>Leva 10 segundos, pelo Safari.</p></div></div>
      <ol class="install-steps"><li><span class="install-step-ico">${shareIcon}</span><span>Toque em <b>Compartilhar</b>, o quadrado com a seta, na barra do Safari.</span></li><li><span class="install-step-ico">${plusIcon}</span><span>Role e toque em <b>Adicionar à Tela de Início</b>.</span></li><li><span class="install-step-ico"><img src="assets/icons/icon-96.png" alt="" width="24" height="24"></span><span>Toque em <b>Adicionar</b>. O ícone da Nib aparece na tela do celular.</span></li></ol>
      ${isSafari ? '' : '<p class="install-note">Abra este endereço no <b>Safari</b> para instalar. Em outros navegadores do iPhone a opção não aparece.</p>'}
      <p class="install-note">Funciona no endereço oficial: novaigrejabatista.com.br/app</p>
      <div class="install-dialog-actions"><button type="button" class="action primary" data-install-close="1">Entendi</button></div>`;
      document.body.append(d);
    }
    d.showModal();
    d.querySelector('[data-install-close]').focus();
  }

  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-install],[data-install-later],[data-install-close],[data-sw-update]');
    if (!b) return;
    if (b.dataset.installClose) { const d = document.getElementById('install-dialog'); if (d) d.close(); return; }
    if (b.dataset.installLater) { hide(); changed(); return; }
    if (b.dataset.swUpdate) { const w = window.__nibWaiting; window.__nibUpdating = true; if (w) w.postMessage('skip'); b.disabled = true; b.textContent = 'Atualizando'; return; }
    const drawer = document.getElementById('mobile-drawer'); if (drawer && drawer.open) drawer.close();
    if (deferred) {
      const ev = deferred; deferred = null;
      ev.prompt();
      try { await ev.userChoice; } catch (_) {}
      menuButton(); changed();
    } else if (isIOS) iosDialog();
  });

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; menuButton(); changed(); });
  window.addEventListener('appinstalled', () => { deferred = null; hide(); menuButton(); changed(); });

  // Service worker: guarda o app no celular e avisa sobre versão nova.
  function showUpdate(worker) {
    window.__nibWaiting = worker;
    // Na abertura ou na tela de entrar não há nada para perder: atualiza sozinho.
    const preso = ['app-splash', 'app-auth', 'app-onboarding'].some(id => { const el = document.getElementById(id); return el && !el.hidden; });
    if (preso && !window.__nibUpdating) { window.__nibUpdating = true; worker.postMessage('skip'); return; }
    if (document.getElementById('sw-update')) return;
    const bar = document.createElement('div');
    bar.id = 'sw-update'; bar.className = 'sw-update'; bar.setAttribute('role', 'status');
    bar.innerHTML = '<span class="sw-update-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.6 M20 4v4h-4"/></svg></span><span class="sw-update-text"><strong>Nova versão do app</strong><small>Atualize para ver as novidades.</small></span><button type="button" data-sw-update="1">Atualizar</button>';
    document.body.append(bar);
  }
  const canSW = 'serviceWorker' in navigator && window.isSecureContext && window.top === window.self;
  if (canSW) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js', { scope: './' }).then(reg => {
        if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const w = reg.installing; if (!w) return;
          w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) showUpdate(w); });
        });
        // Confere atualização ao voltar para o app.
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
      }).catch(() => {});
      let reloading = false;
      // Recarrega só quando a pessoa tocou em Atualizar (na primeira visita não recarrega).
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading || !window.__nibUpdating) return; reloading = true; location.reload(); });
    });
  }

  // Página Conheça o aplicativo: mostra "Instalar agora" só quando o celular permite
  // e esconde a seção de instalação quando o app já está instalado.
  function sync() {
    menuButton();
    document.querySelectorAll('[data-install-show]').forEach(el => { el.hidden = !mode(); });
    document.querySelectorAll('[data-install-section]').forEach(el => { el.hidden = standalone(); });
  }
  document.addEventListener('nib-install-change', sync);
  document.addEventListener('DOMContentLoaded', sync);
  window.NibInstall = { card, mode, standalone };
})();
