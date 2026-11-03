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
  // Lista anual (verses.js): um versículo por dia do ano, sem repetir. A escolha da igreja para uma data tem prioridade.
  const curated = {};
  // Itens incluídos pela Secretaria (nesta versão de teste, só na sessão).
  const extras = [];
  let extraSeq = 0;
  const addItem = item => { const x = {id:'x'+(++extraSeq), day:item.day, time:item.time||'', name:item.name, type:item.type||'Evento', added:true}; extras.push(x); return x; };
  const removeItem = id => { const i = extras.findIndex(x=>x.id===id); if(i>=0) extras.splice(i,1); };
  const addedItems = () => extras.slice().sort((a,b)=>(a.day+' '+a.time).localeCompare(b.day+' '+b.time));
  const dayOfYear = key => { const [y,m,d] = key.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(y,0,1))/864e5); };
  const verseForDay = key => { if (curated[key]) return curated[key]; const list = scope.NibVerses && scope.NibVerses.length ? scope.NibVerses : verses; return list[dayOfYear(key) % list.length]; };
  const setCurated = (key, text, ref) => { if (text && ref) curated[key] = [text, ref, 'igreja']; else delete curated[key]; };
  const agenda = (key, days = 14) => {
    const base = new Date(key+'T12:00:00-04:00');
    const items = [];
    for(let i=0;i<days;i++){
      const date = new Date(base); date.setUTCDate(base.getUTCDate()+i);
      const day = dayKey(date); const weekday = date.getUTCDay();
      if(weekday===0){items.push({day,time:'09:30',name:'EBS · Escola Bíblica de Sabedoria',type:'Programação semanal'});items.push({day,time:'19:00',name:'Noite de Glória',type:'Culto'});}
      if(weekday===4) items.push({day,time:'19:30',name:'Culto da Fé',type:'Culto'});
    }
    for(const day of ['2026-11-21','2026-11-22']) if(day>=key) items.push({day,time:'',name:'NXT CAMP',type:'Evento',view:'eventos'});
    const last = dayKey(new Date(base.getTime()+(days-1)*864e5));
    for(const x of extras) if(x.day>=key && x.day<=last) items.push({...x});
    return items.sort((a,b)=>(a.day+' '+a.time).localeCompare(b.day+' '+b.time));
  };
  const monthInfo = key => {
    const [year,month] = key.split('-').map(Number);
    const first = new Date(Date.UTC(year,month-1,1,16));
    const count = new Date(Date.UTC(year,month,0,16)).getUTCDate();
    return {count,offset:first.getUTCDay()};
  };
  const moveMonth = (key,step) => {
    const [year,month] = key.split('-').map(Number);
    return dayKey(new Date(Date.UTC(year,month-1+step,1,16))).slice(0,7);
  };
  const monthAgenda = month => agenda(month+'-01',monthInfo(month).count).filter(x=>x.day.startsWith(month));
  scope.NibDaily={dayKey,verseForDay,setCurated,dayOfYear,agenda,monthInfo,moveMonth,monthAgenda,addItem,removeItem,addedItems};
})(typeof window==='undefined'?globalThis:window);
