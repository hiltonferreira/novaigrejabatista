#!/usr/bin/env python3
"""Aplicação pontual da fonte pública da obra. Padrão: conferir; --apply publica com backup privado."""
from pathlib import Path
import os, sys, json, hashlib, tempfile, shutil
PAYLOAD = json.loads('{"expected_sha256": "e5fa5fe3949eea3fe5541c13fa01c17ea95044baafa827927a34427b63840501", "old": "/* construção: percentual + barra animam ao entrar na seção e reiniciam ao retornar */\\n(function(){\\n  const section=document.getElementById(\'construcao\');\\n  const pct=section && section.querySelector(\'.cp-pct\');\\n  const fill=section && section.querySelector(\'.cp-fill\');\\n  if(!section || !pct || !fill) return;\\n\\n  const target=parseInt(pct.dataset.target,10)||30;\\n  const duration=1600;\\n  let raf=0;\\n  let wasVisible=false;\\n\\n  function reset(){\\n    cancelAnimationFrame(raf);\\n    pct.textContent=\'0%\';\\n    fill.style.width=\'0%\';\\n  }\\n\\n  function animate(){\\n    cancelAnimationFrame(raf);\\n    const start=performance.now();\\n\\n    function tick(now){\\n      const p=Math.min(1,(now-start)/duration);\\n      const eased=1-Math.pow(1-p,3);\\n      const value=Math.max(1,Math.round(eased*target));\\n\\n      pct.textContent=value+\'%\';\\n      fill.style.width=(eased*target)+\'%\';\\n\\n      if(p<1){\\n        raf=requestAnimationFrame(tick);\\n      }else{\\n        pct.textContent=target+\'%\';\\n        fill.style.width=target+\'%\';\\n      }\\n    }\\n\\n    raf=requestAnimationFrame(tick);\\n  }\\n\\n  if(window.matchMedia(\'(prefers-reduced-motion: reduce)\').matches){\\n    pct.textContent=target+\'%\';\\n    fill.style.width=target+\'%\';\\n    return;\\n  }\\n\\n  const obs=new IntersectionObserver(entries=>{\\n    entries.forEach(entry=>{\\n      if(entry.isIntersecting && !wasVisible){\\n        wasVisible=true;\\n        reset();\\n        animate();\\n      }else if(!entry.isIntersecting && wasVisible){\\n        wasVisible=false;\\n        reset();\\n      }\\n    });\\n  },{threshold:.35});\\n\\n  obs.observe(section);\\n})();\\n\\n", "new": "/* construção: percentual + barra animam ao entrar na seção e reiniciam ao retornar */\\n(function(){\\n  const section=document.getElementById(\'construcao\');\\n  const pct=section && section.querySelector(\'.cp-pct\');\\n  const fill=section && section.querySelector(\'.cp-fill\');\\n  if(!section || !pct || !fill) return;\\n\\n  let target=parseInt(pct.dataset.target,10)||30;\\n  const duration=1600;\\n\\n  /* dados da obra em /dados/obra.json (mesma fonte do aplicativo); sem resposta, fica o valor do HTML */\\n  fetch(\'/dados/obra.json\',{cache:\'no-cache\'}).then(r=>r.ok?r.json():null).then(d=>{\\n    if(!d || typeof d!==\'object\' || ![\'number\',\'string\'].includes(typeof d.percentual) || String(d.percentual).trim()===\'\') return;\\n    const value=Number(d.percentual);\\n    if(!Number.isFinite(value) || value<0 || value>100) return;\\n    target=Math.round(value);\\n    pct.dataset.target=String(target);\\n    fill.dataset.width=target+\'%\';\\n    const items=section.querySelectorAll(\'.cs-item\');\\n    items.forEach(item=>{\\n      const num=item.querySelector(\'.cs-num\'), txt=item.querySelector(\'.cs-txt\');\\n      if(!num||!txt) return;\\n      if(/conclu/i.test(txt.textContent)) num.textContent=target+\'%\';\\n      if(/lugares/i.test(txt.textContent) && d.lugares) num.textContent=String(d.lugares);\\n      if(/entrega/i.test(txt.textContent) && d.entrega) num.textContent=String(d.entrega);\\n    });\\n    if(wasVisible || window.matchMedia(\'(prefers-reduced-motion: reduce)\').matches){ pct.textContent=target+\'%\'; fill.style.width=target+\'%\'; }\\n  }).catch(()=>{});\\n  let raf=0;\\n  let wasVisible=false;\\n\\n  function reset(){\\n    cancelAnimationFrame(raf);\\n    pct.textContent=\'0%\';\\n    fill.style.width=\'0%\';\\n  }\\n\\n  function animate(){\\n    cancelAnimationFrame(raf);\\n    const start=performance.now();\\n\\n    function tick(now){\\n      const p=Math.min(1,(now-start)/duration);\\n      const eased=1-Math.pow(1-p,3);\\n      const value=Math.max(1,Math.round(eased*target));\\n\\n      pct.textContent=value+\'%\';\\n      fill.style.width=(eased*target)+\'%\';\\n\\n      if(p<1){\\n        raf=requestAnimationFrame(tick);\\n      }else{\\n        pct.textContent=target+\'%\';\\n        fill.style.width=target+\'%\';\\n      }\\n    }\\n\\n    raf=requestAnimationFrame(tick);\\n  }\\n\\n  if(window.matchMedia(\'(prefers-reduced-motion: reduce)\').matches){\\n    pct.textContent=target+\'%\';\\n    fill.style.width=target+\'%\';\\n    return;\\n  }\\n\\n  const obs=new IntersectionObserver(entries=>{\\n    entries.forEach(entry=>{\\n      if(entry.isIntersecting && !wasVisible){\\n        wasVisible=true;\\n        reset();\\n        animate();\\n      }else if(!entry.isIntersecting && wasVisible){\\n        wasVisible=false;\\n        reset();\\n      }\\n    });\\n  },{threshold:.35});\\n\\n  obs.observe(section);\\n})();\\n\\n", "data": {"percentual": 30, "lugares": "1.500", "entrega": "2028", "atualizado_em": "2026-11-03"}, "htaccess": "# Dados públicos lidos pelo site e pelo aplicativo Plataforma Nib.\\n<IfModule mod_headers.c>\\n  <FilesMatch \\"\\\\.json$\\">\\n    Header set Access-Control-Allow-Origin \\"*\\"\\n    Header set Cache-Control \\"no-cache, max-age=0\\"\\n    Header set X-Content-Type-Options \\"nosniff\\"\\n  </FilesMatch>\\n</IfModule>\\n<IfModule mod_mime.c>\\n  AddType application/json .json\\n</IfModule>\\n"}')
ROOT = Path('/home/novaigre/public_html')
def digest(data): return hashlib.sha256(data).hexdigest()
index = ROOT / 'index.html'
assert index.is_file() and not index.is_symlink(), 'index.html inesperado'
before = index.read_bytes()
assert digest(before) == PAYLOAD['expected_sha256'], 'Produção mudou: interrompido para nova comparação'
old, new = PAYLOAD['old'].encode(), PAYLOAD['new'].encode()
assert before.count(old) == 1 and new not in before, 'Bloco de origem não corresponde'
after = before.replace(old, new, 1)
assert after.replace(new, old, 1) == before, 'Alteração fora do bloco'
data_dir = ROOT / 'dados'
assert not data_dir.is_symlink(), 'Diretório dados inesperado'
if data_dir.exists():
    assert data_dir.is_dir(), 'dados não é diretório'
    assert all(p.name in ['obra.json', '.htaccess'] for p in data_dir.iterdir()), 'dados contém outros arquivos; revisar CORS antes de publicar'
files = {'dados/obra.json': (json.dumps(PAYLOAD['data'], ensure_ascii=False, indent=2)+'\n').encode(), 'dados/.htaccess': PAYLOAD['htaccess'].encode(), 'index.html': after}
for name, content in files.items():
    p = ROOT / name
    assert not p.is_symlink(), 'Arquivo inesperado: '+name
    if p.exists() and name != 'index.html':
        assert p.read_bytes() == content, 'Arquivo já existe e difere: '+name
print('COMPARACAO_OK', digest(before), '->', digest(after), 'somente bloco da obra')
if '--apply' not in sys.argv:
    print('MODO_CONFERENCIA: nenhum arquivo alterado'); sys.exit(0)
backup_root = ROOT.parent / 'nib-manutencao'
backup_root.mkdir(mode=0o700, exist_ok=True)
backup = Path(tempfile.mkdtemp(prefix='obra-fonte-unica-20261103-', dir=backup_root)); os.chmod(backup, 0o700)
missing = []
for name in files:
    p = ROOT / name
    if p.exists():
        dest = backup / name; dest.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(p, dest)
    else: missing.append(name)
(backup/'manifesto.json').write_text(json.dumps({'antes':digest(before),'depois':digest(after),'novos':missing,'arquivos':list(files)}, indent=2))
assert index.read_bytes() == before, 'Produção mudou durante o backup'
created_dir = not data_dir.exists()
data_dir.mkdir(mode=0o755, exist_ok=True)
changed=[]
def atomic_write(path,content,mode=0o644):
    fd, temp = tempfile.mkstemp(prefix='.nib-obra-', dir=path.parent)
    try:
        with os.fdopen(fd,'wb') as f: f.write(content); f.flush(); os.fsync(f.fileno())
        os.chmod(temp,mode); os.replace(temp,path)
    finally:
        if os.path.exists(temp): os.unlink(temp)
try:
    for name, content in files.items():
        p=ROOT/name
        mode = (p.stat().st_mode & 0o777) if p.exists() else 0o644
        atomic_write(p,content,mode); changed.append(name)
    assert index.read_bytes().replace(new,old,1) == before
    assert json.loads((ROOT/'dados/obra.json').read_text()) == PAYLOAD['data']
    for name,content in files.items(): assert (ROOT/name).read_bytes() == content
except BaseException:
    for name in reversed(changed):
        p=ROOT/name; saved=backup/name
        if saved.exists(): shutil.copy2(saved,p)
        elif p.exists() and p.read_bytes()==files[name]: p.unlink()
    if created_dir and not any(data_dir.iterdir()): data_dir.rmdir()
    raise
print('PUBLICACAO_OK')
print('BACKUP_PRIVADO',str(backup))
for name,content in files.items(): print(digest(content),name)
