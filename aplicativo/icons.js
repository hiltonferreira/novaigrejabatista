// Conjunto único de ícones da Plataforma Nib (traço 24 × 24, cantos arredondados).
// Cada assunto tem um só ícone, usado no menu, na barra inferior, nos atalhos e nos painéis.
(function () {
  const user = 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6';
  const calendar = 'M4 5h16v16H4z M8 3v4 M16 3v4 M4 11h16';
  const heart = 'M12 20s-8-4.7-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.3-8 10-8 10z';
  const paths = {
    inicio: 'M3 11l9-8 9 8 M5 10v10h5v-6h4v6h5V10',
    // Sugestões: balão de conversa com lâmpada.
    sugestoes: 'M4 4h16v12H9l-5 4z M12 7.2a2.6 2.6 0 0 0-1.5 4.7v.9h3v-.9A2.6 2.6 0 0 0 12 7.2z M11 14.2h2',
    cadastro: user,
    eventos: 'M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4z M15 6v2 M15 11v2 M15 16v2',
    // Célula: meia casa que se completa com duas pessoas.
    celulas: 'M13.2 4.4 12 3 3 10.5V21h3.9 M10 14.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z M6.9 21c0-2.7 1.4-4.6 3.1-4.6s3.1 1.9 3.1 4.6 M16.8 12.5a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2z M13.2 21c0-3.3 1.6-5.6 3.6-5.6s3.6 2.3 3.6 5.6',
    generosidade: heart,
    historico: 'M3 12a9 9 0 1 0 2.6-6.4 M3 4v4h4 M12 7v5l3 2',
    informacoes: 'M4 5h16v16H4z M8 3v4 M16 3v4 M4 9h16 M8 13h1 M11 13h5 M8 17h1 M11 17h5',
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
    telefone: 'M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z',
    whatsapp: 'M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9a5 5 0 0 1-2.4-2.4l.9-1-1-2z',
    email: 'M3 5h18v14H3z M3 6l9 7 9-7',
    membros: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21c0-3.5 3-6 7-6s7 2.5 7 6 M16 3.5a4 4 0 0 1 0 7 M22 21c0-2.6-1.6-4.6-4-5.5',
    frequentador: user,
    visitante: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6 M18 15v6 M15 18h6',
    presenca: calendar + ' M9 16l2 2 4-4',
    alerta: 'M12 9v4 M12 17h.01 M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    retorno: 'M9 14 4 9l5-5 M4 9h11a5 5 0 0 1 0 10h-3',
    // Tesouraria
    conferencia: 'M3 10h18 M12 3l9 5H3z M5 10v7 M9 10v7 M15 10v4 M3 21h10 M16 19l2 2 4-4',
    lancamentos: 'M5 4h14v17H5z M8 8h8 M8 12h8 M8 16h5',
    fechamento: 'M6 11h12v10H6z M8 11V7a4 4 0 0 1 8 0v4 M12 15v2',
    saidas: 'M3 8h18v12H3z M16 14h2 M12 2v4 M9.5 4.5 12 2l2.5 2.5',
    orcamento: 'M21 12A9 9 0 1 1 12 3v9z M15 3.5A9 9 0 0 1 20.5 9H15z',
    contribuintes: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21c0-3.5 3-6 7-6s7 2.5 7 6 M16 6h6 M16 10h6 M18 14h4',
    relatorios: 'M5 3h14v18H5z M9 17v-4 M12 17V9 M15 17v-6',
    aprovacoes: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 14l2 2 4-4'
  };
  paths.cuidado = paths.caderno; // Caderno de oração e cuidado pastoral são o mesmo assunto.
  // Versões preenchidas para o item ativo da barra inferior.
  const filled = {
    inicio: 'M12 3 2 11h3v10h5v-7h4v7h5V11h3Z',
    agenda: 'M7 2h2v3h6V2h2v3h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2Zm-2 9v9h14v-9Zm2 2h3v3H7Zm5 0h3v3h-3Z',
    eventos: 'M2 5h20v5a2 2 0 0 0 0 4v5H2v-5a2 2 0 0 0 0-4Zm12 2v2h2V7Zm0 4v2h2v-2Zm0 4v2h2v-2Z',
    generosidade: heart,
    cadastro: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-9 9a9 7 0 0 1 18 0v1H3Z'
  };
  // Ícones mistos no item ativo: parte em traço e parte preenchida (célula: a casa em traço, as duas pessoas cheias).
  const mixed = {
    celulas: { stroke: 'M13.2 4.4 12 3 3 10.5V21h3.9', fill: 'M10 14.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z M6.9 21c0-2.7 1.4-4.6 3.1-4.6s3.1 1.9 3.1 4.6z M16.8 12.5a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2z M13.2 21c0-3.3 1.6-5.6 3.6-5.6s3.6 2.3 3.6 5.6z' },
    gestao: { fill: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z' },
    membresia: { fill: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21c0-3.5 3-6 7-6s7 2.5 7 6z', stroke: 'M16 11l2 2 4-4' },
    membros: { fill: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21c0-3.5 3-6 7-6s7 2.5 7 6z', stroke: 'M16 3.5a4 4 0 0 1 0 7 M22 21c0-2.6-1.6-4.6-4-5.5' },
    solicitacoes: { fill: 'M6 3h9l4 4v14H6z', cut: 'M9 12h7 M9 16h5' },
    programacao: { fill: 'M4 5h16v16H4z', stroke: 'M8 3v4 M16 3v4', cut: 'M4 10.5h16 M12 13.5v4.5 M9.8 15.8h4.4' },
    comunicados: { fill: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9z', stroke: 'M10 21h4' },
    cuidado: { fill: 'M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z', cut: 'M5 17a2 2 0 0 1 2-2h12 M12 12.5s-3-1.8-3-3.8a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2-3 3.8-3 3.8z' },
    palavra: { fill: 'M12 6.5C10.2 5 7.6 4.5 4 4.5v13c3.6 0 6.2.5 8 2 1.8-1.5 4.4-2 8-2v-13c-3.6 0-6.2.5-8 2Z', cut: 'M12 7v12' },
    conferencia: { fill: 'M12 3l9 5H3z M4 10h2v7H4z M8 10h2v7H8z M14 10h2v4h-2z', stroke: 'M3 21h10 M16 19l2 2 4-4' },
    lancamentos: { fill: 'M5 4h14v17H5z', cut: 'M8 8h8 M8 12h8 M8 16h5' },
    saidas: { fill: 'M3 8h18v12H3z', stroke: 'M12 2v4 M9.5 4.5 12 2l2.5 2.5', cut: 'M15.5 14h2.5' }
  };
  mixed.caderno = mixed.cuidado;
  Object.assign(mixed, {
    historico: { fill: 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z', cut: 'M12 7.5v4.5l3 2' },
    informacoes: { fill: 'M4 5h16v16H4z', stroke: 'M8 3v4 M16 3v4', cut: 'M4 9.5h16 M8 13h1 M11 13h5 M8 17h1 M11 17h5' },
    recepcao: { fill: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h3v3h-3z', stroke: 'M20 14v.01 M14 20h3 M20 17v4h-3' },
    aprovacoes: { fill: 'M6 3h9l4 4v14H6z', cut: 'M9 14l2 2 4-4' },
    orcamento: { fill: 'M21 12A9 9 0 1 1 12 3v9z M15 3.5A9 9 0 0 1 20.5 9H15z' },
    contribuintes: { fill: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21c0-3.5 3-6 7-6s7 2.5 7 6z', stroke: 'M16 6h6 M16 10h6 M18 14h4' },
    relatorios: { fill: 'M5 3h14v18H5z', cut: 'M9 17v-4 M12 17V9 M15 17v-6' },
    fechamento: { fill: 'M6 11h12v10H6z', stroke: 'M8 11V7a4 4 0 0 1 8 0v4', cut: 'M12 15v2' }
  });

  const svg = (key, width = 1.8) => paths[key] ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[key]}"/></svg>` : '';
  window.NibIcons = { paths, filled, mixed, svg };
})();
