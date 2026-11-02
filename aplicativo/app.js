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
    {id:'exemplo-2',author:'Ana Exemplo',name:'Gratidão por uma nova etapa',reason:'Exemplo de oração marcada como atendida por quem publicou.',answered:true,supporters:0,supported:false,own:true}
  ];
  const state = { context: 'membro', view: 'inicio', request: null, presented: null, gift: 'Dízimo', calendarMonth: NibDaily.dayKey(new Date()).slice(0,7), calendarDay: NibDaily.dayKey(new Date()), prayers: demoPrayers() };
  const navigation = [['inicio', 'Início'], ['cadastro', 'Meu cadastro'], ['eventos', 'Eventos'], ['celulas', 'Células'], ['generosidade', 'Generosidade'], ['informacoes', 'Informações'], ['agenda', 'Agenda'], ['oracao', 'Pedido de oração'], ['caderno', 'Caderno de oração']];
  const labels = { caderno: ['VIDA DE ORAÇÃO', 'Caderno de oração', 'Uma comunidade que cuida e ora em conjunto.'], oracao: ['CUIDADO E COMUNHÃO', 'Pedido de oração', 'Um espaço para compartilhar o que está no seu coração.'], agenda: ['VIDA NA IGREJA', 'Agenda da igreja', 'Cultos, encontros e próximos eventos em um só lugar.'], inicio: ['SEJA BEM-VINDA', 'Olá, Ana! Você está na plataforma Nib.', 'Acesse seu cadastro, encontre eventos, contribua e acompanhe a vida da igreja.'], cadastro: ['MINHAS INFORMAÇÕES', 'Meu cadastro', 'Consulte seus dados e encaminhe uma atualização à equipe.'], eventos: ['VIDA EM COMUNIDADE', 'Eventos e inscrições', 'Encontre os próximos encontros da igreja.'], celulas: ['CAMINHAR JUNTOS', 'Células', 'Acesse a plataforma de células adotada pela igreja.'], generosidade: ['CONTRIBUIR', 'Generosidade', 'Dízimos, ofertas e campanhas em um só lugar.'], informacoes: ['FIQUE POR PERTO', 'Informações da igreja', 'Programação, endereço e canais da comunidade.'], gestao: ['ADMINISTRAÇÃO', 'Integração e membresia', 'Acompanhe o formulário, a reunião e a apresentação no culto.'], confirmar: ['MEMBRESIA', 'Registrar apresentação', 'O registro documenta a apresentação já realizada no culto.'] };
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const button = (text, view, primary = false) => `<button type="button" class="button ${primary ? 'action primary' : ''}" data-view="${view}">${text}</button>`;
  // Ícones reaproveitados da função icon() do painel; sem ícones nas ações.
  const iconPaths = { heart: 'M12 20s-8-4.7-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.3-8 10-8 10z', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6', grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z', calendar: 'M4 5h16v16H4z M8 3v4 M16 3v4 M4 11h16', receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6', archive: 'M3 4h18v5H3z M5 9v12h14V9 M10 13h4' };
  const navIcon = key => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${iconPaths[({ inicio: 'grid', cadastro: 'user', eventos: 'calendar', celulas: 'grid', generosidade: 'heart', informacoes: 'archive', gestao: 'grid', agenda: 'calendar', oracao: 'heart', caderno: 'receipt' })[key]]}"/></svg>`;
  const events = [
    { name: 'Mulheres Virtuosas', image: 'assets/mulheres.webp', date: '30/10/2026', active: false },
    { name: 'NXT CAMP', image: 'assets/nxt.png', date: '21/11/2026', active: true },
    { name: 'Jornada DNA', image: 'assets/jornada.webp', date: '25/10/2026', active: false }
  ];
  const eventCards = (compact = false) => `<div class="cards ${compact ? 'home-events' : ''}">${[...events].filter(e => !compact || e.active).sort((a,b) => Number(b.active) - Number(a.active)).map(e => `<article class="event ${e.name === 'Mulheres Virtuosas' ? 'event-mulheres-virtuosas' : ''} ${e.active ? '' : 'event-ended'}"><div class="event-cover"><img src="${e.image}" alt="${e.name}" width="800" height="400"></div><div class="event-content"><div class="event-top"><span class="tag ${e.active ? 'status-active' : 'status-ended'}">${e.active ? 'Ativo' : 'Encerrado'}</span><time class="event-date">${e.date}</time></div><${compact ? 'h3' : 'h2'}>${e.name}</${compact ? 'h3' : 'h2'}><p>${e.active ? 'Conheça o encontro e as informações do evento.' : 'Evento realizado. Consulte as informações.'}</p><button type="button" class="button primary" aria-label="Ver informações: ${e.name}" data-message="${e.name}: catálogo demonstrativo. A integração com as inscrições ainda será conectada; nenhum cadastro ou pagamento é realizado aqui.">Ver informações</button></div></article>`).join('')}</div>`;
  const isManagement = () => ['secretaria', 'pastoral'].includes(state.context);
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
  const barIcon = (key, selected = false) => selected
    ? `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="${barFilledPaths[key]}"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${barPaths[key]}"/></svg>`;
  function renderBar() {
    const bar = document.getElementById('bottom-nav');
    bar.hidden = isManagement();
    if (bar.hidden) return;
    if (!bar.children.length) bar.innerHTML = [['inicio','Início'],['agenda','Calendário'],['generosidade','Contribuir'],['eventos','Eventos'],['celulas','Células']].map(([view,label]) => `<a href="#${view}" data-view="${view}" class="${view === 'generosidade' ? 'bar-main' : ''}"><span class="bar-icon">${barIcon(view)}</span><span>${label}</span></a>`).join('');
    bar.querySelectorAll('a').forEach(a => {
      const active = a.dataset.view === state.view;
      if (active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
      a.querySelector('.bar-icon').innerHTML = barIcon(a.dataset.view, active);
    });
  }
  function dailyBlocks(full = false, part = 'all') {
    const key = NibDaily.dayKey(new Date());
    const verse = NibDaily.verseForDay(key);
    const clock = new Intl.DateTimeFormat('en-GB',{timeZone:'America/Porto_Velho',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
    const items = NibDaily.agenda(key).filter(item => item.day > key || !item.time || item.time >= clock);
    const list = (full ? items : items.slice(0,3)).map(item => {
      const date = new Date(item.day+'T12:00:00-04:00');
      const day = new Intl.DateTimeFormat('pt-BR',{day:'2-digit',timeZone:'America/Porto_Velho'}).format(date);
      const month = new Intl.DateTimeFormat('pt-BR',{month:'short',timeZone:'America/Porto_Velho'}).format(date);
      return `<li><span class="agenda-date"><strong>${day}</strong><small>${month}</small></span><div><span class="agenda-type">${item.type}</span><h3>${item.name}</h3><p>${new Intl.DateTimeFormat('pt-BR',{weekday:'long',timeZone:'America/Porto_Velho'}).format(date)}${item.time ? ' · '+item.time : ' · horário a confirmar'}</p></div></li>`;
    }).join('');
    const agenda = `<section class="home-agenda box" aria-labelledby="agenda-title"><div class="agenda-heading"><div><span class="label">CAMINHE COM A GENTE</span><h2 id="agenda-title">${full ? 'Próximos encontros' : 'Na agenda da igreja'}</h2></div>${full ? '' : button('Ver calendário completo','agenda')}</div><ul class="agenda-list">${list}</ul><p class="note">Programação de referência do site da igreja, ainda sem sincronização. Confirme mudanças com a igreja.${full ? ' Novas festividades aparecerão após o cadastro pela equipe.' : ''}</p></section>`;
    const verseBlock = `<section class="daily-verse" aria-label="Versículo do dia"><span class="label">PALAVRA PARA O SEU DIA</span><blockquote>“${verse[0]}”</blockquote><cite>${verse[1]}</cite></section>`;
    return full || part === 'agenda' ? agenda : part === 'verse' ? verseBlock : verseBlock + agenda;
  }
  const fullDate = key => new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(new Date(key+'T12:00:00-04:00'));
  const calendarKinds = {culto:'Cultos',escola:'Escola bíblica',evento:'Eventos'};
  const calendarKind = item => item.type==='Culto'?'culto':item.type==='Programação semanal'?'escola':'evento';
  const calendarDot = kind => `<i class="calendar-dot" data-kind="${kind}" aria-hidden="true"></i>`;
  function calendarAnnouncement() { const items=NibDaily.monthAgenda(state.calendarMonth).filter(x=>x.day===state.calendarDay); return fullDate(state.calendarDay)+': '+(items.length?items.length+' encontro(s). '+items.map(x=>x.name+', '+(x.time||'horário a confirmar')).join('. '):'Nenhum encontro de referência.'); }
  function calendarPage() {
    const month = state.calendarMonth;
    const {count,offset} = NibDaily.monthInfo(month);
    const items = NibDaily.monthAgenda(month);
    const today = NibDaily.dayKey(new Date());
    const title = new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric',timeZone:'America/Porto_Velho'}).format(new Date(month+'-01T12:00:00-04:00'));
    const cells = Array.from({length:offset},()=>'<span aria-hidden="true"></span>').join('') + Array.from({length:count},(_,i)=>{
      const day = month+'-'+String(i+1).padStart(2,'0');
      const entries = items.filter(x=>x.day===day);
      return `<button type="button" class="calendar-day" data-day="${day}" aria-pressed="${day===state.calendarDay}" ${day===today?'aria-current="date"':''} aria-label="${fullDate(day)} · ${entries.length ? entries.length+' encontro(s)' : 'Sem encontros'}"><span>${i+1}</span>${entries.length?'<span class="calendar-dots" aria-hidden="true">'+[...new Set(entries.map(calendarKind))].map(calendarDot).join('')+'</span>':''}</button>`;
    }).join('');
    const selected = items.filter(x=>x.day===state.calendarDay);
    return `<section class="box calendar-box" aria-label="Calendário mensal"><div class="calendar-toolbar"><button type="button" data-month="-1" aria-label="Mês anterior">‹</button><div><h2>${title.charAt(0).toUpperCase()+title.slice(1)}</h2><p>Toque em uma data para ver os encontros</p></div><button type="button" data-month="1" aria-label="Próximo mês">›</button></div><div class="calendar-week" aria-hidden="true">${['S','T','Q','Q','S','S','D'].map(x=>'<span>'+x+'</span>').join('')}</div><div class="calendar-grid">${cells}</div><div class="calendar-legend">${Object.entries(calendarKinds).map(([key,name])=>'<span>'+calendarDot(key)+name+'</span>').join('')}<span>Contorno: hoje</span><button type="button" id="calendar-today">Hoje</button></div></section><section class="box calendar-selection"><span class="label">${state.calendarDay===today?'HOJE':'DIA SELECIONADO'}</span><h2>${fullDate(state.calendarDay)}</h2>${selected.length?'<ul class="day-entries">'+selected.map(x=>`<li><time>${x.time||'A confirmar'}</time><div><strong>${x.name}</strong><p class="calendar-entry-kind">${calendarDot(calendarKind(x))}${x.type}</p></div></li>`).join('')+'</ul>':'<p>Nenhum encontro de referência para esta data.</p>'}</section><p class="note">Programação de referência do site da igreja, ainda sem sincronização; as recorrências não representam histórico de encontros realizados. Confirme mudanças com a igreja. Festividades aparecerão após o cadastro pela equipe.</p>`;
  }
  function prayerCards(compact=false) {
    return [...state.prayers].reverse().slice(0,compact?2:state.prayers.length).map(p=>`<article class="prayer-post" data-post="${p.id}"><div class="prayer-post-author"><span class="profile-avatar" aria-hidden="true">${escape(p.author.charAt(0))}</span><div><strong>${escape(p.author)}</strong><small>Pedido fictício · Demonstração</small></div>${p.answered?'<span class="tag">Oração atendida</span>':''}</div><h3>${escape(p.name)}</h3><p class="prayer-reason">${escape(p.reason)}</p><div class="prayer-post-footer"><button type="button" class="prayer-support" data-prayer-support="${p.id}" aria-pressed="${p.supported}" aria-label="Estou orando por: ${escape(p.name)}">${navIcon('oracao')}<span>Estou orando</span><strong class="support-count" aria-live="polite">${p.supporters}</strong></button><span class="prayer-support-caption">${p.supporters===1?'pessoa orando':'pessoas orando'}</span></div>${!compact&&p.own?'<div class="form-actions prayer-own-actions"><button type="button" data-prayer-toggle="'+p.id+'" aria-label="'+(p.answered?'Marcar em oração':'Marcar como atendida')+': '+escape(p.name)+'">'+(p.answered?'Marcar em oração':'Oração atendida')+'</button><button type="button" data-prayer-delete="'+p.id+'" aria-label="Excluir pedido: '+escape(p.name)+'">Excluir</button></div>':''}</article>`).join('');
  }
  function communityBlock() {
    return `<section class="community-prayer" aria-labelledby="community-prayer-title"><div class="section-heading"><div><span class="label">CUIDADO EM COMUNIDADE</span><h2 id="community-prayer-title">Caderno de oração</h2></div>${button('Ver caderno','caderno')}</div><p>Vamos orar uns pelos outros.</p><div class="prayer-feed">${prayerCards(true)}</div><p class="note">Mural demonstrativo com pedidos fictícios. O contador representa pessoas orando. Ainda sem compartilhamento entre usuários.</p></section>`;
  }
  function notebookPage() {
    return `<section class="box prayer-box"><h2>Compartilhe um pedido com a comunidade</h2><p>No mural, cada pessoa poderá conhecer os pedidos e sinalizar “Estou orando”. A indicação de oração atendida é feita por quem publicou.</p><p class="note">Preview com dados fictícios: nenhuma publicação é enviada à igreja ou compartilhada entre usuários. Os testes ficam só nesta aba e reiniciam ao recarregar ou trocar o perfil.</p><form id="notebook-form" autocomplete="off"><label for="notebook-name">Título do pedido</label><input id="notebook-name" name="name" maxlength="120" required placeholder="Ex.: Pela Família Exemplo" autocomplete="off"><label for="notebook-reason">O que você deseja compartilhar?</label><textarea id="notebook-reason" name="reason" maxlength="1000" required autocomplete="off" placeholder="Escreva um pedido fictício para o mural."></textarea><p class="note">Na versão compartilhada, o pedido será visível à comunidade. Evite expor dados pessoais de outras pessoas.</p><div class="form-actions"><button type="submit" class="action">Publicar pedido de teste</button><button type="reset">Limpar</button></div></form></section><section class="community-prayer" aria-labelledby="prayer-feed-title"><div class="section-heading"><h2 id="prayer-feed-title" tabindex="-1">Orando em comunidade</h2><span class="note">${state.prayers.length} pedidos de exemplo</span></div><div class="prayer-feed">${prayerCards()||'<p>Nenhum pedido neste mural de teste.</p>'}</div></section>`;
  }
  function announce(message, tone = 'info', reveal = true) { feedback.dataset.tone=tone; feedback.textContent = message; if(reveal) feedback.scrollIntoView({block:"nearest",behavior:"instant"}); }
  function renderNavigation() {
    const items = isManagement() ? [['gestao', 'Membresia'], ['informacoes', 'Informações']] : navigation;
    const context = isManagement() ? 'gestao' : 'membro';
    for (const nav of [document.getElementById('navigation'), document.getElementById('mobile-navigation')]) {
      if (nav.dataset.context !== context) {
        if (nav.id === 'navigation') nav.innerHTML = items.map(([key,label]) => `<a href="#${key}" data-view="${key}" aria-label="${label}">${navIcon(key)}<span>${label}</span></a>`).join('');
        else {
          const descriptions = {inicio:'Seu ponto de partida',cadastro:'Dados e atualizações',eventos:'Encontros e inscrições',generosidade:'Dízimos, ofertas e campanhas',celulas:'Acesso à plataforma',informacoes:'Programação e avisos',gestao:'Integração e apresentações',agenda:'Cultos, eventos e festividades',oracao:'Compartilhe seu pedido',caderno:'Ore com a comunidade'};
          const groups = isManagement() ? [['Gestão',items]] : [['Seu acesso',items.filter(([key])=>['inicio','cadastro'].includes(key))],['Vida na igreja',items.filter(([key])=>['agenda','eventos','generosidade','celulas','informacoes','oracao','caderno'].includes(key))]];
          nav.innerHTML = groups.map(([label,links],index) => `<section class="menu-group" aria-labelledby="menu-group-${index}"><h3 id="menu-group-${index}">${label}</h3><div class="menu-grid">${links.map(([key,title])=>`<a href="#${key}" data-view="${key}" aria-label="${title}"><span class="menu-icon">${navIcon(key)}</span><strong>${title}</strong><span class="menu-description">${descriptions[key]}</span><span class="mobile-current" hidden>Atual</span></a>`).join('')}</div></section>`).join('');
        }
        nav.dataset.context = context;
      }
      nav.querySelectorAll('a').forEach(item => {
      const active = state.view === item.dataset.view || (item.dataset.view === 'gestao' && state.view === 'confirmar');
      item.classList.toggle('selected', active);
      const current = item.querySelector('.mobile-current');
      if (current) current.hidden = !active;
      if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
      });
    }
    document.getElementById('member-shortcuts').hidden = isManagement();
    document.getElementById('menu-profile').innerHTML = isManagement() ? '<div class="menu-profile-card"><strong>' + (state.context === 'secretaria' ? 'Secretaria da igreja' : 'Liderança Pastoral') + '</strong><span>Experiência de teste</span></div>' : '<a class="menu-profile-card" href="#cadastro" data-view="cadastro"><span class="profile-avatar" aria-hidden="true">A</span><span><strong>Ana Exemplo</strong><small>ana@example.com</small></span><span class="profile-demo">Teste</span></a>';
    renderBar();
  }
  function show(view, focus = true, record = true) {
    if (isManagement() && !['gestao','confirmar','informacoes'].includes(view)) view = 'gestao';
    if (['gestao', 'confirmar'].includes(view) && !isManagement()) view = 'inicio';
    if (record && focus && view !== state.view) viewHistory.push(state.view);
    state.view = labels[view] ? view : 'inicio';
    root.dataset.view = state.view;
    document.getElementById('mobile-return').hidden = state.view === 'inicio' || (isManagement() && state.view === 'gestao');
    const [eyebrow, title, description] = labels[state.view];
    document.getElementById('eyebrow').textContent = eyebrow;
    document.getElementById('heading').textContent = title;
    document.getElementById('description').textContent = description;
    feedback.textContent = ''; feedback.dataset.tone='info';
    const pages = {
      inicio: () => `${dailyBlocks(false,'verse')}<section aria-labelledby="quick-title"><div class="section-heading"><h2 id="quick-title">O que você precisa está aqui</h2></div><div class="quick-actions">${[
        ['cadastro', 'Meu cadastro', 'Consulte seus dados e solicite uma atualização.'],
        ['eventos', 'Eventos e inscrições', 'Veja os encontros e acompanhe suas inscrições.'],
        ['generosidade', 'Dízimos e ofertas', 'Encontre as opções para contribuir e as campanhas.'],
        ['celulas', 'Células', 'Saiba como acessar a plataforma de células.'],
        ['informacoes', 'Programação e avisos', 'Consulte as informações e os canais da igreja.'],
        ['oracao', 'Pedido de oração', 'Um espaço de cuidado e oração.']
      ].map(([view, title, text]) => `<button type="button" class="quick-action" data-view="${view}"><span class="home-action-icon" aria-hidden="true">${navIcon(view)}</span><strong>${title}</strong><span class="home-action-description">${text}</span></button>`).join('')}</div></section>${dailyBlocks(false,'agenda')}${communityBlock()}<section aria-labelledby="home-events-title"><div class="section-heading"><h2 id="home-events-title">Eventos da igreja</h2>${button('Ver todos', 'eventos')}</div>${eventCards(true)}</section>`,
      oracao: () => `<section class="box prayer-box"><div class="section-heading"><h2>Como podemos orar por você?</h2>${button('Caderno da comunidade','caderno')}</div><p>Esta tela demonstra o envio de um pedido à igreja. Use apenas um exemplo fictício: nenhum pedido é enviado ou salvo.</p><form id="prayer-form"><label for="prayer-note">Seu pedido</label><textarea id="prayer-note" name="prayer" autocomplete="off" placeholder="Escreva um pedido fictício para experimentar." maxlength="1000" required></textarea><div class="form-actions"><button type="submit" class="action">Enviar pedido de teste</button><button type="reset">Limpar</button></div></form><p class="note">O teste não envia o pedido à igreja e não o salva. O canal de recebimento e quem poderá ler os pedidos ainda serão definidos.</p></section>`,
      agenda: () => calendarPage(),
      caderno: () => notebookPage(),
      cadastro: () => `<div class="profile-layout"><section class="box profile-summary"><span class="tag">Membro · exemplo</span><h2>Ana Exemplo</h2><p>Confira seu cadastro na igreja.</p><dl class="profile"><dt>E-mail</dt><dd>ana@example.com</dd><dt>Telefone</dt><dd>Não informado</dd><dt>Endereço</dt><dd>Não informado</dd><dt>Apresentação no culto</dt><dd>Apresentação registrada · exemplo</dd></dl><p class="note">As alterações são encaminhadas para conferência da Secretaria.</p></section><section class="box profile-edit"><h2>O que você deseja atualizar?</h2><p>Preencha somente os dados que precisam mudar.</p><form id="profile-form"><fieldset><legend>Dados para atualização</legend><div class="form-grid"><div><label for="new-name">Nome completo</label><input id="new-name" name="newName" autocomplete="off" placeholder="Informe o nome corrigido" maxlength="160"></div><div><label for="new-email">Novo e-mail</label><input id="new-email" name="newEmail" type="email" autocomplete="off" placeholder="nome@exemplo.com" maxlength="160"></div><div><label for="new-phone">Novo telefone / WhatsApp</label><input id="new-phone" name="newPhone" type="tel" inputmode="tel" autocomplete="off" placeholder="(69) 99999-9999" maxlength="25"></div><div><label for="new-address">Endereço</label><input id="new-address" name="newAddress" autocomplete="off" placeholder="Rua, número, bairro e cidade" maxlength="250"></div></div></fieldset><fieldset><legend>Contato e observações</legend><label for="contact-email">E-mail para retorno</label><input id="contact-email" name="email" type="email" autocomplete="off" placeholder="exemplo@example.com" maxlength="160" required><label for="contact-note">Outra alteração ou observação (opcional)</label><textarea id="contact-note" name="note" placeholder="Descreva o que a Secretaria precisa conferir." maxlength="500"></textarea></fieldset><div class="form-actions"><button class="action" type="submit">Enviar solicitação de teste</button><button type="reset">Limpar alterações</button></div></form><p class="note">Use dados fictícios. A solicitação fica nesta sessão; nenhum cadastro real é alterado.</p></section></div>`,
      eventos: () => `${eventCards()}<section class="box event-follow-up"><h2>Minhas inscrições</h2><p>Nenhuma inscrição vinculada nesta demonstração.</p><p class="note">Inscrições anteriores não serão vinculadas automaticamente por nome ou telefone.</p></section>`,
      celulas: () => `<section class="box"><span class="label">PLATAFORMA EXTERNA</span><h2>Encontre sua comunidade</h2><p>A igreja utilizará uma plataforma de células pronta. O endereço de acesso será configurado após a definição da integração.</p><button type="button" disabled>Acesso em preparação</button><p class="note">A entrada sem um novo login depende do serviço externo.</p></section>`,
      generosidade: () => `<div class="gift-options" role="group" aria-label="Finalidade da contribuição">${['Dízimo', 'Oferta', 'Campanha'].map(name => `<button type="button" data-gift="${name}" aria-pressed="${state.gift === name}">${name === 'Campanha' ? 'Campanhas' : name + 's'}</button>`).join('')}</div><div class="giving-layout"><section class="box"><h2>${state.gift === 'Campanha' ? 'Campanhas da igreja' : state.gift}</h2>${state.gift === 'Campanha' ? '<p>Nenhuma campanha cadastrada nesta versão de teste.</p>' : '<p>Experimente a escolha do valor nesta demonstração.</p><form id="gift-form"><label for="gift-value">Valor da contribuição (R$)</label><input id="gift-value" name="amount" type="number" inputmode="decimal" min="0.01" max="1000000" step="0.01" placeholder="0,00" required><div class="form-actions"><button class="action" type="submit">Simular próximo passo</button></div></form>'}<p class="note">A simulação não gera cobrança, não confirma recebimento e não altera o QR Code ao lado.</p></section><section class="box giving-details"><h2>Dados da igreja</h2><p>Nova Igreja Batista · Ariquemes/RO</p><dl class="bank-details"><div><dt>Pix (CNPJ)</dt><dd>40.518.758/0001-30</dd></div><div><dt>Banco</dt><dd>Sicoob</dd></div><div><dt>Agência / Conta</dt><dd>3315 / 51.404-7</dd></div></dl><figure class="church-qr"><img src="assets/pix-qrcode.png" alt="QR Code Pix oficial da Nova Igreja Batista" width="220" height="220"><figcaption>O mesmo QR Code disponível no site da igreja.</figcaption></figure><p class="qr-warning">Dados e QR Code reais, exibidos como referência. Não efetue transferências durante os testes.</p></section></div>`,
      informacoes: () => `<section class="box"><h2>Programação e avisos</h2><p>Os horários e conteúdos oficiais serão incluídos pela igreja.</p></section><section class="box"><h2>Endereço e contato</h2><p>Os canais de atendimento serão configurados nesta área.</p></section>`,
      gestao: () => `<section class="box"><span class="label">PESSOA FICTÍCIA · NOVA INTEGRAÇÃO</span><h2>João Exemplo</h2><ul><li>Formulário de membros: registrado</li><li>Reunião de integração: registrada</li><li>Apresentação no culto: ${state.presented ? escape(state.presented.dateLabel) : 'a registrar'}</li></ul>${state.presented ? '<span class="tag">Membro · exemplo</span><p>Registro efetuado por ' + escape(state.presented.actor) + '.</p><p class="note">Registrado em ' + escape(state.presented.registeredAt) + ' · somente nesta sessão.</p>' : button('Revisar apresentação', 'confirmar', true)}</section><section class="box"><h2>Solicitações de atualização</h2>${state.request ? '<p>Solicitação demonstrativa de Ana Exemplo.</p><dl class="profile"><dt>Contato</dt><dd>' + escape(state.request.email) + '</dd><dt>Atualização solicitada</dt><dd>' + escape(state.request.note) + '</dd></dl>' : '<p>Nenhuma solicitação nesta sessão.</p>'}</section><p class="note">Secretaria da igreja e Liderança Pastoral podem confirmar o reconhecimento. Este seletor de demonstração não é autenticação ou controle de permissões.</p>`,
      confirmar: () => `<section class="box"><h2>João Exemplo</h2><p>Formulário e reunião de integração já registrados neste exemplo.</p><form id="membership-form"><label for="presented-date">Data da apresentação no culto</label><input id="presented-date" name="date" type="date" required><label class="check"><input name="confirm" type="checkbox" required><span>Confirmo que a pessoa foi apresentada à igreja no culto.</span></label><button type="submit" class="action">Confirmar registro de teste</button></form><p class="note">O reconhecimento decorre da apresentação. Esta confirmação registra o fato e seu responsável.</p>${button('Voltar à gestão', 'gestao')}</section>`
    };
    content.innerHTML = pages[state.view]();
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
    if (action.id === 'header-notices') { notices.showModal(); root.classList.add('nib-dialog-open'); document.getElementById('notices-close').focus(); return; }
    if (action.id === 'notices-close') { notices.close(); return; }
    if (action.id === 'header-menu') { document.querySelector('.test-options').open = false; drawer.showModal(); root.classList.add('nib-dialog-open'); action.setAttribute('aria-expanded','true'); document.getElementById('drawer-close').focus({preventScroll:true}); return; }
    if (action.id === 'drawer-close') { closeDrawer(); return; }
    if (action.id === 'mobile-back') { event.preventDefault(); show(viewHistory.pop() || (isManagement() ? 'gestao' : 'inicio'), true, false); return; }
    if (action.dataset.month) { state.calendarMonth=NibDaily.moveMonth(state.calendarMonth,Number(action.dataset.month)); state.calendarDay=state.calendarMonth+'-01'; show('agenda',false,false); content.querySelector('[data-month="'+action.dataset.month+'"]').focus({preventScroll:true}); feedback.textContent=content.querySelector('.calendar-toolbar h2').textContent; return; }
    if (action.dataset.day) { state.calendarDay=action.dataset.day; show('agenda',false,false); content.querySelector('[data-day="'+state.calendarDay+'"]').focus({preventScroll:true}); feedback.textContent=calendarAnnouncement(); return; }
    if (action.id==='calendar-today') { state.calendarDay=NibDaily.dayKey(new Date()); state.calendarMonth=state.calendarDay.slice(0,7); show('agenda',false,false); content.querySelector('#calendar-today').focus({preventScroll:true}); feedback.textContent=calendarAnnouncement(); return; }
    if (action.dataset.prayerSupport) {
      const p=state.prayers.find(x=>x.id===action.dataset.prayerSupport); if(!p||isManagement()) return;
      p.supported=!p.supported; p.supporters+=p.supported?1:-1;
      action.setAttribute('aria-pressed',String(p.supported));
      action.querySelector('.support-count').textContent=p.supporters;
      action.parentElement.querySelector('.prayer-support-caption').textContent=p.supporters===1?'pessoa orando':'pessoas orando';
      return;
    }
    if (action.dataset.prayerToggle) { const p=state.prayers.find(x=>x.id===action.dataset.prayerToggle); if(!p||!p.own) return; p.answered=!p.answered; show('caderno',false,false); content.querySelector('[data-prayer-toggle="'+p.id+'"]').focus({preventScroll:true}); feedback.textContent=p.answered?'Oração marcada como atendida.':'Pedido marcado em oração.'; return; }
    if (action.dataset.prayerDelete) { const p=state.prayers.find(x=>x.id===action.dataset.prayerDelete); if(!p||!p.own) return; state.prayers=state.prayers.filter(x=>x.id!==p.id); show('caderno',false,false); content.querySelector('#prayer-feed-title').focus({preventScroll:true}); announce('Pedido removido do caderno de teste.','success',false); return; }
    if (action.dataset.view) { event.preventDefault(); show(action.dataset.view); }
    if (action.dataset.message) announce(action.dataset.message);
    if (action.dataset.gift) { state.gift = action.dataset.gift; show('generosidade', false); content.querySelector('[data-gift="' + state.gift + '"]').focus({preventScroll:true}); }
  });
  root.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    if (form.id === 'profile-form') {
      const email = String(values.get('email')).trim();
      const changes = [['Nome', 'newName'], ['E-mail', 'newEmail'], ['Telefone', 'newPhone'], ['Endereço', 'newAddress']].map(([label,key]) => { const value = String(values.get(key) || '').trim(); return value ? label + ': ' + value : ''; }).filter(Boolean);
      const observation = String(values.get('note')).trim();
      if (observation) changes.push('Observação: ' + observation);
      const note = changes.join(' · ');
      if (!note) return announce('Preencha ao menos um dado para atualização ou descreva outra alteração.','warning');
      state.request = { email, note };
      announce('Solicitação fictícia registrada nesta sessão. Você pode consultá-la na experiência de gestão.','success');
      form.reset();
    }
    if (form.id === 'notebook-form') {
      const name=String(values.get('name')||'').trim(); const reason=String(values.get('reason')||'').trim();
      if(!name||!reason) return announce('Informe a pessoa ou título e o motivo da oração.','warning');
      state.prayers.push({id:String(++notebookSequence),name:name.slice(0,120),reason:reason.slice(0,1000),author:'Ana Exemplo',answered:false,supporters:0,supported:false,own:true});
      show('caderno',false,false); content.querySelector('#notebook-name').focus({preventScroll:true}); announce('Pedido publicado apenas neste mural de teste. Não foi compartilhado com outros usuários.','success',false);
    }
    if (form.id === 'prayer-form') { if (!String(values.get('prayer') || '').trim()) return announce('Escreva um pedido fictício para testar.','warning'); form.reset(); announce('Teste concluído. Nenhum pedido foi enviado ou salvo.','success'); }
    if (form.id === 'gift-form') announce('Simulação concluída. Nenhuma cobrança foi criada ou contribuição recebida.','success');
    if (form.id === 'membership-form' && isManagement()) {
      const raw = String(values.get('date'));
      const date = new Date(raw + 'T12:00:00-04:00');
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Manaus', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      if (Number.isNaN(date.getTime()) || raw > today) return announce('Informe a data de uma apresentação já realizada.','warning');
      state.presented = { dateLabel: new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Manaus' }).format(date), actor: state.context === 'secretaria' ? 'Secretaria da igreja (teste)' : 'Liderança Pastoral (teste)', registeredAt: new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Manaus', dateStyle: 'short', timeStyle: 'short' }).format(new Date()) };
      show('gestao');
      announce('Apresentação registrada na demonstração. Nenhum membro real foi alterado.','success');
    }
  });
  function changeContext(event) {
    viewHistory.length = 0;
    state.context = event.target.value;
    state.prayers = demoPrayers(); // Caderno demonstrativo não é compartilhado entre experiências.
    document.getElementById('account').textContent = state.context === 'membro' ? 'Ana Exemplo · Membro' : (state.context === 'secretaria' ? 'Secretaria da igreja · Teste' : 'Liderança Pastoral · Teste');
    show(isManagement() ? 'gestao' : 'inicio');
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
    if (quote) { quote.textContent = '“'+verse[0]+'”'; content.querySelector('.daily-verse cite').textContent = verse[1]; }
  }
  refreshDailyDate();
  setInterval(refreshDailyDate, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDailyDate(); });
  document.getElementById('demo-context').value = 'membro';
  show('inicio', false);
})();
