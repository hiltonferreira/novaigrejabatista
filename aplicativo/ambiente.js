/* Ambiente do app. Em /app-teste/ (versão de teste, pedido de Hilton em 28/11/2026) o navegador é o mesmo do app
   oficial, então os dados guardados no aparelho (localStorage) ganham o prefixo "teste:" para o teste nunca mexer
   no que o app oficial guardou (sessão lembrada, perfil escolhido, avisos vistos...). Carregado antes de tudo. */
(function () {
  var teste = /^\/app-teste\//.test(location.pathname);
  document.documentElement.dataset.ambiente = teste ? 'teste' : 'oficial';
  if (!teste) return;
  try {
    var ls = window.localStorage, P = 'teste:';
    var get = ls.getItem.bind(ls), set = ls.setItem.bind(ls), del = ls.removeItem.bind(ls);
    Object.defineProperty(ls, 'getItem', { value: function (k) { return get(P + k); } });
    Object.defineProperty(ls, 'setItem', { value: function (k, v) { return set(P + k, v); } });
    Object.defineProperty(ls, 'removeItem', { value: function (k) { return del(P + k); } });
  } catch (_) {}
})();
