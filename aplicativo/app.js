'use strict';
(() => {
  const root = document.getElementById('nib-proposta');
  const content = document.getElementById('content');
  const feedback = document.getElementById('feedback');
  // Estado fictício em memória: nunca importar participantes ou dados reais aqui.
  const viewHistory = [];
  let notebookSequence = 0;
  const demoPrayers = () => [
    {id:'exemplo-1',author:'João Exemplo',name:'Pela nossa caminhada em família',reason:'Pedido fictício para demonstrar como a comunidade pode se unir em oração.',answered:false,supporters:0,supported:false,own:false},
    {id:'exemplo-2',author:'Jéssica Exemplo',name:'Gratidão por uma nova etapa',reason:'Exemplo de oração marcada como atendida por quem publicou.',answered:true,supporters:0,supported:false,own:true}
  ];
  // Histórico fictício: dízimo mensal, algumas ofertas e a campanha da obra.
  function demoHistory() {
    const h = [], today = NibDaily.dayKey(new Date());
    for (let y = 2025; y <= 2026; y++) for (let m = 1; m <= 12; m++) {
      const k = `${y}-${String(m).padStart(2, '0')}`;
      if (k < '2025-03' || k + '-28' > today) continue;
      h.push({ day: k + '-05', type: 'Dízimo', amount: 300, status: 'ok' });
      if (m % 3 === 0) h.push({ day: k + '-19', type: 'Oferta', amount: 50, status: 'ok' });
      if ((y === 2026 && [4, 8].includes(m)) || (y === 2025 && m === 11)) h.push({ day: k + '-12', type: 'Campanha', amount: 100, status: 'ok' });
    }
    return h;
  }
  const state = { member: { first: 'Jéssica', full: 'Jéssica Exemplo', email: 'jessica@example.com' }, context: 'membro', view: 'inicio', request: null, presented: null, gift: 'Dízimo', calendarMonth: NibDaily.dayKey(new Date()).slice(0,7), calendarDay: NibDaily.dayKey(new Date()), prayers: demoPrayers(), history: demoHistory(), historyYear: NibDaily.dayKey(new Date()).slice(0,4) };
  const navigation = [['inicio', 'Início'], ['cadastro', 'Meu cadastro'], ['eventos', 'Eventos'], ['celulas', 'Células'], ['generosidade', 'Generosidade'], ['historico', 'Minhas contribuições'], ['informacoes', 'Informações'], ['agenda', 'Agenda'], ['caderno', 'Caderno de oração']];
  const labels = { caderno: ['VIDA DE ORAÇÃO', 'Caderno de oração', 'Uma comunidade que cuida e ora em conjunto.'], agenda: ['VIDA NA IGREJA', 'Agenda da igreja', 'Cultos, encontros e próximos eventos em um só lugar.'], inicio: ['BOAS-VINDAS', 'Olá, Jéssica! Você está na plataforma Nib.', 'Acesse seu cadastro, encontre eventos, contribua e acompanhe a vida da igreja.'], cadastro: ['MINHAS INFORMAÇÕES', 'Meu cadastro', 'Consulte seus dados e encaminhe uma atualização à equipe.'], eventos: ['VIDA EM COMUNIDADE', 'Eventos e inscrições', 'Encontre os próximos encontros da igreja.'], celulas: ['CAMINHAR JUNTOS', 'Células', 'Acesse a plataforma de células adotada pela igreja.'], generosidade: ['CONTRIBUIR', 'Generosidade', 'Dízimos, ofertas e campanhas em um só lugar.'], historico: ['MEU HISTÓRICO', 'Minhas contribuições', 'Tudo o que você contribuiu, ano a ano. Só você vê.'], informacoes: ['FIQUE POR PERTO', 'Informações da igreja', 'Programação, endereço e canais da comunidade.'], gestao: ['ADMINISTRAÇÃO', 'Integração e membresia', 'Acompanhe o formulário, a reunião e a apresentação no culto.'], confirmar: ['MEMBRESIA', 'Registrar apresentação', 'O registro documenta a apresentação já realizada no culto.'] };
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const arrow = '<svg class="button-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14 M13 6l6 6-6 6"/></svg>';
  const backArrow = '<svg class="back-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5 M11 6l-6 6 6 6"/></svg>';
  const button = (text, view, primary = false) => { const back = !primary && /^Voltar/.test(text); return `<button type="button" class="button ${primary ? 'action primary' : back ? 'button-go button-back' : 'button-go'}" data-view="${view}">${back ? backArrow : ''}<span>${text}</span>${primary || back ? '' : arrow}</button>`; };
  // Ícones reaproveitados da função icon() do painel; sem ícones nas ações.
  const iconPaths = { heart: 'M12 20s-8-4.7-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.3-8 10-8 10z', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6', grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z', calendar: 'M4 5h16v16H4z M8 3v4 M16 3v4 M4 11h16', receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6', archive: 'M3 4h18v5H3z M5 9v12h14V9 M10 13h4', history: 'M3 12a9 9 0 1 0 2.6-6.4 M3 4v4h4 M12 7v5l3 2' };
  const navIcon = key => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${(isManagement() && NibAdminIcons[key]) || iconPaths[({ inicio: 'grid', cadastro: 'user', eventos: 'calendar', celulas: 'grid', generosidade: 'heart', historico: 'history', informacoes: 'archive', gestao: 'grid', agenda: 'calendar', oracao: 'heart', caderno: 'receipt' })[key]]}"/></svg>`;
  const events = [
    { name: 'Mulheres Virtuosas', image: 'assets/mulheres.webp', date: '30/10/2026', active: false },
    { name: 'NXT CAMP', image: 'assets/nxt.png', date: '21/11/2026', active: true },
    { name: 'Jornada DNA', image: 'assets/jornada.webp', date: '25/10/2026', active: false }
  ];
  const eventCards = (compact = false) => `<div class="cards ${compact ? 'home-events' : ''}">${[...events].filter(e => !compact || e.active).sort((a,b) => Number(b.active) - Number(a.active)).map(e => `<article class="event ${e.name === 'Mulheres Virtuosas' ? 'event-mulheres-virtuosas' : ''} ${e.active ? '' : 'event-ended'}"><div class="event-cover"><img src="${e.image}" alt="${e.name}" width="800" height="400"></div><div class="event-content"><div class="event-top"><span class="tag ${e.active ? 'status-active' : 'status-ended'}">${e.active ? 'Ativo' : 'Encerrado'}</span><time class="event-date">${e.date}</time></div><${compact ? 'h3' : 'h2'}>${e.name}</${compact ? 'h3' : 'h2'}><p>${e.active ? 'Conheça o encontro e as informações do evento.' : 'Evento realizado. Consulte as informações.'}</p><button type="button" class="button primary" aria-label="Ver informações: ${e.name}" data-message="${e.name}: catálogo demonstrativo. A integração com as inscrições ainda será conectada; nenhum cadastro ou pagamento é realizado aqui.">Ver informações</button></div></article>`).join('')}</div>`;
  const isManagement = () => ['secretaria', 'pastoral'].includes(state.context);
  const NibAdminIcons = { gestao: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z', membresia: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21c0-3.5 3-6 7-6s7 2.5 7 6 M16 11l2 2 4-4', solicitacoes: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h5', programacao: 'M4 5h16v16H4z M8 3v4 M16 3v4 M4 11h16 M12 14v4 M10 16h4', comunicados: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4', palavra: 'M12 6.5C10.2 5 7.6 4.5 4 4.5v13c3.6 0 6.2.5 8 2 1.8-1.5 4.4-2 8-2v-13c-3.6 0-6.2.5-8 2Z M12 6.5v13', cuidado: 'M12 20s-8-4.7-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.3-8 10-8 10z', informacoes: 'M3 4h18v5H3z M5 9v12h14V9 M10 13h4' };
  const barPaths = {
    inicio: 'M3 11l9-8 9 8 M5 10v10h5v-6h4v6h5V10',
    agenda: iconPaths.calendar,
    eventos: 'M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4z M15 6v2 M15 11v2 M15 16v2',
    generosidade: 'M12 20s-8-4.7-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.3-8 10-8 10z',
    celulas: iconPaths.grid,
    cadastro: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6',
    mais: 'M4 7h16 M4 12h16 M4 17h16'
  };
  const barFilledPaths = {
    inicio: 'M12 3 2 11h3v10h5v-7h4v7h5V11h3Z',
    agenda: 'M7 2h2v3h6V2h2v3h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2Zm-2 9v9h14v-9Zm2 2h3v3H7Zm5 0h3v3h-3Z',
    eventos: 'M2 5h20v5a2 2 0 0 0 0 4v5H2v-5a2 2 0 0 0 0-4Zm12 2v2h2V7Zm0 4v2h2v-2Zm0 4v2h2v-2Z',
    generosidade: barPaths.generosidade,
    cadastro: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-9 9a9 7 0 0 1 18 0v1H3Z',
    celulas: 'M3 3h8v8H3Zm10 0h8v8h-8ZM3 13h8v8H3Zm10 0h8v8h-8Z'
  };
  const barIcon = (key, selected = false) => !barPaths[key]
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${selected ? 2.3 : 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${NibAdminIcons[key]}"/></svg>`
    : selected
    ? `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="${barFilledPaths[key]}"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${barPaths[key]}"/></svg>`;
  function renderBar() {
    const bar = document.getElementById('bottom-nav');
    const barKey = isManagement() ? state.context : 'membro';
    if (bar.dataset.context !== barKey) { bar.innerHTML = ''; bar.dataset.context = barKey; }
    bar.classList.toggle('is-admin', isManagement());
    bar.hidden = false; bar.setAttribute('aria-label', isManagement() ? 'Acessos da gestão' : 'Acessos do membro');
    if (!bar.children.length) bar.innerHTML = (isManagement() ? admin.bar() : [['inicio','Início'],['agenda','Calendário'],['generosidade','Contribuir'],['eventos','Eventos'],['celulas','Células']]).map(([view,label]) => `<a href="#${view}" data-view="${view}" class="${view === 'generosidade' ? 'bar-main' : ''}"><span class="bar-icon">${barIcon(view)}</span><span>${label}</span></a>`).join('');
    bar.querySelectorAll('a').forEach(a => {
      const active = a.dataset.view === state.view || (a.dataset.view === 'membresia' && state.view === 'confirmar');
      if (active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
      a.querySelector('.bar-icon').innerHTML = barIcon(a.dataset.view, active);
    });
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
  const admin = NibAdmin.create({ state, escape, button, arrow, backArrow, NibDaily, fullDate, show: (...a) => show(...a), announce: (...a) => announce(...a), refreshNotices: () => refreshNotices() });
  const adminOnly = ['gestao','membresia','confirmar','solicitacoes','programacao','comunicados','palavra','cuidado'];
  const calendarKinds = {celula:'Minha célula',culto:'Cultos',escola:'Escola bíblica',evento:'Eventos'};
  // Célula do membro (exemplo): na versão final vem do vínculo do membro com a célula na plataforma de células.
  const myCell = { name: 'Célula Exemplo', weekday: 3, time: '19:30', place: 'Casa da família Exemplo · Bairro Exemplo' };
  function withCell(items, fromKey, days) {
    const base = new Date(fromKey+'T12:00:00-04:00'); const extra = [];
    for (let i = 0; i < days; i++) { const d = new Date(base); d.setUTCDate(base.getUTCDate()+i); if (d.getUTCDay() === myCell.weekday) extra.push({ day: NibDaily.dayKey(d), time: myCell.time, name: myCell.name, type: 'Minha célula', place: myCell.place }); }
    return items.concat(extra).sort((a,b)=>(a.day+' '+(a.time||'99')).localeCompare(b.day+' '+(b.time||'99')));
  }
  const monthItems = month => withCell(NibDaily.monthAgenda(month), month+'-01', NibDaily.monthInfo(month).count);
  const calendarKind = item => item.type==='Minha célula'?'celula':item.type==='Culto'?'culto':item.type==='Programação semanal'?'escola':'evento';
  const calendarDot = kind => `<i class="calendar-dot" data-kind="${kind}" aria-hidden="true"></i>`;
  function calendarAnnouncement() { const items=monthItems(state.calendarMonth).filter(x=>x.day===state.calendarDay); return fullDate(state.calendarDay)+': '+(items.length?items.length+' encontro(s). '+items.map(x=>x.name+', '+(x.time||'horário a confirmar')).join('. '):'Nenhum encontro de referência.'); }
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
    const entries = selected.length ? '<ul class="day-entries">'+selected.map(x=>{ const kind = calendarKind(x); return `<li data-kind="${kind}"><time${x.time?'':' class="is-tbd"'}>${x.time ? x.time : 'Horário<br>a definir'}</time><div><strong>${escape(x.name)}</strong><p class="calendar-entry-kind">${calendarDot(kind)}${escape(x.type)}</p>${x.place?'<p class="calendar-entry-place">'+x.place+'</p>':''}</div></li>`; }).join('')+'</ul>' : '<p class="day-empty">Nenhum encontro de referência para esta data.</p>';
    const clock = new Intl.DateTimeFormat('en-GB',{timeZone:'America/Porto_Velho',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
    const upcoming = withCell(NibDaily.agenda(today, 14), today, 14).find(x => x.day > today || (x.day === today && (!x.time || x.time >= clock)));
    const short = key => new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',weekday:'short',day:'2-digit'}).format(new Date(key+'T12:00:00-04:00')).replace('.','');
    const todayLong = new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',weekday:'long',day:'numeric',month:'long'}).format(new Date(today+'T12:00:00-04:00'));
    const nextLine = upcoming ? `${calendarDot(calendarKind(upcoming))}<span>Próximo: <b>${escape(upcoming.name)}</b> · ${upcoming.day===today?'hoje':short(upcoming.day)}${upcoming.time?', '+upcoming.time:''}</span>` : '<span>Sem encontros nos próximos dias</span>';
    return `<div class="calendar-actions"><div class="calendar-now"><span class="label">HOJE</span><strong>${todayLong.charAt(0).toUpperCase()+todayLong.slice(1)}</strong><small>${nextLine}</small></div><button type="button" id="calendar-today" class="calendar-today"${state.calendarDay===today?' aria-pressed="true"':''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3v3 M17 3v3 M4 8h16 M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none"/></svg><span>Hoje</span></button></div><section class="box calendar-box" aria-label="Calendário mensal"><div class="calendar-toolbar"><button type="button" data-month="-1" aria-label="Mês anterior">‹</button><div><h2>${title.charAt(0).toUpperCase()+title.slice(1)}</h2></div><button type="button" data-month="1" aria-label="Próximo mês">›</button></div><div class="calendar-week" aria-hidden="true">${['D','S','T','Q','Q','S','S'].map(x=>'<span>'+x+'</span>').join('')}</div><div class="calendar-grid">${cells}</div><div class="calendar-legend">${Object.entries(calendarKinds).map(([key,name])=>'<span>'+calendarDot(key)+name+'</span>').join('')}</div></section><section class="box calendar-selection"><div class="selection-head"><span class="selection-date" aria-hidden="true"><small>${fmt({month:'short'}).replace('.','')}</small><strong>${fmt({day:'2-digit'})}</strong></span><div><span class="label">${state.calendarDay===today?'HOJE':'DIA SELECIONADO'}</span><h2>${cap}</h2><p>${fmt({day:'numeric',month:'long',year:'numeric'})}</p></div><span class="selection-count">${countLabel}</span></div>${entries}</section><p class="note">Programação de referência do site da igreja, ainda sem sincronização; as recorrências não representam histórico de encontros realizados. Confirme mudanças com a igreja. Festividades aparecerão após o cadastro pela equipe.</p>`;
  }
  const prayHeart = '<svg class="pray-heart" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.5s-8-4.7-8-10.2A4.6 4.6 0 0 1 12 7.4a4.6 4.6 0 0 1 8 2.9c0 5.5-8 10.2-8 10.2z"/></svg>';
  function verseAdmin() {
    const today = NibDaily.dayKey(new Date()), current = NibDaily.verseForDay(today);
    return `<section class="box verse-admin" aria-labelledby="verse-admin-title"><span class="label">PALAVRA DO DIA</span><h2 id="verse-admin-title" tabindex="-1">Versículo escolhido pela igreja</h2><p>Defina o versículo de uma data, alinhado à série de mensagens. Quando não houver escolha, o app usa a lista anual automática, com um versículo diferente por dia.</p><p class="verse-admin-now"><b>Hoje:</b> ${escape(current[1])}${current[2] ? ' · escolhido pela igreja' : ' · lista automática'}</p><form id="verse-form"><label for="verse-date">Data</label><input id="verse-date" name="data" type="date" value="${today}" required><label for="verse-text">Texto do versículo</label><textarea id="verse-text" name="texto" maxlength="280" rows="3" required placeholder="Digite o texto conforme a versão bíblica da igreja"></textarea><label for="verse-ref">Referência</label><input id="verse-ref" name="referencia" maxlength="40" required placeholder="Ex.: Salmos 23:1"><div class="form-actions"><button type="submit" class="primary">Salvar para esta data</button>${current[2] ? '<button type="button" id="verse-clear">Voltar à lista automática</button>' : ''}</div></form><p class="note">Nesta versão de teste, a escolha vale só nesta sessão.</p></section>`;
  }
  const money = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  function renderPixQr() {
    const box = content.querySelector('#pix-qr'); if (!box || !state.giftCode || typeof qrcode !== 'function') return;
    const qr = qrcode(0, 'M'); qr.addData(state.giftCode); qr.make();
    const n = qr.getModuleCount(), q = 4; let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c+q} ${r+q}h1v1h-1z`;
    box.innerHTML = `<svg viewBox="0 0 ${n+q*2} ${n+q*2}" shape-rendering="crispEdges" aria-hidden="true"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#041e42"/></svg>`;
  }
  // Dados da obra: mesma fonte do site (novaigrejabatista.com.br/dados/obra.json). Sem conexão, ficam os últimos valores conhecidos.
  const obra = { percentual: 30, lugares: '1.500', entrega: '2028' };
  function syncCampaignBar() { const bar = content.querySelector('.campaign-bar span'); if (bar) bar.style.setProperty('width', obra.percentual + '%'); }
  function loadObra() {
    if (!window.fetch) return;
    fetch('https://novaigrejabatista.com.br/dados/obra.json', { cache: 'no-cache', credentials: 'omit' }).then(r => r.ok ? r.json() : null).then(d => {
      const raw = d && typeof d === 'object' ? d.percentual : undefined;
      if (!(typeof raw === 'number' || (typeof raw === 'string' && raw.trim() !== ''))) return;
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0 || value > 100) return;
      obra.percentual = Math.round(value);
      if (d.lugares) obra.lugares = String(d.lugares).slice(0, 12);
      if (d.entrega) obra.entrega = String(d.entrega).slice(0, 12);
      if (state.view === 'generosidade') { const pct = content.querySelector('[data-obra-pct]'); if (pct) pct.textContent = obra.percentual + '% concluída'; syncCampaignBar(); }
    }).catch(() => {});
  }
  const giftLabel = () => state.gift === 'Campanha' ? 'Obra do templo' : state.gift;
  const monthShort = key => new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',month:'short'}).format(new Date(key+'T12:00:00-04:00')).replace('.','');
  const typeLabel = t => t === 'Campanha' ? 'Obra do templo' : t;
  const shortDate = key => new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',day:'2-digit',month:'short'}).format(new Date(key+'T12:00:00-04:00')).replace('.','');
  const yearItems = year => state.history.filter(x => x.day.startsWith(year)).sort((a, b) => b.day.localeCompare(a.day));
  const sum = list => list.reduce((t, x) => t + x.amount, 0);
  function historyPeek() {
    const year = NibDaily.dayKey(new Date()).slice(0,4), items = yearItems(year), last = items[0];
    return `<section class="box history-peek" aria-labelledby="history-peek-title"><div class="history-peek-text"><span class="label">MINHAS CONTRIBUIÇÕES</span><h2 id="history-peek-title">Em ${year} você contribuiu ${money(sum(items.filter(x => x.status === 'ok')))}</h2>${last ? `<p>Última: ${escape(typeLabel(last.type))} de ${money(last.amount)} em ${escape(shortDate(last.day))}${last.status === 'ok' ? '' : ' · em conferência'}.</p>` : '<p>Nenhuma contribuição registrada neste ano.</p>'}</div>${button('Ver histórico','historico')}</section>`;
  }
  function historyPage() {
    if (state.giftStep === 'obrigado') { state.giftStep = 'finalidade'; state.giftAmount = null; }
    const years = [...new Set(state.history.map(x => x.day.slice(0,4)))].sort().reverse();
    if (!years.includes(state.historyYear)) state.historyYear = years[0] || NibDaily.dayKey(new Date()).slice(0,4);
    const year = state.historyYear, items = yearItems(year), ok = items.filter(x => x.status === 'ok'), pending = items.filter(x => x.status !== 'ok');
    const chips = years.map(y => `<button type="button" class="history-year${y === year ? ' is-active' : ''}" data-history-year="${y}" aria-pressed="${y === year}">${y}</button>`).join('');
    const parts = ['Dízimo','Oferta','Campanha'].map(t => { const v = sum(ok.filter(x => x.type === t)); return `<div><dt>${escape(typeLabel(t) === t ? t + 's' : typeLabel(t))}</dt><dd>${money(v)}</dd></div>`; }).join('');
    const months = []; for (const x of items) { const m = x.day.slice(0,7); let g = months.find(g => g.m === m); if (!g) months.push(g = { m, list: [] }); g.list.push(x); }
    const monthName = m => new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',month:'long'}).format(new Date(m+'-15T12:00:00-04:00'));
    const rows = months.map(g => `<li class="history-month"><h3>${escape(monthName(g.m))}</h3><ul>${g.list.map(x => `<li><span class="admin-when"><small>${escape(monthShort(x.day))}</small><strong>${x.day.slice(8)}</strong></span><span class="history-what"><b>${escape(typeLabel(x.type))}</b><small><span class="history-status${x.status === 'ok' ? '' : ' is-pending'}">${x.status === 'ok' ? 'Confirmado' : 'Em conferência'}</span> · Pix${x.app ? ' pelo app' : ''}</small></span><strong class="history-amount">${money(x.amount)}</strong></li>`).join('')}</ul></li>`).join('');
    return `<div class="history-years" role="group" aria-label="Ano">${chips}</div><div class="history-layout"><section class="box history-summary" aria-labelledby="history-total-title"><span class="label">RESUMO DE ${year}</span><h2 id="history-total-title" class="history-total">${money(sum(ok))}</h2><p class="history-total-note">Confirmado pela tesouraria${pending.length ? `. Mais ${money(sum(pending))} em conferência.` : '.'}</p><dl class="bank-details history-parts">${parts}</dl>${button('Contribuir agora','generosidade',true)}</section><section class="box history-list" aria-labelledby="history-list-title"><h2 id="history-list-title">Lançamentos</h2>${rows ? `<ul class="history-months">${rows}</ul>` : '<p class="gift-intro">Nenhuma contribuição neste ano.</p>'}</section></div><section class="box history-how"><h2>Como o histórico funciona</h2><p>O Pix feito pelo app aparece na hora como <b>Em conferência</b>. Quando a tesouraria confere o extrato da igreja, ele passa a <b>Confirmado</b>. O Pix feito direto no app do banco aparece depois dessa conferência.</p><p class="note">Demonstração com valores fictícios. Só você e a tesouraria veem estes dados.</p></section>`;
  }
  function giftBack() {
    const prev = ({valor:'finalidade', confirmar:'valor', pix:'confirmar'})[state.giftStep || 'finalidade'];
    return prev ? `<button type="button" class="button-back gift-back" data-gift-step="${prev}">${backArrow}<span>Voltar</span></button>` : '';
  }
  function giftFlow() {
    const step = state.giftStep || 'finalidade', m = state.member;
    const order = ['finalidade','valor','confirmar','pix','obrigado'], idx = order.indexOf(step);
    const tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
    const steps = ['Finalidade','Valor','Seus dados','Pix'].map((label,i) => `<li class="${idx > i ? 'is-done' : idx === i ? 'is-current' : ''}"${idx === i ? ' aria-current="step"' : ''}><span class="gift-dot">${idx > i ? tick : '0' + (i+1)}</span><span class="gift-step-label">${label}</span></li>`).join('');
    const head = `${giftBack() ? `<div class="gift-backrow">${giftBack()}</div>` : ''}<ol class="gift-steps" aria-label="Etapas da contribuição">${steps}</ol>`;
    const title = (text, intro) => `<div class="gift-step-head"><div><h3 id="gift-step-title" tabindex="-1" class="gift-step-title">${text}</h3>${intro ? `<p class="gift-intro">${intro}</p>` : ''}</div></div>`;
    const summary = () => `<div class="gift-summary"><span>${escape(giftLabel())}</span><strong>${money(state.giftAmount)}</strong></div>`;
    if (step === 'confirmar') return `${head}${title('Confira seus dados', 'Já preenchemos com o seu cadastro. Confira e toque em Gerar Pix.')}${summary()}<div class="gift-payer"><span class="profile-avatar" aria-hidden="true">${escape(m.first.charAt(0))}</span><div><span class="gift-payer-label">Contribuindo como</span><strong>${escape(m.full)}</strong><small>${escape(m.email)}</small></div><span class="gift-auto">Preenchido</span></div><label class="check gift-check"><input id="gift-receipt" type="checkbox" checked><span>Enviar o comprovante para ${escape(m.email)}</span></label><div class="form-actions gift-actions"><button type="button" class="action primary" data-gift-step="pix">Gerar Pix</button></div><p class="gift-foot">Dados errados? Atualize em <button type="button" class="auth-link" data-view="cadastro">Meu cadastro</button>.</p>`;
    if (step === 'pix') return `${head}${title('Pague no app do seu banco', 'Leia o QR Code ou copie o código e siga os passos abaixo.')}${summary()}<div class="pix-qr" id="pix-qr" role="img" aria-label="QR Code Pix de ${money(state.giftAmount)} para a Nova Igreja Batista"></div><label for="pix-code">Pix copia e cola</label><div class="pix-copy"><input id="pix-code" readonly value="${escape(state.giftCode)}"><button type="button" id="pix-copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 9h10v10H9z M5 15V5h10"/></svg><span>Copiar</span></button></div><ol class="pix-howto" aria-label="Como pagar"><li><span>1</span><p>Abra o app do seu banco e escolha <b>Pix</b>.</p></li><li><span>2</span><p>Use <b>Ler QR Code</b> ou <b>Pix copia e cola</b>.</p></li><li><span>3</span><p>Confira o nome <b>Nova Igreja Batista</b> e confirme.</p></li></ol><div class="form-actions gift-actions"><button type="button" class="action primary" data-gift-step="obrigado">Já fiz o Pix</button></div><p class="gift-foot">Pix real, direto para a conta da igreja (CNPJ 40.518.758/0001-30). Seu banco já informa o seu nome.</p>`;
    if (step === 'obrigado') return `${head}<div class="gift-thanks"><span class="gift-thanks-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span><h3 id="gift-step-title" tabindex="-1" class="gift-step-title">Obrigado pela sua generosidade, ${escape(m.first)}!</h3><p>${escape(giftLabel())} de ${money(state.giftAmount)} registrado em Minhas contribuições como em conferência. A tesouraria confere o recebimento pelo extrato da conta da igreja.</p><p class="note">Quando a integração com o banco estiver ativa, a confirmação aparece aqui sozinha${state.giftReceipt === false ? '' : ' e o comprovante chega em ' + escape(m.email)}.</p></div><div class="form-actions gift-actions"><button type="button" class="action primary" data-view="historico">Ver minhas contribuições</button><button type="button" data-gift-step="finalidade" data-done="1">Fazer outra contribuição</button></div>`;
    if (step === 'finalidade') {
      const icons = {
        'Dízimo': '<path d="M12 21s-7-4.4-7-10.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7 2.8C19 16.6 12 21 12 21Z"/>',
        'Oferta': '<path d="M20 12v9H4v-9 M2 7h20v5H2z M12 21V7 M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Z M12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z"/>',
        'Campanha': '<path d="M3 21h18 M5 21V10l7-5 7 5v11 M9 21v-6h6v6"/>'
      };
      const info = {
        'Dízimo': 'Sua fidelidade sustenta a missão e o cuidado da igreja.',
        'Oferta': 'Uma expressão de gratidão, no valor que o seu coração decidir.',
        'Campanha': 'Construção do novo templo da Nib.'
      };
      const option = name => `<button type="button" class="gift-choice" data-gift="${name}" aria-pressed="${state.gift === name}"><span class="gift-choice-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg></span><span class="gift-choice-text"><strong>${name}</strong><small>${info[name]}</small>${name === 'Campanha' ? `<span class="gift-choice-obra"><img src="assets/campanha-templo.webp" alt="" width="900" height="506"><span><span class="campaign-bar" aria-hidden="true"><span></span></span><em data-obra-pct>${obra.percentual}% concluída</em></span></span>` : ''}</span><span class="gift-choice-radio" aria-hidden="true"></span></button>`;
      return `${head}${title('O que você quer contribuir?', 'Escolha uma opção e toque em Continuar.')}<div class="gift-choices" role="group" aria-label="Finalidade da contribuição">${['Dízimo','Oferta','Campanha'].map(option).join('')}</div><div class="form-actions gift-actions"><button type="button" class="action primary" data-gift-step="valor">Continuar</button></div><p class="gift-foot">Pix real, direto para a conta da igreja.</p>`;
    }
    const amounts = [50,100,200,500];
    return `${head}${title(state.gift === 'Campanha' ? 'Quanto você quer doar para a obra?' : state.gift === 'Dízimo' ? 'Qual o valor do seu dízimo?' : 'Qual o valor da sua oferta?', 'Toque em um valor sugerido ou digite outro e avance.')}<form id="gift-form"><div class="gift-amounts" role="group" aria-label="Valores sugeridos">${amounts.map(v => `<button type="button" data-gift-amount="${v}" aria-pressed="${state.giftAmount === v}">${money(v).replace(',00','')}</button>`).join('')}</div><label for="gift-value">Outro valor (R$)</label><input id="gift-value" name="amount" type="number" inputmode="decimal" min="1" max="1000000" step="0.01" placeholder="0,00" value="${state.giftAmount || ''}" required><div class="form-actions gift-actions"><button class="action primary" type="submit">Continuar</button></div></form><p class="gift-foot">Pix real, direto para a conta da igreja.</p>`;
  }
  function prayCaption(p) {
    const others = p.supporters - (p.supported ? 1 : 0);
    if (p.supported) return others ? `<b>Você</b> e mais ${others} ${others===1?'pessoa estão':'pessoas estão'} orando` : '<b>Você</b> está orando por este pedido';
    return others ? `<b>${others}</b> ${others===1?'pessoa está':'pessoas estão'} orando` : 'Seja o primeiro a orar por este pedido';
  }
  function prayerCards(compact=false) {
    return state.prayers.filter(p => isManagement() || !p.hidden).reverse().slice(0,compact?2:state.prayers.length).map(p=>`<article class="prayer-post" data-post="${p.id}"><div class="prayer-post-author"><span class="profile-avatar" aria-hidden="true">${escape(p.author.charAt(0))}</span><div><strong>${escape(p.author)}</strong><small>Pedido fictício · Demonstração</small></div>${p.answered?'<span class="prayer-answered"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>Oração atendida</span>':''}</div><h3>${escape(p.name)}</h3><p class="prayer-reason">${escape(p.reason)}</p><div class="prayer-post-footer"><button type="button" class="prayer-support" data-prayer-support="${p.id}" aria-pressed="${p.supported}" aria-label="Estou orando por: ${escape(p.name)}">${prayHeart}<span class="prayer-support-label">${p.supported?'Orando':'Vou orar'}</span></button><span class="prayer-support-caption" aria-live="polite">${prayCaption(p)}</span></div>${!compact&&p.own?'<div class="prayer-own-actions"><span class="prayer-own-label">Seu pedido</span><button type="button" class="prayer-own-btn" data-prayer-toggle="'+p.id+'" aria-label="'+(p.answered?'Reabrir pedido':'Marcar como atendida')+': '+escape(p.name)+'">'+(p.answered?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6 M4 4v4h4"/></svg><span>Reabrir</span>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg><span>Marcar atendida</span>')+'</button><button type="button" class="prayer-own-btn is-danger" data-prayer-delete="'+p.id+'" aria-label="Excluir pedido: '+escape(p.name)+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v6 M14 11v6"/></svg><span>Excluir</span></button></div>':''}</article>`).join('');
  }
  // Banners das redes oficiais: foto da igreja, chapéu, título e caixa azul translúcida.
  const socialLinks = [
    ['Instagram','Acompanhe a NIB no dia a dia','Fotos, avisos e bastidores de cada semana.','Siga agora!','https://www.instagram.com/nibcasadedeus/','assets/social-instagram.webp'],
    ['YouTube','Cultos e mensagens na íntegra','Assista ao vivo e reveja as pregações quando quiser.','Assista agora!','https://www.youtube.com/@nibcasadedeus','assets/social-youtube.webp'],
    ['Site da igreja','A NIB em um só lugar','Cultos, células, eventos e inscrições.','Acesse o site!','https://novaigrejabatista.com.br/','assets/social-site.webp']
  ];
  function socialBanners() {
    return `<section class="social-banners" aria-labelledby="social-title"><div class="section-heading"><h2 id="social-title">Acompanhe a igreja na internet</h2></div><div class="social-track">${socialLinks.map(([network,title,text,action,url,image]) => `<a class="social-card" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${network}: ${title}. ${text} ${action}. Abre em nova aba."><img src="${image}" alt="" width="900" height="682" loading="lazy"><span class="social-kicker">${network}</span><strong class="social-title">${title}</strong><span class="social-box"><span>${text} <b>${action}</b></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></span></a>`).join('')}</div><div class="social-dots" aria-hidden="true">${socialLinks.map((_,i)=>`<span${i?'':' class="is-active"'}></span>`).join('')}</div></section>`;
  }
  function bindSocialBanners() {
    const track = content.querySelector('.social-track');
    if (!track) return;
    const dots = [...content.querySelectorAll('.social-dots span')];
    const cards = [...track.children];
    const images = cards.map(card => card.querySelector('img'));
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const left = track.scrollLeft;
      let index = 0;
      cards.forEach((card,i) => { if (Math.abs(card.offsetLeft - track.offsetLeft - left) < Math.abs(cards[index].offsetLeft - track.offsetLeft - left)) index = i; });
      dots.forEach((dot,i) => dot.classList.toggle('is-active', i === index));
      // Paralaxe: a foto anda mais devagar que o card ao deslizar.
      cards.forEach((card,i) => {
        const offset = (card.offsetLeft - track.offsetLeft - left) / card.offsetWidth;
        images[i].style.transform = (still.matches || track.scrollWidth <= track.clientWidth + 1) ? '' : `translate3d(${(Math.max(-1.2, Math.min(1.2, offset)) * -10).toFixed(2)}%,0,0) scale(1.04)`;
      });
    };
    track.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, {passive:true});
    addEventListener('resize', () => { if (!frame) frame = requestAnimationFrame(update); });
    update();
  }
  function communityBlock() {
    return `<section class="community-prayer" aria-labelledby="community-prayer-title"><div class="section-heading"><div><span class="label">CUIDADO EM COMUNIDADE</span><h2 id="community-prayer-title">Caderno de oração</h2></div>${button('Ver caderno','caderno')}</div><p>Vamos orar uns pelos outros.</p><div class="prayer-feed">${prayerCards(true)}</div><p class="note">Mural demonstrativo com pedidos fictícios. O contador representa pessoas orando. Ainda sem compartilhamento entre usuários.</p></section>`;
  }
  function notebookPage() {
    return `<section class="box prayer-box"><h2>Compartilhe um pedido com a comunidade</h2><p>No mural, cada pessoa poderá conhecer os pedidos e sinalizar “Estou orando”. A indicação de oração atendida é feita por quem publicou.</p><p class="note">Preview com dados fictícios: nenhuma publicação é enviada à igreja ou compartilhada entre usuários. Os testes ficam só nesta aba e reiniciam ao recarregar ou trocar o perfil.</p><form id="notebook-form" autocomplete="off"><label for="notebook-name">Título do pedido</label><input id="notebook-name" name="name" maxlength="120" required placeholder="Ex.: Pela Família Exemplo" autocomplete="off"><label for="notebook-reason">O que você deseja compartilhar?</label><textarea id="notebook-reason" name="reason" maxlength="1000" required autocomplete="off" placeholder="Escreva um pedido fictício para o mural."></textarea><p class="note">Na versão compartilhada, o pedido será visível à comunidade. Evite expor dados pessoais de outras pessoas.</p><div class="form-actions"><button type="submit" class="action">Publicar pedido de teste</button><button type="reset">Limpar</button></div></form></section><section class="community-prayer" aria-labelledby="prayer-feed-title"><div class="section-heading"><h2 id="prayer-feed-title" tabindex="-1">Orando em comunidade</h2><span class="note">${state.prayers.length} pedidos de exemplo</span></div><div class="prayer-feed">${prayerCards()||'<p>Nenhum pedido neste mural de teste.</p>'}</div></section>`;
  }
  function announce(message, tone = 'info', reveal = true) { feedback.dataset.tone=tone; feedback.textContent = message; if(reveal) feedback.scrollIntoView({block:"nearest",behavior:"instant"}); }
  function renderNavigation() {
    const items = isManagement() ? admin.views() : navigation;
    const context = isManagement() ? state.context : 'membro';
    for (const nav of [document.getElementById('navigation'), document.getElementById('mobile-navigation')]) {
      if (nav.dataset.context !== context) {
        if (nav.id === 'navigation') nav.innerHTML = items.map(([key,label]) => `<a href="#${key}" data-view="${key}" aria-label="${label}">${navIcon(key)}<span>${label}</span></a>`).join('');
        else {
          const descriptions = {...admin.descriptions, inicio:'Seu ponto de partida',cadastro:'Dados e atualizações',eventos:'Encontros e inscrições',generosidade:'Dízimos, ofertas e campanhas',historico:'Seu histórico financeiro',celulas:'Acesso à plataforma',informacoes:'Programação e avisos',gestao:'Integração e apresentações',agenda:'Cultos, eventos e festividades',caderno:'Ore com a comunidade'};
          const groups = isManagement() ? [[admin.profiles[state.context].name,items]] : [['Seu acesso',items.filter(([key])=>['inicio','cadastro'].includes(key))],['Vida na igreja',items.filter(([key])=>['agenda','eventos','generosidade','historico','celulas','informacoes','caderno'].includes(key))]];
          nav.innerHTML = groups.map(([label,links],index) => `<section class="menu-group" aria-labelledby="menu-group-${index}"><h3 id="menu-group-${index}">${label}</h3><div class="menu-grid">${links.map(([key,title])=>`<a href="#${key}" data-view="${key}" aria-label="${title}"><span class="menu-icon">${navIcon(key)}</span><strong>${title}</strong><span class="menu-description">${descriptions[key]}</span><span class="mobile-current" hidden>Atual</span></a>`).join('')}</div></section>`).join('');
        }
        nav.dataset.context = context;
      }
      nav.querySelectorAll('a').forEach(item => {
      const active = state.view === item.dataset.view || (item.dataset.view === 'membresia' && state.view === 'confirmar');
      item.classList.toggle('selected', active);
      const current = item.querySelector('.mobile-current');
      if (current) current.hidden = !active;
      if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
      });
    }
    document.getElementById('member-shortcuts').hidden = isManagement();
    document.getElementById('menu-profile').innerHTML = isManagement() ? '<div class="menu-profile-card"><strong>' + (state.context === 'secretaria' ? 'Secretaria da igreja' : 'Liderança Pastoral') + '</strong><span>Experiência de teste</span></div>' : '<a class="menu-profile-card" href="#cadastro" data-view="cadastro"><span class="profile-avatar" aria-hidden="true">' + escape(state.member.first.charAt(0).toUpperCase()) + '</span><span><strong>' + escape(state.member.full) + '</strong><small>' + escape(state.member.email) + '</small></span><span class="profile-demo">Teste</span></a>';
    renderBar();
  }
  function show(view, focus = true, record = true) {
    if(view==='oracao') view='caderno'; // Compatibilidade com o destino anterior.
    if (isManagement() && !admin.allowed(view)) view = 'gestao';
    if (adminOnly.includes(view) && !isManagement()) view = 'inicio';
    if (record && focus && view !== state.view) viewHistory.push(state.view);
    state.view = (labels[view] || admin.labels[view]) ? view : 'inicio';
    root.dataset.view = state.view;
    document.getElementById('mobile-return').hidden = state.view === 'inicio' || (isManagement() && state.view === 'gestao');
    const [eyebrow, title, description] = (isManagement() && admin.pageLabels(state.view)) || labels[state.view];
    document.getElementById('eyebrow').textContent = eyebrow;
    document.getElementById('heading').textContent = state.view === 'inicio' ? title.replace('Jéssica', state.member.first) : title;
    document.getElementById('description').textContent = description;
    feedback.textContent = ''; feedback.dataset.tone='info';
    const pages = {
      inicio: () => `${dailyBlocks(false,'verse')}<section aria-labelledby="quick-title"><div class="section-heading"><h2 id="quick-title">O que você precisa está aqui</h2></div><div class="quick-actions">${[
        ['cadastro', 'Meu cadastro', 'Consulte seus dados e solicite uma atualização.'],
        ['eventos', 'Eventos e inscrições', 'Veja os encontros e acompanhe suas inscrições.'],
        ['generosidade', 'Dízimos e ofertas', 'Encontre as opções para contribuir e as campanhas.'],
        ['celulas', 'Células', 'Saiba como acessar a plataforma de células.'],
        ['informacoes', 'Programação e avisos', 'Consulte as informações e os canais da igreja.'],
        ['caderno', 'Caderno de oração', 'Compartilhe seus pedidos e ore com a comunidade.']
      ].map(([view, title, text]) => `<button type="button" class="quick-action admin-quick" data-view="${view}"><span class="home-action-icon" aria-hidden="true">${navIcon(view)}</span>${view === 'informacoes' && unreadNotices() ? `<span class="admin-badge notice-badge" aria-label="${unreadNotices()} ${unreadNotices() === 1 ? 'aviso novo' : 'avisos novos'}">${unreadNotices()}</span>` : ''}<strong>${title}</strong><span class="home-action-description">${text}</span></button>`).join('')}</div></section>${socialBanners()}${dailyBlocks(false,'agenda')}${communityBlock()}<section class="home-events-block" aria-labelledby="home-events-title"><div class="section-heading"><div><span class="label">PARTICIPE COM A GENTE</span><h2 id="home-events-title">Eventos da igreja</h2></div>${button('Ver todos', 'eventos')}</div>${eventCards(true)}</section>`,
      agenda: () => calendarPage(),
      caderno: () => notebookPage(),
      cadastro: () => `<div class="profile-layout"><section class="box profile-summary"><span class="tag">Membro · exemplo</span><h2>${escape(state.member.full)}</h2><p>Confira seu cadastro na igreja.</p><dl class="profile"><dt>E-mail</dt><dd>jessica@example.com</dd><dt>Telefone</dt><dd>Não informado</dd><dt>Endereço</dt><dd>Não informado</dd><dt>Apresentação no culto</dt><dd>Apresentação registrada · exemplo</dd></dl><p class="note">As alterações são encaminhadas para conferência da Secretaria.</p></section><section class="box profile-edit"><h2>O que você deseja atualizar?</h2><p>Preencha somente os dados que precisam mudar.</p><form id="profile-form"><fieldset><legend>Dados para atualização</legend><div class="form-grid"><div><label for="new-name">Nome completo</label><input id="new-name" name="newName" autocomplete="off" placeholder="Informe o nome corrigido" maxlength="160"></div><div><label for="new-email">Novo e-mail</label><input id="new-email" name="newEmail" type="email" autocomplete="off" placeholder="nome@exemplo.com" maxlength="160"></div><div><label for="new-phone">Novo telefone / WhatsApp</label><input id="new-phone" name="newPhone" type="tel" inputmode="tel" autocomplete="off" placeholder="(69) 99999-9999" maxlength="25"></div><div><label for="new-address">Endereço</label><input id="new-address" name="newAddress" autocomplete="off" placeholder="Rua, número, bairro e cidade" maxlength="250"></div></div></fieldset><fieldset><legend>Contato e observações</legend><label for="contact-email">E-mail para retorno</label><input id="contact-email" name="email" type="email" autocomplete="off" placeholder="exemplo@example.com" maxlength="160" required><label for="contact-note">Outra alteração ou observação (opcional)</label><textarea id="contact-note" name="note" placeholder="Descreva o que a Secretaria precisa conferir." maxlength="500"></textarea></fieldset><div class="form-actions"><button class="action" type="submit">Enviar solicitação de teste</button><button type="reset">Limpar alterações</button></div></form><p class="note">Use dados fictícios. A solicitação fica nesta sessão; nenhum cadastro real é alterado.</p></section></div>`,
      eventos: () => `${eventCards()}<section class="box event-follow-up"><h2>Minhas inscrições</h2><p>Nenhuma inscrição vinculada nesta demonstração.</p><p class="note">Inscrições anteriores não serão vinculadas automaticamente por nome ou telefone.</p></section>`,
      celulas: () => `<section class="box"><span class="label">PLATAFORMA EXTERNA</span><h2>Encontre sua comunidade</h2><p>A igreja utilizará uma plataforma de células pronta. O endereço de acesso será configurado após a definição da integração.</p><button type="button" disabled>Acesso em preparação</button><p class="note">A entrada sem um novo login depende do serviço externo.</p></section>`,
      historico: () => historyPage(),
      generosidade: () => `${(state.giftStep || 'finalidade') === 'finalidade' ? historyPeek() : ''}<div class="giving-layout${(state.giftStep || 'finalidade') === 'finalidade' ? '' : ' is-flow'}"><section class="box gift-box" aria-labelledby="gift-step-title">${giftFlow()}</section>${(state.giftStep || 'finalidade') === 'finalidade' ? `<section class="box giving-details"><h2>Outras formas de contribuir</h2><p class="giving-church">Se preferir, faça o Pix direto no app do seu banco com os dados oficiais da igreja, os mesmos do site.</p><dl class="bank-details"><div><dt>Pix (CNPJ)</dt><dd>40.518.758/0001-30</dd></div><div><dt>Banco</dt><dd>Sicoob</dd></div><div><dt>Agência / Conta</dt><dd>3315 / 51.404-7</dd></div></dl><figure class="church-qr church-qr-open"><img src="assets/pix-qrcode.png" alt="QR Code Pix oficial da Nova Igreja Batista" width="200" height="200"><figcaption>Abra o app do seu banco e escaneie o QR Code para fazer o Pix.</figcaption><button type="button" class="action church-pix-copy" id="church-pix-copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 9h10v10H9z M5 15V5h10"/></svg><span>Copiar código Pix</span></button><small class="church-pix-note">Depois, cole em Pix copia e cola e informe o valor no app do banco.</small></figure></section>` : ''}</div>`,
      informacoes: () => `${admin.infoProgram()}<section class="box"><h2>Endereço e contato</h2><p>Os canais de atendimento serão configurados nesta área.</p></section>`
    };
    content.innerHTML = (isManagement() && admin.pages[state.view] ? admin.pages[state.view] : pages[state.view])();
    content.querySelectorAll('[data-w]').forEach(el => el.style.setProperty('width', el.dataset.w + '%'));
    if (state.view === 'informacoes') markNoticesSeen();
    bindSocialBanners(); renderPixQr(); syncCampaignBar();
    renderNavigation();
    closeDrawer();
    if (notices.open) notices.close();
    const dateField = document.getElementById('presented-date');
    if (dateField) dateField.max = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Manaus', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    if (focus) { document.getElementById('heading').focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); }
  }
  root.addEventListener('click', event => {
    const action = event.target.closest('button,a[data-view],a[data-back]');
    if (!action || action.disabled) return;
    if (isManagement() && admin.click(action)) return;
    if (action.id === 'header-notices') { markNoticesSeen(); notices.showModal(); root.classList.add('nib-dialog-open'); document.getElementById('notices-close').focus(); return; }
    if (action.id === 'notices-close') { notices.close(); return; }
    if (action.id === 'header-menu') { document.querySelector('.test-options').open = false; drawer.showModal(); root.classList.add('nib-dialog-open'); action.setAttribute('aria-expanded','true'); document.getElementById('drawer-close').focus({preventScroll:true}); return; }
    if (action.id === 'drawer-close') { closeDrawer(); return; }
    if (action.id === 'verse-share') {
      const text = '“' + content.querySelector('.daily-verse blockquote').lastChild.textContent.trim() + '” ' + content.querySelector('.daily-verse cite').textContent + ' · Nova Igreja Batista';
      if (navigator.share) { navigator.share({ text }).catch(() => {}); return; }
      if (navigator.clipboard) { navigator.clipboard.writeText(text).then(() => announce('Versículo copiado. É só colar onde quiser compartilhar.', 'success', false), () => announce('Não foi possível copiar o versículo neste navegador.', 'info', false)); return; }
      announce('Compartilhamento indisponível neste navegador.', 'info', false); return;
    }
    if (action.id === 'mobile-back') { event.preventDefault(); show(viewHistory.pop() || (isManagement() ? 'gestao' : 'inicio'), true, false); return; }
    if (action.dataset.month) { state.calendarMonth=NibDaily.moveMonth(state.calendarMonth,Number(action.dataset.month)); state.calendarDay=state.calendarMonth+'-01'; show('agenda',false,false); content.querySelector('[data-month="'+action.dataset.month+'"]').focus({preventScroll:true}); feedback.textContent=content.querySelector('.calendar-toolbar h2').textContent; return; }
    if (action.dataset.day) { state.calendarDay=action.dataset.day; show('agenda',false,false); content.querySelector('[data-day="'+state.calendarDay+'"]').focus({preventScroll:true}); feedback.textContent=calendarAnnouncement(); return; }
    if (action.id==='calendar-today') { state.calendarDay=NibDaily.dayKey(new Date()); state.calendarMonth=state.calendarDay.slice(0,7); show('agenda',false,false); content.querySelector('#calendar-today').focus({preventScroll:true}); feedback.textContent=calendarAnnouncement(); return; }
    if (action.id==='verse-clear') { NibDaily.setCurated(NibDaily.dayKey(new Date())); show(isManagement() ? 'palavra' : 'inicio',false,false); announce('Hoje volta a usar a lista automática.','success',false); return; }
    if (action.dataset.prayerSupport) {
      const p=state.prayers.find(x=>x.id===action.dataset.prayerSupport); if(!p||isManagement()) return;
      p.supported=!p.supported; p.supporters+=p.supported?1:-1;
      action.setAttribute('aria-pressed',String(p.supported));
      action.querySelector('.prayer-support-label').textContent=p.supported?'Orando':'Vou orar';
      action.parentElement.querySelector('.prayer-support-caption').innerHTML=prayCaption(p);
      feedback.textContent=p.supported?'Você está orando por este pedido.':'Você deixou de marcar este pedido.';
      return;
    }
    if (action.dataset.prayerToggle) { const p=state.prayers.find(x=>x.id===action.dataset.prayerToggle); if(!p||!p.own) return; p.answered=!p.answered; show('caderno',false,false); content.querySelector('[data-prayer-toggle="'+p.id+'"]').focus({preventScroll:true}); feedback.textContent=p.answered?'Oração marcada como atendida.':'Pedido reaberto: voltou para em oração.'; return; }
    if (action.dataset.prayerDelete) { const p=state.prayers.find(x=>x.id===action.dataset.prayerDelete); if(!p||!p.own) return; state.prayers=state.prayers.filter(x=>x.id!==p.id); show('caderno',false,false); content.querySelector('#prayer-feed-title').focus({preventScroll:true}); announce('Pedido removido do caderno de teste.','success',false); return; }
    if (action.dataset.view) { event.preventDefault(); show(action.dataset.view); }
    if (action.dataset.message) announce(action.dataset.message);
    if (action.dataset.giftAmount) { const input = content.querySelector('#gift-value'); input.value = action.dataset.giftAmount; content.querySelectorAll('[data-gift-amount]').forEach(b => b.setAttribute('aria-pressed', String(b === action))); return; }
    if (action.dataset.historyYear) { state.historyYear = action.dataset.historyYear; show('historico', false, false); content.querySelector('[data-history-year="' + state.historyYear + '"]').focus({preventScroll:true}); return; }
    if (action.dataset.giftStep) { state.giftStep = action.dataset.giftStep; if (state.giftStep === 'obrigado' && state.giftAmount && state.giftLogged !== state.giftCode) { state.giftLogged = state.giftCode; state.history.push({ day: NibDaily.dayKey(new Date()), type: state.gift, amount: state.giftAmount, status: 'pending', app: true }); } if (action.dataset.done) state.giftAmount = null; if (state.giftStep === 'pix') { if (content.querySelector('#gift-receipt')) state.giftReceipt = content.querySelector('#gift-receipt').checked; state.giftCode = NibPix.brCode({ amount: state.giftAmount, txid: ({'Dízimo':'DIZ','Oferta':'OFE','Campanha':'OBRA'})[state.gift] + NibDaily.dayKey(new Date()).replace(/-/g,'') + Math.random().toString(36).slice(2,8) }); } show('generosidade', false, false); const t = content.querySelector('#gift-step-title'); if (t) t.focus({preventScroll:true});  return; }
    if (action.id === 'church-pix-copy') { const label = action.querySelector('span'); const done = () => { label.textContent = 'Código copiado!'; action.classList.add('is-copied'); announce('Código Pix da igreja copiado. Cole no app do seu banco e informe o valor.','success',false); setTimeout(() => { label.textContent = 'Copiar código Pix'; action.classList.remove('is-copied'); }, 2200); }; if (navigator.clipboard) navigator.clipboard.writeText(NibPix.brCode()).then(done, done); else done(); return; }
    if (action.id === 'pix-copy') { const code = content.querySelector('#pix-code').value; const ok = () => { action.querySelector('span').textContent = 'Copiado'; announce('Código Pix copiado. Cole no app do seu banco.','success',false); }; if (navigator.clipboard) navigator.clipboard.writeText(code).then(ok, ok); else ok(); return; }
    if (action.dataset.gift) { state.gift = action.dataset.gift; state.giftStep = 'finalidade'; show('generosidade', false, false); content.querySelector('[data-gift="' + state.gift + '"]').focus({preventScroll:true}); return; }
  });
  root.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    if (isManagement() && admin.submit(form, values)) return;
    if (form.id === 'profile-form') {
      const email = String(values.get('email')).trim();
      const changes = [['Nome', 'newName'], ['E-mail', 'newEmail'], ['Telefone', 'newPhone'], ['Endereço', 'newAddress']].map(([label,key]) => { const value = String(values.get(key) || '').trim(); return value ? label + ': ' + value : ''; }).filter(Boolean);
      const observation = String(values.get('note')).trim();
      if (observation) changes.push('Observação: ' + observation);
      const note = changes.join(' · ');
      if (!note) return announce('Preencha ao menos um dado para atualização ou descreva outra alteração.','warning');
      admin.addRequest({ name: state.member.full, email, note });
      announce('Solicitação enviada à Secretaria (teste). Ela aparece no perfil Secretaria, em Cadastros.','success');
      form.reset();
    }
    if (form.id === 'notebook-form') {
      const name=String(values.get('name')||'').trim(); const reason=String(values.get('reason')||'').trim();
      if(!name||!reason) return announce('Informe a pessoa ou título e o motivo da oração.','warning');
      if(NibModeration.offensive(name+' '+reason)) { form.querySelector('#notebook-reason').setAttribute('aria-invalid','true'); return announce('Seu pedido tem palavras ofensivas ou de baixo calão. Revise o texto para publicar no caderno.','warning'); }
      form.querySelector('#notebook-reason').removeAttribute('aria-invalid');
      state.prayers.push({id:String(++notebookSequence),name:name.slice(0,120),reason:reason.slice(0,1000),author:state.member.full,answered:false,supporters:0,supported:false,own:true});
      show('caderno',false,false); content.querySelector('#notebook-name').focus({preventScroll:true}); announce('Pedido publicado apenas neste mural de teste. Não foi compartilhado com outros usuários.','success',false);
    }
    if (form.id === 'gift-form') {
      const amount = Number(String(values.get('amount')).replace(',','.'));
      if (!(amount >= 1 && amount <= 1000000)) return announce('Informe um valor a partir de R$ 1,00.','warning');
      state.giftAmount = Math.round(amount*100)/100; state.giftStep = 'confirmar'; show('generosidade', false, false); content.querySelector('#gift-step-title').focus({preventScroll:true}); return;
    }
  });
  function changeContext(event) {
    viewHistory.length = 0;
    state.context = event.target.value;
    document.getElementById('account').textContent = state.context === 'membro' ? state.member.full + ' · Membro' : (state.context === 'secretaria' ? 'Secretaria da igreja · Teste' : 'Liderança Pastoral · Teste');
    show(isManagement() ? 'gestao' : 'inicio');
    refreshNotices();
    document.querySelector('.test-options').open = false;
    document.getElementById('demo-context').value = state.context;
    document.getElementById('demo-context-mobile').value = state.context;
  }
  document.getElementById('demo-context').addEventListener('change', changeContext);
  document.getElementById('demo-context-mobile').addEventListener('change', changeContext);
  document.getElementById('sidebar-toggle').addEventListener('click', event => {
    const collapsed = root.classList.toggle('nib-sidebar-collapsed');
    event.currentTarget.setAttribute('aria-expanded', String(!collapsed));
    event.currentTarget.setAttribute('aria-label', collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral');
  });
  root.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const openMenu = event.target.closest('details[open]');
    if (openMenu) { openMenu.open = false; openMenu.querySelector('summary').focus(); }
  });
  root.addEventListener('pointerdown',()=>root.classList.remove('keyboard-navigation'));
  root.addEventListener('keydown',e=>{if(['Tab','Enter',' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) root.classList.add('keyboard-navigation');});
  const drawer = document.getElementById('mobile-drawer');
  const notices = document.getElementById('notices-dialog');
  notices.addEventListener('close', () => { if (!drawer.open) root.classList.remove('nib-dialog-open'); });
  notices.addEventListener('click', e => { if (e.target !== notices) return; const r = notices.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) notices.close(); });
  function unreadNotices() { return Math.max(0, admin.noticesCount() - (state.noticesSeen || 0)); }
  function markNoticesSeen() { if (isManagement()) return; state.noticesSeen = admin.noticesCount(); refreshNotices(); }
  function refreshNotices() {
    const empty = notices.querySelector('.notices-empty');
    let feed = notices.querySelector('.notices-feed');
    if (!feed) { feed = document.createElement('div'); feed.className = 'notices-feed'; empty.after(feed); }
    const html = admin.memberNotices();
    feed.innerHTML = html; feed.hidden = !html; empty.hidden = !!html;
    document.getElementById('header-notices').classList.toggle('has-unread', unreadNotices() > 0 && !isManagement());
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
  setInterval(refreshDailyDate, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDailyDate(); });
  document.getElementById('demo-context').value = 'membro';
  show('inicio', false);
  // Fluxo de entrada de teste: abertura → acesso (entrar ou criar cadastro) → orientação → inicial.
  // Nada é enviado: a CSP bloqueia conexões e os dados ficam só na memória desta aba.
  const auth = document.getElementById('app-auth');
  const onboarding = document.getElementById('app-onboarding');
  const appParts = [root.querySelector(':scope > header'), root.querySelector(':scope > .layout'), document.getElementById('bottom-nav')];
  const readFlag = key => { try { return sessionStorage.getItem(key) === '1'; } catch (_) { return false; } };
  const writeFlag = (key, on) => { try { on ? sessionStorage.setItem(key,'1') : sessionStorage.removeItem(key); } catch (_) {} };
  const gate = on => { root.classList.toggle('nib-gated', on); appParts.forEach(el => { if (el) el.inert = on; }); };
  function openAuth() { gate(true); onboarding.hidden = true; auth.hidden = false; auth.scrollTop = 0; setTab('login', false); requestAnimationFrame(() => document.getElementById('auth-title').focus({preventScroll:true})); }
  function setTab(which, focus = true) {
    const login = which === 'login';
    const tl = document.getElementById('tab-login'), ts = document.getElementById('tab-signup');
    tl.setAttribute('aria-selected', String(login)); ts.setAttribute('aria-selected', String(!login));
    tl.tabIndex = login ? 0 : -1; ts.tabIndex = login ? -1 : 0;
    document.getElementById('panel-login').hidden = !login; document.getElementById('panel-signup').hidden = login;
    auth.querySelectorAll('.auth-error').forEach(e => { e.textContent = ''; });
    if (focus) (login ? tl : ts).focus();
  }
  auth.querySelector('.auth-tabs').addEventListener('click', e => { const t = e.target.closest('[role=tab]'); if (t) setTab(t.id === 'tab-login' ? 'login' : 'signup'); });
  auth.querySelector('.auth-tabs').addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); setTab(document.getElementById('tab-login').getAttribute('aria-selected') === 'true' ? 'signup' : 'login'); } });
  auth.addEventListener('click', e => {
    const eye = e.target.closest('[data-toggle-pass]');
    if (eye) { const input = document.getElementById(eye.dataset.togglePass); const show = input.type === 'password'; input.type = show ? 'text' : 'password'; eye.setAttribute('aria-pressed', String(show)); eye.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha'); return; }
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
  auth.addEventListener('input', e => { const field = e.target.closest('input'); if (!field) return; field.removeAttribute('aria-invalid'); const err = field.form && field.form.querySelector('.auth-error'); if (err) err.textContent = ''; });
  document.getElementById('panel-signup').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget; const f = form.elements;
    const name = f.nome.value.trim().replace(/\s+/g,' ');
    const checks = [
      [f.nome, name.split(' ').length < 2, 'Escreva seu nome e sobrenome.'],
      [f.celular, f.celular.value.replace(/\D/g,'').length < 10, 'Informe um celular com DDD.'],
      [f.email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()), 'Informe um e-mail válido.'],
      [f.senha, !passRules(f.senha.value).every(Boolean), 'A senha ainda não atende a todos os critérios.'],
      [f.senha2, f.senha2.value !== f.senha.value || !f.senha2.value, 'As senhas não são iguais.'],
      [document.getElementById('signup-consent'), !document.getElementById('signup-consent').checked, 'Para continuar, aceite a política de privacidade.']
    ];
    checks.forEach(([el,bad]) => mark(el,bad));
    const first = checks.find(c => c[1]);
    if (first) return fail(form, 'signup-error', first[2]);
    const full = name.slice(0,80);
    state.member = { first: full.split(' ')[0], full, email: f.email.value.trim().slice(0,80) };
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
    writeFlag('nib-onboarded', true);
    window.scrollTo(0,0);
    const done = () => { enter.hidden = true; gate(false); document.getElementById('heading').focus({preventScroll:true}); };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !enter.animate) { onboarding.hidden = true; done(); return; }
    // Acabamento contido: o brasão assenta com desaceleração longa, um reflexo de luz atravessa
    // o desenho e a tela se dissolve sobre a inicial, que sobe de leve. Só transform e opacity.
    enter.hidden = false;
    const mark = enter.querySelector('.enter-mark'), shine = enter.querySelector('.enter-shine'), halo = enter.querySelector('.enter-halo');
    const T = 2600, settle = 'cubic-bezier(.16,1,.3,1)', soft = 'cubic-bezier(.65,0,.35,1)';
    const parts = appParts.filter(Boolean);
    enter.animate([{opacity:0},{opacity:1}], {duration:360, easing:'cubic-bezier(.33,1,.68,1)', fill:'forwards'}).finished.then(() => {
      // Troca de telas enquanto tudo está coberto, para o trabalho de layout não cair no meio da animação.
      onboarding.hidden = true; gate(false); parts.forEach(el => { el.inert = true; });
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
  document.getElementById('onb-skip').addEventListener('click', closeOnboarding);
  onboarding.addEventListener('keydown', e => { if (e.key === 'ArrowRight') goSlide(slide + 1); if (e.key === 'ArrowLeft') goSlide(slide - 1); if (e.key === 'Escape') closeOnboarding(); });
  document.getElementById('replay-flow').addEventListener('click', () => { document.querySelector('.test-options').open = false; writeFlag('nib-auth', false); writeFlag('nib-faceid', false); ['panel-login','panel-signup'].forEach(id => document.getElementById(id).reset()); openAuth(); });
  // Abertura: aparece ao abrir o aplicativo, antes do acesso; some sozinha ou ao toque.
  const splash = document.getElementById('app-splash');
  const afterSplash = () => { if (!readFlag('nib-auth')) openAuth(); };
  if (splash) {
    let seen = false;
    try { seen = sessionStorage.getItem('nib-splash') === '1'; sessionStorage.setItem('nib-splash','1'); } catch (_) {}
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = () => { if (splash.hidden || splash.classList.contains('is-leaving')) return; if (!readFlag('nib-auth')) openAuth(); else gate(false); splash.classList.add('is-leaving'); setTimeout(() => { splash.hidden = true; }, reduced ? 0 : 500); };
    if (seen) { splash.hidden = true; afterSplash(); }
    else {
      gate(true);
      splash.querySelectorAll('[data-letters]').forEach(el => { const chars = [...el.textContent]; el.textContent = ''; chars.forEach((c,i) => { const ch = document.createElement('span'); ch.className = 'ch'; ch.textContent = c; ch.style.setProperty('--i', i); el.append(ch); }); });
      if (reduced) splash.querySelector('.splash-logo').src = 'assets/splash-logo-final.png';
      splash.classList.add('is-playing'); splash.addEventListener('click', finish); setTimeout(finish, reduced ? 1200 : 4500);
    }
  } else afterSplash();
})();
