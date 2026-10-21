<?php
declare(strict_types=1);
if(!defined('NIB_EVENTOS_RUNTIME')){http_response_code(404);exit;}
function nibe_private():string{
 $web=realpath($_SERVER['DOCUMENT_ROOT']??'');if(!$web||$web==='/')throw new RuntimeException('Raiz indisponível.');
 $base=realpath(dirname($web).'/nib-inscricoes-privado');if(!$base||str_starts_with($base.'/',$web.'/'))throw new RuntimeException('Armazenamento indisponível.');return $base;
}
function nibe_h($s):string{return htmlspecialchars((string)$s,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
function nibe_write(string $path,array $v):void{nibe_bytes($path,json_encode($v,JSON_THROW_ON_ERROR|JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));}
function nibe_bytes(string $path,string $v):void{$tmp=$path.'.'.bin2hex(random_bytes(8)).'.tmp';try{if(file_put_contents($tmp,$v,LOCK_EX)===false||!rename($tmp,$path))throw new RuntimeException('Não foi possível salvar.');}finally{if(is_file($tmp))unlink($tmp);}}
function nibe_catalog():array{$p=nibe_private().'/eventos-catalogo.json';if(!is_file($p)||is_link($p))throw new RuntimeException('Catálogo não instalado.');$v=json_decode((string)file_get_contents($p),true);if(!is_array($v))throw new RuntimeException('Catálogo inválido.');return $v;}
function nibe_admin():bool{return !empty($_SESSION['catalog_admin_at'])&&time()-(int)$_SESSION['catalog_admin_at']<7200;}
function nibe_text($v,int $max=200):string{if(!is_string($v))return '';return trim(function_exists('mb_substr')?mb_substr($v,0,$max,'UTF-8'):substr($v,0,$max));}
function nibe_url($v,bool $required=false):string{$s=nibe_text($v,1000);if($s===''){if($required)throw new RuntimeException('Informe o link externo.');return '';}$u=parse_url($s);if(($u['scheme']??'')!=='https'||empty($u['host'])||isset($u['user'])||isset($u['pass']))throw new RuntimeException('Use um endereço HTTPS válido.');return $s;}
function nibe_money(int $cents):string{return 'R$ '.number_format($cents/100,2,',','.');}
function nibe_asset(string $p):bool{return preg_match('~^/img/eventos/[A-Za-z0-9_./-]+\.(png|jpg|jpeg|webp)$~D',$p)===1&&!str_contains($p,'..')&&is_file(($_SERVER['DOCUMENT_ROOT']??'').$p)&&!is_link(($_SERVER['DOCUMENT_ROOT']??'').$p);}
function nibe_upload(array $f,string $dir,int $max=8388608,bool $banner=true,int $minWidth=600):string{
 if(($f['error']??UPLOAD_ERR_NO_FILE)!==UPLOAD_ERR_OK||($f['size']??0)<1||$f['size']>$max||!is_uploaded_file($f['tmp_name']??''))throw new RuntimeException('Arquivo inválido ou acima do limite.');
 $mime=(new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);$ext=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'];if(!$banner)$ext['application/pdf']='pdf';if(!isset($ext[$mime]))throw new RuntimeException('Formato de arquivo não permitido.');
 if($banner){$d=getimagesize($f['tmp_name']);if(!$d||$d[0]<$minWidth||$d[1]<min(250,$minWidth)||$d[0]>12000||$d[1]>12000)throw new RuntimeException('Use imagem entre 600 × 250 e 12000 × 12000 pixels.');}
 if(is_link($dir))throw new RuntimeException('Pasta inválida.');if(!is_dir($dir)&&!mkdir($dir,$banner?0755:0700,true)&&!is_dir($dir))throw new RuntimeException('Pasta indisponível.');
 $name=bin2hex(random_bytes(16)).'.'.$ext[$mime];if(!move_uploaded_file($f['tmp_name'],$dir.'/'.$name))throw new RuntimeException('Falha no upload.');chmod($dir.'/'.$name,$banner?0644:0600);return $name;
}
function nibe_validate(array $p,?array $old):array{
 $e=$old??[];$e['name']=nibe_text($p['name']??'',100);$e['slug']=nibe_text($p['slug']??'',70);
 if($e['name']===''||!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D',$e['slug']))throw new RuntimeException('Informe nome e endereço com letras minúsculas, números e hífens.');
 if($old&&$e['slug']!==$old['slug'])throw new RuntimeException('O endereço não pode ser alterado após criar.');
 foreach(['category'=>100,'summary'=>350,'description'=>6000,'location'=>160,'address'=>300,'audience'=>160,'speaker'=>160,'cta'=>60,'pix_key'=>160,'pix_receiver'=>160,'pix_code'=>700] as $k=>$max)$e[$k]=nibe_text($p[$k]??'',$max);
 if($e['category']===''||$e['summary']===''||$e['location']==='')throw new RuntimeException('Informe categoria, resumo e local.');
 foreach(['start','end','registration_start','registration_end'] as $k){$v=nibe_text($p[$k]??'',16);if($v!==''&&!preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/D',$v))throw new RuntimeException('Data ou horário inválido.');if($v!==''){$d=DateTimeImmutable::createFromFormat('!Y-m-d\TH:i',$v,new DateTimeZone('America/Porto_Velho'));if(!$d||$d->format('Y-m-d\TH:i')!==$v)throw new RuntimeException('Data inválida.');}$e[$k]=$v;}
 if($e['start']==='')throw new RuntimeException('Informe início do evento.');
 if($e['end']!==''&&$e['end']<$e['start'])throw new RuntimeException('O término deve ser posterior ao início.');
 if($e['registration_start']!==''&&$e['registration_end']!==''&&$e['registration_end']<$e['registration_start'])throw new RuntimeException('Confira o período das inscrições.');
 $e['mode']=nibe_text($p['mode']??'',20);if(!in_array($e['mode'],['pago','gratuito','externo','sem-inscricao'],true))throw new RuntimeException('Tipo de inscrição inválido.');
 $raw=nibe_text($p['amount']??'',20);if($raw!==''&&!preg_match('/^\d{1,6}(?:[.,]\d{1,2})?$/D',$raw))throw new RuntimeException('Valor inválido.');$e['amount_cents']=(int)round((float)str_replace(',','.',$raw)*100);
 if($e['mode']==='pago'&&($e['amount_cents']<=0||$e['pix_key']===''||$e['pix_receiver']===''))throw new RuntimeException('Informe valor, chave Pix e recebedor.');if($e['mode']!=='pago')$e['amount_cents']=0;
 $e['external_url']=nibe_url($p['external_url']??'',$e['mode']==='externo');$e['capacity']=filter_var($p['capacity']??0,FILTER_VALIDATE_INT,['options'=>['min_range'=>0,'max_range'=>100000]]);if($e['capacity']===false)throw new RuntimeException('Limite de vagas inválido.');
 $e['min_age']=(int)($p['min_age']??0);$e['max_age']=(int)($p['max_age']??0);if($e['min_age']<0||$e['min_age']>120||$e['max_age']<0||$e['max_age']>120||($e['max_age']>0&&$e['max_age']<$e['min_age']))throw new RuntimeException('Faixa etária inválida.');
 $e['time_unconfirmed']=!empty($old['time_unconfirmed'])&&$e['start']===($old['start']??'');
 $e['birth_required']=isset($p['birth_required'])||$e['min_age']>0||$e['max_age']>0;$e['guardian_required']=isset($p['guardian_required']);$e['health_field']=isset($p['health_field']);
 $e['crop']=in_array($p['crop']??'',['cover','contain','mulheres'],true)?$p['crop']:'cover';$e['position_x']=max(0,min(100,(int)($p['position_x']??50)));$e['position_y']=max(0,min(100,(int)($p['position_y']??50)));$e['order']=max(0,min(999,(int)($p['order']??10)));
 $e['publication']=in_array($p['publication']??'',['rascunho','publicado','encerrado'],true)?$p['publication']:'rascunho';
 if(!empty($old['legacy'])){foreach(['mode','amount_cents','pix_key','pix_receiver','pix_code','external_url','capacity','min_age','max_age','birth_required','guardian_required','health_field'] as $k)$e[$k]=$old[$k]??null;}
 return $e;
}
function nibe_open(array $e):bool{
 if(($e['publication']??'')!=='publicado')return false;$now=(new DateTimeImmutable('now',new DateTimeZone('America/Porto_Velho')))->format('Y-m-d\TH:i');return (empty($e['registration_start'])||$now>=$e['registration_start'])&&(empty($e['registration_end'])||$now<=$e['registration_end']);
}
function nibe_page(array $e):string{return !empty($e['legacy'])?$e['legacy_page']:'/eventos/?evento='.rawurlencode($e['slug']);}
function nibe_image(array $e):string{
 $style=$e['crop']==='mulheres'?'position:absolute;left:-16.68056714%;top:0;width:133.36113428%;max-width:none;height:100%;object-fit:fill;':'width:100%;height:100%;object-fit:'.$e['crop'].';object-position:'.(int)$e['position_x'].'% '.(int)$e['position_y'].'%;';
 return '<div style="position:relative;aspect-ratio:1199/600;overflow:hidden;background:#041e42"><img src="'.nibe_h($e['banner']).'" alt="'.nibe_h($e['name']).'" loading="lazy" style="'.nibe_h($style).'display:block"></div>';
}
function nibe_carousel(array $events):string{
 $events=array_values(array_filter($events,static fn($e)=>($e['publication']??'')==='publicado'));usort($events,static fn($a,$b)=>($a['order']??10)<=>($b['order']??10));
 if(!$events)return '<section id="mulheres-virtuosas" class="mv-event-section event-carousel-section" aria-label="Eventos em destaque" hidden></section>';
 $s='<section id="mulheres-virtuosas" class="mv-event-section event-carousel-section" aria-label="Eventos em destaque"><div class="event-carousel-viewport" data-event-carousel tabindex="0" aria-roledescription="carrossel" aria-label="Eventos em destaque">';$dots='';
 foreach($events as $i=>$e){$url=nibe_page($e);$date=(new DateTimeImmutable($e['start']))->format(!empty($e['time_unconfirmed'])?'d/m/Y':'d/m/Y · H:i');if(!empty($e['end'])&&substr($e['end'],0,10)!==substr($e['start'],0,10))$date.=' até '.(new DateTimeImmutable($e['end']))->format('d/m/Y');$cta=$e['cta']?:($e['mode']==='sem-inscricao'?'Saiba mais':'Inscreva-se');$price=$e['mode']==='pago'?nibe_money((int)$e['amount_cents']):($e['mode']==='gratuito'?'Gratuita':($e['mode']==='externo'?'Inscrição externa':'Entrada livre'));$active=$i===0;
 $s.='<article class="event-slide'.($active?' is-active':'').'" data-event-slide aria-hidden="'.($active?'false':'true').'" aria-label="'.($i+1).' de '.count($events).' · '.nibe_h($e['name']).'"><div class="wrap mv-event-grid"><a href="'.nibe_h($url).'" aria-label="'.nibe_h($e['name']).'">'.nibe_image($e).'</a><div class="mv-event-copy"><span class="eyebrow">'.nibe_h($e['category']).'</span><h2 class="h-sec">'.nibe_h($e['name']).'</h2><p class="lead">'.nibe_h($e['summary']).'</p><dl class="mv-event-details"><div><dt>Data e horário</dt><dd>'.nibe_h($date).'</dd></div><div><dt>Local</dt><dd>'.nibe_h($e['location']).'</dd></div><div><dt>Inscrição</dt><dd>'.nibe_h($price).'</dd></div></dl><div class="mv-event-enrollment"><span class="mv-event-status">'.(nibe_open($e)?($e['mode']==='sem-inscricao'?'Participe com a gente':'Inscrições abertas'):'Confira as informações').'</span><a class="btn mv-event-cta" href="'.nibe_h($url).'">'.nibe_h($cta).'</a></div></div></div></article>';
 $dots.='<button class="event-carousel-dot'.($active?' is-active':'').'" type="button" data-event-dot aria-label="'.nibe_h($e['name']).'" aria-current="'.($active?'true':'false').'">'.nibe_h($e['name']).'</button>';
 }
 return $s.'</div><div class="event-carousel-controls" aria-label="Navegação dos eventos"><div class="event-carousel-dots" role="tablist" aria-label="Selecionar evento">'.$dots.'</div></div></section>';
}
/* Find a closing div without parsing/reformatting existing HTML. */
function nibe_div_close(string $html,int $open):int{
 preg_match_all('~<!--.*?-->|<div\b(?:"[^"]*"|\'[^\']*\'|[^\'">])*>|</div\s*>~s',$html,$tokens,PREG_OFFSET_CAPTURE,$open);$depth=0;
 foreach($tokens[0] as [$tag,$offset]){if(str_starts_with($tag,'<!--'))continue;if(preg_match('~^</div~',$tag)){$depth--;if($depth===0)return $offset;}else{$depth++;}}
 throw new RuntimeException('Estrutura do carrossel não reconhecida. A home foi preservada.');
}
function nibe_merge_carousel(string $home,array $catalog):string{
 $pattern='~<section\b[^>]*\bid="mulheres-virtuosas"[^>]*>.*?</section>~s';
 if(preg_match_all($pattern,$home,$sections,PREG_OFFSET_CAPTURE)!==1)throw new RuntimeException('Carrossel não identificado. A home foi preservada.');
 [$section,$sectionOffset]=$sections[0][0];
 // Replace only content explicitly owned by this module. Everything else stays byte-for-byte.
 foreach(['SLIDES','DOTS'] as $kind){
  $begin='<!-- NIB-MANAGED-'.$kind.'-BEGIN -->';$end='<!-- NIB-MANAGED-'.$kind.'-END -->';
  $nb=substr_count($section,$begin);$ne=substr_count($section,$end);
  if($nb!==$ne||$nb>1)throw new RuntimeException('Marcadores inconsistentes. A home foi preservada.');
  if($nb===1){$a=strpos($section,$begin);$b=strpos($section,$end);if($b<$a)throw new RuntimeException('Marcadores inválidos. A home foi preservada.');$section=substr_replace($section,'',$a,$b+strlen($end)-$a);}
 }
 $managed=array_filter($catalog,static fn($e)=>empty($e['legacy'])&&($e['publication']??'')==='publicado');
 // Legacy events are never regenerated or removed, regardless of catalog metadata.
 $slides='';$dots='';
 if($managed){
  $generated=nibe_carousel($managed);preg_match_all('~<article\b[^>]*>.*?</article>~s',$generated,$articles);preg_match_all('~<button\b[^>]*data-event-dot[^>]*>.*?</button>~s',$generated,$buttons);
  if(count($articles[0])!==count($managed)||count($buttons[0])!==count($managed))throw new RuntimeException('Falha ao preparar o evento. A home foi preservada.');
  preg_match_all('~<article\b[^>]*\bdata-event-slide\b~',$section,$legacySlides);$baseCount=count($legacySlides[0]);$newNumber=0;
  foreach($articles[0] as $article){$newNumber++;$article=preg_replace('~aria-label="\d+ de \d+ · ~','aria-label="'.($baseCount+$newNumber).' de '.($baseCount+count($managed)).' · ',$article,1);$article=preg_replace('~class="event-slide is-active"~','class="event-slide"',$article,1);$article=preg_replace('~aria-hidden="false"~','aria-hidden="true"',$article,1);$slides.=$article;}
  foreach($buttons[0] as $button){$button=str_replace('class="event-carousel-dot is-active"','class="event-carousel-dot"',$button);$button=str_replace('aria-current="true"','aria-current="false"',$button);$dots.=$button;}
 }
 if(!preg_match('~<div\b[^>]*\bdata-event-carousel(?=[\s=>])[^>]*>~s',$section,$viewport,PREG_OFFSET_CAPTURE))throw new RuntimeException('Área dos slides não encontrada. A home foi preservada.');
 $slideClose=nibe_div_close($section,$viewport[0][1]);
 if($slides!=='')$section=substr_replace($section,'<!-- NIB-MANAGED-SLIDES-BEGIN -->'.$slides.'<!-- NIB-MANAGED-SLIDES-END -->',$slideClose,0);
 if(!preg_match('~<div\b[^>]*class="[^"]*\bevent-carousel-dots\b[^"]*"[^>]*>~s',$section,$controls,PREG_OFFSET_CAPTURE))throw new RuntimeException('Controles não encontrados. A home foi preservada.');
 $dotsClose=nibe_div_close($section,$controls[0][1]);
 if($dots!=='')$section=substr_replace($section,'<!-- NIB-MANAGED-DOTS-BEGIN -->'.$dots.'<!-- NIB-MANAGED-DOTS-END -->',$dotsClose,0);
 return substr_replace($home,$section,$sectionOffset,strlen($sections[0][0][0]));
}

function nibe_save(array $e,?string $eventPassword=null):void{
 $base=nibe_private();$createdFolder='';$createdConfig='';$committed=false;$lock=fopen($base.'/.catalogo-lock','c');if(!$lock||!flock($lock,LOCK_EX))throw new RuntimeException('Cadastro ocupado. Tente novamente.');
 try{
  $cat=nibe_catalog();$slug=$e['slug'];$new=!isset($cat[$slug]);
  if(!$new&&!empty($cat[$slug]['legacy']))throw new RuntimeException('Evento existente protegido. Textos, links e definições atuais não serão alterados.');
  if(!$new&&($cat[$slug]['updated_at']??'')!==($e['updated_at']??''))throw new RuntimeException('Este evento foi atualizado em outra aba. Reabra antes de salvar.');
  $e['updated_at']=bin2hex(random_bytes(12));
  if($new){$e['legacy']=false;$e['folder']='evento-'.$slug;$e['config']='administracao-evento-'.$slug.'.json';if(is_dir($base.'/'.$e['folder'])||is_file($base.'/'.$e['config']))throw new RuntimeException('Endereço já utilizado.');if(in_array($e['mode'],['pago','gratuito'],true)){if(!is_string($eventPassword)||strlen($eventPassword)<12||strlen($eventPassword)>72)throw new RuntimeException('Defina uma senha do evento com 12 a 72 caracteres.');}}
  if(!nibe_asset($e['banner']))throw new RuntimeException('Escolha uma imagem de banner válida.');
  $cat[$slug]=$e;
  $home=($_SERVER['DOCUMENT_ROOT']??'').'/index.html';$original=(string)file_get_contents($home);$pattern='~<section\b[^>]*\bid="mulheres-virtuosas"[^>]*>.*?</section>~s';
  if(preg_match_all($pattern,$original)!==1)throw new RuntimeException('Não foi possível identificar o carrossel. Nada publicado.');
  // Only update the homepage when publication can change. Draft creation leaves it unchanged.
  
  $oldcat=nibe_catalog();$affects=$e['publication']==='publicado'||(($oldcat[$slug]['publication']??'')==='publicado');
  $updated=$affects?nibe_merge_carousel($original,$cat):$original;
  $backup=$base.'/historico-eventos';if(!is_dir($backup)&&!mkdir($backup,0700,true)&&!is_dir($backup))throw new RuntimeException('Backup indisponível.');$stamp=gmdate('Ymd-His').'-'.bin2hex(random_bytes(4));
  nibe_write($backup.'/'.$stamp.'-catalogo.json',$oldcat);if($affects)nibe_bytes($backup.'/'.$stamp.'-home.html',$original);
  if($new&&in_array($e['mode'],['pago','gratuito'],true)){$createdFolder=$base.'/'.$e['folder'];$createdConfig=$base.'/'.$e['config'];if(!mkdir($createdFolder,0700))throw new RuntimeException('Falha ao preparar inscrições.');nibe_write($base.'/'.$e['config'],['password_hash'=>password_hash($eventPassword,PASSWORD_DEFAULT)]);}
  nibe_write($base.'/eventos-catalogo.json',$cat);
  if($affects){try{if((string)file_get_contents($home)!==$original)throw new RuntimeException('A home foi atualizada em outra operação. Tente novamente.');nibe_bytes($home,$updated);chmod($home,0644);}catch(Throwable $err){nibe_write($base.'/eventos-catalogo.json',$oldcat);throw $err;}}
  $committed=true;
 }finally{if(!$committed&&$createdFolder!==''){if($createdConfig!==''&&is_file($createdConfig))unlink($createdConfig);if(is_dir($createdFolder)&&count(scandir($createdFolder)?:[])===2)rmdir($createdFolder);}flock($lock,LOCK_UN);fclose($lock);}
}
