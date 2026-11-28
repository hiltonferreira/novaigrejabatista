  // v198: o seletor do topo termina na mesma margem direita dos blocos da página (muda com a largura e com o menu recolhido).
  function alinharTopo() {
    const hr = document.querySelector('#nib-proposta>header .header-right'), main = document.querySelector('#nib-proposta .layout>main');
    if (!hr || !main) return;
    if (!alinharTopo.obs && window.ResizeObserver) { alinharTopo.obs = new ResizeObserver(() => alinharTopo()); alinharTopo.obs.observe(main); }
    const h = hr.parentElement, hs = getComputedStyle(h), ms = getComputedStyle(main);
    const d = (h.getBoundingClientRect().right - parseFloat(hs.paddingRight)) - (main.getBoundingClientRect().right - parseFloat(ms.paddingRight));
    hr.style.setProperty('--nib-topo-dir', Math.round(d) + 'px');
  }
  function renderNavigation() {
    const items = isManagement() ? admin.views() : PUBLIC ? publicNav() : navigation;
    const context = isManagement() ? state.context : PUBLIC ? 'pub-' + (account() ? account().id + '-' + account().papel : 'anon') : 'membro';
    for (const nav of [document.getElementById('navigation'), document.getElementById('mobile-navigation')]) {
      if (nav.dataset.context !== context) {
        if (nav.id === 'navigation') { const link = ([key,label]) => `<a href="#${key}" data-view="${key}" aria-label="${label}">${navIcon(key)}<span>${label}</span></a>`; nav.innerHTML = PUBLIC && !isManagement() ? publicGroups(items).map(([label,links], i) => `<div class="nav-group"><span class="nav-group-label">${label}</span>${links.map(link).join('')}</div>`).join('') : items.map(link).join(''); }
        else {
          const descriptions = {...admin.descriptions, inicio:'Seu ponto de partida',cadastro: PUBLIC ? 'Seus dados na igreja' : 'Dados e atualizações',eventos:'Encontros e inscrições',generosidade:'Dízimos, ofertas e campanhas',historico:'Seu histórico financeiro',celulas: PUBLIC ? 'Encontre uma célula' : 'Acesso à plataforma', entrar:'Sua conta na Nib', equipe:'Números e atalhos da equipe',membros:'Lista, ficha e exportação',membresia:'Integração e apresentação',presenca:'Presença na EBS e nos cultos',pilulas:'Vídeos curtos para meditar',cadastros:'Confirmar membros',checkin:'Presença nos cultos',sugestoes:'Ideias e melhorias',informacoes: PUBLIC ? 'Horários, endereço e liderança' : 'Programação e avisos',gestao:'Integração e apresentações',agenda:'Cultos, eventos e festividades',caderno:'Ore com a comunidade',avisos:'Comunicados para toda a igreja'};
          const groups = isManagement() ? [[admin.profiles[state.context].name,items]] : PUBLIC ? publicGroups(items) : [['Seu acesso',items.filter(([key])=>['inicio','cadastro'].includes(key))],['Vida na igreja',items.filter(([key])=>['agenda','eventos','generosidade','historico','celulas','informacoes','caderno'].includes(key))]];
          nav.innerHTML = groups.map(([label,links],index) => `<section class="menu-group" aria-labelledby="menu-group-${index}"><h3 id="menu-group-${index}">${label}</h3><div class="menu-grid">${links.map(([key,title])=>`<a href="#${key}" data-view="${key}" aria-label="${title}"><span class="menu-icon">${navIcon(key)}</span><strong>${title}</strong><span class="menu-description">${descriptions[key]}</span><span class="mobile-current" hidden>Atual</span></a>`).join('')}</div></section>`).join('');
        }
        nav.dataset.context = context;
      }
      nav.querySelectorAll('a').forEach(item => {
      const active = state.view === item.dataset.view || (item.dataset.view === 'membresia' && state.view === 'confirmar');
      item.classList.toggle('selected', active);
      if (item.dataset.on !== String(active)) { item.dataset.on = String(active); const holder = item.querySelector('.menu-icon'); const icon = barIcon(item.dataset.view, active); if (holder) holder.innerHTML = icon; else { const old = item.querySelector('svg'); if (old) old.outerHTML = icon; } }
      const current = item.querySelector('.mobile-current');
      if (current) current.hidden = !active;
      if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
      });
    }
    // v197: no computador, o "Ver o app como" fica no topo, à direita (pedido de Hilton, 26/11/2026). No celular continua no menu.
    const hv = document.getElementById('header-view-as'); if (hv) { const h = PUBLIC && !isManagement() ? viewAsSelect('topo') : ''; if (hv.innerHTML !== h) hv.innerHTML = h; hv.hidden = !h; alinharTopo(); }
    const ms = document.getElementById('member-shortcuts'); if (ms) ms.hidden = isManagement();
    document.getElementById('menu-profile').innerHTML = PUBLIC ? (account() ? '<a class="menu-profile-card" href="#cadastro" data-view="cadastro">' + avatarHtml(account().primeiro, account().foto) + '<span><strong>' + escape(account().nome) + '</strong><small>' + escape(account().email) + '</small>' + (NibConta.papeisReais().some(k => k !== 'membro') ? '<small>' + papeisTexto(NibConta.papeisReais()) + '</small>' : '') + '</span></a>' + viewAsSelect('menu') : '') : isManagement() ? '<div class="menu-profile-card"><strong>' + admin.profiles[state.context].name + '</strong><span>Experiência de teste</span></div>' : '<a class="menu-profile-card" href="#cadastro" data-view="cadastro"><span class="profile-avatar" aria-hidden="true">' + escape(state.member.first.charAt(0).toUpperCase()) + '</span><span><strong>' + escape(state.member.full) + '</strong><small>' + escape(state.member.email) + '</small></span><span class="profile-demo">Teste</span></a>';
    renderBar();
  }
  function show(view, focus = true, record = true) {
    if(view==='oracao') view='caderno'; // Compatibilidade com o destino anterior.
    if (PUBLIC && view === 'cadastros') { state.memStatus = 'Aguardando'; state.memSel = null; state.memMore = false; view = 'membros'; } // v155: Cadastros virou um filtro de Membros.
    if (isManagement() && !admin.allowed(view)) view = 'gestao';
    if (adminOnly.includes(view) && !isManagement() && !(PUBLIC && allowedPublic().includes(view))) view = 'inicio';
    if (PUBLIC && !allowedPublic().includes(view)) view = 'inicio';
    if (PUBLIC && record && view === 'equipe' && !state.painelLoading) state.painel = null; // números sempre atualizados ao abrir
    if (PUBLIC && record && view === 'membresia' && !state.membLoading) state.memb = null;
    if (PUBLIC && record && view === 'pilulas') { state.pilSel = null; state.pilEdit = false; state.pilCapaEd = false; pilCapaVidFechar(); if (!state.pilLoading) state.pil = null; }
    if (PUBLIC && record && view === 'membros' && !state.memLoading) { state.mem = null; state.memSel = null; state.memPrint = null; }
    if (record && focus && view !== state.view) viewHistory.push(state.view);
    state.view = (labels[view] || admin.labels[view]) ? view : 'inicio';
    root.dataset.view = state.view;
    document.getElementById('mobile-return').hidden = state.view === 'inicio' || (isManagement() && state.view === 'gestao') || (state.view === 'equipe' && !!publicTeamBar());
    const [eyebrow, title, description] = (isManagement() && admin.pageLabels(state.view)) || labels[state.view];
    document.getElementById('eyebrow').textContent = eyebrow;
    document.getElementById('heading').textContent = state.view === 'inicio' ? (PUBLIC ? (account() ? `Olá, ${account().primeiro}! Que bom ter você aqui.` : title) : title.replace('Jéssica', state.member.first)) : title;
    document.getElementById('description').textContent = description;
    feedback.textContent = ''; feedback.dataset.tone='info';
    const pages = {
      inicio: () => {
        const quick = `<section aria-labelledby="quick-title"><div class="section-heading"><h2 id="quick-title">O que você precisa está aqui</h2></div><div class="quick-actions">${[
        ['cadastro', 'Meu cadastro', 'Consulte seus dados e solicite uma atualização.'],
        ['eventos', 'Eventos e inscrições', 'Veja os encontros e acompanhe suas inscrições.'],
        ['generosidade', 'Dízimos e ofertas', 'Encontre as opções para contribuir e as campanhas.'],
        ['celulas', 'Células', 'Saiba como acessar a plataforma de células.'],
        ['informacoes', 'Programação e avisos', 'Consulte as informações e os canais da igreja.'],
        ['caderno', 'Caderno de oração', 'Compartilhe seus pedidos e ore com a comunidade.']
      ].map(([view, title, text]) => `<button type="button" class="quick-action admin-quick" data-view="${view}"><span class="home-action-icon" aria-hidden="true">${navIcon(view)}</span>${view === 'caderno' && cadNovos() ? `<span class="quick-badge" aria-label="${cadNovos()} ${cadNovos() === 1 ? 'pedido novo' : 'pedidos novos'}">${cadNovos() > 9 ? '9+' : cadNovos()}</span>` : ''}${view === 'informacoes' && unreadNotices() ? `<span class="admin-badge notice-badge" aria-label="${unreadNotices()} ${unreadNotices() === 1 ? 'aviso novo' : 'avisos novos'}">${unreadNotices()}</span>` : ''}<strong>${title}</strong><span class="home-action-description">${text}</span></button>`).join('')}</div></section>`;
        const events = `<section class="home-events-block" aria-labelledby="home-events-title"><div class="section-heading"><div><span class="label">PARTICIPE COM A GENTE</span><h2 id="home-events-title">Próximo evento</h2></div>${button('Ver todos', 'eventos')}</div>${eventCards(true)}</section>`;
        const install = window.NibInstall ? NibInstall.card() : '';
        if (PUBLIC) {
          const pq = `<section aria-labelledby="quick-title"><div class="section-heading"><h2 id="quick-title">${teamShortcuts() ? 'Atalhos do seu perfil' : 'O que você procura?'}</h2></div><div class="quick-actions">${(teamShortcuts() || [
            ['agenda', 'Agenda da igreja', 'Cultos, escola bíblica e eventos no calendário.'],
            ['presenca', 'Check-in', 'Registre sua presença na EBS e nos cultos.'],
            ['generosidade', 'Dízimos e ofertas', 'Contribua pelo Pix com os dados oficiais da igreja.'],
            ['celulas', 'Células', 'Encontre uma célula perto de você.'],
            ['pilulas', 'Pílulas de Sabedoria', 'Vídeos curtos do pastor para meditar na Palavra.'],
            ['caderno', 'Caderno de oração', 'Compartilhe seus pedidos e ore com a comunidade.']
          ]).map(([view, title, text]) => view === 'youtube' ? `<button type="button" class="quick-action admin-quick" data-open-url="https://www.youtube.com/@nibcasadedeus"><span class="home-action-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5C3 6 4 5 5.5 5h13C20 5 21 6 21 7.5v9c0 1.5-1 2.5-2.5 2.5h-13C4 19 3 18 3 16.5z M10 9l5 3-5 3z"/></svg></span><strong>${title}</strong><span class="home-action-description">${text}</span></button>` : `<button type="button" class="quick-action admin-quick" data-view="${view}"><span class="home-action-icon" aria-hidden="true">${navIcon(view)}</span>${view === 'caderno' && cadNovos() ? `<span class="quick-badge" aria-label="${cadNovos()} ${cadNovos() === 1 ? 'pedido novo' : 'pedidos novos'}">${cadNovos() > 9 ? '9+' : cadNovos()}</span>` : ''}${teamBadge(view)}<strong>${title}</strong><span class="home-action-description">${text}</span></button>`).join('')}</div></section>`;
          const social = account() && NibConta.equipe() ? '' : socialBanners();
          if (isDesk()) return `${birthNudge()}${teamHome()}<div class="home-desk"><div class="home-col">${homePilEstudio()}${dailyBlocks(false,'verse')}${homePilula()}${publicCheckin()}${pq}${account() && state.prayersLoaded && state.prayers.some(p => !p.answered) ? communityBlock() : ''}${social}</div><div class="home-rail">${homeAvisos()}${install}${dailyBlocks(false,'agenda')}${events}</div></div>`;
          return `${birthNudge()}${teamHome()}${homePilEstudio()}${dailyBlocks(false,'verse')}${homePilula()}${publicCheckin()}${homeAvisos()}${install}${pq}${social}${account() && state.prayersLoaded && state.prayers.some(p => !p.answered) ? communityBlock() : ''}${dailyBlocks(false,'agenda')}${events}`;
        }
        if (isDesk()) return `<div class="home-desk"><div class="home-col">${dailyBlocks(false,'verse')}${quick}${socialBanners()}${communityBlock()}</div><div class="home-rail">${checkinCard()}${install}${homeNotice()}${dailyBlocks(false,'agenda')}${birthdayBlock()}${events}</div></div>`;
        return `${dailyBlocks(false,'verse')}${checkinCard()}${install}${quick}${socialBanners()}${homeNotice()}${dailyBlocks(false,'agenda')}${birthdayBlock()}${events}${communityBlock()}`;
      },
      agenda: () => calendarPage(),
      caderno: () => notebookPage(),
      avisos: () => avisosPage(),
      pilulas: () => pilulasPage(),
      sugestoes: () => sugestoesPage(),
      presenca: () => presencaPage(),
      checkin: () => checkinPanel(),
      cadastros: () => teamPage(),
      equipe: () => teamPanel(),
      membros: () => membersRealPage(),
      membresia: () => membershipRealPage(),
      cadastro: () => PUBLIC ? accountPage() : `<div class="profile-layout"><section class="box profile-summary"><span class="tag">Membro · exemplo</span><h2>${escape(state.member.full)}</h2><p>Confira seu cadastro na igreja.</p><dl class="profile"><dt>E-mail</dt><dd>jessica@example.com</dd><dt>Tratamento</dt><dd>${g('Masculino', 'Feminino')}</dd><dt>Telefone</dt><dd>Não informado</dd><dt>Endereço</dt><dd>Não informado</dd><dt>Apresentação no culto</dt><dd>Apresentação registrada · exemplo</dd></dl><label class="check profile-bday"><input type="checkbox" id="bday-visible"${state.hideBirthday ? '' : ' checked'}><span>Mostrar meu aniversário (dia e mês) na tela inicial da igreja</span></label><p class="note">As alterações são encaminhadas para conferência da Secretaria.</p></section><section class="box profile-edit"><h2>O que você deseja atualizar?</h2><p>Preencha somente os dados que precisam mudar.</p><form id="profile-form"><fieldset><legend>Dados para atualização</legend><div class="form-grid"><div><label for="new-name">Nome completo</label><input id="new-name" name="newName" autocomplete="off" placeholder="Informe o nome corrigido" maxlength="160"></div><div><label for="new-email">Novo e-mail</label><input id="new-email" name="newEmail" type="email" autocomplete="off" placeholder="nome@exemplo.com" maxlength="160"></div><div><label for="new-phone">Novo telefone / WhatsApp</label><input id="new-phone" name="newPhone" type="tel" inputmode="tel" autocomplete="off" placeholder="(69) 99999-9999" maxlength="25"></div><div><label for="new-address">Endereço</label><input id="new-address" name="newAddress" autocomplete="off" placeholder="Rua, número, bairro e cidade" maxlength="250"></div></div></fieldset><fieldset><legend>Contato e observações</legend><label for="contact-email">E-mail para retorno</label><input id="contact-email" name="email" type="email" autocomplete="email" value="${escape(state.member.email)}" placeholder="exemplo@example.com" maxlength="160" required><label for="contact-note">Outra alteração ou observação (opcional)</label><textarea id="contact-note" name="note" placeholder="Descreva o que a Secretaria precisa conferir." maxlength="500"></textarea></fieldset><div class="form-actions"><button class="action" type="submit">Enviar solicitação de teste</button><button type="reset">Limpar alterações</button></div></form><p class="note">Use dados fictícios. A solicitação fica nesta sessão; nenhum cadastro real é alterado.</p></section></div>${myRequestsBox()}`,
      eventos: () => `${eventCards()}${PUBLIC && account() ? myRegistrations() : legacyRegsBox()}`,
      celulas: () => cellsPage(),
      historico: () => historyPage(),
      generosidade: () => `${(state.giftStep || 'finalidade') === 'finalidade' && !PUBLIC ? historyPeek() : ''}<div class="giving-layout${(state.giftStep || 'finalidade') === 'finalidade' ? '' : ' is-flow'}"><section class="box gift-box" aria-labelledby="gift-step-title">${giftFlow()}</section>${(state.giftStep || 'finalidade') === 'finalidade' ? `<section class="box giving-details"><h2>Outras formas de contribuir</h2><p class="giving-church">Se preferir, faça o Pix direto no app do seu banco com os dados oficiais da igreja, os mesmos do site.</p><dl class="bank-details"><div><dt>Pix (CNPJ)</dt><dd>40.518.758/0001-30</dd></div><div><dt>Banco</dt><dd>Sicoob</dd></div><div><dt>Agência / Conta</dt><dd>3315 / 51.404-7</dd></div></dl><figure class="church-qr church-qr-open"><img src="assets/pix-qrcode.png" alt="QR Code Pix oficial da Nova Igreja Batista" width="200" height="200"><figcaption>Abra o app do seu banco e escaneie o QR Code para fazer o Pix.</figcaption><button type="button" class="action church-pix-copy" id="church-pix-copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 9h10v10H9z M5 15V5h10"/></svg><span>Copiar código Pix</span></button><small class="church-pix-note">Depois, cole em Pix copia e cola e informe o valor no app do banco.</small></figure></section>` : ''}</div>`,
      informacoes: () => PUBLIC ? siteInfoPage() : `${admin.infoProgram()}<section class="box church-contact"><h2>Endereço e contato</h2><p class="church-address"><strong>Nova Igreja Batista</strong>Rua França, 1409 · Áreas Especiais 01<br>Ariquemes, RO · 76870-013</p><div class="form-actions"><a class="button button-go" href="https://www.google.com/maps/search/?api=1&amp;query=Nova%20Igreja%20Batista%20Rua%20Fran%C3%A7a%201409%20Ariquemes%20RO" target="_blank" rel="noopener">Abrir no mapa ${arrow}</a><a class="button button-go" href="https://www.instagram.com/nibcasadedeus/" target="_blank" rel="noopener">Instagram ${arrow}</a><a class="button button-go" href="https://www.youtube.com/@nibcasadedeus" target="_blank" rel="noopener">YouTube ${arrow}</a></div><p class="note">O WhatsApp da Secretaria entra aqui quando a igreja definir o número oficial.</p></section>`
    };
    syncViewAsBar();
    content.innerHTML = (isManagement() && admin.pages[state.view] ? admin.pages[state.view] : pages[state.view])();
    content.dataset.view = state.view;
    segify(content);
    content.querySelectorAll('[data-w]').forEach(el => el.style.setProperty('width', el.dataset.w + '%'));
    if (state.view === 'inicio') myBirthdayPopup();
    if (state.view === 'informacoes' && !isManagement()) { state.noticesSeen = admin.noticesCount(); refreshNotices(); }
    bindSocialBanners(); renderPixQr(); syncCampaignBar();
    renderNavigation();
    closeDrawer();
    if (notices.open) notices.close();
    const dateField = document.getElementById('presented-date');
    if (dateField) dateField.max = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Manaus', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    if (focus) { document.getElementById('heading').focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); const m = document.getElementById('main'); m.classList.remove('is-entering'); void m.offsetWidth; m.classList.add('is-entering'); }
  }
  root.addEventListener('click', event => {
    const action = event.target.closest('button,a[data-view],a[data-back]');
    if (!action || action.disabled) return;
    if (isManagement() && admin.click(action)) return;
    if (action.dataset.fansOpen) { openFans(); return; }
    if (action.dataset.fansClose) { const d = document.getElementById('fans-dialog'); if (d) d.close(); return; }
    if (action.dataset.bdayClose) { const d = document.getElementById('bday-dialog'); if (d) d.close(); return; }
    if (action.dataset.bdayAll) { state.bdayAll = true; show('inicio', false, false); return; }
    if (action.dataset.congrats) { state.congrats = state.congrats || {}; const k = action.dataset.congrats; if (!state.congrats[k]) return openCongrats(action); state.congrats[k] = false; action.classList.toggle('is-sent', state.congrats[k]); action.setAttribute('aria-pressed', String(state.congrats[k])); action.textContent = state.congrats[k] ? 'Parabéns enviado' : 'Dar parabéns'; if (state.congrats[k]) announce('Parabéns enviado (teste). Na versão real, a pessoa recebe uma notificação.', 'success', false); return; }
    if (action.dataset.checkin) { const c = nextService(); if (c) admin.addCheckin({ day: c.day, name: c.name, who: state.member.full }); show('inicio', false, false); announce('Check-in feito. Sua presença no culto foi registrada (teste).', 'success', false); const t = content.querySelector('#checkin-title'); if (t) t.focus({preventScroll:true}); return; }
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
    if (action.id === 'mobile-back' && PUBLIC && state.view === 'pilulas' && state.pilSel) { event.preventDefault(); state.pilSel = null; state.pilEdit = false; state.pilCapaEd = false; pilCapaVidFechar(); show('pilulas', true, false); return; }
    if (action.id === 'mobile-back') { event.preventDefault(); show(viewHistory.pop() || (isManagement() ? 'gestao' : 'inicio'), true, false); return; }
    if (action.dataset.month) { state.calendarMonth=NibDaily.moveMonth(state.calendarMonth,Number(action.dataset.month)); state.calendarDay=state.calendarMonth+'-01'; show('agenda',false,false); content.querySelector('[data-month="'+action.dataset.month+'"]').focus({preventScroll:true}); srStatus.textContent=content.querySelector('.calendar-toolbar h2').textContent; return; }
    if (action.dataset.day) { state.calendarDay=action.dataset.day; show('agenda',false,false); content.querySelector('[data-day="'+state.calendarDay+'"]').focus({preventScroll:true}); srStatus.textContent=calendarAnnouncement(); return; }
    if (action.id==='calendar-today') { state.calendarDay=NibDaily.dayKey(new Date()); state.calendarMonth=state.calendarDay.slice(0,7); show('agenda',false,false); content.querySelector('#calendar-today').focus({preventScroll:true}); srStatus.textContent=calendarAnnouncement(); return; }
    if (action.id==='verse-clear') { NibDaily.setCurated(NibDaily.dayKey(new Date())); show(isManagement() ? 'palavra' : 'inicio',false,false); announce('Hoje volta a usar a lista automática.','success',false); return; }
    if (action.dataset.prayerSupport) {
      const p=state.prayers.find(x=>x.id===action.dataset.prayerSupport); if(!p||isManagement()) return;
      p.supported=!p.supported; p.supporters+=p.supported?1:-1;
      if (PUBLIC) { const want = p.supported; NibConta.caderno('orar', { id: Number(p.id), orando: want }).then(r => { p.supporters = r.orando; const cap = content.querySelector('[data-prayer-support="' + p.id + '"]'); if (cap) cap.parentElement.querySelector('.prayer-support-caption').innerHTML = prayCaption(p); }).catch(e => { p.supported = !want; p.supporters += want ? -1 : 1; announce(e.message, 'error'); show(state.view, false, false); }); }
      action.setAttribute('aria-pressed',String(p.supported));
      action.querySelector('.prayer-support-label').textContent=p.supported?'Orando':'Vou orar';
      action.parentElement.querySelector('.prayer-support-caption').innerHTML=prayCaption(p);
      feedback.textContent=p.supported?'Você está orando por este pedido.':'Você deixou de marcar este pedido.';
      return;
    }
    if (action.dataset.checkinGo !== undefined && PUBLIC) { if (!state.ckBusy) doCheckin('local'); return; }
    if (action.dataset.ckTelao !== undefined && PUBLIC) { const r = state.ckPanel; if (!r) return; const url = location.origin + location.pathname.replace(/[^/]*$/, '') + '?checkin=' + r.qr; const d = document.createElement('dialog'); d.className = 'ck-telao'; d.innerHTML = `<div class="ck-telao-in"><img src="assets/splash-logo-final.webp" alt="Nib" width="200" height="75"><h2>Check-in do culto</h2><div class="ck-qr">${qrSvg(url)}</div><p>Aponte a câmera do celular e registre sua presença.</p><button type="button" class="action">Fechar</button></div>`; document.body.append(d); d.querySelector('button').addEventListener('click', () => { d.close(); d.remove(); }); d.addEventListener('close', () => d.remove()); d.showModal(); if (d.requestFullscreen) d.requestFullscreen().catch(() => {}); return; }
    if (action.dataset.ckLocal !== undefined && PUBLIC) { action.disabled = true; action.textContent = 'Lendo a localização'; posicao(15000).then(pos => { if (!pos) throw new Error('Não conseguimos a localização. Permita o acesso e tente de novo.'); return NibConta.checkin('local', pos); }).then(() => { state.ckPanel = null; show('checkin', false, false); announce('Local da igreja definido.', 'success'); }).catch(e => { action.disabled = false; action.textContent = 'Definir o local da igreja aqui'; announce(e.message, 'error'); }); return; }
    if (action.dataset.sugTipo && PUBLIC) { const t = content.querySelector('#sug-texto'); if (t) state.sugDraft = t.value; state.sugTipo = action.dataset.sugTipo; show('sugestoes', false, false); const b = content.querySelector(`[data-sug-tipo="${state.sugTipo}"]`); if (b) b.focus({preventScroll:true}); return; }
    if (action.dataset.sugLida && PUBLIC) { const id = Number(action.dataset.sugLida), lida = action.dataset.lida === '1'; action.disabled = true; NibConta.sugestaoLida(id, lida).then(() => { const s = state.sugList.find(x => Number(x.id) === id); if (s) s.lida = lida; show('sugestoes', false, false); }).catch(e => { action.disabled = false; announce(e.message, 'error'); }); return; }
    if (PUBLIC && action.dataset.pilAbrir) { state.pilSel = { id: Number(action.dataset.pilAbrir), t: Number(action.dataset.t) || 0 }; state.pilEdit = false; state.pilCapaEd = false; pilCapaVidFechar(); if (!state.pilVer || state.pilVer.id !== state.pilSel.id) state.pilVer = null; show('pilulas', true, false); return; }
    if (PUBLIC && action.dataset.pilVoltar !== undefined) { state.pilSel = null; state.pilEdit = false; state.pilCapaEd = false; pilCapaVidFechar(); show('pilulas', true, false); return; }
    if (PUBLIC && action.dataset.pilT !== undefined) { const box = content.querySelector('#pil-player'), p = state.pilVer; if (box && p) { box.innerHTML = pilIframe(p, Number(action.dataset.pilT), true); box.scrollIntoView({ block: 'start', behavior: 'smooth' }); } return; }
    if (PUBLIC && action.dataset.pilTema !== undefined) { state.pilTema = action.dataset.pilTema; const grupo = action.parentElement; grupo.querySelectorAll(':scope > button').forEach(b => { const on = b === action; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on); }); segify(grupo.parentElement); loadPilulas().then(() => { if (state.view === 'pilulas') show('pilulas', false, false); }); return; }
    if (PUBLIC && action.dataset.pilNova !== undefined) { state.pilUp = null; state.pilForm = !!state.pilFile; show('pilulas', false, false); return; }
    if (PUBLIC && action.dataset.pilCancelar !== undefined) { state.pilForm = false; state.pilFile = null; pilCapaLimpar(); state.pilRasc = null; state.pilTemaNovo = ''; if (state.pilFileUrl) { URL.revokeObjectURL(state.pilFileUrl); state.pilFileUrl = null; } show('pilulas', false, false); return; }
    if (PUBLIC && action.dataset.pilTemaEscolha !== undefined) { const fs = action.closest('fieldset'); const on = !action.classList.contains('is-on'); fs.querySelectorAll('.pil-chip').forEach(b => { b.classList.remove('is-on'); b.setAttribute('aria-pressed', 'false'); }); if (on) { action.classList.add('is-on'); action.setAttribute('aria-pressed', 'true'); } fs.querySelector('[name=tema]').value = on ? action.dataset.pilTemaEscolha : ''; const o = fs.querySelector('.pil-tema-outro'); o.hidden = true; o.value = ''; state.pilTemaNovo = on ? action.dataset.pilTemaEscolha : ''; return; }
    if (PUBLIC && action.dataset.pilTemaOutro !== undefined) { const fs = action.closest('fieldset'); fs.querySelectorAll('.pil-chip').forEach(b => { b.classList.remove('is-on'); b.setAttribute('aria-pressed', 'false'); }); action.classList.add('is-on'); fs.querySelector('[name=tema]').value = ''; const o = fs.querySelector('.pil-tema-outro'); o.hidden = false; o.focus(); return; }
    if (PUBLIC && action.dataset.pilFechar !== undefined) { state.pilUp = null; show('pilulas', false, false); return; }
    if (PUBLIC && action.dataset.pilEditar !== undefined) { state.pilEdit = action.dataset.pilEditar === '1'; show('pilulas', false, false); return; }
    if (PUBLIC && action.dataset.pilDesconectar !== undefined) { if (!confirm('Desconectar o canal do YouTube do app? As pílulas já publicadas continuam, mas não dá para enviar novas até conectar de novo.')) return; action.disabled = true; NibConta.youtube('desconectar', {}).then(() => { state.pil = null; state.ytEstado = null; show(state.view, false, false); announce('Canal desconectado.', 'success', false); }).catch(e => { action.disabled = false; announce(e.message, 'warning'); }); return; }
    if (PUBLIC && action.dataset.pilLegenda !== undefined) { action.disabled = true; action.textContent = 'Buscando no YouTube'; NibConta.pilulas('legenda', { id: state.pilSel.id }).then(d => { state.pilVer = d.pilula; show('pilulas', false, false); announce(d.achou ? 'Transcrição encontrada.' : 'O YouTube ainda não gerou a legenda automática deste vídeo. O app tenta de novo sozinho.', d.achou ? 'success' : 'info', false); }).catch(e => { action.disabled = false; action.textContent = 'Buscar transcrição agora'; announce(e.message, 'warning'); }); return; }
    if (PUBLIC && action.dataset.pilEditarId) { state.pilSel = { id: Number(action.dataset.pilEditarId), t: 0 }; state.pilEdit = true; state.pilCapaEd = false; pilCapaVidFechar(); if (!state.pilVer || state.pilVer.id !== state.pilSel.id) state.pilVer = null; show('pilulas', true, false); return; }
    if (PUBLIC && action.dataset.pilOcultar !== undefined) { const oc = action.dataset.pilOcultar === '1'; action.disabled = true; NibConta.pilulas('ocultar', { id: state.pilSel.id, oculto: oc }).then(d => { state.pilVer = d.pilula; state.pil = null; state.pilHomeKey = null; show('pilulas', false, false); announce(oc ? 'Pílula oculta. A igreja não vê mais.' : 'Pílula visível para a igreja de novo.', 'success', false); }).catch(e => { action.disabled = false; announce(e.message, 'warning'); }); return; }
    if (PUBLIC && action.dataset.pilCapaEd !== undefined) { state.pilCapaEd = action.dataset.pilCapaEd === '1'; if (!state.pilCapaEd) pilCapaVidFechar(); show('pilulas', false, false); return; }
    if (PUBLIC && action.dataset.pilCapaFechar !== undefined) { if (state.pilSel) { pilCapaVidFechar(); show('pilulas', false, false); } else { state.pilCapaQuadros = false; const b = content.querySelector('#pil-capa'); if (b) b.outerHTML = pilCapaBox(null); } return; }
    if (PUBLIC && action.dataset.pilCapaQuadros !== undefined) { state.pilCapaQuadros = true; const b = content.querySelector('#pil-capa'); if (b) { b.outerHTML = pilCapaBox(null); const v = content.querySelector('.pil-capa-video video'); if (v) v.scrollIntoView({ block: 'center', behavior: 'smooth' }); } return; }
    if (PUBLIC && action.dataset.pilCurtir) { pilCurtir(action); return; }
    if (PUBLIC && action.dataset.fotoRemover !== undefined) { if (!confirm('Remover sua foto de perfil?')) return; action.disabled = true; NibConta.foto(null).then(() => { applyAccount(); show('cadastro', false, false); announce('Foto removida.', 'success', false); }).catch(e => { action.disabled = false; announce(e.message, 'warning'); }); return; }
    if (PUBLIC && action.dataset.pilCompartilhar !== undefined) { if (state.pilVer) pilCompartilhar(state.pilVer); return; }
    if (PUBLIC && action.dataset.pilQuadro !== undefined) { const vid = content.querySelector('.pil-capa-video video'); action.disabled = true; pilCapaQuadro(vid).then(pilCapaUsar).catch(e => announce(e.message, 'warning')).finally(() => { action.disabled = false; }); return; }
    if (PUBLIC && action.dataset.pilCapaAuto !== undefined) { action.disabled = true; pilCapaUsar(null).catch(e => { action.disabled = false; announce(e.message, 'warning'); }); return; }
    if (PUBLIC && action.dataset.pilRemover !== undefined) { if (!confirm('Excluir esta pílula? Ela sai do app e o vídeo é apagado do canal do YouTube. Não dá para desfazer.')) return; action.disabled = true; NibConta.pilulas('remover', { id: state.pilSel.id }).then(r => { state.pilSel = null; state.pilVer = null; state.pilCapaEd = false; pilCapaVidFechar(); state.pil = null; state.pilHomeKey = null; show('pilulas', false, false); announce(r.youtube_apagado ? 'Pílula excluída do app e do YouTube.' : 'Pílula excluída do app. O vídeo não foi apagado do YouTube; apague no YouTube Studio.', r.youtube_apagado ? 'success' : 'warning', !r.youtube_apagado); }).catch(e => { action.disabled = false; announce(e.message, 'warning'); }); return; }
    if (action.dataset.eventoAppRemover && PUBLIC) { if (!confirm('Remover este evento do app?')) return; action.disabled = true; NibConta.eventoApp('remover', { id: Number(action.dataset.eventoAppRemover) }).then(() => { NibSite.load(); announce('Evento removido.', 'success', false); }).catch(e => { action.disabled = false; announce(e.message, 'warning'); }); return; }
    if (action.dataset.avisoRemove && PUBLIC) { if (!confirm('Remover este aviso para toda a igreja?')) return; action.disabled = true; NibConta.avisos('remover', { id: Number(action.dataset.avisoRemove) }).then(loadAvisos).then(() => { show('avisos', false, false); refreshNotices(); announce('Aviso removido.', 'success', false); }).catch(e => { action.disabled = false; announce(e.message, 'warning'); }); return; }
    if (action.dataset.prayerRemove && PUBLIC) { const id = action.dataset.prayerRemove; action.disabled = true; NibConta.caderno('remover', { id: Number(id) }).then(() => { state.prayers = state.prayers.filter(x => x.id !== id); show('caderno', false, false); announce('Pedido tirado do caderno.', 'success', false); }).catch(e => { action.disabled = false; announce(e.message, 'error'); }); return; }
    if (PUBLIC && (action.dataset.prayerToggle || action.dataset.prayerDelete)) {
      const id = action.dataset.prayerToggle || action.dataset.prayerDelete, p = state.prayers.find(x => x.id === id); if (!p || !p.own) return; action.disabled = true;
      const del = !!action.dataset.prayerDelete;
      NibConta.caderno(del ? 'remover' : 'atendido', del ? { id: Number(id) } : { id: Number(id), atendido: !p.answered }).then(() => { if (del) state.prayers = state.prayers.filter(x => x.id !== id); else p.answered = !p.answered; show('caderno', false, false); announce(del ? 'Pedido excluído do caderno.' : p.answered ? 'Oração marcada como atendida.' : 'Pedido reaberto: voltou para em oração.', 'success', false); }).catch(e => { action.disabled = false; announce(e.message, 'error'); });
      return;
    }
    if (action.dataset.prayerToggle) { const p=state.prayers.find(x=>x.id===action.dataset.prayerToggle); if(!p||!p.own) return; p.answered=!p.answered; show('caderno',false,false); content.querySelector('[data-prayer-toggle="'+p.id+'"]').focus({preventScroll:true}); feedback.textContent=p.answered?'Oração marcada como atendida.':'Pedido reaberto: voltou para em oração.'; return; }
    if (action.dataset.prayerDelete) { const p=state.prayers.find(x=>x.id===action.dataset.prayerDelete); if(!p||!p.own) return; state.prayers=state.prayers.filter(x=>x.id!==p.id); show('caderno',false,false); content.querySelector('#prayer-feed-title').focus({preventScroll:true}); announce('Pedido removido do caderno de teste.','success',false); return; }
    if (action.dataset.view) { event.preventDefault(); show(action.dataset.view); }
    if (action.dataset.message) announce(action.dataset.message);
    if (action.dataset.giftAmount) { const input = content.querySelector('#gift-value'); input.value = action.dataset.giftAmount; content.querySelectorAll('[data-gift-amount]').forEach(b => b.setAttribute('aria-pressed', String(b === action))); return; }
    if (PUBLIC && (action.dataset.view === 'entrar' || action.dataset.accountOpen)) { event.preventDefault(); openAccount(action.dataset.accountOpen || 'login'); return; }
    if (action.dataset.teamStatus) { teamSet(action); return; }
    if (PUBLIC && action.dataset.push) { if (action.dataset.push === 'on') pushOn(action); else pushOffCall(); return; }
    if (PUBLIC && action.dataset.eqMem !== undefined) { state.memSel = action.dataset.eqMem || null; state.memPrint = null; show('membros', false, false); scrollTo(0, 0); return; }
    if (PUBLIC && action.dataset.eqPapel) { eqSalvarPapel(action); return; }
    if (PUBLIC && action.dataset.eqConfirm) { eqConfirmar(action); return; }
    if (PUBLIC && action.dataset.eqEtapa) { eqEtapa(action); return; }
    if (PUBLIC && action.dataset.eqStatus) { state.memStatus = action.dataset.eqStatus; state.memMore = false; show('membros', false, false); return; }
    if (PUBLIC && action.dataset.eqBday) { state.memBday = !state.memBday; show('membros', false, false); return; }
    if (PUBLIC && action.dataset.eqClear) { state.memQ = ''; state.memCell = ''; state.memBday = false; state.memStatus = 'todos'; show('membros', false, false); return; }
    if (PUBLIC && action.dataset.eqMore) { state.memMore = true; show('membros', false, false); return; }
    if (action.dataset.verComo && PUBLIC) { setViewAs(action.dataset.verComo); return; }
    if (action.dataset.cadTab !== undefined) { state.cadTab = action.dataset.cadTab; if (state.cadTab === 'painel') state.cadPainel = null; show('caderno', false, false); return; }
    if (action.dataset.teamFilter !== undefined) { state.teamFilter = action.dataset.teamFilter; show('cadastros', false, false); return; }
    if (action.dataset.openUrl) { window.open(action.dataset.openUrl, '_blank', 'noopener'); return; }
    if (action.dataset.cellDay !== undefined) { state.cellDay = action.dataset.cellDay; show('celulas', false, false); const b = content.querySelector('[data-cell-day="' + state.cellDay + '"]'); if (b) b.focus({preventScroll:true}); return; }
    if (action.dataset.historyYear) { state.historyYear = action.dataset.historyYear; show('historico', false, false); content.querySelector('[data-history-year="' + state.historyYear + '"]').focus({preventScroll:true}); return; }
    if (action.dataset.giftStep) { state.giftStep = action.dataset.giftStep; if (!PUBLIC && state.giftStep === 'obrigado' && state.giftAmount && state.giftLogged !== state.giftCode) { state.giftLogged = state.giftCode; const txid = 'E2E' + Date.now().toString().slice(-9); state.history.push({ day: NibDaily.dayKey(new Date()), type: state.gift, amount: state.giftAmount, status: 'pending', app: true, txid }); admin.addAppPix({ day: NibDaily.dayKey(new Date()), type: state.gift, amount: state.giftAmount, txid }); } if (action.dataset.done) state.giftAmount = null; if (state.giftStep === 'pix') { if (content.querySelector('#gift-receipt')) state.giftReceipt = content.querySelector('#gift-receipt').checked; state.giftCode = NibPix.brCode({ amount: state.giftAmount, description: ({'Dízimo':'Dizimo','Oferta':'Oferta','Campanha':'Campanha Obra do Templo'})[state.gift], txid: ({'Dízimo':'DIZ','Oferta':'OFE','Campanha':'OBRA'})[state.gift] + NibDaily.dayKey(new Date()).replace(/-/g,'') + Math.random().toString(36).slice(2,8) }); } show('generosidade', false, false); const t = content.querySelector('#gift-step-title'); if (t) t.focus({preventScroll:true});  return; }
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
    if (PUBLIC && form.id === 'pil-form') { pilEnviar(form); return; }
    if (PUBLIC && form.id === 'pil-edit-form') { const btn = form.querySelector('[type=submit]'); btn.disabled = true; const body = { id: state.pilSel.id, titulo: String(values.get('titulo') || ''), tema: String(values.get('tema') || ''), passagem: String(values.get('passagem') || ''), texto: String(values.get('texto') || ''), publicar_em: String(values.get('publicar_em') || '') }; if (values.has('transcricao') && String(values.get('transcricao')).trim() !== String(state.pilVer.transcricao || '').trim()) body.transcricao = String(values.get('transcricao')); NibConta.pilulas('editar', body).then(d => { state.pilVer = d.pilula; state.pilEdit = false; state.pil = null; state.pilHomeKey = null; show('pilulas', false, false); announce(d.youtube === false ? 'Pílula atualizada no app. No YouTube o título não mudou; tente salvar de novo mais tarde.' : d.youtube ? 'Pílula atualizada no app e no YouTube.' : 'Pílula atualizada.', d.youtube === false ? 'warning' : 'success', false); }).catch(e => { btn.disabled = false; announce(e.message, 'warning'); }); return; }
    if (PUBLIC && form.id === 'mem-export-form') { eqExport(form); return; }
    if (PUBLIC && form.id === 'sug-form') { const btn = form.querySelector('[type=submit]'), err = form.querySelector('.form-error'), texto = String(values.get('texto') || '').trim(); if (texto.length < 5) { err.textContent = 'Escreva sua mensagem.'; form.elements.texto.focus(); return; } btn.disabled = true; err.textContent = ''; NibConta.sugestao({ tipo: state.sugTipo || 'sugestao', texto }).then(() => { state.sugDraft = ''; state.sugList = null; show('sugestoes', false, false); announce('Obrigado! Sua mensagem foi enviada.', 'success'); }).catch(e => { err.textContent = e.message; btn.disabled = false; }); return; }
    if (PUBLIC && form.id === 'evento-app-form') { const btn = form.querySelector('[type=submit]'); btn.disabled = true; const g = k => String(values.get(k) || ''); NibConta.eventoApp('criar', { nome: g('nome'), categoria: g('categoria'), local: g('local'), dia: g('dia'), hora: g('hora'), dia_fim: g('dia_fim') || (g('hora_fim') ? g('dia') : ''), hora_fim: g('hora_fim'), sem_horario: values.get('sem_horario') === 'on', resumo: g('resumo'), link: g('link') }).then(() => { state.calendarDay = g('dia'); state.calendarMonth = g('dia').slice(0, 7); NibSite.load(); show('agenda', false, false); announce('Evento cadastrado. Ele aparece na Agenda e em Eventos.', 'success', false); }).catch(e => { btn.disabled = false; announce(e.message, 'warning'); }); return; }
    if (PUBLIC && form.id === 'aviso-form') { const btn = form.querySelector('[type=submit]'); btn.disabled = true; NibConta.avisos('publicar', { titulo: String(values.get('titulo') || ''), texto: String(values.get('texto') || ''), link: String(values.get('link') || ''), ate: String(values.get('ate') || ''), fixado: values.get('fixado') === 'on', notificar: values.get('notificar') === 'on' }).then(loadAvisos).then(() => { show('avisos', false, false); refreshNotices(); announce('Aviso publicado para toda a igreja.', 'success', false); }).catch(e => { btn.disabled = false; announce(e.message, 'warning'); }); return; }
    if (PUBLIC && accountSubmit(form, values)) return;
    if (form.id === 'profile-form') {
      const email = String(values.get('email')).trim();
      const changes = [['Nome', 'newName'], ['E-mail', 'newEmail'], ['Telefone', 'newPhone'], ['Endereço', 'newAddress']].map(([label,key]) => { const value = String(values.get(key) || '').trim(); return value ? label + ': ' + value : ''; }).filter(Boolean);
      const observation = String(values.get('note')).trim();
      if (observation) changes.push('Observação: ' + observation);
      const note = changes.join(' · ');
      if (!note) return announce('Preencha ao menos um dado para atualização ou descreva outra alteração.','warning');
      admin.addRequest({ name: state.member.full, email, note });
      show('cadastro', false, false);
      announce('Solicitação enviada à Secretaria (teste). Acompanhe o andamento em Minhas solicitações.','success');
    }
    if (form.id === 'notebook-form') {
      const name=String(values.get('name')||'').trim(); const reason=String(values.get('reason')||'').trim();
      if(!name||!reason) return announce('Informe a pessoa ou título e o motivo da oração.','warning');
      if(NibModeration.offensive(name+' '+reason)) { form.querySelector('#notebook-reason').setAttribute('aria-invalid','true'); return announce('Seu pedido tem palavras ofensivas ou de baixo calão. Revise o texto para publicar no caderno.','warning'); }
      form.querySelector('#notebook-reason').removeAttribute('aria-invalid');
      if (PUBLIC) { const btn = form.querySelector('[type=submit]'); btn.disabled = true; NibConta.caderno('publicar', { titulo: name.slice(0,120), motivo: reason.slice(0,1000) }).then(loadPrayers).then(() => { show('caderno', false, false); announce(state.prayerError || 'Pedido publicado no caderno de oração.', state.prayerError ? 'error' : 'success', false); }).catch(e => { btn.disabled = false; announce(e.message, 'warning'); }); return; }
      state.prayers.push({id:String(++notebookSequence),name:name.slice(0,120),reason:reason.slice(0,1000),author:state.member.full,answered:false,supporters:0,supported:false,own:true});
      show('caderno',false,false); content.querySelector('#notebook-name').focus({preventScroll:true}); announce('Pedido publicado apenas neste mural de teste. Não foi compartilhado com outros usuários.','success',false);
    }
    if (form.id === 'gift-form') {
      const amount = Number(String(values.get('amount')).replace(',','.'));
      if (!(amount >= 1 && amount <= 1000000)) return announce('Informe um valor a partir de R$ 1,00.','warning');
      state.giftAmount = Math.round(amount*100)/100; state.giftStep = 'confirmar';
      if (PUBLIC) { state.giftStep = 'pix'; state.giftCode = NibPix.brCode({ amount: state.giftAmount, txid: ({'Dízimo':'DIZ','Oferta':'OFE','Campanha':'OBRA'})[state.gift] + NibDaily.dayKey(new Date()).replace(/-/g,'') + Math.random().toString(36).slice(2,8) }); }
      show('generosidade', false, false); content.querySelector('#gift-step-title').focus({preventScroll:true}); return;
    }
  });
  function changeContext(event) {
    viewHistory.length = 0;
    state.context = event.target.value;
    document.getElementById('account').textContent = state.context === 'membro' ? state.member.full + ' · Membro' : admin.profiles[state.context].name + ' · Teste';
    show(isManagement() ? 'gestao' : 'inicio');
    refreshNotices();
    document.querySelector('.test-options').open = false;
    document.getElementById('demo-context').value = state.context;
    document.getElementById('demo-context-mobile').value = state.context;
  }
  root.addEventListener('change', e => { if (PUBLIC && e.target.matches('[data-pil-escolher]')) pilEscolher(e.target); if (PUBLIC && e.target.matches('[data-pil-programar]')) { const c = e.target.closest('form').querySelector('.pil-programar'); c.hidden = !e.target.checked; if (e.target.checked) c.querySelector('input').focus(); } if (PUBLIC && e.target.matches('[data-pil-capa-foto], [data-pil-capa-video], [data-pil-trocar-video]')) pilArquivo(e.target); if (PUBLIC && e.target.matches('[data-foto-perfil]')) fotoPerfilEnviar(e.target); if (PUBLIC && e.target.matches('[data-push-caderno]')) pushCaderno(e.target); if (PUBLIC && e.target.matches('[data-push-lembretes]')) pushLembretes(e.target); });
  root.addEventListener('input', e => { if (e.target.id !== 'acc-cpf') return; const d = e.target.value.replace(/\D/g, '').slice(0, 11); e.target.value = d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2'); });
  root.addEventListener('input', e => { if (isManagement() && admin.input && e.target.id === 'mem-q') admin.input(e.target); if (e.target.id === 'team-q') teamFilterList(e.target.value); if (PUBLIC && e.target.id === 'eq-q') eqFilterInput(e.target.value); if (PUBLIC && e.target.id === 'pil-q') pilBuscar(e.target.value); });
  root.addEventListener('change', e => { if (PUBLIC && e.target.name === 'eq-papel') { eqPapelToggle(e.target); return; } if (PUBLIC && e.target.id === 'eq-cell') { state.memCell = e.target.value; state.memMore = false; show('membros', false, false); return; } if (isManagement() && admin.input && e.target.id === 'mem-cell') { admin.input(e.target); return; } if (e.target.id === 'bday-visible') { state.hideBirthday = !e.target.checked; announce(e.target.checked ? 'Seu aniversário aparece para a igreja (teste).' : 'Seu aniversário não aparece mais para a igreja (teste).', 'success', false); } });
  document.addEventListener('nib-install-change', () => { if (state.view === 'inicio' && !isManagement()) show('inicio', false, false); });
  document.addEventListener('change', e => { if (PUBLIC && e.target.matches('[data-ver-como-select]')) setViewAs(e.target.value); });
  document.addEventListener('change', e => { if (e.target.matches('[data-ev-sem-horario]')) e.target.form.querySelectorAll('[data-ev-hora]').forEach(l => { l.hidden = e.target.checked; }); });
  document.getElementById('demo-context').addEventListener('change', changeContext);
  document.getElementById('demo-context-mobile').addEventListener('change', changeContext);
  document.getElementById('sidebar-toggle').addEventListener('click', event => {
    const collapsed = root.classList.toggle('nib-sidebar-collapsed');
    event.currentTarget.setAttribute('aria-expanded', String(!collapsed));
    event.currentTarget.setAttribute('aria-label', collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral');
    try { localStorage.setItem('nib-side', collapsed ? '1' : ''); } catch {}
    hideTip();
  });
  try { if (localStorage.getItem('nib-side') === '1') { root.classList.add('nib-sidebar-collapsed'); const t = document.getElementById('sidebar-toggle'); t.setAttribute('aria-expanded','false'); t.setAttribute('aria-label','Expandir menu lateral'); } } catch {}
  // Menu recolhido no computador: nome do item ao passar o mouse ou focar pelo teclado.
  const sideTip = document.createElement('div'); sideTip.className = 'nib-side-tip'; sideTip.setAttribute('aria-hidden','true'); root.appendChild(sideTip);
  function hideTip() { sideTip.classList.remove('is-on'); }
  function showTip(el) {
    if (!root.classList.contains('nib-sidebar-collapsed') || !matchMedia('(min-width:821px)').matches) return;
    const r = el.getBoundingClientRect(); sideTip.textContent = el.getAttribute('aria-label') || el.textContent.trim();
    sideTip.style.top = Math.round(r.top + r.height / 2) + 'px'; sideTip.style.left = Math.round(r.right + 12) + 'px'; sideTip.classList.add('is-on');
  }
  const aside = document.querySelector('.layout>aside');
  aside.addEventListener('mouseover', e => { const el = e.target.closest('nav a, .logout-btn, #sidebar-toggle'); if (el) showTip(el); else hideTip(); });
  aside.addEventListener('mouseleave', hideTip);
  aside.addEventListener('focusin', e => { const el = e.target.closest('nav a, .logout-btn, #sidebar-toggle'); if (el && root.classList.contains('keyboard-navigation')) showTip(el); });
  aside.addEventListener('focusout', hideTip); aside.addEventListener('scroll', hideTip, { passive: true }); aside.addEventListener('click', hideTip);
  root.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const openMenu = event.target.closest('details[open]');
    if (openMenu) { openMenu.open = false; openMenu.querySelector('summary').focus(); }
  });
  // Arrastar para a direita dentro de uma subtela volta para a anterior (celular e tablet).
  (() => {
    const back = document.getElementById('mobile-back'), ret = document.getElementById('mobile-return'), main = document.getElementById('main');
    const hint = document.createElement('div'); hint.className = 'swipe-back-hint'; hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5 M11 6l-6 6 6 6"/></svg>'; root.appendChild(hint);
    const LIMIT = 100; let sx = 0, sy = 0, dx = 0, on = false, decided = false, horiz = false;
    const blocked = el => { for (let n = el; n && n !== root; n = n.parentElement) { if (n.matches('input,textarea,select,.seg,.choice-seg,dialog,[data-no-swipe]')) return true; const ox = getComputedStyle(n).overflowX; if ((ox === 'auto' || ox === 'scroll') && n.scrollWidth > n.clientWidth + 2) return true; } return false; };
    const settle = () => { main.style.transition = 'transform .24s cubic-bezier(.2,.7,.2,1),opacity .24s'; main.style.transform = ''; main.style.opacity = ''; hint.style.transition = 'opacity .2s,transform .24s'; hint.style.opacity = ''; hint.style.transform = ''; hint.classList.remove('is-ready'); };
    root.addEventListener('touchstart', e => { on = false; if (e.touches.length !== 1 || ret.hidden || document.querySelector('dialog[open]') || blocked(e.target)) return; sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; on = true; decided = false; horiz = false; }, { passive: true });
    root.addEventListener('touchmove', e => {
      if (!on) return; const x = e.touches[0].clientX - sx, y = e.touches[0].clientY - sy;
      if (!decided) { if (Math.abs(x) < 10 && Math.abs(y) < 10) return; decided = true; horiz = x > 0 && Math.abs(x) > Math.abs(y) * 1.6; if (!horiz) { on = false; return; } main.style.transition = 'none'; hint.style.transition = 'none'; }
      dx = Math.max(0, x); const p = Math.min(dx / LIMIT, 1);
      main.style.transform = `translateX(${Math.round(Math.min(dx * .35, 44))}px)`; main.style.opacity = String(1 - p * .2);
      hint.style.opacity = String(p); hint.style.transform = `translate(${Math.round(Math.min(dx * .45, 52))}px,-50%) scale(${(.75 + p * .25).toFixed(2)})`; hint.classList.toggle('is-ready', p >= 1);
    }, { passive: true });
    root.addEventListener('touchend', () => { if (!on) return; on = false; if (!horiz) return; const go = dx >= LIMIT; settle(); if (go) back.click(); });
    root.addEventListener('touchcancel', () => { if (on && horiz) settle(); on = false; });
  })();
  root.addEventListener('pointerdown',()=>root.classList.remove('keyboard-navigation'));
  root.addEventListener('keydown',e=>{if(['Tab','Enter',' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) root.classList.add('keyboard-navigation');});
  const drawer = document.getElementById('mobile-drawer');
  const notices = document.getElementById('notices-dialog');
  notices.addEventListener('close', () => { if (!drawer.open) root.classList.remove('nib-dialog-open'); });
  notices.addEventListener('click', e => { if (e.target !== notices) return; const r = notices.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) notices.close(); });
  state.notifs = [];
  function giftConfirmed(e) {
    let h = state.history.find(x => x.txid === e.doc && x.status !== 'ok');
    if (h) h.status = 'ok'; else state.history.push({ day: e.day, type: e.type, amount: e.amount, status: 'ok', txid: e.doc });
    const what = e.type === 'Campanha' ? 'para a obra do templo' : e.type === 'Oferta' ? 'de oferta' : 'de dízimo';
    notify({ kind: 'ok', title: 'Contribuição confirmada', text: `A tesouraria confirmou ${money(e.amount)} ${what}, de ${e.day.slice(8, 10)}/${e.day.slice(5, 7)}. Obrigado pela sua generosidade!`, at: e.confirmedAt || '', view: 'historico', action: 'Ver minhas contribuições' });
  }
  function notify(n) { state.notifs.push({ ...n, id: 'nt' + (state.notifs.length + 1), seen: false }); refreshNotices(); }
  function unreadNotices() { return Math.max(0, admin.noticesCount() - (state.noticesSeen || 0)); }
  function unreadAll() { return unreadNotices() + state.notifs.filter(n => !n.seen).length + (birthdayNotifSeen() ? 0 : 1); }
  const birthdayNotifSeen = () => state.bdayNotifSeen || !admin.birthdays().some(b => b.today && b.name === state.member.full);
  function notifsHtml() {
    const items = state.notifs.slice().reverse().map(n => `<li class="notif is-${n.kind}"><strong>${escape(n.title)}</strong><p>${escape(n.text)}</p><small>${escape(n.at)}</small>${n.view ? `<button type="button" class="notif-go" data-view="${n.view}">${escape(n.action || 'Ver')}</button>` : ''}</li>`);
    if (admin.birthdays().some(b => b.today && b.name === state.member.full)) items.push(`<li class="notif is-bday"><strong>${birthdayFans.length} pessoas te deram parabéns</strong><p>${fansSummary().replace(/<[^>]+>/g, '')}.</p><button type="button" class="notif-go" data-fans-open="1">Ver quem deu parabéns</button></li>`);
    return items.length ? `<h3 class="notif-title">Para você</h3><ul class="notices-list notif-list">${items.join('')}</ul>` : '';
  }
