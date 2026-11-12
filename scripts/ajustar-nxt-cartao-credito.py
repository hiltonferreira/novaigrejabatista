import hashlib, os, shutil, tempfile
from pathlib import Path
pairs = (
 ('Pague com Pix ou com cartão: crédito em até 2x ou débito.', 'Pague com Pix ou cartão de crédito.'),
 ('<h3>Cartão de crédito ou débito</h3>', '<h3>Cartão de crédito</h3>'),
 ('Crédito em até 2x ou débito, pela página segura da Sipag (Sicoob).', 'Pague com cartão de crédito na página da Sipag (Sicoob).'),
 ('>Pagar com cartão</a>', '>Pagar com cartão de crédito</a>'),
)
def ajustar(data):
 s=data.decode()
 for old,new in pairs:
  assert s.count(old)==1, 'Trecho não corresponde ao conferido'
  s=s.replace(old,new,1)
 assert 'débito' not in s and 'até 2x' not in s
 return s.encode()

if __name__=='__main__':
 import sys
 if len(sys.argv)==3:
  Path(sys.argv[2]).write_bytes(ajustar(Path(sys.argv[1]).read_bytes()))
 else:
  p=Path('/home/novaigre/public_html/next/camp-sbgp1-nov26/inscricao.html')
  assert p.is_file() and not p.is_symlink()
  old=p.read_bytes()
  new=ajustar(old)
  backup=Path(tempfile.mkdtemp(prefix='nib-nxt-credito-',dir='/home/novaigre/nib-manutencao'))
  shutil.copy2(p,backup/p.name)
  assert (backup/p.name).read_bytes()==old
  fd,tmp=tempfile.mkstemp(prefix='.nib-credito-',dir=p.parent)
  try:
   with os.fdopen(fd,'wb') as f:f.write(new)
   shutil.copymode(p,tmp)
   assert p.read_bytes()==old
   os.replace(tmp,p)
   assert p.read_bytes()==new
  finally:
   if os.path.exists(tmp):os.unlink(tmp)
  print('PUBLICADO: Pix ou cartão de crédito')
  print('BACKUP:',backup)
  print('SHA256:',hashlib.sha256(new).hexdigest())
