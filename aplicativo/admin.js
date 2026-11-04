/* Área de gestão da Plataforma Nib: Secretaria da igreja e Liderança Pastoral.
   Versão de teste: dados fictícios, só na sessão, sem permissões de servidor.
   Regras de autoridade seguem o portal da igreja (docs/14-PERMISSOES-E-AUTORIDADE.md):
   a Liderança Pastoral decide; a Secretaria organiza e registra o que foi decidido. */
(function(scope){
  const now = () => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Porto_Velho', dateStyle: 'short', timeStyle: 'short' }).format(new Date());
  const dayNum = key => key.slice(8, 10);
  const monthShort = key => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Porto_Velho', month: 'short' }).format(new Date(key + 'T12:00:00-04:00')).replace('.', '');
  const tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  const chevron = '<svg class="admin-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';

  const profiles = {
    secretaria: {
      name: 'Secretaria da igreja', short: 'Secretaria',
      views: [['gestao', 'Painel'], ['membresia', 'Membresia'], ['recepcao', 'Check-in e visitantes'], ['solicitacoes', 'Cadastros'], ['programacao', 'Agenda'], ['comunicados', 'Avisos'], ['palavra', 'Palavra do dia'], ['cuidado', 'Caderno de oração'], ['informacoes', 'Informações']],
      bar: [['gestao', 'Painel'], ['membresia', 'Membresia'], ['solicitacoes', 'Cadastros'], ['programacao', 'Agenda'], ['comunicados', 'Avisos']]
    },
    tesouraria: {
      name: 'Tesouraria', short: 'Tesouraria',
      views: [['gestao', 'Painel'], ['conferencia', 'Conferência'], ['lancamentos', 'Lançamentos'], ['fechamento', 'Fechamento'], ['informacoes', 'Informações']],
      bar: [['gestao', 'Painel'], ['conferencia', 'Conferência'], ['lancamentos', 'Lançamentos'], ['fechamento', 'Fechamento']]
    },
    pastoral: {
      name: 'Liderança Pastoral', short: 'Liderança Pastoral',
      views: [['gestao', 'Painel'], ['membresia', 'Membresia'], ['recepcao', 'Check-in e visitantes'], ['cuidado', 'Cuidado e oração'], ['palavra', 'Palavra do dia'], ['comunicados', 'Avisos'], ['solicitacoes', 'Cadastros'], ['informacoes', 'Informações']],
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
    recepcao: ['RECEPÇÃO', 'Check-in e visitantes', 'Um QR Code na entrada: o membro registra a presença e o visitante faz um cadastro rápido.'],
    conferencia: ['TESOURARIA', 'Conferência com o extrato', 'Confirme cada crédito do banco com o lançamento correspondente.'],
    lancamentos: ['TESOURARIA', 'Lançamentos', 'Entradas do mês por conta, forma e situação.'],
    fechamento: ['TESOURARIA', 'Fechamento do mês', 'Feche o mês conciliado e gere o arquivo para a contabilidade.'],
    cuidado: ['CUIDADO PASTORAL', 'Cuidado e oração', 'Acompanhe os pedidos do caderno de oração e cuide do mural.']
  };
  const descriptions = { conferencia: 'Extrato e conciliação', lancamentos: 'Entradas do mês', fechamento: 'Mês e contabilidade', recepcao: 'Presença e visitantes', gestao: 'O que precisa de atenção', membresia: 'Integração e apresentação', solicitacoes: 'Atualizações de cadastro', programacao: 'Calendário dos membros', comunicados: 'Avisos no sino do app', palavra: 'Versículo escolhido', cuidado: 'Pedidos de oração' };
  const icons = NibIcons.paths;

  function create(api) {
    const { state, escape, button, arrow } = api;
    const actor = () => profiles[state.context] ? profiles[state.context].name : '';
    const isSec = () => state.context === 'secretaria', isPas = () => state.context === 'pastoral';
    const svg = key => NibIcons.svg(key);

    // Dados fictícios desta sessão (compartilhados entre os perfis de teste).
    const data = {
      counted: null,
      attention: [
        { id: 'a1', name: 'Roberto Exemplo', reason: 'Sem presença no culto há 5 semanas', done: false },
        { id: 'a2', name: 'Família Exemplo', reason: 'Visitou em 01/11 e ainda não teve retorno', done: false },
        { id: 'a3', name: 'Sandra Exemplo', reason: 'Saiu da célula há 4 semanas', done: false }
      ],
      people: [
        { id: 'joao', name: 'João Exemplo', how: 'Veio pelo culto de domingo', steps: { form: { at: '20/10/2026', by: 'Secretaria da igreja' }, meeting: { at: '27/10/2026', by: 'Secretaria da igreja' }, presented: null } },
        { id: 'maria', name: 'Maria Exemplo', how: 'Indicada por uma célula', steps: { form: { at: '29/10/2026', by: 'Secretaria da igreja' }, meeting: null, presented: null } },
        { id: 'pedro', name: 'Pedro Exemplo', how: 'Pediu para ser membro', steps: { form: null, meeting: null, presented: null } }
      ],
      requests: [{ id: 'r1', name: 'Carlos Exemplo', email: 'carlos@example.com', note: 'Telefone: (69) 90000-0000', at: '02/11/2026 18:40', status: 'pendente' }],
      notices: [],
      visitors: [
        { id: 'v1', name: 'Rafael Exemplo', phone: '(69) 90000-1111', how: 'Convite de amigo ou familiar', first: true, whats: true, at: '01/11/2026 19:08', contacted: true },
        { id: 'v2', name: 'Bianca Exemplo', phone: '(69) 90000-2222', how: 'Redes sociais', first: true, whats: true, at: '01/11/2026 19:14', contacted: false },
        { id: 'v3', name: 'Família Exemplo', phone: '(69) 90000-3333', how: 'Passei em frente à igreja', first: false, whats: false, at: '01/11/2026 19:20', contacted: false }
      ],
      checkins: [],
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
      if (view === 'gestao' && state.context === 'tesouraria') return ['TESOURARIA', 'Painel da Tesouraria', 'Conferência, lançamentos e fechamento do mês.'];
      if (view === 'gestao') return ['ADMINISTRAÇÃO', isPas() ? 'Painel da Liderança Pastoral' : 'Painel da Secretaria', isPas() ? 'Acompanhe a membresia, o cuidado e a palavra da igreja.' : 'Cadastros, membresia, agenda e avisos em um só lugar.'];
      if (view === 'cuidado' && isSec()) return ['CADERNO DE ORAÇÃO', 'Caderno de oração', 'Veja os pedidos publicados pelos membros.'];
      return labels[view];
    };

    // ---------- Dashboard (números fictícios até existir a base de pessoas e presença) ----------
    const demo = {
      members: 312, membersNew: 6, regulars: 47, visitors: 23, visitorsFirst: 9,
      cells: 18, cellsMulti: 2, cellMembers: 64, cellPeople: 241,
      sundays: [['2026-09-13', 252], ['2026-09-20', 261], ['2026-09-27', 248], ['2026-10-04', 266], ['2026-10-11', 259], ['2026-10-18', 274], ['2026-10-25', 268], ['2026-11-01', 283]],
      funnel: [['Visitaram nos últimos 90 dias', 61], ['Preencheram o formulário', 14], ['Fizeram a reunião de integração', 9], ['Apresentados no culto', 6]],
      birthdays: [[0, null], [0, 'Ana Exemplo'], [1, 'Paulo Exemplo'], [3, 'Lúcia Exemplo'], [5, 'Marcos Exemplo']],
      absent: 12, noReturn: 5,
      lastService: { day: '2026-11-01', name: 'Culto de domingo', checkins: 214, visitors: 7, counted: 62 },
      giving: { month: 'outubro', total: 41380, givers: 142, avg3: 40150, parts: [['Dízimos', 33620], ['Ofertas', 4960], ['Obra do templo', 2800]] }
    };
    const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    const newVisitors = () => data.visitors.filter(v => v.isNew);
    // Aniversariantes dos próximos 7 dias (só dia e mês, sem idade).
    function birthdays() {
      const base = new Date(api.NibDaily.dayKey(new Date()) + 'T12:00:00-04:00');
      return demo.birthdays.map(([off, who]) => { const name = who || state.member.full; const d = new Date(base); d.setUTCDate(d.getUTCDate() + off); const key = api.NibDaily.dayKey(d); return { key, name, today: off === 0, date: key.slice(8, 10) + '/' + key.slice(5, 7), week: new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Porto_Velho', weekday: 'short' }).format(d).replace('.', '') }; });
    }
    const num = n => n.toLocaleString('pt-BR');
    const ico = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
    const P = NibIcons.paths;
    const I = { members: P.membros, regular: P.frequentador, visitor: P.visitante, cells: P.celulas, presence: P.presenca, alert: P.alerta, back: P.retorno, pray: P.cuidado };
    const pill = (v, suffix = '') => `<span class="dash-pill${v < 0 ? ' is-down' : ''}">${ico(v < 0 ? 'M7 10l5 5 5-5' : 'M7 14l5-5 5 5')}${v > 0 ? '+' : ''}${v}${suffix}</span>`;
    const head = (label, title, aside = '') => `<div class="dash-head"><div><span class="label">${label}</span><h2>${title}</h2></div>${aside}</div>`;
    const foot = (text, view) => `<div class="dash-foot">${button(text, view)}</div>`;
    function attendanceChart(avg) {
      const narrow = typeof innerWidth === 'number' && innerWidth < 600, W = narrow ? 340 : 560, top = 26, base = 182, max = 300, left = 34, bw = narrow ? 24 : 38, n = demo.sundays.length, gap = (W - left - 8 - n * bw) / (n - 1);
      const y = v => base - (v / max) * (base - top);
      const grid = [0, 150, 300].map(v => `<line x1="${left}" x2="${W}" y1="${y(v)}" y2="${y(v)}" class="dash-grid${v ? '' : ' is-base'}"/><text x="${left - 8}" y="${y(v) + 4}" class="dash-axis" text-anchor="end">${v}</text>`).join('');
      const bars = demo.sundays.map(([d, v], i) => {
        const x = left + i * (bw + gap), yt = y(v), r = 5, last = i === n - 1;
        const path = `M${x},${base} V${yt + r} Q${x},${yt} ${x + r},${yt} H${x + bw - r} Q${x + bw},${yt} ${x + bw},${yt + r} V${base} Z`;
        return `<g class="dash-bar${last ? ' is-last' : ''}" tabindex="0" role="img" aria-label="${dayNum(d)} ${escape(monthShort(d))}: ${v} pessoas"><rect x="${Math.max(left, x - gap / 2)}" y="${top - 20}" width="${Math.min(W, x + bw + gap / 2) - Math.max(left, x - gap / 2)}" height="${base - top + 20}" class="dash-hit"/><path d="${path}"/><text x="${x + bw / 2}" y="${yt - 8}" text-anchor="middle" class="dash-value${last ? '' : ' dash-hover'}">${v}</text><text x="${x + bw / 2}" y="${base + 20}" text-anchor="middle" class="dash-axis${last ? ' is-strong' : ''}">${narrow ? dayNum(d) + '/' + d.slice(5, 7) : dayNum(d) + ' ' + escape(monthShort(d))}</text></g>`;
      }).join('');
      const ya = y(avg);
      return `<svg class="dash-chart" viewBox="0 0 ${W} ${base + 30}" role="group" aria-label="Presença nos cultos de domingo, últimas 8 semanas">${grid}${bars}<line x1="${left}" x2="${W}" y1="${ya}" y2="${ya}" class="dash-avg"/></svg><div class="dash-legend"><span><i class="sw is-last"></i>Último domingo</span><span><i class="sw is-avg"></i>Média das 4 últimas semanas · ${avg}</span></div><table class="visually-hidden"><caption>Presença nos cultos de domingo</caption><tr><th>Domingo</th><th>Pessoas</th></tr>${demo.sundays.map(([d, v]) => `<tr><td>${dayNum(d)} ${escape(monthShort(d))}</td><td>${v}</td></tr>`).join('')}</table>`;
    }
    // Barra empilhada com legenda (3 partes no máximo, cada uma com valor escrito).
    function stack(parts, fmt) {
      const total = parts.reduce((t, p) => t + p[1], 0);
      return `<div class="dash-stack" role="img" aria-label="${parts.map(([l, v]) => `${l}: ${fmt(v)}`).join('; ')}">${parts.map(([, v], i) => `<span class="seg s${i + 1}" data-w="${(v / total * 100).toFixed(1)}"></span>`).join('')}</div><ul class="dash-keys">${parts.map(([l, v], i) => `<li><i class="sw s${i + 1}"></i><span>${l}</span><strong>${fmt(v)}</strong><small>${Math.round(v / total * 100)}%</small></li>`).join('')}</ul>`;
    }
    function ring(pct) {
      const r = 42, c = 2 * Math.PI * r, on = c * pct / 100;
      return `<svg class="dash-ring" viewBox="0 0 100 100" role="img" aria-label="${pct}% dos membros em célula"><circle cx="50" cy="50" r="${r}" class="ring-bg"/><circle cx="50" cy="50" r="${r}" class="ring-on" stroke-dasharray="${on.toFixed(1)} ${(c - on).toFixed(1)}" transform="rotate(-90 50 50)"/><text x="50" y="50" text-anchor="middle" class="ring-pct">${pct}%</text><text x="50" y="65" text-anchor="middle" class="ring-sub">em célula</text></svg>`;
    }
    function dashboard(afterTiles = '') {
      const s = demo.sundays.map(x => x[1]), avg = Math.round(s.slice(-4).reduce((a, b) => a + b, 0) / 4), prev = Math.round(s.slice(-8, -4).reduce((a, b) => a + b, 0) / 4), diff = Math.round((avg - prev) / prev * 100);
      const last = s[s.length - 1], lastDiff = Math.round((last - s[s.length - 2]) / s[s.length - 2] * 100);
      const tile = (icon, label, value, extra, note, view) => `<${view ? `button type="button" class="dash-tile is-link" data-view="${view}"` : 'div class="dash-tile"'}><span class="dash-tile-top"><span class="dash-ico">${ico(icon)}</span><span class="dash-tile-label">${label}</span></span><strong class="dash-tile-value">${value}</strong><span class="dash-tile-note">${extra}${note ? `<small>${note}</small>` : ''}</span></${view ? 'button' : 'div'}>`;
      const vis = demo.visitors + newVisitors().length, visFirst = demo.visitorsFirst + newVisitors().filter(v => v.first).length;
      const tiles = [
        tile(I.members, 'Membros ativos', num(demo.members), pill(demo.membersNew), 'em 30 dias', 'membresia'),
        tile(I.regular, 'Frequentadores', num(demo.regulars), '', 'Participam, ainda sem membresia', 'membresia'),
        tile(I.visitor, 'Visitantes no mês', num(vis), `<span class="dash-pill is-neutral">${visFirst} pela 1ª vez</span>`, '', 'recepcao'),
        tile(I.cells, 'Células ativas', num(demo.cells), `<span class="dash-pill is-neutral">${demo.cellPeople} pessoas</span>`, '', ''),
        tile(I.presence, 'Presença média', num(avg), pill(diff, '%'), 'vs. 4 semanas antes', 'recepcao')
      ].join('');
      const shades = ['f1', 'f2', 'f3', 'f4'], fmax = demo.funnel[0][1];
      const funnel = demo.funnel.map(([l, v], i) => `<li><span class="dash-step">${String(i + 1).padStart(2, '0')}</span><div class="dash-step-body"><div class="dash-funnel-row"><span>${l}</span><strong>${v}</strong></div><span class="dash-track"><span class="dash-fill ${shades[i]}" data-w="${Math.max(4, Math.round(v / fmax * 100))}"></span></span></div>${i ? `<span class="dash-conv">${Math.round(v / demo.funnel[i - 1][1] * 100)}%</span>` : '<span class="dash-conv is-blank"></span>'}</li>`).join('');
      const stat = (icon, value, text, tone) => `<li><span class="dash-ico${tone ? ' is-' + tone : ''}">${ico(icon)}</span><strong>${value}</strong><span>${text}</span></li>`;
      const third = isPas()
        ? `<section class="box dash-box">${head('CUIDADO PASTORAL', 'Quem precisa de atenção')}<ul class="dash-stats">${stat(I.alert, demo.absent, 'membros sem presença no culto ou na célula há 4 semanas ou mais', 'warn')}${stat(I.back, demo.noReturn, 'visitantes sem retorno depois da primeira visita', 'warn')}${stat(I.pray, activePrayers().length, 'pedidos de oração ativos no caderno')}</ul><h3 class="dash-subtitle">Para contatar esta semana</h3><ul class="attention-list">${data.attention.map(x => `<li class="${x.done ? 'is-done' : ''}"><span class="profile-avatar" aria-hidden="true">${escape(x.name.charAt(0))}</span><span class="attention-text"><strong>${escape(x.name)}</strong><small>${escape(x.reason)}</small></span><button type="button" class="attention-btn${x.done ? ' is-on' : ''}" data-admin-attention="${x.id}" aria-pressed="${x.done}">${x.done ? 'Contato feito' : 'Marcar contato'}</button></li>`).join('')}</ul>${foot('Ver cuidado e oração', 'cuidado')}</section>`
        : `<section class="box dash-box">${head('ESTA SEMANA', 'Aniversariantes')}<ul class="dash-people">${birthdays().map(b => `<li><span class="profile-avatar" aria-hidden="true">${escape(b.name.charAt(0))}</span><span>${escape(b.name)}</span><span class="dash-date">${b.today ? 'Hoje' : b.date}</span></li>`).join('')}</ul><p class="note dash-foot">Os membros veem os aniversariantes na tela inicial e dão parabéns pelo app.</p></section>`;
      const ls = demo.lastService, today = api.NibDaily.dayKey(new Date()), lsTotal = ls.checkins + ls.visitors + ls.counted;
      const todayIn = data.checkins.filter(c => c.day >= today).length, todayVis = newVisitors().length;
      const service = `<section class="box dash-box">${head('ÚLTIMO CULTO REALIZADO', `Domingo · ${dayNum(ls.day)} ${escape(monthShort(ls.day))}`)}<p class="dash-big">${num(lsTotal)} <span>pessoas</span></p>${stack([['Check-in pelo app', ls.checkins], ['Visitantes pelo QR Code', ls.visitors], ['Contagem da recepção', ls.counted]], num)}${todayIn || todayVis ? `<p class="dash-sub">Nesta sessão de teste: ${todayIn} check-in${todayIn === 1 ? '' : 's'} e ${todayVis} visitante${todayVis === 1 ? '' : 's'}.</p>` : ''}${foot('Ver check-in e visitantes', 'recepcao')}</section>`;
      const g = consolidated(), gdiff = Math.round((g.total - g.avg3) / g.avg3 * 100);
      const giving = `<section class="box dash-box">${head('GENEROSIDADE · CONSOLIDADO', `Contribuições em ${g.month}`)}<p class="dash-big">${brl(g.total)} ${pill(gdiff, '%')}</p><p class="dash-sub">${g.givers} contribuintes · comparado à média dos 3 meses anteriores</p>${stack(g.parts, brl)}<p class="note dash-foot">Só totais, sem nomes nem valores individuais. O detalhe fica com a tesouraria.</p></section>`;
      return `<section class="dash" aria-labelledby="dash-title"><div class="section-heading"><div><span class="label">RESUMO DA IGREJA</span><h2 id="dash-title">Como a igreja está hoje</h2></div><span class="dash-demo">Números fictícios de exemplo</span></div><div class="dash-tiles">${tiles}</div></section>${afterTiles}<section class="dash dash-more" aria-label="Indicadores">
      <div class="admin-grid dash-row"><section class="box dash-box">${head('CULTOS DE DOMINGO', 'Presença nas últimas 8 semanas', `<div class="dash-head-aside"><strong>${last}</strong>${pill(lastDiff, '%')}</div>`)}${attendanceChart(avg)}<div class="dash-foot dash-minis"><div><small>Maior</small><strong>${Math.max(...s)}</strong></div><div><small>Menor</small><strong>${Math.min(...s)}</strong></div><div><small>Média</small><strong>${Math.round(s.reduce((a, b) => a + b, 0) / s.length)}</strong></div></div></section><section class="box dash-box">${head('CAMINHO ATÉ A MEMBRESIA', 'Integração')}<ol class="dash-funnel">${funnel}</ol><p class="dash-sub">A porcentagem compara cada etapa com a anterior.</p>${foot('Ver membresia', 'membresia')}</section></div>
      <div class="admin-grid dash-row"><section class="box dash-box">${head('CÉLULAS', 'Vida em célula')}<div class="dash-cells">${ring(demo.cellMembers)}<ul class="dash-stats is-compact">${stat(I.cells, demo.cells, 'células ativas')}${stat(I.members, demo.cellPeople, 'participantes')}${stat(I.regular, demo.members - Math.round(demo.members * demo.cellMembers / 100), 'membros sem célula', 'warn')}</ul></div><p class="note dash-foot">${demo.cellsMulti} multiplicações neste ano. Na versão real, os números vêm da plataforma de células.</p></section>${third}</div>
      <div class="admin-grid dash-row">${service}${giving}</div></section>`;
    }

    // ---------- Tesouraria ----------
    // Plano de contas sugerido (validar com a contabilidade). Receitas no grupo 3, contrapartidas no ativo.
    const ACCOUNTS = {
      'Dízimo': { code: '3.1.01', name: 'Dízimos' },
      'Oferta': { code: '3.1.02', name: 'Ofertas' },
      'Campanha': { code: '3.1.03', name: 'Doações vinculadas · Obra do templo', restricted: true }
    };
    const BANK = { code: '1.1.02', name: 'Banco Sicoob c/c 51.404-7' }, CASH = { code: '1.1.01', name: 'Caixa (espécie)' };
    const isTes = () => state.context === 'tesouraria';
    const money = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const ymLabel = ym => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Porto_Velho', month: 'long', year: 'numeric' }).format(new Date(ym + '-15T12:00:00-04:00'));
    const fmtDay = d => d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4);
    // Lançamentos fictícios: outubro fechado (bate com o consolidado do painel) e novembro em aberto.
    const ledger = (() => {
      const L = [], first = ['Ana','Bruno','Carla','Daniel','Elisa','Fábio','Gabriela','Hugo','Isabel','José','Karen','Lucas','Marta','Nelson','Olívia','Pedro','Raquel','Sérgio','Tânia','Vítor'];
      let seq = 0; const add = e => L.push({ id: 'L' + (++seq), status: 'conciliado', by: 'Tesouraria', conferred: '', ...e });
      // Outubro: 120 dizimistas, 22 contribuições para a obra (142 contribuintes distintos), ofertas de 4 cultos.
      const giverName = i => first[i % first.length] + ' ' + ['Exemplo','Teste','Modelo','Amostra','Fictício','Demo'][Math.floor(i / first.length) % 6];
      let diz = 0; for (let i = 0; i < 120; i++) { const v = i === 119 ? 33620 - diz : [150, 200, 250, 280, 300, 320, 350, 400][i % 8]; diz += v; add({ day: '2026-10-' + String(1 + i % 28).padStart(2, '0'), type: 'Dízimo', amount: v, method: i % 5 ? 'Pix no app' : 'Pix direto no banco', payer: giverName(i), payerId: 'M' + String(i + 1).padStart(4, '0'), doc: 'E2E' + String(810000 + i), source: i % 5 ? 'app' : 'extrato' }); }
      let obra = 0; for (let i = 0; i < 22; i++) { const v = i === 21 ? 2800 - obra : [100, 150, 120][i % 3]; obra += v; add({ day: '2026-10-' + String(3 + i).padStart(2, '0'), type: 'Campanha', amount: v, method: 'Pix no app', payer: giverName(120 + i), payerId: 'M' + String(121 + i).padStart(4, '0'), doc: 'E2E' + String(820000 + i), source: 'app' }); }
      [['2026-10-04', 1180], ['2026-10-11', 1240], ['2026-10-18', 1210], ['2026-10-25', 1330]].forEach(([d, v], i) => add({ day: d, type: 'Oferta', amount: v, method: 'Espécie (culto)', payer: 'Oferta do culto', payerId: '', doc: 'CONT-' + d.replace(/-/g, ''), source: 'manual', conferred: 'Conferido por Ana Exemplo e José Exemplo' }));
      // Novembro: ainda em aberto.
      add({ day: '2026-11-02', type: 'Dízimo', amount: 300, method: 'Pix no app', payer: 'Bruno Exemplo', payerId: 'M0002', doc: 'E2E900001', source: 'app' });
      add({ day: '2026-11-02', type: 'Campanha', amount: 150, method: 'Pix no app', payer: 'Carla Exemplo', payerId: 'M0003', doc: 'E2E900002', source: 'app' });
      add({ day: '2026-11-03', type: 'Dízimo', amount: 250, method: 'Pix no app', payer: 'Ana Exemplo', payerId: 'M0001', doc: 'E2E900003', source: 'app', status: 'pendente' });
      add({ day: '2026-11-01', type: 'Oferta', amount: 1265.5, method: 'Espécie (culto)', payer: 'Oferta do culto', payerId: '', doc: 'CONT-20261101', source: 'manual', status: 'aguardando depósito', conferred: 'Conferido por Ana Exemplo e José Exemplo' });
      return L;
    })();
    // Extrato do banco (simulado). Na versão real: arquivo OFX do Sicoob ou integração Pix com o banco.
    const bank = [
      { id: 'B1', day: '2026-11-02', text: 'PIX RECEBIDO BRUNO EXEMPLO', amount: 300, doc: 'E2E900001', match: 'L' + (120 + 22 + 4 + 1) },
      { id: 'B2', day: '2026-11-02', text: 'PIX RECEBIDO CARLA EXEMPLO', amount: 150, doc: 'E2E900002', match: 'L' + (120 + 22 + 4 + 2) },
      { id: 'B3', day: '2026-11-03', text: 'PIX RECEBIDO ANA EXEMPLO', amount: 250, doc: 'E2E900003', match: null },
      { id: 'B4', day: '2026-11-03', text: 'DEPOSITO EM DINHEIRO AG 3315', amount: 1265.5, doc: 'DEP-0311', match: null },
      { id: 'B5', day: '2026-11-03', text: 'PIX RECEBIDO JESSICA EXEMPLO', amount: 100, doc: 'E2E900007', match: null }
    ];
    data.closed = { '2026-10': { by: 'Tesouraria', at: '03/11/2026 09:12' } };
    data.ledger = ledger; data.bank = bank;
    const monthOf = e => e.day.slice(0, 7);
    const openMonth = () => api.NibDaily.dayKey(new Date()).slice(0, 7);
    const lastClosed = () => Object.keys(data.closed).sort().pop();
    const entriesOf = ym => data.ledger.filter(e => monthOf(e) === ym);
    const okSum = list => list.filter(e => e.status === 'conciliado').reduce((t, e) => t + e.amount, 0);
    const pendingEntries = () => data.ledger.filter(e => e.status !== 'conciliado');
    const bankOpen = () => data.bank.filter(b => !b.match);
    // Sugestão de correspondência: mesmo documento (E2E) ou mesmo valor em até 3 dias.
    function suggest(b) {
      const cands = pendingEntries().filter(e => !data.bank.some(x => x.match === e.id));
      return cands.find(e => e.doc && e.doc === b.doc) || cands.find(e => Math.abs(e.amount - b.amount) < 0.005 && Math.abs(new Date(e.day) - new Date(b.day)) <= 3 * 864e5);
    }
    // Consolidado para a gestão: sempre o último mês fechado, só totais.
    function consolidated() {
      const ym = lastClosed(), list = entriesOf(ym).filter(e => e.status === 'conciliado');
      const by = t => list.filter(e => e.type === t).reduce((s, e) => s + e.amount, 0);
      return { month: ymLabel(ym).split(' de ')[0], total: okSum(list), givers: new Set(list.filter(e => e.payerId).map(e => e.payerId)).size, avg3: demo.giving.avg3, parts: [['Dízimos', by('Dízimo')], ['Ofertas', by('Oferta')], ['Obra do templo', by('Campanha')]] };
    }
    // Pix feito pelo membro no app: entra como pendente até a conciliação com o extrato.
    function addAppPix(p) {
      const e = { id: 'L' + (data.ledger.length + 1), day: p.day, type: p.type, amount: p.amount, method: 'Pix no app', payer: state.member.full, payerId: 'M0042', doc: p.txid, source: 'app', status: 'pendente', by: 'App do membro', conferred: '', member: true };
      data.ledger.push(e); return e.id;
    }
    function confirmEntry(e, b) {
      e.status = 'conciliado'; e.confirmedAt = now(); e.bankDoc = b ? b.doc : ''; if (b) b.match = e.id;
      if (e.member) api.giftConfirmed(e);
    }
    const statusTag = s => `<span class="tag ${s === 'conciliado' ? 'status-active' : 'is-wait'}">${s === 'conciliado' ? 'Conciliado' : s === 'pendente' ? 'A conferir' : 'Aguardando depósito'}</span>`;
    const tstat = (icon, value, text, tone) => `<li><span class="dash-ico${tone ? ' is-' + tone : ''}">${ico(icon)}</span><strong>${value}</strong><span>${text}</span></li>`;
    function treasuryPanel() {
      const ym = openMonth(), list = entriesOf(ym), pend = pendingEntries(), open = bankOpen();
      const by = t => list.filter(e => e.type === t && e.status === 'conciliado').reduce((s, e) => s + e.amount, 0);
      const fundTotal = data.ledger.filter(e => e.type === 'Campanha' && e.status === 'conciliado').reduce((s, e) => s + e.amount, 0);
      const c = consolidated();
      const ttile = (icon, label, value, note, view) => `<${view ? `button type="button" class="dash-tile is-link" data-view="${view}"` : 'div class="dash-tile"'}><span class="dash-tile-top"><span class="dash-ico">${ico(icon)}</span><span class="dash-tile-label">${label}</span></span><strong class="dash-tile-value">${value}</strong><span class="dash-tile-note"><small>${note}</small></span></${view ? 'button' : 'div'}>`;
      const tiles = `<div class="dash-tiles tes-tiles">${ttile(P.generosidade, 'Entradas de ' + escape(ymLabel(ym).split(' de ')[0]), money(okSum(list)), 'Conciliadas · mês em aberto')}${ttile(P.conferencia, 'A conferir', pend.length + open.length, `${pend.length} lançamento${pend.length === 1 ? '' : 's'} e ${open.length} crédito${open.length === 1 ? '' : 's'} do extrato`, 'conferencia')}${ttile(P.inicio, 'Fundo da obra (vinculado)', money(fundTotal), 'Conciliado até hoje')}${ttile(P.fechamento, 'Último fechamento', `<span class="tes-cap">${escape(c.month)}</span>`, `${money(c.total)} · ${c.givers} contribuintes`, 'fechamento')}</div>`;
      return `<section class="dash"><div class="section-heading"><div><span class="label">TESOURARIA</span><h2>Como está o financeiro</h2></div><span class="dash-demo">Valores fictícios de exemplo</span></div>${tiles}</section>
      <div class="admin-grid dash-row"><section class="box dash-box">${head('MÊS EM ABERTO', 'Por finalidade')}${stack([['Dízimos', by('Dízimo')], ['Ofertas', by('Oferta')], ['Obra do templo', by('Campanha')]].map(([l, v]) => [l, v || 0.0001]), v => money(Math.round(v * 100) / 100))}<p class="note dash-foot">Só entra no total o que já foi conciliado com o extrato.</p></section>
      <section class="box dash-box">${head('PASSO A PASSO', 'Rotina da semana')}<ol class="tes-steps"><li><strong>Conferência</strong><span>Importe o extrato e confirme cada crédito com o lançamento correspondente.</span></li><li><strong>Lançamentos</strong><span>Registre a oferta em espécie do culto, contada por duas pessoas.</span></li><li><strong>Fechamento</strong><span>Com tudo conciliado, feche o mês e envie o arquivo à contabilidade.</span></li></ol>${foot('Ir para a conferência', 'conferencia')}</section></div>
      <p class="note">A Secretaria e a Liderança Pastoral veem só o consolidado do último mês fechado, sem nomes nem valores individuais. O membro vê apenas as próprias contribuições.</p>`;
    }
    function reconcilePage() {
      const open = bankOpen(), suggested = open.map(suggest).filter(Boolean).map(e => e.id), pendApp = pendingEntries().filter(e => !data.bank.some(b => b.match === e.id) && !suggested.includes(e.id));
      const types = Object.keys(ACCOUNTS).map(t => `<option value="${t}">${t === 'Campanha' ? 'Campanha · Obra do templo' : t}</option>`).join('');
      const lines = open.map(b => {
        const s = suggest(b);
        return `<li class="box tes-line"><div class="tes-line-head"><div><small>${fmtDay(b.day)} · Extrato Sicoob</small><strong>${escape(b.text)}</strong><small>Documento ${escape(b.doc)}</small></div><span class="tes-amount">${money(b.amount)}</span></div>${s ? `<div class="tes-match"><span class="tes-match-label">Corresponde a</span><strong>${escape(s.type === 'Campanha' ? 'Obra do templo' : s.type)} · ${escape(s.payer)}</strong><small>${escape(s.method)} · lançado em ${fmtDay(s.day)}${s.conferred ? ' · ' + escape(s.conferred) : ''}</small><button type="button" class="action primary" data-tes-confirm="${b.id}" data-entry="${s.id}">Confirmar conciliação</button></div>` : `<form class="tes-identify" data-bank="${b.id}"><span class="tes-match-label">Sem lançamento correspondente. Identifique o crédito:</span><div class="tes-fields"><label>Finalidade<select name="type">${types}</select></label><label>Contribuinte<select name="payer"><option value="">Não identificado</option><option>${escape(state.member.full)}</option><option>Carlos Exemplo</option><option>Marcos Exemplo</option></select></label></div><button type="submit" class="action primary">Lançar e conciliar</button></form>`}</li>`;
      }).join('');
      const waiting = pendApp.map(e => `<li><span>${fmtDay(e.day)} · ${escape(e.payer)} · ${escape(e.type === 'Campanha' ? 'Obra do templo' : e.type)}</span><strong>${money(e.amount)}</strong>${statusTag(e.status)}</li>`).join('');
      return `<div class="tes-toolbar"><button type="button" class="action primary" data-tes-import="1">Importar extrato do dia (teste)</button><p class="note">Na versão real: arquivo OFX do Sicoob ou integração Pix com o banco. O app sugere a correspondência pelo número do Pix (E2E) ou pelo valor e data.</p></div>
      <section aria-labelledby="tes-bank-title"><div class="section-heading"><div><span class="label">EXTRATO DO BANCO</span><h2 id="tes-bank-title">Créditos a conciliar</h2></div><span class="dash-demo is-neutral">${open.length}</span></div>${open.length ? `<ul class="tes-lines">${lines}</ul>` : '<p class="box">Tudo conciliado. Nenhum crédito do extrato aguardando.</p>'}</section>
      <section class="box tes-waiting" aria-labelledby="tes-wait-title"><h2 id="tes-wait-title">Lançados, ainda sem crédito no extrato</h2>${waiting ? `<ul class="tes-wait-list">${waiting}</ul><p class="note">O Pix aparece no extrato no mesmo dia ou no seguinte. A oferta em espécie espera o depósito.</p>` : '<p>Nenhum lançamento esperando o extrato.</p>'}</section>`;
    }
    function entriesPage() {
      const ym = state.tesMonth || openMonth(), months = [...new Set(data.ledger.map(monthOf))].sort().reverse();
      const list = entriesOf(ym).slice().sort((a, b) => b.day.localeCompare(a.day) || b.id.localeCompare(a.id));
      const closed = !!data.closed[ym];
      const rows = list.slice(0, 40).map(e => `<tr><td>${fmtDay(e.day)}</td><td><strong>${escape(e.payer)}</strong><small>${escape(e.method)}${e.conferred ? ' · ' + escape(e.conferred) : ''}</small></td><td>${ACCOUNTS[e.type].code}<small>${escape(ACCOUNTS[e.type].name)}</small></td><td class="num">${money(e.amount)}</td><td>${statusTag(e.status)}</td></tr>`).join('');
      return `<section class="box tes-cash" aria-labelledby="tes-cash-title"><h2 id="tes-cash-title">Oferta em espécie do culto</h2><p>A contagem é feita por duas pessoas, logo depois do culto. O valor fica aguardando até o depósito aparecer no extrato.</p><form id="cash-form" class="form-grid"><label>Culto<select name="service">${['2026-11-01 · Culto de domingo', '2026-10-29 · Culto da Fé'].map(o => `<option>${o}</option>`).join('')}</select></label><label>Valor contado (R$)<input name="amount" inputmode="decimal" required placeholder="0,00"></label><label>Conferente 1<input name="c1" required maxlength="60"></label><label>Conferente 2<input name="c2" required maxlength="60"></label><div class="form-actions"><button type="submit" class="action primary"${closed ? ' disabled' : ''}>Registrar contagem</button></div></form></section>
      <section aria-labelledby="tes-list-title"><div class="section-heading"><div><span class="label">LANÇAMENTOS</span><h2 id="tes-list-title">${escape(ymLabel(ym))}</h2></div><div class="history-years" role="group" aria-label="Mês">${months.map(m => `<button type="button" class="history-year${m === ym ? ' is-active' : ''}" data-tes-month="${m}" aria-pressed="${m === ym}">${escape(ymLabel(m).split(' de ')[0])}</button>`).join('')}</div></div>
      <div class="box tes-table-wrap"><table class="tes-table"><thead><tr><th>Data</th><th>Histórico</th><th>Conta</th><th class="num">Valor</th><th>Situação</th></tr></thead><tbody>${rows}</tbody></table>${list.length > 40 ? `<p class="note">Mostrando 40 de ${list.length} lançamentos. O arquivo do fechamento traz todos.</p>` : ''}</div></section>`;
    }
    function csvFor(ym) {
      const q = v => /[;"\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v);
      const head = ['data', 'competencia', 'conta_debito', 'conta_credito', 'historico', 'forma', 'documento', 'contribuinte_id', 'valor', 'situacao', 'conferencia'];
      const rows = entriesOf(ym).map(e => [fmtDay(e.day), ym.slice(5) + '/' + ym.slice(0, 4), e.method.startsWith('Espécie') ? CASH.code : BANK.code, ACCOUNTS[e.type].code, `${ACCOUNTS[e.type].name}${e.payerId ? ' · ' + e.payerId : ' · ' + e.payer}`, e.method, e.doc, e.payerId, e.amount.toFixed(2).replace('.', ','), e.status, e.conferred]);
      return [head, ...rows].map(r => r.map(q).join(';')).join('\n');
    }
    function closingPage() {
      const months = [...new Set(data.ledger.map(monthOf))].sort().reverse(), ym = state.tesClose || months[0];
      const list = entriesOf(ym), closed = data.closed[ym], pend = list.filter(e => e.status !== 'conciliado');
      const byAcc = Object.entries(ACCOUNTS).map(([t, a]) => [a, list.filter(e => e.type === t && e.status === 'conciliado').reduce((s, e) => s + e.amount, 0)]);
      const csv = csvFor(ym), preview = csv.split('\n').slice(0, 4).join('\n');
      return `<div class="history-years" role="group" aria-label="Mês">${months.map(m => `<button type="button" class="history-year${m === ym ? ' is-active' : ''}" data-tes-close-month="${m}" aria-pressed="${m === ym}">${escape(ymLabel(m).split(' de ')[0])}</button>`).join('')}</div>
      <div class="admin-grid dash-row"><section class="box dash-box">${head(closed ? 'MÊS FECHADO' : 'MÊS EM ABERTO', escape(ymLabel(ym)))}<table class="tes-table is-compact"><thead><tr><th>Conta</th><th class="num">Valor</th></tr></thead><tbody>${byAcc.map(([a, v]) => `<tr><td>${a.code}<small>${escape(a.name)}${a.restricted ? ' · fundo vinculado' : ''}</small></td><td class="num">${money(v)}</td></tr>`).join('')}<tr class="tes-total"><td>Total das receitas</td><td class="num">${money(okSum(list))}</td></tr></tbody></table>
      ${closed ? `<p class="tes-closed">Fechado por ${escape(closed.by)} em ${escape(closed.at)}. Correções viram um lançamento de estorno no mês seguinte.</p>` : pend.length ? `<p class="tes-block">${pend.length === 1 ? 'Falta 1 lançamento' : `Faltam ${pend.length} lançamentos`} para conciliar antes de fechar.</p>${button('Ir para a conferência', 'conferencia')}` : `<button type="button" class="action primary" data-tes-close="${ym}">Fechar ${escape(ymLabel(ym).split(' de ')[0])}</button>`}</section>
      <section class="box dash-box">${head('CONTABILIDADE', 'Arquivo do mês')}<p>Uma linha por lançamento, com a conta de débito e de crédito, o documento do banco e o código do contribuinte. O nome da pessoa não vai no arquivo.</p><pre class="tes-csv" aria-label="Prévia do arquivo">${escape(preview)}</pre><a class="button button-go" download="nib-lancamentos-${ym}.csv" href="data:text/csv;charset=utf-8,${encodeURIComponent('﻿' + csv)}">Baixar CSV (${list.length} linhas) ${arrow}</a>${closed ? '' : '<p class="note">Enquanto o mês estiver aberto, o arquivo é só uma prévia.</p>'}</section></div>`;
    }

    // ---------- Check-in e visitantes ----------
    const CHECKIN_URL = 'https://novaigrejabatista.com.br/app/checkin';
    function reception() {
      const today = api.NibDaily.dayKey(new Date()), todayIn = data.checkins.filter(c => c.day >= today);
      const list = data.visitors.slice().reverse().map(v => `<article class="box admin-person visit-card"><div class="visit-head"><div><strong>${escape(v.name)}</strong><small>${escape(v.at)}</small></div><span class="tag${v.first ? ' is-first' : ''}">${v.first ? 'Primeira visita' : 'Já visitou antes'}</span></div><dl class="visit-data"><div><dt>WhatsApp</dt><dd>${escape(v.phone)}${v.whats ? '' : '<small>Não quer mensagens</small>'}</dd></div><div><dt>Como conheceu</dt><dd>${escape(v.how)}</dd></div></dl>${isSec() ? `<div class="admin-actions dash-foot"><button type="button" class="action${v.contacted ? ' admin-secondary is-on' : ' primary'}" data-admin-contact="${v.id}" aria-pressed="${!!v.contacted}">${v.contacted ? 'Boas-vindas enviadas' : 'Marcar boas-vindas enviadas'}</button></div>` : (v.contacted ? '<p class="note dash-foot">A Secretaria já enviou as boas-vindas.</p>' : '<p class="note dash-foot">Aguardando boas-vindas da Secretaria.</p>')}</article>`).join('');
      const stat = (icon, value, text, tone) => `<li><span class="dash-ico${tone ? ' is-' + tone : ''}">${ico(icon)}</span><strong>${value}</strong><span>${text}</span></li>`;
      const nv = newVisitors().length;
      return `<div class="admin-grid dash-row"><section class="box dash-box reception-qr">${head('QR CODE DA RECEPÇÃO', 'Imprima e deixe na entrada')}<div class="reception-body"><div class="reception-code" role="img" aria-label="QR Code do check-in da igreja">${api.qrSvg(CHECKIN_URL)}</div><div class="reception-text"><p>Quem tem o app faz o check-in e a presença é registrada. Quem é novo faz um cadastro rápido de visitante, sem criar conta.</p><button type="button" class="action primary" data-admin-visit="1">Testar como visitante</button></div></div><p class="note dash-foot">O QR abrirá ${CHECKIN_URL.replace('https://', '')} (endereço criado na publicação). Para testar o check-in do membro, use o perfil Membro.</p></section>
      <section class="box dash-box">${head('AO VIVO', 'Presença no culto de hoje')}<ul class="dash-stats">${stat(I.presence, todayIn.length, `check-in${todayIn.length === 1 ? '' : 's'} de membros pelo app`)}${stat(I.visitor, nv, `visitante${nv === 1 ? '' : 's'} pelo QR Code`)}${stat(I.regular, data.counted === null ? '–' : data.counted, 'contagem da recepção para quem não usa o app')}</ul>${isSec() ? `<form id="count-form" class="count-form dash-foot"><label for="count-n">Contagem da recepção</label><div class="count-row"><input id="count-n" name="count" type="number" inputmode="numeric" min="0" max="2000" required value="${data.counted ?? ''}" placeholder="Ex.: 58"><button type="submit" class="action primary">Salvar</button></div><p class="note">Lance depois do culto as pessoas contadas na entrada que não usam o app.</p></form>` : `<p class="note dash-foot">A Secretaria lança a contagem da recepção depois do culto.</p>`}${data.counted !== null ? `<p class="dash-sub">Total de hoje: <strong>${todayIn.length + nv + data.counted}</strong> pessoas.</p>` : ''}</section></div>
      <section class="visit-list" aria-labelledby="visit-title"><div class="section-heading"><div><span class="label">CADASTRO RÁPIDO</span><h2 id="visit-title">Visitantes</h2></div><span class="dash-demo is-neutral">${data.visitors.length} registros</span></div><div class="admin-people visit-grid">${list}</div></section>`;
    }
    function openVisitor() {
      let dlg = document.getElementById('visit-dialog');
      if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'visit-dialog'; dlg.setAttribute('aria-labelledby', 'visit-dialog-title'); document.body.append(dlg); }
      const opts = ['Convite de amigo ou familiar', 'Redes sociais', 'Passei em frente à igreja', 'Por uma célula', 'Outro'].map(o => `<option>${o}</option>`).join('');
      dlg.innerHTML = `<div class="popup-heading"><span class="popup-kicker">NOVA IGREJA BATISTA</span><button type="button" class="popup-close" data-admin-visit-close="1" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12 M18 6 6 18"/></svg></button><h2 id="visit-dialog-title">Que bom ter você aqui!</h2><p>Conte rapidinho quem você é. Leva menos de um minuto e não precisa criar conta.</p></div><form id="visit-form" class="visit-form" autocomplete="off"><label for="vf-name">Seu nome</label><input id="vf-name" name="name" maxlength="80" required autocomplete="name"><label for="vf-phone">WhatsApp</label><input id="vf-phone" name="phone" type="tel" inputmode="tel" maxlength="20" required placeholder="(69) 90000-0000" autocomplete="tel"><fieldset class="visit-first"><legend>É sua primeira vez na Nib?</legend><label class="check"><input type="radio" name="first" value="1" checked><span>Sim, primeira vez</span></label><label class="check"><input type="radio" name="first" value="0"><span>Já vim antes</span></label></fieldset><label for="vf-how">Como conheceu a igreja?</label><select id="vf-how" name="how">${opts}</select><label class="check"><input type="checkbox" name="whats" checked><span>Quero receber mensagens da igreja no WhatsApp</span></label><p class="note">Seus dados ficam com a Secretaria da igreja, só para dar as boas-vindas e manter contato. Veja a <a href="https://novaigrejabatista.com.br/privacidade/" target="_blank" rel="noopener">política de privacidade</a>.</p><div class="form-actions"><button type="submit" class="action primary">Registrar minha visita</button></div></form>`;
      if (!dlg.open) dlg.showModal();
      dlg.querySelector('#vf-name').focus();
    }
    function addCheckin(c) { data.checkins.push(c); }

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
        recepcao: 'QR Code da recepção, presença e visitantes do culto.',
        informacoes: 'Veja a página Programação e avisos como os membros veem.'
      };
      const shortcuts = views().filter(([key]) => key !== 'gestao').map(([key, title]) => { const c = counts[key]; const alert = c && ['solicitacoes', 'membresia'].includes(key) && (key !== 'solicitacoes' || isSec()); return `<button type="button" class="quick-action admin-quick" data-view="${key}"><span class="home-action-icon" aria-hidden="true">${svg(key)}</span>${alert ? `<span class="admin-badge" aria-label="${c} pendente${c === 1 ? '' : 's'}">${c}</span>` : ''}<strong>${title}</strong><span class="home-action-description">${texts[key] || ''}</span></button>`; }).join('');
      const next = upcoming.map(x => `<li><span class="admin-when"><small>${escape(monthShort(x.day))}</small><strong>${dayNum(x.day)}</strong></span><span><b>${escape(x.name)}</b><small>${escape(x.type)} · ${x.time ? escape(x.time) : 'horário a definir'}</small></span></li>`).join('');
      const quick = `<section aria-labelledby="admin-quick-title"><div class="section-heading"><div><span class="label">${escape(actor().toUpperCase())}</span><h2 id="admin-quick-title">Atalhos de gestão</h2></div></div><p class="admin-rule">${isPas() ? 'A Liderança Pastoral decide. A Secretaria organiza e registra o que foi decidido.' : 'A Secretaria organiza e registra. Decisões pastorais ficam com a Liderança Pastoral.'}</p><div class="quick-actions">${shortcuts}</div></section>`;
      return `${dashboard(quick)}
      <div class="admin-grid"><section class="box"><div class="section-heading"><div><span class="label">PRÓXIMOS DIAS</span><h2>Na agenda</h2></div>${isSec() ? button('Gerenciar', 'programacao') : ''}</div><ul class="admin-upcoming">${next || '<li>Nenhum item nos próximos dias.</li>'}</ul></section>
      <section class="box"><span class="label">EVENTOS E INSCRIÇÕES</span><h2>Painel de inscrições</h2><p>As inscrições dos eventos continuam no painel do site, com login próprio.</p><a class="button button-go admin-external" href="https://novaigrejabatista.com.br/inscricoes/" target="_blank" rel="noopener"><span>Abrir painel de inscrições</span>${arrow}</a></section></div>
      <p class="note">O resumo financeiro mostra só totais; o detalhe por pessoa fica com a tesouraria. As células usam a plataforma própria. O seletor de perfil desta versão de teste não é controle de acesso.</p>`;
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
    function latestNotice() { const n = data.notices[data.notices.length - 1]; return n ? { title: n.title, text: n.text, when: n.day ? periodText(n) : '' } : null; }
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

    const pages = { conferencia: reconcilePage, lancamentos: entriesPage, fechamento: closingPage, recepcao: reception, gestao: () => isTes() ? treasuryPanel() : panel(), membresia: membership, confirmar: confirmPage, solicitacoes: requests, programacao: agendaAdmin, comunicados: noticesAdmin, palavra: verse, cuidado: care };

    function click(action) {
      const d = action.dataset;
      if (d.adminVisit) { openVisitor(); return true; }
      if (d.adminVisitClose) { const dlg = document.getElementById('visit-dialog'); if (dlg) dlg.close(); if (state.view === 'recepcao' || state.view === 'gestao') api.show(state.view, false, false); return true; }
      if (d.adminContact) { if (!isSec()) return true; const v = data.visitors.find(x => x.id === d.adminContact); if (v) v.contacted = !v.contacted; api.show('recepcao', false, false); return true; }
      if (d.adminStep) { const p = data.people.find(x => x.id === d.person); if (!p) return true; const order = stepNames.map(([k]) => k), i = order.indexOf(d.adminStep); if (i < 0 || p.steps[d.adminStep] || order.slice(0, i).some(k => !p.steps[k])) { api.announce('Registre as etapas na ordem: formulário, reunião e apresentação.', 'warning', false); return true; } p.steps[d.adminStep] = { at: now(), by: actor() }; api.show('membresia', false, false); api.announce((d.adminStep === 'form' ? 'Formulário' : 'Reunião de integração') + ' de ' + p.name + ' registrado por ' + actor() + '.', 'success', false); return true; }
      if (d.adminPresent) { state.adminPerson = d.adminPresent; api.show('confirmar'); return true; }
      if (d.adminRequest) { const r = data.requests.find(x => x.id === d.adminRequest); if (r && isSec()) { r.status = 'atualizado'; r.by = actor(); r.done = now(); if (r.name === state.member.full) api.notify({ kind: 'ok', title: 'Seu cadastro foi atualizado', text: 'A Secretaria conferiu e atualizou: ' + r.note + '.', at: r.done, view: 'cadastro', action: 'Ver meu cadastro' }); } api.show('solicitacoes', false, false); api.announce('Cadastro marcado como atualizado.', 'success', false); return true; }
      if (d.adminAgendaRemove) { api.NibDaily.removeItem(d.adminAgendaRemove); api.show('programacao', false, false); api.announce('Item removido da agenda.', 'success', false); return true; }
      if (d.adminNoticeRemove) { const gone = data.notices.find(n => n.id === d.adminNoticeRemove); if (gone && gone.item) api.NibDaily.removeItem(gone.item); data.notices = data.notices.filter(n => n.id !== d.adminNoticeRemove); api.show('comunicados', false, false); api.refreshNotices(); api.announce('Aviso removido.', 'success', false); return true; }
      if (d.tesConfirm) { const b = data.bank.find(x => x.id === d.tesConfirm), e = data.ledger.find(x => x.id === d.entry); if (b && e && isTes()) { if (e.status === 'aguardando depósito') e.depositDoc = b.doc; confirmEntry(e, b); } api.show('conferencia', false, false); api.announce('Crédito conciliado com o lançamento.', 'success', false); return true; }
      if (d.tesImport) { const mine = data.ledger.filter(e => e.member && e.status === 'pendente' && !data.bank.some(b => b.doc === e.doc)); mine.forEach((e, i) => data.bank.push({ id: 'BX' + (data.bank.length + 1), day: e.day, text: 'PIX RECEBIDO ' + e.payer.toUpperCase(), amount: e.amount, doc: e.doc, match: null })); api.show('conferencia', false, false); api.announce(mine.length ? `${mine.length} crédito${mine.length === 1 ? '' : 's'} novo${mine.length === 1 ? '' : 's'} no extrato.` : 'Extrato importado. Nenhum crédito novo.', 'success', false); return true; }
      if (d.tesMonth) { state.tesMonth = d.tesMonth; api.show('lancamentos', false, false); return true; }
      if (d.tesCloseMonth) { state.tesClose = d.tesCloseMonth; api.show('fechamento', false, false); return true; }
      if (d.tesClose) { if (isTes() && !entriesOf(d.tesClose).some(e => e.status !== 'conciliado')) data.closed[d.tesClose] = { by: actor(), at: now() }; api.show('fechamento', false, false); api.announce('Mês fechado. O arquivo para a contabilidade está pronto.', 'success', false); return true; }
      if (d.adminAttention) { const x = data.attention.find(y => y.id === d.adminAttention); if (x && isPas()) x.done = !x.done; api.show('gestao', false, false); const b = document.querySelector('[data-admin-attention="' + d.adminAttention + '"]'); if (b) b.focus({ preventScroll: true }); return true; }
      if (d.adminFollow && !isPas()) return true;
      if (d.adminFollow) { const p = state.prayers.find(x => x.id === d.adminFollow); if (p) p.followed = !p.followed; api.show('cuidado', false, false); const b = document.querySelector('[data-admin-follow="' + d.adminFollow + '"]'); if (b) b.focus({ preventScroll: true }); api.announce(p && p.followed ? 'Pedido em acompanhamento pastoral.' : 'Acompanhamento encerrado.', 'success', false); return true; }
      if (d.adminHide) { const p = state.prayers.find(x => x.id === d.adminHide); if (p) { p.hidden = !p.hidden; if (p.hidden && p.own) api.notify({ kind: 'info', title: 'Seu pedido saiu do mural', text: `“${p.name}” agora fica só com você e a equipe pastoral, que continua orando por você.`, at: now(), view: 'caderno', action: 'Ver caderno' }); } api.show('cuidado', false, false); const b = document.querySelector('[data-admin-hide="' + d.adminHide + '"]'); if (b) b.focus({ preventScroll: true }); api.announce(p && p.hidden ? 'Pedido retirado do mural dos membros.' : 'Pedido voltou ao mural.', 'success', false); return true; }
      return false;
    }
    function submit(form, values) {
      if (form.id === 'visit-form') {
        const name = String(values.get('name') || '').trim(), phone = String(values.get('phone') || '').trim();
        if (!name || phone.replace(/\D/g, '').length < 10) { const f = form.querySelector('#vf-phone'); f.setAttribute('aria-invalid', 'true'); f.focus(); return true; }
        data.visitors.push({ id: 'v' + (++data.seq), name, phone, how: String(values.get('how')), first: values.get('first') === '1', whats: values.get('whats') === 'on', at: now(), contacted: false, isNew: true });
        const dlg = document.getElementById('visit-dialog'), first = name.split(' ')[0];
        dlg.querySelector('form').outerHTML = `<div class="visit-done"><span class="gift-thanks-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span><h3 tabindex="-1">Visita registrada, ${escape(first)}!</h3><p>Que alegria ter você com a gente. Em breve a Secretaria entra em contato para conhecer você.</p><div class="form-actions"><button type="button" class="action primary" data-admin-visit-close="1">Concluir</button></div></div>`;
        dlg.querySelector('.visit-done h3').focus();
        return true;
      }
      if (form.classList.contains('tes-identify')) {
        const b = data.bank.find(x => x.id === form.dataset.bank); if (!b) return true;
        const type = String(values.get('type')), payer = String(values.get('payer') || '');
        const e = { id: 'L' + (data.ledger.length + 1), day: b.day, type, amount: b.amount, method: 'Pix direto no banco', payer: payer || 'Não identificado', payerId: payer === state.member.full ? 'M0042' : payer ? 'M0' + (500 + data.ledger.length) : '', doc: b.doc, source: 'extrato', status: 'pendente', by: actor(), conferred: '', member: payer === state.member.full };
        data.ledger.push(e); confirmEntry(e, b);
        api.show('conferencia', false, false); api.announce('Crédito lançado em ' + ACCOUNTS[type].name + ' e conciliado.', 'success', false); return true;
      }
      if (form.id === 'cash-form') {
        const amount = Math.round(Number(String(values.get('amount')).replace(/\./g, '').replace(',', '.')) * 100) / 100, c1 = String(values.get('c1')).trim(), c2 = String(values.get('c2')).trim(), day = String(values.get('service')).slice(0, 10);
        if (!(amount > 0)) { api.announce('Informe o valor contado.', 'warning'); return true; }
        if (!c1 || !c2 || c1.toLowerCase() === c2.toLowerCase()) { api.announce('A contagem precisa de duas pessoas diferentes.', 'warning'); return true; }
        data.ledger.push({ id: 'L' + (data.ledger.length + 1), day, type: 'Oferta', amount, method: 'Espécie (culto)', payer: 'Oferta do culto', payerId: '', doc: 'CONT-' + day.replace(/-/g, '') + '-' + data.ledger.length, source: 'manual', status: 'aguardando depósito', by: actor(), conferred: `Conferido por ${c1} e ${c2}` });
        state.tesMonth = day.slice(0, 7); api.show('lancamentos', false, false); api.announce('Contagem registrada. Ela fica aguardando o depósito aparecer no extrato.', 'success', false); return true;
      }
      if (form.id === 'count-form') {
        const n = Math.round(Number(values.get('count')));
        if (!(n >= 0 && n <= 2000)) { api.announce('Informe um número entre 0 e 2000.', 'warning'); return true; }
        data.counted = n; api.show('recepcao', false, false); api.announce('Contagem da recepção salva: ' + n + ' pessoas.', 'success', false); return true;
      }
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
    const myRequests = name => data.requests.filter(r => r.name === name).slice().reverse();
    function addRequest(r) { data.requests.push({ id: 'r' + (++data.seq), name: r.name, email: r.email, note: r.note, at: now(), status: 'pendente' }); }
    const badge = () => isTes() ? pendingEntries().length + bankOpen().length : isSec() ? pendingRequests().length : pendingPeople().length;

    return { birthdays, addCheckin, checkins: () => data.checkins, infoProgram, profiles, labels, descriptions, icons, views, allowed, pageLabels, pages, click, submit, addRequest, addAppPix, myRequests, memberNotices, latestNotice, noticesCount: () => data.notices.length, badge, bar: () => (profiles[state.context] || profiles.secretaria).bar };
  }
  scope.NibAdmin = { create };
})(window);
