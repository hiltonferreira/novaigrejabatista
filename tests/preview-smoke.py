"""Smoke HTTP local: somente dados e armazenamento temporários fictícios."""
import http.cookiejar,json,pathlib,re,socket,subprocess,time,urllib.parse,urllib.request
output=subprocess.check_output(['php','tests/preview.php','--prepare-only'],text=True)
manifest=json.loads(pathlib.Path(re.search(r'PREVIEW_MANIFEST=(.+)',output).group(1).strip()).read_text())
with socket.socket() as sock:
 sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
base=f'http://127.0.0.1:{port}'
proc=subprocess.Popen(['php','-S',f'127.0.0.1:{port}','-t',manifest['web']],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def request(path,data=None):
 body=urllib.parse.urlencode(data).encode() if data is not None else None
 with opener.open(base+path,body,timeout=10) as response:return response.read().decode()
try:
 for attempt in range(50):
  try:login=request('/inscricoes/eventos.php');break
  except (OSError,urllib.error.URLError):time.sleep(.1)
 else:raise RuntimeError('Servidor de teste indisponível')
 csrf=re.search(r'name="csrf" value="([^"]+)"',login).group(1)
 panel=request('/inscricoes/eventos.php',{'csrf':csrf,'action':'login','password':manifest['password']})
 assert 'DEMONSTRAÇÃO' in panel,'Eventos fictícios ausentes no painel'
 editor=request('/inscricoes/eventos.php?novo=1')
 assert 'data-field-list' in editor and 'show_hero' in editor,'Editor configurável ausente'
 form=request('/eventos/?evento=demonstracao-gratuito')
 preview=request('/eventos/?evento=demonstracao-gratuito&preview=1')
 assert 'class="preview-fields" disabled' in preview and 'Nome completo' in preview,'Prévia não mostra campos desativados'
 paid=request('/eventos/?evento=demonstracao-pago')
 assert paid.count('data-event-step>')==3 and 'eventos/formulario.js?v=5.3' in paid,'Etapas pagas ausentes'
 assert 'Voltar ao evento' in request('/next/camp-sbgp1-nov26/inscricao.html'),'Formulário legado não está disponível na cópia local'
 ticket=re.search(r'name="ticket" value="([^"]+)"',form).group(1)
 try:
  request('/eventos/?evento=demonstracao-gratuito&preview=1',{'ticket':ticket,'name':'Teste bloqueado','phone':'69999990000','consent':'yes','answers[f_turma]':'Turma A'})
  raise AssertionError('Prévia aceitou POST')
 except urllib.error.HTTPError as error:
  assert error.code==409,'Prévia retornou status inesperado'
 assert not list(pathlib.Path(manifest['private'],'evento-demonstracao-gratuito').glob('*.json')),'Prévia gravou inscrição'
 done=request('/eventos/?evento=demonstracao-gratuito',{'ticket':ticket,'name':'Pessoa Fictícia','phone':'69999990000','consent':'yes','answers[f_turma]':'Turma A'})
 assert 'INSCRIÇÃO RECEBIDA' in done,'Inscrição fictícia não concluída'
 files=list(pathlib.Path(manifest['private'],'evento-demonstracao-gratuito').glob('*.json'))
 assert len(files)==1,'Quantidade inesperada de registros'
 row=json.loads(files[0].read_text());assert row['answers']['f_turma']=='Turma A'
 assert row['form_schema'][0]['label']=='Turma de demonstração'
 again=request('/eventos/?evento=demonstracao-gratuito',{'ticket':ticket,'name':'Pessoa Fictícia','phone':'69999990000','consent':'yes','answers[f_turma]':'Turma A'})
 assert 'INSCRIÇÃO RECEBIDA' in again and len(list(pathlib.Path(manifest['private'],'evento-demonstracao-gratuito').glob('*.json')))==1,'Reenvio duplicou inscrição'
 promotion=json.loads(request('/eventos/divulgacao.php'));assert len(promotion['events'])==2
 assert 'password' not in json.dumps(promotion) and 'pix_key' not in json.dumps(promotion),'Endpoint expõe configuração privada'
 csv=request('/inscricoes/?evento=demonstracao-gratuito&export=1');assert 'Turma A' in csv and 'Pessoa Fictícia' in csv
 print('OK: prévia isolada, login, editor, formulário gratuito HTTP, esquema histórico, reenvio, divulgação e CSV.')
finally:proc.terminate();proc.wait(timeout=10)
