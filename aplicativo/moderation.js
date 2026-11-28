/* Filtro simples de palavras de baixo calão e ofensas para o caderno de oração.
   Publicação sem aprovação (decisão de Hilton, 03/11/2026); este filtro só barra o óbvio.
   Normaliza acentos, maiúsculas, números usados como letras e letras repetidas. */
(function(scope){
  const words = ['porra','caralho','caralhos','merda','merdas','bosta','puta','putas','puto','putaria','foda','fodase','foder','fodido','fodida','fdp','pqp','vsf','vtnc','tnc','buceta','boceta','cu','cuzao','cuzão','arrombado','arrombada','desgracado','desgracada','vagabundo','vagabunda','vadia','piranha','corno','corna','escroto','escrota','otario','otaria','babaca','imbecil','idiota','retardado','retardada','cacete','viado','veado','bicha','sapatao','macaca','macaco','crioulo','safado','safada','canalha','lixo humano'];
  const phrases = ['filho da puta','filha da puta','vai se foder','vai tomar no cu','tomar no cu','puta que pariu','vai a merda'];
  const normalize = text => String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[@4]/g, 'a').replace(/3/g, 'e').replace(/[1!]/g, 'i').replace(/0/g, 'o').replace(/\$/g, 's').replace(/7/g, 't')
    .replace(/[^a-z\s]/g, ' ').replace(/(.)\1{2,}/g, '$1').replace(/\s+/g, ' ').trim();
  const list = new Set(words.map(normalize));
  const offensive = text => {
    const clean = normalize(text);
    if (!clean) return false;
    const padded = ' ' + clean + ' ';
    if (phrases.some(p => padded.includes(' ' + normalize(p) + ' '))) return true;
    return clean.split(' ').some(w => list.has(w) || list.has(w.replace(/(.)\1+/g, '$1')));
  };
  scope.NibModeration = { offensive, normalize };
})(typeof window === 'undefined' ? globalThis : window);
