(() => {
  const form = document.getElementById("event-form");
  const fieldsets = [...form.querySelectorAll("fieldset[data-step]")];
  const progress = [...document.querySelectorAll(".progress li")];
  const errorBox = document.getElementById("form-error");
  const birth = document.getElementById("birth");
  const age = document.getElementById("age");
  const receipt = document.getElementById("receipt");
  const selected = document.getElementById("receipt-selected");
  const preview = document.getElementById("receipt-preview");
  const fileStatus = document.getElementById("file-status");
  const otherPayer = document.getElementById("other-payer");
  const payerField = document.getElementById("payer-field");
  const payer = document.getElementById("payer");

  function setError(msg="") {
    errorBox.textContent = msg;
    errorBox.hidden = !msg;
  }

  // Progresso em 3 passos (Seus dados, Pagamento, Comprovante); pagamento e comprovante ficam na mesma tela,
  // e o passo 3 acende quando o comprovante é escolhido.
  function setProgress(k){
    progress.forEach((li,i)=>{
      li.classList.toggle("is-complete", i < k);
      if(i===k) li.setAttribute("aria-current","step");
      else li.removeAttribute("aria-current");
    });
  }
  function go(step) {
    fieldsets.forEach((fs,i)=>fs.hidden=i!==step);
    setProgress(step===0?0:(receipt.files[0]?2:1));
    updateJump();
    setError("");
    // Celular: rola até o formulário (não até o topo da página), para a etapa aparecer na hora.
    const area=document.querySelector(".form-area");
    const top=window.innerWidth<=900&&area?Math.max(0,area.getBoundingClientRect().top+window.scrollY-8):0;
    window.scrollTo({top,behavior:"smooth"});
    currentStep=step;
    saveDraft();
  }
  let currentStep=0;
  // Celular: botão fixo "Já pagou? Anexar comprovante" na tela de pagamento, até o comprovante aparecer na tela.
  const jump=document.getElementById("ir-comprovante");
  let receiptBoxVisible=false;
  function updateJump(){
    if(!jump) return;
    const pay=fieldsets[1]&&!fieldsets[1].hidden;
    jump.hidden=!(pay&&!receiptBoxVisible&&!receipt.files[0]&&window.innerWidth<=900);
  }
  if(jump){
    jump.addEventListener("click",e=>{
      e.preventDefault();
      const box=document.getElementById("comprovante");
      if(box)window.scrollTo({top:Math.max(0,box.getBoundingClientRect().top+window.scrollY-12),behavior:"smooth"});
    });
    const box=document.getElementById("comprovante");
    if(box&&"IntersectionObserver" in window){
      new IntersectionObserver(en=>{receiptBoxVisible=en[0].isIntersecting;updateJump();},{rootMargin:"0px 0px -35% 0px"}).observe(box);
    }
    window.addEventListener("resize",updateJump);
  }
  let saveDraft=()=>{};


  // Staff: inscrição da equipe de voluntários, R$ 30 (2026-11-13).
  const STAFF_CARD_URL="";
  const STAFF_PIX="00020126580014br.gov.bcb.pix0114405187580001300218Inscricao NXT Camp520400005303986540530.005802BR5919NOVA IGREJA BATISTA6009ARIQUEMES62120508NXTSTAFF6304DFA6";
  const typeInputs=[...form.querySelectorAll('input[name="registration_type"]')];
  const q=sel=>document.querySelector(sel);
  const guardianEls=[q(".section-divider"),q('label[for="guardian"]'),document.getElementById("guardian"),document.getElementById("guardian-phone")?.closest(".field-row")].filter(Boolean);
  // Staff informa só nome e WhatsApp: some responsável, nascimento e saúde.
  guardianEls.push(...[birth?.closest(".field-row"),q('label[for="health"]'),document.getElementById("health")].filter(Boolean));
  const guardianInputs=["guardian","guardian-phone","relationship","birth","age","health"].map(id=>document.getElementById(id)).filter(Boolean);
  const phone=document.getElementById("phone");
  const consentText=q("label.consent:not(.payer-toggle) span");
  const texts=[
    [q('label[for="name"]'),"Nome completo"],
    [q('label[for="phone"]'),"WhatsApp com DDD"],
    [q('fieldset[data-step="0"] .step-intro'),"Informe o nome e o WhatsApp de quem vai servir na equipe Staff do NXT CAMP."],
    [q(".nib-pay-note strong"),"Inscrição Staff: R$ 30,00"],
    [q('fieldset[data-step="1"] .step-intro'),STAFF_CARD_URL?"Pague com Pix ou cartão e, logo abaixo, anexe o comprovante para concluir.":"Pague com Pix e, logo abaixo, anexe o comprovante para concluir."],
    [q(".payment-summary strong"),"R$ 30,00"],
    [q('#comprovante .step-intro'),STAFF_CARD_URL?"Anexe a imagem ou o PDF do pagamento de R$ 30 (Pix ou cartão).":"Anexe a imagem ou o PDF do Pix de R$ 30."]
  ].filter(([el])=>el).map(([el,staff])=>({el,staff,original:el.innerHTML}));
  const payNoteText=q(".nib-pay-note strong")?.nextSibling;
  const payNoteOriginal=payNoteText?.textContent;
  const consentOriginal=consentText?.innerHTML;
  const health=document.getElementById("health");
  const healthOriginal=health?.placeholder;
  const card=q(".nib-card-pay");
  const cardLink=card?.querySelector("a");
  const cardHref=cardLink?.getAttribute("href");
  const payOr=q(".nib-pay-or");
  const qr=q(".pix-qr img");
  const qrOriginal=qr?{src:qr.getAttribute("src"),alt:qr.alt}:null;
  const pixField=document.getElementById("pix-code");
  const pixOriginal=pixField?.value;
  const isStaff=()=>typeInputs.some(i=>i.checked&&i.value==="staff");

  // Mais de um adolescente com o mesmo responsável e um pagamento só (pedido de Hilton, 17/11/2026).
  // Cada adolescente vira uma inscrição própria no servidor, todas com o mesmo comprovante.
  const UNIT={participante:80,staff:30};
  const MAX_TEENS=6;
  const addBtn=document.getElementById("add-teen");
  const addNote=q(".nib-add-note");
  const moreBox=document.getElementById("mais-adolescentes");
  const extras=()=>moreBox?[...moreBox.querySelectorAll(".nib-teen")]:[];
  const money=v=>"R$\u00a0"+v.toFixed(2).replace(".",",");
  const ageFrom=value=>{
    if(!value) return "";
    const now=new Date(), d=new Date(value+"T00:00:00");
    let n=now.getFullYear()-d.getFullYear();
    const m=now.getMonth()-d.getMonth();
    if(m<0||(m===0&&now.getDate()<d.getDate())) n--;
    return n;
  };
  const firstLabel=document.createElement("p");
  firstLabel.className="nib-teen-first"; firstLabel.textContent="Adolescente 1"; firstLabel.hidden=true;
  q('label[for="name"]')?.before(firstLabel);
  function renumber(){
    extras().forEach((el,i)=>{el.querySelector(".nib-teen-top strong").textContent="Adolescente "+(i+2);});
    firstLabel.hidden=!extras().length;
    const hl=q('label[for="health"]');
    if(hl){if(!hl.dataset.original)hl.dataset.original=hl.innerHTML;hl.innerHTML=extras().length?hl.dataset.original.replace("Alergia","Adolescente 1: alergia"):hl.dataset.original;}
    if(addBtn)addBtn.disabled=extras().length>=MAX_TEENS-1;
  }
  let teenSeq=0;
  function addTeen(data={}){
    if(!moreBox||extras().length>=MAX_TEENS-1) return null;
    const k=++teenSeq;
    const el=document.createElement("div");
    el.className="nib-teen";
    el.innerHTML=`<div class="nib-teen-top"><strong></strong><button type="button" class="nib-teen-remove">Remover</button></div>
      <label for="teen-name-${k}">Nome completo do adolescente</label>
      <input id="teen-name-${k}" data-f="name" autocomplete="off" maxlength="120" required>
      <div class="field-row">
        <div><label for="teen-birth-${k}">Data de nascimento</label><input id="teen-birth-${k}" data-f="birth" type="date" required></div>
        <div><label for="teen-age-${k}">Idade</label><input id="teen-age-${k}" data-f="age" type="number" readonly></div>
      </div>
      <label for="teen-phone-${k}">WhatsApp do adolescente <span class="optional">(opcional)</span></label>
      <input id="teen-phone-${k}" data-f="phone" type="tel" inputmode="tel" placeholder="(69) 99999-9999" maxlength="20">
      <label for="teen-health-${k}">Alergia, restrição alimentar, medicamento ou condição de saúde <span class="optional">(se houver)</span></label>
      <textarea id="teen-health-${k}" data-f="health" rows="2" maxlength="600"></textarea>`;
    const f=n=>el.querySelector(`[data-f="${n}"]`);
    ["name","birth","phone","health"].forEach(n=>{if(data[n])f(n).value=data[n];});
    f("age").value=ageFrom(f("birth").value);
    f("birth").addEventListener("change",()=>{f("age").value=ageFrom(f("birth").value);});
    el.querySelector(".nib-teen-remove").addEventListener("click",()=>{el.remove();renumber();updateCount();saveDraft();});
    moreBox.appendChild(el);
    renumber(); updateCount();
    return el;
  }
  const teenData=el=>{const f=n=>el.querySelector(`[data-f="${n}"]`).value.trim();return {name:f("name"),birth:f("birth"),age:String(ageFrom(f("birth"))),phone:f("phone"),health:f("health")};};
  const allTeens=()=>[{name:document.getElementById("name").value.trim(),birth:birth.value,age:age.value,phone:document.getElementById("phone").value.trim(),health:(document.getElementById("health")?.value||"").trim()}].concat(extras().map(teenData));
  const count=()=>isStaff()?1:1+extras().length;

  // Pix com o valor total: troca o campo 54 (valor) do código e recalcula o CRC (padrão do Banco Central).
  const crc16=t=>{let c=0xFFFF;for(let i=0;i<t.length;i++){c^=t.charCodeAt(i)<<8;for(let b=0;b<8;b++)c=(c&0x8000)?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF;}return c.toString(16).toUpperCase().padStart(4,"0");};
  function pixWithAmount(code,amount){
    const parts=[];let i=0;
    while(i<code.length){const id=code.slice(i,i+2),len=Number(code.slice(i+2,i+4));parts.push([id,code.slice(i+4,i+4+len)]);i+=4+len;}
    const v=amount.toFixed(2);
    const body=parts.filter(([id])=>id!=="63").map(([id,val])=>id==="54"?["54",v]:[id,val]).map(([id,val])=>id+String(val.length).padStart(2,"0")+val).join("")+"6304";
    return body+crc16(body);
  }
  function qrDataUrl(text){
    if(typeof window.qrcode!=="function") return "";
    const qrc=window.qrcode(0,"M"); qrc.addData(text); qrc.make();
    return qrc.createDataURL(8,16);
  }
  const cardNote=q(".nib-card-varios");
  const receiptsExtra=document.getElementById("receipts-extra");
  const summarySpan=q(".payment-summary span");
  const summaryOriginal=summarySpan?.textContent;
  function updateCount(){
    const n=count(), staff=isStaff(), unit=staff?UNIT.staff:UNIT.participante, total=unit*n;
    const note=q(".nib-pay-note strong"), sumStrong=q(".payment-summary strong"), intro=q("#comprovante .step-intro");
    if(n>1){
      if(note)note.textContent=`${n} inscrições: ${money(total)}`;
      if(summarySpan)summarySpan.textContent=`${n} inscrições`;
      if(sumStrong)sumStrong.textContent=money(total);
      if(intro)intro.textContent=`Anexe o comprovante do pagamento de ${money(total)} (${n} inscrições). Se pagou separado, anexe um comprovante de cada.`;
      if(cardNote){cardNote.hidden=false;cardNote.textContent=`O link do cartão é de ${money(unit)}, um adolescente por vez. Para pagar os ${n} pelo cartão, use o link ${n} vezes e anexe os comprovantes abaixo.`;}
      if(pixField){pixField.value=pixWithAmount(staff?STAFF_PIX:pixOriginal,total);}
      if(qr){const url=qrDataUrl(pixField.value);if(url){qr.setAttribute("src",url);qr.alt=`QR Code Pix de ${money(total)} para Nova Igreja Batista`;}}
    }else{
      if(summarySpan)summarySpan.textContent=summaryOriginal;
      if(cardNote)cardNote.hidden=true;
      // Textos de 1 inscrição voltam pelos originais (participante) ou pelos do Staff.
      texts.forEach(t=>{if([note,sumStrong,intro].includes(t.el))t.el.innerHTML=staff?t.staff:t.original;});
      if(pixField)pixField.value=staff?STAFF_PIX:pixOriginal;
      if(qr&&qrOriginal){qr.setAttribute("src",staff?"img/pix-nxt-camp-staff-30.webp":qrOriginal.src);qr.alt=staff?"QR Code Pix de R$ 30 para Nova Igreja Batista":qrOriginal.alt;}
    }
    if(receiptsExtra){
      receiptsExtra.hidden=n<2;
      const inputs=[...receiptsExtra.querySelectorAll("input[type=file]")];
      if(n<2)inputs.forEach(i=>i.closest(".nib-receipt-more").remove());
      const more=receiptsExtra.querySelector(".nib-receipt-add");
      if(more)more.hidden=receiptsExtra.querySelectorAll("input[type=file]").length>=n-1;
    }
  }
  if(receiptsExtra){
    receiptsExtra.innerHTML='<button type="button" class="nib-receipt-add">Pagou separado? Adicionar outro comprovante</button>';
    let rk=0;
    receiptsExtra.querySelector(".nib-receipt-add").addEventListener("click",()=>{
      const k=++rk, box=document.createElement("div");
      box.className="nib-receipt-more";
      box.innerHTML=`<label for="receipt-more-${k}">Outro comprovante</label><input id="receipt-more-${k}" name="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"><button type="button" class="receipt-change">Tirar</button>`;
      box.querySelector("button").addEventListener("click",()=>{box.remove();updateCount();});
      receiptsExtra.querySelector(".nib-receipt-add").before(box);
      updateCount();
    });
  }
  if(addBtn)addBtn.addEventListener("click",()=>{const el=addTeen();if(el)el.querySelector("input").focus();saveDraft();});

  function applyType(){
    const staff=isStaff();
    texts.forEach(t=>{t.el.innerHTML=staff?t.staff:t.original;});
    if(payNoteText)payNoteText.textContent=staff?(STAFF_CARD_URL?"Pague com Pix ou cartão de crédito.":"Pague com Pix."):payNoteOriginal;
    if(consentText)consentText.innerHTML=staff?'Confirmo que faço parte da equipe Staff do NXT CAMP e autorizo o uso dos meus dados e do comprovante para organizar esta inscrição. <a href="/privacidade.html" target="_blank" rel="noopener">Política de privacidade</a>.':consentOriginal;
    if(health)health.placeholder=staff?"Informe somente o que a equipe precisa saber para cuidar bem de você.":healthOriginal;
    guardianEls.forEach(el=>{el.hidden=staff;});
    guardianInputs.forEach(el=>{el.disabled=staff;});
    if(phone)phone.required=staff;
    if(age){if(staff){age.removeAttribute("min");age.removeAttribute("max");}else{age.min="12";age.max="17";}}
    if(card){card.hidden=staff&&!STAFF_CARD_URL;if(cardLink)cardLink.setAttribute("href",staff&&STAFF_CARD_URL?STAFF_CARD_URL:cardHref);}
    if(payOr)payOr.hidden=staff&&!STAFF_CARD_URL;
    if(qr&&qrOriginal){qr.setAttribute("src",staff?"img/pix-nxt-camp-staff-30.webp":qrOriginal.src);qr.alt=staff?"QR Code Pix de R$ 30 para Nova Igreja Batista":qrOriginal.alt;}
    if(pixField)pixField.value=staff?STAFF_PIX:pixOriginal;
    if(addBtn){addBtn.hidden=staff;if(addNote)addNote.hidden=staff;}
    if(staff)extras().forEach(el=>el.remove());
    updateCount();
    setError("");
  }
  typeInputs.forEach(i=>i.addEventListener("change",applyType));
  if(new URLSearchParams(location.search).get("tipo")==="staff"){
    const staffInput=typeInputs.find(i=>i.value==="staff");
    if(staffInput)staffInput.checked=true;
    // A escolha só aparece para quem chega pelo link do Staff.
    const typeBox=form.querySelector(".nib-tipo");
    if(typeBox)typeBox.hidden=false;
  }
  applyType();

  progress.forEach((li,i)=>{
    li.classList.toggle("is-complete", false);
    if(i===0) li.setAttribute("aria-current","step");
    else li.removeAttribute("aria-current");
  });

  birth.addEventListener("change",()=>{
    if(!birth.value) return;
    age.value=ageFrom(birth.value);
  });

  document.getElementById("next-data").addEventListener("click",()=>{
    const fs=fieldsets[0];
    for(const el of fs.querySelectorAll("[required]")){
      if(!el.checkValidity()){el.reportValidity();return;}
    }
    const n=Number(age.value);
    if(!isStaff()&&(n<12||n>17)){setError("A inscrição é destinada a adolescentes de 12 a 17 anos.");age.focus();return;}
    if(!isStaff()){
      for(const el of extras()){
        const d=teenData(el), a=Number(d.age);
        if(d.age===""||a<12||a>17){setError(`${d.name||"Um dos adolescentes"}: a inscrição é destinada a adolescentes de 12 a 17 anos.`);el.querySelector('[data-f="birth"]').focus();return;}
      }
    }
    go(1);
  });

  document.querySelectorAll("[data-back]").forEach(btn=>btn.addEventListener("click",()=>go(Number(btn.dataset.back))));

  {
    const btn=document.getElementById("copy-pix");
    const field=document.getElementById("pix-code");
    const status=document.getElementById("copy-status");
    const label=btn.querySelector(".pix-copy-label");
    const original=label.textContent;
    let copyTimer=0;

    btn.addEventListener("click",async()=>{
      clearTimeout(copyTimer);
      btn.classList.remove("copied");
      label.textContent=original;
      btn.disabled=true;
      field.hidden=true;
      let copied=false;
      try{
        await navigator.clipboard.writeText(field.value);
        copied=true;
      }catch{
        field.hidden=false;
        field.focus();
        field.select();
        try{copied=document.execCommand("copy")===true;}catch{}
      }finally{
        btn.disabled=false;
      }
      if(!copied){
        status.textContent="Não foi possível copiar automaticamente. Copie o código selecionado ou use o QR Code.";
        return;
      }
      field.hidden=true;
      if(document.activeElement===field)btn.focus();
      btn.classList.add("copied");
      label.textContent="Código copiado!";
      status.textContent="Cole o código na opção Pix Copia e Cola do seu banco. Depois de pagar, volte aqui e anexe o comprovante.";
      copyTimer=setTimeout(()=>{
        btn.classList.remove("copied");
        label.textContent=original;
      },2200);
    });
  }


  receipt.addEventListener("change",()=>{
    const file=receipt.files[0];
    if(!file){selected.hidden=true;setProgress(1);updateJump();return;}
    if(file.size>6*1024*1024){receipt.value="";setError("O comprovante deve ter no máximo 6 MB.");selected.hidden=true;return;}
    fileStatus.textContent=file.name;
    setProgress(2); updateJump();
    selected.hidden=false;
    if(file.type.startsWith("image/")){
      preview.src=URL.createObjectURL(file);
      preview.hidden=false;
    }else{
      preview.hidden=true;
      preview.removeAttribute("src");
    }
    setError("");
  });

  document.getElementById("change-receipt").addEventListener("click",()=>receipt.click());

  otherPayer.addEventListener("change",()=>{
    payerField.hidden=!otherPayer.checked;
    payer.disabled=!otherPayer.checked;
    payer.required=otherPayer.checked;
    otherPayer.setAttribute("aria-expanded",String(otherPayer.checked));
    if(!otherPayer.checked) payer.value="";
  });

  const done=[]; // inscrições já gravadas nesta tentativa: {i, name, protocol}
  document.getElementById("submit-registration").addEventListener("click",async()=>{
    if(!receipt.files[0]){receipt.reportValidity();return;}
    if(otherPayer.checked&&!payer.value.trim()){payer.reportValidity();return;}

    const btn=document.getElementById("submit-registration");
    const backBtn=form.querySelector('[data-back="0"]');
    const original=btn.textContent;
    btn.disabled=true;
    setError("");

    const staff=isStaff();
    const teens=staff?[null]:allTeens();
    const n=teens.length, total=(staff?UNIT.staff:UNIT.participante)*n;
    const receipts=[receipt.files[0]].concat(receiptsExtra?[...receiptsExtra.querySelectorAll("input[type=file]")].map(i=>i.files[0]).filter(Boolean):[]);
    const payerName=otherPayer.checked?payer.value.trim():"";

    try{
      for(let i=0;i<n;i++){
        if(done.some(d=>d.i===i)) continue;
        btn.textContent=n>1?`Enviando ${i+1} de ${n}...`:"Enviando inscrição...";
        const payload=new FormData(form);
        payload.delete("receipt");
        payload.append("receipt",receipts[Math.min(i,receipts.length-1)]);
        if(!staff){
          const t=teens[i];
          ["name","birth","age","phone","health"].forEach(k=>payload.set(k,t[k]));
        }
        if(n>1){
          const first=done.find(d=>d.i===0);
          let info=`Pagamento conjunto: ${n} inscrições, ${money(total)}`;
          if(first&&i>0)info+=` · com ${first.protocol}`;
          if(payerName)info+=` · pago por ${payerName}`;
          payload.set("payer",info.replace(/\u00a0/g," ").slice(0,120));
        }
        const response=await fetch("api-inscricao.php",{
          method:"POST",
          body:payload,
          credentials:"same-origin",
          headers:{"Accept":"application/json"}
        });
        let data={};
        try{data=await response.json();}catch(_){}
        if(!response.ok||!data.ok){
          throw new Error(data.message||"Não foi possível concluir a inscrição.");
        }
        done.push({i,name:staff?"":teens[i].name,protocol:data.protocol||""});
        if(backBtn)backBtn.hidden=true; // com parte gravada, não dá para voltar e mudar os dados
      }

      fieldsets.forEach(fs=>fs.hidden=true);
      document.querySelector(".progress").hidden=true;
      if(jump)jump.hidden=true;
      const protocol=document.getElementById("protocol");
      const label=document.getElementById("protocol-label");
      if(done.length>1){
        if(label)label.textContent="Protocolos";
        protocol.innerHTML=done.sort((x,y)=>x.i-y.i).map(d=>`<span class="nib-proto">${d.name.replace(/[<>&"]/g,"")}: <b>${d.protocol}</b></span>`).join("");
        const title=document.getElementById("success-title");
        if(title)title.textContent=`${done.length} inscrições feitas!`;
      }else{
        protocol.textContent=done[0]?.protocol||"";
      }
      const success=document.getElementById("success");
      success.hidden=false;
      success.focus();
      window.scrollTo({top:Math.max(0,success.getBoundingClientRect().top+window.scrollY-16)});
      clearDraft();
      form.reset();
      extras().forEach(el=>el.remove());
      done.length=0;
      applyType();
    }catch(err){
      let msg=err&&err.message?err.message:"Não foi possível concluir a inscrição.";
      if(done.length&&n>1){
        const ok=done.map(d=>`${d.name} (${d.protocol})`).join(", ");
        msg=`Já gravamos: ${ok}. Faltou ${n-done.length}. ${msg} Toque em Concluir inscrição de novo para enviar o que falta.`;
      }
      setError(msg);
      btn.disabled=false;
      btn.textContent=original;
    }
  });

  // Rascunho no próprio aparelho: quem abre o banco para pagar e volta encontra tudo preenchido,
  // já na etapa do pagamento. Apagado ao concluir ou depois de 3 dias. O comprovante não é guardado.
  const DRAFT_KEY="nib-nxt-camp-rascunho-v1";
  const DRAFT_FIELDS=["name","birth","phone","guardian","guardian-phone","relationship","health"];
  function clearDraft(){try{localStorage.removeItem(DRAFT_KEY);}catch(_){}}
  saveDraft=()=>{
    try{
      const f={};
      DRAFT_FIELDS.forEach(id=>{const el=document.getElementById(id);if(el)f[id]=el.value;});
      f.consent=document.getElementById("consent")?.checked||false;
      const has=Object.values(f).some(v=>v&&v!==true)||extras().length;
      if(!has){clearDraft();return;}
      localStorage.setItem(DRAFT_KEY,JSON.stringify({t:Date.now(),step:currentStep,type:isStaff()?"staff":"participante",f,extras:extras().map(teenData)}));
    }catch(_){}
  };
  let draftTimer=0;
  form.addEventListener("input",e=>{if(e.target.type==="file")return;clearTimeout(draftTimer);draftTimer=setTimeout(saveDraft,300);});
  form.addEventListener("change",e=>{if(e.target.type==="file")return;saveDraft();});
  window.addEventListener("pagehide",saveDraft);
  (()=>{
    let d=null;
    try{d=JSON.parse(localStorage.getItem(DRAFT_KEY)||"null");}catch(_){}
    if(!d||typeof d!=="object"||!d.f||Date.now()-(d.t||0)>3*864e5){clearDraft();return;}
    if(d.type!==(isStaff()?"staff":"participante")) return;
    DRAFT_FIELDS.forEach(id=>{const el=document.getElementById(id);if(el&&typeof d.f[id]==="string")el.value=d.f[id];});
    const c=document.getElementById("consent"); if(c)c.checked=!!d.f.consent;
    if(birth.value)age.value=ageFrom(birth.value);
    if(!isStaff()&&Array.isArray(d.extras))d.extras.slice(0,MAX_TEENS-1).forEach(x=>addTeen(x));
    updateCount();
    const ok=[...fieldsets[0].querySelectorAll("[required]")].every(el=>el.disabled||el.checkValidity());
    if(d.step===1&&ok){
      fieldsets.forEach((fs,i)=>fs.hidden=i!==1);
      setProgress(1); updateJump();
      currentStep=1;
      const area=document.querySelector(".form-area");
      if(window.innerWidth<=900&&area)requestAnimationFrame(()=>window.scrollTo({top:Math.max(0,area.getBoundingClientRect().top+window.scrollY-8)}));
    }
  })();
})();
