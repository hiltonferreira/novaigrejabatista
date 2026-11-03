// Conjunto único de ícones da Plataforma Nib (traço 24 × 24, cantos arredondados).
// Cada assunto tem um só ícone, usado no menu, na barra inferior, nos atalhos e nos painéis.
(function () {
  const user = 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6';
  const calendar = 'M4 5h16v16H4z M8 3v4 M16 3v4 M4 11h16';
  const heart = 'M12 20s-8-4.7-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.3-8 10-8 10z';
  const paths = {
    inicio: 'M3 11l9-8 9 8 M5 10v10h5v-6h4v6h5V10',
    cadastro: user,
    eventos: 'M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4z M15 6v2 M15 11v2 M15 16v2',
    // Célula: uma casa com pessoas dentro.
    celulas: 'M3 10.5 12 3l9 7.5V21H3z M9 14.2a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8z M15 14.2a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8z M5.8 21c0-2.3 1.4-4 3.2-4s3.2 1.7 3.2 4 M11.8 21c0-2.3 1.4-4 3.2-4s3.2 1.7 3.2 4',
    generosidade: heart,
    historico: 'M3 12a9 9 0 1 0 2.6-6.4 M3 4v4h4 M12 7v5l3 2',
    informacoes: 'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z M15 9a4 4 0 0 1 0 6 M18 6a8 8 0 0 1 0 12',
    agenda: calendar,
    caderno: 'M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z M5 17a2 2 0 0 1 2-2h12 M12 12.5s-3-1.8-3-3.8a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2-3 3.8-3 3.8z',
    gestao: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z',
    membresia: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21c0-3.5 3-6 7-6s7 2.5 7 6 M16 11l2 2 4-4',
    recepcao: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h3v3h-3z M20 14v.01 M14 20h3 M20 17v4h-3',
    solicitacoes: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h5',
    programacao: calendar + ' M12 14v4 M10 16h4',
    comunicados: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
    palavra: 'M12 6.5C10.2 5 7.6 4.5 4 4.5v13c3.6 0 6.2.5 8 2 1.8-1.5 4.4-2 8-2v-13c-3.6 0-6.2.5-8 2Z M12 6.5v13',
    // Indicadores do painel
    membros: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21c0-3.5 3-6 7-6s7 2.5 7 6 M16 3.5a4 4 0 0 1 0 7 M22 21c0-2.6-1.6-4.6-4-5.5',
    frequentador: user,
    visitante: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6 M18 15v6 M15 18h6',
    presenca: calendar + ' M9 16l2 2 4-4',
    alerta: 'M12 9v4 M12 17h.01 M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    retorno: 'M9 14 4 9l5-5 M4 9h11a5 5 0 0 1 0 10h-3'
  };
  paths.cuidado = paths.caderno; // Caderno de oração e cuidado pastoral são o mesmo assunto.
  // Versões preenchidas para o item ativo da barra inferior.
  const filled = {
    inicio: 'M12 3 2 11h3v10h5v-7h4v7h5V11h3Z',
    agenda: 'M7 2h2v3h6V2h2v3h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2Zm-2 9v9h14v-9Zm2 2h3v3H7Zm5 0h3v3h-3Z',
    eventos: 'M2 5h20v5a2 2 0 0 0 0 4v5H2v-5a2 2 0 0 0 0-4Zm12 2v2h2V7Zm0 4v2h2v-2Zm0 4v2h2v-2Z',
    generosidade: heart,
    cadastro: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-9 9a9 7 0 0 1 18 0v1H3Z',
    celulas: 'M12 2 2 10v12h20V10ZM9 9.9a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Zm6 0a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4ZM5.6 20.5c.2-2.5 1.6-4.3 3.4-4.3s3.2 1.8 3.4 4.3Zm6.4 0c.2-2.5 1.4-4.3 3-4.3s3.2 1.8 3.4 4.3Z'
  };
  const svg = (key, width = 1.8) => paths[key] ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[key]}"/></svg>` : '';
  window.NibIcons = { paths, filled, svg };
})();
