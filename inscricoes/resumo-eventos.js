(() => {
  'use strict';
  const blocks = [...document.querySelectorAll('.event-summary-metrics')];
  if (!blocks.length || !window.matchMedia || !window.requestAnimationFrame) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const money = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'});
  const integer = new Intl.NumberFormat('pt-BR', {maximumFractionDigits: 0});
  const active = new Set();
  const started = new WeakSet();
  function start(block) {
    if (started.has(block) || reduced.matches) return;
    started.add(block);
    const values = [...block.querySelectorAll('[data-summary-value]')].map(node => {
      const target = Number(node.dataset.summaryValue);
      if (!Number.isSafeInteger(target) || target < 0 || target === 0) return null;
      const finalText = node.textContent;
      const visual = document.createElement('span');
      visual.setAttribute('aria-hidden', 'true');
      const accessible = document.createElement('span');
      accessible.className = 'sr-only';
      accessible.textContent = finalText;
      node.replaceChildren(visual, accessible);
      const format = value => node.dataset.summaryFormat === 'money' ? money.format(value / 100) : integer.format(value);
      visual.textContent = format(0);
      return {target, finalText, visual, format};
    }).filter(Boolean);
    if (!values.length) return;
    let frame = 0;
    let beginning;
    const job = {finish() {
      cancelAnimationFrame(frame);
      values.forEach(value => {value.visual.textContent = value.finalText;});
      active.delete(job);
    }};
    active.add(job);
    function tick(now) {
      if (reduced.matches) {job.finish(); return;}
      if (beginning === undefined) beginning = now;
      const progress = Math.min(1, (now - beginning) / 850);
      const eased = 1 - Math.pow(1 - progress, 3);
      values.forEach(value => {value.visual.textContent = value.format(Math.floor(value.target * eased));});
      if (progress < 1) frame = requestAnimationFrame(tick);
      else job.finish();
    }
    frame = requestAnimationFrame(tick);
  }
  let observer;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {observer.unobserve(entry.target); start(entry.target);}
      });
    }, {threshold: 0.2});
    blocks.forEach(block => observer.observe(block));
  } else blocks.forEach(start);
  const handleMotion = () => {
    if (reduced.matches) {
      if (observer) observer.disconnect();
      [...active].forEach(job => job.finish());
    }
  };
  if (reduced.addEventListener) reduced.addEventListener('change', handleMotion);
})();
