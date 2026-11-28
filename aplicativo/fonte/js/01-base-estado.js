'use strict';
(() => {
  const root = document.getElementById('nib-proposta');
  // Miniatura que não carregou some (sem onerror no HTML, que a política de segurança bloqueia).
  document.addEventListener('error', e => { const t = e.target; if (t && t.tagName === 'IMG' && t.hasAttribute('data-some-sem-imagem')) t.remove(); }, true);
  const content = document.getElementById('content');
  const feedback = document.getElementById('feedback');
  const srStatus = document.getElementById('sr-status') || feedback;
  // Estado fictício em memória: nunca importar participantes ou dados reais aqui.
  // Versão pública (endereço oficial): só informações reais da igreja, sem login e sem dados de exemplo.
  // Onde vale cada versão: no endereço oficial abre a pública (a demonstração fica em /app/?demo);
  // fora dele (link de apresentação) abre a demonstração, a menos que a página peça data-mode="publico".
  const official = /(^|\.)novaigrejabatista\.com\.br$/.test(location.hostname);
  const PUBLIC = document.documentElement.dataset.mode === 'publico' || (official && !/[?&]demo\b/.test(location.search));
  root.classList.toggle('is-public', PUBLIC);
  const publicViews = ['inicio','agenda','eventos','generosidade','celulas','caderno','informacoes','avisos','sugestoes'];
  const account = () => (PUBLIC && window.NibConta) ? NibConta.pessoa() : null;
  // Avatar: foto de perfil quando a pessoa tem uma; senão, a inicial do nome (pedido de Hilton, 13/11/2026).
  const avatarHtml = (nome, foto, cls = '') => `<span class="profile-avatar${foto ? ' has-foto' : ''}${cls ? ' ' + cls : ''}" aria-hidden="true">${foto ? `<img src="${escape(foto)}" alt="" loading="lazy" decoding="async">` : escape(String(nome || '?').charAt(0).toUpperCase())}</span>`;
  const allowedPublic = () => publicViews.concat(account() ? ['cadastro', 'presenca', 'pilulas'] : [], account() && NibConta.equipe() ? ['equipe', 'membros', 'membresia', 'cadastros', 'checkin'] : []);
  const publicNav = () => [['inicio', 'Início'], ['agenda', 'Agenda'], ['eventos', 'Eventos'], ['generosidade', 'Generosidade'], ['celulas', 'Células'], ['caderno', 'Caderno de oração'], ['avisos', 'Avisos da igreja'], ['informacoes', 'Informações'], ['sugestoes', 'Sugestões para o app']]
    .concat(account() ? [['cadastro', 'Meu cadastro'], ['presenca', 'Check-in'], ['pilulas', 'Pílulas de Sabedoria']] : [['entrar', 'Entrar ou criar cadastro']], account() && NibConta.equipe() ? [['equipe', 'Painel da equipe'], ['membros', 'Membros'], ['membresia', 'Membresia'], ['checkin', 'Check-in dos cultos']] : []);
  // Menu do app oficial em blocos, para não virar uma lista comprida sem respiro.
  const teamGroupName = () => ({ secretaria: 'Secretaria da igreja', pastoral: 'Liderança Pastoral', admin: 'Administração' })[account() && account().papel] || 'Equipe da igreja';
  const publicGroups = items => (g => account() && NibConta.equipe() ? [g[3]].concat(g.slice(0, 3), g.slice(4)) : g)([['Sua conta',['inicio','cadastro','entrar']],['Vida na igreja',['presenca','pilulas','agenda','eventos','celulas','caderno']],['Igreja',['avisos','generosidade','informacoes']],[teamGroupName(),['equipe','membros','membresia','checkin']],['Ajude a melhorar',['sugestoes']]])
    .map(([label,keys]) => [label, keys.map(k => items.find(([key]) => key === k)).filter(Boolean)]).filter(([,links]) => links.length);
  // Grupos de opções lado a lado (data-seg) no padrão do login: trilho cinza com pílula branca que desliza (pedido de Hilton, 06/11/2026).
  const segPrev = new Map();
  function segify(scope) {
    scope.querySelectorAll('[data-seg]').forEach(g => {
      const btns = [...g.querySelectorAll(':scope > button')]; if (!btns.length) return;
      const i = Math.max(0, btns.findIndex(b => b.classList.contains('is-active') || b.getAttribute('aria-pressed') === 'true'));
      const key = g.dataset.seg, from = segPrev.has(key) ? segPrev.get(key) : i; segPrev.set(key, i);
      g.classList.add('seg', 'seg-auto'); g.style.setProperty('--n', btns.length); g.style.setProperty('--i', i); g.style.setProperty('--from', from);
      if (!g.querySelector(':scope > .seg-pill')) { const pill = document.createElement('span'); pill.className = 'seg-pill' + (from !== i ? ' is-moving' : ''); pill.setAttribute('aria-hidden', 'true'); g.prepend(pill); }
      // Variante com rolagem (muitas opções, larguras diferentes, ex.: temas das Pílulas): a pílula branca segue o botão ativo.
      if (g.classList.contains('seg-rolar')) {
        const pill = g.querySelector(':scope > .seg-pill'), b = btns[i], antes = segPrev.get(key + ':px');
        const vai = () => { pill.style.setProperty('--x', b.offsetLeft + 'px'); pill.style.setProperty('--w', b.offsetWidth + 'px'); segPrev.set(key + ':px', [b.offsetLeft, b.offsetWidth, g.scrollLeft]); };
        pill.classList.remove('is-moving');
        if (antes) { g.scrollLeft = antes[2]; pill.style.transition = 'none'; pill.style.setProperty('--x', antes[0] + 'px'); pill.style.setProperty('--w', antes[1] + 'px'); void pill.offsetWidth; pill.style.transition = ''; }
        requestAnimationFrame(() => { vai(); const alvo = b.offsetLeft - (g.clientWidth - b.offsetWidth) / 2; g.scrollTo({ left: Math.max(0, alvo), behavior: antes ? 'smooth' : 'auto' }); });
      }
    });
  }
  const viewHistory = [];
  let notebookSequence = 0;
  const demoPrayers = () => [
    {id:'exemplo-1',author:'João Exemplo',name:'Pela nossa caminhada em família',reason:'Pedido fictício para demonstrar como a comunidade pode se unir em oração.',answered:false,supporters:0,supported:false,own:false},
    {id:'exemplo-3',author:'Marcos Exemplo',name:'Por um novo emprego',reason:'Pedido fictício: oração por uma porta de trabalho para a família.',answered:false,supporters:3,supported:false,own:false},
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
  const state = { member: { first: 'Jéssica', full: 'Jéssica Exemplo', email: 'jessica@example.com', gender: 'f' }, context: 'membro', view: 'inicio', request: null, presented: null, gift: 'Dízimo', calendarMonth: NibDaily.dayKey(new Date()).slice(0,7), calendarDay: NibDaily.dayKey(new Date()), prayers: demoPrayers(), history: demoHistory(), historyYear: NibDaily.dayKey(new Date()).slice(0,4) };
  const navigation = PUBLIC ? [['inicio', 'Início'], ['agenda', 'Agenda'], ['eventos', 'Eventos'], ['generosidade', 'Generosidade'], ['celulas', 'Células'], ['informacoes', 'Informações']] : [['inicio', 'Início'], ['cadastro', 'Meu cadastro'], ['eventos', 'Eventos'], ['celulas', 'Células'], ['generosidade', 'Generosidade'], ['historico', 'Minhas contribuições'], ['informacoes', 'Informações'], ['agenda', 'Agenda'], ['caderno', 'Caderno de oração']];
  const labels = { pilulas: ['PALAVRA PARA MEDITAR', 'Pílulas de Sabedoria', 'Vídeos curtos do pastor para meditar na Palavra durante a semana.'], avisos: ['MURAL DA IGREJA', 'Avisos da igreja', 'Comunicados da Secretaria e da Liderança Pastoral para toda a igreja.'], caderno: ['VIDA DE ORAÇÃO', 'Caderno de oração', 'Uma comunidade que cuida e ora em conjunto.'], agenda: ['VIDA NA IGREJA', 'Agenda da igreja', 'Cultos, encontros e próximos eventos em um só lugar.'], inicio: ['BOAS-VINDAS', 'Olá, Jéssica! Você está na plataforma Nib.', 'Acesse seu cadastro, encontre eventos, contribua e acompanhe a vida da igreja.'], cadastro: ['MINHAS INFORMAÇÕES', 'Meu cadastro', 'Consulte seus dados e encaminhe uma atualização à equipe.'], eventos: ['VIDA EM COMUNIDADE', 'Eventos e inscrições', 'Encontre os próximos encontros da igreja.'], celulas: ['CAMINHAR JUNTOS', 'Células', 'Acesse a plataforma de células adotada pela igreja.'], generosidade: ['CONTRIBUIR', 'Generosidade', 'Dízimos, ofertas e campanhas em um só lugar.'], historico: ['MEU HISTÓRICO', 'Minhas contribuições', 'Tudo o que você contribuiu, ano a ano. Só você vê.'], informacoes: ['FIQUE POR PERTO', 'Informações da igreja', 'Programação, endereço e canais da comunidade.'], gestao: ['ADMINISTRAÇÃO', 'Integração e membresia', 'Acompanhe o formulário, a reunião e a apresentação no culto.'], confirmar: ['MEMBRESIA', 'Registrar apresentação', 'O registro documenta a apresentação já realizada no culto.'] };
  if (PUBLIC) { const t = document.querySelector('#drawer-title + p'); if (t) t.textContent = 'Sua vida na igreja'; const sb = document.querySelector('.sidebar-bottom small'); if (sb) sb.textContent = 'Ariquemes, RO'; }
  if (PUBLIC) state.prayers = []; // na versão oficial, só pedidos reais vindos do servidor
  if (PUBLIC) Object.assign(labels, {
    presenca: ['PRESENÇA', 'Check-in', 'Registre sua presença na EBS e nos cultos, estando na igreja.'],
    inicio: ['BOAS-VINDAS', 'Que bom ter você na Nib!', 'Cultos, eventos, células e contribuições da Nova Igreja Batista em um só lugar.'],
    celulas: ['CAMINHAR JUNTOS', 'Células', 'Encontre uma célula perto de você e fale com o líder pelo WhatsApp.'],
    cadastro: ['MINHAS INFORMAÇÕES', 'Meu cadastro', 'Seus dados na igreja. Só você e a equipe da igreja veem.'],
    cadastros: ['EQUIPE DA IGREJA', 'Cadastros', 'Quem criou conta no app. Confirme quem é membro da igreja.'],
    eventos: ['VIDA EM COMUNIDADE', 'Eventos', 'Os próximos encontros da igreja e as inscrições abertas.'],
    informacoes: ['FIQUE POR PERTO', 'Informações da igreja', 'Horários dos cultos, endereço, liderança e canais oficiais.'],
    equipe: ['EQUIPE DA IGREJA', 'Painel da equipe', 'Números reais do app, atalhos e o que precisa de atenção.'],
    membresia: ['EQUIPE DA IGREJA', 'Membresia', 'Caminho até a membresia: formulário, reunião e apresentação no culto.'],
    membros: ['EQUIPE DA IGREJA', 'Membros', 'Lista completa, ficha de cada pessoa e exportação.'],
    checkin: ['EQUIPE DA IGREJA', 'Check-in dos cultos', 'QR Code do telão, local da igreja e quem registrou presença.'],
    sugestoes: ['SUA OPINIÃO', 'Sugestões para o app', 'Conte o que podemos melhorar no app: ideias, problemas ou o que você gostou.']
  });
  // Concordância com o perfil: g('obrigado', 'obrigada').
  const g = (male, female) => state.member.gender === 'm' ? male : female;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const properName = n => String(n).trim().split(/\s+/).map((w, i) => { w = w.toLocaleLowerCase('pt-BR'); return i > 0 && ['da','das','de','do','dos','e'].includes(w) ? w : w.split('-').map(x => x.charAt(0).toLocaleUpperCase('pt-BR') + x.slice(1)).join('-'); }).join(' ');
  const fmtPhone = d => { d = String(d || '').replace(/\D/g, ''); return d.length === 11 ? `(${d.slice(0,2)}) ${d.slice(2,3)} ${d.slice(3,7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}` : d; };
  const fmtCpf = c => { const d = String(c || '').replace(/\D/g, ''); return d.length === 11 ? `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}` : d; };
  const cpfOk = c => { if (!/^\d{11}$/.test(c) || /^(\d)\1{10}$/.test(c)) return false; for (let t = 9; t < 11; t++) { let s = 0; for (let i = 0; i < t; i++) s += +c[i] * (t + 1 - i); if (+c[t] !== ((10 * s) % 11) % 10) return false; } return true; };
  const fmtDay = s => s ? String(s).slice(0,10).split('-').reverse().join('/') : '';
  const arrow = '<svg class="button-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14 M13 6l6 6-6 6"/></svg>';
  const backArrow = '<svg class="back-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5 M11 6l-6 6 6 6"/></svg>';
  const button = (text, view, primary = false) => { const back = !primary && /^Voltar/.test(text); return `<button type="button" class="button ${primary ? 'action primary' : back ? 'button-go button-back' : 'button-go'}" data-view="${view}">${back ? backArrow : ''}<span>${text}</span>${primary || back ? '' : arrow}</button>`; };
  // Ícones reaproveitados da função icon() do painel; sem ícones nas ações.
  // Ícones: conjunto único em icons.js (NibIcons).
  const iconAlias = { presenca: 'recepcao', entrar: 'cadastro', equipe: 'relatorios', cadastros: 'solicitacoes', avisos: 'comunicados', checkin: 'recepcao' };
  const navIcon = key => NibIcons.svg(iconAlias[key] || key);
  const events = [
    { name: 'Mulheres Virtuosas', image: 'assets/mulheres.webp', date: '30/10/2026', active: false },
    { name: 'NXT CAMP', image: 'assets/nxt.webp', date: '21/11/2026', active: true },
    { name: 'Jornada DNA', image: 'assets/jornada.webp', date: '25/10/2026', active: false }
  ];
  const demoEventCards = (compact = false) => `<div class="cards ${compact ? 'home-events' : ''}">${[...events].filter(e => !compact || e.active).sort((a,b) => Number(b.active) - Number(a.active)).map(e => `<article class="event ${e.name === 'Mulheres Virtuosas' ? 'event-mulheres-virtuosas' : ''} ${e.active ? '' : 'event-ended'}"><div class="event-cover"><img src="${e.image}" alt="${e.name}" width="800" height="400"></div><div class="event-content"><div class="event-top"><span class="tag ${e.active ? 'status-active' : 'status-ended'}">${e.active ? 'Ativo' : 'Encerrado'}</span><time class="event-date">${e.date}</time></div><${compact ? 'h3' : 'h2'}>${e.name}</${compact ? 'h3' : 'h2'}><p>${e.active ? 'Conheça o encontro e as informações do evento.' : 'Evento realizado. Consulte as informações.'}</p><button type="button" class="button primary" aria-label="Ver informações: ${e.name}" data-message="${e.name}: catálogo demonstrativo. A integração com as inscrições ainda será conectada; nenhum cadastro ou pagamento é realizado aqui.">Ver informações</button></div></article>`).join('')}</div>`;
