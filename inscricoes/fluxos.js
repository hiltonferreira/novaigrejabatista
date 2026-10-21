(()=>{
 const form=document.querySelector('.event-editor');if(!form)return;
 let dirty=false,leaving=false,submitting=false;
 const mark=()=>{dirty=true;};form.addEventListener('input',mark);form.addEventListener('change',mark);
 form.addEventListener('submit',e=>{if(!e.defaultPrevented&&form.checkValidity())submitting=true;});
 window.addEventListener('beforeunload',e=>{if(dirty&&!leaving&&!submitting){e.preventDefault();e.returnValue='';}});
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');if(!a||a.target==='_blank'||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  if(dirty&&!submitting){if(!window.confirm('Há alterações não salvas. Deseja sair desta edição e descartá-las?')){e.preventDefault();return;}leaving=true;}
 });
})();
