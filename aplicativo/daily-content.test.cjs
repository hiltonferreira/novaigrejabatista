const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const context={Intl,Date};vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/daily-content.js','utf8'),context);
const daily=context.NibDaily;
test('Dia muda à meia-noite de Porto Velho, não à meia-noite UTC',()=>{assert.equal(daily.dayKey(new Date('2026-11-02T03:59:00Z')),'2026-11-01');assert.equal(daily.dayKey(new Date('2026-11-02T04:00:00Z')),'2026-11-02');});
test('Versículo é estável por dia e tem texto e referência',()=>{const a=daily.verseForDay('2026-11-01');assert.equal(JSON.stringify(a),JSON.stringify(daily.verseForDay('2026-11-01')));assert.ok(a[0].length>10 && a[1].includes(':'));});
test('Agenda trata virada de ano sem incluir datas passadas',()=>{const items=daily.agenda('2026-12-31');assert.ok(items.length>0);assert.ok(items.every(x=>x.day>='2026-12-31'));assert.ok(items.some(x=>x.day.startsWith('2027-01')));assert.ok(items.some(x=>x.name==='Culto da Fé'&&x.time==='19:30'));});
test('NXT inclui dois dias e sai da agenda após a data',()=>{assert.equal(daily.agenda('2026-11-01').filter(x=>x.name==='NXT CAMP').length,2);assert.equal(daily.agenda('2026-11-23').filter(x=>x.name==='NXT CAMP').length,0);});
test('Calendário mensal começa no domingo e contempla ano bissexto',()=>{assert.equal(daily.monthInfo('2026-11').offset,0);assert.equal(daily.monthInfo('2026-12').offset,2);assert.equal(daily.monthInfo('2026-11').count,30);assert.equal(daily.monthInfo('2028-02').count,29);assert.equal(daily.moveMonth('2026-12',1),'2027-01');assert.equal(daily.moveMonth('2027-01',-1),'2026-12');});
test('Calendário mensal não vaza encontros de outros meses',()=>{const nov=daily.monthAgenda('2026-11');assert.ok(nov.every(x=>x.day.startsWith('2026-11')));assert.equal(nov.filter(x=>x.name==='NXT CAMP').length,2);const dec=daily.monthAgenda('2026-12');assert.equal(dec.filter(x=>x.name==='NXT CAMP').length,0);assert.ok(dec.some(x=>x.day==='2026-12-31'&&x.name==='Culto da Fé'));});

test('Lista anual cobre o ano sem repetir e a escolha da igreja tem prioridade',()=>{
  const ctx={Intl,Date};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/verses.js','utf8'),ctx);vm.runInContext(fs.readFileSync(__dirname+'/daily-content.js','utf8'),ctx);
  const d=ctx.NibDaily;assert.ok(ctx.NibVerses.length>=366);
  const seen=new Set();for(let i=0;i<366;i++){const k=new Date(Date.UTC(2028,0,1+i,16)).toISOString().slice(0,10);seen.add(d.verseForDay(k)[1]);}
  assert.equal(seen.size,366);
  assert.equal(new Set(ctx.NibVerses.map(v=>v[1])).size,ctx.NibVerses.length);
  d.setCurated('2026-11-03','Texto escolhido pela igreja para o teste.','Salmos 1:1');assert.equal(d.verseForDay('2026-11-03')[2],'igreja');
  d.setCurated('2026-11-03');assert.equal(d.verseForDay('2026-11-03')[2],undefined);
});
