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

  const requestId=document.createElement("input");
  requestId.type="hidden";
  requestId.name="request_id";
  const newRequestId=()=>[...crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,"0")).join("");
  requestId.value=newRequestId();
  form.appendChild(requestId);

  async function checkOpen(){
    try{
      const response=await fetch("api-inscricao.php",{credentials:"same-origin",cache:"no-store",headers:{"Accept":"application/json"}});
      if(response.status===410){
        const data=await response.json().catch(()=>({}));
        throw new Error(data.message||"As inscrições foram encerradas.");
      }
    }catch(err){
      if(err instanceof TypeError) return;
      throw err;
    }
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

  document.getElementById("next-data").addEventListener("click",async()=>{
    const fs=fieldsets[0];
    for(const el of fs.querySelectorAll("[required]")){
      if(!el.checkValidity()){el.reportValidity();return;}
    }
    const n=Number(age.value);
    if(n<12||n>17){setError("A inscrição é destinada a adolescentes de 12 a 17 anos.");age.focus();return;}
    try{await checkOpen();}catch(err){setError(err.message);return;}
    go(1);
  });

  document.querySelectorAll("[data-back]").forEach(btn=>btn.addEventListener("click",()=>go(Number(btn.dataset.back))));

  {
    const btn=document.getElementById("copy-pix");
    const label=btn.querySelector(".pix-copy-label");
    const original=label.textContent;
    let copyTimer=0;

    btn.addEventListener("click",async()=>{
      const code=document.getElementById("pix-code").value;
      try{
        await navigator.clipboard.writeText(code);
      }catch{
        const field=document.getElementById("pix-code");
        field.select();
        document.execCommand("copy");
      }

      clearTimeout(copyTimer);
      btn.classList.add("copied");
      label.textContent="Código copiado!";
      document.getElementById("copy-status").textContent="Código PIX copiado.";

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
      requestId.value=newRequestId();
    }catch(err){
      setError(err&&err.message?err.message:"Não foi possível concluir a inscrição.");
      btn.disabled=false;
      btn.textContent=original;
    }
  });
})();
