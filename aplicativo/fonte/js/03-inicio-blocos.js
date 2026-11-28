  // Dados da obra: mesma fonte do site (novaigrejabatista.com.br/dados/obra.json). Sem conexão, ficam os últimos valores conhecidos.
  const obra = { percentual: 30, lugares: '1.500', entrega: '2028' };
  function syncCampaignBar() { const bar = content.querySelector('.campaign-bar span'); if (bar) bar.style.setProperty('width', obra.percentual + '%'); }
  function loadObra() {
    if (!window.fetch) return;
    fetch('https://novaigrejabatista.com.br/dados/obra.json', { cache: 'no-cache', credentials: 'omit' }).then(r => r.ok ? r.json() : null).then(d => {
      const raw = d && typeof d === 'object' ? d.percentual : undefined;
      if (!(typeof raw === 'number' || (typeof raw === 'string' && raw.trim() !== ''))) return;
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0 || value > 100) return;
      obra.percentual = Math.round(value);
      if (d.lugares) obra.lugares = String(d.lugares).slice(0, 12);
      if (d.entrega) obra.entrega = String(d.entrega).slice(0, 12);
      if (state.view === 'generosidade') { const pct = content.querySelector('[data-obra-pct]'); if (pct) pct.textContent = obra.percentual + '% concluída'; syncCampaignBar(); }
    }).catch(() => {});
  }
  const giftLabel = () => state.gift === 'Campanha' ? 'Obra do templo' : state.gift;
  const monthShort = key => new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',month:'short'}).format(new Date(key+'T12:00:00-04:00')).replace('.','');
  const typeLabel = t => t === 'Campanha' ? 'Obra do templo' : t;
  const shortDate = key => new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',day:'2-digit',month:'short'}).format(new Date(key+'T12:00:00-04:00')).replace('.','');
  const yearItems = year => state.history.filter(x => x.day.startsWith(year)).sort((a, b) => b.day.localeCompare(a.day));
  const sum = list => list.reduce((t, x) => t + x.amount, 0);
  function historyPeek() {
    const year = NibDaily.dayKey(new Date()).slice(0,4), items = yearItems(year), last = items[0];
    return `<section class="box history-peek" aria-labelledby="history-peek-title"><div class="history-peek-text"><span class="label">MINHAS CONTRIBUIÇÕES</span><h2 id="history-peek-title">${items.length ? `Em ${year} você fez ${items.length} ${items.length === 1 ? 'contribuição' : 'contribuições'}` : `Suas contribuições de ${year}`}</h2>${last ? `<p>Última: ${escape(typeLabel(last.type))} em ${escape(shortDate(last.day))} · efetuado.</p>` : '<p>Nenhuma contribuição registrada neste ano.</p>'}</div>${button('Ver histórico','historico')}</section>`;
  }
  function historyPage() {
    if (state.giftStep === 'obrigado') { state.giftStep = 'finalidade'; state.giftAmount = null; }
    const years = [...new Set(state.history.map(x => x.day.slice(0,4)))].sort().reverse();
    if (!years.includes(state.historyYear)) state.historyYear = years[0] || NibDaily.dayKey(new Date()).slice(0,4);
    const year = state.historyYear, items = yearItems(year), ok = items.filter(x => x.status === 'ok'), pending = items.filter(x => x.status !== 'ok');
    const chips = years.map(y => `<button type="button" class="history-year${y === year ? ' is-active' : ''}" data-history-year="${y}" aria-pressed="${y === year}">${y}</button>`).join('');
    const parts = ['Dízimo','Oferta','Campanha'].map(t => { const n = items.filter(x => x.type === t).length; return `<div><dt>${escape(typeLabel(t) === t ? t + 's' : typeLabel(t))}</dt><dd>${n}</dd></div>`; }).join('');
    const months = []; for (const x of items) { const m = x.day.slice(0,7); let g = months.find(g => g.m === m); if (!g) months.push(g = { m, list: [] }); g.list.push(x); }
    const monthName = m => new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Porto_Velho',month:'long'}).format(new Date(m+'-15T12:00:00-04:00'));
    const rows = months.map(g => `<li class="history-month"><h3>${escape(monthName(g.m))}</h3><ul>${g.list.map(x => `<li><span class="admin-when"><small>${escape(monthShort(x.day))}</small><strong>${x.day.slice(8)}</strong></span><span class="history-what"><b>${escape(typeLabel(x.type))}</b><small><span class="history-status">Efetuado</span> · Pix${x.app ? ' pelo app' : ''}</small></span></li>`).join('')}</ul></li>`).join('');
    return `<div class="history-years" role="group" aria-label="Ano" data-seg="anos">${chips}</div><div class="history-layout"><section class="box history-summary" aria-labelledby="history-total-title"><span class="label">RESUMO DE ${year}</span><h2 id="history-total-title" class="history-total">${items.length} ${items.length === 1 ? 'contribuição' : 'contribuições'}</h2><p class="history-total-note">Obrigado por semear na obra de Deus.</p><dl class="bank-details history-parts">${parts}</dl>${button('Contribuir agora','generosidade',true)}</section><section class="box history-list" aria-labelledby="history-list-title"><h2 id="history-list-title">Lançamentos</h2>${rows ? `<ul class="history-months">${rows}</ul>` : '<p class="gift-intro">Nenhuma contribuição neste ano.</p>'}</section></div><section class="box history-how"><h2>Como o histórico funciona</h2><p>Cada contribuição aparece como <b>Efetuado</b>, sem valores. O Pix feito direto no app do banco aparece depois que a tesouraria confere o extrato da igreja.</p><p class="note">Demonstração com dados fictícios. Os valores ficam só com a tesouraria e a liderança pastoral.</p></section>`;
  }
  function giftBack() {
    const prev = ({valor:'finalidade', confirmar:'valor', pix: PUBLIC ? 'valor' : 'confirmar'})[state.giftStep || 'finalidade'];
    return prev ? `<button type="button" class="button-back gift-back" data-gift-step="${prev}">${backArrow}<span>Voltar</span></button>` : '';
  }
  function giftFlow() {
    const step = state.giftStep || 'finalidade', m = state.member;
    const order = PUBLIC ? ['finalidade','valor','pix','obrigado'] : ['finalidade','valor','confirmar','pix','obrigado'], idx = order.indexOf(step);
    const tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
    const steps = (PUBLIC ? ['Finalidade','Valor','Pix'] : ['Finalidade','Valor','Seus dados','Pix']).map((label,i) => `<li class="${idx > i ? 'is-done' : idx === i ? 'is-current' : ''}"${idx === i ? ' aria-current="step"' : ''}><span class="gift-dot">${idx > i ? tick : '0' + (i+1)}</span><span class="gift-step-label">${label}</span></li>`).join('');
    const head = `${giftBack() ? `<div class="gift-backrow">${giftBack()}</div>` : ''}<ol class="gift-steps" aria-label="Etapas da contribuição">${steps}</ol>`;
    const title = (text, intro) => `<div class="gift-step-head"><div><h3 id="gift-step-title" tabindex="-1" class="gift-step-title">${text}</h3>${intro ? `<p class="gift-intro">${intro}</p>` : ''}</div></div>`;
    const summary = () => `<div class="gift-summary"><span>${escape(giftLabel())}</span><strong>${money(state.giftAmount)}</strong></div>`;
    if (step === 'confirmar') return `${head}${title('Confira seus dados', 'Já preenchemos com o seu cadastro. Confira e toque em Gerar Pix.')}${summary()}<div class="gift-payer"><span class="profile-avatar" aria-hidden="true">${escape(m.first.charAt(0))}</span><div><span class="gift-payer-label">Contribuindo como</span><strong>${escape(m.full)}</strong><small>${escape(m.email)}</small></div><span class="gift-auto">Preenchido</span></div><label class="check gift-check"><input id="gift-receipt" type="checkbox" checked><span>Enviar o comprovante para ${escape(m.email)}</span></label><div class="form-actions gift-actions"><button type="button" class="action primary" data-gift-step="pix">Gerar Pix</button></div><p class="gift-foot">Dados errados? Atualize em <button type="button" class="auth-link" data-view="cadastro">Meu cadastro</button>.</p>`;
    if (step === 'pix') return `${head}${title('Pague no app do seu banco', 'Leia o QR Code ou copie o código e siga os passos abaixo.')}${summary()}<div class="pix-qr" id="pix-qr" role="img" aria-label="QR Code Pix de ${money(state.giftAmount)} para a Nova Igreja Batista"></div><label for="pix-code">Pix copia e cola</label><div class="pix-copy"><input id="pix-code" readonly value="${escape(state.giftCode)}"><button type="button" id="pix-copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 9h10v10H9z M5 15V5h10"/></svg><span>Copiar</span></button></div><ol class="pix-howto" aria-label="Como pagar"><li><span>1</span><p>Abra o app do seu banco e escolha <b>Pix</b>.</p></li><li><span>2</span><p>Use <b>Ler QR Code</b> ou <b>Pix copia e cola</b>.</p></li><li><span>3</span><p>Confira o nome <b>Nova Igreja Batista</b> e confirme.</p></li></ol><div class="form-actions gift-actions"><button type="button" class="action primary" data-gift-step="obrigado">Já fiz o Pix</button></div><p class="gift-foot">Pix real, direto para a conta da igreja (CNPJ 40.518.758/0001-30). Seu banco já informa o seu nome.</p>`;
    if (step === 'obrigado' && PUBLIC) return `${head}<div class="gift-thanks"><span class="gift-thanks-icon" aria-hidden="true">${tick}</span><h3 id="gift-step-title" tabindex="-1" class="gift-step-title">Obrigado pela sua generosidade!</h3><p>${escape(giftLabel())} de ${money(state.giftAmount)}. O Pix cai direto na conta da Nova Igreja Batista, e a tesouraria confere pelo extrato.</p><p class="note">O comprovante fica no app do seu banco.</p></div><div class="form-actions gift-actions"><button type="button" class="action primary" data-gift-step="finalidade" data-done="1">Fazer outra contribuição</button></div>`;
    if (step === 'obrigado') return `${head}<div class="gift-thanks"><span class="gift-thanks-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span><h3 id="gift-step-title" tabindex="-1" class="gift-step-title">Obrigado pela sua generosidade, ${escape(m.first)}!</h3><p>${escape(giftLabel())} de ${money(state.giftAmount)} registrado em Minhas contribuições como efetuado.</p>${state.giftReceipt === false ? '' : `<p class="note">O comprovante chega em ${escape(m.email)}.</p>`}</div><div class="form-actions gift-actions"><button type="button" class="action primary" data-view="historico">Ver minhas contribuições</button><button type="button" data-gift-step="finalidade" data-done="1">Fazer outra contribuição</button></div>`;
    if (step === 'finalidade') {
      const icons = {
        'Dízimo': '<path d="M12 21s-7-4.4-7-10.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7 2.8C19 16.6 12 21 12 21Z"/>',
        'Oferta': '<path d="M20 12v9H4v-9 M2 7h20v5H2z M12 21V7 M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Z M12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z"/>',
        'Campanha': '<path d="M3 21h18 M5 21V10l7-5 7 5v11 M9 21v-6h6v6"/>'
      };
      const info = {
        'Dízimo': 'Sua fidelidade sustenta a missão e o cuidado da igreja.',
        'Oferta': 'Uma expressão de gratidão, no valor que o seu coração decidir.',
        'Campanha': 'Construção do novo templo da Nib.'
      };
      const option = name => `<button type="button" class="gift-choice" data-gift="${name}" aria-pressed="${state.gift === name}"><span class="gift-choice-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg></span><span class="gift-choice-text"><strong>${name}</strong><small>${info[name]}</small>${name === 'Campanha' ? `<span class="gift-choice-obra"><img src="assets/campanha-templo.webp" alt="" width="900" height="506"><span><span class="campaign-bar" aria-hidden="true"><span></span></span><em data-obra-pct>${obra.percentual}% concluída</em></span></span>` : ''}</span><span class="gift-choice-radio" aria-hidden="true"></span></button>`;
      return `${head}${title('O que você quer contribuir?', 'Escolha uma opção e toque em Continuar.')}<div class="gift-choices" role="group" aria-label="Finalidade da contribuição">${['Dízimo','Oferta','Campanha'].map(option).join('')}</div><div class="form-actions gift-actions"><button type="button" class="action primary" data-gift-step="valor">Continuar</button></div><p class="gift-foot">Pix real, direto para a conta da igreja.</p>`;
    }
    const amounts = [50,100,200,500];
    return `${head}${title(state.gift === 'Campanha' ? 'Quanto você quer doar para a obra?' : state.gift === 'Dízimo' ? 'Qual o valor do seu dízimo?' : 'Qual o valor da sua oferta?', 'Toque em um valor sugerido ou digite outro e avance.')}<form id="gift-form"><div class="gift-amounts" role="group" aria-label="Valores sugeridos">${amounts.map(v => `<button type="button" data-gift-amount="${v}" aria-pressed="${state.giftAmount === v}">${money(v).replace(',00','')}</button>`).join('')}</div><label for="gift-value">Outro valor (R$)</label><input id="gift-value" name="amount" type="number" inputmode="decimal" min="1" max="1000000" step="0.01" placeholder="0,00" value="${state.giftAmount || ''}" required><div class="form-actions gift-actions"><button class="action primary" type="submit">Continuar</button></div></form><p class="gift-foot">Pix real, direto para a conta da igreja.</p>`;
  }
  function prayCaption(p) {
    const others = p.supporters - (p.supported ? 1 : 0);
    if (p.supported) return others ? `<b>Você</b> e mais ${others} ${others===1?'pessoa estão':'pessoas estão'} orando` : '<b>Você</b> está orando por este pedido';
    return others ? `<b>${others}</b> ${others===1?'pessoa está':'pessoas estão'} orando` : 'Seja o primeiro a orar por este pedido';
  }
  function prayerCards(compact=false, only=null) {
    const base = only || (PUBLIC ? state.prayers.filter(p => !p.answered) : state.prayers);
    return base.filter(p => isManagement() || !p.hidden || p.own).reverse().slice(0,compact?3:base.length).map(p=>`<article class="prayer-post" data-post="${p.id}"><div class="prayer-post-author">${avatarHtml(p.author, p.foto)}<div><strong>${escape(p.author)}</strong><small>${PUBLIC ? escape(fmtDay(p.at) || '') : 'Pedido fictício · Demonstração'}</small></div>${p.answered?'<span class="prayer-answered"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>Oração atendida</span>':''}</div>${p.hidden && p.own && !isManagement() ? '<p class="prayer-hidden-note">A liderança tirou este pedido do mural. Só você e a equipe pastoral o veem, e a equipe continua orando por você.</p>' : ''}<h3>${escape(p.name)}</h3><p class="prayer-reason">${escape(p.reason)}</p><div class="prayer-post-footer"><button type="button" class="prayer-support" data-prayer-support="${p.id}" aria-pressed="${p.supported}" aria-label="Estou orando por: ${escape(p.name)}">${prayHeart}<span class="prayer-support-label">${p.supported?'Orando':'Vou orar'}</span></button><span class="prayer-support-caption" aria-live="polite">${prayCaption(p)}</span></div>${!compact && PUBLIC && state.prayerTeam && !p.own ? `<div class="prayer-own-actions"><span class="prayer-own-label">Equipe da igreja</span><button type="button" class="prayer-own-btn" data-prayer-remove="${p.id}">Tirar do caderno</button></div>` : ''}${!compact&&p.own?'<div class="prayer-own-actions"><span class="prayer-own-label">Seu pedido</span><button type="button" class="prayer-own-btn" data-prayer-toggle="'+p.id+'" aria-label="'+(p.answered?'Reabrir pedido':'Marcar como atendida')+': '+escape(p.name)+'">'+(p.answered?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6 M4 4v4h4"/></svg><span>Reabrir</span>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg><span>Marcar atendida</span>')+'</button><button type="button" class="prayer-own-btn is-danger" data-prayer-delete="'+p.id+'" aria-label="Excluir pedido: '+escape(p.name)+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v6 M14 11v6"/></svg><span>Excluir</span></button></div>':''}</article>`).join('');
  }
  // Banners das redes oficiais: foto da igreja, chapéu, título e caixa azul translúcida.
  const socialLinks = [
    ['Instagram','Acompanhe a NIB no dia a dia','Fotos, avisos e bastidores de cada semana.','Siga agora!','https://www.instagram.com/nibcasadedeus/','assets/social-instagram.webp'],
    ['YouTube','Cultos e mensagens na íntegra','Assista ao vivo e reveja as pregações quando quiser.','Assista agora!','https://www.youtube.com/@nibcasadedeus','assets/social-youtube.webp'],
    ['Site da igreja','A NIB em um só lugar','Cultos, células, eventos e inscrições.','Acesse o site!','https://novaigrejabatista.com.br/','assets/social-site.webp']
  ];
  function socialBanners() {
    return `<section class="social-banners" aria-labelledby="social-title"><div class="section-heading"><h2 id="social-title">Acompanhe a igreja na internet</h2></div><div class="social-track">${socialLinks.map(([network,title,text,action,url,image]) => `<a class="social-card" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${network}: ${title}. ${text} ${action}. Abre em nova aba."><img src="${image}" alt="" width="900" height="682" loading="lazy"><span class="social-kicker">${network}</span><strong class="social-title">${title}</strong><span class="social-box"><span>${text} <b>${action}</b></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></span></a>`).join('')}</div><div class="social-dots" aria-hidden="true">${socialLinks.map((_,i)=>`<span${i?'':' class="is-active"'}></span>`).join('')}</div></section>`;
  }
  function bindSocialBanners() { content.querySelectorAll('.social-track').forEach(bindSocialTrack); pilResumos(); pilTextos(); }
  // Descrição na lista de pílulas (pedido de Hilton, 12/11/2026): até 4 linhas, cortada em palavra inteira (sem reticências)
  // e, quando cortada, "Ler mais" logo abaixo. O card inteiro abre a pílula, onde a descrição aparece completa.
  function pilTextos() {
    const liga = /^(e|ou|mas|que|para|com|sem|na|no|nas|nos|em|de|da|do|das|dos|a|o|as|os|um|uma|por|pela|pelo|se|ao|à|sua|seu|suas|seus|nossa|nosso|minha|meu)$/i;
    content.querySelectorAll('.pil-card-texto[data-texto]').forEach(el => {
      const mais = el.nextElementSibling && el.nextElementSibling.classList.contains('pil-ler-mais') ? el.nextElementSibling : null;
      el.textContent = el.dataset.texto;
      const cabe = () => el.scrollHeight <= el.clientHeight + 1;
      if (cabe()) { if (mais) mais.remove(); return; }
      if (!mais) el.insertAdjacentHTML('afterend', '<span class="pil-ler-mais">Ler mais</span>');
      const w = el.dataset.texto.split(/\s+/);
      while (w.length > 1) {
        w.pop(); while (w.length > 1 && liga.test(w[w.length - 1].replace(/[,;:–—-]+$/, ''))) w.pop();
        el.textContent = w.join(' ').replace(/[\s,;:–—-]+$/, ''); if (cabe()) return;
      }
    });
  }
  // Mensagem curta no banner da pílula, no padrão dos banners de "Acompanhe a igreja": frases inteiras terminadas em ponto
  // e a passagem em negrito no fim, em até 3 linhas (Hilton, 12/11/2026). Se nem a primeira frase couber, corta em palavra inteira e fecha com ponto
  // (sem reticências, regra do Hilton).
  function pilResumos() {
    content.querySelectorAll('.pil-resumo[data-resumo]').forEach(el => {
      const acao = el.dataset.acao || '', b = acao ? ' <b>' + escape(acao) + '</b>' : '';
      const ponto = t => t.replace(/[\s,;:–—-]+$/, '').replace(/([^.!?])$/, '$1.');
      const por = t => { el.innerHTML = escape(t) + b; return el.scrollHeight <= el.clientHeight + 1; };
      const frases = el.dataset.resumo.trim().match(/[^.!?]+[.!?]+["”’)]*|[^.!?]+$/g) || [el.dataset.resumo];
      for (let n = frases.length; n > 0; n--) if (por(ponto(frases.slice(0, n).join(' ').replace(/\s+/g, ' ').trim()))) return;
      // A primeira frase não coube: corta antes de vírgula ou de palavra que abre outra parte da frase ("e", "que", "na"...),
      // e só em último caso em qualquer palavra, nunca terminando em artigo, preposição ou conjunção.
      const w = frases[0].trim().split(/\s+/), liga = /^(e|ou|mas|que|para|com|sem|na|no|nas|nos|em|de|da|do|das|dos|a|o|as|os|um|uma|por|pela|pelo|se|ao|à)$/i;
      const limpa = t => t.replace(/[\s,;:–—-]+$/, '').toLowerCase();
      const conj = /^(e|ou|mas|pois|porque|quando|enquanto)$/i;
      for (const nivel of [2, 1, 0]) for (let n = w.length - 1; n > 0; n--) {
        const fim = limpa(w[n - 1]), prox = limpa(w[n]);
        const corte = /[,;:–—]$/.test(w[n - 1]) || conj.test(prox) ? 2 : liga.test(prox) ? 1 : 0;
        if (liga.test(fim) || corte < nivel) continue;
        if (por(ponto(w.slice(0, n).join(' ')))) return;
      }
      por(ponto(w[0]));
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => pilResumos());
  addEventListener('resize', () => { pilResumos(); pilTextos(); });
  function bindSocialTrack(track) {
    const dots = [...track.parentElement.querySelectorAll('.social-dots span')];
    const cards = [...track.children];
    // Paralaxe só nos cartões do "Acompanhe a igreja" (as capas das pílulas têm o próprio enquadramento).
    const images = cards.map(card => card.classList.contains('pil-banner') ? null : card.querySelector('img'));
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const left = track.scrollLeft;
      let index = 0;
      cards.forEach((card,i) => { if (Math.abs(card.offsetLeft - track.offsetLeft - left) < Math.abs(cards[index].offsetLeft - track.offsetLeft - left)) index = i; });
      dots.forEach((dot,i) => dot.classList.toggle('is-active', i === index));
      // Paralaxe: a foto anda mais devagar que o card ao deslizar.
      cards.forEach((card,i) => {
        const offset = (card.offsetLeft - track.offsetLeft - left) / card.offsetWidth;
        if (images[i]) images[i].style.transform = (still.matches || track.scrollWidth <= track.clientWidth + 1) ? '' : `translate3d(${(Math.max(-1.2, Math.min(1.2, offset)) * -10).toFixed(2)}%,0,0) scale(1.04)`;
      });
    };
    track.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, {passive:true});
    addEventListener('resize', () => { if (!frame) frame = requestAnimationFrame(update); });
    update();
    // Carrossel automático (Hilton, 13/11/2026): banners das redes e das Pílulas, 5 s por card, em loop; pausa enquanto a pessoa toca/arrasta.
    {
      let parado = 0;
      const pausa = () => { parado = Date.now(); };
      ['pointerdown', 'touchstart', 'wheel'].forEach(ev => track.addEventListener(ev, pausa, {passive:true}));
      const timer = setInterval(() => {
        if (!track.isConnected) { clearInterval(timer); return; }
        if (document.hidden || Date.now() - parado < 8000 || track.scrollWidth <= track.clientWidth + 1) return;
        const left = track.scrollLeft;
        let atual = 0;
        cards.forEach((card,i) => { if (Math.abs(card.offsetLeft - track.offsetLeft - left) < Math.abs(cards[atual].offsetLeft - track.offsetLeft - left)) atual = i; });
        const fim = left + track.clientWidth >= track.scrollWidth - 2;
        const prox = fim ? 0 : atual + 1;
        track.scrollTo({ left: cards[prox].offsetLeft - track.offsetLeft, behavior: still.matches ? 'auto' : 'smooth' });
      }, 5000);
    }
  }
  // Aniversariantes da semana: visível para todos os membros (só nome, dia e mês).
  // Mensagem só para o aniversariante: popup com fundo de vidro, uma vez por sessão,
  // depois da abertura do app e da animação do brasão.
  // Quem deu parabéns (fictício): nome, tempo e, às vezes, um recado curto.
  const birthdayFans = [
    ['Ana Exemplo', 'agora', 'Feliz aniversário! Deus te abençoe muito 🙏'], ['Paulo Exemplo', '5 min', ''], ['Lúcia Exemplo', '12 min', 'Muitas felicidades!'], ['Marcos Exemplo', '25 min', ''],
    ['Rafael Exemplo', '40 min', ''], ['Bianca Exemplo', '1 h', 'Parabéns, que Deus continue te usando!'], ['Carlos Exemplo', '1 h', ''], ['Joana Exemplo', '2 h', ''], ['Pedro Exemplo', '2 h', 'Feliz vida!'],
    ['Marta Exemplo', '3 h', ''], ['Tiago Exemplo', '3 h', ''], ['Débora Exemplo', '4 h', ''], ['Samuel Exemplo', '5 h', ''], ['Raquel Exemplo', '6 h', 'Te amamos, parabéns!'],
    ['André Exemplo', '7 h', ''], ['Sara Exemplo', '8 h', ''], ['Lucas Exemplo', '9 h', ''], ['Ester Exemplo', '10 h', '']
  ];
  const fansFace = (n, i) => `<span class="fan-av c${i % 4}">${escape(n.charAt(0))}</span>`;
  const fansSummary = () => { const f = birthdayFans; return `<b>${escape(f[0][0].split(' ')[0])}, ${escape(f[1][0].split(' ')[0])}</b> e mais ${f.length - 2} pessoas te deram parabéns`; };
  const fansStack = () => `<span class="fan-stack" aria-hidden="true">${birthdayFans.slice(0, 3).map(([n], i) => fansFace(n, i)).join('')}<span class="fan-av more">+${birthdayFans.length - 3}</span></span>`;
  function openFans() {
    let dlg = document.getElementById('fans-dialog');
    if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'fans-dialog'; dlg.setAttribute('aria-labelledby', 'fans-title'); document.body.append(dlg); dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); }
    dlg.innerHTML = `<div class="fans-sheet" tabindex="-1"><span class="fans-grip" aria-hidden="true"></span><div class="fans-head"><div><h2 id="fans-title">Parabéns</h2><p>${birthdayFans.length} pessoas da igreja</p></div><button type="button" class="fans-close" data-fans-close="1" aria-label="Fechar lista"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12 M18 6 6 18"/></svg></button></div><label class="visually-hidden" for="fans-search">Buscar</label><input id="fans-search" class="fans-search" type="search" placeholder="Buscar" autocomplete="off"><ul class="fans-list">${birthdayFans.map(([n, t, msg], i) => `<li data-name="${escape(n.toLowerCase())}">${fansFace(n, i)}<div><strong>${escape(n)}</strong>${msg ? `<p>${escape(msg)}</p>` : '<p class="is-muted">Deu parabéns</p>'}</div><small>${escape(t)}</small></li>`).join('')}</ul></div>`;
    const search = dlg.querySelector('#fans-search');
    search.addEventListener('input', () => { const q = search.value.trim().toLowerCase(); dlg.querySelectorAll('.fans-list li').forEach(li => { li.hidden = !!q && !li.dataset.name.includes(q); }); });
    dlg.showModal();
    dlg.querySelector('.fans-sheet').focus({ preventScroll: true });
  }
  function openCongrats(btn) {
    const name = btn.closest('.bday').querySelector('.bday-text strong').textContent; const first = name.split(' ')[0];
    let dlg = document.getElementById('congrats-dialog');
    if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'congrats-dialog'; dlg.setAttribute('aria-labelledby', 'congrats-title'); document.body.append(dlg); dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); }
    const chips = ['Feliz aniversário! 🎉', 'Deus te abençoe muito!', 'Muitas felicidades!', 'Que Deus continue te usando!'];
    dlg.innerHTML = `<form class="fans-sheet congrats-sheet" method="dialog" tabindex="-1"><span class="fans-grip" aria-hidden="true"></span><div class="fans-head"><div><h2 id="congrats-title">Parabéns para ${escape(first)}</h2><p>A mensagem é opcional</p></div><button type="button" class="fans-close" data-congrats-close="1" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12 M18 6 6 18"/></svg></button></div><div class="congrats-chips">${chips.map(c => `<button type="button" class="congrats-chip" data-chip="${escape(c)}">${escape(c)}</button>`).join('')}</div><label class="visually-hidden" for="congrats-msg">Mensagem</label><textarea id="congrats-msg" class="congrats-msg" maxlength="140" rows="3" placeholder="Escreva uma mensagem para ${escape(first)}"></textarea><div class="congrats-count"><span>Só ${escape(first)} vê a mensagem.</span><span id="congrats-n">0/140</span></div><button type="submit" class="congrats-send">Enviar parabéns</button></form>`;
    const msg = dlg.querySelector('#congrats-msg'), n = dlg.querySelector('#congrats-n');
    const count = () => { n.textContent = msg.value.length + '/140'; };
    msg.addEventListener('input', count);
    dlg.querySelectorAll('.congrats-chip').forEach(c => c.addEventListener('click', () => { msg.value = c.dataset.chip; count(); dlg.querySelectorAll('.congrats-chip').forEach(o => o.classList.toggle('is-on', o === c)); }));
    dlg.querySelector('[data-congrats-close]').addEventListener('click', () => dlg.close());
    dlg.querySelector('form').addEventListener('submit', e => {
      const text = msg.value.trim();
      if (text && NibModeration.offensive(text)) { e.preventDefault(); msg.setAttribute('aria-invalid', 'true'); return announce('Sua mensagem tem palavras ofensivas ou de baixo calão. Revise o texto.', 'warning'); }
      const k = btn.dataset.congrats; state.congrats[k] = text || true;
      e.preventDefault(); dlg.close(); btn.classList.add('is-sent'); btn.setAttribute('aria-pressed', 'true'); btn.textContent = 'Parabéns enviado';
      announce(`Parabéns enviado para ${first} (teste). Na versão real, a pessoa recebe uma notificação${text ? ' com a sua mensagem' : ''}.`, 'success', false);
    });
    dlg.showModal(); dlg.querySelector('form').focus({ preventScroll: true });
  }
  function myBirthdayPopup(tries = 0) {
    if (PUBLIC) return;
    const me = admin.birthdays().find(b => b.today && b.name === state.member.full);
    if (!me || state.birthdayShown || isManagement() || state.view !== 'inicio') return;
    const ready = ['app-splash', 'app-auth', 'app-onboarding', 'app-enter'].every(id => { const el = document.getElementById(id); return !el || el.hidden; });
    if (!ready) { if (tries < 60) setTimeout(() => myBirthdayPopup(tries + 1), 400); return; }
    state.birthdayShown = true;
    setTimeout(openBirthday, 700); // respiro depois do brasão
  }
  function openBirthday() {
    if (state.view !== 'inicio' || isManagement()) return;
    let dlg = document.getElementById('bday-dialog');
    if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'bday-dialog'; dlg.setAttribute('aria-labelledby', 'my-bday-title'); document.body.append(dlg); dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); }
    const date = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Porto_Velho', day: 'numeric', month: 'long' }).format(new Date());
    dlg.innerHTML = `<div class="my-bday" tabindex="-1"><div class="my-bday-confetti" aria-hidden="true">${'<i></i>'.repeat(16)}</div><img class="my-bday-water" src="assets/brasao-branco.webp" alt="" width="271" height="293"><button type="button" class="my-bday-close" data-bday-close="1" aria-label="Fechar mensagem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12 M18 6 6 18"/></svg></button>
      <div class="my-bday-crest" aria-hidden="true"><img src="assets/brasao-branco.webp" alt="" width="271" height="293"></div>
      <span class="my-bday-date">${escape(date.toUpperCase())} · HOJE É O SEU DIA</span>
      <h2 id="my-bday-title">Feliz aniversário,<span>${escape(state.member.first)}</span></h2>
      <span class="my-bday-rule" aria-hidden="true"><i></i></span>
      <p class="my-bday-msg">A Nova Igreja Batista celebra a sua vida e agradece a Deus por você caminhar com a gente. Que este novo ano seja cheio da graça e da paz do Senhor.</p>
      <blockquote class="my-bday-verse"><p>“Ensina-nos a contar os nossos dias, de tal maneira que alcancemos corações sábios.”</p><cite>SALMOS 90:12</cite></blockquote>
      <button type="button" class="my-bday-fans" data-fans-open="1">${fansStack()}<span class="fan-text">${fansSummary()}</span><span class="fan-chev" aria-hidden="true">›</span></button>
      <button type="button" class="my-bday-ok" data-bday-close="1">Amém, ${g('obrigado', 'obrigada')}!</button></div>`;
    dlg.querySelectorAll('.my-bday-confetti i').forEach((el, i) => { el.style.setProperty('--x', ((i * 37) % 100) + '%'); el.style.setProperty('--d', (i % 5) * .35 + 's'); el.style.setProperty('--t', 2.8 + (i % 4) * .5 + 's'); el.style.setProperty('--r', (i * 47 % 180) + 'deg'); });
    dlg.showModal();
    dlg.querySelector('.my-bday').focus({ preventScroll: true });
  }
  function myRequestsBox() {
    const list = admin.myRequests(state.member.full); if (!list.length) return '';
    return `<section class="box my-requests" aria-labelledby="my-req-title"><h2 id="my-req-title">Minhas solicitações</h2><ol class="req-list">${list.map(r => { const done = r.status === 'atualizado'; return `<li><div class="req-head"><strong>${escape(r.note)}</strong><span class="tag ${done ? 'status-active' : 'is-wait'}">${done ? 'Atualizado' : 'Em conferência'}</span></div><ol class="req-steps" aria-label="Andamento"><li class="is-done">Enviado · ${escape(r.at)}</li><li class="${done ? 'is-done' : 'is-now'}">Em conferência pela Secretaria</li><li class="${done ? 'is-done' : ''}">${done ? 'Cadastro atualizado · ' + escape(r.done || '') : 'Cadastro atualizado'}</li></ol></li>`; }).join('')}</ol></section>`;
  }
  // Células do site: mesma lista da home (novaigrejabatista.com.br/#celulas), filtrada por dia.
  function siteCellsPage() {
    const days = NibSite.celulas(), total = NibSite.totalCelulas();
    const mine = account() && findCell(account().celula);
    const sel = days.some(d => d.dia === state.cellDay) ? state.cellDay : '';
    const selIdx = sel ? days.findIndex(d => d.dia === sel) + 1 : 0, fromIdx = state.cellDayFrom === undefined ? selIdx : state.cellDayFrom; state.cellDayFrom = selIdx;
    const hoje = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][new Date().getDay()];
    const chips = [['', 'Todos', total, 'Todos os dias']].concat(days.map(d => [d.dia, d.dia.slice(0, 3), d.celulas.length, d.dia])).map(([v, l, n, full]) => `<button type="button" class="day-pick-btn${v === sel ? ' is-active' : ''}${v && v === hoje ? ' is-today' : ''}" data-cell-day="${escape(v)}" aria-pressed="${v === sel}" aria-label="${escape(full)}, ${n} ${n === 1 ? 'célula' : 'células'}${v && v === hoje ? ', hoje' : ''}"><strong>${escape(l)}</strong><small aria-hidden="true">${n}</small></button>`).join('');
    const wa = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.2A8.5 8.5 0 1 1 20 11.5Z M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9a4 4 0 0 1-2.8-2.8l.9-1-1-2Z"/></svg>';
    const groups = days.filter(d => !sel || d.dia === sel).map(d => `<section class="cell-day" aria-labelledby="cd-${escape(d.dia.slice(0,3))}"><div class="section-heading"><h2 id="cd-${escape(d.dia.slice(0,3))}">${escape(d.dia)}</h2><span class="cell-count">${d.celulas.length} ${d.celulas.length === 1 ? 'célula' : 'células'}</span></div><ul class="cell-list">${d.celulas.map(c => `<li class="cell-card${mine && mine.dia === d.dia && mine.nome === c.nome ? ' is-mine' : ''}">${mine && mine.dia === d.dia && mine.nome === c.nome ? '<span class="cell-mine-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>Sua célula</span>' : ''}<h3>${escape(c.nome)}</h3><p class="cell-leader">${escape(c.lider)}</p><p class="cell-row">${navIcon('informacoes')}<span>${escape(c.horario)}</span></p><p class="cell-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg><span>${escape(c.local)}</span></p>${c.whatsapp ? `<a class="button button-go cell-wa" href="${escape(c.whatsapp)}" target="_blank" rel="noopener">${wa}<span>Falar com o líder</span></a>` : ''}</li>`).join('')}</ul></section>`).join('');
    const mineBox = mine ? `<section class="box my-cell" aria-labelledby="my-cell-title"><span class="label">SUA CÉLULA</span><h2 id="my-cell-title">${escape(mine.nome)}</h2><p class="cell-leader">${escape(mine.lider)}</p><div class="place-card cell-place"><div class="cell-place-row"><span class="place-pin"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg></span><div><strong>${escape(mine.dia)}</strong><span>${escape(mine.horario)}</span></div></div><div class="cell-place-row"><span class="place-pin"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg></span><div><strong>Local</strong><span>${escape(mine.local)}</span></div></div></div>${mine.whatsapp ? `<a class="place-route cell-wa-main" href="${escape(mine.whatsapp)}" target="_blank" rel="noopener">${wa}<span>Falar com o líder</span></a>` : ''}<div class="place-links"><a href="#agenda" data-view="agenda">${navIcon('agenda')}<span><strong>Calendário</strong><small>Ver os dias</small></span></a><a href="#cadastro" data-view="cadastro"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4 3.5 7.5 7 11 M3.5 7.5H17 M17 13l3.5 3.5L17 20 M20.5 16.5H7"/></svg><span><strong>Trocar</strong><small>Outra célula</small></span></a></div></section>`
      : account() ? `<section class="box my-cell is-empty"><span class="label">SUA CÉLULA</span><p>${account().celula ? 'A célula do seu cadastro não está mais na lista. Escolha de novo em Meu cadastro.' : 'Já participa de uma célula? Informe em Meu cadastro para ela aparecer aqui e no seu calendário.'}</p><button type="button" class="button" data-view="cadastro">Informar minha célula</button></section>` : '';
    const intro = `<section class="box cell-intro"><span class="label">NOSSAS CÉLULAS</span><h2>${total} células em Ariquemes</h2><p>É nos lares que a fé encontra espaço para ser vivida de perto. Escolha o dia que fica melhor para você e chame o líder no WhatsApp.</p></section>`;
    return `${mineBox ? `<div class="cell-top">${mineBox}${intro}</div>` : intro}<div class="day-pick seg" role="group" aria-label="Dia da semana" style="--n:${days.length + 1};--i:${selIdx};--from:${fromIdx}"><span class="seg-pill${fromIdx !== selIdx ? ' is-moving' : ''}" aria-hidden="true"></span>${chips}</div>${groups}`;
  }
  // Informações reais da igreja: horários, endereço, liderança e canais.
  function siteInfoPage() {
    const leaders = NibSite.lideranca().map(l => `<li class="leader"><img src="${l.photo}" alt="" width="480" height="600" loading="lazy"><div><small>${escape(l.role)}</small><strong>${escape(l.name)}</strong></div></li>`).join('');
    return `<div class="admin-grid info-grid"><section class="box"><span class="label">TODA SEMANA</span><h2>Cultos e encontros</h2><ul class="admin-upcoming info-week"><li><span class="admin-when"><small>qui</small><strong>19h30</strong></span><span><b>Culto da Fé</b><small>Quinta-feira</small></span></li><li><span class="admin-when"><small>dom</small><strong>9h30</strong></span><span><b>EBS · Escola Bíblica de Sabedoria</b><small>Domingo de manhã</small></span></li><li><span class="admin-when"><small>dom</small><strong>19h</strong></span><span><b>Noite de Glória</b><small>Domingo à noite</small></span></li><li><span class="admin-when"><small>lares</small><strong>${NibSite.totalCelulas()}</strong></span><span><b>Células</b><small>Durante a semana, nos lares</small></span></li></ul><div class="form-actions">${button('Ver células', 'celulas')}</div></section><section class="box church-contact"><span class="label">ESTAMOS TE ESPERANDO</span><h2>Endereço</h2><div class="place-card"><span class="place-pin"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg></span><div><strong>Nova Igreja Batista</strong><span>Rua França, 1409</span><span>Áreas Especiais 01</span><span>Ariquemes, RO · 76870-013</span></div></div><a class="place-route" href="https://www.google.com/maps/dir/?api=1&amp;destination=Nova%20Igreja%20Batista%20Rua%20Fran%C3%A7a%201409%20Ariquemes%20RO" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 21 3l-8 18-2-8-8-2Z"/></svg><span>Como chegar</span></a><div class="place-links"><a href="https://www.instagram.com/nibcasadedeus/" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.2 6.8h.01"/></svg><span><strong>Instagram</strong><small>Fotos e avisos</small></span></a><a href="https://www.youtube.com/@nibcasadedeus" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5C3 6.6 4.4 5.5 6 5.4 8 5.2 10 5.1 12 5.1s4 .1 6 .3c1.6.1 3 1.2 3 3.1v7c0 1.9-1.4 3-3 3.1-2 .2-4 .3-6 .3s-4-.1-6-.3C4.4 18.5 3 17.4 3 15.5Z M10 9l5 3-5 3Z"/></svg><span><strong>YouTube</strong><small>Cultos ao vivo</small></span></a></div></section></div><section class="box leaders-box" aria-labelledby="leaders-title"><span class="label">QUEM CONDUZ</span><h2 id="leaders-title">Nossa liderança</h2><ul class="leaders">${leaders}</ul></section>`;
  }
  function cellsPage() {
    if (PUBLIC) return siteCellsPage();
    const myCell = memberCell() || { name: 'Célula Exemplo', weekday: 3, time: '19:30', place: 'Casa da família Exemplo · Bairro Exemplo', leader: 'Paulo e Lúcia Exemplo' };
    const wd = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'][myCell.weekday];
    return `<div class="cells-layout"><section class="box my-cell" aria-labelledby="my-cell-title"><span class="label">MINHA CÉLULA</span><h2 id="my-cell-title">${escape(myCell.name)}</h2><dl class="profile"><dt>Quando</dt><dd>Toda ${wd}, às ${escape(myCell.time)}</dd><dt>Onde</dt><dd>${escape(myCell.place)}</dd><dt>Líder</dt><dd>${escape(myCell.leader)}</dd></dl><div class="form-actions"><button type="button" class="action primary" data-message="No app real, este botão abre o WhatsApp do líder da célula. Nesta versão de teste o número é fictício.">Falar com o líder</button><button type="button" class="button button-go" data-view="agenda">Ver no calendário ${arrow}</button></div><p class="note">Dados fictícios. Na versão real, a célula vem da plataforma de células ou do cadastro feito pela Secretaria.</p></section><section class="box"><span class="label">PLATAFORMA DE CÉLULAS</span><h2>Estudos e presença</h2><p>Os estudos, a presença e os relatórios da célula ficam na plataforma de células, que será conectada ao app.</p><button type="button" disabled>Acesso em preparação</button></section></div>`;
  }
  function homeNotice() {
    const n = admin.latestNotice(); if (!n) return '';
    return `<section class="home-notice" aria-labelledby="home-notice-title"><span class="home-notice-icon" aria-hidden="true">${navIcon('comunicados')}</span><div class="home-notice-text"><span class="label">AVISO DA IGREJA</span><h2 id="home-notice-title">${escape(n.title)}</h2><p>${escape(n.text)}</p>${n.when ? `<small>${escape(n.when)}</small>` : ''}</div><button type="button" class="home-notice-more" data-view="informacoes" aria-label="Ver todos os avisos">›</button></section>`;
  }
  function birthdayBlock() {
    const list = admin.birthdays().filter(b => !(b.name === state.member.full && state.hideBirthday)); if (!list.length) return '';
    state.congrats = state.congrats || {};
    const cake = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21h16 M5 21v-8h14v8 M5 16c2 1 4-1 7 0s5 1 7 0 M12 13V9 M12 6.5c-.8-.6-.8-1.9 0-2.5.8.6.8 1.9 0 2.5z"/></svg>';
    const extra = list.length > 4 && !state.bdayAll; const cards = list.map((b, i) => { if (extra && i >= 4 && b.name !== state.member.full) return ''; if (b.name === state.member.full) return `<li class="bday bday-mine"><div class="bday-mine-top"><span class="profile-avatar" aria-hidden="true">${escape(b.name.charAt(0))}<i>${cake}</i></span><div class="bday-text"><strong>${escape(b.name)}</strong><small class="is-me">Hoje é o seu dia</small></div><span class="bday-mine-tag">Parabéns!</span></div><button type="button" class="bday-mine-fans" data-fans-open="1">${fansStack()}<span class="fan-text">${fansSummary()}</span><span class="fan-chev" aria-hidden="true">›</span></button></li>`; const sent = state.congrats[b.key + b.name]; return `<li class="bday${b.today ? ' is-today' : ''}"><span class="profile-avatar" aria-hidden="true">${escape(b.name.charAt(0))}${b.today ? `<i>${cake}</i>` : ''}</span><div class="bday-text"><strong>${escape(b.name)}</strong><small${b.name === state.member.full ? ' class="is-me"' : ''}>${b.name === state.member.full ? 'Hoje é o seu dia · ver parabéns' : b.today ? 'Hoje' : escape(b.week) + ', ' + b.date}</small></div>${b.name === state.member.full ? `<button type="button" class="bday-me" data-fans-open="1" aria-label="Ver quem te deu parabéns">${fansStack()}<span class="fan-count">${birthdayFans.length}</span></button>` : `<button type="button" class="bday-btn${sent ? ' is-sent' : ''}" data-congrats="${escape(b.key + b.name)}" aria-pressed="${!!sent}">${sent ? 'Parabéns enviado' : 'Dar parabéns'}</button>`}</li>`; }).join('');
    return `<section class="home-birthdays" aria-labelledby="bday-title"><div class="section-heading"><div><span class="label">ESTA SEMANA</span><h2 id="bday-title">Aniversariantes</h2></div><span class="bday-icon">${cake}</span></div><ul class="bday-list box">${cards}${extra ? `<li class="bday-more"><button type="button" data-bday-all="1">Ver todos os ${list.length} aniversariantes</button></li>` : ''}</ul><p class="note">Aparecem só o nome, o dia e o mês. Quem não quiser aparecer pode desmarcar em Meu cadastro.</p></section>`;
  }
  function communityBlock() {
    return `<section class="community-prayer" aria-labelledby="community-prayer-title"><div class="section-heading"><div><span class="label">CUIDADO EM COMUNIDADE</span><h2 id="community-prayer-title">Caderno de oração</h2></div>${button('Ver caderno','caderno')}</div><p>Vamos orar uns pelos outros.</p><div class="prayer-feed">${prayerCards(true)}</div>${PUBLIC ? '' : '<p class="note">Mural demonstrativo com pedidos fictícios. O contador representa pessoas orando. Ainda sem compartilhamento entre usuários.</p>'}</section>`;
  }
  function loadPrayers() {
    return NibConta.caderno('lista').then(d => { state.prayers = d.pedidos.slice().reverse().map(x => ({ id: String(x.id), author: x.autor, foto: x.autor_foto || '', name: x.titulo, reason: x.motivo, answered: x.atendido, supporters: x.orando, supported: x.eu_orando, own: x.meu, at: x.criado_em })); state.prayerTeam = d.equipe && NibConta.equipe(); state.prayersLoaded = true; state.prayerError = ''; })
      .catch(e => { state.prayersLoaded = true; state.prayerError = e.message; });
  }
  // Minhas inscrições (contas reais): eventos do site ligados ao celular da conta. Só para cadastro confirmado pela Secretaria (decisão de Hilton, 06/11/2026).
  function loadRegistrations() {
    state.regsLoading = true;
    return NibConta.inscricoes().then(d => { state.regs = d; }).catch(e => { state.regs = { erro: e.message }; }).finally(() => { state.regsLoading = false; state.regsKey = state.accountKey; });
  }
  const legacyRegsBox = () => `<section class="box event-follow-up"><h2>Minhas inscrições</h2><p>As inscrições são feitas no site da igreja. Para ver a sua, use a consulta com o nome ou o protocolo e o WhatsApp informado.</p><a class="button button-go" href="https://novaigrejabatista.com.br/consulta-inscricao/" target="_blank" rel="noopener">Consultar minha inscrição ${arrow}</a></section>`;
  function myRegistrations() {
    const consult = `<a class="button button-go" href="https://novaigrejabatista.com.br/consulta-inscricao/" target="_blank" rel="noopener">Consultar pelo site ${arrow}</a>`;
    const head = '<span class="label">MINHAS INSCRIÇÕES</span><h2>Suas inscrições em eventos</h2>';
    if (!state.regs || state.regsKey !== state.accountKey) { if (!state.regsLoading) loadRegistrations().then(() => { if (state.view === 'eventos') show('eventos', false, false); }); return `<section class="box event-follow-up my-regs">${head}<p class="event-empty">Carregando suas inscrições</p></section>`; }
    const d = state.regs;
    if (d.desativado) return legacyRegsBox();
    if (d.erro) return `<section class="box event-follow-up my-regs">${head}<p>${escape(d.erro)}</p>${consult}</section>`;
    if (!d.liberado) return `<section class="box event-follow-up my-regs">${head}<p>Assim que a Secretaria confirmar seu cadastro, suas inscrições aparecem aqui sozinhas, sem precisar digitar nada. Até lá, use a consulta do site.</p>${consult}</section>`;
    if (!d.inscricoes.length) return `<section class="box event-follow-up my-regs">${head}<p>Não encontramos inscrições com o celular ${escape(fmtPhone(account().celular || ''))}. Se a inscrição foi feita com outro número, use a consulta do site.</p>${consult}</section>`;
    const items = d.inscricoes.map(r => `<li class="reg-card"><div class="reg-top"><strong>${escape(r.evento)}</strong><span class="reg-status ${r.confirmada ? 'is-ok' : 'is-wait'}">${escape(r.situacao)}</span></div><p class="reg-name">${escape(r.nome)}</p><p class="reg-proto">Protocolo <b>${escape(r.protocolo)}</b></p></li>`).join('');
    return `<section class="box event-follow-up my-regs">${head}<p>Inscrições feitas com o celular do seu cadastro, inclusive as de filhos em que você é o responsável.</p><ul class="reg-list">${items}</ul></section>`;
  }
  // Avisos da igreja (reais): a Secretaria e a Liderança Pastoral publicam; todos veem (pedido de Hilton, 06/11/2026).
  function loadAvisos() {
    state.avisosLoading = true;
    return NibConta.avisos('lista').then(d => { state.avisos = d.avisos; state.avisosEquipe = d.equipe && NibConta.equipe(); state.avisosErro = ''; })
      .catch(e => { state.avisosErro = e.message; state.avisos = state.avisos || []; })
      .finally(() => { state.avisosLoading = false; state.avisosKey = state.accountKey || ''; });
  }
  function ensureAvisos() {
    if (!PUBLIC || !window.NibConta || !NibConta.available() || state.avisosLoading || (state.avisos && state.avisosKey === (state.accountKey || ''))) return;
    loadAvisos().then(() => { refreshNotices(); if (['inicio', 'avisos'].includes(state.view)) show(state.view, false, false); });
  }
  const avisosVistos = () => { try { return JSON.parse(localStorage.getItem('nib-avisos-lidos') || '[]'); } catch (_) { return []; } };
  function avisosNovos() { ensureAvisos(); const v = avisosVistos(); return (state.avisos || []).filter(a => !v.includes(a.id)).length; }
  function avisoData(t) { const d = new Date(String(t).replace(' ', 'T') + '-04:00'); return isNaN(d) ? '' : new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Porto_Velho', day: '2-digit', month: 'long' }).format(d); }
  // Bloco na tela inicial com os avisos ativos (até a data final informada), pedido de Hilton em 06/11/2026.
  // Cadastro incompleto (nascimento, CPF ou endereço): lembrete discreto na inicial até completar.
  function birthNudge() {
    const p = account(); if (!p) return '';
    const falta = [!p.nascimento && 'data de nascimento', !p.cpf && 'CPF', !p.endereco && 'endereço'].filter(Boolean); if (!falta.length) return '';
    const lista = falta.length > 1 ? falta.slice(0, -1).join(', ') + ' e ' + falta[falta.length - 1] : falta[0];
    return `<a class="birth-nudge" href="#cadastro" data-view="cadastro"><span class="birth-nudge-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M5 16c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0M12 12V8M12 5.5c.8-.8.8-1.7 0-2.5-.8.8-.8 1.7 0 2.5Z"/></svg></span><span><strong>Complete seu cadastro</strong><small>Falta informar ${escape(lista)}.</small></span><span class="birth-nudge-go" aria-hidden="true">›</span></a>`;
  }
  function homeAvisos() {
    ensureAvisos(); const list = (state.avisos || []).slice(0, 2); if (!list.length) return '';
    const v = avisosVistos();
    return `<section class="home-avisos" aria-labelledby="home-avisos-title"><div class="section-heading"><div><span class="label">MURAL DA IGREJA</span><h2 id="home-avisos-title">${list.length === 1 ? 'Aviso da igreja' : 'Avisos da igreja'}</h2></div>${button('Ver todos', 'avisos')}</div>${list.map(a => `<article class="home-aviso${a.fixado ? ' is-pinned' : ''}"><span class="aviso-icon" aria-hidden="true">${navIcon('comunicados')}</span><div><div class="home-aviso-top"><h3>${escape(a.titulo)}</h3>${v.includes(a.id) ? '' : '<span class="home-aviso-new">Novo</span>'}</div><p>${escape(a.texto)}</p>${a.ate ? `<small>Até ${escape(fmtDay(a.ate))}</small>` : ''}${a.link ? `<a class="home-aviso-link" href="${escape(a.link)}" target="_blank" rel="noopener">Saiba mais ${arrow}</a>` : ''}</div></article>`).join('')}</section>`;
  }
  function avisosPage() {
    if (!PUBLIC) return `<section class="box"><p>Os avisos publicados pela igreja aparecem aqui.</p></section>`;
    if (!state.avisos) { ensureAvisos(); return '<p class="event-empty">Carregando os avisos</p>'; }
    try { localStorage.setItem('nib-avisos-lidos', JSON.stringify(state.avisos.map(a => a.id).slice(0, 60))); } catch (_) {}
    const team = account() && NibConta.equipe();
    const form = team ? `<section class="box aviso-form-box"><span class="label">NOVO AVISO</span><h2>Publicar para toda a igreja</h2><form id="aviso-form" class="aviso-form"><label>Título<input name="titulo" maxlength="120" required placeholder="Ex.: Culto de Santa Ceia"></label><label>Aviso<textarea name="texto" rows="4" maxlength="1500" required placeholder="Escreva o aviso como ele deve aparecer para a igreja."></textarea></label><label>Link (opcional)<input name="link" type="url" maxlength="300" placeholder="https://"></label><label>Mostrar até<input name="ate" type="date" required min="${NibDaily.dayKey(new Date())}" value="${NibDaily.dayKey(new Date(Date.now() + 7 * 864e5))}"></label><label class="check"><input type="checkbox" name="fixado"><span>Fixar no topo</span></label><label class="check"><input type="checkbox" name="notificar" checked><span>Enviar notificação no celular de quem ativou</span></label><div class="form-actions"><button type="submit" class="action">Publicar aviso</button></div></form></section>` : '';
    const list = state.avisos.length ? `<ul class="aviso-list">${state.avisos.map(a => `<li class="aviso-card${a.fixado ? ' is-pinned' : ''}"><div class="aviso-top"><span class="aviso-icon" aria-hidden="true">${navIcon('comunicados')}</span><div><h3>${escape(a.titulo)}</h3><small>${a.fixado ? 'Fixado · ' : ''}${escape(avisoData(a.criado_em))}${a.autor ? ' · por ' + escape(a.autor) : ''}</small></div></div><p>${escape(a.texto).replace(/\n/g, '<br>')}</p>${a.link ? `<a class="button button-go" href="${escape(a.link)}" target="_blank" rel="noopener">Saiba mais ${arrow}</a>` : ''}${team ? `<button type="button" class="aviso-remove" data-aviso-remove="${a.id}">Remover aviso</button>` : ''}</li>`).join('')}</ul>` : `<section class="box"><p class="event-empty">${state.avisosErro ? escape(state.avisosErro) : 'Nenhum aviso no momento. Quando a igreja publicar, ele aparece aqui e no sino.'}</p></section>`;
    return form + list;
  }
