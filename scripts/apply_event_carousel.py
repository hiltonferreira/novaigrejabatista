from pathlib import Path
import re

p = Path('index.html')
html = p.read_text(encoding='utf-8')

html = html.replace(
    '<link rel="stylesheet" href="assets/secao-mulheres-v199.css">',
    '<link rel="stylesheet" href="assets/secao-eventos-carousel-v1.css">'
)

section = '''<section id="mulheres-virtuosas" class="mv-event-section event-carousel-section" aria-label="Eventos em destaque">
  <div class="event-carousel-viewport" data-event-carousel tabindex="0" aria-roledescription="carrossel" aria-label="Eventos em destaque">
    <article class="event-slide is-active" data-event-slide aria-hidden="false" aria-label="1 de 2 · Mulheres Virtuosas">
      <div class="wrap mv-event-grid">
        <a class="mv-event-art" href="mulheres-virtuosas.html" aria-label="Conheça e inscreva-se no Mulheres Virtuosas"><img src="img/eventos/mulheres-virtuosas-2026.webp" alt="Mulheres Virtuosas com Pra. Claudiany Guedes — 30 de outubro, às 19h30" width="1599" height="600" loading="lazy"></a>
        <div class="mv-event-copy">
          <span class="eyebrow">Encontro de mulheres</span>
          <h2 class="h-sec">Mulheres <span class="editorial">Virtuosas</span></h2>
          <p class="lead">Um encontro de fé e comunhão com a Pra. Claudiany Guedes, na Nova Igreja Batista.</p>
          <dl class="mv-event-details">
            <div><dt>Data e horário</dt><dd>30 de outubro · 19h30</dd></div>
            <div><dt>Inscrição</dt><dd>R$ 20 por pessoa</dd></div>
          </dl>
          <div class="mv-event-enrollment"><span class="mv-event-status">Inscrições abertas!</span><a class="btn mv-event-cta" href="mulheres-virtuosas.html">Inscreva-se no evento</a></div>
        </div>
      </div>
    </article>

    <article class="event-slide" data-event-slide aria-hidden="true" aria-label="2 de 2 · NXT CAMP 2026">
      <div class="wrap mv-event-grid">
        <a class="nxt-event-art" href="next/camp-sbgp1-nov26/" aria-label="Conheça e inscreva-se no NXT CAMP 2026">
          <div class="nxt-art-top"><span>2026</span><span>Ariquemes · RO</span></div>
          <div class="nxt-art-date">21 <small>e</small> 22</div>
          <div class="nxt-art-month">NOVEMBRO</div>
          <span class="nxt-art-tag tag-palavra">Palavra</span>
          <span class="nxt-art-tag tag-worship">Worship</span>
          <span class="nxt-art-tag tag-gincanas">Gincanas</span>
          <div class="nxt-art-local"><small>Local</small><strong>Chácara<br>Colina Verde</strong></div>
          <span class="nxt-art-badge">SBGP.1</span>
        </a>
        <div class="mv-event-copy nxt-event-copy">
          <span class="eyebrow">Encontro de adolescentes</span>
          <h2 class="h-sec">NXT <span class="editorial">CAMP</span> · 2026</h2>
          <p class="lead">Dois dias de palavra, worship, comunhão e experiências para adolescentes de 12 a 17 anos.</p>
          <dl class="mv-event-details">
            <div><dt>Data</dt><dd>21 e 22 de novembro</dd></div>
            <div><dt>Inscrição</dt><dd>R$ 80 por participante</dd></div>
          </dl>
          <div class="mv-event-enrollment"><span class="mv-event-status">Inscrições abertas!</span><a class="btn mv-event-cta" href="next/camp-sbgp1-nov26/">Conheça o NXT CAMP</a></div>
        </div>
      </div>
    </article>
  </div>

  <div class="event-carousel-controls" aria-label="Navegação dos eventos">
    <button class="event-carousel-btn" type="button" data-event-prev aria-label="Evento anterior">‹</button>
    <div class="event-carousel-dots" role="tablist" aria-label="Selecionar evento">
      <button class="event-carousel-dot is-active" type="button" data-event-dot aria-label="Mulheres Virtuosas" aria-current="true"></button>
      <button class="event-carousel-dot" type="button" data-event-dot aria-label="NXT CAMP 2026" aria-current="false"></button>
    </div>
    <button class="event-carousel-btn" type="button" data-event-next aria-label="Próximo evento">›</button>
  </div>
</section>'''

pattern = r'<section id="mulheres-virtuosas" class="mv-event-section" aria-labelledby="mv-event-title">.*?</section>\s*(?=<section class="pad sobre-bg" id="sobre">)'
html, count = re.subn(pattern, section + '\n\n', html, count=1, flags=re.S)
if count != 1:
    raise RuntimeError(f'Seção esperada não encontrada; substituições={count}')

script = '<script src="assets/eventos-carousel-v1.js" defer></script>'
if script not in html:
    html = html.replace('</body>', script + '\n</body>')

p.write_text(html, encoding='utf-8')
