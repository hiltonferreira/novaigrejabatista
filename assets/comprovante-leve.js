// Comprovante mais leve (pedido de Hilton, 09/11/2026): a foto ou print do Pix é reduzida no próprio celular
// antes do envio (no máximo 1600 px, WebP; JPEG se o navegador não gerar WebP). PDF segue como está.
// Funciona em qualquer formulário com <input type="file" name="receipt">: o arquivo reduzido entra no lugar do original
// e o evento "change" segue para o código da página, que mostra a prévia e envia normalmente.
(() => {
  'use strict';
  const MAX = 1600, QUALIDADE = 0.82, MINIMO = 150 * 1024, TIPOS = /^image\/(jpeg|png|webp)$/;
  const prontos = new WeakSet();

  function carregar(f) {
    if (window.createImageBitmap) return createImageBitmap(f, { imageOrientation: 'from-image' }).catch(() => abrir(f));
    return abrir(f);
  }
  function abrir(f) {
    return new Promise((ok, erro) => {
      const url = URL.createObjectURL(f), img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); ok(img); };
      img.onerror = () => { URL.revokeObjectURL(url); erro(new Error('imagem')); };
      img.src = url;
    });
  }
  const gerar = (canvas, tipo) => new Promise(ok => canvas.toBlob(ok, tipo, QUALIDADE));

  async function reduzir(f) {
    const img = await carregar(f);
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    if (!w || !h) return null;
    const k = Math.min(1, MAX / Math.max(w, h)), c = document.createElement('canvas');
    c.width = Math.round(w * k); c.height = Math.round(h * k);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); // PNG transparente fica com fundo branco
    ctx.drawImage(img, 0, 0, c.width, c.height);
    if (img.close) img.close();
    let b = await gerar(c, 'image/webp');
    if (!b || b.type !== 'image/webp') b = await gerar(c, 'image/jpeg'); // Safari antigo não gera WebP
    if (!b || !TIPOS.test(b.type) || b.size >= f.size) return null;
    const ext = b.type === 'image/webp' ? 'webp' : 'jpg';
    return new File([b], (f.name.replace(/\.[^.]+$/, '') || 'comprovante') + '.' + ext, { type: b.type, lastModified: Date.now() });
  }

  document.addEventListener('change', async e => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'file' || input.name !== 'receipt') return;
    if (prontos.has(input)) { prontos.delete(input); return; } // evento que nós mesmos reenviamos
    const f = input.files && input.files[0];
    if (!f || !TIPOS.test(f.type) || f.size < MINIMO || typeof DataTransfer !== 'function') return;
    e.stopImmediatePropagation();
    try {
      const novo = await reduzir(f);
      if (novo) { const dt = new DataTransfer(); dt.items.add(novo); input.files = dt.files; }
    } catch (_) { /* se não der para reduzir, segue o arquivo original */ }
    prontos.add(input);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, true);
})();
