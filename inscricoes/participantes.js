(()=>{
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-archive-toggle]');if(!button)return;
  const panel=document.getElementById(button.getAttribute('aria-controls'));if(!panel)return;
  const opening=panel.hidden;panel.hidden=!opening;button.setAttribute('aria-expanded',String(opening));
  if(!opening){const confirm=panel.querySelector('input[name="confirm_delete"]');if(confirm)confirm.checked=false;}
 });
})();
