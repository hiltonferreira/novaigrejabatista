(()=>{
  const root=document.querySelector('[data-event-carousel]');
  if(!root)return;
  let slides=[...root.querySelectorAll('[data-event-slide]')];
  let dots=[...document.querySelectorAll('[data-event-dot]')];
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index=Math.max(0,slides.findIndex(s=>s.classList.contains('is-active')));
  let timer=null,startX=0,startY=0;
  const sync=(to)=>{
    if(!slides.length)return;
    to=(to+slides.length)%slides.length;
    if(to===index)return;
    const current=slides[index],target=slides[to];
    current.classList.remove('is-active');current.classList.add('is-leaving');current.setAttribute('aria-hidden','true');
    target.classList.remove('is-leaving');target.classList.add('is-active');target.setAttribute('aria-hidden','false');
    slides.forEach((s,i)=>{if(i!==to&&i!==index)s.classList.remove('is-active','is-leaving')});
    dots.forEach((dot,i)=>{const active=i===to;dot.classList.toggle('is-active',active);dot.setAttribute('aria-current',active?'true':'false')});
    index=to;window.setTimeout(()=>current.classList.remove('is-leaving'),reduce?0:650);
  };
  const next=()=>sync(index+1),prev=()=>sync(index-1);
  const stop=()=>{if(timer){clearInterval(timer);timer=null}};
  const start=()=>{stop();if(!reduce&&slides.length>1)timer=setInterval(next,7000)};
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>{sync(dots.indexOf(dot));start()}));
  root.addEventListener('mouseenter',stop);root.addEventListener('mouseleave',start);
  root.addEventListener('focusin',stop);root.addEventListener('focusout',start);
  root.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;startX=e.touches[0].clientX;startY=e.touches[0].clientY;stop()},{passive:true});
  root.addEventListener('touchend',e=>{if(!e.changedTouches.length){start();return}const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2)(dx<0?next:prev)();start()},{passive:true});
  root.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();next();start()}if(e.key==='ArrowLeft'){e.preventDefault();prev();start()}});
  document.addEventListener('nib:carousel-refresh',()=>{stop();slides=[...root.querySelectorAll('[data-event-slide]')].filter(s=>!s.hidden);dots=[...document.querySelectorAll('[data-event-dot]')].filter(s=>!s.hidden);index=Math.max(0,slides.findIndex(s=>s.classList.contains('is-active')));slides.forEach((s,i)=>{s.classList.toggle('is-active',i===index);s.setAttribute('aria-hidden',i===index?'false':'true');});dots.forEach((d,i)=>{d.classList.toggle('is-active',i===index);d.setAttribute('aria-current',i===index?'true':'false');});start();});
  start();
})();

