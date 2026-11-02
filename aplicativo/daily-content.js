/* Conteúdo público de referência; sem API ou dados pessoais. */
(function(scope){
  const verses = [
    ['O Senhor é o meu pastor; nada me faltará.', 'Salmos 23:1'],
    ['Orai sem cessar.', '1 Tessalonicenses 5:17'],
    ['Todas as vossas coisas sejam feitas com amor.', '1 Coríntios 16:14'],
    ['O meu socorro vem do Senhor, que fez o céu e a terra.', 'Salmos 121:2'],
    ['Alegrai-vos sempre no Senhor; outra vez digo, alegrai-vos.', 'Filipenses 4:4'],
    ['Entrega o teu caminho ao Senhor; confia nele, e ele o fará.', 'Salmos 37:5'],
    ['Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.', 'Salmos 119:105']
  ];
  const dayKey = date => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Porto_Velho',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
  const verseForDay = key => verses[[...key].reduce((hash,c)=>(hash*31+c.charCodeAt(0))>>>0,0)%verses.length];
  const agenda = key => {
    const base = new Date(key+'T12:00:00-04:00');
    const items = [];
    for(let i=0;i<14;i++){
      const date = new Date(base); date.setUTCDate(base.getUTCDate()+i);
      const day = dayKey(date); const weekday = date.getUTCDay();
      if(weekday===0){items.push({day,time:'09:30',name:'EBS · Escola Bíblica de Sabedoria',type:'Programação semanal'});items.push({day,time:'19:00',name:'Noite de Glória',type:'Culto'});}
      if(weekday===4) items.push({day,time:'19:30',name:'Culto da Fé',type:'Culto'});
    }
    for(const day of ['2026-11-21','2026-11-22']) if(day>=key) items.push({day,time:'',name:'NXT CAMP',type:'Evento',view:'eventos'});
    return items.sort((a,b)=>(a.day+' '+a.time).localeCompare(b.day+' '+b.time));
  };
  scope.NibDaily={dayKey,verseForDay,agenda};
})(typeof window==='undefined'?globalThis:window);
