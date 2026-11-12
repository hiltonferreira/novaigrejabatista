/* Informações do site da igreja usadas no app (NibSite).
   - Células: lidas da home do site (novaigrejabatista.com.br, seção #celulas). Sem conexão, usa a última lista guardada
     ou a cópia abaixo, tirada da home em 06/11/2026.
   - Eventos: lidos do painel de eventos do site por /app/api/eventos.php (só eventos publicados e futuros).
   - Liderança: a mesma da home do site. */
(function () {
  const SNAPSHOT_CELULAS = [{"dia": "Segunda-feira", "celulas": [{"nome": "Casa de Semeador", "lider": "Líderes: Lucas e Nayana", "local": "Rua Rio Negro, Grandes Áreas", "horario": "19:30 às 21:30", "whatsapp": "https://wa.me/5569984190569?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Casa%20de%20Semeador."}, {"nome": "Renascer", "lider": "Líder: Dieferson", "local": "Rua Machado de Assis, Setor 06", "horario": "19:30 às 21:30", "whatsapp": "https://wa.me/556999266763?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Renascer."}, {"nome": "2 ou +", "lider": "Líderes: Nelson, Débora e Antony", "local": "Rua Paraná, Setor 05, ao lado do Kumon", "horario": "19:40 às 21:40", "whatsapp": "https://wa.me/5569984637235?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%202%20ou%20%2B."}, {"nome": "A Forja", "lider": "Líder: Jonathan", "local": "Rua Presidente Prudente, 2497, Jardim Paulista", "horario": "20:00 às 22:00", "whatsapp": "https://wa.me/5569992835724?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20A%20Forja."}]}, {"dia": "Terça-feira", "celulas": [{"nome": "Ágape", "lider": "Líderes: Sérgio e Val", "local": "Alameda Piquia, Setor 01", "horario": "20:00 às 22:00", "whatsapp": "https://wa.me/5569992910380?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Ágape."}, {"nome": "Boa Semente", "lider": "Líderes: Gilberto e Liliam", "local": "AV. Capitão Silvio, Cond. Villagio Nipote", "horario": "19:30 às 21:30", "whatsapp": "https://wa.me/5569984133298?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Boa%20Semente."}, {"nome": "Casa de Elohim", "lider": "Líderes: Jacque e Ribinho", "local": "Rua Aracaju, Setor 03", "horario": "19:30 às 21:30", "whatsapp": "https://wa.me/556992579289?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Casa%20de%20Elohim."}, {"nome": "Casa de Jetro", "lider": "Líderes: Rodrigo e Ticiana", "local": "Rua Rio Negro, Jardim das Palmeiras", "horario": "19:30 às 21:30", "whatsapp": "https://wa.me/556993228174?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Casa%20de%20Jetro."}, {"nome": "Casa Emanuel", "lider": "Líder: Terezinha", "local": "AV. JK, Fundo Refrigeração São Paulo", "horario": "19:30 às 21:30", "whatsapp": "https://wa.me/5569999966690?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Casa%20Emanuel."}, {"nome": "Filhos de Davi", "lider": "Líderes: Fernando e Yasmin", "local": "Rua Maceió, Setor 03", "horario": "20:30 às 22:30", "whatsapp": "https://wa.me/5569984113315?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Filhos%20de%20Davi."}, {"nome": "Gênesis", "lider": "Líderes: Pr. Alex e Pra. Sheila", "local": "Rua Marabá, Jardim Jorge Teixeira", "horario": "19:30 às 21:30", "whatsapp": "https://wa.me/5569984813665?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Gênesis."}, {"nome": "Gileade", "lider": "Líderes: Toni e Natália", "local": "Rua Beija Flor, Setor 02", "horario": "19:30 às 21:30", "whatsapp": "https://wa.me/5569984110701?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Gileade."}, {"nome": "João 20", "lider": "Líderes: Breno, Élica e Camila", "local": "Rua Matão, Jardim Paulista", "horario": "19:30 às 21:30", "whatsapp": "https://wa.me/5569984081528?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20João%2020."}, {"nome": "Kairós", "lider": "Líderes: Andréia e Filipe", "local": "Rua Natal, Setor 03", "horario": "20:00 às 22:00", "whatsapp": "https://wa.me/5569992593087?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Kairós."}, {"nome": "Sal da Terra", "lider": "Líderes: Luiz e Juliana", "local": "Rua Pimenta Bueno, Setor BNH", "horario": "19:30 às 21:30", "whatsapp": "https://wa.me/5569984447302?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Sal%20da%20Terra."}, {"nome": "Fontes de Águas Vivas", "lider": "Líderes: Aline, Taynara e Walter", "local": "Rua Milão, Jardim Alvorada", "horario": "20:00 às 22:00", "whatsapp": "https://wa.me/556984859950?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Fontes%20de%20Águas%20Vivas."}, {"nome": "Jeová Jireh", "lider": "Líderes: Marlon e Marcia", "local": "Rua Moema, Jardim Jorge Teixeira", "horario": "19:30 às 21:30", "whatsapp": "https://wa.me/5569984443809?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Jeová%20Jireh."}, {"nome": "Monte Ararate", "lider": "Líder: Lindalva", "local": "Rua Tabajara, BNH", "horario": "20:00 às 22:00", "whatsapp": "https://wa.me/556993532978?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Monte%20Ararate."}, {"nome": "Casa de Israel", "lider": "Líderes: Mariana e Gabriel", "local": "Rua Moema, Jardim Jorge Teixeira", "horario": "19:30 às 21:30", "whatsapp": "https://wa.me/5569993691157?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Casa%20de%20Israel."}, {"nome": "Moriah", "lider": "Líderes: Izabel e Borba", "local": "Rua Francisco Alves Pinto, Bom Jesus", "horario": "19:30 às 21:30", "whatsapp": "https://wa.me/556999447006?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Moriah."}, {"nome": "Filhos da Promessa", "lider": "Líder: Pr. Sidiel", "local": "Rua Rio Grande do Norte, Setor 05", "horario": "19:30 às 21:30", "whatsapp": "https://wa.me/5569992441207?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Filhos%20da%20Promessa."}, {"nome": "Betel", "lider": "Líder: Wiriquis", "local": "Rua Castro Alves, 3652, Setor 6", "horario": "20:00 às 22:00", "whatsapp": "https://wa.me/556993535305?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Betel."}]}, {"dia": "Quarta-feira", "celulas": [{"nome": "A Grande Comissão", "lider": "Líder: Netão", "local": "Avenida Corbelha, 2183, Jardim Paraná", "horario": "20:00 às 22:00", "whatsapp": "https://wa.me/5569999631363?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20A%20Grande%20Comissão."}, {"nome": "Casa Leão de Judá", "lider": "Líderes: Maycon e Thais", "local": "Rua Jânio Quadros, Setor 08", "horario": "20:00 às 22:00", "whatsapp": "https://wa.me/556992322397?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Casa%20Leão%20de%20Judá."}]}, {"dia": "Sábado", "celulas": [{"nome": "Vida Plena", "lider": "Líder: Eriquis", "local": "Rua Santa Catarina, Setor 05", "horario": "17:00 às 19:00", "whatsapp": "https://wa.me/5569984082233?text=Ol%C3%A1!%20Quero%20participar%20da%20c%C3%A9lula%20Vida%20Plena."}]}];
  const LIDERANCA = [
    { role: 'Pastor Sênior', name: 'Alex Nogueira', photo: 'assets/lideranca/alex.webp' },
    { role: 'Pastora', name: 'Sheila Nogueira', photo: 'assets/lideranca/sheila.webp' },
    { role: 'Pastor Auxiliar', name: 'Sidiel Castro', photo: 'assets/lideranca/sidiel.webp' }
  ];
  const KEY_CELULAS = 'nib-site-celulas', KEY_EVENTOS = 'nib-site-eventos';
  const read = k => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v; } catch (_) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
  const okCells = d => Array.isArray(d) && d.length > 0 && d.every(x => x && typeof x.dia === 'string' && Array.isArray(x.celulas));
  const okWa = u => typeof u === 'string' && /^https:\/\/wa\.me\/\d{10,13}(\?[^"<>]*)?$/.test(u) ? u : '';
  const clean = (v, n = 160) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);

  let celulas = okCells(read(KEY_CELULAS)) ? read(KEY_CELULAS) : SNAPSHOT_CELULAS;
  let eventos = Array.isArray(read(KEY_EVENTOS)) ? read(KEY_EVENTOS) : null; // null = ainda não carregou
  const listeners = [];
  const changed = () => listeners.forEach(fn => { try { fn(); } catch (_) {} });

  // Lê a seção #celulas da home do site (mesma estrutura de cartões por dia).
  function parseCells(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const sec = doc.getElementById('celulas'); if (!sec) return null;
    const days = [...sec.querySelectorAll('.day-card')].map(card => ({
      dia: clean(card.querySelector('.dc-dia') && card.querySelector('.dc-dia').textContent, 40),
      celulas: [...card.querySelectorAll('.mc')].map(mc => {
        const rows = [...mc.querySelectorAll('.mc-row span')].map(s => clean(s.textContent));
        const a = mc.querySelector('a.mc-wpp');
        return { nome: clean(mc.querySelector('.mc-nome') && mc.querySelector('.mc-nome').textContent, 80), lider: clean(mc.querySelector('.mc-lider') && mc.querySelector('.mc-lider').textContent, 120), local: rows[0] || '', horario: rows[1] || '', whatsapp: okWa(a && a.getAttribute('href')) };
      }).filter(c => c.nome)
    })).filter(d => d.dia && d.celulas.length);
    return okCells(days) ? days : null;
  }
  function normEvent(e) {
    if (!e || typeof e !== 'object' || !e.name || !e.start) return null;
    const url = typeof e.url === 'string' && (/^\/[^/]/.test(e.url) || /^https:\/\//.test(e.url)) ? e.url : '';
    const banner = typeof e.banner === 'string' && /^\/img\/eventos\/[A-Za-z0-9_./-]+\.(png|jpe?g|webp)$/.test(e.banner) ? e.banner : '';
    return { name: clean(e.name, 100), category: clean(e.category, 60), summary: clean(e.summary, 400), start: clean(e.start, 16), end: clean(e.end, 16), tbd: !!e.time_unconfirmed, location: clean(e.location, 160), price: clean(e.price, 40), cta: clean(e.cta, 40) || 'Saiba mais', open: !!e.open, url, banner };
  }
  function load() {
    if (!window.fetch) return;
    const site = location.origin === 'https://novaigrejabatista.com.br' || location.origin === 'https://www.novaigrejabatista.com.br';
    if (!site) return; // fora do endereço oficial (pré-visualização), fica a cópia guardada
    fetch('/', { cache: 'no-cache', credentials: 'omit' }).then(r => r.ok ? r.text() : null).then(t => {
      const d = t && parseCells(t); if (!d) return;
      if (JSON.stringify(d) !== JSON.stringify(celulas)) { celulas = d; write(KEY_CELULAS, d); changed(); }
    }).catch(() => {});
    fetch('api/eventos.php', { cache: 'no-cache', credentials: 'omit' }).then(r => r.ok ? r.json() : null).then(d => {
      if (!d || !Array.isArray(d.eventos)) return;
      const list = d.eventos.map(normEvent).filter(Boolean).slice(0, 20);
      if (JSON.stringify(list) !== JSON.stringify(eventos)) { eventos = list; write(KEY_EVENTOS, list); changed(); }
    }).catch(() => {});
  }
  window.NibSite = {
    celulas: () => celulas,
    totalCelulas: () => celulas.reduce((t, d) => t + d.celulas.length, 0),
    eventos: () => eventos,
    lideranca: () => LIDERANCA,
    onChange: fn => listeners.push(fn),
    load, parseCells
  };
})();
