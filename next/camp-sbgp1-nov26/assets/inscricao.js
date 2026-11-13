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

  function go(step) {
    fieldsets.forEach((fs,i)=>fs.hidden=i!==step);
    progress.forEach((li,i)=>{
      li.classList.toggle("is-complete", i < step);
      if(i===step) li.setAttribute("aria-current","step");
      else li.removeAttribute("aria-current");
    });
    setError("");
    window.scrollTo({top:0,behavior:"smooth"});
  }


  // Staff: inscrição da equipe de voluntários, R$ 30 (2026-11-13).
  const STAFF_CARD_URL="";
  const STAFF_PIX="00020126580014br.gov.bcb.pix0114405187580001300218Inscricao NXT Camp520400005303986540530.005802BR5919NOVA IGREJA BATISTA6009ARIQUEMES62120508NXTSTAFF6304DFA6";
  const typeInputs=[...form.querySelectorAll('input[name="registration_type"]')];
  const q=sel=>document.querySelector(sel);
  const guardianEls=[q(".section-divider"),q('label[for="guardian"]'),document.getElementById("guardian"),document.getElementById("guardian-phone")?.closest(".field-row")].filter(Boolean);
  const guardianInputs=["guardian","guardian-phone","relationship"].map(id=>document.getElementById(id)).filter(Boolean);
  const phone=document.getElementById("phone");
  const consentText=q("label.consent:not(.payer-toggle) span");
  const texts=[
    [q('label[for="name"]'),"Nome completo"],
    [q('label[for="phone"]'),"Seu WhatsApp com DDD"],
    [q('fieldset[data-step="0"] .step-intro'),"Informe seus dados para a equipe Staff do NXT CAMP."],
    [q(".nib-pay-note strong"),"Inscrição Staff: R$ 30,00"],
    [q('fieldset[data-step="1"] .step-intro'),STAFF_CARD_URL?"Escolha pagar com cartão ou com Pix. Depois, volte aqui para enviar o comprovante.":"Pague com Pix. Depois, volte aqui para enviar o comprovante."],
    [q(".payment-summary strong"),"R$ 30,00"],
    [q('fieldset[data-step="2"] .step-intro'),STAFF_CARD_URL?"Anexe a imagem ou o PDF do pagamento de R$ 30 (Pix ou cartão).":"Anexe a imagem ou o PDF do Pix de R$ 30."]
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
    setError("");
  }
  typeInputs.forEach(i=>i.addEventListener("change",applyType));
  if(new URLSearchParams(location.search).get("tipo")==="staff"){
    const staffInput=typeInputs.find(i=>i.value==="staff");
    if(staffInput)staffInput.checked=true;
  }
  applyType();

  progress.forEach((li,i)=>{
    li.classList.toggle("is-complete", false);
    if(i===0) li.setAttribute("aria-current","step");
    else li.removeAttribute("aria-current");
  });

  birth.addEventListener("change",()=>{
    if(!birth.value) return;
    const now=new Date();
    const d=new Date(birth.value+"T00:00:00");
    let n=now.getFullYear()-d.getFullYear();
    const m=now.getMonth()-d.getMonth();
    if(m<0||(m===0&&now.getDate()<d.getDate())) n--;
    age.value=n;
  });

  document.getElementById("next-data").addEventListener("click",()=>{
    const fs=fieldsets[0];
    for(const el of fs.querySelectorAll("[required]")){
      if(!el.checkValidity()){el.reportValidity();return;}
    }
    const n=Number(age.value);
    if(isStaff()&&!(n>=0&&n<120)){setError("Confira a data de nascimento.");birth.focus();return;}
    if(!isStaff()&&(n<12||n>17)){setError("A inscrição é destinada a adolescentes de 12 a 17 anos.");age.focus();return;}
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
      status.textContent="Cole o código na opção Pix Copia e Cola do seu banco.";
      copyTimer=setTimeout(()=>{
        btn.classList.remove("copied");
        label.textContent=original;
      },2200);
    });
  }

  document.getElementById("next-pix").addEventListener("click",()=>go(2));

  receipt.addEventListener("change",()=>{
    const file=receipt.files[0];
    if(!file){selected.hidden=true;return;}
    if(file.size>6*1024*1024){receipt.value="";setError("O comprovante deve ter no máximo 6 MB.");selected.hidden=true;return;}
    fileStatus.textContent=file.name;
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

  document.getElementById("submit-registration").addEventListener("click",async()=>{
    if(!receipt.files[0]){receipt.reportValidity();return;}
    if(otherPayer.checked&&!payer.value.trim()){payer.reportValidity();return;}

    const btn=document.getElementById("submit-registration");
    const original=btn.textContent;
    btn.disabled=true;
    btn.textContent="Enviando inscrição...";
    setError("");

    try{
      const payload=new FormData(form);
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

      fieldsets[2].hidden=true;
      document.querySelector(".progress").hidden=true;
      document.getElementById("protocol").textContent=data.protocol||"";
      const success=document.getElementById("success");
      success.hidden=false;
      success.focus();
      form.reset();
      applyType();
    }catch(err){
      setError(err&&err.message?err.message:"Não foi possível concluir a inscrição.");
      btn.disabled=false;
      btn.textContent=original;
    }
  });
})();
