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
  const button = (text, view, primary = false) => `<button type="button" class="${primary ? 'action' : ''}" data-view="${view}">${text}</button>`;
  const isManagement = () => ['secretaria', 'pastoral'].includes(state.context);
  function announce(message) { feedback.textContent = message; }
  function renderNavigation() {
    const items = isManagement() ? [['gestao', 'Membresia'], ['informacoes', 'Informações']] : navigation;
    const nav = document.getElementById('navigation');
    const context = isManagement() ? 'gestao' : 'membro';
    if (nav.dataset.context !== context) {
      nav.innerHTML = items.map(([key, label]) => `<button type="button" data-view="${key}">${label}</button>`).join('');
      nav.dataset.context = context;
    }
    nav.querySelectorAll('button').forEach(item => {
      const active = state.view === item.dataset.view || (item.dataset.view === 'gestao' && state.view === 'confirmar');
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  }
  function show(view, focus = true) {
    if (['gestao', 'confirmar'].includes(view) && !isManagement()) view = 'inicio';
    state.view = labels[view] ? view : 'inicio';
    const [eyebrow, title, description] = labels[state.view];
    document.getElementById('eyebrow').textContent = eyebrow;
    document.getElementById('heading').textContent = title;
    document.getElementById('description').textContent = description;
    feedback.textContent = '';
    const pages = {
      inicio: () => `<div class="grid">${button('Ver eventos', 'eventos')}${button('Contribuir', 'generosidade')}${button('Meu cadastro', 'cadastro')}${button('Acessar células', 'celulas')}</div><section class="feature"><span class="label">VIDA EM COMUNIDADE</span><h2>Uma igreja para caminhar junto.</h2><p>Acompanhe a programação e os avisos da Nova Igreja Batista.</p>${button('Ver informações', 'informacoes')}</section>`,
      cadastro: () => `<section class="box"><span class="tag">Membro · exemplo</span><h2>Ana Exemplo</h2><dl class="profile"><dt>E-mail</dt><dd>ana@example.com</dd><dt>Telefone</dt><dd>Não informado</dd><dt>Apresentação no culto</dt><dd>Apresentação registrada · exemplo</dd></dl></section><section class="box"><h2>Solicitar atualização</h2><p>Os campos são provisórios até conferirmos o formulário da igreja.</p><form id="profile-form"><label for="contact-email">E-mail de contato</label><input id="contact-email" name="email" type="email" autocomplete="off" placeholder="exemplo@example.com" maxlength="160" required><label for="contact-note">O que precisa ser atualizado?</label><textarea id="contact-note" name="note" maxlength="500" required></textarea><button class="action" type="submit">Enviar solicitação de teste</button></form><p class="note">A solicitação fica somente nesta sessão e não é enviada à Secretaria.</p></section>`,
      eventos: () => `<section class="box"><span class="label">INTEGRAÇÃO EM PREPARAÇÃO</span><h2>Eventos da igreja</h2><p>O catálogo será conectado ao sistema de eventos existente.</p><button type="button" data-message="Nesta versão, as inscrições reais não estão conectadas. Nenhum cadastro será enviado.">Conhecer eventos</button></section><section class="box"><h2>Minhas inscrições</h2><p>Nenhuma inscrição vinculada nesta demonstração.</p><p class="note">Inscrições anteriores não serão vinculadas automaticamente por nome ou telefone.</p></section>`,
      celulas: () => `<section class="box"><span class="label">PLATAFORMA EXTERNA</span><h2>Encontre sua comunidade</h2><p>A igreja utilizará uma plataforma de células pronta. O endereço de acesso será configurado após a definição da integração.</p><button type="button" disabled>Acesso em preparação</button><p class="note">A entrada sem um novo login depende do serviço externo.</p></section>`,
      generosidade: () => `<div class="gift-options" role="group" aria-label="Finalidade da contribuição">${['Dízimo', 'Oferta', 'Campanha'].map(name => `<button type="button" data-gift="${name}" aria-pressed="${state.gift === name}">${name === 'Campanha' ? 'Campanhas' : name + 's'}</button>`).join('')}</div><section class="box"><h2>${state.gift === 'Campanha' ? 'Campanhas da igreja' : state.gift}</h2>${state.gift === 'Campanha' ? '<p>Nenhuma campanha cadastrada nesta versão de teste.</p>' : '<form id="gift-form"><label for="gift-value">Valor da contribuição (R$)</label><input id="gift-value" name="amount" type="number" inputmode="decimal" min="0.01" max="1000000" step="0.01" placeholder="0,00" required><button class="action" type="submit">Simular próximo passo</button></form>'}<p class="note">Sem Pix, cobrança ou movimentação financeira. Pagamento e confirmação de recebimento ainda serão definidos.</p></section>`,
      informacoes: () => `<section class="box"><h2>Programação e avisos</h2><p>Os horários e conteúdos oficiais serão incluídos pela igreja.</p></section><section class="box"><h2>Endereço e contato</h2><p>Os canais de atendimento serão configurados nesta área.</p></section>`,
      gestao: () => `<section class="box"><span class="label">PESSOA FICTÍCIA · NOVA INTEGRAÇÃO</span><h2>João Exemplo</h2><ul><li>Formulário de membros: registrado</li><li>Reunião de integração: registrada</li><li>Apresentação no culto: ${state.presented ? escape(state.presented.dateLabel) : 'a registrar'}</li></ul>${state.presented ? '<span class="tag">Membro · exemplo</span><p>Registro efetuado por ' + escape(state.presented.actor) + '.</p><p class="note">Registrado em ' + escape(state.presented.registeredAt) + ' · somente nesta sessão.</p>' : button('Revisar apresentação', 'confirmar', true)}</section><section class="box"><h2>Solicitações de atualização</h2>${state.request ? '<p>Solicitação demonstrativa de Ana Exemplo.</p><dl class="profile"><dt>Contato</dt><dd>' + escape(state.request.email) + '</dd><dt>Atualização solicitada</dt><dd>' + escape(state.request.note) + '</dd></dl>' : '<p>Nenhuma solicitação nesta sessão.</p>'}</section><p class="note">Secretaria da igreja e Liderança Pastoral podem confirmar o reconhecimento. Este seletor de demonstração não é autenticação ou controle de permissões.</p>`,
      confirmar: () => `<section class="box"><h2>João Exemplo</h2><p>Formulário e reunião de integração já registrados neste exemplo.</p><form id="membership-form"><label for="presented-date">Data da apresentação no culto</label><input id="presented-date" name="date" type="date" required><label class="check"><input name="confirm" type="checkbox" required><span>Confirmo que a pessoa foi apresentada à igreja no culto.</span></label><button type="submit" class="action">Confirmar registro de teste</button></form><p class="note">O reconhecimento decorre da apresentação. Esta confirmação registra o fato e seu responsável.</p>${button('Voltar à gestão', 'gestao')}</section>`
    };
    content.innerHTML = pages[state.view]();
    renderNavigation();
    const dateField = document.getElementById('presented-date');
    if (dateField) dateField.max = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Manaus', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    if (focus) document.getElementById('heading').focus();
  }
  root.addEventListener('click', event => {
    const action = event.target.closest('button');
    if (!action || action.disabled) return;
    if (action.dataset.view) show(action.dataset.view);
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
  });
  document.getElementById('demo-context').value = 'membro';
  show('inicio', false);
})();
