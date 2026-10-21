(() => {
  'use strict';
  const form = document.getElementById('event-form');
  const fields = Array.from(form.querySelectorAll('[data-step]'));
  const progress = document.querySelector('.progress');
  const error = document.getElementById('form-error');
  const submit = document.getElementById('submit-registration');
  const receipt = document.getElementById('receipt');
  const preview = document.getElementById('receipt-preview');
  const key = 'nib-mulheres-2026-10-30';
  const maxBytes = 6 * 1024 * 1024;
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  let step = 0, sending = false, previewUrl = '', protocol = '';
  function newId() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }
  let requestId = newId();
  function save() {
    try { localStorage.setItem(key, JSON.stringify({name:form.elements.name.value, phone:form.elements.phone.value,
      payer:form.elements.payer.value, otherPayer:document.getElementById('other-payer').checked, consent:form.elements.consent.checked, step, requestId, protocol, saved:Date.now()})); } catch (_) {}
  }
  function showError(message) { error.textContent = message; error.hidden = false; error.scrollIntoView({block:'nearest',behavior:'auto'}); }
  function clearError() { error.hidden = true; error.textContent = ''; }
  function go(next, focus = true) {
    step = next; clearError();
    fields.forEach((field, i) => {field.hidden = i !== step;});
    Array.from(progress.children).forEach((li, i) => {
      li.dataset.state = i < step ? 'complete' : (i === step ? 'current' : 'upcoming');
      if (i === step) li.setAttribute('aria-current','step'); else li.removeAttribute('aria-current');
    });
    save();
    if (focus) { const title = fields[step].querySelector('legend'); title.tabIndex = -1; title.focus(); }
  }
  function success(id) {
    protocol = id; form.hidden = true; progress.hidden = true; clearError();
    document.getElementById('protocol').textContent = id;
    document.getElementById('protocol-status').textContent = '';
    const panel = document.getElementById('success'); panel.hidden = false; panel.focus();
    // Retain only the protocol after completion; clear the personal draft.
    try {localStorage.setItem(key,JSON.stringify({protocol:id,saved:Date.now()}));} catch (_) {}
  }
  async function api(options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch('api/mulheres-inscricao.php', {...options, credentials:'same-origin', cache:'no-store', signal:controller.signal});
      if (!(response.headers.get('content-type') || '').includes('application/json')) throw new Error('O serviço de inscrições ainda não está disponível. Tente novamente em instantes.');
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.message || 'Não foi possível salvar. Tente novamente.');
      return result;
    } catch (e) {
      if (e.name === 'AbortError' || e instanceof TypeError) throw new Error('A conexão foi interrompida. Seus dados continuam aqui; tente novamente.');
      throw e;
    } finally { clearTimeout(timer); }
  }
  function validData() {
    const name = form.elements.name, phone = form.elements.phone;
    name.value = name.value.trim();
    name.setCustomValidity(name.value.length < 3 ? 'Informe seu nome completo.' : '');
    const digits = phone.value.replace(/\D/g,'');
    phone.setCustomValidity(/^(?:55)?[1-9][0-9]{9,10}$/.test(digits) ? '' : 'Informe o WhatsApp com DDD.');
    for (const input of [name,phone,form.elements.consent]) {
      if (!input.checkValidity()) { input.reportValidity(); return false; }
    }
    return true;
  }
  form.addEventListener('input', event => {
    if (event.target.setCustomValidity) event.target.setCustomValidity('');
    save();
  });
  document.getElementById('next-data').addEventListener('click', async event => {
    if (!validData()) return;
    const button = event.currentTarget; button.disabled = true; clearError();
    try {await api(); go(1);} catch(e) {showError(e.message);} finally {button.disabled = false;}
  });
  document.getElementById('next-pix').addEventListener('click', () => go(2));
  document.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => {if (!sending) go(Number(button.dataset.back));}));
  document.getElementById('copy-pix').addEventListener('click', async event => {
    const button = event.currentTarget;
    const status = document.getElementById('copy-status');
    const input = document.getElementById('pix-code');
    const originalLabel = button.dataset.originalLabel || button.textContent.trim();
    button.dataset.originalLabel = originalLabel;
    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {await navigator.clipboard.writeText(input.value);copied = true;} catch (_) {}
    }
    if (!copied) {
      try {input.focus();input.select();copied = document.execCommand('copy');} catch (_) {}
    }
    status.textContent = copied
      ? 'Código Pix copiado. Cole no aplicativo do banco, confira o valor de R$ 20 e volte para enviar o comprovante.'
      : 'Selecione o código acima e copie para a opção Pix Copia e Cola do seu banco.';
    if (copied) {
      button.classList.add('copied');
      button.textContent = 'Código copiado!';
      clearTimeout(button._copiedTimer);
      button._copiedTimer = setTimeout(() => {
        button.classList.remove('copied');
        button.textContent = originalLabel;
      }, 2200);
    }
  });
  function showReceiptSelection(selected) {
    document.getElementById('receipt-picker').hidden=selected;
    document.getElementById('receipt-selected').hidden=!selected;
  }
  function syncOtherPayer() {
    const checked=document.getElementById('other-payer').checked;
    document.getElementById('payer-field').hidden=!checked;
    form.elements.payer.disabled=!checked;
    form.elements.payer.required=checked;
    document.getElementById('other-payer').setAttribute('aria-expanded',String(checked));
  }
  document.getElementById('other-payer').addEventListener('change',()=>{syncOtherPayer();save();});
  document.getElementById('change-receipt').addEventListener('click',()=>receipt.click());
  receipt.addEventListener('change', () => {
    clearError(); submit.disabled = true; preview.hidden = true; showReceiptSelection(false);
    if (previewUrl) {URL.revokeObjectURL(previewUrl); previewUrl = '';}
    const file = receipt.files[0];
    const status = document.getElementById('file-status');
    if (!file) { status.textContent = 'Nenhum arquivo selecionado.'; return; }
    if (!allowed.includes(file.type) || file.size < 1 || file.size > maxBytes) {
      receipt.value = ''; status.textContent = 'Nenhum arquivo selecionado.';
      showError('Escolha JPG, PNG, WebP ou PDF de até 6 MB.'); return;
    }
    showReceiptSelection(true);
    status.textContent = file.name + ' · ' + (file.size / 1024 / 1024).toFixed(1) + ' MB';
    if (file.type.startsWith('image/')) {previewUrl = URL.createObjectURL(file); preview.src = previewUrl; preview.hidden = false;}
    submit.disabled = false;
  });
  async function finishRegistration(event) {
    event.preventDefault(); if (sending) return;
    if (step !== 2) return;
    if (!validData()) {go(0); return;}
    if (document.getElementById('other-payer').checked && form.elements.payer.value.trim().length<3) {showError('Informe o nome de quem fez o Pix.');form.elements.payer.focus();return;}
    if (!receipt.files[0]) {showError('Adicione o comprovante antes de concluir.'); return;}
    sending = true; clearError(); save();
    form.querySelectorAll('button').forEach(button => {button.disabled = true;});
    submit.textContent = 'Enviando inscrição…'; form.setAttribute('aria-busy','true');
    try {
      const session = await api();
      const data = new FormData(form);
      data.set('csrf',session.csrf); data.set('request_id',requestId); data.set('consent','yes');
      const result = await api({method:'POST',body:data});
      if (!/^MV26-[A-F0-9]{12}$/.test(result.protocol || '')) throw new Error('Não recebemos a confirmação do servidor. Tente novamente.');
      success(result.protocol);
    } catch(e) {showError(e.message);}
    finally {
      sending = false; form.removeAttribute('aria-busy'); submit.textContent = 'Concluir inscrição';
      form.querySelectorAll('button').forEach(button => {button.disabled = false;});
      submit.disabled = !receipt.files[0];
    }
  }
  form.addEventListener('submit', finishRegistration);
  submit.addEventListener('click', finishRegistration);
  document.getElementById('new-registration').addEventListener('click', () => {
    protocol = ''; requestId = newId(); form.reset(); preview.hidden = true; showReceiptSelection(false); syncOtherPayer();
    if (previewUrl) {URL.revokeObjectURL(previewUrl); previewUrl = '';}
    document.getElementById('file-status').textContent = 'Nenhum arquivo selecionado.';
    document.getElementById('copy-status').textContent = ''; submit.disabled = true;
    document.getElementById('success').hidden = true; form.hidden = false; progress.hidden = false; go(0);
  });
  try {
    const draft = JSON.parse(localStorage.getItem(key) || 'null');
    if (draft && Date.now() - draft.saved < 7*24*60*60*1000) {
      if (/^MV26-[A-F0-9]{12}$/.test(draft.protocol || '')) success(draft.protocol);
      else {
        for (const field of ['name','phone','payer']) if (typeof draft[field] === 'string') form.elements[field].value = draft[field];
        form.elements.consent.checked = draft.consent === true;
        document.getElementById('other-payer').checked = draft.otherPayer===true || (draft.otherPayer===undefined && Boolean(draft.payer));
        syncOtherPayer();
        if (/^[a-f0-9]{32}$/.test(draft.requestId || '')) requestId = draft.requestId;
        const desired = Number(draft.step);
        go([0,1,2].includes(desired) ? desired : 0,false);
      }
    } else if (draft) {localStorage.removeItem(key);}
  } catch (_) {}

  function formatPhone(input) {
    let digits=input.value.replace(/\D/g,'');
    if(digits.length>11 && digits.startsWith('55'))digits=digits.slice(2);
    digits=digits.slice(0,11);
    if(!digits){input.value='';return;}
    const rest=digits.slice(2),split=rest.length>8?5:4;
    input.value='('+digits.slice(0,2)+(digits.length>=2?') ':'')+rest.slice(0,split)+(rest.length>split?'-'+rest.slice(split):'');
  }
  form.elements.phone.addEventListener('blur',()=>{formatPhone(form.elements.phone);save();});
  document.getElementById('copy-protocol').addEventListener('click',async()=>{
    const status=document.getElementById('protocol-status');
    try {
      if(navigator.clipboard && window.isSecureContext)await navigator.clipboard.writeText(protocol);
      else {
        const temporary=document.createElement('textarea');temporary.value=protocol;temporary.style.position='fixed';temporary.style.left='-9999px';document.body.appendChild(temporary);temporary.select();
        const copied=document.execCommand('copy');temporary.remove();if(!copied)throw new Error('copy');
      }
      status.textContent='Protocolo copiado.';
    } catch(_){status.textContent='Seu protocolo: '+protocol;}
  });
})();
