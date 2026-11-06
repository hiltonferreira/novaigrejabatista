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
  const set = d => { if (d && 'pessoa' in d) pessoa = d.pessoa; return pessoa; };
  window.NibConta = {
    available: () => official,
    pessoa: () => pessoa,
    equipe: () => !!pessoa && ['secretaria', 'pastoral', 'admin'].includes(pessoa.papel),
    eu: async () => { if (!official) return null; try { return set(await api('eu')); } catch (_) { return pessoa; } },
    entrar: async (login, senha) => set(await api('entrar', { login, senha })),
    cadastrar: async dados => set(await api('cadastro', dados)),
    sair: async () => { try { await api('sair', {}); } finally { pessoa = null; } },
    atualizar: async dados => set(await api('atualizar', dados)),
    senha: async (atual, nova) => api('senha', { atual, nova }),
    esqueci: async email => api('esqueci', { email }),
    redefinir: async (token, senha) => set(await api('redefinir', { token, senha })),
    excluir: async senha => { await api('excluir', { senha }); pessoa = null; },
    cadastros: async () => (await api('cadastros')).pessoas,
    confirmar: async (id, status) => api('confirmar', { id, status }),
    caderno: async (acao, body) => api(acao, body, 'caderno'),
    inscricoes: async () => api('inscricoes'),
    avisos: async (acao, body) => api(acao, body, 'avisos'),
    pushChave: async () => (await api('push-chave')).chave,
    push: async (acao, body) => api(acao, body),
    pushEstado: async endpoint => api('push-estado&endpoint=' + encodeURIComponent(endpoint))
  };
})();
