'use strict';
(() => {
  const root = document.getElementById('nib-proposta');
  const content = document.getElementById('content');
  const feedback = document.getElementById('feedback');
  // Estado fictício em memória: nunca importar participantes ou dados reais aqui.
  const viewHistory = [];
  const state = { context: 'membro', view: 'inicio', request: null, presented: null, gift: 'Dízimo' };
  const navigation = [['inicio', 'Início'], ['cadastro', 'Meu cadastro'], ['eventos', 'Eventos'], ['celulas', 'Células'], ['generosidade', 'Generosidade'], ['informacoes', 'Informações']];
  const labels = { inicio: ['SEJA BEM-VINDA', 'Olá, Ana. Como você quer participar hoje?', 'Acesse seu cadastro, encontre eventos, contribua e acompanhe a vida da igreja.'], cadastro: ['MINHAS INFORMAÇÕES', 'Meu cadastro', 'Consulte seus dados e encaminhe uma atualização à equipe.'], eventos: ['VIDA EM COMUNIDADE', 'Eventos e inscrições', 'Encontre os próximos encontros da igreja.'], celulas: ['CAMINHAR JUNTOS', 'Células', 'Acesse a plataforma de células adotada pela igreja.'], generosidade: ['CONTRIBUIR', 'Generosidade', 'Dízimos, ofertas e campanhas em um só lugar.'], informacoes: ['FIQUE POR PERTO', 'Informações da igreja', 'Programação, endereço e canais da comunidade.'], gestao: ['ADMINISTRAÇÃO', 'Integração e membresia', 'Acompanhe o formulário, a reunião e a apresentação no culto.'], confirmar: ['MEMBRESIA', 'Registrar apresentação', 'O registro documenta a apresentação já realizada no culto.'] };
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const button = (text, view, primary = false) => `<button type="button" class="button ${primary ? 'action primary' : ''}" data-view="${view}">${text}</button>`;
  // Ícones reaproveitados da função icon() do painel; sem ícones nas ações.
  const iconPaths = { grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z', calendar: 'M4 5h16v16H4z M8 3v4 M16 3v4 M4 11h16', receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6', archive: 'M3 4h18v5H3z M5 9v12h14V9 M10 13h4' };
  const navIcon = key => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${iconPaths[({ inicio: 'grid', cadastro: 'receipt', eventos: 'calendar', celulas: 'grid', generosidade: 'receipt', informacoes: 'archive', gestao: 'grid' })[key]]}"/></svg>`;
  const events = [
    { name: 'Mulheres Virtuosas', image: 'assets/mulheres.webp', date: '30/10/2026', active: false },
    { name: 'NXT CAMP', image: 'assets/nxt.png', date: '21/11/2026', active: true },
    { name: 'Jornada DNA', image: 'assets/jornada.webp', date: '25/10/2026', active: false }
  ];
  const eventCards = (compact = false) => `<div class="cards ${compact ? 'home-events' : ''}">${[...events].sort((a,b) => Number(b.active) - Number(a.active)).map(e => `<article class="event ${e.name === 'Mulheres Virtuosas' ? 'event-mulheres-virtuosas' : ''} ${e.active ? '' : 'event-ended'}"><div class="event-cover"><img src="${e.image}" alt="${e.name}" width="800" height="400"></div><div class="event-content"><div class="event-top"><span class="tag ${e.active ? 'status-active' : 'status-ended'}">${e.active ? 'Ativo' : 'Encerrado'}</span><time class="event-date">${e.date}</time></div><${compact ? 'h3' : 'h2'}>${e.name}</${compact ? 'h3' : 'h2'}><p>${e.active ? 'Conheça o encontro e as informações do evento.' : 'Evento realizado. Consulte as informações.'}</p><button type="button" class="button primary" aria-label="Ver informações: ${e.name}" data-message="${e.name}: catálogo demonstrativo. A integração com as inscrições ainda será conectada; nenhum cadastro ou pagamento é realizado aqui.">Ver informações</button></div></article>`).join('')}</div>`;
  const isManagement = () => ['secretaria', 'pastoral'].includes(state.context);
  const barPaths = {
    inicio: 'M3 11l9-8 9 8 M5 10v10h5v-6h4v6h5V10',
    eventos: iconPaths.calendar,
    generosidade: 'M12 20s-8-4.7-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.3-8 10-8 10z',
    celulas: iconPaths.grid,
    cadastro: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6',
    mais: 'M4 7h16 M4 12h16 M4 17h16'
  };
  const barIcon = key => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${barPaths[key]}"/></svg>`;
  function renderBar() {
    const bar = document.getElementById('bottom-nav');
    bar.hidden = isManagement();
    if (bar.hidden) return;
    if (!bar.children.length) bar.innerHTML = [['inicio','Início'],['eventos','Eventos'],['generosidade','Contribuir'],['cadastro','Cadastro'],['celulas','Células']].map(([view,label]) => `<a href="#${view}" data-view="${view}" class="${view === 'generosidade' ? 'bar-main' : ''}"><span class="bar-icon">${barIcon(view)}</span><span>${label}</span></a>`).join('');
    bar.querySelectorAll('a').forEach(a => {
      const active = a.dataset.view === state.view;
      if (active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
  }
  function announce(message) { feedback.textContent = message; feedback.scrollIntoView({block:"nearest",behavior:"instant"}); }
  function renderNavigation() {
    const items = isManagement() ? [['gestao', 'Membresia'], ['informacoes', 'Informações']] : navigation;
    const context = isManagement() ? 'gestao' : 'membro';
    for (const nav of [document.getElementById('navigation'), document.getElementById('mobile-navigation')]) {
      if (nav.dataset.context !== context) {
        if (nav.id === 'navigation') nav.innerHTML = items.map(([key,label]) => `<a href="#${key}" data-view="${key}" aria-label="${label}">${navIcon(key)}<span>${label}</span></a>`).join('');
        else {
          const descriptions = {inicio:'Seu ponto de partida',cadastro:'Dados e atualizações',eventos:'Encontros e inscrições',generosidade:'Dízimos, ofertas e campanhas',celulas:'Acesso à plataforma',informacoes:'Programação e avisos',gestao:'Integração e apresentações'};
          const groups = isManagement() ? [['Gestão',items]] : [['Seu acesso',items.filter(([key])=>['inicio','cadastro'].includes(key))],['Vida na igreja',items.filter(([key])=>['eventos','generosidade','celulas','informacoes'].includes(key))]];
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
    renderBar();
  }
  function show(view, focus = true, record = true) {
    if (['gestao', 'confirmar'].includes(view) && !isManagement()) view = 'inicio';
    if (record && focus && view !== state.view) viewHistory.push(state.view);
    state.view = labels[view] ? view : 'inicio';
    root.dataset.view = state.view;
    document.getElementById('mobile-return').hidden = state.view === 'inicio' || (isManagement() && state.view === 'gestao');
    const [eyebrow, title, description] = labels[state.view];
    document.getElementById('eyebrow').textContent = eyebrow;
    document.getElementById('heading').textContent = title;
    document.getElementById('description').textContent = description;
    feedback.textContent = '';
    const pages = {
      inicio: () => `<section aria-labelledby="quick-title"><div class="section-heading"><h2 id="quick-title">O que você precisa está aqui</h2></div><div class="quick-actions">${[
        ['cadastro', 'Meu cadastro', 'Consulte seus dados e solicite uma atualização.'],
        ['eventos', 'Eventos e inscrições', 'Veja os encontros e acompanhe suas inscrições.'],
        ['generosidade', 'Dízimos e ofertas', 'Encontre as opções para contribuir e as campanhas.'],
        ['celulas', 'Células', 'Saiba como acessar a plataforma de células.'],
        ['informacoes', 'Programação e avisos', 'Consulte as informações e os canais da igreja.']
      ].map(([view, title, text]) => `<button type="button" class="quick-action" data-view="${view}"><strong>${title}</strong><span>${text}</span></button>`).join('')}</div></section><section aria-labelledby="home-events-title"><div class="section-heading"><h2 id="home-events-title">Eventos da igreja</h2>${button('Ver todos', 'eventos')}</div>${eventCards(true)}</section>`,
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
    const dateField = document.getElementById('presented-date');
    if (dateField) dateField.max = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Manaus', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    if (focus) { document.getElementById('heading').focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); }
  }
  root.addEventListener('click', event => {
    const action = event.target.closest('button,a[data-view],a[data-back]');
    if (!action || action.disabled) return;
    if (action.id === 'header-menu') { document.querySelector('.test-options').open = false; drawer.showModal(); root.classList.add('nib-dialog-open'); action.setAttribute('aria-expanded','true'); (drawer.querySelector('a[aria-current=page]') || drawer.querySelector('button')).focus(); return; }
    if (action.id === 'drawer-close') { closeDrawer(); return; }
    if (action.id === 'mobile-back') { event.preventDefault(); show(viewHistory.pop() || (isManagement() ? 'gestao' : 'inicio'), true, false); return; }
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
      if (!note) return announce('Preencha ao menos um dado para atualização ou descreva outra alteração.');
      state.request = { email, note };
      announce('Solicitação fictícia registrada nesta sessão. Você pode consultá-la na experiência de gestão.');
      form.reset();
    }
    if (form.id === 'gift-form') announce('Simulação concluída. Nenhuma cobrança foi criada ou contribuição recebida.');
    if (form.id === 'membership-form' && isManagement()) {
      const raw = String(values.get('date'));
      const date = new Date(raw + 'T12:00:00-04:00');
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Manaus', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      if (Number.isNaN(date.getTime()) || raw > today) return announce('Informe a data de uma apresentação já realizada.');
      state.presented = { dateLabel: new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Manaus' }).format(date), actor: state.context === 'secretaria' ? 'Secretaria da igreja (teste)' : 'Liderança Pastoral (teste)', registeredAt: new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Manaus', dateStyle: 'short', timeStyle: 'short' }).format(new Date()) };
      show('gestao');
      announce('Apresentação registrada na demonstração. Nenhum membro real foi alterado.');
    }
  });
  function changeContext(event) {
    viewHistory.length = 0;
    state.context = event.target.value;
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
  const drawer = document.getElementById('mobile-drawer');
  function closeDrawer() { if (drawer.open) drawer.close(); root.classList.remove('nib-dialog-open'); document.getElementById('header-menu').setAttribute('aria-expanded','false'); }
  drawer.addEventListener('close', () => { root.classList.remove('nib-dialog-open'); document.getElementById('header-menu').setAttribute('aria-expanded','false'); });
  drawer.addEventListener('click', e => { if (e.target === drawer) { const r = drawer.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDrawer(); } });
  matchMedia('(min-width:821px)').addEventListener('change', e => { if (e.matches) closeDrawer(); });
  document.getElementById('demo-context').value = 'membro';
  show('inicio', false);
})();
