(()=>{'use strict';
 const menu=document.querySelector('body > .mobile-menu');
 if(!menu)return;
 const header=document.querySelector('body > header'),summary=menu.querySelector('summary'),content=menu.querySelector('.mobile-menu-content');
 if(!summary||!content)return;
 const mobile=matchMedia('(max-width:820px)'),root=document.documentElement;
 const backdrop=document.createElement('button');
 backdrop.type='button';backdrop.className='nib-menu-backdrop';backdrop.hidden=true;backdrop.tabIndex=-1;backdrop.setAttribute('aria-label','Fechar menu de navegação');document.body.append(backdrop);
 content.id=content.id||'nib-navigation-content';summary.setAttribute('aria-controls',content.id);
 let locked=false,scrollY=0,previousTop='',inertElements=[];
 const measure=()=>{root.style.setProperty('--nib-header-height',`${header?header.getBoundingClientRect().height:0}px`);root.style.setProperty('--nib-menu-height',`${summary.getBoundingClientRect().height}px`);};
 const close=(focus=true)=>{menu.open=false;sync();if(focus)summary.focus();};
 function sync(){
  const open=mobile.matches&&menu.open;
  summary.setAttribute('aria-expanded',String(open));backdrop.hidden=!open;
  if(open&&!locked){
   measure();scrollY=window.scrollY;previousTop=document.body.style.top;locked=true;
   document.body.style.top=`-${scrollY}px`;document.body.classList.add('nib-navigation-open');
   inertElements=[...document.body.children].filter(el=>el!==menu&&el!==backdrop&&!el.inert&& !['SCRIPT','STYLE','LINK'].includes(el.tagName));
   inertElements.forEach(el=>el.inert=true);
  }else if(!open&&locked){
   locked=false;inertElements.forEach(el=>el.inert=false);inertElements=[];
   document.body.classList.remove('nib-navigation-open');document.body.style.top=previousTop;
   const behavior=root.style.scrollBehavior;root.style.scrollBehavior='auto';window.scrollTo(0,scrollY);root.style.scrollBehavior=behavior;
  }
 }
 menu.addEventListener('toggle',sync);backdrop.addEventListener('click',()=>close());
 menu.addEventListener('click',e=>{if(e.target.closest('.mobile-menu-content a[href]'))close(false);});
 document.addEventListener('keydown',e=>{
  if(!locked)return;
  if(e.key==='Escape'){e.preventDefault();close();return;}
  if(e.key!=='Tab')return;
  const items=[summary,...content.querySelectorAll('a[href],button:not([disabled]),input:not([type="hidden"]):not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length);
  const first=items[0],last=items[items.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });
 mobile.addEventListener('change',()=>{if(!mobile.matches)menu.open=false;sync();measure();});
 window.addEventListener('pageshow',()=>{menu.open=false;sync();measure();});
 window.addEventListener('resize',measure,{passive:true});
 if('ResizeObserver'in window){const observer=new ResizeObserver(measure);if(header)observer.observe(header);observer.observe(summary);}
 measure();sync();
})();
