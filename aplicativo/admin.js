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
      views: [['gestao', 'Painel'], ['conferencia', 'Conferência'], ['lancamentos', 'Entradas'], ['saidas', 'Saídas'], ['orcamento', 'Orçamento'], ['contribuintes', 'Contribuintes'], ['relatorios', 'Relatórios'], ['fechamento', 'Fechamento'], ['informacoes', 'Informações']],
      bar: [['gestao', 'Painel'], ['conferencia', 'Conferência'], ['lancamentos', 'Entradas'], ['saidas', 'Saídas']]
    },
    pastoral: {
      name: 'Liderança Pastoral', short: 'Liderança Pastoral',
      views: [['gestao', 'Painel'], ['membresia', 'Membresia'], ['recepcao', 'Check-in e visitantes'], ['cuidado', 'Cuidado e oração'], ['aprovacoes', 'Aprovar despesas'], ['palavra', 'Palavra do dia'], ['comunicados', 'Avisos'], ['solicitacoes', 'Cadastros'], ['informacoes', 'Informações']],
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
    lancamentos: ['TESOURARIA', 'Entradas', 'Dízimos, ofertas e doações por conta, forma e situação.'],
    saidas: ['TESOURARIA', 'Saídas e contas a pagar', 'Registre com nota ou recibo, aprove, pague e confira no extrato.'],
    orcamento: ['TESOURARIA', 'Orçamento por ministério', 'Previsto e realizado no mês, por ministério.'],
    contribuintes: ['TESOURARIA', 'Contribuintes', 'Histórico por pessoa e declaração anual. Só a tesouraria vê.'],
    relatorios: ['TESOURARIA', 'Relatórios', 'Demonstrativo do mês, fundo da obra e prestação de contas.'],
    aprovacoes: ['LIDERANÇA PASTORAL', 'Aprovar despesas', 'Despesas acima de R$ 500 e todo uso do fundo da obra passam por aqui.'],
    fechamento: ['TESOURARIA', 'Fechamento do mês', 'Feche o mês conciliado e gere o arquivo para a contabilidade.'],
    cuidado: ['CUIDADO PASTORAL', 'Cuidado e oração', 'Acompanhe os pedidos do caderno de oração e cuide do mural.']
  };
  const descriptions = { conferencia: 'Extrato e conciliação', lancamentos: 'Dízimos, ofertas e espécie', saidas: 'Contas a pagar', orcamento: 'Previsto e realizado', contribuintes: 'Histórico e declaração', relatorios: 'Demonstrativo e prestação de contas', aprovacoes: 'Despesas para aprovar', fechamento: 'Mês e contabilidade', recepcao: 'Presença e visitantes', gestao: 'O que precisa de atenção', membresia: 'Integração e apresentação', solicitacoes: 'Atualizações de cadastro', programacao: 'Calendário dos membros', comunicados: 'Avisos no sino do app', palavra: 'Versículo escolhido', cuidado: 'Pedidos de oração' };
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
      if (view === 'gestao' && state.context === 'tesouraria') return ['TESOURARIA', 'Painel da Tesouraria', 'Saldos, entradas, saídas e o que precisa de atenção.'];
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
      const giving = `<section class="box dash-box">${head('GENEROSIDADE · CONSOLIDADO', `Contribuições em ${g.month}`)}<p class="dash-big">${brl(g.total)} ${pill(gdiff, '%')}</p><p class="dash-sub">${g.givers} contribuintes · comparado à média dos 3 meses anteriores</p>${stack(g.parts, brl)}<p class="dash-sub tes-gsub">Despesas em ${g.month}: <strong class="tes-neg">${brl(g.out)}</strong> · Resultado: <strong class="${g.total - g.out < 0 ? 'tes-neg' : 'tes-pos'}">${brl(g.total - g.out)}</strong></p><p class="note dash-foot">Só totais, sem nomes nem valores individuais. O detalhe fica com a tesouraria.</p></section>`;
      return `<section class="dash" aria-labelledby="dash-title"><div class="section-heading"><div><span class="label">RESUMO DA IGREJA</span><h2 id="dash-title">Como a igreja está hoje</h2></div><span class="dash-demo">Números fictícios de exemplo</span></div><div class="dash-tiles">${tiles}</div></section>${afterTiles}<section class="dash dash-more" aria-label="Indicadores">
      <div class="admin-grid dash-row"><section class="box dash-box">${head('CULTOS DE DOMINGO', 'Presença nas últimas 8 semanas', `<div class="dash-head-aside"><strong>${last}</strong>${pill(lastDiff, '%')}</div>`)}${attendanceChart(avg)}<div class="dash-foot dash-minis"><div><small>Maior</small><strong>${Math.max(...s)}</strong></div><div><small>Menor</small><strong>${Math.min(...s)}</strong></div><div><small>Média</small><strong>${Math.round(s.reduce((a, b) => a + b, 0) / s.length)}</strong></div></div></section><section class="box dash-box">${head('CAMINHO ATÉ A MEMBRESIA', 'Integração')}<ol class="dash-funnel">${funnel}</ol><p class="dash-sub">A porcentagem compara cada etapa com a anterior.</p>${foot('Ver membresia', 'membresia')}</section></div>
      <div class="admin-grid dash-row"><section class="box dash-box">${head('CÉLULAS', 'Vida em célula')}<div class="dash-cells">${ring(demo.cellMembers)}<ul class="dash-stats is-compact">${stat(I.cells, demo.cells, 'células ativas')}${stat(I.members, demo.cellPeople, 'participantes')}${stat(I.regular, demo.members - Math.round(demo.members * demo.cellMembers / 100), 'membros sem célula', 'warn')}</ul></div><p class="note dash-foot">${demo.cellsMulti} multiplicações neste ano. Na versão real, os números vêm da plataforma de células.</p></section>${third}</div>
      <div class="admin-grid dash-row">${service}${giving}</div></section>`;
    }

    // ---------- Tesouraria ----------
    // Plano de contas sugerido (validar com a contabilidade). Receitas no grupo 3, despesas no 4, contrapartidas no ativo.
    const ACCOUNTS = {
      'Dízimo': { code: '3.1.01', name: 'Dízimos' },
      'Oferta': { code: '3.1.02', name: 'Ofertas' },
      'Campanha': { code: '3.1.03', name: 'Doações vinculadas · Obra do templo', restricted: true }
    };
    const EXPENSES = {
      '4.1.01': { name: 'Sustento pastoral', group: 'Pessoal' },
      '4.1.02': { name: 'Encargos sociais (INSS e FGTS)', group: 'Pessoal' },
      '4.2.01': { name: 'Energia elétrica', group: 'Templo e administração' },
      '4.2.02': { name: 'Água e esgoto', group: 'Templo e administração' },
      '4.2.03': { name: 'Internet e telefone', group: 'Templo e administração' },
      '4.2.04': { name: 'Manutenção e conservação', group: 'Templo e administração' },
      '4.3.01': { name: 'Missões e repasse denominacional', group: 'Missão' },
      '4.3.02': { name: 'Ação social', group: 'Missão' },
      '4.4.01': { name: 'Ministérios e eventos', group: 'Ministérios' },
      '4.4.02': { name: 'Material de consumo e limpeza', group: 'Templo e administração' },
      '4.5.01': { name: 'Tarifas bancárias', group: 'Financeiras' },
      '4.6.01': { name: 'Obra do templo (uso do fundo vinculado)', group: 'Fundo vinculado', restricted: true }
    };
    const OBRA = 'Obra do templo';
    // Orçamento mensal por ministério (aprovado em assembleia; valores de exemplo).
    const BUDGET = [['Administração', 14800], ['Templo', 4600], ['Missões', 3400], ['Ação social', 1500], ['Louvor', 500], ['Infantil', 500], ['Jovens', 700], ['Células', 400]];
    const MINISTRIES = [...BUDGET.map(([m]) => m), OBRA];
    const LIMIT = 500; // acima disso, a despesa passa pela Liderança Pastoral; o fundo da obra passa sempre.
    const OPEN = { bank: 52340, fund: 18650 }; // saldos em 01/10/2026, quando a tesouraria começou no app.
    const HISTORY = [['2026-05', 38900, 36100], ['2026-06', 39750, 37400], ['2026-07', 37200, 38900], ['2026-08', 40100, 35800], ['2026-09', 39600, 36900]];
    const BANK = { code: '1.1.02', name: 'Banco Sicoob c/c 51.404-7' }, CASH = { code: '1.1.01', name: 'Caixa (espécie)' };
    const isTes = () => state.context === 'tesouraria';
    const money = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const signed = v => (v < 0 ? '− ' : '') + money(Math.abs(v));
    // Cores únicas da tesouraria: entrada e positivo em verde, saída e negativo em vermelho.
    const sv = v => `<span class="${v < 0 ? 'tes-neg' : 'tes-pos'}">${signed(v)}</span>`;
    const outv = v => `<span class="tes-neg">− ${money(v)}</span>`, inv = v => `<span class="tes-pos">${money(v)}</span>`;
    const ymLabel = ym => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Porto_Velho', month: 'long', year: 'numeric' }).format(new Date(ym + '-15T12:00:00-04:00'));
    const ymShort = ym => ymLabel(ym).split(' de ')[0];
    const fmtDay = d => d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4);
    const todayKey = () => api.NibDaily.dayKey(new Date());
    const daysFrom = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 864e5);
    const typeName = t => t === 'Campanha' ? 'Obra do templo' : t;
    // Lançamentos fictícios: outubro fechado (bate com o consolidado do painel) e novembro em aberto.
    const ledger = (() => {
      const L = [], first = ['Ana','Bruno','Carla','Daniel','Elisa','Fábio','Gabriela','Hugo','Isabel','José','Karen','Lucas','Marta','Nelson','Olívia','Pedro','Raquel','Sérgio','Tânia','Vítor'];
      let seq = 0; const add = e => L.push({ id: 'L' + (++seq), status: 'conciliado', by: 'Tesouraria', conferred: '', ...e });
      // Outubro: 120 dizimistas, 22 contribuições para a obra (142 contribuintes distintos), ofertas de 4 cultos.
      const giverName = i => first[i % first.length] + ' ' + ['Exemplo','Teste','Modelo','Amostra','Fictício','Demo'][Math.floor(i / first.length) % 6];
      let diz = 0; for (let i = 0; i < 120; i++) { const v = i === 119 ? 33620 - diz : [150, 200, 250, 280, 300, 320, 350, 400][i % 8]; diz += v; add({ day: '2026-10-' + String(1 + i % 28).padStart(2, '0'), type: 'Dízimo', amount: v, method: i % 5 ? 'Pix no app' : 'Pix direto no banco', payer: giverName(i), payerId: 'M' + String(i + 1).padStart(4, '0'), doc: 'E2E' + String(810000 + i), source: i % 5 ? 'app' : 'extrato' }); }
      let obra = 0; for (let i = 0; i < 22; i++) { const v = i === 21 ? 2800 - obra : [100, 150, 120][i % 3]; obra += v; add({ day: '2026-10-' + String(3 + i).padStart(2, '0'), type: 'Campanha', amount: v, method: 'Pix no app', payer: giverName(120 + i), payerId: 'M' + String(121 + i).padStart(4, '0'), doc: 'E2E' + String(820000 + i), source: 'app' }); }
      [['2026-10-04', 1180], ['2026-10-11', 1240], ['2026-10-18', 1210], ['2026-10-25', 1330]].forEach(([d, v]) => add({ day: d, type: 'Oferta', amount: v, method: 'Espécie (culto)', payer: 'Oferta do culto', payerId: '', doc: 'CONT-' + d.replace(/-/g, ''), source: 'manual', conferred: 'Conferido por Ana Exemplo e José Exemplo' }));
      // Novembro: ainda em aberto.
      add({ day: '2026-11-02', type: 'Dízimo', amount: 300, method: 'Pix no app', payer: 'Bruno Exemplo', payerId: 'M0002', doc: 'E2E900001', source: 'app' });
      add({ day: '2026-11-02', type: 'Campanha', amount: 150, method: 'Pix no app', payer: 'Carla Exemplo', payerId: 'M0003', doc: 'E2E900002', source: 'app' });
      add({ day: '2026-11-03', type: 'Dízimo', amount: 250, method: 'Pix no app', payer: 'Ana Exemplo', payerId: 'M0001', doc: 'E2E900003', source: 'app', status: 'pendente' });
      add({ day: '2026-11-01', type: 'Oferta', amount: 1265.5, method: 'Espécie (culto)', payer: 'Oferta do culto', payerId: '', doc: 'CONT-20261101', source: 'manual', status: 'aguardando depósito', conferred: 'Conferido por Ana Exemplo e José Exemplo' });
      return L;
    })();
    // Saídas fictícias: outubro pago e conferido; novembro com contas a pagar e aprovações pendentes.
    const expenses = (() => {
      const X = []; let n = 0;
      const add = (row, extra = {}) => { const [day, payee, desc, acc, ministry, amount, doc, method] = row; X.push({ id: 'X' + (++n), day, due: day, paid: day, payee, desc, acc, ministry, amount, doc, method, attach: doc ? doc.replace(/\s+/g, '-') + '.pdf' : '', status: 'conciliada', approvedBy: amount > LIMIT || EXPENSES[acc].restricted ? 'Liderança Pastoral' : 'Tesouraria (dentro do limite)', by: 'Tesouraria', ...extra }); };
      [
        ['2026-10-05', 'Pastor titular (exemplo)', 'Sustento pastoral de outubro', '4.1.01', 'Administração', 12000, 'RPA 10/2026', 'Transferência'],
        ['2026-10-20', 'Receita Federal', 'INSS e FGTS de setembro', '4.1.02', 'Administração', 2100, 'GPS 09/2026', 'Boleto'],
        ['2026-10-10', 'Distribuidora de energia (exemplo)', 'Energia do templo', '4.2.01', 'Templo', 1850, 'Fatura 4471-10', 'Boleto'],
        ['2026-10-08', 'Companhia de água (exemplo)', 'Água do templo', '4.2.02', 'Templo', 320, 'Fatura 88-10', 'Boleto'],
        ['2026-10-12', 'Provedor Exemplo', 'Internet da secretaria', '4.2.03', 'Administração', 240, 'NF 3310', 'Boleto'],
        ['2026-10-16', 'Clima Frio Exemplo', 'Manutenção dos ar-condicionados', '4.2.04', 'Templo', 1600, 'NF 1182', 'Pix'],
        ['2026-10-06', 'Convenção (exemplo)', 'Missões e repasse de outubro', '4.3.01', 'Missões', 3362, 'Recibo 10/2026', 'Transferência'],
        ['2026-10-22', 'Mercado Exemplo', 'Cestas básicas da ação social', '4.3.02', 'Ação social', 1500, 'NF 77102', 'Pix'],
        ['2026-10-09', 'Papelaria Exemplo', 'Material do ministério infantil', '4.4.01', 'Infantil', 420, 'NF 5521', 'Pix'],
        ['2026-10-17', 'Chácara Exemplo', 'Retiro dos jovens', '4.4.01', 'Jovens', 950, 'Recibo 031', 'Pix'],
        ['2026-10-14', 'Som e Cia Exemplo', 'Cordas e manutenção de instrumentos', '4.4.01', 'Louvor', 380, 'NF 902', 'Pix'],
        ['2026-10-13', 'Atacado Exemplo', 'Material de limpeza', '4.4.02', 'Templo', 680, 'NF 66120', 'Pix'],
        ['2026-10-31', 'Sicoob', 'Tarifas do mês', '4.5.01', 'Administração', 98.4, 'Extrato 10/2026', 'Débito automático'],
        ['2026-10-24', 'Materiais de Construção Exemplo', 'Cimento e ferragens da obra', '4.6.01', OBRA, 5500, 'NF 20931', 'Pix']
      ].forEach(r => add(r));
      add(['2026-11-01', 'Pastor titular (exemplo)', 'Sustento pastoral de novembro', '4.1.01', 'Administração', 12000, 'RPA 11/2026', 'Transferência'], { due: '2026-11-05', paid: '', status: 'a pagar', approvedAt: '01/11/2026 10:05' });
      add(['2026-11-01', 'Distribuidora de energia (exemplo)', 'Energia do templo', '4.2.01', 'Templo', 1920.4, 'Fatura 4471-11', 'Boleto'], { due: '2026-11-10', paid: '', status: 'a pagar', approvedAt: '01/11/2026 10:06' });
      add(['2026-11-02', 'Companhia de água (exemplo)', 'Água do templo', '4.2.02', 'Templo', 312.15, 'Fatura 88-11', 'Boleto'], { due: '2026-11-06', paid: '', status: 'a pagar' });
      add(['2026-11-03', 'Atacado Exemplo', 'Material de limpeza', '4.4.02', 'Templo', 286.9, 'NF 66391', 'Pix'], { status: 'paga' });
      add(['2026-11-03', 'Materiais de Construção Exemplo', 'Telhas e calhas da obra', '4.6.01', OBRA, 3480, 'Orçamento 2211', 'Pix'], { due: '2026-11-12', paid: '', status: 'aguardando aprovação', approvedBy: '' });
      add(['2026-11-03', 'Mercado Exemplo', 'Cestas básicas de novembro', '4.3.02', 'Ação social', 640, 'Pedido 1180', 'Pix'], { due: '2026-11-09', paid: '', status: 'aguardando aprovação', approvedBy: '' });
      return X;
    })();
    // Extrato do banco (simulado). Valor negativo = débito. Na versão real: arquivo OFX do Sicoob ou integração com o banco.
    const bank = [
      { id: 'B1', day: '2026-11-02', text: 'PIX RECEBIDO BRUNO EXEMPLO', amount: 300, doc: 'E2E900001', match: 'L' + (120 + 22 + 4 + 1) },
      { id: 'B2', day: '2026-11-02', text: 'PIX RECEBIDO CARLA EXEMPLO', amount: 150, doc: 'E2E900002', match: 'L' + (120 + 22 + 4 + 2) },
      { id: 'B3', day: '2026-11-03', text: 'PIX RECEBIDO ANA EXEMPLO', amount: 250, doc: 'E2E900003', match: null },
      { id: 'B4', day: '2026-11-03', text: 'DEPOSITO EM DINHEIRO AG 3315', amount: 1265.5, doc: 'DEP-0311', match: null },
      { id: 'B5', day: '2026-11-03', text: 'PIX RECEBIDO JESSICA EXEMPLO', amount: 100, doc: 'E2E900007', match: null },
      { id: 'B6', day: '2026-11-03', text: 'PIX ENVIADO ATACADO EXEMPLO', amount: -286.9, doc: 'E2E700311', match: null },
      { id: 'B7', day: '2026-11-03', text: 'TARIFA PACOTE DE SERVICOS', amount: -54.9, doc: 'TAR-1103', match: null }
    ];
    data.closed = { '2026-10': { by: 'Tesouraria', at: '03/11/2026 09:12' } };
    data.ledger = ledger; data.bank = bank; data.expenses = expenses;
    data.audit = [
      { at: '01/11/2026 10:05', who: 'Liderança Pastoral', what: 'Aprovou: Sustento pastoral de novembro · R$ 12.000,00' },
      { at: '01/11/2026 10:06', who: 'Liderança Pastoral', what: 'Aprovou: Energia do templo · R$ 1.920,40' },
      { at: '02/11/2026 08:40', who: 'Tesouraria', what: 'Conciliou 2 Pix do extrato de 02/11' },
      { at: '03/11/2026 09:12', who: 'Tesouraria', what: 'Fechou outubro de 2026 e gerou o arquivo da contabilidade' },
      { at: '03/11/2026 11:20', who: 'Tesouraria', what: 'Registrou pagamento: Material de limpeza · R$ 286,90' },
      { at: '03/11/2026 15:02', who: 'Tesouraria', what: 'Enviou para aprovação: Telhas e calhas da obra · R$ 3.480,00' }
    ];
    const log = what => data.audit.push({ at: now(), who: actor(), what });
    const monthOf = e => e.day.slice(0, 7);
    const openMonth = () => todayKey().slice(0, 7);
    const lastClosed = () => Object.keys(data.closed).sort().pop();
    const entriesOf = ym => data.ledger.filter(e => monthOf(e) === ym);
    const okSum = list => list.filter(e => e.status === 'conciliado').reduce((t, e) => t + e.amount, 0);
    const pendingEntries = () => data.ledger.filter(e => e.status !== 'conciliado');
    const bankOpen = () => data.bank.filter(b => !b.match);
    const paidOf = ym => data.expenses.filter(x => x.status === 'conciliada' && x.paid.slice(0, 7) === ym);
    const outSum = ym => paidOf(ym).reduce((t, x) => t + x.amount, 0);
    const inSum = ym => okSum(entriesOf(ym));
    const awaitingApproval = () => data.expenses.filter(x => x.status === 'aguardando aprovação');
    const toPay = () => data.expenses.filter(x => x.status === 'a pagar').sort((a, b) => a.due.localeCompare(b.due));
    const months = () => [...new Set([...data.ledger.map(monthOf), ...data.expenses.filter(x => x.paid).map(x => x.paid.slice(0, 7))])].sort();
    const bankStart = ym => OPEN.bank + months().filter(m => m < ym).reduce((t, m) => t + inSum(m) - outSum(m), 0);
    const bankBalance = () => OPEN.bank + months().reduce((t, m) => t + inSum(m) - outSum(m), 0);
    const cashOnHand = () => data.ledger.filter(e => e.status === 'aguardando depósito').reduce((t, e) => t + e.amount, 0);
    const fundIn = (filter = () => true) => data.ledger.filter(e => e.type === 'Campanha' && e.status === 'conciliado' && filter(e)).reduce((t, e) => t + e.amount, 0);
    const fundUses = () => data.expenses.filter(x => EXPENSES[x.acc].restricted && x.status === 'conciliada');
    const fundBalance = () => OPEN.fund + fundIn() - fundUses().reduce((t, x) => t + x.amount, 0);
    const fundCommitted = (except) => data.expenses.filter(x => EXPENSES[x.acc].restricted && ['a pagar', 'paga'].includes(x.status) && x !== except).reduce((t, x) => t + x.amount, 0);
    // Sugestão de correspondência: mesmo documento (E2E) ou mesmo valor em até 3 dias.
    function suggest(b) {
      if (b.amount < 0) return data.expenses.find(x => x.status === 'paga' && Math.abs(x.amount + b.amount) < 0.005 && Math.abs(daysFrom(x.paid, b.day)) <= 3);
      const cands = pendingEntries().filter(e => !data.bank.some(x => x.match === e.id));
      return cands.find(e => e.doc && e.doc === b.doc) || cands.find(e => Math.abs(e.amount - b.amount) < 0.005 && Math.abs(new Date(e.day) - new Date(b.day)) <= 3 * 864e5);
    }
    // Consolidado para a gestão: sempre o último mês fechado, só totais.
    function consolidated() {
      const ym = lastClosed(), list = entriesOf(ym).filter(e => e.status === 'conciliado');
      const by = t => list.filter(e => e.type === t).reduce((s, e) => s + e.amount, 0);
      return { month: ymShort(ym), total: okSum(list), out: outSum(ym), givers: new Set(list.filter(e => e.payerId).map(e => e.payerId)).size, avg3: demo.giving.avg3, parts: [['Dízimos', by('Dízimo')], ['Ofertas', by('Oferta')], ['Obra do templo', by('Campanha')]] };
    }
    // Pix feito pelo membro no app: entra como pendente até a conciliação com o extrato.
    function addAppPix(p) {
      const e = { id: 'L' + (data.ledger.length + 1), day: p.day, type: p.type, amount: p.amount, method: 'Pix no app', payer: state.member.full, payerId: 'M0201', doc: p.txid, source: 'app', status: 'pendente', by: 'App do membro', conferred: '', member: true };
      data.ledger.push(e); return e.id;
    }
    function confirmEntry(e, b) {
      e.status = 'conciliado'; e.confirmedAt = now(); e.bankDoc = b ? b.doc : ''; if (b) b.match = e.id;
      if (e.member) api.giftConfirmed(e);
    }
    const statusTag = s => `<span class="tag ${s === 'conciliado' ? 'status-active' : 'is-wait'}">${s === 'conciliado' ? 'Conciliado' : s === 'pendente' ? 'A conferir' : 'Aguardando depósito'}</span>`;
    const expTag = x => {
      if (x.status === 'conciliada') return '<span class="tag status-active">Paga e conferida</span>';
      if (x.status === 'paga') return '<span class="tag is-wait">Paga · aguardando extrato</span>';
      if (x.status === 'aguardando aprovação') return '<span class="tag is-info">Aguardando aprovação</span>';
      if (x.status === 'devolvida') return '<span class="tag is-late">Devolvida</span>';
      const d = daysFrom(todayKey(), x.due);
      return d < 0 ? `<span class="tag is-late">Vencida há ${-d} dia${d === -1 ? '' : 's'}</span>` : d === 0 ? '<span class="tag is-late">Vence hoje</span>' : d <= 7 ? `<span class="tag is-wait">Vence em ${d} dia${d === 1 ? '' : 's'}</span>` : `<span class="tag">Vence em ${fmtDay(x.due).slice(0, 5)}</span>`;
    };
    const expMeta = x => [x.status === 'a pagar' || x.status === 'aguardando aprovação' ? 'Vencimento ' + fmtDay(x.due) : '', x.paid ? 'Pago em ' + fmtDay(x.paid) : '', x.approvedBy ? 'Aprovado: ' + x.approvedBy : '', x.attach ? 'Comprovante anexado' : 'Sem comprovante'].filter(Boolean).map(t => `<span${t === 'Sem comprovante' ? ' class="tes-miss"' : ''}>${escape(t)}</span>`).join('');
    const expCard = (x, actions = '') => `<li class="box tes-line"><div class="tes-line-head"><div><small>${escape(x.ministry)} · ${x.acc} ${escape(EXPENSES[x.acc].name)}</small><strong>${escape(x.desc)}</strong><small>${escape(x.payee)} · ${escape(x.method)} · ${escape(x.doc)}</small></div><span class="tes-amount is-out">${money(x.amount)}</span></div><div class="tes-exp-meta">${expTag(x)}${expMeta(x)}</div>${x.returned ? `<p class="tes-block">Devolvida pela Liderança Pastoral: ${escape(x.returned)}</p>` : ''}${actions}</li>`;
    const ttile = (icon, label, value, note, view, tone) => `<${view ? `button type="button" class="dash-tile is-link" data-view="${view}"` : 'div class="dash-tile"'}><span class="dash-tile-top"><span class="dash-ico${tone ? ' is-' + tone : ''}">${ico(icon)}</span><span class="dash-tile-label">${label}</span></span><strong class="dash-tile-value tes-value">${value}</strong><span class="dash-tile-note"><small>${note}</small></span></${view ? 'button' : 'div'}>`;
    const tabs = (key, list, current) => `<div class="history-years" role="group" aria-label="Escolha">${list.map(([k, l]) => `<button type="button" class="history-year${k === current ? ' is-active' : ''}" data-${key}="${k}" aria-pressed="${k === current}">${escape(l)}</button>`).join('')}</div>`;
    const printBtn = label => `<button type="button" class="action admin-secondary tes-print-btn" data-tes-print="1">${ico('M6 9V3h12v6 M6 18H4v-7h16v7h-2 M6 14h12v7H6z')}<span>${label}</span></button>`;

    // Celular: versão resumida. Telas de tabela e relatório ficam no computador.
    const narrow = () => typeof matchMedia === 'function' && matchMedia('(max-width: 820px)').matches;
    function deskNotice(view) {
      const ym = openMonth(), lc = lastClosed();
      const facts = {
        relatorios: [['Resultado de ' + ymShort(ym), signed(inSum(ym) - outSum(ym))], ['Saldo em banco', money(bankBalance())], ['Fundo da obra', money(fundBalance())]],
        fechamento: [['Último mês fechado', ymLabel(lc)], ['Fechado em', data.closed[lc].at]],
        orcamento: [['Previsto por mês', money(BUDGET.reduce((t, [, b]) => t + b, 0))], ['Realizado em ' + ymShort(ym), money(paidOf(ym).filter(x => !EXPENSES[x.acc].restricted).reduce((t, x) => t + x.amount, 0))]],
        contribuintes: [['Contribuintes no ano', String(givers().length)]]
      }[view] || [];
      return `<section class="box tes-desk"><span class="tes-desk-ico" aria-hidden="true">${ico('M3 4h18v12H3z M8 20h8 M12 16v4')}</span><h2>Esta tela fica no computador</h2><p>${escape(labels[view][1])} tem tabelas, arquivos e impressão, que funcionam melhor na tela grande. Abra o app no computador com a mesma conta.</p>${facts.length ? `<dl class="tes-kv">${facts.map(([k, v]) => `<div><dt>${escape(k)}</dt><dd>${escape(v)}</dd></div>`).join('')}</dl>` : ''}<div class="tes-actions">${button('Voltar ao painel', 'gestao')}</div></section>`;
    }
    const deskOnly = (view, fn) => () => narrow() ? deskNotice(view) : fn();
    // Entradas e saídas dos últimos meses (barras lado a lado).
    function flowChart() {
      const rows = [...HISTORY, ...months().map(m => [m, inSum(m), outSum(m)])].slice(-7);
      const narrow = typeof innerWidth === 'number' && innerWidth < 600, W = narrow ? 340 : 560, top = 14, base = 170, left = 40, n = rows.length;
      const max = Math.ceil(Math.max(...rows.flatMap(r => [r[1], r[2]])) / 10000) * 10000, slot = (W - left) / n, bw = Math.min(narrow ? 13 : 20, slot / 3);
      const y = v => base - (v / max) * (base - top);
      const grid = [0, max / 2, max].map(v => `<line x1="${left}" x2="${W}" y1="${y(v)}" y2="${y(v)}" class="dash-grid${v ? '' : ' is-base'}"/><text x="${left - 8}" y="${y(v) + 4}" class="dash-axis" text-anchor="end">${v / 1000}k</text>`).join('');
      const bar = (x, v, cls) => { const yt = y(v), r = 3; return `<path class="${cls}" d="M${x},${base} V${yt + r} Q${x},${yt} ${x + r},${yt} H${x + bw - r} Q${x + bw},${yt} ${x + bw},${yt + r} V${base} Z"/>`; };
      const open = openMonth();
      const bars = rows.map(([m, i, o], k) => { const cx = left + slot * k + slot / 2; return `<g role="img" aria-label="${escape(ymShort(m))}: entradas ${money(i)}, saídas ${money(o)}">${bar(cx - bw - 1, i, 'tes-bar-in')}${bar(cx + 1, o, 'tes-bar-out')}<text x="${cx}" y="${base + 18}" text-anchor="middle" class="dash-axis${m === open ? ' is-strong' : ''}">${escape(ymShort(m).slice(0, 3))}${m === open ? '*' : ''}</text></g>`; }).join('');
      return `<svg class="dash-chart" viewBox="0 0 ${W} ${base + 26}" role="group" aria-label="Entradas e saídas por mês">${grid}${bars}</svg><div class="dash-legend"><span><i class="sw is-in"></i>Entradas</span><span><i class="sw is-out"></i>Saídas</span><span>* mês em aberto</span></div><table class="visually-hidden"><caption>Entradas e saídas por mês</caption><tr><th>Mês</th><th>Entradas</th><th>Saídas</th></tr>${rows.map(([m, i, o]) => `<tr><td>${escape(ymLabel(m))}</td><td>${money(i)}</td><td>${money(o)}</td></tr>`).join('')}</table>`;
    }
    function treasuryPanel() {
      const ym = openMonth(), pend = pendingEntries(), open = bankOpen(), ap = awaitingApproval(), pay = toPay(), t = todayKey();
      const soon = pay.filter(x => daysFrom(t, x.due) <= 7), late = pay.filter(x => daysFrom(t, x.due) < 0), lc = lastClosed();
      const result = inSum(ym) - outSum(ym), prevOpen = months().filter(m => m < ym && !data.closed[m]);
      const tiles = `<div class="dash-tiles">${ttile(P.conferencia, 'Saldo em banco', money(bankBalance()), 'Conciliado com o extrato', 'relatorios')}${ttile(P.lancamentos, 'Caixa a depositar', money(cashOnHand()), 'Espécie contada, ainda fora do banco', 'lancamentos', cashOnHand() ? 'warn' : '')}${ttile(P.generosidade, 'Entradas do mês', inv(inSum(ym)), `Conciliadas em ${escape(ymShort(ym))}`, 'lancamentos')}${ttile(P.saidas, 'Saídas do mês', outSum(ym) ? `<span class="tes-neg">${money(outSum(ym))}</span>` : money(0), `Pagas e conferidas em ${escape(ymShort(ym))}`, 'saidas')}${ttile(P.relatorios, 'Resultado do mês', sv(result), result >= 0 ? 'Entradas maiores que saídas' : 'Saídas maiores que entradas', 'relatorios', result < 0 ? 'warn' : '')}</div>`;
      const tasks = [
        task('conferencia', pend.length + open.length, 'Conferir com o extrato', `${open.length} linha${open.length === 1 ? '' : 's'} do banco e ${pend.length} lançamento${pend.length === 1 ? '' : 's'} esperando`, pend.length + open.length ? 'warn' : ''),
        task('saidas', soon.length, late.length ? `${late.length} conta${late.length === 1 ? '' : 's'} vencida${late.length === 1 ? '' : 's'}` : 'Contas a vencer em 7 dias', soon.length ? `${money(soon.reduce((s, x) => s + x.amount, 0))} a pagar até ${fmtDay(soon[soon.length - 1].due).slice(0, 5)}` : 'Nenhuma conta vencendo nesta semana', late.length ? 'warn' : ''),
        task('saidas', ap.length, 'Aguardando a Liderança Pastoral', ap.length ? ap.map(x => x.desc).join(' · ') : 'Nenhuma despesa aguardando aprovação'),
        task('fechamento', prevOpen.length, prevOpen.length ? 'Mês anterior em aberto' : 'Último fechamento', prevOpen.length ? `Feche ${ymShort(prevOpen[0])} antes de seguir` : `${ymLabel(lc)} fechado em ${data.closed[lc].at.slice(0, 10)}`, prevOpen.length ? 'warn' : '')
      ].join('');
      const fund = fundBalance(), committed = fundCommitted();
      const next = pay.slice(0, 4).map(x => `<li><span class="admin-when"><small>${escape(monthShort(x.due))}</small><strong>${dayNum(x.due)}</strong></span><span><b>${escape(x.desc)}</b><small>${escape(x.payee)} · ${money(x.amount)}</small></span></li>`).join('');
      const acts = data.audit.slice(-4).reverse().map(a => `<li><span>${escape(a.what)}</span><small>${escape(a.who)} · ${escape(a.at)}</small></li>`).join('');
      return `<section class="dash"><div class="section-heading"><div><span class="label">TESOURARIA</span><h2>Como está o financeiro</h2></div><span class="dash-demo">Valores fictícios de exemplo</span></div>${tiles}</section>
      <section class="tes-tasks" aria-labelledby="tes-tasks-title"><div class="section-heading"><div><span class="label">HOJE</span><h2 id="tes-tasks-title">Precisa da sua atenção</h2></div></div><div class="admin-tasks">${tasks}</div></section>
      <div class="admin-grid dash-row"><section class="box dash-box">${head('ÚLTIMOS 7 MESES', 'Entradas e saídas')}${flowChart()}<p class="note dash-foot">Maio a setembro vêm do controle anterior da tesouraria. A partir de outubro, tudo sai dos lançamentos do app.</p></section>
      <section class="box dash-box">${head('FUNDO VINCULADO', OBRA)}<p class="dash-big">${money(fund)}</p><p class="dash-sub">Saldo do fundo, dentro da conta do banco. Só pode ser usado na obra.</p><dl class="tes-kv"><div><dt>Doações recebidas desde 01/10</dt><dd>${inv(fundIn())}</dd></div><div><dt>Usado na obra desde 01/10</dt><dd>${outv(fundUses().reduce((s, x) => s + x.amount, 0))}</dd></div><div><dt>Comprometido (aprovado, a pagar)</dt><dd>${outv(committed)}</dd></div><div class="is-total"><dt>Disponível</dt><dd>${money(fund - committed)}</dd></div></dl>${foot('Prestação de contas da obra', 'relatorios')}</section></div>
      <div class="admin-grid dash-row"><section class="box dash-box">${head('PRÓXIMOS PAGAMENTOS', 'Contas a pagar')}<ul class="admin-upcoming">${next || '<li>Nenhuma conta a pagar.</li>'}</ul>${foot('Ver saídas', 'saidas')}</section>
      <section class="box dash-box tes-desk-only">${head('REGISTRO', 'Últimas ações')}<ul class="tes-audit">${acts}</ul><p class="note dash-foot">Nada é apagado. Cada lançamento, aprovação e conferência fica registrado com quem fez e quando.</p></section></div>
      <p class="note">A Secretaria e a Liderança Pastoral veem só o consolidado do último mês fechado, sem nomes nem valores individuais. O membro vê apenas as próprias contribuições.</p>`;
    }
    function reconcilePage() {
      const open = bankOpen(), suggested = open.map(suggest).filter(Boolean).map(e => e.id), pendApp = pendingEntries().filter(e => !data.bank.some(b => b.match === e.id) && !suggested.includes(e.id));
      const paidWait = data.expenses.filter(x => x.status === 'paga' && !suggested.includes(x.id));
      const types = Object.keys(ACCOUNTS).map(t => `<option value="${t}">${t === 'Campanha' ? 'Campanha · Obra do templo' : t}</option>`).join('');
      const accOpts = Object.entries(EXPENSES).map(([c, a]) => `<option value="${c}"${c === '4.5.01' ? ' selected' : ''}>${c} ${escape(a.name)}</option>`).join('');
      const minOpts = MINISTRIES.map(m => `<option>${escape(m)}</option>`).join('');
      const lines = open.map(b => {
        const s = suggest(b), out = b.amount < 0;
        const matchHtml = s ? (out
          ? `<div class="tes-match"><span class="tes-match-label">Corresponde ao pagamento</span><strong>${escape(s.desc)} · ${escape(s.payee)}</strong><small>${s.acc} ${escape(EXPENSES[s.acc].name)} · ${escape(s.ministry)} · pago em ${fmtDay(s.paid)}</small><button type="button" class="action primary" data-tes-confirm-exp="${b.id}" data-exp="${s.id}">Confirmar conciliação</button></div>`
          : `<div class="tes-match"><span class="tes-match-label">Corresponde a</span><strong>${escape(typeName(s.type))} · ${escape(s.payer)}</strong><small>${escape(s.method)} · lançado em ${fmtDay(s.day)}${s.conferred ? ' · ' + escape(s.conferred) : ''}</small><button type="button" class="action primary" data-tes-confirm="${b.id}" data-entry="${s.id}">Confirmar conciliação</button></div>`)
          : out
            ? `<form class="tes-identify-exp" data-bank="${b.id}"><span class="tes-match-label">Débito sem despesa lançada. Classifique:</span><div class="tes-fields"><label>Conta<select name="acc">${accOpts}</select></label><label>Ministério<select name="ministry">${minOpts}</select></label></div><button type="submit" class="action primary">Lançar e conciliar</button><p class="note">Tarifas e débitos automáticos entram assim. Outros pagamentos devem passar por Saídas, com nota ou recibo.</p></form>`
            : `<form class="tes-identify" data-bank="${b.id}"><span class="tes-match-label">Sem lançamento correspondente. Identifique o crédito:</span><div class="tes-fields"><label>Finalidade<select name="type">${types}</select></label><label>Contribuinte<select name="payer"><option value="">Não identificado</option><option>${escape(state.member.full)}</option><option>Carlos Exemplo</option><option>Marcos Exemplo</option></select></label></div><button type="submit" class="action primary">Lançar e conciliar</button></form>`;
        return `<li class="box tes-line"><div class="tes-line-head"><div><small>${fmtDay(b.day)} · Extrato Sicoob · ${out ? 'Débito' : 'Crédito'}</small><strong>${escape(b.text)}</strong><small>Documento ${escape(b.doc)}</small></div><span class="tes-amount${out ? ' is-out' : ''}">${signed(b.amount)}</span></div>${matchHtml}</li>`;
      }).join('');
      const waiting = [...pendApp.map(e => `<li><span>${fmtDay(e.day)} · ${escape(e.payer)} · ${escape(typeName(e.type))}</span><strong>${inv(e.amount)}</strong>${statusTag(e.status)}</li>`), ...paidWait.map(x => `<li><span>${fmtDay(x.paid)} · ${escape(x.desc)} · ${escape(x.payee)}</span><strong>${outv(x.amount)}</strong>${expTag(x)}</li>`)].join('');
      return `<div class="tes-toolbar"><button type="button" class="action primary" data-tes-import="1">Importar extrato do dia (teste)</button><p class="note">Na versão real: arquivo OFX do Sicoob ou integração com o banco. O app sugere a correspondência pelo número do Pix (E2E) ou pelo valor e data, para créditos e para débitos.</p></div>
      <section aria-labelledby="tes-bank-title"><div class="section-heading"><div><span class="label">EXTRATO DO BANCO</span><h2 id="tes-bank-title">Linhas a conciliar</h2></div><span class="dash-demo is-neutral">${open.length}</span></div>${open.length ? `<ul class="tes-lines">${lines}</ul>` : '<p class="box">Tudo conciliado. Nenhuma linha do extrato aguardando.</p>'}</section>
      <section class="box tes-waiting" aria-labelledby="tes-wait-title"><h2 id="tes-wait-title">Lançados, ainda sem linha no extrato</h2>${waiting ? `<ul class="tes-wait-list">${waiting}</ul><p class="note">O Pix aparece no extrato no mesmo dia ou no seguinte. A oferta em espécie espera o depósito.</p>` : '<p>Nada esperando o extrato.</p>'}</section>`;
    }
    function entriesPage() {
      const ym = state.tesMonth || openMonth(), ms = [...new Set(data.ledger.map(monthOf))].sort().reverse();
      const list = entriesOf(ym).slice().sort((a, b) => b.day.localeCompare(a.day) || b.id.localeCompare(a.id));
      const closed = !!data.closed[ym], rev = state.tesReverse && data.ledger.find(e => e.id === state.tesReverse);
      const canRev = e => e.status === 'conciliado' && !e.ref && !e.reversed;
      const rows = list.slice(0, 40).map(e => `<tr${e.reversed ? ' class="is-reversed"' : ''}><td>${fmtDay(e.day)}</td><td><strong>${escape(e.payer)}</strong><small>${escape(e.method)}${e.conferred ? ' · ' + escape(e.conferred) : ''}${e.ref ? ' · estorno de ' + escape(e.ref) + ': ' + escape(e.reason) : ''}${e.reversed ? ' · estornado' : ''}</small></td><td>${ACCOUNTS[e.type].code}<small>${escape(ACCOUNTS[e.type].name)}</small></td><td class="num">${sv(e.amount)}</td><td>${statusTag(e.status)}${canRev(e) ? `<button type="button" class="tes-link" data-tes-reverse="${e.id}">Estornar</button>` : ''}</td></tr>`).join('');
      const revBox = rev ? `<section class="box tes-reverse" aria-labelledby="tes-rev-title"><h2 id="tes-rev-title" tabindex="-1">Estornar ${escape(typeName(rev.type))} de ${escape(rev.payer)} · ${money(rev.amount)}</h2><p>O lançamento original continua no histórico. O estorno entra hoje, no mês em aberto, com valor negativo e o motivo.</p><form id="reverse-form" class="tes-fields"><label>Motivo<select name="reason"><option>Lançado em duplicidade</option><option>Finalidade errada (lançar de novo na conta certa)</option><option>Valor devolvido ao contribuinte</option></select></label><div class="tes-actions"><button type="submit" class="action primary">Confirmar estorno</button><button type="button" class="action admin-secondary" data-tes-reverse-cancel="1">Cancelar</button></div></form></section>` : '';
      const cashBox = `<section class="box tes-cash" aria-labelledby="tes-cash-title"><h2 id="tes-cash-title">Oferta em espécie do culto</h2><p>A contagem é feita por duas pessoas, logo depois do culto. O valor fica aguardando até o depósito aparecer no extrato.</p><form id="cash-form" class="form-grid"><label>Culto<select name="service">${['2026-11-01 · Culto de domingo', '2026-10-29 · Culto da Fé'].map(o => `<option>${o}</option>`).join('')}</select></label><label>Valor contado (R$)<input name="amount" inputmode="decimal" required placeholder="0,00"></label><label>Conferente 1<input name="c1" required maxlength="60"></label><label>Conferente 2<input name="c2" required maxlength="60"></label><div class="form-actions"><button type="submit" class="action primary">Registrar contagem</button></div></form></section>`;
      if (narrow()) { const cur = entriesOf(openMonth()).slice().sort((a, b) => b.day.localeCompare(a.day) || b.id.localeCompare(a.id)).slice(0, 8); return `${cashBox}<section class="box tes-waiting"><h2>Últimas entradas de ${escape(ymShort(openMonth()))}</h2><ul class="tes-wait-list">${cur.map(e => `<li><span>${fmtDay(e.day).slice(0, 5)} · ${escape(e.payer)} · ${escape(typeName(e.type))}</span><strong>${sv(e.amount)}</strong>${statusTag(e.status)}</li>`).join('')}</ul><p class="note">A lista completa, outros meses e estornos ficam no computador.</p></section>`; }
      return `${revBox}${cashBox}
      <section aria-labelledby="tes-list-title"><div class="section-heading"><div><span class="label">ENTRADAS${closed ? ' · MÊS FECHADO' : ''}</span><h2 id="tes-list-title">${escape(ymLabel(ym))}</h2></div>${tabs('tes-month', ms.map(m => [m, ymShort(m)]), ym)}</div>
      <div class="box tes-table-wrap"><table class="tes-table"><thead><tr><th>Data</th><th>Histórico</th><th>Conta</th><th class="num">Valor</th><th>Situação</th></tr></thead><tbody>${rows}</tbody></table>${list.length > 40 ? `<p class="note">Mostrando 40 de ${list.length} lançamentos. O arquivo do fechamento traz todos.</p>` : ''}</div>${closed ? '<p class="note">Mês fechado: um estorno feito aqui entra no mês em aberto, sem mudar o que foi enviado à contabilidade.</p>' : ''}</section>`;
    }
    function expenseForm() {
      const accOpts = Object.entries(EXPENSES).map(([c, a]) => `<option value="${c}">${c} ${escape(a.name)}</option>`).join('');
      const minOpts = MINISTRIES.map(m => `<option>${escape(m)}</option>`).join('');
      return `<details class="box tes-new"${state.tesNewOpen ? ' open' : ''}><summary><span class="tes-new-plus" aria-hidden="true">+</span>Registrar nova despesa</summary><form id="expense-form" class="form-grid"><label>Favorecido<input name="payee" required maxlength="80" placeholder="Empresa ou pessoa que recebe"></label><label>Descrição<input name="desc" required maxlength="80" placeholder="Ex.: Conserto do portão"></label><label>Conta<select name="acc">${accOpts}</select></label><label>Ministério<select name="ministry">${minOpts}</select></label><label>Valor (R$)<input name="amount" inputmode="decimal" required placeholder="0,00"></label><label>Vencimento<input name="due" type="date" required></label><label>Forma de pagamento<select name="method"><option>Pix</option><option>Boleto</option><option>Transferência</option><option>Débito automático</option></select></label><label>Nota fiscal ou recibo nº<input name="doc" required maxlength="40" placeholder="Ex.: NF 1234"></label><label class="tes-file">Comprovante (foto ou PDF)<input name="attach" type="file" accept="image/*,application/pdf"></label><div class="form-actions"><button type="submit" class="action primary">Registrar despesa</button></div></form><p class="note">Acima de ${money(LIMIT)}, e sempre que usar o fundo da obra, a despesa vai para a aprovação da Liderança Pastoral antes do pagamento. Sem nota ou recibo, não há pagamento.</p></details>`;
    }
    function expensesPage() {
      const ap = awaitingApproval(), pay = toPay(), paid = data.expenses.filter(x => x.status === 'paga'), back = data.expenses.filter(x => x.status === 'devolvida');
      const ym = openMonth(), done = paidOf(ym);
      const sec = (id, label, title, list, actions, empty) => `<section aria-labelledby="${id}"><div class="section-heading"><div><span class="label">${label}</span><h2 id="${id}">${title}</h2></div><span class="dash-demo is-neutral">${list.length}</span></div>${list.length ? `<ul class="tes-lines">${list.map(x => expCard(x, actions(x))).join('')}</ul>` : `<p class="box tes-empty">${empty}</p>`}</section>`;
      const payBtn = x => `<div class="tes-actions"><button type="button" class="action primary" data-tes-pay="${x.id}">Registrar pagamento</button></div>`;
      return `${expenseForm()}
      ${sec('tes-pay-title', 'A PAGAR', 'Contas aprovadas', pay, payBtn, 'Nenhuma conta a pagar.')}
      ${sec('tes-ap-title', 'LIDERANÇA PASTORAL', 'Aguardando aprovação', ap, () => '<p class="note tes-card-note">A Liderança Pastoral aprova ou devolve em Aprovar despesas. Você vê o resultado aqui.</p>', 'Nenhuma despesa aguardando aprovação.')}
      ${sec('tes-paid-title', 'PAGAS', 'Aguardando o débito no extrato', paid, () => '', 'Nenhum pagamento esperando o extrato.')}
      ${back.length ? sec('tes-back-title', 'DEVOLVIDAS', 'Precisam de ajuste', back, x => `<div class="tes-actions"><button type="button" class="action admin-secondary" data-tes-resend="${x.id}">Reenviar para aprovação</button></div>`, '') : ''}
      <section class="box tes-waiting"><h2>Pagas e conferidas em ${escape(ymShort(ym))}</h2>${done.length ? `<ul class="tes-wait-list">${done.map(x => `<li><span>${fmtDay(x.paid)} · ${escape(x.desc)} · ${escape(x.ministry)}</span><strong>${outv(x.amount)}</strong></li>`).join('')}</ul>` : '<p>Nenhuma saída conferida neste mês ainda.</p>'}${button('Ver demonstrativo do mês', 'relatorios')}</section>`;
    }
    function approvalsPage() {
      const ap = awaitingApproval(), recent = data.expenses.filter(x => x.decidedAt).slice().reverse();
      const used = (min, ym) => data.expenses.filter(x => x.ministry === min && ['conciliada', 'paga'].includes(x.status) && (x.paid || '').slice(0, 7) === ym).reduce((t, x) => t + x.amount, 0);
      const card = x => {
        const restricted = EXPENSES[x.acc].restricted, budget = (BUDGET.find(([m]) => m === x.ministry) || [])[1], ym = openMonth();
        const ctx = restricted ? `Fundo da obra: disponível ${money(fundBalance() - fundCommitted())}. Depois desta despesa: ${money(fundBalance() - fundCommitted() - x.amount)}.` : budget ? `Orçamento de ${x.ministry}: ${money(budget)} por mês, já usado ${money(used(x.ministry, ym))} em ${ymShort(ym)}.` : '';
        const acts = isPas() ? `<div class="tes-actions"><button type="button" class="action primary" data-tes-approve="${x.id}">Aprovar</button></div><form class="tes-return" data-exp="${x.id}"><label>Devolver com um motivo<input name="reason" required maxlength="120" placeholder="Ex.: pedir mais um orçamento"></label><button type="submit" class="action admin-secondary">Devolver à tesouraria</button></form>` : '<p class="note tes-card-note">Só a Liderança Pastoral aprova.</p>';
        return expCard(x, `${ctx ? `<p class="tes-context">${escape(ctx)}</p>` : ''}${acts}`);
      };
      return `<p class="admin-rule">A tesouraria registra e paga. Despesas acima de ${money(LIMIT)} e qualquer uso do fundo da obra só são pagas depois da sua aprovação.</p>
      <section aria-labelledby="ap-title"><div class="section-heading"><div><span class="label">PARA DECIDIR</span><h2 id="ap-title">Aguardando aprovação</h2></div><span class="dash-demo is-neutral">${ap.length}</span></div>${ap.length ? `<ul class="tes-lines">${ap.map(card).join('')}</ul>` : '<p class="box tes-empty">Nenhuma despesa aguardando aprovação.</p>'}</section>
      ${recent.length ? `<section class="box tes-waiting"><h2>Decididas nesta sessão</h2><ul class="tes-wait-list">${recent.map(x => `<li><span>${escape(x.desc)} · ${escape(x.decidedAt)}</span><strong>${money(x.amount)}</strong>${expTag(x)}</li>`).join('')}</ul></section>` : ''}`;
    }
    function budgetPage() {
      const ms = months().slice().reverse(), ym = state.tesBudget || ms[0];
      const real = m => data.expenses.filter(x => x.ministry === m && x.status === 'conciliada' && x.paid.slice(0, 7) === ym).reduce((t, x) => t + x.amount, 0);
      const pend = m => data.expenses.filter(x => x.ministry === m && ['a pagar', 'paga'].includes(x.status) && ((x.paid || x.due).slice(0, 7) === ym)).reduce((t, x) => t + x.amount, 0);
      const rows = BUDGET.map(([m, b]) => { const r = real(m), p = pend(m), pct = Math.round((r + p) / b * 100), tone = pct > 100 ? 'is-late' : pct >= 90 ? 'is-wait' : 'status-active'; return `<li class="tes-budget-row"><div class="tes-budget-top"><strong>${escape(m)}</strong><span class="tag ${tone}">${pct > 100 ? 'Acima do previsto' : pct >= 90 ? 'Perto do limite' : 'Dentro do previsto'}</span></div><span class="dash-track"><span class="dash-fill tes-fill-real" data-w="${Math.min(100, Math.round(r / b * 100))}"></span><span class="dash-fill tes-fill-pend" data-w="${Math.max(0, Math.min(100 - Math.round(r / b * 100), Math.round(p / b * 100)))}"></span></span><div class="tes-budget-nums"><span>Realizado <b>${money(r)}</b></span>${p ? `<span>A pagar <b>${money(p)}</b></span>` : ''}<span>Previsto <b>${money(b)}</b></span><span>${pct}%</span></div></li>`; }).join('');
      const totB = BUDGET.reduce((t, [, b]) => t + b, 0), totR = BUDGET.reduce((t, [m]) => t + real(m), 0);
      return `${tabs('tes-budget', ms.map(m => [m, ymShort(m)]), ym)}<div class="admin-grid dash-row tes-budget-grid"><section class="box dash-box">${head('ORÇAMENTO DO MÊS', escape(ymLabel(ym)))}<ul class="tes-budget">${rows}</ul><div class="dash-legend"><span><i class="sw is-out"></i>Saída realizada</span><span><i class="sw is-out-soft"></i>A pagar</span></div></section>
      <section class="box dash-box">${head('RESUMO', 'Previsto e realizado')}<dl class="tes-kv"><div><dt>Previsto para o mês</dt><dd>${money(totB)}</dd></div><div><dt>Realizado</dt><dd>${money(totR)}</dd></div><div class="is-total"><dt>Ainda disponível no mês</dt><dd>${sv(totB - totR)}</dd></div></dl><p class="note dash-foot">O orçamento anual é aprovado em assembleia e dividido por mês. O fundo da obra fica fora do orçamento: é controlado pelo próprio saldo. Na versão real, a tesouraria lança o orçamento aprovado.</p></section></div>`;
    }
    function givers() {
      const map = new Map();
      data.ledger.filter(e => e.payerId && e.status === 'conciliado').forEach(e => { const g = map.get(e.payerId) || { id: e.payerId, name: e.payer, n: 0, total: 0, list: [] }; g.n++; g.total += e.amount; g.list.push(e); map.set(e.payerId, g); });
      return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    }
    const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    function giversPage() {
      const all = givers(), q = state.tesQ || '', found = q ? all.filter(g => fold(g.name).includes(fold(q)) || g.id.toLowerCase() === q.toLowerCase()) : all;
      const sel = state.tesPerson && all.find(g => g.id === state.tesPerson);
      const list = found.slice(0, 12).map(g => `<li><button type="button" class="tes-giver${sel && sel.id === g.id ? ' is-active' : ''}" data-tes-person="${g.id}"><span class="profile-avatar" aria-hidden="true">${escape(g.name.charAt(0))}</span><span><strong>${escape(g.name)}</strong><small>${g.id} · ${g.n} contribuiç${g.n === 1 ? 'ão' : 'ões'}</small></span>${chevron}</button></li>`).join('');
      let detail = '<section class="box tes-empty"><p>Escolha uma pessoa para ver o histórico e gerar a declaração anual.</p></section>';
      if (sel) {
        const year = todayKey().slice(0, 4), yl = sel.list.filter(e => e.day.startsWith(year)), by = t => yl.filter(e => e.type === t).reduce((s, e) => s + e.amount, 0), tot = yl.reduce((s, e) => s + e.amount, 0);
        const rows = yl.slice().sort((a, b) => b.day.localeCompare(a.day)).map(e => `<tr><td>${fmtDay(e.day)}</td><td>${escape(typeName(e.type))}<small>${escape(e.method)}</small></td><td class="num">${signed(e.amount)}</td></tr>`).join('');
        const decl = state.tesDecl ? `<section class="box tes-print tes-decl" aria-labelledby="decl-title"><div class="tes-decl-head"><img src="assets/logo.svg" alt="" width="90" height="38"><div><strong>Nova Igreja Batista</strong><small>CNPJ 40.518.758/0001-30 · Rua França, 1409 · Áreas Especiais 01 · Ariquemes RO</small></div></div><h2 id="decl-title">Declaração de contribuições · ${year}</h2><p>Declaramos que <b>${escape(sel.name)}</b> (código ${sel.id}) contribuiu voluntariamente com a Nova Igreja Batista no ano de ${year}, até ${fmtDay(todayKey())}, com o total de <b>${money(tot)}</b>:</p><table class="tes-table is-compact"><tbody>${[['Dízimos', by('Dízimo')], ['Ofertas', by('Oferta')], ['Doações para a obra do templo', by('Campanha')]].filter(([, v]) => v).map(([l, v]) => `<tr><td>${l}</td><td class="num">${money(v)}</td></tr>`).join('')}<tr class="tes-total"><td>Total</td><td class="num">${money(tot)}</td></tr></tbody></table><p class="note">Valores conferidos com o extrato bancário da igreja. Doações a igrejas não geram dedução no Imposto de Renda de pessoa física; esta declaração serve como comprovante pessoal (confirmar o texto com a contabilidade).</p><div class="tes-sign"><span>Tesouraria</span><span>Pastor presidente</span></div><div class="tes-actions tes-noprint">${printBtn('Imprimir ou salvar em PDF')}<button type="button" class="action admin-secondary" data-tes-decl="0">Fechar declaração</button></div></section>` : '';
        detail = `<section class="box dash-box"><div class="admin-person-head"><span class="profile-avatar" aria-hidden="true">${escape(sel.name.charAt(0))}</span><div><h3>${escape(sel.name)}</h3><small>Código ${sel.id} · ${yl.length} contribuiç${yl.length === 1 ? 'ão' : 'ões'} em ${year}</small></div></div><dl class="tes-kv"><div><dt>Dízimos</dt><dd>${money(by('Dízimo'))}</dd></div><div><dt>Ofertas</dt><dd>${money(by('Oferta'))}</dd></div><div><dt>Obra do templo</dt><dd>${money(by('Campanha'))}</dd></div><div class="is-total"><dt>Total em ${year}</dt><dd>${money(tot)}</dd></div></dl><div class="tes-table-wrap"><table class="tes-table is-compact"><thead><tr><th>Data</th><th>Finalidade</th><th class="num">Valor</th></tr></thead><tbody>${rows}</tbody></table></div><div class="tes-actions">${state.tesDecl ? '' : `<button type="button" class="action primary" data-tes-decl="1">Gerar declaração anual</button>`}</div></section>${decl}`;
      }
      return `<p class="admin-rule">Só a tesouraria vê contribuições por pessoa. Cada consulta fica no registro de ações. A Secretaria e a Liderança Pastoral veem apenas totais.</p><div class="tes-givers-layout"><section class="box"><form id="tes-search" class="tes-search" role="search"><label for="tes-q" class="visually-hidden">Buscar contribuinte</label><input id="tes-q" name="q" type="search" value="${escape(q)}" placeholder="Nome ou código (ex.: M0002)" autocomplete="off"><button type="submit" class="action primary">Buscar</button></form><p class="note">${found.length} contribuinte${found.length === 1 ? '' : 's'}${found.length > 12 ? ', mostrando 12. Refine a busca.' : ''}</p><ul class="tes-giver-list">${list || '<li class="note">Ninguém encontrado.</li>'}</ul></section><div>${detail}</div></div>`;
    }
    function statement(ym) {
      const list = entriesOf(ym), by = t => list.filter(e => e.type === t && e.status === 'conciliado').reduce((s, e) => s + e.amount, 0);
      const out = paidOf(ym), byAcc = Object.entries(EXPENSES).map(([c, a]) => [c, a, out.filter(x => x.acc === c).reduce((s, x) => s + x.amount, 0)]).filter(r => r[2]);
      const rin = inSum(ym), rout = outSum(ym), restrIn = by('Campanha'), restrOut = out.filter(x => EXPENSES[x.acc].restricted).reduce((s, x) => s + x.amount, 0);
      const start = bankStart(ym), closed = data.closed[ym];
      return `<section class="box tes-print tes-report" aria-labelledby="dem-title"><div class="tes-report-head"><div><span class="label">DEMONSTRATIVO ${closed ? '· MÊS FECHADO' : '· PRÉVIA, MÊS EM ABERTO'}</span><h2 id="dem-title">Receitas e despesas · ${escape(ymLabel(ym))}</h2></div>${printBtn('Imprimir')}</div>
      <table class="tes-table is-compact"><thead><tr><th>Receitas</th><th class="num">Valor</th></tr></thead><tbody>${Object.entries(ACCOUNTS).map(([t, a]) => `<tr><td>${a.code}<small>${escape(a.name)}${a.restricted ? ' · com restrição' : ''}</small></td><td class="num">${money(by(t))}</td></tr>`).join('')}<tr class="tes-total"><td>Total das receitas</td><td class="num">${inv(rin)}</td></tr></tbody></table>
      <table class="tes-table is-compact"><thead><tr><th>Despesas</th><th class="num">Valor</th></tr></thead><tbody>${byAcc.map(([c, a, v]) => `<tr><td>${c}<small>${escape(a.name)}</small></td><td class="num">${money(v)}</td></tr>`).join('') || '<tr><td>Nenhuma despesa conferida</td><td class="num">–</td></tr>'}<tr class="tes-total"><td>Total das despesas</td><td class="num">${outv(rout)}</td></tr></tbody></table>
      <dl class="tes-kv tes-result"><div class="is-total"><dt>${rin - rout >= 0 ? 'Superávit do mês' : 'Déficit do mês'}</dt><dd>${sv(rin - rout)}</dd></div><div><dt>Sem o fundo da obra (livre)</dt><dd>${sv(rin - restrIn - (rout - restrOut))}</dd></div><div><dt>Fundo da obra no mês</dt><dd>${sv(restrIn - restrOut)}</dd></div><div><dt>Saldo do banco no início do mês</dt><dd>${money(start)}</dd></div><div><dt>Saldo do banco no fim do mês</dt><dd>${money(start + rin - rout)}</dd></div></dl>
      <p class="note">Regime de caixa: entra o que foi conciliado com o extrato no mês (a confirmar com a contabilidade).</p></section>`;
    }
    function fundReport() {
      const uses = fundUses(), ins = months().map(m => [m, fundIn(e => monthOf(e) === m)]).filter(r => r[1]), committed = data.expenses.filter(x => EXPENSES[x.acc].restricted && ['a pagar', 'paga', 'aguardando aprovação'].includes(x.status));
      return `<section class="box tes-print tes-report" aria-labelledby="fund-title"><div class="tes-report-head"><div><span class="label">PRESTAÇÃO DE CONTAS · FUNDO VINCULADO</span><h2 id="fund-title">${OBRA}</h2></div>${printBtn('Imprimir')}</div>
      <dl class="tes-kv"><div><dt>Saldo em 01/10/2026</dt><dd>${money(OPEN.fund)}</dd></div>${ins.map(([m, v]) => `<div><dt>Doações em ${escape(ymShort(m))}</dt><dd>${inv(v)}</dd></div>`).join('')}<div><dt>Usado na obra</dt><dd>${outv(uses.reduce((s, x) => s + x.amount, 0))}</dd></div><div class="is-total"><dt>Saldo hoje</dt><dd>${money(fundBalance())}</dd></div></dl>
      <h3>Onde o dinheiro foi usado</h3><table class="tes-table is-compact"><thead><tr><th>Data</th><th>Descrição</th><th class="num">Valor</th></tr></thead><tbody>${uses.map(x => `<tr><td>${fmtDay(x.paid)}</td><td>${escape(x.desc)}<small>${escape(x.payee)} · ${escape(x.doc)}</small></td><td class="num">${money(x.amount)}</td></tr>`).join('') || '<tr><td colspan="3">Nenhum uso ainda.</td></tr>'}</tbody></table>
      ${committed.length ? `<h3>Previsto (ainda não pago)</h3><ul class="tes-wait-list">${committed.map(x => `<li><span>${escape(x.desc)}</span><strong>${money(x.amount)}</strong>${expTag(x)}</li>`).join('')}</ul>` : ''}
      <p class="note">Este relatório pode ser apresentado à igreja. Ele mostra totais e fornecedores, sem o nome de quem doou.</p></section>`;
    }
    function councilReport() {
      const cm = Object.keys(data.closed).sort(), first = cm[0], last = cm[cm.length - 1];
      const rin = cm.reduce((t, m) => t + inSum(m), 0), rout = cm.reduce((t, m) => t + outSum(m), 0);
      const minRows = BUDGET.map(([m, b]) => { const r = cm.reduce((t, ym) => t + paidOf(ym).filter(x => x.ministry === m).reduce((s, x) => s + x.amount, 0), 0), p = b * cm.length; return `<tr><td>${escape(m)}</td><td class="num">${money(p)}</td><td class="num">${money(r)}</td><td class="num${r > p ? ' tes-neg' : ''}">${Math.round(r / p * 100)}%</td></tr>`; }).join('');
      const period = first === last ? ymLabel(first) : `${ymShort(first)} a ${ymLabel(last)}`;
      return `<section class="box tes-print tes-report" aria-labelledby="council-title"><div class="tes-report-head"><div><span class="label">CONSELHO FISCAL E ASSEMBLEIA</span><h2 id="council-title">Prestação de contas · ${escape(period)}</h2></div>${printBtn('Imprimir')}</div>
      <p>Período com meses fechados e conciliados com o extrato do Sicoob. Valores sem nomes de contribuintes.</p>
      <dl class="tes-kv"><div><dt>Saldo do banco no início</dt><dd>${money(bankStart(first))}</dd></div><div><dt>Receitas</dt><dd>${inv(rin)}</dd></div><div><dt>Despesas</dt><dd>${outv(rout)}</dd></div><div><dt>Resultado do período</dt><dd>${sv(rin - rout)}</dd></div><div class="is-total"><dt>Saldo do banco no fim</dt><dd>${money(bankStart(first) + rin - rout)}</dd></div><div><dt>Dentro do saldo: fundo da obra</dt><dd>${money(OPEN.fund + cm.reduce((t, m) => t + fundIn(e => monthOf(e) === m) - paidOf(m).filter(x => EXPENSES[x.acc].restricted).reduce((s, x) => s + x.amount, 0), 0))}</dd></div></dl>
      <h3>Despesas por ministério</h3><table class="tes-table is-compact"><thead><tr><th>Ministério</th><th class="num">Previsto</th><th class="num">Realizado</th><th class="num">%</th></tr></thead><tbody>${minRows}</tbody></table>
      <div class="tes-sign"><span>Tesouraria</span><span>Pastor presidente</span><span>Conselho fiscal</span></div></section>`;
    }
    function reportsPage() {
      const tab = state.tesReport || 'mes', ms = months().slice().reverse(), ym = state.tesRepMonth || ms[0];
      const body = tab === 'fundo' ? fundReport() : tab === 'conselho' ? councilReport() : tab === 'acoes'
        ? `<section class="box tes-report"><div class="tes-report-head"><div><span class="label">REGISTRO DE AÇÕES</span><h2>Quem fez o quê</h2></div></div><ul class="tes-audit is-full">${data.audit.slice().reverse().map(a => `<li><span>${escape(a.what)}</span><small>${escape(a.who)} · ${escape(a.at)}</small></li>`).join('')}</ul><p class="note">O registro não pode ser editado. Na versão real, cada ação leva o nome da pessoa que entrou com a própria conta.</p></section>`
        : `${tabs('tes-rep-month', ms.map(m => [m, ymShort(m)]), ym)}${statement(ym)}`;
      return `${tabs('tes-report', [['mes', 'Demonstrativo do mês'], ['fundo', 'Fundo da obra'], ['conselho', 'Conselho fiscal'], ['acoes', 'Registro de ações']], tab)}${body}`;
    }
    function csvFor(ym) {
      const q = v => /[;"\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v);
      const head = ['data', 'competencia', 'conta_debito', 'conta_credito', 'historico', 'centro_custo', 'forma', 'documento', 'contribuinte_id', 'valor', 'situacao', 'conferencia'];
      const comp = ym.slice(5) + '/' + ym.slice(0, 4), val = v => v.toFixed(2).replace('.', ',');
      const ins = entriesOf(ym).map(e => [fmtDay(e.day), comp, e.method.startsWith('Espécie') ? CASH.code : BANK.code, ACCOUNTS[e.type].code, `${ACCOUNTS[e.type].name}${e.payerId ? ' · ' + e.payerId : ' · ' + e.payer}${e.ref ? ' · estorno de ' + e.ref : ''}`, e.type === 'Campanha' ? OBRA : 'Geral', e.method, e.doc, e.payerId, val(e.amount), e.status, e.conferred]);
      const outs = data.expenses.filter(x => x.paid && x.paid.slice(0, 7) === ym).map(x => [fmtDay(x.paid), comp, x.acc, BANK.code, `${EXPENSES[x.acc].name} · ${x.payee} · ${x.desc}`, x.ministry, x.method, x.doc, '', val(x.amount), x.status, 'Aprovado: ' + (x.approvedBy || '')]);
      return [head, ...ins, ...outs].map(r => r.map(q).join(';')).join('\n');
    }
    function closingPage() {
      const ms = months().slice().reverse(), ym = state.tesClose || ms[0];
      const list = entriesOf(ym), closed = data.closed[ym], pend = list.filter(e => e.status !== 'conciliado');
      const paidWait = data.expenses.filter(x => x.status === 'paga' && x.paid.slice(0, 7) === ym), bankWait = bankOpen().filter(b => b.day.slice(0, 7) === ym);
      const blocks = [pend.length ? `${pend.length} entrada${pend.length === 1 ? '' : 's'} sem conciliar` : '', paidWait.length ? `${paidWait.length} pagamento${paidWait.length === 1 ? '' : 's'} sem débito no extrato` : '', bankWait.length ? `${bankWait.length} linha${bankWait.length === 1 ? '' : 's'} do extrato sem lançamento` : '', ym >= openMonth() ? `o mês ainda não terminou (fecha a partir de 01/${String(Number(ym.slice(5)) % 12 + 1).padStart(2, '0')})` : ''].filter(Boolean);
      const csv = csvFor(ym), lines = csv.split('\n').length - 1, preview = csv.split('\n').slice(0, 4).join('\n');
      const rin = inSum(ym), rout = outSum(ym);
      return `${tabs('tes-close-month', ms.map(m => [m, ymShort(m)]), ym)}
      <div class="admin-grid dash-row"><section class="box dash-box">${head(closed ? 'MÊS FECHADO' : 'MÊS EM ABERTO', escape(ymLabel(ym)))}<dl class="tes-kv"><div><dt>Receitas conciliadas</dt><dd>${inv(rin)}</dd></div><div><dt>Despesas conferidas</dt><dd>${rout ? outv(rout) : money(0)}</dd></div><div class="is-total"><dt>Resultado</dt><dd>${sv(rin - rout)}</dd></div><div><dt>Saldo do banco no fim</dt><dd>${money(bankStart(ym) + rin - rout)}</dd></div></dl>
      ${closed ? `<p class="tes-closed">Fechado por ${escape(closed.by)} em ${escape(closed.at)}. Correções viram um lançamento de estorno no mês em aberto.</p>` : blocks.length ? `<div class="tes-block"><strong>Antes de fechar:</strong><ul>${blocks.map(b => `<li>${b}</li>`).join('')}</ul></div>${pend.length || paidWait.length || bankWait.length ? button('Ir para a conferência', 'conferencia') : ''}` : `<button type="button" class="action primary" data-tes-close="${ym}">Fechar ${escape(ymShort(ym))}</button><p class="note">Depois de fechado, o mês não aceita mudanças.</p>`}${foot('Ver demonstrativo', 'relatorios')}</section>
      <section class="box dash-box">${head('CONTABILIDADE', 'Arquivo do mês')}<p>Uma linha por entrada e por saída, com conta de débito e de crédito, centro de custo, documento e código do contribuinte. O nome de quem contribui não vai no arquivo.</p><pre class="tes-csv" aria-label="Prévia do arquivo">${escape(preview)}</pre><a class="button button-go" download="nib-lancamentos-${ym}.csv" href="data:text/csv;charset=utf-8,${encodeURIComponent('﻿' + csv)}">Baixar CSV (${lines} linhas) ${arrow}</a>${closed ? '' : '<p class="note">Enquanto o mês estiver aberto, o arquivo é só uma prévia.</p>'}</section></div>`;
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
      const counts = { solicitacoes: reqs.length, membresia: people.length, cuidado: activePrayers().length, comunicados: data.notices.length, aprovacoes: awaitingApproval().length, programacao: api.NibDaily.addedItems().filter(x => !x.notice).length };
      const texts = {
        membresia: people.length ? `${people.length} ${people.length === 1 ? 'pessoa' : 'pessoas'} em integração. Registre a próxima etapa.` : 'Ninguém aguardando etapa.',
        solicitacoes: isSec() ? (reqs.length ? `${reqs.length} ${reqs.length === 1 ? 'pedido aguardando' : 'pedidos aguardando'} conferência.` : 'Nenhum pedido pendente.') : 'Acompanhe os pedidos enviados pelos membros.',
        programacao: 'Inclua cultos e eventos no calendário dos membros.',
        comunicados: 'Publique avisos no sino e em Programação e avisos.',
        palavra: (verse[2] ? 'Hoje: escolhido pela igreja · ' : 'Hoje: lista automática · ') + verse[1],
        cuidado: isPas() ? 'Acompanhe os pedidos e cuide do mural.' : 'Veja os pedidos publicados pelos membros.',
        recepcao: 'QR Code da recepção, presença e visitantes do culto.',
        aprovacoes: awaitingApproval().length ? `${awaitingApproval().length} despesa${awaitingApproval().length === 1 ? '' : 's'} esperando sua decisão.` : 'Nenhuma despesa aguardando.',
        informacoes: 'Veja a página Programação e avisos como os membros veem.'
      };
      const shortcuts = views().filter(([key]) => key !== 'gestao').map(([key, title]) => { const c = counts[key]; const alert = c && ['solicitacoes', 'membresia', 'aprovacoes'].includes(key) && (key !== 'solicitacoes' || isSec()); return `<button type="button" class="quick-action admin-quick" data-view="${key}"><span class="home-action-icon" aria-hidden="true">${svg(key)}</span>${alert ? `<span class="admin-badge" aria-label="${c} pendente${c === 1 ? '' : 's'}">${c}</span>` : ''}<strong>${title}</strong><span class="home-action-description">${texts[key] || ''}</span></button>`; }).join('');
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

    const pages = { conferencia: reconcilePage, lancamentos: entriesPage, saidas: expensesPage, aprovacoes: approvalsPage, orcamento: deskOnly('orcamento', budgetPage), contribuintes: deskOnly('contribuintes', giversPage), relatorios: deskOnly('relatorios', reportsPage), fechamento: deskOnly('fechamento', closingPage), recepcao: reception, gestao: () => isTes() ? treasuryPanel() : panel(), membresia: membership, confirmar: confirmPage, solicitacoes: requests, programacao: agendaAdmin, comunicados: noticesAdmin, palavra: verse, cuidado: care };

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
      if (d.tesConfirm) { const b = data.bank.find(x => x.id === d.tesConfirm), e = data.ledger.find(x => x.id === d.entry); if (b && e && isTes()) { if (e.status === 'aguardando depósito') e.depositDoc = b.doc; confirmEntry(e, b); log(`Conciliou: ${typeName(e.type)} · ${e.payer} · ${money(e.amount)}`); } api.show('conferencia', false, false); api.announce('Crédito conciliado com o lançamento.', 'success', false); return true; }
      if (d.tesImport) { const mine = data.ledger.filter(e => e.member && e.status === 'pendente' && !data.bank.some(b => b.doc === e.doc)); mine.forEach(e => data.bank.push({ id: 'BX' + (data.bank.length + 1), day: e.day, text: 'PIX RECEBIDO ' + e.payer.toUpperCase(), amount: e.amount, doc: e.doc, match: null })); const outs = data.expenses.filter(x => x.status === 'paga' && !data.bank.some(b => b.doc === 'PG-' + x.id) && !data.bank.some(b => !b.match && b.amount < 0 && Math.abs(b.amount + x.amount) < 0.005)); outs.forEach(x => data.bank.push({ id: 'BX' + (data.bank.length + 1), day: x.paid, text: (x.method === 'Boleto' ? 'PAGAMENTO DE BOLETO ' : 'PIX ENVIADO ') + x.payee.toUpperCase(), amount: -x.amount, doc: 'PG-' + x.id, match: null })); const n = mine.length + outs.length; if (n) log(`Importou o extrato: ${n} linha${n === 1 ? '' : 's'} nova${n === 1 ? '' : 's'}`); api.show('conferencia', false, false); api.announce(n ? `${n} linha${n === 1 ? '' : 's'} nova${n === 1 ? '' : 's'} no extrato.` : 'Extrato importado. Nenhuma linha nova.', 'success', false); return true; }
      if (d.tesConfirmExp) { const b = data.bank.find(x => x.id === d.tesConfirmExp), x = data.expenses.find(y => y.id === d.exp); if (b && x && isTes()) { x.status = 'conciliada'; x.bankDoc = b.doc; b.match = x.id; log(`Conciliou pagamento: ${x.desc} · ${money(x.amount)}`); } api.show('conferencia', false, false); api.announce('Débito conciliado com o pagamento.', 'success', false); return true; }
      if (d.tesPay) { const x = data.expenses.find(y => y.id === d.tesPay); if (x && isTes() && x.status === 'a pagar') { x.status = 'paga'; x.paid = todayKey(); log(`Registrou pagamento: ${x.desc} · ${money(x.amount)}`); } api.show('saidas', false, false); api.announce('Pagamento registrado. Ele fica aguardando o débito no extrato.', 'success', false); return true; }
      if (d.tesApprove) { const x = data.expenses.find(y => y.id === d.tesApprove); if (!x || !isPas()) return true; if (EXPENSES[x.acc].restricted && x.amount > fundBalance() - fundCommitted(x) + 0.001) { api.announce('O fundo da obra não tem saldo disponível para esta despesa.', 'warning'); return true; } x.status = 'a pagar'; x.approvedBy = actor(); x.approvedAt = x.decidedAt = now(); log(`Aprovou: ${x.desc} · ${money(x.amount)}`); api.show('aprovacoes', false, false); api.announce('Despesa aprovada. A tesouraria já pode pagar.', 'success', false); return true; }
      if (d.tesResend) { const x = data.expenses.find(y => y.id === d.tesResend); if (x && isTes()) { x.status = 'aguardando aprovação'; x.returned = ''; log(`Reenviou para aprovação: ${x.desc}`); } api.show('saidas', false, false); api.announce('Despesa reenviada para a Liderança Pastoral.', 'success', false); return true; }
      if (d.tesReverse) { state.tesReverse = d.tesReverse; api.show('lancamentos', false, false); const h = document.getElementById('tes-rev-title'); if (h) h.focus(); return true; }
      if (d.tesReverseCancel) { state.tesReverse = null; api.show('lancamentos', false, false); return true; }
      if (d.tesPrint) { if (typeof print === 'function') print(); return true; }
      if (d.tesPerson) { state.tesPerson = d.tesPerson; state.tesDecl = false; log(`Consultou o histórico do contribuinte ${d.tesPerson}`); api.show('contribuintes', false, false); return true; }
      if (d.tesDecl) { state.tesDecl = d.tesDecl === '1'; if (state.tesDecl) log(`Gerou a declaração anual do contribuinte ${state.tesPerson}`); api.show('contribuintes', false, false); const h = document.getElementById('decl-title'); if (h) h.scrollIntoView({ block: 'start' }); return true; }
      if (d.tesReport) { state.tesReport = d.tesReport; api.show('relatorios', false, false); return true; }
      if (d.tesRepMonth) { state.tesRepMonth = d.tesRepMonth; api.show('relatorios', false, false); return true; }
      if (d.tesBudget) { state.tesBudget = d.tesBudget; api.show('orcamento', false, false); return true; }
      if (d.tesMonth) { state.tesMonth = d.tesMonth; api.show('lancamentos', false, false); return true; }
      if (d.tesCloseMonth) { state.tesClose = d.tesCloseMonth; api.show('fechamento', false, false); return true; }
      if (d.tesClose) { if (isTes() && !entriesOf(d.tesClose).some(e => e.status !== 'conciliado')) { data.closed[d.tesClose] = { by: actor(), at: now() }; log(`Fechou ${ymLabel(d.tesClose)} e gerou o arquivo da contabilidade`); } api.show('fechamento', false, false); api.announce('Mês fechado. O arquivo para a contabilidade está pronto.', 'success', false); return true; }
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
        const e = { id: 'L' + (data.ledger.length + 1), day: b.day, type, amount: b.amount, method: 'Pix direto no banco', payer: payer || 'Não identificado', payerId: payer === state.member.full ? 'M0201' : payer ? 'M0' + (500 + data.ledger.length) : '', doc: b.doc, source: 'extrato', status: 'pendente', by: actor(), conferred: '', member: payer === state.member.full };
        data.ledger.push(e); confirmEntry(e, b); log(`Identificou e conciliou Pix direto: ${typeName(type)} · ${money(b.amount)}`);
        api.show('conferencia', false, false); api.announce('Crédito lançado em ' + ACCOUNTS[type].name + ' e conciliado.', 'success', false); return true;
      }
      if (form.id === 'cash-form') {
        const amount = Math.round(Number(String(values.get('amount')).replace(/\./g, '').replace(',', '.')) * 100) / 100, c1 = String(values.get('c1')).trim(), c2 = String(values.get('c2')).trim(), day = String(values.get('service')).slice(0, 10);
        if (!(amount > 0)) { api.announce('Informe o valor contado.', 'warning'); return true; }
        if (!c1 || !c2 || c1.toLowerCase() === c2.toLowerCase()) { api.announce('A contagem precisa de duas pessoas diferentes.', 'warning'); return true; }
        data.ledger.push({ id: 'L' + (data.ledger.length + 1), day, type: 'Oferta', amount, method: 'Espécie (culto)', payer: 'Oferta do culto', payerId: '', doc: 'CONT-' + day.replace(/-/g, '') + '-' + data.ledger.length, source: 'manual', status: 'aguardando depósito', by: actor(), conferred: `Conferido por ${c1} e ${c2}` }); log(`Registrou contagem em espécie: ${money(amount)} (${c1} e ${c2})`);
        state.tesMonth = day.slice(0, 7); api.show('lancamentos', false, false); api.announce('Contagem registrada. Ela fica aguardando o depósito aparecer no extrato.', 'success', false); return true;
      }
      if (form.classList.contains('tes-identify-exp')) {
        const b = data.bank.find(x => x.id === form.dataset.bank); if (!b || !isTes()) return true;
        const acc = String(values.get('acc')), ministry = EXPENSES[acc].restricted ? OBRA : String(values.get('ministry'));
        data.expenses.push({ id: 'X' + (data.expenses.length + 1), day: b.day, due: b.day, paid: b.day, payee: 'Sicoob', desc: b.text.charAt(0) + b.text.slice(1).toLowerCase(), acc, ministry, amount: -b.amount, doc: b.doc, method: 'Débito automático', attach: '', status: 'conciliada', approvedBy: 'Débito automático do banco', by: actor(), bankDoc: b.doc });
        b.match = 'X' + data.expenses.length; log(`Classificou débito do extrato: ${EXPENSES[acc].name} · ${money(-b.amount)}`);
        api.show('conferencia', false, false); api.announce('Débito lançado em ' + EXPENSES[acc].name + ' e conciliado.', 'success', false); return true;
      }
      if (form.id === 'expense-form') {
        if (!isTes()) return true;
        const get = k => String(values.get(k) || '').trim(), amount = Math.round(Number(get('amount').replace(/\./g, '').replace(',', '.')) * 100) / 100, acc = get('acc'), restricted = EXPENSES[acc] && EXPENSES[acc].restricted;
        if (!get('payee') || !get('desc') || !get('doc')) { api.announce('Preencha favorecido, descrição e o número da nota ou recibo.', 'warning'); return true; }
        if (!(amount > 0)) { api.announce('Informe o valor da despesa.', 'warning'); return true; }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(get('due'))) { api.announce('Informe o vencimento.', 'warning'); return true; }
        if (restricted && amount > fundBalance() - fundCommitted() + 0.001) { api.announce(`O fundo da obra tem ${money(fundBalance() - fundCommitted())} disponíveis. A despesa passa desse valor.`, 'warning'); return true; }
        const file = values.get('attach'), needs = restricted || amount > LIMIT;
        const x = { id: 'X' + (data.expenses.length + 1), day: todayKey(), due: get('due'), paid: '', payee: get('payee').slice(0, 80), desc: get('desc').slice(0, 80), acc, ministry: restricted ? OBRA : get('ministry'), amount, doc: get('doc').slice(0, 40), method: get('method'), attach: file && file.name ? file.name : '', status: needs ? 'aguardando aprovação' : 'a pagar', approvedBy: needs ? '' : 'Tesouraria (dentro do limite)', by: actor() };
        data.expenses.push(x); log(`${needs ? 'Enviou para aprovação' : 'Registrou despesa'}: ${x.desc} · ${money(amount)}`); state.tesNewOpen = false;
        api.show('saidas', false, false); api.announce(needs ? 'Despesa registrada e enviada para a Liderança Pastoral aprovar.' : 'Despesa registrada em Contas a pagar.', 'success', false); return true;
      }
      if (form.classList.contains('tes-return')) {
        const x = data.expenses.find(y => y.id === form.dataset.exp), reason = String(values.get('reason') || '').trim().slice(0, 120);
        if (!x || !isPas()) return true; if (!reason) { api.announce('Escreva o motivo da devolução.', 'warning'); return true; }
        x.status = 'devolvida'; x.returned = reason; x.decidedAt = now(); log(`Devolveu: ${x.desc} · ${reason}`);
        api.show('aprovacoes', false, false); api.announce('Despesa devolvida à tesouraria com o motivo.', 'success', false); return true;
      }
      if (form.id === 'reverse-form') {
        const e = data.ledger.find(x => x.id === state.tesReverse); if (!e || !isTes() || e.reversed) return true;
        const reason = String(values.get('reason'));
        data.ledger.push({ id: 'L' + (data.ledger.length + 1), day: todayKey(), type: e.type, amount: -e.amount, method: 'Estorno', payer: e.payer, payerId: e.payerId, doc: 'EST-' + e.id, source: 'manual', status: 'conciliado', by: actor(), conferred: '', ref: e.id, reason });
        e.reversed = true; state.tesReverse = null; state.tesMonth = openMonth(); log(`Estornou ${e.id} (${typeName(e.type)} · ${money(e.amount)}): ${reason}`);
        api.show('lancamentos', false, false); api.announce('Estorno lançado no mês em aberto. O original continua no histórico.', 'success', false); return true;
      }
      if (form.id === 'tes-search') { state.tesQ = String(values.get('q') || '').trim().slice(0, 60); api.show('contribuintes', false, false); const i = document.getElementById('tes-q'); if (i) i.focus(); return true; }
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
    const badge = () => isTes() ? pendingEntries().length + bankOpen().length : isSec() ? pendingRequests().length : pendingPeople().length + awaitingApproval().length;

    return { birthdays, addCheckin, checkins: () => data.checkins, infoProgram, profiles, labels, descriptions, icons, views, allowed, pageLabels, pages, click, submit, addRequest, addAppPix, myRequests, memberNotices, latestNotice, noticesCount: () => data.notices.length, badge, bar: () => (profiles[state.context] || profiles.secretaria).bar };
  }
  scope.NibAdmin = { create };
})(window);
