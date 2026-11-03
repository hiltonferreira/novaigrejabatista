/* Área de gestão da Plataforma Nib: Secretaria da igreja e Liderança Pastoral.
   Versão de teste: dados fictícios, só na sessão, sem permissões de servidor.
   Regras de autoridade seguem o portal da igreja (docs/14-PERMISSOES-E-AUTORIDADE.md):
   a Liderança Pastoral decide; a Secretaria organiza e registra o que foi decidido. */
(function(scope){
  const now = () => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Porto_Velho', dateStyle: 'short', timeStyle: 'short' }).format(new Date());
  const dayNum = key => key.slice(8, 10);
  const monthShort = key => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Porto_Velho', month: 'short' }).format(new Date(key + 'T12:00:00-04:00')).replace('.', '');
  const tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  const chevron = '<svg class="admin-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';

  const profiles = {
    secretaria: {
      name: 'Secretaria da igreja', short: 'Secretaria',
      views: [['gestao', 'Painel'], ['membresia', 'Membresia'], ['solicitacoes', 'Cadastros'], ['programacao', 'Agenda'], ['comunicados', 'Avisos'], ['palavra', 'Palavra do dia'], ['cuidado', 'Caderno de oração'], ['informacoes', 'Informações']],
      bar: [['gestao', 'Painel'], ['membresia', 'Membresia'], ['solicitacoes', 'Cadastros'], ['programacao', 'Agenda'], ['comunicados', 'Avisos']]
    },
    pastoral: {
      name: 'Liderança Pastoral', short: 'Liderança Pastoral',
      views: [['gestao', 'Painel'], ['membresia', 'Membresia'], ['cuidado', 'Cuidado e oração'], ['palavra', 'Palavra do dia'], ['comunicados', 'Avisos'], ['solicitacoes', 'Cadastros'], ['informacoes', 'Informações']],
      bar: [['gestao', 'Painel'], ['membresia', 'Membresia'], ['cuidado', 'Cuidado'], ['palavra', 'Palavra'], ['comunicados', 'Avisos']]
    }
  };
  const labels = {
    gestao: ['ADMINISTRAÇÃO', 'Painel', 'O que precisa da sua atenção hoje.'],
    membresia: ['MEMBRESIA', 'Integração de novos membros', 'Acompanhe o formulário, a reunião de integração e a apresentação no culto.'],
    confirmar: ['MEMBRESIA', 'Registrar apresentação', 'O registro documenta a apresentação já realizada no culto.'],
    solicitacoes: ['CADASTROS', 'Solicitações de atualização', 'Pedidos enviados pelos membros em Meu cadastro.'],
    programacao: ['AGENDA DA IGREJA', 'Agenda e programação', 'O que você incluir aqui aparece no calendário dos membros.'],
    comunicados: ['COMUNICAÇÃO', 'Avisos para a igreja', 'Os avisos publicados chegam ao sino de avisos dos membros.'],
    palavra: ['PALAVRA DO DIA', 'Versículo do dia', 'Escolha o versículo de uma data. Sem escolha, vale a lista anual.'],
    cuidado: ['CUIDADO PASTORAL', 'Cuidado e oração', 'Acompanhe os pedidos do caderno de oração e cuide do mural.']
  };
  const descriptions = { gestao: 'O que precisa de atenção', membresia: 'Integração e apresentação', solicitacoes: 'Atualizações de cadastro', programacao: 'Calendário dos membros', comunicados: 'Avisos no sino do app', palavra: 'Versículo escolhido', cuidado: 'Pedidos de oração' };
  const icons = {
    gestao: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z',
    membresia: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21c0-3.5 3-6 7-6s7 2.5 7 6 M16 11l2 2 4-4',
    solicitacoes: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h5',
    programacao: 'M4 5h16v16H4z M8 3v4 M16 3v4 M4 11h16 M12 14v4 M10 16h4',
    comunicados: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
    palavra: 'M12 6.5C10.2 5 7.6 4.5 4 4.5v13c3.6 0 6.2.5 8 2 1.8-1.5 4.4-2 8-2v-13c-3.6 0-6.2.5-8 2Z M12 6.5v13',
    cuidado: 'M12 20s-8-4.7-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.3-8 10-8 10z',
    informacoes: 'M3 4h18v5H3z M5 9v12h14V9 M10 13h4'
  };

  function create(api) {
    const { state, escape, button, arrow } = api;
    const actor = () => profiles[state.context] ? profiles[state.context].name : '';
    const isSec = () => state.context === 'secretaria', isPas = () => state.context === 'pastoral';
    const svg = key => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[key]}"/></svg>`;

    // Dados fictícios desta sessão (compartilhados entre os perfis de teste).
    const data = {
      people: [
        { id: 'joao', name: 'João Exemplo', how: 'Veio pelo culto de domingo', steps: { form: { at: '20/10/2026', by: 'Secretaria da igreja' }, meeting: { at: '27/10/2026', by: 'Secretaria da igreja' }, presented: null } },
        { id: 'maria', name: 'Maria Exemplo', how: 'Indicada por uma célula', steps: { form: { at: '29/10/2026', by: 'Secretaria da igreja' }, meeting: null, presented: null } },
        { id: 'pedro', name: 'Pedro Exemplo', how: 'Pediu para ser membro', steps: { form: null, meeting: null, presented: null } }
      ],
      requests: [{ id: 'r1', name: 'Carlos Exemplo', email: 'carlos@example.com', note: 'Telefone: (69) 90000-0000', at: '02/11/2026 18:40', status: 'pendente' }],
      notices: [],
      verseLog: {},
      seq: 1
    };
    const stepNames = [['form', 'Formulário'], ['meeting', 'Reunião'], ['presented', 'Apresentação']];
    const pendingPeople = () => data.people.filter(p => !p.steps.presented);
    const pendingRequests = () => data.requests.filter(r => r.status === 'pendente');
    const activePrayers = () => state.prayers.filter(p => !p.answered && !p.hidden);

    const views = () => (profiles[state.context] || profiles.secretaria).views;
    const allowed = view => view === 'confirmar' ? true : views().some(([key]) => key === view);
    const pageLabels = view => {
      if (view === 'gestao') return ['ADMINISTRAÇÃO', isPas() ? 'Painel da Liderança Pastoral' : 'Painel da Secretaria', isPas() ? 'Acompanhe a membresia, o cuidado e a palavra da igreja.' : 'Cadastros, membresia, agenda e avisos em um só lugar.'];
      if (view === 'cuidado' && isSec()) return ['CADERNO DE ORAÇÃO', 'Caderno de oração', 'Veja os pedidos publicados pelos membros.'];
      return labels[view];
    };

    // ---------- Painel ----------
    function task(view, count, title, text, tone) {
      return `<button type="button" class="admin-task${tone ? ' is-' + tone : ''}" data-view="${view}"><span class="admin-task-icon" aria-hidden="true">${svg(view)}</span><span class="admin-task-text"><strong>${title}</strong><small>${text}</small></span>${count !== null ? `<span class="admin-count${count ? '' : ' is-zero'}">${count}</span>` : ''}${chevron}</button>`;
    }
    function panel() {
      const people = pendingPeople(), reqs = pendingRequests(), today = api.NibDaily.dayKey(new Date());
      const upcoming = api.NibDaily.agenda(today, 10).slice(0, 3);
      const verse = api.NibDaily.verseForDay(today);
      const counts = { solicitacoes: reqs.length, membresia: people.length, cuidado: activePrayers().length, comunicados: data.notices.length, programacao: api.NibDaily.addedItems().filter(x => !x.notice).length };
      const texts = {
        membresia: people.length ? `${people.length} ${people.length === 1 ? 'pessoa' : 'pessoas'} em integração. Registre a próxima etapa.` : 'Ninguém aguardando etapa.',
        solicitacoes: isSec() ? (reqs.length ? `${reqs.length} ${reqs.length === 1 ? 'pedido aguardando' : 'pedidos aguardando'} conferência.` : 'Nenhum pedido pendente.') : 'Acompanhe os pedidos enviados pelos membros.',
        programacao: 'Inclua cultos e eventos no calendário dos membros.',
        comunicados: 'Publique avisos no sino e em Programação e avisos.',
        palavra: (verse[2] ? 'Hoje: escolhido pela igreja · ' : 'Hoje: lista automática · ') + verse[1],
        cuidado: isPas() ? 'Acompanhe os pedidos e cuide do mural.' : 'Veja os pedidos publicados pelos membros.',
        informacoes: 'Veja a página Programação e avisos como os membros veem.'
      };
      const shortcuts = views().filter(([key]) => key !== 'gestao').map(([key, title]) => { const c = counts[key]; const alert = c && ['solicitacoes', 'membresia'].includes(key) && (key !== 'solicitacoes' || isSec()); return `<button type="button" class="quick-action admin-quick" data-view="${key}"><span class="home-action-icon" aria-hidden="true">${svg(key)}</span>${alert ? `<span class="admin-badge" aria-label="${c} pendente${c === 1 ? '' : 's'}">${c}</span>` : ''}<strong>${title}</strong><span class="home-action-description">${texts[key] || ''}</span></button>`; }).join('');
      const next = upcoming.map(x => `<li><span class="admin-when"><small>${escape(monthShort(x.day))}</small><strong>${dayNum(x.day)}</strong></span><span><b>${escape(x.name)}</b><small>${escape(x.type)} · ${x.time ? escape(x.time) : 'horário a definir'}</small></span></li>`).join('');
      return `<section aria-labelledby="admin-quick-title"><div class="section-heading"><div><span class="label">${escape(actor().toUpperCase())}</span><h2 id="admin-quick-title">O que você precisa está aqui</h2></div></div><p class="admin-rule">${isPas() ? 'A Liderança Pastoral decide. A Secretaria organiza e registra o que foi decidido.' : 'A Secretaria organiza e registra. Decisões pastorais ficam com a Liderança Pastoral.'}</p><div class="quick-actions">${shortcuts}</div></section>
      <div class="admin-grid"><section class="box"><div class="section-heading"><div><span class="label">PRÓXIMOS DIAS</span><h2>Na agenda</h2></div>${isSec() ? button('Gerenciar', 'programacao') : ''}</div><ul class="admin-upcoming">${next || '<li>Nenhum item nos próximos dias.</li>'}</ul></section>
      <section class="box"><span class="label">EVENTOS E INSCRIÇÕES</span><h2>Painel de inscrições</h2><p>As inscrições dos eventos continuam no painel do site, com login próprio.</p><a class="button button-go admin-external" href="https://novaigrejabatista.com.br/inscricoes/" target="_blank" rel="noopener"><span>Abrir painel de inscrições</span>${arrow}</a></section></div>
      <p class="note">Fora desta área: o financeiro (relatórios de contribuição) fica isolado, e as células usam a plataforma própria. O seletor de perfil desta versão de teste não é controle de acesso.</p>`;
    }

    // ---------- Membresia ----------
    function miniSteps(p) {
      const idx = stepNames.findIndex(([k]) => !p.steps[k]);
      const at = idx < 0 ? 3 : idx;
      return `<ol class="gift-steps admin-steps" aria-label="Etapas de ${escape(p.name)}">${stepNames.map(([k, label], i) => `<li class="${p.steps[k] ? 'is-done' : i === at ? 'is-current' : ''}"${i === at ? ' aria-current="step"' : ''}><span class="gift-dot">${p.steps[k] ? tick : '0' + (i + 1)}</span><span class="gift-step-label">${label}</span></li>`).join('')}</ol>`;
    }
    function personCard(p) {
      const nextKey = (stepNames.find(([k]) => !p.steps[k]) || [])[0];
      const action = !nextKey ? '' : nextKey === 'presented'
        ? `<button type="button" class="action primary" data-admin-present="${p.id}">Registrar apresentação no culto</button>`
        : `<button type="button" class="action primary" data-admin-step="${nextKey}" data-person="${p.id}">${nextKey === 'form' ? 'Registrar formulário recebido' : 'Registrar reunião de integração'}</button>`;
      const log = stepNames.filter(([k]) => p.steps[k]).map(([k, label]) => `<li><b>${label}</b> ${escape(p.steps[k].at)} · ${escape(p.steps[k].by)}</li>`).join('');
      return `<article class="box admin-person"><div class="admin-person-head"><span class="profile-avatar" aria-hidden="true">${escape(p.name.charAt(0))}</span><div><h3>${escape(p.name)}</h3><small>${escape(p.how)}</small></div>${p.steps.presented ? '<span class="tag status-active">Membro</span>' : '<span class="tag">Em integração</span>'}</div>${miniSteps(p)}${action ? `<div class="form-actions gift-actions">${action}</div>` : ''}${log ? `<details class="admin-log"><summary>Histórico de registros</summary><ul>${log}</ul></details>` : ''}</article>`;
    }
    function membership() {
      const open = data.people.filter(p => !p.steps.presented), done = data.people.filter(p => p.steps.presented);
      return `<div class="admin-intro"><p>As três etapas seguem uma ordem obrigatória: formulário, reunião de integração e apresentação no culto. Toque no botão para registrar a próxima. ${isPas() ? 'A Liderança Pastoral e a Secretaria podem registrar.' : 'A Secretaria e a Liderança Pastoral podem registrar.'}</p></div>
      <div class="admin-people">${open.map(personCard).join('') || '<section class="box"><p>Ninguém em integração no momento.</p></section>'}</div>
      ${done.length ? `<h2 class="admin-subtitle">Apresentados</h2><div class="admin-people">${done.map(personCard).join('')}</div>` : ''}
      <p class="note">O reconhecimento como membro decorre da apresentação no culto. Não há aprovação pastoral obrigatória depois da Secretaria.</p>`;
    }
    function confirmPage() {
      const p = data.people.find(x => x.id === state.adminPerson) || pendingPeople()[0];
      if (!p) return `<section class="box"><p>Ninguém aguardando apresentação.</p>${button('Voltar à membresia', 'membresia')}</section>`;
      return `<section class="box admin-form-box"><div class="gift-backrow"><button type="button" class="button-back gift-back" data-view="membresia">${api.backArrow}<span>Voltar</span></button></div><div class="admin-person-head"><span class="profile-avatar" aria-hidden="true">${escape(p.name.charAt(0))}</span><div><h3>${escape(p.name)}</h3><small>Formulário e reunião de integração registrados</small></div></div><form id="membership-form"><input type="hidden" name="person" value="${p.id}"><label for="presented-date">Data da apresentação no culto</label><input id="presented-date" name="date" type="date" required><label class="check"><input name="confirm" type="checkbox" required><span>Confirmo que a pessoa foi apresentada à igreja no culto.</span></label><div class="form-actions gift-actions"><button type="submit" class="action primary">Registrar apresentação</button></div></form><p class="gift-foot">Fica registrado como: ${escape(actor())}.</p></section>`;
    }

    // ---------- Cadastros ----------
    function requests() {
      const list = data.requests.slice().reverse();
      const item = r => `<article class="box admin-request"><div class="admin-person-head"><span class="profile-avatar" aria-hidden="true">${escape(r.name.charAt(0))}</span><div><h3>${escape(r.name)}</h3><small>${escape(r.email)} · ${escape(r.at)}</small></div><span class="tag${r.status === 'pendente' ? '' : ' status-active'}">${r.status === 'pendente' ? 'Pendente' : 'Atualizado'}</span></div><dl class="admin-change"><dt>Pedido de alteração</dt><dd>${escape(r.note)}</dd></dl>${r.status === 'pendente' ? (isSec() ? `<div class="form-actions gift-actions"><button type="button" class="action primary" data-admin-request="${r.id}">Marcar como atualizado</button></div><p class="gift-foot">Confira o dado com a pessoa antes de atualizar o cadastro.</p>` : '<p class="gift-foot">A Secretaria confere e atualiza este cadastro.</p>') : `<p class="gift-foot">Atualizado por ${escape(r.by)} em ${escape(r.done)}.</p>`}</article>`;
      return `<div class="admin-intro"><p>${isSec() ? 'Confira cada pedido e marque quando o cadastro estiver atualizado.' : 'Acompanhe os pedidos. A atualização é feita pela Secretaria.'}</p></div><div class="admin-people">${list.map(item).join('') || '<section class="box"><p>Nenhuma solicitação.</p></section>'}</div><p class="note">Teste: envie um pedido no perfil Membro, em Meu cadastro, e ele aparece aqui.</p>`;
    }

    // ---------- Campos de data e horário (agenda e avisos) ----------
    const dateFields = id => `<div class="ag-dates"><label class="check ag-single"><input type="checkbox" name="single" checked><span>Acontece em um único dia</span></label><div class="form-grid ag-row"><div><label for="${id}-day">Data de início</label><input id="${id}-day" name="day" type="date" required></div><div class="ag-end"><label for="${id}-end">Data de término</label><input id="${id}-end" name="end" type="date"></div></div><div class="form-grid ag-row"><div><label for="${id}-time">Horário de início</label><input id="${id}-time" name="time" type="time"></div><div><label for="${id}-time-end">Horário de término</label><input id="${id}-time-end" name="timeEnd" type="time"></div></div></div>`;
    function readPeriod(values) {
      const day = String(values.get('day') || ''), single = values.get('single') === 'on', end = single ? day : String(values.get('end') || '');
      const time = String(values.get('time') || ''), timeEnd = String(values.get('timeEnd') || ''), ok = v => /^\d{4}-\d{2}-\d{2}$/.test(v);
      if (!ok(day)) return { error: 'Informe a data de início.' };
      if (!ok(end)) return { error: 'Informe a data de término ou marque “Acontece em um único dia”.' };
      if (end < day) return { error: 'A data de término precisa ser igual ou depois da data de início.' };
      if ((Date.parse(end) - Date.parse(day)) / 864e5 > 60) return { error: 'Use no máximo 60 dias entre o início e o término.' };
      if (timeEnd && !time) return { error: 'Informe também o horário de início.' };
      if (single && time && timeEnd && timeEnd <= time) return { error: 'O horário de término precisa ser depois do início.' };
      return { day, end, time, timeEnd };
    }
    const periodText = x => (x.end && x.end !== x.day ? `${dayNum(x.day)} ${monthShort(x.day)} a ${dayNum(x.end)} ${monthShort(x.end)}` : `${dayNum(x.day)} ${monthShort(x.day)}`) + (x.time ? ' · ' + x.time + (x.timeEnd ? ' às ' + x.timeEnd : '') : '');

    // ---------- Agenda ----------
    function agendaAdmin() {
      const added = api.NibDaily.addedItems().filter(x => !x.notice);
      const list = added.map(x => `<li><span class="admin-when"><small>${escape(monthShort(x.day))}</small><strong>${dayNum(x.day)}</strong></span><span><b>${escape(x.name)}</b><small>${escape(x.type)} · ${x.end && x.end !== x.day ? 'até ' + dayNum(x.end) + ' ' + escape(monthShort(x.end)) + ' · ' : ''}${x.time ? escape(x.time + (x.timeEnd ? ' às ' + x.timeEnd : '')) : 'horário a definir'}</small></span><button type="button" class="admin-remove" data-admin-agenda-remove="${x.id}" aria-label="Remover ${escape(x.name)}">Remover</button></li>`).join('');
      return `<div class="admin-grid"><section class="box admin-form-box"><h2>Incluir na agenda</h2><p class="gift-intro">Preencha e toque em Incluir. O item aparece no calendário dos membros.</p><form id="agenda-form"><label for="ag-name">Nome</label><input id="ag-name" name="name" maxlength="80" required placeholder="Ex.: Culto de Ação de Graças">${dateFields('ag')}<label for="ag-type">Tipo</label><select id="ag-type" name="type"><option>Culto</option><option>Evento</option><option>Programação semanal</option><option>Festividade</option></select><div class="form-actions gift-actions"><button type="submit" class="action primary">Incluir na agenda</button></div></form></section>
      <section class="box"><h2>Incluídos por você</h2>${list ? `<ul class="admin-upcoming">${list}</ul>` : '<p class="gift-intro">Nada incluído ainda.</p>'}<h3 class="admin-subtitle">Programação fixa</h3><ul class="admin-fixed"><li><b>Domingo</b> 09:30 EBS · 19:00 Noite de Glória</li><li><b>Quinta</b> 19:30 Culto da Fé</li></ul><p class="gift-foot">A programação fixa vem da configuração da igreja.</p></section></div>`;
    }

    // ---------- Avisos ----------
    function noticesAdmin() {
      const list = data.notices.slice().reverse().map(n => `<article class="admin-notice"><div><strong>${escape(n.title)}</strong><p>${escape(n.text)}</p>${n.day ? `<span class="admin-period">${escape(periodText(n))}</span>` : ''}<small>${escape(n.by)} · ${escape(n.at)}</small></div><button type="button" class="admin-remove" data-admin-notice-remove="${n.id}" aria-label="Remover aviso ${escape(n.title)}">Remover</button></article>`).join('');
      return `<div class="admin-grid"><section class="box admin-form-box"><h2>Novo aviso</h2><p class="gift-intro">Escreva o título, o recado e quando acontece. O aviso chega ao sino dos membros e aparece em Programação e avisos, na data informada.</p><form id="notice-form"><label for="nt-title">Título</label><input id="nt-title" name="title" maxlength="70" required placeholder="Ex.: Mudança de horário"><label for="nt-text">Mensagem</label><textarea id="nt-text" name="text" maxlength="400" rows="4" required placeholder="O que a igreja precisa saber"></textarea>${dateFields('nt')}<div class="form-actions gift-actions"><button type="submit" class="action primary">Publicar aviso</button></div></form></section>
      <section class="box"><h2>Publicados</h2>${list || '<p class="gift-intro">Nenhum aviso publicado.</p>'}<p class="gift-foot">Teste: publique um aviso e troque para o perfil Membro para ver no sino.</p></section></div>`;
    }
    function infoProgram() {
      const today = api.NibDaily.dayKey(new Date());
      const items = api.NibDaily.agenda(today, 21).slice(0, 8);
      const list = items.map(x => `<li><span class="admin-when"><small>${escape(monthShort(x.day))}</small><strong>${dayNum(x.day)}</strong></span><span><b>${escape(x.name)}</b><small>${escape(x.type)} · ${x.time ? escape(x.time) : 'horário a definir'}</small></span></li>`).join('');
      const notes = data.notices.slice().reverse().map(n => `<article class="admin-notice"><div><strong>${escape(n.title)}</strong><p>${escape(n.text)}</p>${n.day ? `<span class="admin-period">${escape(periodText(n))}</span>` : ''}<small>${escape(n.by)} · ${escape(n.at)}</small></div></article>`).join('');
      return `<div class="admin-grid info-grid"><section class="box"><span class="label">AVISOS DA IGREJA</span><h2>Avisos</h2>${notes || '<p class="gift-intro">Nenhum aviso no momento.</p>'}</section><section class="box"><span class="label">PRÓXIMAS SEMANAS</span><h2>Programação</h2><ul class="admin-upcoming">${list || '<li>Nenhum item nas próximas semanas.</li>'}</ul></section></div>`;
    }
    function memberNotices() {
      if (!data.notices.length) return '';
      return `<ul class="notices-list">${data.notices.slice().reverse().map(n => `<li><strong>${escape(n.title)}</strong><p>${escape(n.text)}</p>${n.day ? `<span class="admin-period">${escape(periodText(n))}</span>` : ''}<small>${escape(n.by)} · ${escape(n.at)}</small></li>`).join('')}</ul>`;
    }

    // ---------- Palavra do dia ----------
    function verse() {
      const today = api.NibDaily.dayKey(new Date()), current = api.NibDaily.verseForDay(today), log = data.verseLog[today];
      return `<div class="admin-grid"><section class="box verse-admin admin-form-box" aria-labelledby="verse-admin-title"><h2 id="verse-admin-title" tabindex="-1">Escolher versículo</h2><p class="gift-intro">Defina o versículo de uma data, alinhado à série de mensagens.</p><form id="verse-form"><label for="verse-date">Data</label><input id="verse-date" name="data" type="date" value="${today}" required><label for="verse-text">Texto do versículo</label><textarea id="verse-text" name="texto" maxlength="280" rows="3" required placeholder="Digite o texto conforme a versão bíblica da igreja"></textarea><label for="verse-ref">Referência</label><input id="verse-ref" name="referencia" maxlength="40" required placeholder="Ex.: Salmos 23:1">${isSec() ? '<label class="check"><input name="decisao" type="checkbox" required><span>Escolha definida pela Liderança Pastoral.</span></label>' : ''}<div class="form-actions gift-actions"><button type="submit" class="action primary">Salvar para esta data</button></div></form></section>
      <section class="box"><span class="label">HOJE NO APP</span><blockquote class="admin-verse"><p>${escape(current[0])}</p><cite>${escape(current[1])}</cite></blockquote><p class="gift-foot">${current[2] ? (log ? `Decisão: ${escape(log.decision)} · Registro: ${escape(log.by)}` : 'Escolhido pela igreja') : 'Lista anual automática'}</p>${current[2] ? '<div class="form-actions"><button type="button" id="verse-clear">Voltar à lista automática</button></div>' : ''}</section></div>`;
    }

    // ---------- Cuidado e oração ----------
    function care() {
      const visible = state.prayers.slice().reverse();
      const total = state.prayers.length, praying = state.prayers.reduce((n, p) => n + p.supporters, 0), answered = state.prayers.filter(p => p.answered).length;
      const card = p => `<article class="box admin-prayer${p.hidden ? ' is-hidden' : ''}"><div class="admin-person-head"><span class="profile-avatar" aria-hidden="true">${escape(p.author.charAt(0))}</span><div><h3>${escape(p.name)}</h3><small>${escape(p.author)}</small></div>${p.hidden ? '<span class="tag">Fora do mural</span>' : p.answered ? '<span class="tag status-active">Atendida</span>' : p.followed ? '<span class="tag admin-tag-care">Em acompanhamento</span>' : ''}</div><p class="prayer-reason">${escape(p.reason)}</p><p class="gift-foot admin-left">${p.supporters} ${p.supporters === 1 ? 'pessoa orando' : 'pessoas orando'}</p><div class="admin-actions">${isPas() ? `<button type="button" class="action${p.followed ? ' admin-secondary is-on' : ' primary'}" data-admin-follow="${p.id}" aria-pressed="${!!p.followed}">${p.followed ? 'Acompanhamento ativo' : 'Acompanhar'}</button>` : ''}<button type="button" class="action admin-secondary" data-admin-hide="${p.id}">${p.hidden ? 'Mostrar no mural' : 'Ocultar do mural'}</button></div></article>`;
      return `<dl class="admin-stats"><div><dt>Pedidos</dt><dd>${total}</dd></div><div><dt>Orando</dt><dd>${praying}</dd></div><div><dt>Atendidos</dt><dd>${answered}</dd></div></dl><div class="admin-intro"><p>${isPas() ? 'Marque “Acompanhar” para lembrar do cuidado pastoral. Isso só aparece para a gestão. Use “Ocultar do mural” para um pedido que não deve ficar público.' : 'Use “Ocultar do mural” para um pedido que não deve ficar público. O acompanhamento pastoral fica com a Liderança Pastoral.'} Os pedidos são publicados sem aprovação, com um filtro automático de palavras ofensivas.</p></div><div class="admin-people">${visible.map(card).join('')}</div>`;
    }

    const pages = { gestao: panel, membresia: membership, confirmar: confirmPage, solicitacoes: requests, programacao: agendaAdmin, comunicados: noticesAdmin, palavra: verse, cuidado: care };

    function click(action) {
      const d = action.dataset;
      if (d.adminStep) { const p = data.people.find(x => x.id === d.person); if (!p) return true; const order = stepNames.map(([k]) => k), i = order.indexOf(d.adminStep); if (i < 0 || p.steps[d.adminStep] || order.slice(0, i).some(k => !p.steps[k])) { api.announce('Registre as etapas na ordem: formulário, reunião e apresentação.', 'warning', false); return true; } p.steps[d.adminStep] = { at: now(), by: actor() }; api.show('membresia', false, false); api.announce((d.adminStep === 'form' ? 'Formulário' : 'Reunião de integração') + ' de ' + p.name + ' registrado por ' + actor() + '.', 'success', false); return true; }
      if (d.adminPresent) { state.adminPerson = d.adminPresent; api.show('confirmar'); return true; }
      if (d.adminRequest) { const r = data.requests.find(x => x.id === d.adminRequest); if (r && isSec()) { r.status = 'atualizado'; r.by = actor(); r.done = now(); } api.show('solicitacoes', false, false); api.announce('Cadastro marcado como atualizado.', 'success', false); return true; }
      if (d.adminAgendaRemove) { api.NibDaily.removeItem(d.adminAgendaRemove); api.show('programacao', false, false); api.announce('Item removido da agenda.', 'success', false); return true; }
      if (d.adminNoticeRemove) { const gone = data.notices.find(n => n.id === d.adminNoticeRemove); if (gone && gone.item) api.NibDaily.removeItem(gone.item); data.notices = data.notices.filter(n => n.id !== d.adminNoticeRemove); api.show('comunicados', false, false); api.refreshNotices(); api.announce('Aviso removido.', 'success', false); return true; }
      if (d.adminFollow && !isPas()) return true;
      if (d.adminFollow) { const p = state.prayers.find(x => x.id === d.adminFollow); if (p) p.followed = !p.followed; api.show('cuidado', false, false); const b = document.querySelector('[data-admin-follow="' + d.adminFollow + '"]'); if (b) b.focus({ preventScroll: true }); api.announce(p && p.followed ? 'Pedido em acompanhamento pastoral.' : 'Acompanhamento encerrado.', 'success', false); return true; }
      if (d.adminHide) { const p = state.prayers.find(x => x.id === d.adminHide); if (p) p.hidden = !p.hidden; api.show('cuidado', false, false); const b = document.querySelector('[data-admin-hide="' + d.adminHide + '"]'); if (b) b.focus({ preventScroll: true }); api.announce(p && p.hidden ? 'Pedido retirado do mural dos membros.' : 'Pedido voltou ao mural.', 'success', false); return true; }
      return false;
    }
    function submit(form, values) {
      if (form.id === 'membership-form') {
        const raw = String(values.get('date')), today = api.NibDaily.dayKey(new Date());
        if (!raw || raw > today) { api.announce('Informe a data de uma apresentação já realizada.', 'warning'); return true; }
        const p = data.people.find(x => x.id === values.get('person'));
        if (!p || !p.steps.form || !p.steps.meeting) { api.announce('A apresentação só pode ser registrada depois do formulário e da reunião de integração.', 'warning'); return true; }
        if (p) p.steps.presented = { at: new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Porto_Velho' }).format(new Date(raw + 'T12:00:00-04:00')), by: actor() };
        api.show('membresia'); api.announce('Apresentação de ' + (p ? p.name : '') + ' registrada. Nenhum membro real foi alterado.', 'success'); return true;
      }
      if (form.id === 'agenda-form') {
        const name = String(values.get('name')).trim().slice(0, 80), day = String(values.get('day'));
        if (!name) { api.announce('Informe o nome.', 'warning'); return true; }
        const period = readPeriod(values); if (period.error) { api.announce(period.error, 'warning'); return true; }
        const { end, time, timeEnd } = period;
        api.NibDaily.addItem({ name, day, end, time, timeEnd, type: String(values.get('type') || 'Evento') });
        api.show('programacao', false, false); api.announce(name + ' incluído na agenda dos membros.', 'success', false); return true;
      }
      if (form.id === 'notice-form') {
        const title = String(values.get('title')).trim().slice(0, 70), text = String(values.get('text')).trim().slice(0, 400);
        if (!title || !text) { api.announce('Preencha o título e a mensagem.', 'warning'); return true; }
        const period = readPeriod(values); if (period.error) { api.announce(period.error, 'warning'); return true; }
        const item = api.NibDaily.addItem({ name: title, day: period.day, end: period.end, time: period.time, timeEnd: period.timeEnd, type: 'Aviso', notice: true });
        data.notices.push({ id: 'n' + (++data.seq), title, text, by: actor(), at: now(), ...period, item: item.id });
        api.show('comunicados', false, false); api.refreshNotices(); api.announce('Aviso publicado no sino e em Programação e avisos.', 'success', false); return true;
      }
      if (form.id === 'verse-form') {
        const day = String(values.get('data')), text = String(values.get('texto')).trim().replace(/\s+/g, ' '), ref = String(values.get('referencia')).trim();
        api.NibDaily.setCurated(day, text.slice(0, 280), ref.slice(0, 40));
        data.verseLog[day] = { decision: 'Liderança Pastoral', by: actor() };
        api.show('palavra', false, false); api.announce('Versículo salvo para ' + api.fullDate(day) + '.', 'success', false); return true;
      }
      return false;
    }
    function addRequest(r) { data.requests.push({ id: 'r' + (++data.seq), name: r.name, email: r.email, note: r.note, at: now(), status: 'pendente' }); }
    const badge = () => isSec() ? pendingRequests().length : pendingPeople().length;

    return { infoProgram, profiles, labels, descriptions, icons, views, allowed, pageLabels, pages, click, submit, addRequest, memberNotices, noticesCount: () => data.notices.length, badge, bar: () => (profiles[state.context] || profiles.secretaria).bar };
  }
  scope.NibAdmin = { create };
})(window);
