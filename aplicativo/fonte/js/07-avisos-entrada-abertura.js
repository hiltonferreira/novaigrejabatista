  // Versão oficial: avisos reais, montados a partir do cadastro, da célula, da agenda e dos eventos do site.
  function publicNotices() {
    const out = [], today = NibDaily.dayKey(new Date()), p = account();
    if (p && p.vinculo === 'membro' && p.membro_status === 'pendente') out.push({ id: 'membro-pendente', kind: 'info', title: 'Cadastro em análise', text: 'A Secretaria vai confirmar sua membresia. Você recebe o aviso aqui.', view: 'cadastro', action: 'Ver meu cadastro' });
    if (p && p.membro_status === 'confirmado') out.push({ id: 'membro-ok-' + p.id, kind: 'ok', title: 'Membresia confirmada', text: 'A Secretaria confirmou que você é membro da Nova Igreja Batista. Seja bem-vindo!', view: 'cadastro', action: 'Ver meu cadastro' });
    if (p && pushOk() && state.push && !state.push.on) out.push({ id: 'push-oferta', kind: 'info', title: 'Receba os avisos no celular', text: 'Ative as notificações para saber na hora quando houver novidade.', view: 'cadastro', action: 'Ativar notificações' });
    if (p && !p.celula) out.push({ id: 'sem-celula', kind: 'info', title: 'Participa de uma célula?', text: 'Informe sua célula em Meu cadastro para ver os encontros no calendário.', view: 'celulas', action: 'Ver células' });
    const hoje = withCell(NibDaily.agenda(today, 1), today, 1).filter(x => x.day === today);
    hoje.forEach(x => out.push({ id: 'hoje-' + today + '-' + x.name, kind: x.type === 'Minha célula' ? 'cell' : 'agenda', title: x.type === 'Minha célula' ? 'Hoje tem célula' : 'Hoje na igreja', text: x.name + (x.time ? ', às ' + x.time : '') + (x.place ? ' · ' + x.place : ''), view: 'agenda', action: 'Ver na agenda' }));
    ensureAvisos(); (state.avisos || []).slice(0, 5).forEach(a => out.push({ id: 'aviso-' + a.id, kind: 'aviso', title: a.titulo, text: a.texto, view: 'avisos', action: 'Ver avisos' }));
    const ev = (window.NibSite && NibSite.eventos()) || [];
    const limite = NibDaily.dayKey(new Date(Date.now() + 21 * 864e5));
    ev.filter(e => e.open && e.start.slice(0, 10) >= today && e.start.slice(0, 10) <= limite).slice(0, 3).forEach(e => out.push({ id: 'evento-' + e.name + e.start, kind: 'event', title: 'Inscrições abertas', text: e.name + ' · ' + fmtDay(e.start), view: 'eventos', action: 'Ver evento' }));
    return out;
  }
  const seenNotices = () => { try { return JSON.parse(localStorage.getItem('nib-avisos-vistos') || '[]'); } catch (_) { return []; } };
  function markNoticesSeen() { if (PUBLIC) { try { localStorage.setItem('nib-avisos-vistos', JSON.stringify(publicNotices().map(n => n.id).slice(0, 50))); } catch (_) {} refreshNotices(); return; } if (isManagement()) return; state.noticesSeen = admin.noticesCount(); state.notifs.forEach(n => { n.seen = true; }); state.bdayNotifSeen = true; refreshNotices(); }
  function refreshNotices() {
    const empty = notices.querySelector('.notices-empty');
    let feed = notices.querySelector('.notices-feed');
    if (!feed) { feed = document.createElement('div'); feed.className = 'notices-feed'; empty.after(feed); }
    if (PUBLIC) {
      const list = publicNotices(), seen = seenNotices();
      const ico = { ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>', cell: navIcon('celulas'), event: navIcon('eventos'), aviso: navIcon('comunicados'), agenda: navIcon('agenda'), info: navIcon('comunicados') };
      const html = list.length ? `<ul class="notices-list pub-notifs">${list.map(n => `<li class="pub-notif is-${n.kind}${seen.includes(n.id) ? '' : ' is-new'}"><span class="pub-notif-icon" aria-hidden="true">${ico[n.kind] || ico.info}</span><div class="pub-notif-body"><strong>${escape(n.title)}</strong><p>${escape(n.text)}</p><button type="button" class="pub-notif-go" data-view="${n.view}">${escape(n.action)} ${arrow}</button></div></li>`).join('')}</ul>` : '';
      feed.innerHTML = html; feed.hidden = !html; empty.hidden = !!html;
      const unread = list.filter(n => !seen.includes(n.id)).length, bell = document.getElementById('header-notices');
      bell.classList.toggle('has-unread', unread > 0); bell.setAttribute('aria-label', unread ? `Avisos, ${unread} ${unread === 1 ? 'novo' : 'novos'}` : 'Avisos');
      return;
    }
    const avisos = admin.memberNotices(); const html = isManagement() ? avisos : notifsHtml() + (avisos ? `<h3 class="notif-title">Avisos da igreja</h3>${avisos}` : '');
    feed.innerHTML = html; feed.hidden = !html; empty.hidden = !!html;
    const unread = isManagement() ? 0 : unreadAll(); const bell = document.getElementById('header-notices'); bell.classList.toggle('has-unread', unread > 0); bell.setAttribute('aria-label', unread ? `Notificações, ${unread} ${unread === 1 ? 'nova' : 'novas'}` : 'Notificações');
  }
  function closeDrawer() { if (drawer.open) drawer.close(); root.classList.remove('nib-dialog-open'); document.getElementById('header-menu').setAttribute('aria-expanded','false'); }
  drawer.addEventListener('close', () => { root.classList.remove('nib-dialog-open'); document.getElementById('header-menu').setAttribute('aria-expanded','false'); });
  drawer.addEventListener('click', e => { if (e.target === drawer) { const r = drawer.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDrawer(); } });
  matchMedia('(min-width:821px)').addEventListener('change', e => { if (e.matches) closeDrawer(); });
  function refreshDailyDate() {
    const now = new Date();
    const key = NibDaily.dayKey(now);
    const dateLabel = document.getElementById('header-date');
    dateLabel.dateTime = key;
    dateLabel.textContent = new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(now);
    dateLabel.textContent = dateLabel.textContent.charAt(0).toUpperCase()+dateLabel.textContent.slice(1);
    dateLabel.setAttribute('aria-label',new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',dateStyle:'full'}).format(now));
    const verse = NibDaily.verseForDay(key);
    const quote = content.querySelector('.daily-verse blockquote');
    if (quote) { quote.lastChild.textContent = verse[0]; content.querySelector('.daily-verse cite').textContent = verse[1]; }
  }
  refreshDailyDate();
  loadObra();
  if (window.NibSite) { syncAgendaEventos(); NibSite.onChange(() => { syncAgendaEventos(); refreshNotices(); if (['inicio','agenda','eventos','celulas','informacoes'].includes(state.view) && !document.activeElement.closest('#content :is(input,textarea,select)')) show(state.view, false, false); }); NibSite.load(); }
  setInterval(refreshDailyDate, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDailyDate(); });
  document.getElementById('demo-context').value = 'membro';
  show('inicio', false);
  if (deskQuery && deskQuery.addEventListener) deskQuery.addEventListener('change', () => show(state.view, false, false));
  // Fluxo de entrada de teste: abertura → acesso (entrar ou criar cadastro) → orientação → inicial.
  // Nada é enviado: a CSP bloqueia conexões e os dados ficam só na memória desta aba.
  const auth = document.getElementById('app-auth');
  const onboarding = document.getElementById('app-onboarding');
  const appParts = [root.querySelector(':scope > header'), root.querySelector(':scope > .layout'), document.getElementById('bottom-nav')];
  const readFlag = key => { try { return sessionStorage.getItem(key) === '1'; } catch (_) { return false; } };
  const onbHidden = () => { try { return localStorage.getItem('nib-onb-hide') === '1'; } catch (_) { return false; } };
  const setOnbHidden = on => { try { on ? localStorage.setItem('nib-onb-hide', '1') : localStorage.removeItem('nib-onb-hide'); } catch (_) {} };
  const writeFlag = (key, on) => { try { on ? sessionStorage.setItem(key,'1') : sessionStorage.removeItem(key); } catch (_) {} };
  const gate = on => { root.classList.toggle('nib-gated', on); appParts.forEach(el => { if (el) el.inert = on; }); };
  function openAuth() { gate(true); onboarding.hidden = true; auth.hidden = false; auth.scrollTop = 0; setTab('login', false); requestAnimationFrame(() => document.getElementById('auth-title').focus({preventScroll:true})); }
  function setTab(which, focus = true) {
    const login = which === 'login';
    const tl = document.getElementById('tab-login'), ts = document.getElementById('tab-signup');
    tl.setAttribute('aria-selected', String(login)); ts.setAttribute('aria-selected', String(!login));
    tl.tabIndex = login ? 0 : -1; ts.tabIndex = login ? -1 : 0; tl.parentNode.style.setProperty('--i', login ? 0 : 1);
    document.getElementById('panel-login').hidden = !login; document.getElementById('panel-signup').hidden = login;
    auth.querySelectorAll('.auth-error').forEach(e => { e.textContent = ''; });
    if (focus) (login ? tl : ts).focus();
  }
  auth.querySelector('.auth-tabs').addEventListener('click', e => { const t = e.target.closest('[role=tab]'); if (t) setTab(t.id === 'tab-login' ? 'login' : 'signup'); });
  auth.querySelector('.auth-tabs').addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); setTab(document.getElementById('tab-login').getAttribute('aria-selected') === 'true' ? 'signup' : 'login'); } });
  auth.addEventListener('click', e => {
    const eye = e.target.closest('[data-toggle-pass]');
    if (eye) { const input = document.getElementById(eye.dataset.togglePass); const show = input.type === 'password'; input.type = show ? 'text' : 'password'; eye.setAttribute('aria-pressed', String(show)); eye.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha'); return; }
    if (PUBLIC && e.target.closest('#auth-forgot')) { forgot(); return; }
    if (e.target.closest('#auth-forgot')) { document.getElementById('login-error').textContent = 'Na versão final, você vai receber um link para criar uma nova senha. Nesta versão de teste, é só entrar com qualquer senha.'; return; }
    if (e.target.closest('#auth-code')) { document.getElementById('login-error').textContent = 'Na versão final, um código de acesso chega pelo WhatsApp. Nesta versão de teste, use o e-mail ou celular com qualquer senha.'; }
  });
  const fail = (form, id, message) => { document.getElementById(id).textContent = message; const field = form.querySelector('[aria-invalid=true]'); if (field) field.focus(); };
  const mark = (input, bad) => { input.setAttribute('aria-invalid', String(bad)); return bad; };
  document.getElementById('panel-login').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget; const id = form.elements.login, pass = form.elements.senha;
    const badId = mark(id, id.value.trim().length < 5), badPass = mark(pass, pass.value.length < 1);
    if (badId || badPass) return fail(form, 'login-error', badId ? 'Informe seu e-mail ou celular.' : 'Informe sua senha.');
    if (PUBLIC) { authCall(form, 'login-error', () => NibConta.entrar(id.value.trim(), pass.value)); return; }
    state.member = { first: 'Jéssica', full: 'Jéssica Exemplo', email: id.value.includes('@') ? id.value.trim().slice(0,80) : 'jessica@example.com' };
    offerFace();
  });
  const passRules = v => [v.length >= 8, /[A-ZÀ-Ý]/.test(v), /[a-zß-ÿ]/.test(v), /\d/.test(v), /[^A-Za-zÀ-ÿ0-9\s]/.test(v)];
  const passItems = [...document.querySelectorAll('.pass-rules li')];
  function refreshPass() {
    const p1 = document.getElementById('signup-pass').value, p2 = document.getElementById('signup-pass2').value;
    passRules(p1).forEach((ok,i) => { passItems[i].classList.toggle('is-ok', ok); passItems[i].setAttribute('aria-label', passItems[i].textContent + (ok ? ': atendido' : ': pendente')); });
    const hint = document.getElementById('signup-pass2-hint');
    hint.textContent = !p2 ? '' : p1 === p2 ? 'As senhas são iguais.' : 'As senhas ainda não são iguais.';
    hint.classList.toggle('is-ok', !!p2 && p1 === p2);
  }
  ['signup-pass','signup-pass2'].forEach(id => document.getElementById(id).addEventListener('input', refreshPass));
  const signupCell = document.getElementById('signup-cell'), signupCellWrap = document.getElementById('signup-cell-wrap');
  const fillSignupCells = () => { const v = signupCell.value; signupCell.innerHTML = '<option value="">Escolha sua célula</option>' + cellOptions(v); };
  fillSignupCells(); if (window.NibSite) NibSite.onChange(fillSignupCells);
  document.getElementById('panel-signup').addEventListener('change', e => { if (e.target.name === 'tem_celula') { signupCellWrap.hidden = e.target.value !== 'sim'; if (e.target.value === 'sim') signupCell.focus(); } });
  { const b = document.getElementById('signup-birth'); if (b && window.NibDaily) b.max = NibDaily.dayKey(new Date()); }
  document.getElementById('panel-signup').addEventListener('reset', () => { signupCellWrap.hidden = true; });
  auth.addEventListener('input', e => { const field = e.target.closest('input,select'); if (!field) return; field.removeAttribute('aria-invalid'); const err = field.form && field.form.querySelector('.auth-error'); if (err) err.textContent = ''; });
  document.getElementById('panel-signup').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget; const f = form.elements;
    const name = f.nome.value.trim().replace(/\s+/g,' ');
    const checks = [
      [f.nome, name.split(' ').length < 2, 'Escreva seu nome e sobrenome.'],
      [f.celular, f.celular.value.replace(/\D/g,'').length < 10, 'Informe um celular com DDD.'],
      [f.nascimento, !/^\d{4}-\d{2}-\d{2}$/.test(f.nascimento.value) || f.nascimento.value < '1900-01-01' || f.nascimento.value > NibDaily.dayKey(new Date()), 'Informe sua data de nascimento.'],
      [f.email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()), 'Informe um e-mail válido.'],
      [f.senha, !passRules(f.senha.value).every(Boolean), 'A senha ainda não atende a todos os critérios.'],
      [f.senha2, f.senha2.value !== f.senha.value || !f.senha2.value, 'As senhas não são iguais.'],
      [f.celula, f.tem_celula.value === 'sim' && !f.celula.value, 'Escolha a célula de que você participa.'],
      [document.getElementById('signup-consent'), !document.getElementById('signup-consent').checked, 'Para continuar, aceite a política de privacidade.']
    ];
    checks.forEach(([el,bad]) => mark(el,bad));
    const first = checks.find(c => c[1]);
    if (first) return fail(form, 'signup-error', first[2]);
    const full = properName(name).slice(0,80);
    if (PUBLIC) { authCall(form, 'signup-error', () => NibConta.cadastrar({ nome: full, sexo: f.sexo.value, celular: f.celular.value, nascimento: f.nascimento.value, email: f.email.value.trim(), vinculo: f.vinculo.value, celula: f.tem_celula.value === 'sim' ? f.celula.value : '', senha: f.senha.value, consentimento: true })); return; }
    state.member = { first: full.split(' ')[0], full, email: f.email.value.trim().slice(0,80), gender: f.sexo.value === 'm' ? 'm' : 'f' };
    if (f.tem_celula.value === 'nao') state.demoCell = null; else { const c = findCell(f.celula.value); const wd = c ? weekdays.findIndex(w => c.dia.toLowerCase().startsWith(w)) : -1; const t = c && c.horario.match(/(\d{1,2})[:h](\d{2})/); state.demoCell = c && wd >= 0 ? { name: c.nome, weekday: wd, time: t ? t[1].padStart(2, '0') + ':' + t[2] : '', place: c.local, leader: c.lider } : undefined; }
    offerFace();
  });
  // Face ID (simulação): na versão final usa chave de acesso (WebAuthn/passkey); o rosto nunca sai do aparelho.
  const faceOffer = document.getElementById('face-offer'), faceScan = document.getElementById('face-scan');
  function scanFace() {
    return new Promise(resolve => {
      const text = faceScan.querySelector('.face-scan-text');
      faceScan.classList.remove('is-ok'); text.textContent = 'Face ID'; faceScan.hidden = false;
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(() => { faceScan.classList.add('is-ok'); text.textContent = 'Reconhecido'; setTimeout(() => { faceScan.hidden = true; resolve(); }, still ? 400 : 750); }, still ? 400 : 1300);
    });
  }
  function offerFace() {
    if (readFlag('nib-faceid')) { finishAuth(); return; }
    faceOffer.hidden = false;
    requestAnimationFrame(() => document.getElementById('face-enable').focus({preventScroll:true}));
  }
  document.getElementById('face-enable').addEventListener('click', () => { faceOffer.hidden = true; scanFace().then(() => { writeFlag('nib-faceid', true); finishAuth(); }); });
  document.getElementById('face-later').addEventListener('click', () => { faceOffer.hidden = true; finishAuth(); });
  faceOffer.addEventListener('keydown', e => { if (e.key === 'Escape') { faceOffer.hidden = true; finishAuth(); } });
  document.getElementById('auth-face').addEventListener('click', () => {
    scanFace().then(() => { state.member = { first: 'Jéssica', full: 'Jéssica Exemplo', email: 'jessica@example.com' }; finishAuth(); });
  });
  function finishAuth() {
    writeFlag('nib-auth', true);
    auth.hidden = true;
    onboarding.querySelectorAll('[data-member-first]').forEach(el => { el.textContent = state.member.first; });
    renderNavigation(); show('inicio', false, false);
    document.getElementById('account').textContent = state.member.full + ' · Membro';
    onboarding.hidden = false; goSlide(0);
    // Quem tocou em "Não mostrar novamente" vai direto para a inicial, com a animação do brasão.
    if (onbHidden()) { closeOnboarding(); return; }
    requestAnimationFrame(() => document.getElementById('onb-next').focus({preventScroll:true}));
  }
  const track = document.getElementById('onb-track');
  const slides = [...track.children];
  const onbDots = [...document.querySelectorAll('#onb-dots span')];
  const next = document.getElementById('onb-next');
  let slide = 0;
  function goSlide(i, smooth = true) {
    slide = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: slides[slide].offsetLeft - track.offsetLeft, behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
    syncSlide();
  }
  function syncSlide() {
    onbDots.forEach((d,k) => d.classList.toggle('is-active', k === slide));
    slides.forEach((el,k) => { el.setAttribute('aria-hidden', String(k !== slide)); el.inert = k !== slide; });
    next.textContent = slide === slides.length - 1 ? 'Começar' : 'Próximo';
  }
  let slideFrame = 0;
  track.addEventListener('scroll', () => { if (slideFrame) return; slideFrame = requestAnimationFrame(() => { slideFrame = 0; const k = Math.round(track.scrollLeft / track.clientWidth); if (k !== slide) { slide = k; syncSlide(); } }); }, {passive:true});
  const enter = document.getElementById('app-enter');
  function closeOnboarding() {
    writeFlag('nib-onboarded', true); if (PUBLIC) setOnbHidden(true);
    window.scrollTo(0,0);
    const done = () => { enter.hidden = true; auth.hidden = true; gate(false); document.getElementById('heading').focus({preventScroll:true}); };
    if (!enter.animate) { onboarding.hidden = true; done(); return; }
    // O brasão nunca é pulado, com a animação completa mesmo com "reduzir movimento" ligado no celular
    // (decisão de Hilton, 06/11/2026: sem movimento não faz sentido ter a animação).
    // Acabamento contido: o brasão assenta com desaceleração longa, um reflexo de luz atravessa
    // o desenho e a tela se dissolve sobre a inicial, que sobe de leve. Só transform e opacity.
    const covered = !enter.hidden; // já cobrindo a tela (app aberto com sessão): não esmaece de novo
    enter.hidden = false;
    const mark = enter.querySelector('.enter-mark'), shine = enter.querySelector('.enter-shine'), halo = enter.querySelector('.enter-halo');
    const T = 2600, settle = 'cubic-bezier(.16,1,.3,1)', soft = 'cubic-bezier(.65,0,.35,1)';
    const parts = appParts.filter(Boolean);
    enter.animate([{opacity:covered ? 1 : 0},{opacity:1}], {duration:covered ? 0 : 360, easing:'cubic-bezier(.33,1,.68,1)', fill:'forwards'}).finished.then(() => {
      // Troca de telas enquanto tudo está coberto, para o trabalho de layout não cair no meio da animação.
      onboarding.hidden = true; auth.hidden = true; gate(false); parts.forEach(el => { el.inert = true; });
      return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    }).then(() => {
      const at = ms => ms / T;
      const runs = [
        halo.animate([{opacity:0,transform:'translate(-50%,-52%) scale(.7)'},{opacity:1,transform:'translate(-50%,-52%) scale(1)',offset:at(1300),easing:soft},{opacity:0,transform:'translate(-50%,-52%) scale(1.15)'}], {duration:T, easing:settle, fill:'forwards'}),
        mark.animate([
          {opacity:0,transform:'translateY(10px) scale(.94)',easing:settle},
          {opacity:1,transform:'translateY(0) scale(1)',offset:at(1000)},
          {opacity:1,transform:'translateY(0) scale(1)',offset:at(1700),easing:'cubic-bezier(.5,0,.75,0)'},
          {opacity:0,transform:'translateY(0) scale(1.04)'}
        ], {duration:T, fill:'forwards'}),
        shine.animate([
          {transform:'translateX(-170%) skewX(-12deg)'},
          {transform:'translateX(-170%) skewX(-12deg)',offset:at(650),easing:soft},
          {transform:'translateX(260%) skewX(-12deg)',offset:at(1550)},
          {transform:'translateX(260%) skewX(-12deg)'}
        ], {duration:T, fill:'forwards'}),
        enter.animate([{opacity:1},{opacity:1,offset:at(1850),easing:soft},{opacity:0}], {duration:T, fill:'forwards'}),
        ...parts.map(el => el.animate([{transform:'translateY(14px)'},{transform:'translateY(14px)',offset:at(1850),easing:settle},{transform:'none'}], {duration:T}))
      ];
      return Promise.all(runs.map(a => a.finished));
    }).then(() => { enter.getAnimations({subtree:true}).forEach(a => a.cancel()); done(); });
  }
  next.addEventListener('click', () => { if (slide === slides.length - 1) closeOnboarding(); else goSlide(slide + 1); });
  document.getElementById('onb-skip').addEventListener('click', () => { setOnbHidden(true); closeOnboarding(); });
  onboarding.addEventListener('keydown', e => { if (e.key === 'ArrowRight') goSlide(slide + 1); if (e.key === 'ArrowLeft') goSlide(slide - 1); if (e.key === 'Escape') closeOnboarding(); });
  ['simulate-birthday','simulate-birthday-mobile'].forEach(id => document.getElementById(id).addEventListener('change', e => { state.simulateBirthday = e.target.checked; ['simulate-birthday','simulate-birthday-mobile'].forEach(o => { document.getElementById(o).checked = e.target.checked; }); state.birthdayShown = false; document.querySelector('.test-options').open = false; closeDrawer(); refreshNotices(); if (!isManagement()) show('inicio', false, false); }));
  document.getElementById('simulate-service').addEventListener('change', e => { state.simulateService = e.target.checked; document.querySelector('.test-options').open = false; if (!isManagement()) show('inicio', false, false); });
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-logout]')) return;
    if (PUBLIC) { closeDrawer(); NibConta.sair().finally(() => { applyAccount(); show('inicio', false, false); if (LOGIN_REQUIRED) { ['panel-login','panel-signup'].forEach(id => document.getElementById(id).reset()); requireLogin(); } else announce('Você saiu da sua conta.', 'success', false); }); return; }
    closeDrawer(); writeFlag('nib-auth', false); writeFlag('nib-faceid', false);
    if (state.context !== 'membro') { const s = document.getElementById('demo-context'); s.value = 'membro'; changeContext({ target: s }); }
    ['panel-login','panel-signup'].forEach(id => document.getElementById(id).reset()); openAuth();
  });
  document.getElementById('replay-flow').addEventListener('click', () => { document.querySelector('.test-options').open = false; writeFlag('nib-auth', false); writeFlag('nib-faceid', false); setOnbHidden(false); ['panel-login','panel-signup'].forEach(id => document.getElementById(id).reset()); openAuth(); });
  // Abertura: aparece ao abrir o aplicativo, antes do acesso; some sozinha ou ao toque.
  const splash = document.getElementById('app-splash');
  // Versão oficial: é preciso entrar. Sem conta, abre direto a tela de entrar/criar cadastro.
  const LOGIN_REQUIRED = PUBLIC && !!window.NibConta && NibConta.available();
  const authReady = LOGIN_REQUIRED ? NibConta.eu() : Promise.resolve(null);
  function requireLogin() { publicAuthChrome(); openAuth(); }
  // Com conta: na primeira visita mostra a orientação; depois vai direto para a inicial.
  function publicStart(fromLogin = false) {
    if (LOGIN_REQUIRED && !account()) { gate(true); authReady.then(() => { if (account()) publicStart(); else requireLogin(); }); return; }
    // Depois de entrar, a animação do brasão sempre aparece (a tela de entrar some por baixo dela).
    if (fromLogin && onbHidden()) { closeOnboarding(); return; }
    if (!auth.hidden) auth.hidden = true;
    if (onbHidden()) { gate(false); return; }
    gate(true); onboarding.querySelectorAll('[data-member-first]').forEach(el => { el.parentNode.textContent = account() ? `Boas-vindas, ${account().primeiro}` : 'Boas-vindas à Nib'; });
    onboarding.hidden = false; goSlide(0, false); requestAnimationFrame(() => document.getElementById('onb-next').focus({preventScroll:true}));
  }
  const afterSplash = () => { if (PUBLIC) publicStart(); else if (!readFlag('nib-auth')) openAuth(); };
  // Já logado neste aparelho (celular e desktop): ao abrir de novo, em vez da abertura, a tela azul cobre
  // tudo enquanto a sessão é conferida e o brasão aparece (pedido de Hilton, 06/11/2026).
  const crestOpen = LOGIN_REQUIRED && NibConta.logado && NibConta.logado();
  if (crestOpen) {
    if (splash) splash.hidden = true;
    try { sessionStorage.setItem('nib-splash','1'); } catch (_) {}
    gate(true); enter.hidden = false;
    authReady.then(() => {
      if (account() && onbHidden()) { auth.hidden = true; closeOnboarding(); return; }
      enter.hidden = true; publicStart();
    });
  } else if (splash) {
    let seen = false;
    try { seen = sessionStorage.getItem('nib-splash') === '1'; sessionStorage.setItem('nib-splash','1'); } catch (_) {}
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = () => { if (splash.hidden || splash.classList.contains('is-leaving')) return; if (PUBLIC) publicStart(); else if (!readFlag('nib-auth')) openAuth(); else gate(false); splash.classList.add('is-leaving'); setTimeout(() => { splash.hidden = true; }, reduced ? 0 : 500); };
    if (seen) { splash.hidden = true; afterSplash(); }
    else {
      gate(true);
      splash.querySelectorAll('[data-letters]').forEach(el => { const chars = [...el.textContent]; el.textContent = ''; chars.forEach((c,i) => { const ch = document.createElement('span'); ch.className = 'ch'; ch.textContent = c; ch.style.setProperty('--i', i); el.append(ch); }); });
      if (reduced) splash.querySelector('.splash-logo').src = 'assets/splash-logo-final.webp';
      splash.classList.add('is-playing'); splash.addEventListener('click', finish); setTimeout(finish, reduced ? 1200 : 6100);
    }
  } else afterSplash();
