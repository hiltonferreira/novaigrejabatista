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
/* NIB 4.9 — seta no topo da lateral. */
(()=>{'use strict';
 const navigation=document.querySelector('body > .layout > aside');
 const toggle=navigation?.querySelector('.nib-sidebar-toggle');if(!toggle)return;
 const desktop=matchMedia('(min-width:821px)'),key='nib-desktop-menu-collapsed';
 let collapsed=false;try{collapsed=localStorage.getItem(key)==='1';}catch{}
 navigation.id=navigation.id||'nib-desktop-navigation';toggle.setAttribute('aria-controls',navigation.id);
 function render(){const label=collapsed?'Expandir menu lateral':'Recolher menu lateral';document.body.classList.toggle('nib-sidebar-collapsed',collapsed);toggle.setAttribute('aria-expanded',String(!collapsed));toggle.setAttribute('aria-label',label);toggle.title=label;}
 toggle.addEventListener('click',()=>{if(!desktop.matches)return;collapsed=!collapsed;render();try{localStorage.setItem(key,collapsed?'1':'0');}catch{}});
 window.addEventListener('storage',event=>{if(event.key===key){collapsed=event.newValue==='1';render();}});render();
})();/* NIB 4.10 — representacoes compactas dos destinos. */
(()=>{'use strict';
 const sidebar=document.querySelector('body > .layout > aside');if(!sidebar)return;
 const paths={events:'M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h5',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',exit:'M9 4H4v16h5 M9 12h12 M17 8l4 4-4 4'};
 function icon(kind){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.6');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.classList.add('nib-rail-icon');const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',paths[kind]);svg.append(path);return svg;}
 sidebar.querySelectorAll('a[href],form button').forEach(control=>{
  const label=control.textContent.trim();if(!label)return;
  control.setAttribute('aria-label',label);control.title=label;
  const dot=control.querySelector('.nav-dot');
  if(dot){const labels={'mulheres-virtuosas':'MV','nxt-camp':'NX','jornada-dna':'DNA'};const slug=new URL(control.href,location.href).searchParams.get('evento');const initials=label.split(/\s+/).slice(0,2).map(word=>Array.from(word)[0]).join('').toUpperCase();dot.setAttribute('data-rail-label',labels[slug]||initials);dot.setAttribute('aria-hidden','true');}
  else if(!control.querySelector('svg')){const kind=control.tagName==='BUTTON'?'exit':(control.href.includes('configuracoes=')?'settings':'events');control.prepend(icon(kind));}
 });
})();
