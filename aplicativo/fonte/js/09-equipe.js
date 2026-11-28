  // ---------- Área da equipe com dados reais (Fase 1): Painel e Membros. Mesmo visual da versão de demonstração. ----------
  const eqMes = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const eqNum = n => Number(n || 0).toLocaleString('pt-BR');
  const eqIco = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  const eqP = () => NibIcons.paths || {};
  const eqHead = (label, title, aside = '') => `<div class="dash-head"><div><span class="label">${label}</span><h2>${title}</h2></div>${aside}</div>`;
  const eqChevron = '<svg class="admin-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  const eqFold = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const eqPodeExportar = () => !!(state.mem && state.mem.pode_exportar && account() && NibConta.exporta());
  // Situação de cada pessoa, a partir do cadastro real.
  const eqSituacao = p => p.membro_status === 'confirmado' ? 'Membro' : p.membro_status === 'pendente' ? 'Aguardando' : p.vinculo === 'frequento' ? 'Frequenta' : 'Conhecendo';
  const eqTag = s => s === 'Membro' ? 'status-active' : s === 'Aguardando' ? 'is-wait' : s === 'Frequenta' ? 'mem-tag-reg' : 'is-neutral';
  const eqCelula = c => c ? String(c).split('|').reverse().join(' · ') : '';
  function eqLoad(key, fn, view) {
    if (state[key] || state[key + 'Loading']) return;
    state[key + 'Loading'] = true;
    fn().then(d => { state[key] = d; state[key + 'Erro'] = ''; }).catch(e => { state[key] = null; state[key + 'Erro'] = e.message; })
      .finally(() => { state[key + 'Loading'] = false; if (state.view === view) show(view, false, false); });
  }
  function eqChart(cultos) {
    const narrow = typeof innerWidth === 'number' && innerWidth < 600, W = narrow ? 340 : 560, top = 26, base = 182, left = 34, n = cultos.length;
    const vals = cultos.map(c => c.pessoas), max = Math.max(10, Math.ceil(Math.max(...vals) * 1.15 / 10) * 10), bw = narrow ? 24 : 38, gap = n > 1 ? (W - left - 8 - n * bw) / (n - 1) : 0;
    const y = v => base - (v / max) * (base - top);
    const avg = Math.round(vals.reduce((a, b) => a + b, 0) / n);
    const grid = [0, Math.round(max / 2), max].map(v => `<line x1="${left}" x2="${W}" y1="${y(v)}" y2="${y(v)}" class="dash-grid${v ? '' : ' is-base'}"/><text x="${left - 8}" y="${y(v) + 4}" class="dash-axis" text-anchor="end">${v}</text>`).join('');
    const bars = cultos.map((c, i) => {
      const v = c.pessoas, x = left + i * (bw + gap), yt = y(v), r = Math.min(5, (base - yt) / 2), last = i === n - 1, d = String(c.dia);
      const path = `M${x},${base} V${yt + r} Q${x},${yt} ${x + r},${yt} H${x + bw - r} Q${x + bw},${yt} ${x + bw},${yt + r} V${base} Z`;
      return `<g class="dash-bar${last ? ' is-last' : ''}" tabindex="0" role="img" aria-label="${d.slice(8, 10)} de ${eqMes[+d.slice(5, 7) - 1]}, ${escape(c.culto)}: ${v} pessoas"><path d="${path}"/><text x="${x + bw / 2}" y="${yt - 8}" text-anchor="middle" class="dash-value">${v}</text><text x="${x + bw / 2}" y="${base + 20}" text-anchor="middle" class="dash-axis">${d.slice(8, 10)}/${d.slice(5, 7)}</text></g>`;
    }).join('');
    return `<svg class="dash-chart" viewBox="0 0 ${W} ${base + 30}" role="group" aria-label="Check-ins nos últimos cultos">${grid}${bars}<line x1="${left}" x2="${W}" y1="${y(avg)}" y2="${y(avg)}" class="dash-avg"/></svg><div class="dash-legend"><span><i class="sw is-last"></i>Último culto</span><span><i class="sw is-avg"></i>Média · ${avg}</span></div>`;
  }
  // Início da equipe (Secretaria, Pastoral, admin): resumo do dia no topo, com o caminho para o Painel.
  // Atalhos do Início por perfil (v153). A barra de baixo já leva ao dia a dia da gestão;
  // aqui ficam as outras tarefas do perfil e o que a pessoa também usa como membro.
  function teamShortcuts() {
    if (!PUBLIC || !account() || !NibConta.equipe()) return null;
    if (account().papel === 'secretaria') return [
      ['cadastros', 'Confirmar membros', 'Quem disse no cadastro que é membro e aguarda confirmação.'],
      ['membresia', 'Membresia', 'Registre formulário, reunião e apresentação no culto.'],
      ['agenda', 'Agenda da igreja', 'Cultos, escola bíblica e eventos no calendário.'],
      ['caderno', 'Caderno de oração', 'Acompanhe os pedidos e ore com a comunidade.'],
      ['eventos', 'Eventos e inscrições', 'Os próximos encontros e as inscrições abertas.'],
      ['generosidade', 'Dízimos e ofertas', 'Contribua pelo Pix com os dados oficiais da igreja.']
    ];
    return [
      ['cadastros', 'Confirmar membros', 'Quem disse no cadastro que é membro e aguarda confirmação.'],
      ['checkin', 'Check-in dos cultos', 'QR Code do telão, local da igreja e presença.'],
      ['avisos', 'Avisos da igreja', 'Publique avisos no sino e no mural da igreja.'],
      ['sugestoes', 'Sugestões para o app', 'Ideias e problemas enviados pelos membros.'],
      ['pilulas', 'Pílulas de Sabedoria', 'Envie o vídeo da semana para a igreja.'],
      ['generosidade', 'Dízimos e ofertas', 'Contribua pelo Pix com os dados oficiais da igreja.']
    ];
  }
  function teamBadge(view) {
    const d = teamShortcuts() && state.painel; if (!d) return '';
    const n = { cadastros: d.aguardando, membresia: d.em_integracao, sugestoes: d.sugestoes_novas }[view] || 0;
    return n ? `<span class="admin-badge" aria-label="${n} pendente${n === 1 ? '' : 's'}">${n > 9 ? '9+' : n}</span>` : '';
  }
  function teamHome() {
    if (!PUBLIC || !account() || !NibConta.equipe()) return '';
    eqLoad('painel', () => NibConta.equipePainel(), 'inicio');
    const d = state.painel, P = eqP(), lid = NibConta.lideranca();
    const stat = (icon, value, text, view, tone) => `<li><button type="button" class="team-home-stat" data-view="${view}"><span class="dash-ico${tone ? ' is-' + tone : ''}">${eqIco(icon || '')}</span><strong>${eqNum(value)}</strong><span>${text}</span></button></li>`;
    const body = d ? `<ul class="team-home-stats">${stat(P.alerta, d.aguardando, d.aguardando === 1 ? 'aguardando confirmação' : 'aguardando confirmação', 'cadastros', d.aguardando ? 'warn' : '')}${stat(P.membresia || P.membros, d.em_integracao, 'em integração', 'membresia')}${stat(P.cuidado, d.caderno_sem_oracao, d.caderno_sem_oracao === 1 ? 'pedido sem ninguém orando' : 'pedidos sem ninguém orando', 'caderno', d.caderno_sem_oracao ? 'warn' : '')}</ul>` : '<p class="dash-sub">Carregando os números da equipe</p>';
    return `<section class="box dash-box team-home" aria-labelledby="team-home-title"><div class="dash-head"><div><span class="label">${lid ? 'LIDERANÇA PASTORAL' : 'SECRETARIA DA IGREJA'}</span><h2 id="team-home-title">Equipe da igreja</h2></div></div>${body}<div class="dash-foot team-home-foot">${button('Abrir painel da equipe', 'equipe')}${button('Membros', 'membros')}</div></section>`;
  }
  function teamPanel() {
    eqLoad('painel', () => NibConta.equipePainel(), 'equipe');
    if (!state.painel) return state.painelErro ? `<p class="form-error" role="alert">${escape(state.painelErro)}</p>` : '<p class="event-empty">Carregando o painel</p>';
    const d = state.painel, P = eqP(), lid = NibConta.lideranca();
    const pill = v => v > 0 ? `<span class="dash-pill">${eqIco('M7 14l5-5 5 5')}+${v}</span>` : '';
    const tile = (icon, label, value, extra, note, view) => `<${view ? `button type="button" class="dash-tile is-link" data-view="${view}"` : 'div class="dash-tile"'}><span class="dash-tile-top"><span class="dash-ico">${eqIco(icon || '')}</span><span class="dash-tile-label">${label}</span></span><strong class="dash-tile-value">${eqNum(value)}</strong><span class="dash-tile-note">${extra}${note ? `<small>${note}</small>` : ''}</span></${view ? 'button' : 'div'}>`;
    const tiles = [
      tile(P.membros, 'Membros', d.membros, pill(d.membros_novos), d.membros_novos ? 'confirmados em 30 dias' : 'confirmados pela Secretaria', 'membros'),
      tile(P.frequentador, 'Frequentam', d.frequentadores, '', 'Participam, ainda sem membresia', 'membros'),
      tile(P.visitante, 'Conhecendo a igreja', d.visitantes, '', 'Cadastro como visitante', 'membros'),
      tile(P.celulas, 'Em célula', d.em_celula, `<span class="dash-pill is-neutral">${eqNum(d.celulas)} ${d.celulas === 1 ? 'célula' : 'células'}</span>`, '', 'membros'),
      tile(P.alerta, 'Aguardando confirmação', d.aguardando, '', 'Disseram que são membros', 'cadastros')
    ].join('');
    const texts = {
      membresia: d.em_integracao ? `${d.em_integracao} ${d.em_integracao === 1 ? 'pessoa' : 'pessoas'} em integração. Registre a próxima etapa.` : 'Ninguém em integração. Inicie pela ficha da pessoa.',
      membros: (d.aguardando ? `${d.aguardando} ${d.aguardando === 1 ? 'pessoa aguardando' : 'pessoas aguardando'} confirmação. ` : '') + (eqPodeExportar() ? 'Lista completa, ficha de cada pessoa e exportação.' : 'Lista completa e ficha de cada pessoa.'),
      cadastros: d.aguardando ? `${d.aguardando} ${d.aguardando === 1 ? 'pessoa aguardando' : 'pessoas aguardando'} confirmação de membro.` : 'Ninguém aguardando confirmação.',
      checkin: 'QR Code do telão, local da igreja e presença.',
      avisos: 'Publique avisos no sino e no mural da igreja.',
      caderno: d.caderno_ativos ? `${d.caderno_ativos} ${d.caderno_ativos === 1 ? 'pedido' : 'pedidos'} em andamento.` : 'Nenhum pedido em andamento.',
      sugestoes: d.sugestoes_novas ? `${d.sugestoes_novas} ${d.sugestoes_novas === 1 ? 'sugestão nova' : 'sugestões novas'} para ler.` : 'Ideias e problemas enviados pelos membros.'
    };
    const badges = { membresia: d.em_integracao, membros: d.aguardando, sugestoes: lid ? d.sugestoes_novas : 0 };
    const titles = { membresia: 'Membresia', membros: 'Membros', cadastros: 'Cadastros', checkin: 'Check-in dos cultos', avisos: 'Avisos', caderno: 'Caderno de oração', sugestoes: 'Sugestões' };
    const keys = ['membresia', 'membros', 'checkin', 'avisos', 'caderno'].concat(lid ? ['sugestoes'] : []);
    const shortcuts = keys.map(k => `<button type="button" class="quick-action admin-quick" data-view="${k}"><span class="home-action-icon" aria-hidden="true">${navIcon(k)}</span>${badges[k] ? `<span class="admin-badge" aria-label="${badges[k]} pendente${badges[k] === 1 ? '' : 's'}">${badges[k]}</span>` : ''}<strong>${titles[k]}</strong><span class="home-action-description">${texts[k]}</span></button>`).join('');
    const quick = `<section aria-labelledby="admin-quick-title"><div class="section-heading"><div><span class="label">${lid ? 'LIDERANÇA PASTORAL' : 'SECRETARIA DA IGREJA'}</span><h2 id="admin-quick-title">Atalhos de gestão</h2></div></div><p class="admin-rule">${lid ? 'A Liderança Pastoral decide. A Secretaria organiza e registra o que foi decidido.' : 'A Secretaria organiza e registra. Decisões pastorais ficam com a Liderança Pastoral.'}</p><div class="quick-actions">${shortcuts}</div></section>`;
    const c = d.cultos || [], lastC = c[c.length - 1];
    const presence = `<section class="box dash-box">${eqHead('CHECK-IN DOS CULTOS', 'Presença nos últimos cultos', lastC ? `<div class="dash-head-aside"><strong>${lastC.pessoas}</strong></div>` : '')}${c.length ? eqChart(c) + `<div class="dash-foot dash-minis"><div><small>Maior</small><strong>${Math.max(...c.map(x => x.pessoas))}</strong></div><div><small>Menor</small><strong>${Math.min(...c.map(x => x.pessoas))}</strong></div><div><small>Cultos</small><strong>${c.length}</strong></div></div>` : '<p class="dash-sub">Ainda não há check-ins registrados. Projete o QR Code do telão no próximo culto.</p>'}<div class="dash-foot">${button('Ver check-in', 'checkin')}</div></section>`;
    const stat = (icon, value, text, tone) => `<li><span class="dash-ico${tone ? ' is-' + tone : ''}">${eqIco(icon || '')}</span><strong>${eqNum(value)}</strong><span>${text}</span></li>`;
    const care = `<section class="box dash-box">${eqHead('PARA ACOMPANHAR', 'O que precisa de atenção')}<ul class="dash-stats">${stat(P.alerta, d.aguardando, 'cadastros aguardando confirmação de membro', d.aguardando ? 'warn' : '')}${stat(P.celulas, d.membros_sem_celula, 'membros sem célula', d.membros_sem_celula ? 'warn' : '')}${stat(P.cuidado, d.caderno_sem_oracao, 'pedidos do caderno ainda sem ninguém orando', d.caderno_sem_oracao ? 'warn' : '')}${stat(P.membros, d.dados_faltando, 'cadastros sem data de nascimento ou endereço')}${stat(P.visitante, d.cadastros_novos, 'cadastros novos nos últimos 30 dias')}</ul></section>`;
    const bd = d.aniversariantes || [];
    const birthdays = `<section class="box dash-box">${eqHead('ESTA SEMANA', 'Aniversariantes')}${bd.length ? `<ul class="dash-people">${bd.map(b => `<li><span class="profile-avatar" aria-hidden="true">${escape(b.nome.charAt(0))}</span><span>${escape(b.nome)}</span><span class="dash-date">${b.em === 0 ? 'Hoje' : b.dia.slice(3) + '/' + b.dia.slice(0, 2)}</span></li>`).join('')}</ul>` : '<p class="dash-sub">Nenhum aniversário nos próximos 7 dias.</p>'}<p class="note dash-foot">Só aparece quem deixou o aniversário visível em Meu cadastro.</p></section>`;
    return `<section class="dash" aria-labelledby="dash-title"><div class="section-heading"><div><span class="label">RESUMO DA IGREJA</span><h2 id="dash-title">Como a igreja está hoje</h2></div></div><div class="dash-tiles">${tiles}</div></section>${quick}<section class="dash dash-more" aria-label="Indicadores"><div class="admin-grid dash-row">${presence}${care}</div><div class="admin-grid dash-row">${birthdays}<section class="box dash-box">${eqHead('EVENTOS E INSCRIÇÕES', 'Painel de inscrições')}<p class="dash-sub">As inscrições dos eventos continuam no painel do site, com login próprio.</p><div class="dash-foot"><a class="button button-go admin-external" href="https://novaigrejabatista.com.br/inscricoes/" target="_blank" rel="noopener"><span>Abrir painel de inscrições</span>${arrow}</a></div></section></div></section>${adminYoutube()}`;
  }
  // Membros: lista, filtros, ficha e exportação (exportar só Secretaria e administração).
  const EQ_GRUPOS = [
    ['contato', 'Contato', 'celular e e-mail', p => [fmtPhone(p.celular), p.email], ['celular', 'email']],
    ['endereco', 'Endereço', 'endereço informado no cadastro', p => [p.endereco || ''], ['endereco']],
    ['igreja', 'Vida na igreja', 'célula, membro desde e última presença', p => [eqCelula(p.celula) || 'sem célula', fmtDay(p.confirmado_em), fmtDay(p.ultima_presenca)], ['celula', 'membro_desde', 'ultima_presenca']],
    ['pessoal', 'Dados pessoais', 'nascimento e gênero', p => [fmtDay(p.nascimento), p.sexo === 'm' ? 'Masculino' : 'Feminino'], ['nascimento', 'genero']]
  ];
  function eqFiltrados() {
    const all = state.mem.pessoas, q = eqFold(state.memQ), dig = String(state.memQ || '').replace(/\D/g, ''), st = state.memStatus || 'todos', cel = state.memCell || '', mes = NibDaily.dayKey(new Date()).slice(5, 7);
    return all.filter(p => (st === 'todos' || eqSituacao(p) === st) && (!cel || (cel === '-' ? !p.celula : p.celula === cel)) && (!state.memBday || String(p.nascimento || '').slice(5, 7) === mes)
      && (!q || eqFold(p.nome).includes(q) || eqFold(p.email).includes(q) || (dig.length >= 4 && String(p.celular).includes(dig))));
  }
  const EQ_PAPEIS = [['membro', 'Membro', 'Usa o app normalmente, sem área da equipe.'], ['secretaria', 'Secretaria', 'Membros, confirmação de membros, membresia, check-in e avisos. Exporta a lista.'], ['pastoral', 'Liderança Pastoral', 'Tudo da equipe, mais CPF, sugestões e local do check-in.'], ['tesouraria', 'Tesouraria', 'Reservado para as telas da Tesouraria (Fase 3). Por enquanto usa o app como membro.'], ['admin', 'Administração', 'Acesso completo, inclusive mudar o perfil das pessoas.']];
  // Só quem é admin de verdade (e não está em "Ver o app como") vê e muda o perfil.
  const eqPapeisDe = p => { const l = Array.isArray(p.papeis) && p.papeis.length ? p.papeis : [p.papel || 'membro']; return EQ_PAPEIS.map(x => x[0]).filter(k => l.includes(k)); };
  function eqPapelBox(p) {
    if (!window.NibConta || NibConta.papelReal() !== 'admin' || NibConta.verComo()) return '';
    const eu = account() && String(account().id) === String(p.id), atual = eqPapeisDe(p);
    return `<section class="box eq-papel"><h3 class="mem-h">Perfis de acesso</h3><p class="note">Marque um ou mais perfis. Quem tem mais de um escolhe no menu com qual usar o app. ${eu ? 'Você não pode tirar o seu próprio acesso de administração.' : 'A mudança vale na próxima vez que a pessoa abrir o app.'}</p><div class="eq-papel-opts" role="group" aria-label="Perfis de acesso">${EQ_PAPEIS.map(([k, l, d]) => `<label class="mem-check"><input type="checkbox" name="eq-papel" value="${k}"${atual.includes(k) ? ' checked' : ''}${eu && k === 'admin' ? ' disabled' : ''}><span><strong>${l}</strong><small>${d}</small></span></label>`).join('')}</div><div class="form-actions"><button type="button" class="action primary" data-eq-papel="${p.id}">Salvar perfis</button></div></section>`;
  }
  // Membro é exclusivo: marcar outro perfil desmarca Membro; desmarcar tudo volta para Membro.
  function eqPapelToggle(input) {
    const box = input.closest('.eq-papel'); if (!box) return;
    const all = [...box.querySelectorAll('input[name="eq-papel"]')];
    if (input.value === 'membro' && input.checked) all.forEach(i => { if (i.value !== 'membro' && !i.disabled) i.checked = false; });
    else if (input.value !== 'membro' && input.checked) all.forEach(i => { if (i.value === 'membro') i.checked = false; });
    if (!all.some(i => i.checked)) all.find(i => i.value === 'membro').checked = true;
  }
  async function eqSalvarPapel(btn) {
    const p = state.mem && state.mem.pessoas.find(x => String(x.id) === btn.dataset.eqPapel); if (!p) return;
    let sel = [...content.querySelectorAll('input[name="eq-papel"]:checked')].map(i => i.value);
    if (sel.length > 1) sel = sel.filter(k => k !== 'membro');
    if (!sel.length) sel = ['membro'];
    const antes = eqPapeisDe(p);
    if (sel.join() === antes.join()) { announce('Esses já são os perfis da pessoa.', 'success', false); return; }
    if (sel.includes('admin') && !antes.includes('admin') && !confirm(`Dar acesso de Administração para ${p.nome}? A pessoa poderá mudar o perfil de todos.`)) return;
    btn.disabled = true;
    try { const r = await NibConta.mudarPapeis(Number(p.id), sel); p.papeis = r.papeis || sel; p.papel = r.papel || sel[0]; show('membros', false, false); announce(`${p.nome} agora tem: ${papeisTexto(p.papeis)}.`, 'success', false); }
    catch (e) { btn.disabled = false; announce(e.message, 'error'); }
  }
  // Confirmação de membro, que antes ficava na tela Cadastros (v155).
  async function eqConfirmar(btn) {
    const p = state.mem && state.mem.pessoas.find(x => String(x.id) === btn.dataset.id); if (!p) return;
    const st = btn.dataset.eqConfirm;
    if (st === 'nao' && !confirm(`Marcar ${p.nome} como não membro? A pessoa continua no app e pode iniciar a integração.`)) return;
    btn.disabled = true;
    try {
      await NibConta.confirmar(Number(p.id), st); p.membro_status = st; if (st === 'confirmado') p.confirmado_em = new Date().toISOString().slice(0, 10);
      state.painel = null; state.team = null; show('membros', false, false);
      announce(st === 'confirmado' ? `${p.nome} agora é membro confirmado.` : st === 'nao' ? `${p.nome} ficou como não membro.` : `${p.nome} voltou para análise.`, 'success', false);
    } catch (e) { btn.disabled = false; announce(e.message, 'error'); }
  }
  function eqFicha(p) {
    const lid = NibConta.lideranca(), s = eqSituacao(p), tel = String(p.celular || '').replace(/\D/g, '');
    const kv = rows => `<dl class="mem-kv">${rows.filter(r => r[1] !== null).map(([k, v]) => `<div><dt>${k}</dt><dd>${v === '' ? '<span class="mem-empty">Não informado</span>' : v}</dd></div>`).join('')}</dl>`;
    return `<div class="gift-backrow"><button type="button" class="button-back gift-back" data-eq-mem=""><svg class="back-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg><span>Voltar à lista</span></button></div>
    <section class="box mem-card"><div class="admin-person-head">${avatarHtml(p.nome, p.foto)}<div><h2>${escape(p.nome)}</h2><small>Cadastro no app em ${fmtDay(p.criado_em)}</small></div><span class="tag ${eqTag(s)}">${s}</span></div>
    <div class="mem-actions">${tel ? `<a class="mem-act" href="tel:${tel}">${NibIcons.svg('telefone')}<span>Ligar</span></a><a class="mem-act" href="https://wa.me/55${tel}" target="_blank" rel="noopener">${NibIcons.svg('whatsapp')}<span>WhatsApp</span></a>` : ''}${p.email ? `<a class="mem-act" href="mailto:${escape(p.email)}">${NibIcons.svg('email')}<span>E-mail</span></a>` : ''}</div>
    ${s === 'Aguardando' ? `<div class="eq-confirm"><p><strong>Disse no cadastro que é membro.</strong> Confira e confirme.</p><div class="form-actions"><button type="button" class="action primary" data-eq-confirm="confirmado" data-id="${p.id}">Confirmar membro</button><button type="button" class="action admin-secondary" data-eq-confirm="nao" data-id="${p.id}">Não é membro</button></div></div>` : p.membro_status !== 'confirmado' ? `<div class="form-actions">${p.integracao ? button('Ver em Membresia', 'membresia') : `<button type="button" class="action admin-secondary" data-eq-etapa="inicio" data-id="${p.id}">Iniciar integração</button>`}</div>` : ''}</section>
    ${eqPapelBox(p)}
    <section class="box"><h3 class="mem-h">Contato</h3>${kv([['Celular', escape(fmtPhone(p.celular))], ['E-mail', escape(p.email || '')]])}</section>
    <section class="box"><h3 class="mem-h">Endereço</h3>${kv([['Endereço', escape(p.endereco || '')]])}</section>
    <section class="box"><h3 class="mem-h">Dados pessoais</h3>${kv([['Nascimento', fmtDay(p.nascimento)], ['Gênero', p.sexo === 'm' ? 'Masculino' : 'Feminino'], ['CPF', lid ? escape(fmtCpf(p.cpf || '')) : null], ['Aniversário na tela inicial', p.mostrar_aniversario ? 'Aparece' : 'Não aparece (escolha da pessoa)']])}</section>
    <section class="box"><h3 class="mem-h">Vida na igreja</h3>${kv([['Situação', s], ['Perfil no app', escape(papeisTexto(eqPapeisDe(p)))], ['Como se cadastrou', escape(vinculoLabel[p.vinculo] || '')], ['Célula', escape(eqCelula(p.celula) || 'Sem célula')], ['Membro desde', p.membro_status === 'confirmado' ? (fmtDay(p.confirmado_em) || '') : null], ['Última presença no culto', fmtDay(p.ultima_presenca) || 'Ainda sem check-in'], ['Presenças nas últimas 8 semanas', String(p.presencas_8sem || 0)], ['Último acesso ao app', fmtDay(p.ultimo_acesso)]])}</section>
    <p class="note">${lid ? 'A Liderança Pastoral vê a ficha completa, inclusive o CPF.' : 'A Secretaria vê a ficha. O CPF fica só com a Liderança Pastoral.'} Os dados são atualizados pela própria pessoa em Meu cadastro.</p>`;
  }
  // Quem disse no cadastro que é membro e ainda não foi confirmado (antes ficava em Cadastros).
  function eqAguardando(n, st) {
    const ico = `<span class="dash-ico is-warn">${eqIco(eqP().alerta || 'M12 9v4 M12 17h.01 M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z')}</span>`;
    if (st === 'Aguardando') return `<div class="box mem-alert is-on">${ico}<span class="mem-alert-text"><strong>Aguardando confirmação</strong><small>Abra a ficha para confirmar ou marcar como não membro.</small></span><button type="button" class="mem-clear" data-eq-status="todos">Ver todos</button></div>`;
    if (!n) return '';
    return `<button type="button" class="box mem-alert" data-eq-status="Aguardando">${ico}<span class="mem-alert-text"><strong>${n} ${n === 1 ? 'pessoa aguardando' : 'pessoas aguardando'} confirmação</strong><small>Disseram no cadastro que são membros.</small></span>${eqChevron}</button>`;
  }
  function eqExportBox(list) {
    if (!eqPodeExportar()) return '<p class="note mem-note">Só a Secretaria exporta a lista. A Liderança Pastoral consulta pelo app.</p>';
    const groups = state.memGroups || ['contato', 'igreja'], log = state.mem.exportacoes || [];
    return `<details class="box mem-export"${state.memExportOpen ? ' open' : ''}><summary>${NibIcons.svg('relatorios')}<span><strong>Exportar lista</strong><small>${list.length} pessoa${list.length === 1 ? '' : 's'} do filtro atual · planilha ou PDF</small></span></summary>
    <form id="mem-export-form" autocomplete="off" novalidate><fieldset><legend>O que vai no arquivo</legend><p class="note">Sempre vão nome e situação.</p>${EQ_GRUPOS.map(([k, l, d]) => `<label class="mem-check"><input type="checkbox" name="g" value="${k}"${groups.includes(k) ? ' checked' : ''}><span><strong>${l}</strong><small>${d}</small></span></label>`).join('')}</fieldset>
    <fieldset><legend>Formato</legend><div class="mem-formats"><label class="mem-format"><input type="radio" name="format" value="csv" checked><span><strong>Planilha CSV</strong><small>Abre no Excel e no Google Planilhas</small></span></label><label class="mem-format"><input type="radio" name="format" value="pdf"><span><strong>PDF</strong><small>Imprimir ou salvar</small></span></label></div></fieldset>
    <label class="mem-check mem-consent"><input type="checkbox" name="ok"><span>Uso interno da igreja. Não vou compartilhar o arquivo fora da equipe.</span></label>
    <p class="form-error" role="alert"></p><button type="submit" class="action primary">Exportar ${list.length} pessoa${list.length === 1 ? '' : 's'}</button></form>
    ${log.length ? `<div class="mem-log"><h3>Últimas exportações</h3><ul>${log.map(x => { const n = (String(x.detalhes).match(/n=(\d+)/) || [])[1] || '0'; return `<li>${fmtDay(x.em)} ${String(x.em).slice(11, 16)} · ${escape(x.nome || 'Equipe')} · ${n} pessoas · ${/formato=pdf/.test(x.detalhes) ? 'PDF' : 'planilha'}</li>`; }).join('')}</ul></div>` : ''}</details>`;
  }
  function membersRealPage() {
    eqLoad('mem', () => NibConta.membros(), 'membros');
    if (!state.mem) return state.memErro ? `<p class="form-error" role="alert">${escape(state.memErro)}</p>` : '<p class="event-empty">Carregando os membros</p>';
    const all = state.mem.pessoas, sel = state.memSel && all.find(p => String(p.id) === String(state.memSel));
    if (sel) return eqFicha(sel);
    const list = eqFiltrados(), st = state.memStatus || 'todos', shown = list.slice(0, state.memMore ? list.length : 30);
    const count = k => k === 'todos' ? all.length : all.filter(p => eqSituacao(p) === k).length;
    const chips = [['todos', 'Todos'], ['Membro', 'Membros'], ['Frequenta', 'Frequentam'], ['Conhecendo', 'Visitantes']].map(([k, l]) => `<button type="button" class="history-year${st === k ? ' is-active' : ''}" data-eq-status="${k}" aria-pressed="${st === k}">${l}<small>${count(k)}</small></button>`).join('');
    const cells = [...new Set(all.map(p => p.celula).filter(Boolean))].sort((a, b) => eqCelula(a).localeCompare(eqCelula(b), 'pt-BR'));
    const row = p => { const s = eqSituacao(p); return `<li><button type="button" class="mem-row" data-eq-mem="${p.id}">${avatarHtml(p.nome, p.foto)}<span class="mem-row-text"><strong>${escape(p.nome)}</strong><small>${escape(eqCelula(p.celula) || 'Sem célula')}</small></span><span class="tag ${eqTag(s)}">${s}</span>${eqChevron}</button></li>`; };
    const filtered = state.memQ || state.memCell || state.memBday || st !== 'todos';
    const pr = state.memPrint ? `<section class="tes-print mem-print" aria-hidden="true"><div class="tes-decl-head"><img src="assets/logo.svg" alt="" width="90" height="38"><div><strong>Nova Igreja Batista</strong><small>Lista de membros · ${escape(state.memPrint.at)} · ${state.memPrint.rows.length} pessoas · uso interno</small></div></div><table class="tes-table is-compact"><thead><tr>${state.memPrint.head.map(h => `<th>${escape(h)}</th>`).join('')}</tr></thead><tbody>${state.memPrint.rows.map(r => `<tr>${r.map(c => `<td>${escape(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></section>` : '';
    return `<p class="admin-rule">Dados pessoais protegidos pela LGPD. ${eqPodeExportar() ? 'A Secretaria consulta e exporta. Cada exportação fica registrada.' : 'A Liderança Pastoral consulta. A exportação fica com a Secretaria.'}</p>
    ${eqAguardando(count('Aguardando'), st)}
    ${st === 'Aguardando' ? '' : `<div class="cell-days mem-seg" role="group" aria-label="Situação" data-seg="eq-membros">${chips}</div>`}
    <div class="mem-filters"><label class="visually-hidden" for="eq-q">Buscar por nome, e-mail ou celular</label><input id="eq-q" type="search" value="${escape(state.memQ || '')}" placeholder="Buscar nome, e-mail ou celular" autocomplete="off" enterkeyhint="search">
    <div class="mem-filter-row"><label class="visually-hidden" for="eq-cell">Célula</label><select id="eq-cell"><option value="">Todas as células</option>${cells.map(c => `<option value="${escape(c)}"${state.memCell === c ? ' selected' : ''}>${escape(eqCelula(c))}</option>`).join('')}<option value="-"${state.memCell === '-' ? ' selected' : ''}>Sem célula</option></select><button type="button" class="mem-chip${state.memBday ? ' is-active' : ''}" data-eq-bday="1" aria-pressed="${!!state.memBday}">Aniversário no mês</button></div></div>
    ${eqExportBox(list)}
    <div class="mem-count" aria-live="polite">${list.length} pessoa${list.length === 1 ? '' : 's'}${filtered ? ' · <button type="button" class="mem-clear" data-eq-clear="1">Limpar filtros</button>' : ''}</div>
    <ul class="mem-list">${shown.map(row).join('') || '<li class="box tes-empty">Ninguém encontrado com esses filtros.</li>'}</ul>
    ${list.length > shown.length ? `<button type="button" class="action admin-secondary mem-more" data-eq-more="1">Mostrar todas as ${list.length}</button>` : ''}${pr}`;
  }
  // Membresia real: formulário, reunião de integração e apresentação no culto (ordem obrigatória). Mesmo visual da demonstração.
  const EQ_ETAPAS = [['formulario', 'Formulário'], ['reuniao', 'Reunião'], ['apresentacao', 'Apresentação']];
  const eqTick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';
  function eqPessoaCard(p) {
    const at = EQ_ETAPAS.findIndex(([k]) => !p[k + '_em']), cur = at < 0 ? 3 : at, prox = at < 0 ? null : EQ_ETAPAS[at][0];
    const steps = `<ol class="gift-steps admin-steps" aria-label="Etapas de ${escape(p.nome)}">${EQ_ETAPAS.map(([k, l], i) => `<li class="${p[k + '_em'] ? 'is-done' : i === cur ? 'is-current' : ''}"${i === cur ? ' aria-current="step"' : ''}><span class="gift-dot">${p[k + '_em'] ? eqTick : '0' + (i + 1)}</span><span class="gift-step-label">${l}</span></li>`).join('')}</ol>`;
    const label = { formulario: 'Registrar formulário recebido', reuniao: 'Registrar reunião de integração', apresentacao: 'Registrar apresentação no culto' };
    const action = prox ? `<button type="button" class="action primary" data-eq-etapa="${prox}" data-id="${p.id}">${label[prox]}</button>` : '';
    const sair = prox ? `<button type="button" class="action admin-secondary" data-eq-etapa="remover" data-id="${p.id}">Retirar da integração</button>` : '';
    const log = [['iniciado', 'Início'], ...EQ_ETAPAS].filter(([k]) => p[k + '_em']).map(([k, l]) => `<li><b>${l}</b> ${fmtDay(p[k + '_em'])} · ${escape(p[k + '_nome'] || 'Equipe')}</li>`).join('');
    return `<article class="box admin-person"><div class="admin-person-head">${avatarHtml(p.nome, p.foto)}<div><h3>${escape(p.nome)}</h3><small>${escape(vinculoLabel[p.vinculo] || '')}${p.celula ? ' · ' + escape(eqCelula(p.celula)) : ''}</small></div>${p.apresentacao_em ? '<span class="tag status-active">Membro</span>' : '<span class="tag">Em integração</span>'}</div>${steps}${action ? `<div class="form-actions gift-actions">${action}${sair}</div>` : ''}${log ? `<details class="admin-log"><summary>Histórico de registros</summary><ul>${log}</ul></details>` : ''}</article>`;
  }
  function membershipRealPage() {
    eqLoad('memb', () => NibConta.membresia(), 'membresia');
    if (!state.memb) return state.membErro ? `<p class="form-error" role="alert">${escape(state.membErro)}</p>` : '<p class="event-empty">Carregando a membresia</p>';
    const all = state.memb.pessoas || [], open = all.filter(p => !p.apresentacao_em), done = all.filter(p => p.apresentacao_em).slice(0, 20);
    const lid = NibConta.lideranca();
    // Quem pode entrar no caminho: ainda não é membro e não está na lista.
    const ids = new Set(all.map(p => String(p.id)));
    const cand = state.mem ? state.mem.pessoas.filter(p => p.membro_status === 'nao' && !ids.has(String(p.id))) : null;
    if (!state.mem) eqLoad('mem', () => NibConta.membros(), 'membresia');
    const add = cand && cand.length ? `<section class="box mem-add"><h2>Iniciar integração</h2><p>Escolha quem quer se tornar membro. A pessoa precisa ter cadastro no app.</p><div class="mem-filter-row"><label class="visually-hidden" for="eq-memb-add">Pessoa</label><select id="eq-memb-add"><option value="">Escolha a pessoa</option>${cand.map(p => `<option value="${p.id}">${escape(p.nome)} · ${escape(eqSituacao(p))}</option>`).join('')}</select><button type="button" class="action primary" data-eq-etapa="inicio" data-id="">Iniciar</button></div></section>` : '';
    return `<div class="admin-intro"><p>As três etapas seguem uma ordem obrigatória: formulário, reunião de integração e apresentação no culto. Toque no botão para registrar a próxima. ${lid ? 'A Liderança Pastoral e a Secretaria podem registrar.' : 'A Secretaria e a Liderança Pastoral podem registrar.'}</p></div>
    <div class="mem-link-row">${button('Ver todos os membros', 'membros')}</div>${add}
    <div class="admin-people">${open.map(eqPessoaCard).join('') || '<section class="box"><p>Ninguém em integração no momento.</p></section>'}</div>
    ${done.length ? `<h2 class="admin-subtitle">Apresentados</h2><div class="admin-people">${done.map(eqPessoaCard).join('')}</div>` : ''}
    <p class="note">Ao registrar a apresentação no culto, a pessoa passa a ser membro confirmado e recebe um aviso no celular. Quem já era membro antes do app é confirmado em Cadastros.</p>`;
  }
  async function eqEtapa(btn) {
    let id = btn.dataset.id;
    if (btn.dataset.eqEtapa === 'inicio' && !id) { const sel = content.querySelector('#eq-memb-add'); id = sel && sel.value; if (!id) { announce('Escolha a pessoa para iniciar a integração.', 'error'); return; } }
    if (btn.dataset.eqEtapa === 'apresentacao' && !confirm('Registrar a apresentação no culto? A pessoa passa a ser membro confirmado.')) return;
    if (btn.dataset.eqEtapa === 'remover' && !confirm('Retirar esta pessoa da integração?')) return;
    btn.disabled = true;
    try {
      await NibConta.membresiaEtapa(Number(id), btn.dataset.eqEtapa);
      state.memb = null; state.mem = null; state.painel = null;
      if (state.view === 'membros') { show('membros', false, false); } else show('membresia', false, false);
      announce(btn.dataset.eqEtapa === 'apresentacao' ? 'Apresentação registrada. A pessoa agora é membro.' : btn.dataset.eqEtapa === 'remover' ? 'Pessoa retirada da integração.' : 'Etapa registrada.', 'success', false);
    } catch (e) { btn.disabled = false; announce(e.message, 'error'); }
  }
  async function eqExport(form) {
    const v = new FormData(form), err = form.querySelector('.form-error'), btn = form.querySelector('[type=submit]');
    if (!v.get('ok')) { err.textContent = 'Marque que o arquivo é para uso interno da igreja.'; return; }
    const groups = v.getAll('g'), formato = String(v.get('format')) === 'pdf' ? 'pdf' : 'csv', list = eqFiltrados(), sel = EQ_GRUPOS.filter(([k]) => groups.includes(k));
    btn.disabled = true; err.textContent = '';
    try { await NibConta.membrosExportados({ n: list.length, formato, grupos: groups, uso_interno: true }); }
    catch (e) { btn.disabled = false; err.textContent = e.message; return; }
    const head = ['nome', 'situacao', ...sel.flatMap(g => g[4])], rows = list.map(p => [p.nome, eqSituacao(p), ...sel.flatMap(g => g[3](p))]);
    const agora = new Date(), at = agora.toLocaleDateString('pt-BR') + ' ' + agora.toTimeString().slice(0, 5);
    state.memGroups = groups; state.memExportOpen = true;
    state.mem.exportacoes = [{ em: NibDaily.dayKey(agora) + ' ' + agora.toTimeString().slice(0, 5), nome: account().nome, detalhes: `n=${rows.length};formato=${formato}` }, ...(state.mem.exportacoes || [])].slice(0, 3);
    if (formato === 'pdf') {
      const LBL = { nome: 'Nome', situacao: 'Situação', celular: 'Celular', email: 'E-mail', endereco: 'Endereço', celula: 'Célula', membro_desde: 'Membro desde', ultima_presenca: 'Última presença', nascimento: 'Nascimento', genero: 'Gênero' };
      state.memPrint = { at, head: head.map(h => LBL[h] || h), rows }; show('membros', false, false);
      setTimeout(() => { if (typeof print === 'function') print(); }, 60);
      announce(`PDF com ${rows.length} pessoas pronto. Escolha "Salvar como PDF" na impressão.`, 'success', false); return;
    }
    const q = x => /[;"\n]/.test(String(x)) ? '"' + String(x).replace(/"/g, '""') + '"' : String(x);
    const csv = '﻿' + [head, ...rows].map(r => r.map(q).join(';')).join('\r\n');
    try { const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })), a = document.createElement('a'); a.href = url; a.download = `nib-membros-${NibDaily.dayKey(agora)}.csv`; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); } catch (_) {}
    show('membros', false, false); announce(`Planilha com ${rows.length} pessoas baixada. A exportação ficou registrada.`, 'success', false);
  }
  function eqFilterInput(q) {
    state.memQ = q; const list = eqFiltrados(), ids = new Set(list.map(p => String(p.id)));
    content.querySelectorAll('.mem-list [data-eq-mem]').forEach(b => { b.parentElement.hidden = !ids.has(b.dataset.eqMem); });
    if (!state.memMore && list.length > content.querySelectorAll('.mem-list [data-eq-mem]').length) { state.memMore = true; show('membros', false, false); const i = content.querySelector('#eq-q'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } return; }
    const c = content.querySelector('.mem-count'); if (c) c.firstChild.textContent = `${list.length} pessoa${list.length === 1 ? '' : 's'}`;
  }
  // Link do e-mail "Esqueci minha senha": ?redefinir=TOKEN abre a troca de senha.
  function resetDialog(token) {
    const d = document.createElement('dialog'); d.className = 'reset-dialog'; d.setAttribute('aria-labelledby', 'reset-title');
    d.innerHTML = '<form method="dialog" novalidate><h2 id="reset-title">Criar nova senha</h2><p>Escolha uma senha nova para sua conta.</p><label for="reset-pass">Nova senha</label><input id="reset-pass" type="password" autocomplete="new-password" required><label for="reset-pass2">Repita a senha</label><input id="reset-pass2" type="password" autocomplete="new-password" required><p class="note">Pelo menos 8 caracteres, com letra maiúscula, minúscula, número e símbolo.</p><p class="form-error" role="alert"></p><div class="form-actions"><button class="action" type="submit">Salvar nova senha</button><button class="button" type="button" data-reset-cancel>Cancelar</button></div></form>';
    document.body.append(d);
    const clean = () => { const u = new URL(location.href); u.searchParams.delete('redefinir'); history.replaceState(null, '', u.pathname + u.search + u.hash); d.close(); d.remove(); };
    d.querySelector('[data-reset-cancel]').addEventListener('click', clean);
    d.querySelector('form').addEventListener('submit', async e => {
      e.preventDefault();
      const a = d.querySelector('#reset-pass').value, b = d.querySelector('#reset-pass2').value, err = d.querySelector('.form-error'), btn = d.querySelector('[type=submit]');
      if (!passRules(a).every(Boolean)) { err.textContent = 'A senha ainda não atende a todos os critérios.'; return; }
      if (a !== b) { err.textContent = 'As senhas não são iguais.'; return; }
      btn.disabled = true; err.textContent = '';
      try { await NibConta.redefinir(token, a); clean(); applyAccount(); if (LOGIN_REQUIRED) publicStart(true); announce('Senha criada. Você já entrou na sua conta.', 'success', false); }
      catch (e2) { err.textContent = e2.message; btn.disabled = false; }
    });
    d.showModal();
  }
  if (PUBLIC && window.NibConta && NibConta.available()) {
    const goHash = () => { const v = location.hash.slice(1); if (v && allowedPublic().includes(v)) show(v, false, false); };
    authReady.then(() => { if (account()) applyAccount(); goHash(); pendingQrCheckin(); pendingPilula(); youtubeVolta(); });
    // Volta da tela do Google ao conectar o canal (api/youtube.php redireciona para /app/?youtube=...#pilulas).
    function youtubeVolta() {
      const r = new URLSearchParams(location.search).get('youtube'); if (!r) return;
      const u = new URL(location.href); u.searchParams.delete('youtube'); history.replaceState(null, '', u.pathname + u.search + u.hash);
      const msg = { ok: ['Canal do YouTube conectado. Já dá para enviar as pílulas.', 'success'], cancelado: ['A conexão com o YouTube foi cancelada.', 'info'], expirou: ['A conexão demorou demais. Toque em Conectar de novo.', 'warning'], 'sem-projeto': ['Falta colocar no servidor as chaves do projeto do Google.', 'warning'], 'sem-permissao': ['Só a administração conecta o canal do YouTube.', 'warning'] }[r] || ['Não foi possível conectar o canal do YouTube. Tente de novo.', 'warning'];
      state.pil = null; state.ytEstado = null; const alvo = allowedPublic().includes('equipe') ? 'equipe' : 'pilulas'; if (allowedPublic().includes(alvo)) show(alvo, false, false); announce(msg[0], msg[1], false);
    }
    if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', e => { const v = e.data && e.data.nibView; if (typeof v === 'string' && allowedPublic().includes(v)) { if (v === 'caderno') { state.prayersLoaded = false; } if (v === 'avisos') { state.avisos = null; } if (v === 'pilulas') { state.pil = null; state.pilSel = null; } show(v, false, false); } });
    const token = new URLSearchParams(location.search).get('redefinir');
    if (token && /^[a-f0-9]{64}$/.test(token)) resetDialog(token);
  }
})();
