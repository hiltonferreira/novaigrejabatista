(()=>{
  const root=document.querySelector('[data-event-carousel]');
  if(!root)return;

  /* v7 — NXT CAMP primeiro + navegação sem setas: abas + swipe + autoplay */
  const style=document.createElement('style');
  style.textContent=`
    /* Remove completamente as setas do carrossel. */
    #mulheres-virtuosas .event-carousel-btn{display:none!important}

    /* Ordem visual das abas: NXT CAMP primeiro, Mulheres depois. */
    #mulheres-virtuosas .event-carousel-dot:nth-child(1)::before{content:'NXT Camp'!important}
    #mulheres-virtuosas .event-carousel-dot:nth-child(2)::before{content:'Mulheres'!important}

    /* Deixa o seletor realmente abaixo da arte, sem sobreposição. */
    #mulheres-virtuosas .event-carousel-dots{
      top:calc(124px + min(24vw,299px))!important;
    }
    @media(max-width:820px){
      #mulheres-virtuosas .mv-event-grid{gap:88px!important}
      #mulheres-virtuosas .event-carousel-dots{
        top:calc(50px + 50.04vw)!important;
      }
    }
    @media(max-width:520px){
      #mulheres-virtuosas .mv-event-grid{gap:82px!important}
      #mulheres-virtuosas .event-carousel-dots{
        top:calc(48px + 50.04vw)!important;
      }
    }
  `;
  document.head.appendChild(style);

  const nxtCta=[...document.querySelectorAll('.nxt-event-copy .mv-event-cta')][0];
  if(nxtCta)nxtCta.textContent='EU VOU PRO NXT CAMP';

  /*
    A marcação original mantém Mulheres primeiro para preservar o histórico do HTML.
    No preview, reorganizamos o DOM antes de inicializar o carrossel para que:
    1) NXT CAMP seja o primeiro slide;
    2) NXT CAMP abra ativo;
    3) a primeira aba seja NXT CAMP;
    4) autoplay, swipe e teclado sigam a mesma ordem.
  */
  const initialSlides=[...root.querySelectorAll('[data-event-slide]')];
  const nxtSlide=initialSlides.find(slide=>(slide.getAttribute('aria-label')||'').includes('NXT CAMP'));
  const mulheresSlide=initialSlides.find(slide=>(slide.getAttribute('aria-label')||'').includes('Mulheres Virtuosas'));
  if(nxtSlide&&mulheresSlide){
    root.append(nxtSlide,mulheresSlide);
  }

  const dotsWrap=document.querySelector('.event-carousel-dots');
  if(dotsWrap){
    const initialDots=[...dotsWrap.querySelectorAll('[data-event-dot]')];
    const nxtDot=initialDots.find(dot=>(dot.getAttribute('aria-label')||'').includes('NXT CAMP'));
    const mulheresDot=initialDots.find(dot=>(dot.getAttribute('aria-label')||'').includes('Mulheres Virtuosas'));
    if(nxtDot&&mulheresDot)dotsWrap.append(nxtDot,mulheresDot);
  }

  const slides=[...root.querySelectorAll('[data-event-slide]')];
  const dots=[...document.querySelectorAll('[data-event-dot]')];
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Garante o estado inicial coerente depois da inversão. */
  slides.forEach((slide,i)=>{
    const active=i===0;
    slide.classList.toggle('is-active',active);
    slide.classList.remove('is-leaving');
    slide.setAttribute('aria-hidden',active?'false':'true');
    const name=(slide.getAttribute('aria-label')||'').includes('NXT CAMP')?'NXT CAMP 2026':'Mulheres Virtuosas';
    slide.setAttribute('aria-label',`${i+1} de ${slides.length} · ${name}`);
  });
  dots.forEach((dot,i)=>{
    const active=i===0;
    dot.classList.toggle('is-active',active);
    dot.setAttribute('aria-current',active?'true':'false');
  });

  let index=0;
  let timer=null;
  let startX=0;
  let startY=0;

  const sync=(to,dir=1)=>{
    if(!slides.length)return;
    to=(to+slides.length)%slides.length;
    if(to===index)return;

    const current=slides[index];
    const target=slides[to];
    current.classList.remove('is-active');
    current.classList.add('is-leaving');
    current.setAttribute('aria-hidden','true');

    target.classList.remove('is-leaving');
    target.classList.add('is-active');
    target.setAttribute('aria-hidden','false');

    slides.forEach((s,i)=>{
      if(i!==to&&i!==index)s.classList.remove('is-active','is-leaving');
    });

    dots.forEach((dot,i)=>{
      const active=i===to;
      dot.classList.toggle('is-active',active);
      dot.setAttribute('aria-current',active?'true':'false');
    });

    index=to;
    window.setTimeout(()=>current.classList.remove('is-leaving'),reduce?0:650);
  };

  const goNext=()=>sync(index+1,1);
  const goPrev=()=>sync(index-1,-1);

  const stop=()=>{if(timer){clearInterval(timer);timer=null;}};
  const start=()=>{
    stop();
    if(reduce||slides.length<2)return;
    timer=setInterval(goNext,7000);
  };

  dots.forEach((dot,i)=>dot.addEventListener('click',()=>{sync(i,i>index?1:-1);start();}));

  root.addEventListener('mouseenter',stop);
  root.addEventListener('mouseleave',start);
  root.addEventListener('focusin',stop);
  root.addEventListener('focusout',start);

  root.addEventListener('touchstart',e=>{
    if(e.touches.length!==1)return;
    startX=e.touches[0].clientX;
    startY=e.touches[0].clientY;
    stop();
  },{passive:true});

  root.addEventListener('touchend',e=>{
    if(!e.changedTouches.length){start();return;}
    const dx=e.changedTouches[0].clientX-startX;
    const dy=e.changedTouches[0].clientY-startY;
    if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2){
      dx<0?goNext():goPrev();
    }
    start();
  },{passive:true});

  root.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){e.preventDefault();goNext();start();}
    if(e.key==='ArrowLeft'){e.preventDefault();goPrev();start();}
  });

  start();
})();
