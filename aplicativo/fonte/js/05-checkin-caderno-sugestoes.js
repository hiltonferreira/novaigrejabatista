  // Check-in do culto (versão oficial): pelo local da igreja (GPS) ou pelo QR Code fixo do telão.
  const ckIcon = done => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${done ? 'm5 12.5 4.5 4.5L19 7.5' : NibAdminIcons.recepcao}"/></svg>`;
  function loadCheckin() {
    if (!account() || state.ckLoading) return Promise.resolve();
    state.ckLoading = true;
    return NibConta.checkin('estado').then(r => { state.ck = r; state.ckKey = state.accountKey; }).catch(() => { state.ck = null; }).finally(() => { state.ckLoading = false; });
  }
  function publicCheckin() {
    if (!PUBLIC || !account()) return '';
    if (!state.ckLoading && (state.ckFor !== state.accountKey || Date.now() - (state.ckAt || 0) > 300000)) { state.ckAt = Date.now(); state.ckFor = state.accountKey; loadCheckin().then(() => { if ((state.view === 'inicio' && state.ck && state.ck.culto) || state.view === 'presenca') show(state.view, false, false); }); }
    if (state.ckKey !== state.accountKey) return '';
    const r = state.ck; if (!r || !r.culto) return '';
    const done = r.feito, c = r.culto;
    return `<section class="checkin-card${done ? ' is-done' : ''}" aria-labelledby="checkin-title"><span class="checkin-icon">${ckIcon(done)}</span><div class="checkin-text"><span class="label">${/^EBS/.test(c.nome) ? 'CHECK-IN DA EBS' : 'CHECK-IN DO CULTO'}</span><h2 id="checkin-title" tabindex="-1">${done ? 'Presença registrada' : escape(c.nome)}</h2><p>${done ? `Você está ${escape(c.artigo || 'no')} ${escape(c.nome)}. Que bom ter você aqui!` : `Hoje, às ${escape(c.hora)}. Chegou? Registre sua presença.`}</p>${done || !state.ckMsg ? '' : `<p class="checkin-note" id="checkin-msg">${escape(state.ckMsg)}</p>`}</div>${done ? '' : `<button type="button" class="action primary" data-checkin-go>${state.ckBusy ? 'Confirmando' : 'Fazer check-in'}</button>`}</section>`;
  }
  // Tela "Check-in" do menu (v156): o cartão quando há encontro aberto; fora do horário, quando abre.
  function presencaPage() {
    const card = publicCheckin();
    if (card) return card;
    if (state.ckKey !== state.accountKey || state.ckLoading) return '<p class="event-empty">Carregando</p>';
    return `<section class="box ck-info"><span class="label">FORA DO HORÁRIO</span><h2>O check-in abre 1 hora antes</h2><p>Ele aparece aqui e no Início de 1 hora antes até 2 horas depois de cada encontro:</p><ul class="ck-horarios"><li><strong>Domingo, 9h30</strong><span>EBS · Escola Bíblica de Sabedoria</span></li><li><strong>Domingo, 19h</strong><span>Noite de Glória</span></li><li><strong>Quinta, 19h30</strong><span>Culto da Fé</span></li></ul><p class="note">Na igreja, você também pode ler o QR Code do telão com a câmera do celular.</p></section>`;
  }
  // Posição atual do celular (resolve null se negar, demorar ou não tiver GPS).
  const posicao = (ms = 12000) => new Promise(res => { if (!navigator.geolocation) return res(null); navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lng: p.coords.longitude, precisao: Math.round(p.coords.accuracy) }), () => res(null), { enableHighAccuracy: true, timeout: ms, maximumAge: 30000 }); });
  async function doCheckin(via, codigo) {
    state.ckBusy = true; state.ckMsg = ''; if (state.view === 'inicio' || state.view === 'presenca') show(state.view, false, false);
    const pos = await posicao(via === 'qr' ? 7000 : 12000);
    try {
      if (via === 'local' && !pos) throw new Error('Não conseguimos sua localização. Permita o acesso à localização ou leia o QR Code do telão.');
      const r = await NibConta.checkin('fazer', Object.assign({ via, codigo: codigo || '' }, pos || {}));
      state.ck = { culto: r.culto, feito: true, local: true }; state.ckKey = state.accountKey;
      announce(`Presença registrada ${r.culto.artigo || 'no'} ${r.culto.nome}. Que bom ter você aqui!`, 'success', false);
    } catch (e) { state.ckMsg = e.message; if (via === 'qr') announce(e.message, 'error', false); }
    finally { state.ckBusy = false; show(state.view === 'presenca' ? 'presenca' : 'inicio', false, false); }
  }
  // QR Code do telão: /app/?checkin=CODIGO. Guarda o código até a pessoa entrar na conta.
  try { const qc = new URLSearchParams(location.search).get('checkin'); if (qc && /^[a-f0-9]{24}$/.test(qc)) { sessionStorage.setItem('nib-checkin-qr', qc); const u = new URL(location.href); u.searchParams.delete('checkin'); history.replaceState(null, '', u.pathname + u.search + u.hash); } } catch (_) {}
  // Link compartilhado de uma pílula: /app/?pilula=ID. Guarda até a pessoa entrar na conta e abre direto a pílula.
  try { const pl = new URLSearchParams(location.search).get('pilula'); if (pl && /^\d{1,9}$/.test(pl)) { sessionStorage.setItem('nib-pilula', pl); const u = new URL(location.href); u.searchParams.delete('pilula'); history.replaceState(null, '', u.pathname + u.search + u.hash); } } catch (_) {}
  function pendingPilula() {
    if (!PUBLIC || !account()) return; let pl = null;
    try { pl = sessionStorage.getItem('nib-pilula'); sessionStorage.removeItem('nib-pilula'); } catch (_) {}
    if (pl) { state.pilSel = { id: Number(pl), t: 0 }; state.pilEdit = false; state.pilCapaEd = false; state.pilVer = null; show('pilulas', true, false); }
  }
  function pendingQrCheckin() {
    if (!PUBLIC || !account()) return; let qc = null;
    try { qc = sessionStorage.getItem('nib-checkin-qr'); sessionStorage.removeItem('nib-checkin-qr'); } catch (_) {}
    if (qc) doCheckin('qr', qc);
  }
  function checkinPanel() {
    if (!PUBLIC || !(account() && NibConta.equipe())) return '';
    if (!state.ckPanel) { NibConta.checkin('painel').then(r => { state.ckPanel = r; if (state.view === 'checkin') show('checkin', false, false); }).catch(e => announce(e.message, 'error')); return '<p class="event-empty">Carregando</p>'; }
    const r = state.ckPanel, url = location.origin + location.pathname.replace(/[^/]*$/, '') + '?checkin=' + r.qr;
    const local = r.local ? `<p>Local da igreja definido${(r.pode_local && NibConta.lideranca()) ? '. Se mudar, defina de novo estando na igreja.' : '.'}</p>` : `<p><strong>O local da igreja ainda não foi definido.</strong> ${(r.pode_local && NibConta.lideranca()) ? 'Esteja dentro da igreja e toque no botão abaixo.' : 'Peça à Liderança Pastoral para definir, estando na igreja.'} Enquanto isso, o check-in funciona só pelo QR Code.</p>`;
    const hoje = r.culto ? `<section class="box ck-box"><span class="label">AGORA</span><h2>${escape(r.culto.nome)} · ${r.presentes.length} ${r.presentes.length === 1 ? 'presença' : 'presenças'}</h2>${r.presentes.length ? `<ul class="ck-list">${r.presentes.map(p => `<li><span>${escape(p.nome)}</span><small>${escape(p.hora)} · ${p.via === 'qr' ? 'QR Code' : 'local'}</small></li>`).join('')}</ul>` : '<p>Ninguém registrou presença ainda.</p>'}</section>` : '';
    const hist = r.cultos.length ? `<section class="box ck-box"><span class="label">ÚLTIMOS CULTOS</span><ul class="ck-list">${r.cultos.map(c => `<li><span>${escape(c.culto)} · ${escape(fmtDay(c.dia))}</span><small>${c.total} ${c.total === 1 ? 'presença' : 'presenças'}${c.qr ? ` (${c.qr} pelo QR)` : ''}</small></li>`).join('')}</ul></section>` : '';
    return `${hoje}<section class="box ck-box"><span class="label">QR CODE DO TELÃO</span><h2>Sempre o mesmo código</h2><p>Projete este QR Code no telão. Quem ler com a câmera abre o app e registra a presença. Ele só vale durante o culto (1 h antes até 2 h depois).</p><div class="ck-qr" role="img" aria-label="QR Code do check-in">${qrSvg(url)}</div><div class="form-actions"><button type="button" class="action primary" data-ck-telao>Mostrar em tela cheia</button></div></section><section class="box ck-box"><span class="label">LOCAL DA IGREJA</span><h2>Check-in pela localização</h2>${local}<p class="note">Vale num raio de 150 m. A localização de cada pessoa não fica guardada, só a distância.</p>${(r.pode_local && NibConta.lideranca()) ? `<div class="form-actions"><button type="button" class="action" data-ck-local>${r.local ? 'Definir de novo aqui' : 'Definir o local da igreja aqui'}</button></div>` : ''}</section>${hist}`;
  }
  // Sugestões para o app: qualquer pessoa com conta envia; administração e Liderança Pastoral leem.
  const sugTipos = [['sugestao', 'Sugestão'], ['problema', 'Problema'], ['elogio', 'Elogio']];
  function sugestoesPage() {
    if (!PUBLIC) return `<section class="box"><p>As sugestões enviadas pelo app chegam para a administração.</p></section>`;
    const tipo = state.sugTipo || 'sugestao', ti = sugTipos.findIndex(t => t[0] === tipo), from = state.sugFrom === undefined ? ti : state.sugFrom; state.sugFrom = ti;
    const seg = `<div class="sug-tipos seg" role="radiogroup" aria-label="Tipo de mensagem" style="--n:3;--i:${ti};--from:${from}"><span class="seg-pill${from !== ti ? ' is-moving' : ''}" aria-hidden="true"></span>${sugTipos.map(([v, l]) => `<button type="button" role="radio" aria-checked="${v === tipo}" data-sug-tipo="${v}">${l}</button>`).join('')}</div>`;
    const form = `<section class="box sug-box"><h2>Como podemos melhorar o app?</h2><p>Sua mensagem vai direto para quem cuida do app. Pode ser uma ideia, algo que não funcionou ou o que você gostou.</p><form id="sug-form" novalidate>${seg}<label for="sug-texto">Sua mensagem</label><textarea id="sug-texto" name="texto" rows="5" maxlength="1500" required placeholder="${tipo === 'problema' ? 'O que aconteceu? Em qual tela?' : tipo === 'elogio' ? 'O que você mais gostou?' : 'Qual a sua ideia?'}">${escape(state.sugDraft || '')}</textarea><p class="form-error" role="alert"></p><div class="form-actions"><button class="action primary" type="submit">Enviar</button></div></form></section>`;
    if (!(account() && NibConta.lideranca())) return form;
    if (!state.sugList) { NibConta.sugestoes().then(l => { state.sugList = l; if (state.view === 'sugestoes') show('sugestoes', false, false); }).catch(() => {}); return form + '<p class="event-empty">Carregando as sugestões</p>'; }
    const label = Object.fromEntries(sugTipos), novas = state.sugList.filter(s => !s.lida).length;
    const list = state.sugList.length ? `<ul class="sug-list">${state.sugList.map(s => `<li class="sug-item${s.lida ? ' is-read' : ''}"><div class="sug-top"><span class="sug-tag is-${escape(s.tipo)}">${escape(label[s.tipo] || 'Sugestão')}</span><small>${escape(s.nome)} · ${escape(avisoData(s.criado_em))}</small></div><p>${escape(s.texto)}</p><button type="button" class="sug-read" data-sug-lida="${s.id}" data-lida="${s.lida ? 0 : 1}">${s.lida ? 'Marcar como nova' : 'Marcar como lida'}</button></li>`).join('')}</ul>` : '<p class="event-empty">Nenhuma sugestão recebida ainda.</p>';
    return form + `<section class="box sug-inbox"><span class="label">RECEBIDAS</span><h2>${state.sugList.length} ${state.sugList.length === 1 ? 'mensagem' : 'mensagens'}${novas ? ` · ${novas} ${novas === 1 ? 'nova' : 'novas'}` : ''}</h2>${list}</section>`;
  }
  // Pedidos novos no caderno desde a última visita (balão no atalho da inicial). Guarda o maior id já visto neste aparelho.
  const cadVistoKey = () => 'nib-caderno-visto-' + (account() ? account().id : '');
  function cadNovos() {
    if (!PUBLIC || !account() || !state.prayersLoaded) return 0;
    const ids = state.prayers.map(p => Number(p.id)); const max = ids.length ? Math.max(...ids) : 0;
    let visto = null; try { visto = localStorage.getItem(cadVistoKey()); } catch (_) { return 0; }
    if (visto === null) { try { localStorage.setItem(cadVistoKey(), String(max)); } catch (_) {} return 0; }
    return state.prayers.filter(p => !p.own && !p.answered && Number(p.id) > Number(visto)).length;
  }
  function cadMarcarVisto() { const ids = state.prayers.map(p => Number(p.id)); try { const v = Number(localStorage.getItem(cadVistoKey()) || 0); localStorage.setItem(cadVistoKey(), String(Math.max(v, ...ids, 0))); } catch (_) {} }
  // Painel do caderno (Secretaria, Liderança Pastoral e admin): só números, sem nomes nem textos dos pedidos.
  function cadPainel() {
    if (!state.cadPainel) { NibConta.caderno('painel').then(d => { state.cadPainel = d.painel; if (state.view === 'caderno') show('caderno', false, false); }).catch(e => { state.cadPainel = { erro: e.message }; if (state.view === 'caderno') show('caderno', false, false); }); return '<p class="event-empty">Carregando o painel</p>'; }
    const d = state.cadPainel; if (d.erro) return `<p class="form-error" role="alert">${escape(d.erro)}</p>`;
    const pct = d.total ? Math.round(d.atendidos / d.total * 100) : 0;
    const tile = (n, l, extra = '') => `<div class="cad-stat${extra}"><strong>${n}</strong><span>${l}</span></div>`;
    const nomeMes = m => new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(new Date(m + '-15T12:00:00Z')).replace('.', '');
    const maxM = Math.max(1, ...d.meses.map(m => m.pedidos));
    const meses = d.meses.length ? `<ul class="cad-bars">${d.meses.map(m => `<li><span class="cad-bar" style="--h:${Math.round(m.pedidos / maxM * 100)}%"><i style="--h:${m.pedidos ? Math.round(m.atendidos / m.pedidos * 100) : 0}%"></i></span><b>${m.pedidos}</b><small>${nomeMes(m.mes)}</small></li>`).join('')}</ul><p class="cad-legend"><span><i class="is-total"></i>Pedidos</span><span><i class="is-ok"></i>Atendidos</span></p>` : '<p class="event-empty">Ainda sem pedidos nos últimos meses.</p>';
    return `<section class="box cad-panel" aria-labelledby="cad-panel-title"><span class="label">EQUIPE DA IGREJA</span><h2 id="cad-panel-title" tabindex="-1">Painel do caderno</h2><p>Visão geral para a Secretaria e a Liderança Pastoral. Mostra só números: os pedidos continuam no caderno e o histórico de atendidas é de cada pessoa.</p><div class="cad-stats">${tile(d.andamento, 'em oração agora')}${tile(d.atendidos, `atendidas · ${pct}%`, ' is-ok')}${tile(d.novos_30, 'novos em 30 dias')}${tile(d.sem_oracao, 'sem ninguém orando ainda', d.sem_oracao ? ' is-alert' : '')}${tile(d.orantes, 'pessoas orando')}${tile(d.apoios, '“Vou orar” marcados')}${tile(d.autores, 'pessoas pediram oração')}${tile(d.removidos, 'tirados pela equipe')}</div><h3 class="cad-sub">Últimos 6 meses</h3>${meses}</section>`;
  }
  function publicNotebook() {
    if (!account()) return `<section class="box prayer-box"><span class="label">CUIDADO EM COMUNIDADE</span><h2>Vamos orar uns pelos outros</h2><p>No caderno de oração, quem tem cadastro no app compartilha pedidos e marca “Vou orar” nos pedidos dos irmãos. Os pedidos ficam visíveis só para quem entrou na conta.</p><div class="form-actions"><button type="button" class="action" data-view="entrar">Entrar ou criar cadastro</button></div></section>`;
    if (!state.prayersLoaded) { loadPrayers().then(() => { if (state.view === 'caderno') show('caderno', false, false); }); return '<p class="event-empty">Carregando o caderno</p>'; }
    cadMarcarVisto();
    const ativos = state.prayers.filter(p => !p.answered), minhas = state.prayers.filter(p => p.answered && p.own);
    const tab = state.cadTab === 'painel' && !state.prayerTeam ? 'pedidos' : (state.cadTab || 'pedidos');
    const tabs = [['pedidos', 'Pedidos', ativos.length], ['atendidas', 'Minhas atendidas', minhas.length], ...(state.prayerTeam ? [['painel', 'Painel', null]] : [])];
    const chips = `<div class="cell-days cad-tabs" role="group" aria-label="Caderno de oração" data-seg="caderno">${tabs.map(([k, l, n]) => `<button type="button" class="history-year${tab === k ? ' is-active' : ''}" data-cad-tab="${k}" aria-pressed="${tab === k}">${l}${n === null ? '' : `<small>${n}</small>`}</button>`).join('')}</div>`;
    if (tab === 'atendidas') return `${chips}<section class="community-prayer" aria-labelledby="prayer-feed-title"><div class="section-heading"><div><span class="label">SÓ VOCÊ VÊ</span><h2 id="prayer-feed-title" tabindex="-1">Minhas orações atendidas</h2></div></div><p>Quando você marca um pedido como atendido, ele sai do caderno da igreja e fica guardado aqui como o seu histórico. Se marcou por engano, toque de novo para voltar ao caderno.</p><div class="prayer-feed">${prayerCards(false, minhas) || '<p class="event-empty">Nenhuma oração atendida ainda. Quando Deus responder um pedido seu, marque como atendida e ele aparece aqui.</p>'}</div></section>`;
    if (tab === 'painel') return `${chips}${cadPainel()}`;
    return `${chips}<section class="box prayer-box"><h2>Compartilhe um pedido com a comunidade</h2><p>Seu pedido aparece para quem tem conta no app. Cada pessoa pode marcar “Vou orar”, e só você marca quando a oração for atendida.</p><form id="notebook-form" autocomplete="off"><label for="notebook-name">Título do pedido</label><input id="notebook-name" name="name" maxlength="120" required placeholder="Ex.: Pela saúde da minha mãe" autocomplete="off"><label for="notebook-reason">O que você deseja compartilhar?</label><textarea id="notebook-reason" name="reason" maxlength="1000" required autocomplete="off" placeholder="Escreva seu pedido de oração."></textarea><p class="note">Evite expor dados pessoais de outras pessoas. A equipe da igreja pode tirar do caderno pedidos inadequados.</p><div class="form-actions"><button type="submit" class="action">Publicar pedido</button><button type="reset">Limpar</button></div></form></section>${state.prayerError ? `<p class="form-error" role="alert">${escape(state.prayerError)}</p>` : ''}<section class="community-prayer" aria-labelledby="prayer-feed-title"><div class="section-heading"><h2 id="prayer-feed-title" tabindex="-1">Orando em comunidade</h2><span class="note">${ativos.length} ${ativos.length === 1 ? 'pedido' : 'pedidos'}</span></div><div class="prayer-feed">${prayerCards(false, ativos) || '<p>Ainda não há pedidos. Seja o primeiro a compartilhar.</p>'}</div></section>`;
  }
  function notebookPage() {
    if (PUBLIC) return publicNotebook();
    return `<section class="box prayer-box"><h2>Compartilhe um pedido com a comunidade</h2><p>No mural, cada pessoa poderá conhecer os pedidos e sinalizar “Estou orando”. A indicação de oração atendida é feita por quem publicou.</p><p class="note">Preview com dados fictícios: nenhuma publicação é enviada à igreja ou compartilhada entre usuários. Os testes ficam só nesta aba e reiniciam ao recarregar ou trocar o perfil.</p><form id="notebook-form" autocomplete="off"><label for="notebook-name">Título do pedido</label><input id="notebook-name" name="name" maxlength="120" required placeholder="Ex.: Pela Família Exemplo" autocomplete="off"><label for="notebook-reason">O que você deseja compartilhar?</label><textarea id="notebook-reason" name="reason" maxlength="1000" required autocomplete="off" placeholder="Escreva um pedido fictício para o mural."></textarea><p class="note">Na versão compartilhada, o pedido será visível à comunidade. Evite expor dados pessoais de outras pessoas.</p><div class="form-actions"><button type="submit" class="action">Publicar pedido de teste</button><button type="reset">Limpar</button></div></form></section><section class="community-prayer" aria-labelledby="prayer-feed-title"><div class="section-heading"><h2 id="prayer-feed-title" tabindex="-1">Orando em comunidade</h2><span class="note">${state.prayers.length} pedidos de exemplo</span></div><div class="prayer-feed">${prayerCards()||'<p>Nenhum pedido neste mural de teste.</p>'}</div></section>`;
  }
  function announce(message, tone = 'info', reveal = true) { feedback.dataset.tone=tone; feedback.textContent = message; if(reveal) feedback.scrollIntoView({block:"nearest",behavior:"instant"}); }
