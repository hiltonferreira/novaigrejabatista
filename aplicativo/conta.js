/* Contas reais do app (NibConta): conversa com /app/api/conta.php.
   Só funciona no endereço oficial. Fora dele (prévia), available() é falso e o app avisa. */
(function () {
  const official = /(^|\.)novaigrejabatista\.com\.br$/.test(location.hostname) || /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && /[?&]contas\b/.test(location.search);
  let pessoa = null;
  async function api(acao, body, arquivo = 'conta') {
    const opt = { credentials: 'same-origin', cache: 'no-store', headers: { 'X-Nib': '1' } };
    if (body !== undefined) { opt.method = 'POST'; opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    let r, d;
    try { r = await fetch('api/' + arquivo + '.php?acao=' + encodeURIComponent(acao.split('&')[0]) + acao.slice(acao.split('&')[0].length), opt); } catch (_) { throw new Error('Sem conexão. Confira a internet e tente de novo.'); }
    try { d = await r.json(); } catch (_) { d = null; }
    if (!r.ok || !d || !d.ok) throw new Error((d && d.erro) || 'Serviço indisponível no momento. Tente de novo em instantes.');
    return d;
  }
  // Marca no aparelho que há uma sessão aberta, para o app abrir direto com o brasão (sem a abertura).
  const lembra = on => { try { if (on) localStorage.setItem('nib-logado', '1'); else localStorage.removeItem('nib-logado'); } catch (_) {} };
  // "Ver o app como" (só para admin): troca apenas o que a tela mostra; o servidor continua usando o papel real.
  // Quem tem mais de um perfil (ou é admin) escolhe com qual ver o app. O servidor continua usando os perfis reais.
  const VER = 'nib-ver-como', ORDEM = ['admin', 'pastoral', 'secretaria', 'tesouraria', 'membro'];
  const papeisReais = () => { if (!pessoa) return []; const l = Array.isArray(pessoa.papeis) && pessoa.papeis.length ? pessoa.papeis : [pessoa.papel || 'membro']; return ORDEM.filter(k => l.includes(k)); };
  const principal = () => papeisReais()[0] || '';
  // Opções do seletor: admin vê todos os perfis com telas; os demais, os próprios perfis com telas e Membro.
  const opcoes = () => {
    const r = papeisReais(); if (!r.length) return [];
    if (r.includes('admin')) return ['admin', 'pastoral', 'secretaria', 'membro'];
    const o = ['pastoral', 'secretaria'].filter(k => r.includes(k));
    return r.length > 1 && o.length ? o.concat('membro') : [];
  };
  const verComo = () => { const o = opcoes(); if (o.length < 2) return ''; try { const v = localStorage.getItem(VER) || ''; return o.includes(v) && v !== o[0] ? v : ''; } catch (_) { return ''; } };
  const tem = quais => { const v = verComo(); return v ? quais.includes(v) : papeisReais().some(k => quais.includes(k)); };
  const set = d => { if (d && 'pessoa' in d) { pessoa = d.pessoa; lembra(!!pessoa); } return pessoa; };
  window.NibConta = {
    available: () => official,
    pessoa: () => !pessoa ? pessoa : verComo() ? Object.assign({}, pessoa, { papel: verComo(), papeis: [verComo()], papelReal: principal() }) : Object.assign({}, pessoa, { papel: principal(), papeis: papeisReais() }),
    papelReal: () => principal(),
    papeisReais,
    opcoesPerfil: opcoes,
    verComo,
    definirVerComo: v => { try { const o = opcoes(); if (o.includes(v) && v !== o[0]) localStorage.setItem(VER, v); else localStorage.removeItem(VER); } catch (_) {} },
    checkin: async (acao, body) => api(acao, body, 'checkin'),
    sugestao: async body => api('sugestao', body),
    sugestoes: async () => (await api('sugestoes')).sugestoes,
    sugestaoLida: async (id, lida) => api('sugestao-lida', { id, lida }),
    lideranca: () => tem(['pastoral', 'admin']),
    equipe: () => tem(['secretaria', 'pastoral', 'admin']),
    exporta: () => tem(['secretaria', 'admin']),
    eu: async () => { if (!official) return null; try { return set(await api('eu')); } catch (_) { return pessoa; } },
    entrar: async (login, senha) => set(await api('entrar', { login, senha })),
    cadastrar: async dados => set(await api('cadastro', dados)),
    logado: () => { try { return localStorage.getItem('nib-logado') === '1'; } catch (_) { return false; } },
    sair: async () => { try { await api('sair', {}); } finally { pessoa = null; lembra(false); try { localStorage.removeItem(VER); } catch (_) {} } },
    atualizar: async dados => set(await api('atualizar', dados)),
    senha: async (atual, nova) => api('senha', { atual, nova }),
    esqueci: async email => api('esqueci', { email }),
    redefinir: async (token, senha) => set(await api('redefinir', { token, senha })),
    excluir: async senha => { await api('excluir', { senha }); pessoa = null; },
    cadastros: async () => (await api('cadastros')).pessoas,
    confirmar: async (id, status) => api('confirmar', { id, status }),
    equipePainel: async () => (await api('equipe-painel')).painel,
    membros: async () => api('membros'),
    membresia: async () => api('membresia'),
    mudarPapeis: async (id, papeis) => api('papel', { id, papeis }),
    membresiaEtapa: async (id, etapa) => api('membresia-etapa', { id, etapa }),
    membrosExportados: async body => api('membros-exportados', body),
    caderno: async (acao, body) => api(acao, body, 'caderno'),
    inscricoes: async () => api('inscricoes'),
    avisos: async (acao, body) => api(acao, body, 'avisos'),
    pilulas: async (acao, body) => api(acao, body, 'pilulas'),
    youtube: async (acao, body) => api(acao, body, 'youtube'),
    // Uma parte do vídeo da pílula (corpo binário). O erro leva o código HTTP e, se houver, quanto já chegou.
    pilulaParte: async (id, inicio, parte) => {
      let r, d;
      try { r = await fetch('api/pilulas.php?acao=parte&id=' + id + '&inicio=' + inicio, { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'X-Nib': '1', 'Content-Type': 'application/octet-stream' }, body: parte }); }
      catch (_) { const e = new Error('Sem conexão. Confira a internet.'); e.status = 0; throw e; }
      try { d = await r.json(); } catch (_) { d = null; }
      if (!r.ok || !d || !d.ok) { const e = new Error((d && d.erro) || 'Falha no envio.'); e.status = r.status; e.recebido = d && typeof d.recebido === 'number' ? d.recebido : null; throw e; }
      return d;
    },
    // Capa da pílula (imagem em binário). Sem imagem, volta para a miniatura automática do YouTube.
    pilulaCapa: async (id, imagem) => {
      let r, d;
      try { r = await fetch('api/pilulas.php?acao=capa&id=' + id + (imagem ? '' : '&remover=1'), { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'X-Nib': '1', 'Content-Type': imagem ? (imagem.type || 'image/jpeg') : 'application/octet-stream' }, body: imagem || '' }); }
      catch (_) { throw new Error('Sem conexão. Confira a internet.'); }
      try { d = await r.json(); } catch (_) { d = null; }
      if (!r.ok || !d || !d.ok) throw new Error((d && d.erro) || 'Não foi possível salvar a capa.');
      return d;
    },
    pushChave: async () => (await api('push-chave')).chave,
    push: async (acao, body) => api(acao, body),
    pushEstado: async endpoint => api('push-estado&endpoint=' + encodeURIComponent(endpoint))
  };
})();
