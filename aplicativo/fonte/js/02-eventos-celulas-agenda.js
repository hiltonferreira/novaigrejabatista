  // Eventos do painel de eventos do site (NibSite). Antes de carregar, usa a lista conhecida.
  // Banners que o app já traz em WebP leve (e guarda no celular): evita baixar o PNG grande do site (2,5 MB no NXT CAMP).
  const localBanners = { 'NXT CAMP': 'assets/nxt.webp', 'Mulheres Virtuosas': 'assets/mulheres.webp' };
  const localBanner = e => localBanners[e.name] || '';
  const siteUrl = u => !u ? 'https://novaigrejabatista.com.br/' : /^https:\/\//.test(u) ? u : 'https://novaigrejabatista.com.br' + u;
  function eventDate(e) {
    const fmt = (v, o) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Porto_Velho', ...o }).format(new Date(v.slice(0, 10) + 'T12:00:00-04:00'));
    const hr = v => !e.tbd && v && v.length > 10 && v.slice(11, 16) !== '00:00' ? ', ' + v.slice(11, 16).replace(':', 'h').replace('h00', 'h') : '';
    let t = fmt(e.start, { day: '2-digit', month: 'long' });
    if (e.end && e.end.slice(0, 10) !== e.start.slice(0, 10)) { const a = hr(e.start), b = hr(e.end); t += a || b ? a + ' a ' + fmt(e.end, { day: '2-digit', month: 'long' }) + b : ' a ' + fmt(e.end, { day: '2-digit', month: 'long' }); }
    else t += hr(e.start);
    return t;
  }
  const knownEvents = () => events.filter(e => e.active).map(e => ({ name: e.name, category: 'Acampamento', summary: 'Dois dias de palavra, worship, gincanas e comunhão para adolescentes de 12 a 17 anos.', start: '2026-11-21T14:00', end: '2026-11-22T14:00', tbd: false, location: '', price: 'R$ 80,00', cta: 'Ver inscrição', open: true, url: '/next/camp-sbgp1-nov26/inscricao.html', image: e.image }));
  function eventCards(compact = false) {
    if (!PUBLIC) return demoEventCards(compact);
    const loaded = window.NibSite && NibSite.eventos();
    const list = (loaded || knownEvents()).slice(0, compact ? 1 : 20);
    if (!list.length) return `<section class="box event-empty"><h2>Nenhum evento com data marcada agora</h2><p>Quando a igreja publicar um novo evento no site, ele aparece aqui.</p><a class="button button-go" href="https://novaigrejabatista.com.br/#eventos" target="_blank" rel="noopener">Ver no site ${arrow}</a></section>`;
    const tag = compact ? 'h3' : 'h2';
    return `<div class="cards ${compact ? 'home-events' : ''}">${list.map((e, i) => { const img = e.image || localBanner(e) || (e.banner ? siteUrl(e.banner) : ''); return `<article class="event">${img ? `<div class="event-cover"><img src="${escape(img)}" alt="" width="800" height="400" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></div>` : ''}<div class="event-content"><div class="event-top">${e.category ? `<span class="tag status-active">${escape(e.category)}</span>` : ''}<time class="event-date">${escape(eventDate(e))}</time></div><${tag}>${escape(e.name)}</${tag}>${e.summary ? `<p>${escape(e.summary)}</p>` : ''}${e.price || e.location ? `<p class="event-meta">${[e.location, e.price].filter(Boolean).map(escape).join(' · ')}</p>` : ''}${e.url ? `<a class="button primary" href="${escape(siteUrl(e.url))}" target="_blank" rel="noopener">${escape(e.open ? e.cta : 'Ver informações')}</a>` : ''}</div></article>`; }).join('')}</div>`;
  }
  const isManagement = () => ['secretaria', 'pastoral', 'tesouraria'].includes(state.context);
  const NibAdminIcons = NibIcons.paths;
  const barIcon = (key, selected = false) => (key = iconAlias[key] || key, selected) && NibIcons.mixed && NibIcons.mixed[key]
    ? ((x) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${x.stroke ? `<path d="${x.stroke}"/>` : ''}${x.fill ? `<path fill="currentColor" stroke-width="1.6" d="${x.fill}"/>` : ''}${x.cut ? `<path class="bar-cut" stroke-width="1.7" d="${x.cut}"/>` : ''}</svg>`)(NibIcons.mixed[key])
    : selected && NibIcons.filled[key]
    ? `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="${NibIcons.filled[key]}"/></svg>`
    : NibIcons.svg(key, selected ? 2.3 : 1.8);
  // App oficial: quem é da equipe (ou o admin vendo como Secretaria/Liderança) usa a barra inferior da gestão, como na demonstração.
  function publicTeamBar() {
    if (!PUBLIC || !account() || !NibConta.equipe()) return null;
    return NibConta.pessoa().papel === 'secretaria'
      ? [['inicio', 'Início'], ['equipe', 'Painel'], ['membros', 'Membros'], ['checkin', 'Check-in'], ['avisos', 'Avisos']]
      : [['inicio', 'Início'], ['equipe', 'Painel'], ['membresia', 'Membresia'], ['membros', 'Membros'], ['caderno', 'Caderno']];
  }
  function renderBar() {
    const bar = document.getElementById('bottom-nav');
    const team = publicTeamBar(), gestao = isManagement() || !!team;
    const barKey = isManagement() ? state.context : team ? 'pub-equipe-' + NibConta.pessoa().papel : 'membro';
    if (bar.dataset.context !== barKey) { bar.innerHTML = ''; bar.dataset.context = barKey; }
    bar.classList.toggle('is-admin', gestao);
    bar.hidden = false; bar.setAttribute('aria-label', gestao ? 'Acessos da gestão' : 'Acessos do membro');
    if (!bar.children.length) bar.innerHTML = (isManagement() ? admin.bar() : team ? team : [['inicio','Início'],['agenda','Calendário'],['generosidade','Contribuir'],['eventos','Eventos'],['celulas','Células']]).map(([view,label]) => `<a href="#${view}" data-view="${view}" class="${view === 'generosidade' ? 'bar-main' : ''}"><span class="bar-icon">${barIcon(view)}</span><span>${label}</span></a>`).join('');
    bar.querySelectorAll('a').forEach(a => {
      const active = a.dataset.view === state.view || (a.dataset.view === 'membresia' && state.view === 'confirmar');
      if (active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
      a.querySelector('.bar-icon').innerHTML = barIcon(a.dataset.view, active);
    });
  }
  // Check-in do culto: o membro registra a presença pelo app (na versão real, abre 1 h antes e fecha 2 h depois do culto).
  function nextService() { const key = NibDaily.dayKey(new Date()); return NibDaily.agenda(key, 8).find(x => x.type === 'Culto'); }
  function checkinCard() {
    const c = nextService(); if (!c) return '';
    if (c.day !== NibDaily.dayKey(new Date()) && !state.simulateService) return '';
    const key = NibDaily.dayKey(new Date()), done = admin.checkins().some(x => x.day === c.day && x.name === c.name && x.who === state.member.full);
    const when = c.day === key ? `Hoje${c.time ? ', às ' + escape(c.time) : ''}` : `${escape(new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',weekday:'long',day:'2-digit',month:'short'}).format(new Date(c.day+'T12:00:00-04:00')).replace('.',''))}${c.time ? ', às ' + escape(c.time) : ''}`;
    const icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${done ? 'm5 12.5 4.5 4.5L19 7.5' : NibAdminIcons.recepcao}"/></svg>`;
    return `<section class="checkin-card${done ? ' is-done' : ''}" aria-labelledby="checkin-title"><span class="checkin-icon">${icon}</span><div class="checkin-text"><span class="label">CHECK-IN DO CULTO</span><h2 id="checkin-title" tabindex="-1">${done ? 'Presença registrada' : escape(c.name)}</h2><p>${done ? `Você está no ${escape(c.name)}. Que bom ter você aqui!` : `${when}. Chegou? Registre sua presença.`}</p>${done ? '' : '<p class="checkin-note">Abre 1 h antes do culto e fecha 2 h depois.</p>'}</div>${done ? '' : `<button type="button" class="action primary" data-checkin="${escape(c.day)}">Fazer check-in</button>`}</section>`;
  }
  function dailyBlocks(full = false, part = 'all') {
    const key = NibDaily.dayKey(new Date());
    const verse = NibDaily.verseForDay(key);
    const clock = new Intl.DateTimeFormat('en-GB',{timeZone:'America/Porto_Velho',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
    const items = withCell(NibDaily.agenda(key), key, 14).filter(item => item.day > key || !item.time || item.time >= clock);
    const list = (full ? items : items.slice(0,3)).map(item => {
      const date = new Date(item.day+'T12:00:00-04:00');
      const day = new Intl.DateTimeFormat('pt-BR',{day:'2-digit',timeZone:'America/Porto_Velho'}).format(date);
      const month = new Intl.DateTimeFormat('pt-BR',{month:'short',timeZone:'America/Porto_Velho'}).format(date).replace('.','');
      const week = new Intl.DateTimeFormat('pt-BR',{weekday:'short',timeZone:'America/Porto_Velho'}).format(date).replace('.','');
      return `<li><span class="agenda-date"><small>${month}</small><strong>${day}</strong><em>${week}</em></span><div><span class="agenda-type">${calendarDot(calendarKind(item))}${escape(item.type)}</span><h3>${escape(item.name)}</h3><p>${new Intl.DateTimeFormat('pt-BR',{weekday:'long',timeZone:'America/Porto_Velho'}).format(date)}${item.time ? ' · '+item.time : ' · horário a confirmar'}</p></div></li>`;
    }).join('');
    const agenda = `<section class="home-agenda" aria-labelledby="agenda-title"><div class="section-heading"><div><span class="label">CAMINHE COM A GENTE</span><h2 id="agenda-title">${full ? 'Próximos encontros' : 'Na agenda da igreja'}</h2></div></div><div class="box agenda-content"><ul class="agenda-list">${list}</ul>${full ? '' : '<div class="agenda-more">'+button('Ver calendário completo','agenda')+'</div>'}<p class="note">Programação de referência do site da igreja, ainda sem sincronização. Confirme mudanças com a igreja.${full ? ' Novas festividades aparecerão após o cadastro pela equipe.' : ''}</p></div></section>`;
    const verseBlock = `<section class="daily-verse" aria-labelledby="verse-label"><div class="verse-top"><span class="verse-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C10.2 5 7.6 4.5 4 4.5v13c3.6 0 6.2.5 8 2 1.8-1.5 4.4-2 8-2v-13c-3.6 0-6.2.5-8 2Z"/><path d="M12 6.5v13"/></svg></span><span class="label" id="verse-label">Palavra para o seu dia</span></div><blockquote><span class="verse-mark" aria-hidden="true">“</span>${verse[0]}</blockquote><div class="verse-foot"><div class="verse-ref"><cite>${verse[1]}</cite>${verse[2]?'<small class="verse-pick">Escolhido pela igreja</small>':''}</div><button type="button" class="verse-share" id="verse-share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3 M7.5 7.5 12 3l4.5 4.5 M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg><span>Compartilhar</span></button></div></section>`;
    return full || part === 'agenda' ? agenda : part === 'verse' ? verseBlock : verseBlock + agenda;
  }
  const fullDate = key => new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(new Date(key+'T12:00:00-04:00'));
  const admin = NibAdmin.create({ qrSvg: t => qrSvg(t), state, escape, button, arrow, backArrow, NibDaily, fullDate, show: (...a) => show(...a), announce: (...a) => announce(...a), refreshNotices: () => refreshNotices(), notify: n => notify(n), giftConfirmed: e => giftConfirmed(e) });
  const adminOnly = ['recepcao','gestao','membresia','confirmar','solicitacoes','programacao','comunicados','palavra','cuidado'];
  const calendarKinds = {celula:'Minha célula',culto:'Cultos',escola:'Escola bíblica',evento:'Eventos'};
  // Célula do membro (exemplo): na versão final vem do vínculo do membro com a célula na plataforma de células.
  const myCell = { name: 'Célula Exemplo', weekday: 3, time: '19:30', place: 'Casa da família Exemplo · Bairro Exemplo', leader: 'Paulo e Lúcia Exemplo' };
  // Célula escolhida no cadastro ("Dia|Nome", da lista de células do site). Na demonstração, a célula de exemplo.
  const weekdays = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
  const cellKey = (dia, nome) => dia + '|' + nome;
  function findCell(key) {
    if (!key || !window.NibSite) return null;
    const [dia, nome] = String(key).split('|');
    const d = NibSite.celulas().find(x => x.dia === dia); const c = d && d.celulas.find(x => x.nome === nome);
    return c ? { ...c, dia } : null;
  }
  function memberCell() {
    if (!PUBLIC) return state.demoCell === null ? null : state.demoCell || myCell;
    const c = account() && findCell(account().celula); if (!c) return null;
    const wd = weekdays.findIndex(w => c.dia.toLowerCase().startsWith(w)); const t = (c.horario.match(/(\d{1,2})[:h](\d{2})/) || []);
    return wd < 0 ? null : { name: c.nome, weekday: wd, time: t[1] ? t[1].padStart(2, '0') + ':' + t[2] : '', place: c.local, leader: c.lider, site: c };
  }
  function cellOptions(selected) {
    if (!window.NibSite) return '';
    return NibSite.celulas().map(d => `<optgroup label="${escape(d.dia)}">${d.celulas.map(c => { const k = cellKey(d.dia, c.nome); return `<option value="${escape(k)}"${k === selected ? ' selected' : ''}>${escape(c.nome)}</option>`; }).join('')}</optgroup>`).join('');
  }
  function withCell(items, fromKey, days) {
    const myCell = memberCell(); if (!myCell) return items;
    const base = new Date(fromKey+'T12:00:00-04:00'); const extra = [];
    for (let i = 0; i < days; i++) { const d = new Date(base); d.setUTCDate(base.getUTCDate()+i); if (d.getUTCDay() === myCell.weekday) extra.push({ day: NibDaily.dayKey(d), time: myCell.time, name: myCell.name, type: 'Minha célula', place: myCell.place }); }
    return items.concat(extra).sort((a,b)=>(a.day+' '+(a.time||'99')).localeCompare(b.day+' '+(b.time||'99')));
  }
  const monthItems = month => withCell(NibDaily.monthAgenda(month), month+'-01', NibDaily.monthInfo(month).count);
  const calendarKind = item => item.type==='Minha célula'?'celula':item.type==='Culto'?'culto':item.type==='Programação semanal'?'escola':'evento';
  const calendarDot = kind => `<i class="calendar-dot" data-kind="${kind}" aria-hidden="true"></i>`;
  function calendarAnnouncement() { const items=monthItems(state.calendarMonth).filter(x=>x.day===state.calendarDay); return fullDate(state.calendarDay)+': '+(items.length?items.length+' encontro(s). '+items.map(x=>x.name+', '+(x.time||'horário a confirmar')).join('. '):'Nenhum encontro de referência.'); }
  const deskQuery = typeof matchMedia === 'function' ? matchMedia('(min-width: 1100px)') : null;
  const isDesk = () => !!(deskQuery && deskQuery.matches);
  function calendarPage() {
    const month = state.calendarMonth;
    const {count,offset} = NibDaily.monthInfo(month);
    const items = monthItems(month);
    const today = NibDaily.dayKey(new Date());
    const title = new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric',timeZone:'America/Porto_Velho'}).format(new Date(month+'-01T12:00:00-04:00'));
    const cells = Array.from({length:offset},()=>'<span aria-hidden="true"></span>').join('') + Array.from({length:count},(_,i)=>{
      const day = month+'-'+String(i+1).padStart(2,'0');
      const entries = items.filter(x=>x.day===day);
      return `<button type="button" class="calendar-day" data-day="${day}" aria-pressed="${day===state.calendarDay}" ${day===today?'aria-current="date"':''} aria-label="${fullDate(day)} · ${entries.length ? entries.length+' encontro(s)' : 'Sem encontros'}"><span>${i+1}</span>${entries.length?'<span class="calendar-dots" aria-hidden="true">'+[...new Set(entries.map(calendarKind))].map(calendarDot).join('')+'</span>':''}</button>`;
    }).join('');
    const selected = items.filter(x=>x.day===state.calendarDay);
    const sel = new Date(state.calendarDay+'T12:00:00-04:00');
    const fmt = o => new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',...o}).format(sel);
    const weekday = fmt({weekday:'long'}), cap = weekday.charAt(0).toUpperCase()+weekday.slice(1);
    const countLabel = selected.length ? selected.length+(selected.length>1?' encontros':' encontro') : 'Sem encontros';
    const entries = selected.length ? '<ul class="day-entries">'+selected.map(x=>{ const kind = calendarKind(x); return `<li data-kind="${kind}"><time${x.time?'':' class="is-tbd"'}>${x.time ? x.time : 'Horário<br>a definir'}</time><div><strong>${escape(x.name)}</strong><p class="calendar-entry-kind">${calendarDot(kind)}${escape(x.type)}</p>${x.place?'<p class="calendar-entry-place">'+escape(x.place)+'</p>':''}</div></li>`; }).join('')+'</ul>' : '<p class="day-empty">Nenhum encontro de referência para esta data.</p>';
    const clock = new Intl.DateTimeFormat('en-GB',{timeZone:'America/Porto_Velho',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
    const upcoming = withCell(NibDaily.agenda(today, 14), today, 14).find(x => x.day > today || (x.day === today && (!x.time || x.time >= clock)));
    const short = key => new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',weekday:'short',day:'2-digit'}).format(new Date(key+'T12:00:00-04:00')).replace('.','');
    const todayLong = new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',weekday:'long',day:'numeric',month:'long'}).format(new Date(today+'T12:00:00-04:00'));
    const nextLine = upcoming ? `${calendarDot(calendarKind(upcoming))}<span>Próximo: <b>${escape(upcoming.name)}</b> · ${upcoming.day===today?'hoje':short(upcoming.day)}${upcoming.time?', '+upcoming.time:''}</span>` : '<span>Sem encontros nos próximos dias</span>';
    return `<div class="calendar-actions"><div class="calendar-now"><span class="label">HOJE</span><strong>${todayLong.charAt(0).toUpperCase()+todayLong.slice(1)}</strong><small>${nextLine}</small></div><button type="button" id="calendar-today" class="calendar-today"${state.calendarDay===today?' aria-pressed="true"':''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3v3 M17 3v3 M4 8h16 M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none"/></svg><span>Hoje</span></button></div><section class="box calendar-box" aria-label="Calendário mensal"><div class="calendar-toolbar"><button type="button" data-month="-1" aria-label="Mês anterior">‹</button><div><h2>${title.charAt(0).toUpperCase()+title.slice(1)}</h2></div><button type="button" data-month="1" aria-label="Próximo mês">›</button></div><div class="calendar-week" aria-hidden="true">${['D','S','T','Q','Q','S','S'].map(x=>'<span>'+x+'</span>').join('')}</div><div class="calendar-grid">${cells}</div><div class="calendar-legend">${Object.entries(calendarKinds).filter(([k])=>k!=='celula'||memberCell()).map(([key,name])=>'<span>'+calendarDot(key)+name+'</span>').join('')}</div></section><section class="box calendar-selection"><div class="selection-head"><span class="selection-date" aria-hidden="true"><small>${fmt({month:'short'}).replace('.','')}</small><strong>${fmt({day:'2-digit'})}</strong></span><div><span class="label">${state.calendarDay===today?'HOJE':'DIA SELECIONADO'}</span><h2>${cap}</h2><p>${fmt({day:'numeric',month:'long',year:'numeric'})}</p></div><span class="selection-count">${countLabel}</span></div>${entries}</section><p class="note">Cultos e encontros semanais da igreja, eventos publicados no site e eventos cadastrados no app. Confirme mudanças com a igreja.</p>${agendaAdmin()}`;
  }
  // v199: a administração cadastra eventos direto no app (pedido de Hilton, 26/11/2026). Só aparecem no app: Agenda, Eventos, início e lembrete do dia.
  const agendaEhAdmin = () => PUBLIC && window.NibConta && account() && NibConta.admin && NibConta.admin();
  function agendaAdmin() {
    if (!agendaEhAdmin()) return '';
    const hoje = NibDaily.dayKey(new Date()), dia = state.calendarDay >= hoje ? state.calendarDay : hoje;
    const cats = ['Evento', 'Culto especial', 'Conferência', 'Encontro', 'Retiro', 'Ação social', 'Batismo', 'Santa Ceia'];
    const meus = ((window.NibSite && NibSite.eventos()) || []).filter(e => e.app && e.id);
    const quando = e => eventDate(e);
    const lista = meus.length ? `<div class="agenda-app-list"><h3>Cadastrados no app</h3><ul>${meus.map(e => `<li><div><strong>${escape(e.name)}</strong><small>${escape([quando(e), e.location].filter(Boolean).join(' · '))}</small></div><button type="button" class="aviso-remove" data-evento-app-remover="${e.id}">Remover</button></li>`).join('')}</ul></div>` : '';
    return `<section class="box agenda-admin" aria-labelledby="agenda-admin-title"><span class="label">SÓ PARA ADMINISTRAÇÃO</span><h2 id="agenda-admin-title">Cadastrar evento</h2><p>Além dos eventos do site, você pode cadastrar um evento aqui. Ele aparece só no app: na Agenda, em Eventos, no início e no lembrete do dia.</p>
      <form id="evento-app-form" class="agenda-admin-form" autocomplete="off">
        <label class="agenda-admin-full">Nome do evento<input name="nome" maxlength="100" required placeholder="Ex.: Culto de Ação de Graças"></label>
        <label>Tipo<select name="categoria">${cats.map(c => `<option>${c}</option>`).join('')}</select></label>
        <label>Local<input name="local" maxlength="160" placeholder="Ex.: Templo da Nib"></label>
        <label>Data<input name="dia" type="date" required min="${hoje}" value="${dia}"></label>
        <label data-ev-hora>Horário<input name="hora" type="time" value="19:30"></label>
        <label>Termina em (opcional)<input name="dia_fim" type="date" min="${hoje}"></label>
        <label data-ev-hora>Horário de término (opcional)<input name="hora_fim" type="time"></label>
        <label class="check agenda-admin-full"><input type="checkbox" name="sem_horario" data-ev-sem-horario><span>Horário ainda a definir</span></label>
        <label class="agenda-admin-full">Descrição (opcional)<textarea name="resumo" rows="3" maxlength="400" placeholder="O que vai acontecer, para quem é."></textarea></label>
        <label class="agenda-admin-full">Link de inscrição ou mais informações (opcional)<input name="link" type="url" maxlength="300" placeholder="https://"></label>
        <div class="form-actions agenda-admin-full"><button type="submit" class="action">Cadastrar evento</button></div>
      </form>${lista}</section>`;
  }
  // Eventos do site e do app entram no calendário (vários dias aparecem em cada dia do período).
  function syncAgendaEventos() {
    const ev = (window.NibSite && NibSite.eventos()) || [];
    NibDaily.setExternos(ev.filter(e => e.start).map(e => { const d0 = e.start.slice(0, 10), d1 = e.end ? e.end.slice(0, 10) : ''; const h = !e.tbd && e.start.length >= 16 && e.start.slice(11, 16) !== '00:00' ? e.start.slice(11, 16) : ''; return { name: e.name, day: d0, end: d1 > d0 ? d1 : '', time: h, type: e.category || 'Evento', place: e.location || '', view: 'eventos' }; }));
  }
  const prayHeart = '<svg class="pray-heart" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.5s-8-4.7-8-10.2A4.6 4.6 0 0 1 12 7.4a4.6 4.6 0 0 1 8 2.9c0 5.5-8 10.2-8 10.2z"/></svg>';
  function verseAdmin() {
    const today = NibDaily.dayKey(new Date()), current = NibDaily.verseForDay(today);
    return `<section class="box verse-admin" aria-labelledby="verse-admin-title"><span class="label">PALAVRA DO DIA</span><h2 id="verse-admin-title" tabindex="-1">Versículo escolhido pela igreja</h2><p>Defina o versículo de uma data, alinhado à série de mensagens. Quando não houver escolha, o app usa a lista anual automática, com um versículo diferente por dia.</p><p class="verse-admin-now"><b>Hoje:</b> ${escape(current[1])}${current[2] ? ' · escolhido pela igreja' : ' · lista automática'}</p><form id="verse-form"><label for="verse-date">Data</label><input id="verse-date" name="data" type="date" value="${today}" required><label for="verse-text">Texto do versículo</label><textarea id="verse-text" name="texto" maxlength="280" rows="3" required placeholder="Digite o texto conforme a versão bíblica da igreja"></textarea><label for="verse-ref">Referência</label><input id="verse-ref" name="referencia" maxlength="40" required placeholder="Ex.: Salmos 23:1"><div class="form-actions"><button type="submit" class="primary">Salvar para esta data</button>${current[2] ? '<button type="button" id="verse-clear">Voltar à lista automática</button>' : ''}</div></form><p class="note">Nesta versão de teste, a escolha vale só nesta sessão.</p></section>`;
  }
  const money = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const qrSvg = text => { if (typeof qrcode !== 'function') return ''; const qr = qrcode(0, 'M'); qr.addData(text); qr.make(); const n = qr.getModuleCount(), q = 4; let d = ''; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c+q} ${r+q}h1v1h-1z`; return `<svg viewBox="0 0 ${n+q*2} ${n+q*2}" shape-rendering="crispEdges" aria-hidden="true"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#041e42"/></svg>`; };
  function renderPixQr() {
    const box = content.querySelector('#pix-qr'); if (!box || !state.giftCode || typeof qrcode !== 'function') return;
    const qr = qrcode(0, 'M'); qr.addData(state.giftCode); qr.make();
    const n = qr.getModuleCount(), q = 4; let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c+q} ${r+q}h1v1h-1z`;
    box.innerHTML = `<svg viewBox="0 0 ${n+q*2} ${n+q*2}" shape-rendering="crispEdges" aria-hidden="true"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#041e42"/></svg>`;
  }
