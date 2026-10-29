const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('eventos/formulario.js','utf8');
function fixture(preview=false){
 const control=()=>({disabled:false,valid:true,value:'preservado',checkValidity(){return this.valid;},reportValidity(){this.reported=true;}});
 const fields=[control(),control(),control()],steps=fields.map(f=>({hidden:false,querySelectorAll:()=>[f],querySelector:()=>({focus(){}})}));
 const button=()=>({hidden:true,addEventListener(name,cb){this[name]=cb;}}),next=[button(),button()],back=[button(),button()];
 const items=steps.map(()=>({classList:{toggle(){}},setAttribute(k,v){this[k]=v;},removeAttribute(k){delete this[k];}}));
 const progress={hidden:true,children:items},form={dataset:{preview:preview?'1':'0'},querySelectorAll(s){return s==='[data-event-step]'?steps:s==='[data-step-next]'?next:s==='[data-step-back]'?back:[...next,...back];},addEventListener(name,cb){this[name]=cb;}};
 vm.runInNewContext(source,{document:{querySelector:s=>s==='[data-event-form]'?form:progress}});
 return {form,steps,next,back,fields,progress};
}
const t=fixture();assert.equal(t.steps[0].hidden,false);assert.equal(t.steps[1].hidden,true);assert.equal(t.progress.hidden,false);
t.fields[0].valid=false;t.next[0].click();assert.equal(t.steps[0].hidden,false);assert.equal(t.fields[0].reported,true);
t.fields[0].valid=true;t.next[0].click();assert.equal(t.steps[1].hidden,false);t.next[1].click();assert.equal(t.steps[2].hidden,false);
t.back[1].click();assert.equal(t.steps[1].hidden,false);assert.equal(t.fields[0].value,'preservado');
t.fields[2].valid=false;let prevented=false;t.form.submit({preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.equal(t.steps[2].hidden,false);assert.equal(t.fields[2].reported,true);
t.fields[2].valid=true;prevented=false;t.form.submit({preventDefault(){prevented=true;}});assert.equal(prevented,false);
const enter=fixture();enter.fields[2].valid=false;let enterPrevented=false;enter.form.submit({preventDefault(){enterPrevented=true;}});assert.equal(enterPrevented,true);assert.equal(enter.steps[1].hidden,false);assert.equal(enter.steps[2].hidden,true);
const preview=fixture(true);assert.equal(preview.form.noValidate,undefined);assert.equal(preview.progress.hidden,true);assert.equal(preview.steps.every(s=>!s.hidden),true);
console.log('OK: etapas pagas, validação, retorno preservando dados, conclusão e prévia sem ativação.');
