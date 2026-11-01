'use strict';
(() => {
  const root = document.getElementById('nib-proposta');
  const content = document.getElementById('content');
  const feedback = document.getElementById('feedback');
  // Estado fictício em memória: nunca importar participantes ou dados reais aqui.
  const state = { context: 'membro', view: 'inicio', request: null, presented: null, gift: 'Dízimo' };
  const navigation = [['inicio', 'Início'], ['cadastro', 'Meu cadastro'], ['eventos', 'Eventos'], ['celulas', 'Células'], ['generosidade', 'Generosidade'], ['informacoes', 'Informações']];
  const labels = { inicio: ['SEJA BEM-VINDA', 'Sua igreja, perto de você.', 'Seu cadastro, encontros e próximos passos na comunidade.'], cadastro: ['MINHAS INFORMAÇÕES', 'Meu cadastro', 'Consulte seus dados e encaminhe uma atualização à equipe.'], eventos: ['VIDA EM COMUNIDADE', 'Eventos e inscrições', 'Encontre os próximos encontros da igreja.'], celulas: ['CAMINHAR JUNTOS', 'Células', 'Acesse a plataforma de células adotada pela igreja.'], generosidade: ['CONTRIBUIR', 'Generosidade', 'Dízimos, ofertas e campanhas em um só lugar.'], informacoes: ['FIQUE POR PERTO', 'Informações da igreja', 'Programação, endereço e canais da comunidade.'], gestao: ['ADMINISTRAÇÃO', 'Integração e membresia', 'Acompanhe o formulário, a reunião e a apresentação no culto.'], confirmar: ['MEMBRESIA', 'Registrar apresentação', 'O registro documenta a apresentação já realizada no culto.'] };
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
  const eventCards = () => `<div class="cards">${events.map(e => `<article class="event"><div class="event-cover"><img src="${e.image}" alt="${e.name}" width="800" height="400"></div><div class="event-content"><div class="event-top"><span class="tag ${e.active ? 'status-active' : 'status-ended'}">${e.active ? 'Ativo' : 'Encerrado'}</span><time class="event-date">${e.date}</time></div><h2>${e.name}</h2><p>${e.active ? 'Conheça o encontro e as informações do evento.' : 'Evento realizado. Consulte as informações.'}</p><button type="button" class="button primary" data-message="${e.name}: catálogo demonstrativo. A integração com as inscrições ainda será conectada; nenhum cadastro ou pagamento é realizado aqui.">Ver informações</button></div></article>`).join('')}</div>`;
  const isManagement = () => ['secretaria', 'pastoral'].includes(state.context);
  function announce(message) { feedback.textContent = message; }
  function renderNavigation() {
    const items = isManagement() ? [['gestao', 'Membresia'], ['informacoes', 'Informações']] : navigation;
    const context = isManagement() ? 'gestao' : 'membro';
    for (const nav of [document.getElementById('navigation'), document.getElementById('mobile-navigation')]) {
      if (nav.dataset.context !== context) {
        nav.innerHTML = items.map(([key, label]) => `<a href="#${key}" data-view="${key}" aria-label="${label}">${navIcon(key)}<span>${label}</span></a>`).join('');
        nav.dataset.context = context;
      }
      nav.querySelectorAll('a').forEach(item => {
      const active = state.view === item.dataset.view || (item.dataset.view === 'gestao' && state.view === 'confirmar');
      item.classList.toggle('selected', active);
      if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
      });
    }
    document.getElementById('mobile-title').textContent = items.find(([key]) => key === state.view)?.[1] || 'Membresia';
    document.getElementById('member-shortcuts').hidden = isManagement();
  }
  function show(view, focus = true) {
    if (['gestao', 'confirmar'].includes(view) && !isManagement()) view = 'inicio';
    state.view = labels[view] ? view : 'inicio';
    root.dataset.view = state.view;
    const [eyebrow, title, description] = labels[state.view];
    document.getElementById('eyebrow').textContent = eyebrow;
    document.getElementById('heading').textContent = title;
    document.getElementById('description').textContent = description;
    feedback.textContent = '';
    const pages = {
      inicio: () => `<div class="member-strip"><div><strong>Ana Exemplo</strong><span>Cadastro demonstrativo</span></div><div><strong>Membro</strong><span>Vínculo com a igreja</span></div><div><strong>Minha igreja</strong><span>Seu espaço na comunidade</span></div></div><div class="catalog-toolbar">${button('Ver meu cadastro', 'cadastro', true)}${button('Contribuir', 'generosidade')}</div><div class="section-heading"><h2>Eventos da igreja</h2><span>Encontros e programação</span></div>${eventCards()}`,
      cadastro: () => `<section class="box"><span class="tag">Membro · exemplo</span><h2>Ana Exemplo</h2><dl class="profile"><dt>E-mail</dt><dd>ana@example.com</dd><dt>Telefone</dt><dd>Não informado</dd><dt>Apresentação no culto</dt><dd>Apresentação registrada · exemplo</dd></dl></section><section class="box"><h2>Solicitar atualização</h2><p>Os campos são provisórios até conferirmos o formulário da igreja.</p><form id="profile-form"><label for="contact-email">E-mail de contato</label><input id="contact-email" name="email" type="email" autocomplete="off" placeholder="exemplo@example.com" maxlength="160" required><label for="contact-note">O que precisa ser atualizado?</label><textarea id="contact-note" name="note" maxlength="500" required></textarea><button class="action" type="submit">Enviar solicitação de teste</button></form><p class="note">A solicitação fica somente nesta sessão e não é enviada à Secretaria.</p></section>`,
      eventos: () => `${eventCards()}<section class="box event-follow-up"><h2>Minhas inscrições</h2><p>Nenhuma inscrição vinculada nesta demonstração.</p><p class="note">Inscrições anteriores não serão vinculadas automaticamente por nome ou telefone.</p></section>`,
      celulas: () => `<section class="box"><span class="label">PLATAFORMA EXTERNA</span><h2>Encontre sua comunidade</h2><p>A igreja utilizará uma plataforma de células pronta. O endereço de acesso será configurado após a definição da integração.</p><button type="button" disabled>Acesso em preparação</button><p class="note">A entrada sem um novo login depende do serviço externo.</p></section>`,
      generosidade: () => `<div class="gift-options" role="group" aria-label="Finalidade da contribuição">${['Dízimo', 'Oferta', 'Campanha'].map(name => `<button type="button" data-gift="${name}" aria-pressed="${state.gift === name}">${name === 'Campanha' ? 'Campanhas' : name + 's'}</button>`).join('')}</div><section class="box"><h2>${state.gift === 'Campanha' ? 'Campanhas da igreja' : state.gift}</h2>${state.gift === 'Campanha' ? '<p>Nenhuma campanha cadastrada nesta versão de teste.</p>' : '<form id="gift-form"><label for="gift-value">Valor da contribuição (R$)</label><input id="gift-value" name="amount" type="number" inputmode="decimal" min="0.01" max="1000000" step="0.01" placeholder="0,00" required><button class="action" type="submit">Simular próximo passo</button></form>'}<p class="note">Sem Pix, cobrança ou movimentação financeira. Pagamento e confirmação de recebimento ainda serão definidos.</p></section>`,
      informacoes: () => `<section class="box"><h2>Programação e avisos</h2><p>Os horários e conteúdos oficiais serão incluídos pela igreja.</p></section><section class="box"><h2>Endereço e contato</h2><p>Os canais de atendimento serão configurados nesta área.</p></section>`,
      gestao: () => `<section class="box"><span class="label">PESSOA FICTÍCIA · NOVA INTEGRAÇÃO</span><h2>João Exemplo</h2><ul><li>Formulário de membros: registrado</li><li>Reunião de integração: registrada</li><li>Apresentação no culto: ${state.presented ? escape(state.presented.dateLabel) : 'a registrar'}</li></ul>${state.presented ? '<span class="tag">Membro · exemplo</span><p>Registro efetuado por ' + escape(state.presented.actor) + '.</p><p class="note">Registrado em ' + escape(state.presented.registeredAt) + ' · somente nesta sessão.</p>' : button('Revisar apresentação', 'confirmar', true)}</section><section class="box"><h2>Solicitações de atualização</h2>${state.request ? '<p>Solicitação demonstrativa de Ana Exemplo.</p><dl class="profile"><dt>Contato</dt><dd>' + escape(state.request.email) + '</dd><dt>Atualização solicitada</dt><dd>' + escape(state.request.note) + '</dd></dl>' : '<p>Nenhuma solicitação nesta sessão.</p>'}</section><p class="note">Secretaria da igreja e Liderança Pastoral podem confirmar o reconhecimento. Este seletor de demonstração não é autenticação ou controle de permissões.</p>`,
      confirmar: () => `<section class="box"><h2>João Exemplo</h2><p>Formulário e reunião de integração já registrados neste exemplo.</p><form id="membership-form"><label for="presented-date">Data da apresentação no culto</label><input id="presented-date" name="date" type="date" required><label class="check"><input name="confirm" type="checkbox" required><span>Confirmo que a pessoa foi apresentada à igreja no culto.</span></label><button type="submit" class="action">Confirmar registro de teste</button></form><p class="note">O reconhecimento decorre da apresentação. Esta confirmação registra o fato e seu responsável.</p>${button('Voltar à gestão', 'gestao')}</section>`
    };
    content.innerHTML = pages[state.view]();
    renderNavigation();
    document.getElementById('mobile-menu').open = false;
    const dateField = document.getElementById('presented-date');
    if (dateField) dateField.max = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Manaus', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    if (focus) document.getElementById('heading').focus();
  }
  root.addEventListener('click', event => {
    const action = event.target.closest('button,a[data-view]');
    if (!action || action.disabled) return;
    if (action.dataset.view) { event.preventDefault(); show(action.dataset.view); }
    if (action.dataset.message) announce(action.dataset.message);
    if (action.dataset.gift) { state.gift = action.dataset.gift; show('generosidade'); }
  });
  root.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    if (form.id === 'profile-form') {
      const email = String(values.get('email')).trim();
      const note = String(values.get('note')).trim();
      if (!note) return announce('Descreva a atualização solicitada.');
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
  document.getElementById('demo-context').addEventListener('change', event => {
    state.context = event.target.value;
    document.getElementById('account').textContent = state.context === 'membro' ? 'Ana Exemplo · Membro' : (state.context === 'secretaria' ? 'Secretaria da igreja · Teste' : 'Liderança Pastoral · Teste');
    show(isManagement() ? 'gestao' : 'inicio');
    document.querySelector('.test-options').open = false;
  });
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
  document.getElementById('demo-context').value = 'membro';
  show('inicio', false);
})();
