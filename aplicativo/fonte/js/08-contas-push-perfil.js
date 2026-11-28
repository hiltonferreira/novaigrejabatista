  // Contas reais (versão pública): cadastro, entrada, meu cadastro e painel da equipe.
  const statusLabel = { confirmado: 'Membro confirmado', pendente: 'Aguardando confirmação da Secretaria', nao: 'Não é membro' };
  const vinculoLabel = { membro: 'Membro', frequento: 'Frequenta a igreja', visitante: 'Conhecendo a igreja' };
  function publicAuthChrome() {
    if (auth.dataset.chrome) return; auth.dataset.chrome = '1';
    const lead = auth.querySelector('.auth-lead'); if (lead) lead.textContent = LOGIN_REQUIRED ? 'Acesse e acompanhe a agenda, contribuição e caderno de oração.' : 'Entre ou crie seu cadastro para manter seus dados em dia com a igreja.';
    if (LOGIN_REQUIRED) return;
    const close = document.createElement('button'); close.type = 'button'; close.className = 'auth-close'; close.textContent = 'Voltar ao app';
    close.addEventListener('click', closeAccount);
    auth.querySelector('.auth-sheet').prepend(close);
    auth.addEventListener('keydown', e => { if (PUBLIC && e.key === 'Escape') closeAccount(); });
  }
  function closeAccount() { auth.hidden = true; gate(false); }
  function openAccount(tab) {
    if (!window.NibConta || !NibConta.available()) { closeDrawer(); announce('As contas funcionam no endereço oficial do app: novaigrejabatista.com.br/app.', 'info'); return; }
    closeDrawer(); publicAuthChrome(); openAuth(); if (tab === 'signup') setTab('signup', false);
  }
  async function authCall(form, errId, fn) {
    const btn = form.querySelector('[type=submit]'), err = document.getElementById(errId);
    btn.disabled = true; err.textContent = '';
    try {
      await fn();
      closeAccount(); ['panel-login','panel-signup'].forEach(id => document.getElementById(id).reset()); refreshPass();
      applyAccount(); show('inicio', false, false); if (LOGIN_REQUIRED) publicStart(true); pendingQrCheckin(); pendingPilula();
      const p = account(); announce(form.id === 'panel-signup' ? `Cadastro criado. Boas-vindas, ${p.primeiro}!` + (p.membro_status === 'pendente' ? ' A Secretaria vai confirmar sua membresia.' : '') : `Que bom ver você, ${p.primeiro}!`, 'success', false);
    } catch (e) { err.textContent = e.message; }
    finally { btn.disabled = false; }
  }
  async function forgot() {
    const err = document.getElementById('login-error'), email = document.getElementById('login-id').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Escreva seu e-mail no campo acima e toque de novo em "Esqueci minha senha".'; document.getElementById('login-id').focus(); return; }
    err.textContent = 'Enviando';
    try { await NibConta.esqueci(email); err.textContent = 'Se houver um cadastro com esse e-mail, enviamos um link para criar uma nova senha. Confira também a caixa de spam e Promoções.'; }
    catch (e) { err.textContent = e.message; }
  }
  function applyAccount() {
    root.classList.toggle('has-account', !!account());
    const who = account() ? account().id + '-' + account().papel : '';
    refreshNotices();
    if (state.accountKey !== who) { state.accountKey = who; state.push = null; if (who) pushRefresh().then(refreshNotices); state.team = null; state.regs = null; state.prayers = []; state.prayersLoaded = false; if (who) loadPrayers().then(() => { if (state.view === 'inicio') show('inicio', false, false); }); }
    renderNavigation();
    show(state.view, false, false);
  }
  // Notificações no celular (Web Push): só no app oficial, com conta, e a pessoa autoriza.
  const pushOk = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const isIOS = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const b64uBytes = s => { const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)); return Uint8Array.from(b, c => c.charCodeAt(0)); };
  async function pushSub() { if (!pushOk()) return null; const reg = await navigator.serviceWorker.getRegistration(); return reg ? reg.pushManager.getSubscription() : null; }
  async function pushRefresh() {
    try { const sub = await pushSub(); if (!sub) { state.push = { on: false }; } else { const e = await NibConta.pushEstado(sub.endpoint); state.push = { on: e.inscrito, caderno: e.caderno, lembretes: e.lembretes !== false }; if (!e.inscrito) await NibConta.push('push-inscrever', sub.toJSON()).then(() => { state.push = { on: true, caderno: false, lembretes: true }; }); } }
    catch (_) { state.push = { on: false }; }
    if (state.view === 'cadastro') show('cadastro', false, false);
  }
  async function pushOn(btn) {
    btn.disabled = true;
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { announce('As notificações foram bloqueadas. Para ativar, libere nas configurações do celular para este app.', 'warning'); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64uBytes(await NibConta.pushChave()) });
      await NibConta.push('push-inscrever', sub.toJSON());
      state.push = { on: true, caderno: false, lembretes: true }; show('cadastro', false, false); announce('Notificações ativadas neste celular.', 'success', false);
    } catch (e) { announce(e.message || 'Não foi possível ativar as notificações neste aparelho.', 'error'); }
    finally { btn.disabled = false; }
  }
  async function pushOffCall() { try { const sub = await pushSub(); if (sub) { await NibConta.push('push-sair', { endpoint: sub.endpoint }).catch(() => {}); await sub.unsubscribe(); } } catch (_) {} state.push = { on: false }; show('cadastro', false, false); announce('Notificações desligadas neste celular.', 'success', false); }
  async function pushLembretes(input) { try { const sub = await pushSub(); if (!sub) return; await NibConta.push('push-preferencia', { endpoint: sub.endpoint, lembretes: input.checked }); state.push.lembretes = input.checked; announce(input.checked ? 'Você vai receber o lembrete no dia dos cultos, da sua célula e dos eventos.' : 'Os lembretes do dia foram desligados neste celular.', 'success', false); } catch (e) { input.checked = !input.checked; announce(e.message, 'error'); } }
  async function pushCaderno(input) { try { const sub = await pushSub(); if (!sub) return; await NibConta.push('push-preferencia', { endpoint: sub.endpoint, caderno: input.checked }); state.push.caderno = input.checked; announce(input.checked ? 'Você vai receber os novos pedidos de oração.' : 'Os pedidos de oração não vão mais gerar notificação.', 'success', false); } catch (e) { input.checked = !input.checked; announce(e.message, 'error'); } }
  function pushBox() {
    const head = '<section class="box push-box" aria-labelledby="push-title"><span class="label">NOTIFICAÇÕES</span><h2 id="push-title">Avisos no seu celular</h2>';
    if (isIOS() && !standalone()) return head + '<p>No iPhone, as notificações funcionam com o app instalado. No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”. Abra o app pelo ícone e volte aqui.</p></section>';
    if (!pushOk()) return head + '<p>Este navegador não recebe notificações. Instale o app na tela inicial do celular para ativar.</p></section>';
    if (!state.push) { pushRefresh(); return head + '<p>Conferindo</p></section>'; }
    if (!state.push.on) return head + '<p>Receba no celular os avisos da igreja, como a confirmação da sua membresia.</p><div class="form-actions"><button type="button" class="action" data-push="on">Ativar notificações</button></div></section>';
    return head + `<p>Ativadas neste celular. Você recebe os avisos da igreja e da sua membresia.</p><label class="check"><input type="checkbox" data-push-lembretes${state.push.lembretes !== false ? ' checked' : ''}><span>Lembrete no dia dos cultos, da minha célula e dos eventos, com o horário</span></label><label class="check"><input type="checkbox" data-push-caderno${state.push.caderno ? ' checked' : ''}><span>Também quero receber cada novo pedido do Caderno de oração</span></label><div class="form-actions"><button type="button" class="button" data-push="off">Desligar neste celular</button></div></section>`;
  }
  var papelNome = { admin: 'Administração', pastoral: 'Liderança Pastoral', secretaria: 'Secretaria', tesouraria: 'Tesouraria', membro: 'Membro' };
  function papeisTexto(l) { return (l || []).filter(k => k !== 'membro').map(k => papelNome[k] || k).join(' + ') || 'Membro'; }
  // Admin escolhe com qual perfil quer ver o app (só a tela muda; permissões reais ficam no servidor).
  // Quem tem mais de um perfil (ou é admin) escolhe com qual perfil ver o app. Só a tela muda; o servidor usa os perfis reais.
  function verOpcoes() { return (PUBLIC && window.NibConta && NibConta.opcoesPerfil) ? NibConta.opcoesPerfil() : []; }
  function verAtual() { return NibConta.verComo() || verOpcoes()[0]; }
  function verAdmin() { return verOpcoes()[0] === 'admin'; }
  function viewAsBox() {
    const o = verOpcoes(); if (o.length < 2) return '';
    const atual = verAtual();
    const curto = { admin: 'Admin', pastoral: 'Pastoral', secretaria: 'Secretaria', membro: 'Membro' };
    const opts = o.map(k => `<button type="button" class="history-year${atual === k ? ' is-active' : ''}" data-ver-como="${k}" aria-pressed="${atual === k}">${curto[k]}</button>`).join('');
    return `<section class="box view-as-box"><span class="label">${verAdmin() ? 'SÓ PARA ADMINISTRAÇÃO' : 'SEUS PERFIS'}</span><h2>Ver o app como</h2><p>${verAdmin() ? 'Veja o app como cada perfil vê. Só a tela muda: suas permissões continuam as de administração.' : 'Você tem mais de um perfil na igreja. Escolha com qual quer usar o app agora.'}</p><div class="cell-days view-as-opts" role="group" aria-label="Ver o app como" data-seg="ver-como">${opts}</div></section>`;
  }
  function verOptions(atual) { return verOpcoes().map(k => `<option value="${k}"${atual === k ? ' selected' : ''}>${papelNome[k]}</option>`).join(''); }
  // Seletor fixo no menu (celular e computador), como o "Testar experiência" da versão local.
  function viewAsSelect(where) {
    if (verOpcoes().length < 2) return '';
    const id = 'ver-como-' + where;
    return `<div class="view-as-menu"><label for="${id}">Ver o app como</label><select id="${id}" data-ver-como-select autocomplete="off">${verOptions(verAtual())}</select></div>`;
  }
  function viewAsBar() {
    if (!PUBLIC || !window.NibConta || !NibConta.verComo()) return '';
    const volta = verOpcoes()[0], txt = volta === 'admin' ? 'Voltar para administração' : 'Voltar para ' + papelNome[volta];
    return `<div class="view-as-bar" role="status"><span class="view-as-eye" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></span><label for="ver-como-faixa">Vendo como</label><select id="ver-como-faixa" data-ver-como-select autocomplete="off">${verOptions(NibConta.verComo())}</select><button type="button" class="view-as-back" data-ver-como="${volta}" aria-label="${txt}" title="${txt}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12 M18 6 6 18"/></svg></button></div>`;
  }
  function syncViewAsBar() {
    let bar = document.getElementById('view-as-bar'); const html = viewAsBar();
    if (!html) { if (bar) bar.remove(); return; }
    if (!bar) { const eb = document.getElementById('eyebrow'), main = document.getElementById('main'); const anchor = eb && main && [...main.children].find(c => c.contains(eb)); if (!anchor) return; bar = document.createElement('div'); bar.id = 'view-as-bar'; main.insertBefore(bar, anchor); }
    bar.innerHTML = html;
  }
  function setViewAs(v) {
    NibConta.definirVerComo(v);
    state.sugList = null; state.cadPainel = null; state.cadTab = 'pedidos'; state.ckPanel = null; state.ck = null; state.ckKey = null; state.avisos = null; state.painel = null; state.mem = null; state.memSel = null; state.memb = null;
    applyAccount();
  }
  // Foto de perfil em Meu cadastro: escolher (galeria ou câmera), trocar ou remover. Reduzida no aparelho para 512 px em WebP.
  function fotoPerfilBox(p) {
    const cam = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.4-2h5l1.4 2h1.6A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z"/><circle cx="12" cy="12.5" r="3.5"/></svg>';
    return `<div class="foto-perfil">${avatarHtml(p.primeiro, p.foto, 'is-grande')}<div><label class="button foto-perfil-btn">${cam}<span>${p.foto ? 'Trocar foto' : 'Adicionar foto'}</span><input type="file" accept="image/*" data-foto-perfil class="visually-hidden"></label>${p.foto ? '<button type="button" class="link-button" data-foto-remover>Remover foto</button>' : ''}<small>Aparece no seu perfil e nos seus pedidos do caderno de oração.</small></div></div>`;
  }
  async function fotoPerfilEnviar(input) {
    const f = input.files && input.files[0]; if (!f) return;
    const box = input.closest('.foto-perfil'); if (box) box.classList.add('is-enviando');
    const url = URL.createObjectURL(f);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Não foi possível abrir essa imagem. Escolha uma foto JPEG ou PNG.')); i.src = url; });
      const lado = Math.min(img.naturalWidth, img.naturalHeight), T = Math.min(512, lado), c = document.createElement('canvas'); c.width = c.height = T;
      c.getContext('2d').drawImage(img, (img.naturalWidth - lado) / 2, (img.naturalHeight - lado) / 2, lado, lado, 0, 0, T, T);
      const gera = (tipo, q) => new Promise(res => c.toBlob(b => res(b), tipo, q));
      let blob = await gera('image/webp', 0.82); if (!blob || blob.type !== 'image/webp') blob = await gera('image/jpeg', 0.86);
      if (!blob) throw new Error('Não foi possível preparar a foto.');
      await NibConta.foto(blob); applyAccount(); state.prayersLoaded = false; show('cadastro', false, false); announce('Foto salva.', 'success', false);
    } catch (e) { if (box) box.classList.remove('is-enviando'); announce(e.message, 'warning'); }
    finally { URL.revokeObjectURL(url); input.value = ''; }
  }
  function accountPage() {
    const p = account(); if (!p) return '';
    const status = p.vinculo === 'membro' || p.membro_status === 'confirmado' ? `<dt>Membresia</dt><dd>${escape(statusLabel[p.membro_status] || '')}</dd>` : '';
    return `${viewAsBox()}${pushBox()}<div class="profile-layout"><section class="box profile-summary">${fotoPerfilBox(p)}<div class="profile-head"><h2>${escape(p.nome)}</h2><span class="tag ${p.membro_status === 'confirmado' ? 'status-active' : p.membro_status === 'pendente' ? 'is-wait' : 'is-neutral'}">${escape(p.membro_status === 'confirmado' ? 'Membro' : p.membro_status === 'pendente' ? 'Aguardando' : (vinculoLabel[p.vinculo] || 'Cadastro'))}</span></div><dl class="profile"><dt>E-mail</dt><dd>${escape(p.email)}</dd><dt>Celular</dt><dd>${escape(fmtPhone(p.celular)) || 'Não informado'}</dd><dt>Endereço</dt><dd>${escape(p.endereco || 'Não informado')}</dd><dt>Nascimento</dt><dd>${escape(fmtDay(p.nascimento) || 'Não informado')}</dd><dt>CPF</dt><dd>${escape(fmtCpf(p.cpf) || 'Não informado')}</dd><dt>Célula</dt><dd>${escape(p.celula ? p.celula.split('|').reverse().join(' · ') : 'Não participa')}</dd>${status}<dt>Cadastro desde</dt><dd>${escape(fmtDay(p.criado_em))}</dd></dl><button type="button" class="button account-logout" data-logout="1">Sair da conta</button></section>
<section class="box profile-edit"><h2>Atualizar meus dados</h2><form id="account-form" novalidate><div class="form-grid"><div><label for="acc-nome">Nome completo</label><input id="acc-nome" name="nome" maxlength="120" value="${escape(p.nome)}" required></div><div><label for="acc-cel">Celular com WhatsApp</label><input id="acc-cel" name="celular" type="tel" inputmode="tel" maxlength="25" value="${escape(fmtPhone(p.celular))}" required></div><div><label for="acc-nasc">Data de nascimento</label><input id="acc-nasc" name="nascimento" type="date" min="1900-01-01" value="${escape(p.nascimento || '')}"></div><div><label for="acc-cpf">CPF</label><input id="acc-cpf" name="cpf" inputmode="numeric" autocomplete="off" maxlength="14" placeholder="000.000.000-00" value="${escape(fmtCpf(p.cpf))}"></div><div><label for="acc-end">Endereço</label><input id="acc-end" name="endereco" maxlength="250" value="${escape(p.endereco || '')}" placeholder="Rua, número, bairro"></div><div><label for="acc-cel-cell">Célula</label><select id="acc-cel-cell" name="celula"><option value="">Não participo de célula</option>${cellOptions(p.celula)}${p.celula && !findCell(p.celula) ? `<option value="${escape(p.celula)}" selected>${escape(p.celula.split('|').reverse().join(' · '))} (fora da lista)</option>` : ''}</select></div></div><fieldset class="auth-choice"><legend>Gênero</legend><div class="choice-seg"><label><input type="radio" name="sexo" value="m"${p.sexo === 'm' ? ' checked' : ''}><span>Masculino</span></label><label><input type="radio" name="sexo" value="f"${p.sexo !== 'm' ? ' checked' : ''}><span>Feminino</span></label></div></fieldset><label class="check"><input type="checkbox" name="mostrar"${p.mostrar_aniversario ? ' checked' : ''}><span>Mostrar meu aniversário (dia e mês) para a igreja</span></label><p class="form-error" role="alert"></p><div class="form-actions"><button class="action" type="submit">Salvar alterações</button></div><p class="note">Para trocar o e-mail, fale com a Secretaria.</p></form></section>
<section class="box"><h2>Trocar senha</h2><form id="password-form" novalidate><label for="pw-atual">Senha atual</label><input id="pw-atual" name="atual" type="password" autocomplete="current-password" required><label for="pw-nova">Nova senha</label><input id="pw-nova" name="nova" type="password" autocomplete="new-password" required><p class="note">Pelo menos 8 caracteres, com letra maiúscula, minúscula, número e símbolo.</p><p class="form-error" role="alert"></p><div class="form-actions"><button class="action" type="submit">Trocar senha</button></div></form>
<details class="account-delete"><summary>Excluir minha conta</summary><form id="delete-form" novalidate><p>Seus dados do app serão apagados. Essa ação não pode ser desfeita.</p><label for="del-senha">Confirme com sua senha</label><input id="del-senha" name="senha" type="password" autocomplete="current-password" required><p class="form-error" role="alert"></p><button class="button danger" type="submit">Excluir minha conta</button></form></details></section></div>`;
  }
  function accountSubmit(form, fd) {
    if (!['account-form','password-form','delete-form'].includes(form.id)) return false;
    const values = Object.fromEntries(fd);
    const err = form.querySelector('.form-error'), btn = form.querySelector('[type=submit]');
    const run = async (fn, ok) => { btn.disabled = true; err.textContent = ''; try { await fn(); ok(); } catch (e) { err.textContent = e.message; } finally { btn.disabled = false; } };
    if (form.id === 'account-form') { const c = (values.cpf || '').replace(/\D/g, ''); if (c && !cpfOk(c)) { err.textContent = 'CPF inválido. Confira os números.'; form.elements.cpf.focus(); return true; } }
    if (form.id === 'account-form') run(() => NibConta.atualizar({ nome: values.nome, celular: values.celular, nascimento: values.nascimento || '', cpf: (values.cpf || '').replace(/\D/g, ''), endereco: values.endereco || '', celula: values.celula || '', sexo: values.sexo, mostrar_aniversario: form.elements.mostrar.checked }), () => { applyAccount(); announce('Seus dados foram atualizados.', 'success'); });
    if (form.id === 'password-form') {
      if (!passRules(values.nova || '').every(Boolean)) { err.textContent = 'A nova senha ainda não atende a todos os critérios.'; return true; }
      run(() => NibConta.senha(values.atual, values.nova), () => { form.reset(); announce('Senha alterada.', 'success'); });
    }
    if (form.id === 'delete-form') run(() => NibConta.excluir(values.senha), () => { applyAccount(); show('inicio', false, false); if (LOGIN_REQUIRED) requireLogin(); announce('Sua conta foi excluída.', 'success', false); });
    return true;
  }
  function teamPage() {
    if (!state.team) {
      NibConta.cadastros().then(list => { state.team = list; if (state.view === 'cadastros') show('cadastros', false, false); })
        .catch(e => { state.team = []; state.teamError = e.message; if (state.view === 'cadastros') show('cadastros', false, false); });
      return '<p class="event-empty">Carregando cadastros</p>';
    }
    const f = state.teamFilter || 'pendente';
    const list = state.team.filter(p => f === 'todos' || (f === 'pendente' ? p.membro_status === 'pendente' : f === 'confirmado' ? p.membro_status === 'confirmado' : p.membro_status === 'nao'));
    const count = k => state.team.filter(p => k === 'todos' || p.membro_status === k).length;
    const chips = [['pendente','Aguardando'],['confirmado','Membros'],['nao','Não membros'],['todos','Todos']].map(([k,l]) => `<button type="button" class="history-year${f === k ? ' is-active' : ''}" data-team-filter="${k}" aria-pressed="${f === k}">${l}<small>${count(k)}</small></button>`).join('');
    const rows = list.map(p => `<li class="team-row" data-q="${escape((p.nome + ' ' + p.email + ' ' + p.celular).toLowerCase())}"><div><strong>${escape(p.nome)}</strong><small>${escape(p.email)} · ${escape(fmtPhone(p.celular))}${p.cpf && NibConta.lideranca() ? ' · CPF ' + escape(fmtCpf(p.cpf)) : ''}</small>${p.celula ? `<small>Célula: ${escape(p.celula.split('|').reverse().join(' · '))}</small>` : ''}<small>${escape(vinculoLabel[p.vinculo] || '')} · desde ${escape(fmtDay(p.criado_em))}${p.papel !== 'membro' ? ' · equipe: ' + escape(p.papel) : ''}</small></div><div class="team-actions">${p.membro_status !== 'confirmado' ? `<button type="button" class="action" data-team-status="confirmado" data-id="${p.id}">Confirmar membro</button>` : ''}${p.membro_status !== 'nao' ? `<button type="button" class="button" data-team-status="nao" data-id="${p.id}">Não é membro</button>` : ''}${p.membro_status === 'nao' ? `<button type="button" class="button" data-team-status="pendente" data-id="${p.id}">Voltar para análise</button>` : ''}</div></li>`).join('');
    return `${state.teamError ? `<p class="form-error" role="alert">${escape(state.teamError)}</p>` : ''}<div class="team-tools"><div class="cell-days" role="group" aria-label="Filtrar cadastros" data-seg="cadastros">${chips}</div><label class="sr-only" for="team-q">Buscar</label><input id="team-q" type="search" placeholder="Buscar por nome, e-mail ou celular" autocomplete="off"></div>${rows ? `<ul class="team-list">${rows}</ul>` : '<p class="event-empty">Nenhum cadastro neste filtro.</p>'}`;
  }
  async function teamSet(btn) {
    btn.disabled = true;
    try { await NibConta.confirmar(Number(btn.dataset.id), btn.dataset.teamStatus); const p = state.team.find(x => String(x.id) === btn.dataset.id); if (p) p.membro_status = btn.dataset.teamStatus; show('cadastros', false, false); announce('Cadastro atualizado.', 'success', false); }
    catch (e) { btn.disabled = false; announce(e.message, 'error'); }
  }
  function teamFilterList(q) { q = q.trim().toLowerCase(); content.querySelectorAll('.team-row').forEach(li => { li.hidden = !!q && !li.dataset.q.includes(q); }); }
