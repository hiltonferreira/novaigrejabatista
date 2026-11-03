const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/../index.html','utf8');
const start=source.indexOf('/* construção: percentual + barra animam');
const end=source.indexOf('/* vídeo da construção:',start);
const script=source.slice(start,end);
async function run(payload,{ok=true,fail=false,reduced=false}={}){
 const pct={dataset:{target:'30'},textContent:'30%'};
 const fill={dataset:{width:'30%'},style:{width:'30%'}};
 const stats=['concluído','lugares','entrega'].map((label,i)=>({num:{textContent:['30%','1.500','2028'][i]},txt:{textContent:label},querySelector(q){return q==='.cs-num'?this.num:this.txt;}}));
 const section={querySelector:q=>q==='.cp-pct'?pct:fill,querySelectorAll:()=>stats};
 let observe,frame;
 const context={document:{getElementById:()=>section},window:{matchMedia:()=>({matches:reduced})},fetch:()=>fail?Promise.reject(new Error('offline')):Promise.resolve({ok,json:()=>Promise.resolve(payload)}),performance:{now:()=>0},requestAnimationFrame:f=>(frame=f,1),cancelAnimationFrame:()=>{},IntersectionObserver:class{constructor(cb){observe=cb;}observe(){}},Number,String,Math};
 vm.runInNewContext(script,context);
 await new Promise(setImmediate);await new Promise(setImmediate);
 if(!reduced){observe([{isIntersecting:true}]);frame(2000);}
 return {target:pct.dataset.target,text:pct.textContent,width:fill.style.width,stats:stats.map(x=>x.num.textContent)};
}
test('Atualiza contador, barra e dados da obra pelo JSON',async()=>{const r=await run({percentual:35,lugares:'1.600',entrega:'2029'});assert.deepEqual(r,{target:'35',text:'35%',width:'35%',stats:['35%','1.600','2029']});});
test('Atualiza sem animação quando movimento reduzido está ativo',async()=>{assert.equal((await run({percentual:42},{reduced:true})).text,'42%');});
test('Zero é um percentual válido',async()=>{assert.equal((await run({percentual:0})).text,'0%');});
test('Falha de rede e HTTP preservam o fallback HTML',async()=>{for(const opts of [{fail:true},{ok:false}]){const r=await run(null,opts);assert.equal(r.text,'30%');assert.equal(r.width,'30%');assert.equal(r.stats[0],'30%');}});
test('JSON ausente, inválido ou fora da faixa preserva o fallback',async()=>{for(const payload of [null,{},[],{percentual:null},{percentual:''},{percentual:' '},{percentual:false},{percentual:'abc'},{percentual:-1},{percentual:101}])assert.equal((await run(payload)).text,'30%');});
