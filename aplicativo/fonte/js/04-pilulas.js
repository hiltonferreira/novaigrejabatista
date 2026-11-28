  // Pílulas de Sabedoria (pedido de Hilton, 08/11/2026): vídeos curtos do pastor, enviados pelo app direto para o YouTube da igreja (não listado).
  // A igreja assiste aqui dentro e busca por título, tema, passagem ou pelas palavras faladas (legenda automática do YouTube).
  const PIL_TEMAS = ['Fé', 'Esperança', 'Ansiedade', 'Família', 'Oração', 'Gratidão', 'Perdão', 'Propósito', 'Santidade', 'Cura'];
  const pilTempo = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  // Pílula que a igreja vê agora (para a liderança a lista traz também as ocultas, programadas e em processamento).
  const pilVisivel = p => (!p.estado || p.estado === 'publicado' || p.troca) && !p.oculto && !p.agendado;
  // "qui., 12 de nov. às 7h" para a publicação programada.
  const pilQuando = s => { if (!s) return ''; const d = new Date(s.replace(' ', 'T')); if (isNaN(d)) return ''; return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).format(d).replace(/\./g, '') + ' às ' + d.getHours() + 'h' + (d.getMinutes() ? String(d.getMinutes()).padStart(2, '0') : ''); };
  const pilLocal = s => s ? s.replace(' ', 'T').slice(0, 16) : '';
  const pilAgoraLocal = () => { const d = new Date(Date.now() + 5 * 60000); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
  const pilData = d => d ? new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(d.slice(0, 10) + 'T12:00:00Z')).replace('.', '') : '';
  const pilEstados = { enviando: 'Envio incompleto', processando: 'Processando no YouTube', privado: 'Travado como privado', bloqueado: 'Bloqueado no YouTube', falhou: 'Não publicado' };
  // Capa escolhida pelo pastor (guardada no app) ou, sem ela, a miniatura automática do YouTube.
  const pilCapaImg = p => p.capa ? `<img class="is-capa" src="${escape(p.capa)}" alt="" loading="lazy">`
    : p.youtube_id ? `<img src="https://i.ytimg.com/vi/${encodeURIComponent(p.youtube_id)}/hqdefault.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" data-some-sem-imagem>` : '';
  // Quadro da capa: no formulário (p = null) usa o vídeo escolhido; numa pílula publicada, uma foto ou um quadro de um vídeo do celular.
  function pilCapaBox(p) {
    const nova = p ? null : state.pilCapa, src = nova ? nova.url : p && p.capa ? p.capa : '';
    const ico = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
    const icoVideo = ico('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M7 5v14M17 5v14M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4"/>');
    const icoImagem = ico('<path d="M20 14.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7"/><path d="m4 16 4.5-4.5a1.5 1.5 0 0 1 2.1 0L15 16"/><path d="m13.5 14.5 1.4-1.4a1.5 1.5 0 0 1 2.1 0L20 16"/><path d="M18 3v6M15 6l3-3 3 3"/>');
    const foto = `<label class="button">${icoImagem}<span>Carregar imagem</span><input type="file" accept="image/*" data-pil-capa-foto class="visually-hidden"></label>`;
    const auto = (nova || (p && p.capa)) ? '<button type="button" class="link-button" data-pil-capa-auto>Usar a automática do YouTube</button>' : '';
    const acoes = p ? `<label class="button">${icoVideo}<span>Quadro do vídeo</span><input type="file" accept="video/*" data-pil-capa-video class="visually-hidden"></label>${foto}${auto}` : `<button type="button" class="button" data-pil-capa-quadros>${icoVideo}<span>Quadro do vídeo</span></button>${foto}${auto}`;
    const dica = p ? (state.pilCapaVid ? 'Arraste o quadradinho na faixa até o momento que quiser e toque em "Usar este quadro".' : src ? 'Capa escolhida por você.' : 'Hoje a capa é a automática do YouTube.') : src ? 'Capa escolhida por você.' : state.pilCapaQuadros ? 'Arraste o quadradinho na faixa até o momento que quiser e toque em "Usar este quadro".' : 'Automática do YouTube. Você pode escolher um quadro do vídeo ou carregar uma imagem.';
    const vsrc = p ? state.pilCapaVid : state.pilCapaQuadros ? state.pilFileUrl : null;
    // Seletor de quadro no estilo do Instagram (Hilton, 13/11/2026): prévia grande no formato do banner, faixa de miniaturas e um quadradinho que se arrasta.
    const vid = vsrc ? `<div class="pil-capa-video pil-quadros"><div class="pil-quadros-prev${(p ? p.vertical : !state.pilMeta || state.pilMeta.vertical) ? ' is-vertical' : ''}"><video src="${vsrc}" muted playsinline preload="auto"></video></div><div class="pil-quadros-faixa"><canvas aria-hidden="true"></canvas><span class="pil-quadros-sel" aria-hidden="true"><canvas></canvas></span><input type="range" min="0" max="1000" value="0" step="1" aria-label="Momento do vídeo usado como capa" data-pil-quadro-pos></div><div class="form-actions"><button type="button" class="action primary" data-pil-quadro>Usar este quadro</button><button type="button" class="button" data-pil-capa-fechar>Cancelar</button></div></div>` : '';
    if (vsrc) requestAnimationFrame(pilQuadrosIniciar);
    return `<div class="pil-capa" id="pil-capa"><span class="pil-capa-img${(p ? p.vertical : !state.pilMeta || state.pilMeta.vertical) ? ' is-vertical' : ''}">${src ? `<img src="${escape(src)}" alt="Capa da pílula">` : p && p.youtube_id ? pilCapaImg(p) : '<small>Automática</small>'}</span><div><strong>Capa</strong><small>${escape(dica)}</small></div><div class="pil-capa-acoes">${acoes}</div>${vid}</div>`;
  }
  // Reduz a imagem (foto ou quadro do vídeo) para no máximo 1280 px. Usa WebP (bem menor, mesma qualidade);
  // onde o navegador não gera WebP (Safari devolve PNG), cai para JPEG.
  function pilCapaJpeg(fonte, w, h) {
    const k = Math.min(1, 1280 / Math.max(w, h)), c = document.createElement('canvas');
    c.width = Math.round(w * k); c.height = Math.round(h * k);
    c.getContext('2d').drawImage(fonte, 0, 0, c.width, c.height);
    const gera = (tipo, q) => new Promise(res => c.toBlob(b => res(b), tipo, q));
    return gera('image/webp', 0.82).then(b => b && b.type === 'image/webp' ? b : gera('image/jpeg', 0.86))
      .then(b => { if (!b) throw new Error('Não foi possível preparar a imagem.'); return b; });
  }
  async function pilCapaFoto(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Não foi possível abrir essa imagem. Escolha uma foto JPEG ou PNG.')); i.src = url; });
      return await pilCapaJpeg(img, img.naturalWidth, img.naturalHeight);
    } finally { URL.revokeObjectURL(url); }
  }
  // Liga a faixa de quadros: miniaturas tiradas de uma cópia do vídeo e o quadradinho que mostra o quadro escolhido.
  function pilQuadrosIniciar() {
    const box = content.querySelector('.pil-quadros'); if (!box || box.dataset.ok) return; box.dataset.ok = '1';
    const video = box.querySelector('video'), faixa = box.querySelector('.pil-quadros-faixa'), tira = faixa.querySelector(':scope > canvas');
    const sel = faixa.querySelector('.pil-quadros-sel'), mini = sel.querySelector('canvas'), pos = faixa.querySelector('input');
    const cobre = (ctx, fonte, x, y, w, h) => { const fw = fonte.videoWidth, fh = fonte.videoHeight; if (!fw || !fh) return; const k = Math.max(w / fw, h / fh), sw = w / k, sh = h / k; ctx.drawImage(fonte, (fw - sw) / 2, (fh - sh) / 2, sw, sh, x, y, w, h); };
    const lugar = () => { sel.style.left = (sel.offsetWidth / 2 + (faixa.clientWidth - sel.offsetWidth) * pos.value / 1000) + 'px'; };
    const desenhaMini = () => { const r = devicePixelRatio || 1; mini.width = sel.clientWidth * r; mini.height = sel.clientHeight * r; cobre(mini.getContext('2d'), video, 0, 0, mini.width, mini.height); };
    const ir = () => { const d = video.duration; if (d && isFinite(d)) video.currentTime = Math.min(d - 0.05, Math.max(0.05, d * pos.value / 1000)); lugar(); };
    pos.addEventListener('input', ir);
    video.addEventListener('seeked', desenhaMini);
    video.addEventListener('loadeddata', () => { ir(); desenhaMini(); });
    addEventListener('resize', lugar);
    lugar();
    // Miniaturas da faixa: uma segunda cópia do vídeo vai pulando pelos pontos; se o aparelho não deixar, a faixa fica só com o fundo.
    const copia = document.createElement('video'); copia.muted = true; copia.playsInline = true; copia.preload = 'auto'; copia.src = video.src;
    copia.addEventListener('loadedmetadata', async () => {
      const d = copia.duration; if (!d || !isFinite(d)) return;
      const r = devicePixelRatio || 1, n = Math.max(5, Math.min(10, Math.round(faixa.clientWidth / 40)));
      tira.width = faixa.clientWidth * r; tira.height = faixa.clientHeight * r;
      const ctx = tira.getContext('2d'), w = tira.width / n;
      for (let i = 0; i < n; i++) {
        if (!box.isConnected) return;
        await new Promise(res => { const t = setTimeout(res, 1500); copia.addEventListener('seeked', () => { clearTimeout(t); res(); }, { once: true }); copia.currentTime = d * (i + 0.5) / n; });
        cobre(ctx, copia, Math.round(i * w), 0, Math.ceil(w), tira.height);
      }
      copia.removeAttribute('src'); copia.load();
    }, { once: true });
  }
  function pilCapaQuadro(video) {
    if (!video || video.readyState < 2 || !video.videoWidth) return Promise.reject(new Error('Espere o vídeo carregar e arraste o quadradinho até o momento que quiser usar como capa.'));
    return pilCapaJpeg(video, video.videoWidth, video.videoHeight);
  }
  // Capa nova: no formulário fica guardada até publicar; numa pílula publicada, salva na hora.
  async function pilCapaUsar(blob) {
    if (state.pilSel && state.pilVer) {
      const d = await NibConta.pilulaCapa(state.pilVer.id, blob);
      state.pilVer = d.pilula; state.pil = null; state.pilHomeKey = null; pilCapaVidFechar();
      show('pilulas', false, false); announce(blob ? 'Capa salva.' : 'A capa voltou a ser a automática do YouTube.', 'success', false); return;
    }
    if (state.pilCapa) URL.revokeObjectURL(state.pilCapa.url);
    state.pilCapaQuadros = false;
    state.pilCapa = blob ? { blob, url: URL.createObjectURL(blob) } : null;
    const box = content.querySelector('#pil-capa'); if (box) box.outerHTML = pilCapaBox(null);
  }
  function pilCapaVidFechar() { if (state.pilCapaVid) URL.revokeObjectURL(state.pilCapaVid); state.pilCapaVid = null; }
  function pilCapaLimpar() { if (state.pilCapa) URL.revokeObjectURL(state.pilCapa.url); state.pilCapa = null; state.pilCapaQuadros = false; pilCapaVidFechar(); }
  // Curtir (discreto) e compartilhar a pílula (pedido de Hilton, 13/11/2026).
  const pilCoracao = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7.5-4.6-9.3-9.2C1.5 7.6 3.6 4.5 6.9 4.5c2 0 3.5 1.1 5.1 3 1.6-1.9 3.1-3 5.1-3 3.3 0 5.4 3.1 4.2 6.3C19.5 15.4 12 20 12 20z"/></svg>';
  const pilCurtirBtn = (p, cls) => `<button type="button" class="pil-curtir${cls ? ' ' + cls : ''}${p.curti ? ' is-on' : ''}" data-pil-curtir="${p.id}" aria-pressed="${!!p.curti}" aria-label="${p.curti ? 'Descurtir' : 'Curtir'} ${escape(p.titulo)}${p.curtidas ? `, ${p.curtidas} ${p.curtidas === 1 ? 'curtida' : 'curtidas'}` : ''}">${pilCoracao}<span>${p.curtidas || ''}</span></button>`;
  function pilCurtir(btn) {
    const id = Number(btn.dataset.pilCurtir), achar = () => [...((state.pil && state.pil.pilulas) || []), state.pilVer].filter(x => x && x.id === id);
    const alvo = achar(); if (!alvo.length || btn.disabled) return;
    const quer = !alvo[0].curti, antes = { curti: alvo[0].curti, curtidas: alvo[0].curtidas || 0 };
    const pinta = (curti, n) => { achar().forEach(x => { x.curti = curti; x.curtidas = n; }); content.querySelectorAll(`[data-pil-curtir="${id}"]`).forEach(b => { const x = achar()[0]; b.outerHTML = pilCurtirBtn(x, b.classList.contains('is-detalhe') ? 'is-detalhe' : ''); }); };
    pinta(quer, Math.max(0, antes.curtidas + (quer ? 1 : -1)));
    NibConta.pilulas('curtir', { id, curtir: quer }).then(d => pinta(d.curti, d.curtidas)).catch(e => { pinta(antes.curti, antes.curtidas); announce(e.message, 'warning'); });
  }
  async function pilCompartilhar(p) {
    // O link passa pela página de compartilhamento: WhatsApp e Instagram mostram a capa, o título e o resumo.
    const url = location.origin + location.pathname.replace(/[^/]*$/, '') + 'api/compartilhar.php?pilula=' + p.id;
    const frases = (p.texto || '').replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/);
    let resumo = ''; for (const f of frases) { if (resumo && (resumo + ' ' + f).length > 220) break; resumo = resumo ? resumo + ' ' + f : f; }
    const texto = `*${p.titulo}*${p.passagem ? ' · ' + p.passagem : ''}\n\n${resumo ? resumo + '\n\n' : ''}▶️ Assista agora no app da Nib:`;
    if (navigator.share) { try { await navigator.share({ title: p.titulo, text: texto, url }); } catch (_) {} return; }
    try { await navigator.clipboard.writeText(texto + ' ' + url); announce('Link copiado. Cole no Instagram, WhatsApp ou onde quiser.', 'success', false); }
    catch (_) { prompt('Copie o link da pílula:', url); }
  }
  function pilThumb(p) {
    const play = `<span class="pil-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5.5v13l10.5-6.5z"/></svg></span>`;
    return `<span class="pil-thumb${p.vertical ? ' is-vertical' : ''}">${pilCapaImg(p)}${play}${p.duracao ? `<small>${pilTempo(p.duracao)}</small>` : ''}</span>`;
  }
  function loadPilulas() {
    const q = state.pilQ || '', tema = state.pilTema || ''; state.pilLoading = true;
    return NibConta.pilulas('lista&q=' + encodeURIComponent(q) + '&tema=' + encodeURIComponent(tema))
      .then(d => { if ((state.pilQ || '') === q && (state.pilTema || '') === tema) { state.pil = d; state.pilErro = ''; } if (!q && !tema) state.pilHome = d.pilulas.filter(pilVisivel); })
      .catch(e => { state.pilErro = e.message; state.pil = state.pil || { pilulas: [], temas: [] }; })
      .finally(() => { state.pilLoading = false; });
  }
  // Bloco na tela inicial: a pílula mais recente dos últimos 10 dias.
  // Atalho do pastor na tela inicial (pedido de Hilton, 08/11/2026): o mesmo cartão "Grave a pílula da semana" da tela das Pílulas.
  function homePilEstudio() {
    if (!PUBLIC || !account() || !NibConta.lideranca()) return '';
    const d = state.pilHomeD; if (!d || !d.youtube || !d.youtube.conectado) return '';
    return `<div class="pil-home-estudio">${pilEquipe(d)}</div>`;
  }
  function homePilula() {
    if (!PUBLIC || !account()) return '';
    if (state.pilHomeKey !== (state.accountKey || '')) { state.pilHomeKey = state.accountKey || ''; state.pilHome = null; NibConta.pilulas('lista').then(d => { state.pilHome = d.pilulas.filter(pilVisivel); state.pilHomeD = d; if (state.view === 'inicio' && (state.pilHome.length || NibConta.lideranca())) show('inicio', false, false); }).catch(() => { state.pilHome = []; }); return ''; }
    // Banners como os do "Acompanhe a igreja" (pedido de Hilton, 08/11/2026): as 3 pílulas mais recentes, logo abaixo do versículo.
    const l = (state.pilHome || []).slice(0, 3); if (!l.length) return '';
    const play = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l10.5-6.5z"/></svg>';
    const seta = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
    // Título de 2 palavras quebra em 2 linhas; no quadro laranja, a mensagem curta em até 3 linhas (cortada em palavra inteira, sem reticências).
    const titulo = t => { const w = String(t).trim().split(/\s+/); return w.length === 2 ? escape(w[0]) + '<br>' + escape(w[1]) : escape(t); };
    // Como nos banners de "Acompanhe a igreja": frase inteira terminada em ponto e, depois, a passagem bíblica em negrito (pedido de Hilton, 12/11/2026).
    const acao = p => p.passagem || ('Assistir' + (p.duracao ? ' ' + pilTempo(p.duracao) : ''));
    const caixa = p => p.texto ? `<span class="pil-resumo" data-resumo="${escape(p.texto)}" data-acao="${escape(acao(p))}">${escape(p.texto)} <b>${escape(acao(p))}</b></span>` : `<span><b>${escape(acao(p))}</b></span>`;
    return `<section class="social-banners pil-banners" aria-labelledby="home-pil-title"><div class="section-heading"><h2 id="home-pil-title">Pílulas de Sabedoria</h2>${button('Ver todas', 'pilulas')}</div><div class="social-track pil-track">${l.map(p => `<button type="button" class="social-card pil-banner${p.vertical ? ' is-vertical' : ''}" data-pil-abrir="${p.id}" aria-label="Pílula de Sabedoria: ${escape(p.titulo)}. Assistir.">${pilCapaImg(p) || `<span class="pil-banner-art" aria-hidden="true">${navIcon('pilulas')}</span>`}${p.tema ? `<span class="social-kicker">${escape(p.tema)}</span>` : ''}<strong class="social-title">${titulo(p.titulo)}</strong><span class="social-box pil-banner-box">${caixa(p)}${seta}</span></button>`).join('')}</div>${l.length > 1 ? `<div class="social-dots" aria-hidden="true">${l.map((_, i) => `<span${i ? '' : ' class="is-active"'}></span>`).join('')}</div>` : ''}</section>`;
  }
  function pilLista() {
    // Lápis e selos de estado só para a liderança, respeitando o "Ver o app como" (pedido de Hilton, 12/11/2026).
    const d = state.pil, l = d.pilulas, lider = !!d.equipe && NibConta.lideranca();
    if (!l.length) return `<p class="event-empty">${state.pilErro ? escape(state.pilErro) : state.pilQ ? `Nenhuma pílula encontrada para “${escape(state.pilQ)}”. Tente outra palavra ou a passagem bíblica.` : state.pilTema ? 'Nenhuma pílula com este tema ainda.' : 'Ainda não há pílulas publicadas. Quando o pastor enviar, ela aparece aqui e no início do app.'}</p>`;
    return `<ul class="pil-list">${l.map(p => `<li class="pil-item"><button type="button" class="pil-card" data-pil-abrir="${p.id}">${pilThumb(p)}<span class="pil-card-body">${lider && p.estado && p.estado !== 'publicado' ? `<span class="pil-estado is-${escape(p.estado)}">${escape(p.troca ? 'Trocando o vídeo' : pilEstados[p.estado] || p.estado)}${p.estado === 'enviando' ? ` · ${p.progresso}%` : ''}</span>` : lider && p.oculto ? '<span class="pil-estado is-oculta">Oculta</span>' : lider && p.agendado ? `<span class="pil-estado is-programada">Programada · ${escape(pilQuando(p.publicar_em))}</span>` : p.tema ? `<span class="pil-tema">${escape(p.tema)}</span>` : ''}<strong>${escape(p.titulo)}</strong><small>${escape([p.passagem, pilData(p.data)].filter(Boolean).join(' · '))}</small>${p.texto ? `<span class="pil-card-texto" data-texto="${escape(p.texto)}">${escape(p.texto)}</span>` : ''}</span><span class="pil-card-seta" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></span></button>${p.youtube_id && (!p.estado || p.estado === 'publicado') ? pilCurtirBtn(p) : ''}${lider && p.estado && p.youtube_id ? `<button type="button" class="pil-card-editar" data-pil-editar-id="${p.id}" aria-label="Editar ${escape(p.titulo)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z M13.5 8.5l3 3"/></svg></button>` : ''}${(p.trechos || []).length ? `<div class="pil-trechos"><span>Falado no vídeo</span>${p.trechos.map(([t, txt]) => `<button type="button" data-pil-abrir="${p.id}" data-t="${t}"><b>${pilTempo(t)}</b>${escape(txt)}</button>`).join('')}</div>` : ''}</li>`).join('')}</ul>`;
  }
  let pilTimer = 0;
  function pilBuscar(v) {
    clearTimeout(pilTimer);
    pilTimer = setTimeout(() => { state.pilQ = v.trim(); loadPilulas().then(() => { const box = content.querySelector('#pil-results'); if (box && state.view === 'pilulas' && !state.pilSel) { box.innerHTML = pilLista(); pilTextos(); } }); }, 350);
  }
  const pilAdmin = () => !!(account() && NibConta.pessoa().papel === 'admin');
  // Canal do YouTube no Painel da administração (pedido de Hilton, 08/11/2026): conectar e desconectar ficam só aqui.
  function adminYoutube() {
    if (!PUBLIC || !pilAdmin()) return '';
    if (!state.ytEstado) { if (!state.ytLoading) { state.ytLoading = true; NibConta.youtube('estado').then(d => { state.ytEstado = d; }).catch(e => { state.ytEstado = { erro: e.message }; }).finally(() => { state.ytLoading = false; if (state.view === 'equipe') show('equipe', false, false); }); } return ''; }
    const y = state.ytEstado, head = '<section class="box yt-box"><span class="label">ADMINISTRAÇÃO · INTEGRAÇÕES</span><h2>Canal do YouTube</h2>';
    if (y.erro) return head + `<p class="form-error">${escape(y.erro)}</p></section>`;
    if (!y.configurado) return head + '<p>Falta colocar no servidor as chaves do projeto do Google.</p></section>';
    if (!y.conectado) return head + '<p>Conecte o canal da igreja para a Liderança Pastoral enviar as Pílulas de Sabedoria pelo app. Entre com a conta Google que tem acesso ao canal.</p><div class="form-actions"><a class="action primary" href="api/youtube.php?acao=conectar">Conectar canal do YouTube</a></div></section>';
    return head + `<p class="yt-status"><span class="pil-canal-dot" aria-hidden="true"></span><span>Conectado${y.canal ? `: <strong>${escape(y.canal)}</strong>` : ''}. As Pílulas de Sabedoria enviadas pela Liderança Pastoral vão para este canal como não listadas.</span></p><div class="form-actions"><button type="button" class="button" data-view="pilulas">Ver as pílulas</button><button type="button" class="button pil-remove" data-pil-desconectar>Desconectar canal</button></div></section>`;
  }
  function pilEquipe(d) {
    const y = d.youtube || {};
    if (!y.configurado) return `<section class="box pil-team"><span class="label">LIDERANÇA PASTORAL</span><h2>Enviar pílulas</h2><p>Falta colocar no servidor as chaves do projeto do Google. Depois disso, a administração conecta o canal do YouTube da igreja aqui.</p></section>`;
    if (!y.conectado) return `<section class="box pil-team"><span class="label">LIDERANÇA PASTORAL</span><h2>Conectar o canal do YouTube</h2><p>${pilAdmin() ? 'A conexão com o canal fica no Painel da administração. Só precisa fazer uma vez.' : 'Peça à administração para conectar o canal do YouTube da igreja ao app. Só precisa fazer uma vez.'}</p>${pilAdmin() ? '<div class="form-actions"><button type="button" class="action primary" data-view="equipe">Abrir o Painel</button></div>' : ''}</section>`;
    const u = state.pilUp;
    if (u) {
      const fim = { publicado: [u.troca ? 'Pronto! O vídeo da pílula foi trocado.' : u.quando ? `Pronto! A pílula aparece para a igreja ${pilQuando(u.quando)}.` : 'Pronto! A pílula já está no app.', 'is-ok'], privado: [u.msg, 'is-alert'], falhou: [u.msg, 'is-alert'], erro: [u.msg, 'is-alert'] }[u.fase];
      const corpo = u.fase === 'enviando' ? `<p class="pil-up-msg">${escape(u.msg || 'Enviando o vídeo')}</p><div class="pil-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${u.pct}"><i data-w="${u.pct}"></i></div><p class="pil-up-pct"><strong>${u.pct}%</strong> · Pode usar o app, mas não feche até terminar.</p>`
        : u.fase === 'processando' ? `<p>${u.troca ? 'O vídeo novo chegou ao YouTube e o anterior foi apagado do canal. A pílula volta a aparecer para a igreja assim que o vídeo novo ficar pronto.' : `O vídeo chegou ao YouTube. Agora ele está sendo preparado e aparece para a igreja assim que ficar pronto${u.notificar ? ', com aviso no celular' : ''}.`}</p><div class="pil-bar is-busy"><i></i></div>`
        : `<p class="pil-up-fim ${fim[1]}">${escape(fim[0])}</p>`;
      return `<section class="box pil-team pil-up"><span class="label">${u.fase === 'enviando' ? 'ENVIANDO' : u.fase === 'processando' ? 'QUASE LÁ' : 'ENVIO'}</span><h2>${escape(u.titulo)}</h2>${corpo}${u.fase === 'enviando' ? '' : `<div class="form-actions">${(u.fase === 'erro' || u.fase === 'falhou') && !u.troca ? '<button type="button" class="action primary" data-pil-nova>Tentar de novo</button>' : ''}<button type="button" class="button" data-pil-fechar>${u.fase === 'processando' ? 'Ok, avise quando ficar pronto' : 'Fechar'}</button></div>`}</section>`;
    }
    const canal = `<div class="pil-canal-wrap"><span class="pil-canal"><span class="pil-canal-dot" aria-hidden="true"></span>YouTube${y.canal ? ' · ' + escape(y.canal) : ''}</span></div>`;
    const escolher = (txt, cls) => `<label class="${cls}"><input type="file" accept="video/*" data-pil-escolher class="visually-hidden">${txt}</label>`;
    if (state.pilForm && state.pilFile) {
      const f = state.pilFile, temas = [...new Set((d.temas || []).concat(PIL_TEMAS))].slice(0, 14), t = state.pilTemaNovo || '';
      if (!state.pilFileUrl) state.pilFileUrl = URL.createObjectURL(f);
      return `<section class="pil-studio is-form">${canal}<span class="label">NOVA PÍLULA</span><h2>Conte sobre o vídeo</h2>
        <div class="pil-preview${state.pilMeta && !state.pilMeta.vertical ? ' is-wide' : ''}"><video src="${state.pilFileUrl}" muted playsinline controls preload="metadata"></video><div><strong>${escape(f.name)}</strong><small id="pil-info">${state.pilMeta ? escape(pilResumo(state.pilMeta, f)) : pilMB(f.size)}</small>${escolher('Trocar vídeo', 'pil-trocar')}</div></div>
        ${pilCapaBox(null)}
        <form id="pil-form" class="pil-form" autocomplete="off"><label>Título<input name="titulo" maxlength="120" required placeholder="Ex.: Não andeis ansiosos" value="${escape(state.pilRasc && state.pilRasc.titulo || '')}"></label>
        <fieldset class="pil-temas-escolha"><legend>Tema central</legend><input type="hidden" name="tema" value="${escape(t)}"><div>${temas.map(x => `<button type="button" class="pil-chip${t === x ? ' is-on' : ''}" data-pil-tema-escolha="${escape(x)}" aria-pressed="${t === x}">${escape(x)}</button>`).join('')}<button type="button" class="pil-chip${t && !temas.includes(t) ? ' is-on' : ''}" data-pil-tema-outro>Outro tema</button></div><input class="pil-tema-outro" name="tema_outro" maxlength="60" placeholder="Escreva o tema" value="${t && !temas.includes(t) ? escape(t) : ''}"${t && !temas.includes(t) ? '' : ' hidden'}></fieldset>
        <label>Passagem bíblica<input name="passagem" maxlength="80" placeholder="Ex.: Filipenses 4.6-7" value="${escape(state.pilRasc && state.pilRasc.passagem || '')}"></label>
        <label>Mensagem curta (opcional)<textarea name="texto" rows="3" maxlength="1000" placeholder="Uma frase para acompanhar o vídeo.">${escape(state.pilRasc && state.pilRasc.texto || '')}</textarea></label>
        <label class="check"><input type="checkbox" name="programar" data-pil-programar><span>Programar a publicação</span></label>
        <label class="pil-programar" hidden>Publicar em<input type="datetime-local" name="publicar_em" min="${pilAgoraLocal()}"></label>
        <label class="check"><input type="checkbox" name="notificar" checked><span>Avisar a igreja no celular quando a pílula for publicada</span></label>
        <p class="note">Vai para o YouTube da igreja como não listado: só quem está no app encontra.</p>
        <div class="form-actions"><button type="submit" class="action primary pil-enviar">Publicar pílula</button><button type="button" class="button" data-pil-cancelar>Cancelar</button></div></form></section>`;
    }
    const pub = (d.pilulas || []).filter(pilVisivel), ult = pub[0], prog = (d.pilulas || []).filter(p => p.agendado && !p.oculto).length;
    return `<section class="pil-studio">${canal}<span class="pil-studio-icon" aria-hidden="true">${navIcon('pilulas')}</span><h2>Grave a pílula da semana</h2><p>Grave no celular, na vertical, de 1 a 3 minutos. O vídeo vai para o YouTube da igreja e aparece aqui para todos.</p>${escolher(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4 M7 9l5-5 5 5 M5 20h14"/></svg>Escolher vídeo`, 'pil-studio-btn')}<small class="pil-studio-info">${pub.length ? `${pub.length} ${pub.length === 1 ? 'pílula publicada' : 'pílulas publicadas'} · última em ${escape(pilData(ult.data))}` : 'Nenhuma pílula publicada ainda. A primeira começa aqui.'}${prog ? ` · ${prog}\u00a0${prog === 1 ? 'programada' : 'programadas'}` : ''}</small></section>`;
  }
  function pilulasPage() {
    if (!PUBLIC) return `<section class="box"><p>Aqui ficam os vídeos curtos do pastor para meditar na Palavra, com busca por tema, passagem bíblica e pelas palavras faladas no vídeo.</p></section>`;
    if (!account()) return `<section class="box"><h2>Entre para assistir</h2><p>As Pílulas de Sabedoria são para a igreja: entre na sua conta para ver os vídeos do pastor.</p><div class="form-actions"><button type="button" class="action" data-view="entrar">Entrar ou criar cadastro</button></div></section>`;
    if (state.pilSel) return pilDetalhe();
    if (!state.pil) { if (!state.pilLoading) loadPilulas().then(() => { if (state.view === 'pilulas' && !state.pilSel) show('pilulas', false, false); }); return '<p class="event-empty">Carregando as pílulas</p>'; }
    const d = state.pil, lider = d.equipe && NibConta.lideranca();
    const temas = d.temas || [];
    const chips = temas.length > 1 || state.pilTema ? `<div class="pil-temas seg-rolar" role="group" aria-label="Filtrar por tema" data-seg="pil-temas"><button type="button" class="history-year${state.pilTema ? '' : ' is-active'}" data-pil-tema="" aria-pressed="${!state.pilTema}">Todos</button>${temas.map(t => `<button type="button" class="history-year${state.pilTema === t ? ' is-active' : ''}" data-pil-tema="${escape(t)}" aria-pressed="${state.pilTema === t}">${escape(t)}</button>`).join('')}</div>` : '';
    return `${lider ? pilEquipe(d) : ''}<div class="pil-search"><label class="visually-hidden" for="pil-q">Buscar nas pílulas</label><input id="pil-q" type="search" value="${escape(state.pilQ || '')}" placeholder="Buscar por tema, passagem ou palavra" autocomplete="off" enterkeyhint="search"></div>${chips}<div id="pil-results">${pilLista()}</div>`;
  }
  const pilIframe = (p, t, auto) => `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(p.youtube_id)}?rel=0&amp;playsinline=1&amp;modestbranding=1${t ? '&amp;start=' + t : ''}${auto ? '&amp;autoplay=1' : ''}" title="${escape(p.titulo)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  function pilDetalhe() {
    const sel = state.pilSel, p = state.pilVer && state.pilVer.id === sel.id ? state.pilVer : null;
    if (!p) { NibConta.pilulas('ver&id=' + sel.id).then(d => { state.pilVer = d.pilula; }).catch(e => { state.pilSel = null; announce(e.message, 'warning'); }).finally(() => { if (state.view === 'pilulas') show('pilulas', false, false); }); return '<p class="event-empty">Carregando a pílula</p>'; }
    const lider = !!p.estado && NibConta.lideranca(), pronto = p.youtube_id && (!p.estado || p.estado === 'publicado' || p.troca);
    const palavras = eqFold(state.pilQ || '').split(/\s+/).filter(w => w.length >= 3 || /^\d+$/.test(w));
    const hit = txt => { const f = ' ' + eqFold(txt).replace(/[^a-z0-9]+/g, ' ') + ' '; return palavras.some(w => /^\d+$/.test(w) ? f.includes(' ' + w + ' ') : f.includes(w)); };
    const player = pronto ? `<div class="pil-player${p.vertical ? ' is-vertical' : ''}" id="pil-player">${pilIframe(p, sel.t, !!sel.t)}</div>`
      : `<section class="box pil-wait"><p>${escape(p.aviso || (p.estado === 'enviando' ? `O envio parou em ${p.progresso}%. Remova e envie o vídeo de novo.` : 'O YouTube ainda está preparando o vídeo. Ele aparece aqui assim que ficar pronto.'))}</p></section>`;
    const leg = p.legendas || [];
    const transc = leg.length ? `<details class="pil-transc"${palavras.length && leg.some(([, x]) => hit(x)) ? ' open' : ''}><summary>Ler o que foi falado</summary><ol>${leg.map(([t, x]) => `<li${palavras.length && hit(x) ? ' class="is-hit"' : ''}><button type="button" data-pil-t="${t}">${pilTempo(t)}</button><span>${escape(x)}</span></li>`).join('')}</ol>${p.transcricao && p.transcricao !== leg.map(c => c[1]).join(' ') ? `<p class="pil-transc-ed"><b>Texto revisado:</b> ${escape(p.transcricao)}</p>` : ''}</details>`
      : p.transcricao ? `<details class="pil-transc"><summary>Ler o que foi falado</summary><p>${escape(p.transcricao)}</p></details>`
      : pronto ? '<p class="pil-transc-wait">A transcrição do que foi falado aparece aqui alguns minutos depois da publicação.</p>' : '';
    const edit = lider && state.pilEdit ? `<section class="box pil-team"><span class="label">EDITAR</span><form id="pil-edit-form" class="pil-form"><label>Título<input name="titulo" maxlength="120" required value="${escape(p.titulo)}"></label><label>Tema central<input name="tema" maxlength="60" value="${escape(p.tema)}"></label><label>Passagem bíblica<input name="passagem" maxlength="80" value="${escape(p.passagem)}"></label><label>Mensagem curta<textarea name="texto" rows="3" maxlength="1000">${escape(p.texto)}</textarea></label>${p.transcricao || leg.length ? `<label>Transcrição (corrija palavras que o YouTube errou)<textarea name="transcricao" rows="6">${escape(p.transcricao || '')}</textarea></label>` : ''}<label>Publicação programada (vazio: aparece já)<input type="datetime-local" name="publicar_em" value="${escape(p.agendado ? pilLocal(p.publicar_em) : '')}" min="${pilAgoraLocal()}"></label><p class="note">Título, passagem e mensagem também mudam no YouTube. Tema e transcrição ficam só no app.</p><div class="form-actions"><button type="submit" class="action primary">Salvar</button><button type="button" class="button" data-pil-editar="0">Cancelar</button></div></form></section>` : '';
    const enviando = state.pilUp && state.pilUp.fase === 'enviando';
    const acoes = lider && !state.pilEdit ? `${p.oculto ? '<p class="pil-aviso">Oculta: a igreja não vê esta pílula. Toque em Mostrar para voltar.</p>' : ''}${p.agendado && !p.oculto ? `<p class="pil-aviso is-info">Programada: aparece para a igreja ${escape(pilQuando(p.publicar_em))}.</p>` : ''}${p.troca ? `<p class="pil-aviso">Trocando o vídeo: ${p.progresso}% enviado. Até terminar, a igreja continua vendo o vídeo anterior.</p>` : p.aviso && pronto ? `<p class="pil-aviso">${escape(p.aviso)}</p>` : ''}<div class="pil-acoes">${p.youtube_id ? '<button type="button" class="button" data-pil-editar="1">Editar</button>' : ''}${p.youtube_id ? `<button type="button" class="button" data-pil-capa-ed="${state.pilCapaEd ? 0 : 1}" aria-expanded="${!!state.pilCapaEd}">Trocar capa</button>` : ''}${p.youtube_id && !enviando ? '<label class="button">Trocar vídeo<input type="file" accept="video/*" data-pil-trocar-video class="visually-hidden"></label>' : ''}${p.oculto ? '<button type="button" class="button" data-pil-ocultar="0">Mostrar</button>' : ''}<button type="button" class="button pil-remove" data-pil-remover>Excluir</button></div>${state.pilCapaEd && p.youtube_id ? pilCapaBox(p) : ''}` : '';
    return `<button type="button" class="pil-back" data-pil-voltar><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>Todas as pílulas</button>${player}<section class="pil-info">${p.tema ? `<span class="pil-tema">${escape(p.tema)}</span>` : ''}<h2>${escape(p.titulo)}</h2><p class="pil-meta">${escape([p.passagem, pilData(p.data), p.duracao ? pilTempo(p.duracao) : ''].filter(Boolean).join(' · '))}</p>${pronto ? `<div class="pil-social">${pilCurtirBtn(p, 'is-detalhe')}<button type="button" class="pil-compartilhar" data-pil-compartilhar><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M7.5 7.5 12 3l4.5 4.5"/><path d="M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12"/></svg>Compartilhar</button></div>` : ''}${p.texto ? `<p class="pil-texto">${escape(p.texto)}</p>` : ''}${transc}${acoes}</section>${edit}`;
  }
  function pilProgresso(pct, msg) {
    const u = state.pilUp; if (!u) return; u.pct = pct; if (msg) u.msg = msg;
    const bar = content.querySelector('.pil-up .pil-bar i'), n = content.querySelector('.pil-up-pct strong'), m = content.querySelector('.pil-up-msg');
    if (bar) { bar.style.width = pct + '%'; bar.parentElement.setAttribute('aria-valuenow', pct); } if (n) n.textContent = pct + '%'; if (m && msg) m.textContent = msg;
  }
  function pilMeta(file) {
    return new Promise(res => {
      const v = document.createElement('video'), url = URL.createObjectURL(file); let fim = false;
      const done = m => { if (fim) return; fim = true; URL.revokeObjectURL(url); res(m); };
      setTimeout(() => done({ duracao: 0, vertical: true }), 8000);
      v.preload = 'metadata'; v.muted = true;
      v.onloadedmetadata = () => done({ duracao: Math.round(isFinite(v.duration) ? v.duration : 0), vertical: !(v.videoWidth > v.videoHeight) });
      v.onerror = () => done({ duracao: 0, vertical: true });
      v.src = url;
    });
  }
  const pilMB = b => b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toLocaleString('pt-BR', { maximumFractionDigits: b < 10485760 ? 1 : 0 }) + ' MB';
  const pilResumo = (m, f) => [m.duracao ? pilTempo(m.duracao) + ' de vídeo' : '', pilMB(f.size), m.vertical ? 'vertical' : 'horizontal'].filter(Boolean).join(' · ');
  // Arquivos escolhidos na pílula: foto da capa, vídeo para tirar um quadro da capa, ou vídeo novo para trocar.
  function pilArquivo(input) {
    const f = input.files && input.files[0]; input.value = ''; if (!f) return;
    if (input.matches('[data-pil-capa-foto]')) { pilCapaFoto(f).then(pilCapaUsar).catch(e => announce(e.message, 'warning')); return; }
    if (input.matches('[data-pil-capa-video]')) { pilCapaVidFechar(); state.pilCapaVid = URL.createObjectURL(f); show('pilulas', false, false); return; }
    const p = state.pilVer; if (!p) return;
    if (!confirm('Trocar o vídeo desta pílula por "' + f.name + '"? O título, o tema, a passagem e a capa continuam. O vídeo anterior será apagado do canal do YouTube quando o novo chegar.')) return;
    state.pilFile = f; state.pilMeta = null; pilEnviar(null, { id: p.id, titulo: p.titulo });
  }
  // Vídeo escolhido no cartão do pastor: guarda o arquivo e abre o formulário com a prévia.
  function pilEscolher(input) {
    const f = input.files && input.files[0]; if (!f) return;
    const form = content.querySelector('#pil-form'); if (form) state.pilRasc = { titulo: form.titulo.value, passagem: form.passagem.value, texto: form.texto.value };
    if (state.pilFileUrl) URL.revokeObjectURL(state.pilFileUrl);
    state.pilFile = f; state.pilFileUrl = null; state.pilMeta = null; state.pilForm = true; state.pilUp = null;
    show('pilulas', state.view !== 'pilulas', false);
    pilMeta(f).then(m => { if (state.pilFile !== f) return; state.pilMeta = m; const out = content.querySelector('#pil-info'); if (out) out.textContent = pilResumo(m, f); const pv = content.querySelector('.pil-preview'); if (pv) pv.classList.toggle('is-wide', !m.vertical); });
  }
  async function pilInfo(input) {
    const f = input.files && input.files[0], out = content.querySelector('#pil-info'); if (!f || !out) return;
    const m = await pilMeta(f); out.textContent = [m.duracao ? pilTempo(m.duracao) + ' de vídeo' : '', pilMB(f.size), m.vertical ? 'vertical' : 'horizontal'].filter(Boolean).join(' · ');
  }
  const pilEspera = ms => new Promise(ok => setTimeout(ok, ms));
  // Envio de uma pílula nova (form) ou troca do vídeo de uma pílula publicada (troca = { id, titulo }).
  async function pilEnviar(form, troca) {
    if (state.pilUp && state.pilUp.fase === 'enviando') return;
    const f = state.pilFile; if (!f) { announce('Escolha o vídeo da pílula.', 'warning'); return; }
    const v = form ? new FormData(form) : new FormData(), meta = state.pilMeta || await pilMeta(f);
    if (v.get('tema_outro')) v.set('tema', String(v.get('tema_outro')));
    if (meta.duracao > 1800) { state.pilFile = null; announce('A pílula pode ter até 30 minutos.', 'warning'); return; }
    const notificar = !troca && v.get('notificar') === 'on', capa = troca ? null : state.pilCapa, publicar_em = !troca && v.get('programar') === 'on' ? String(v.get('publicar_em') || '') : '';
    if (!troca && v.get('programar') === 'on' && (!publicar_em || new Date(publicar_em) <= new Date())) { announce('Escolha a data e a hora da publicação, no futuro.', 'warning'); return; }
    state.pilUp = { titulo: troca ? troca.titulo : String(v.get('titulo') || ''), pct: 0, fase: 'enviando', msg: troca ? 'Preparando a troca do vídeo' : 'Preparando o envio', notificar, troca: !!troca }; state.pilForm = false; state.pilRasc = null; state.pilTemaNovo = '';
    if (troca) { state.pilSel = null; state.pilVer = null; state.pilCapaEd = false; }
    if (state.pilFileUrl) { URL.revokeObjectURL(state.pilFileUrl); state.pilFileUrl = null; }
    if (state.view === 'pilulas') show('pilulas', false, false);
    let lock = null; try { lock = await navigator.wakeLock.request('screen'); } catch (_) {}
    const sair = e => { e.preventDefault(); e.returnValue = ''; }; addEventListener('beforeunload', sair);
    try {
      const tipo = f.type || (/\.mov$/i.test(f.name) ? 'video/quicktime' : 'video/mp4');
      const r = await NibConta.pilulas('criar', troca ? { substituir: troca.id, tamanho: f.size, tipo, duracao: meta.duracao, vertical: meta.vertical }
        : { titulo: String(v.get('titulo') || ''), tema: String(v.get('tema') || ''), passagem: String(v.get('passagem') || ''), texto: String(v.get('texto') || ''), notificar, publicar_em, tamanho: f.size, tipo, duracao: meta.duracao, vertical: meta.vertical });
      if (capa) { await NibConta.pilulaCapa(r.id, capa.blob).catch(e => announce('A capa não foi salva (' + e.message + '). Dá para escolher depois, na pílula.', 'warning')); }
      pilCapaLimpar();
      let ini = 0, falhas = 0; pilProgresso(0, 'Enviando o vídeo para o YouTube');
      while (ini < f.size) {
        try {
          const d = await NibConta.pilulaParte(r.id, ini, f.slice(ini, Math.min(f.size, ini + r.parte)));
          falhas = 0; if (d.pronto) { ini = f.size; break; } ini = d.recebido;
          pilProgresso(Math.min(99, Math.floor(ini * 100 / f.size)), 'Enviando o vídeo para o YouTube');
        } catch (e) {
          if (e.status === 409 && typeof e.recebido === 'number') { ini = e.recebido; continue; }
          if ([401, 403, 404, 410, 413].includes(e.status)) throw e;
          if (++falhas > 8) throw new Error('A internet caiu várias vezes. Tente de novo com uma conexão melhor, de preferência no Wi-Fi.');
          pilProgresso(state.pilUp.pct, 'A conexão oscilou. Tentando de novo');
          await pilEspera(Math.min(30000, 2500 * falhas));
          try { const s = await NibConta.pilulas('sincronizar', { id: r.id }); if (s.pronto) { ini = f.size; break; } ini = s.recebido; } catch (_) {}
        }
      }
      Object.assign(state.pilUp, { fase: 'processando', pct: 100, id: r.id }); state.pil = null;
      if (state.view === 'pilulas' && !state.pilSel) show('pilulas', false, false);
      removeEventListener('beforeunload', sair);
      for (let i = 0; i < 40 && state.pilUp && state.pilUp.id === r.id; i++) {
        await pilEspera(i < 6 ? 5000 : 15000);
        const c = await NibConta.pilulas('conferir', { id: r.id }).catch(() => null);
        if (c && c.pilula.estado !== 'processando') { if (state.pilUp && state.pilUp.id === r.id) Object.assign(state.pilUp, { fase: c.pilula.estado, msg: c.pilula.aviso, quando: c.pilula.agendado ? c.pilula.publicar_em : '' }); if (c.pilula.estado === 'publicado') announce(troca ? 'Vídeo da pílula trocado.' : c.pilula.agendado ? 'Pílula pronta e programada.' : 'Pílula publicada para a igreja.', 'success', false); break; }
      }
    } catch (e) { if (state.pilUp) Object.assign(state.pilUp, { fase: 'erro', msg: e.message }); }
    finally { state.pilFile = null; state.pilMeta = null; removeEventListener('beforeunload', sair); if (lock) lock.release().catch(() => {}); state.pil = null; state.pilHomeKey = null; if (state.view === 'pilulas' && !state.pilSel) show('pilulas', false, false); }
  }
