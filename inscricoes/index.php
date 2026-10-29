<?php
declare(strict_types=1);
ini_set('display_errors','0');
umask(0077);
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');
header("Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; form-action 'self'; base-uri 'none'");
session_name('nib_inscricoes');
session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off','httponly'=>true,'samesite'=>'Lax']);
session_start();
$_SESSION['csrf']??=bin2hex(random_bytes(32));
$events=[
 'mulheres-virtuosas'=>['name'=>'Mulheres Virtuosas','date'=>'2026-10-30','status'=>'ativo','folder'=>'mulheres-2026-10-30','config'=>'administracao-mulheres.json','amount'=>20,'page'=>'/mulheres-virtuosas.html','kind'=>'local'],
 'nxt-camp'=>['name'=>'NXT CAMP','date'=>'2026-11-21','status'=>'ativo','folder'=>'nxt-camp-2026-11-21','config'=>'administracao-nxt.json','amount'=>80,'page'=>'/next/camp-sbgp1-nov26/','kind'=>'local'],
 'jornada-dna'=>['name'=>'Jornada DNA','date'=>null,'status'=>'ativo','kind'=>'externo','page'=>'/jornada-dna/'],
];
define('NIB_EVENTOS_RUNTIME',true);
require __DIR__.'/eventos-lib.php';
require __DIR__.'/fluxos-lib.php';
// Uma única sessão geral protege toda a gestão, inclusive exportações e comprovantes.
if(!nibe_admin()){header('Location: /inscricoes/eventos.php?acesso=painel',true,303);exit;}
$_SESSION['catalog_admin_at']=time();
$catalog=[];
try{
 $catalog=nibe_catalog();
 foreach($catalog as $key=>$item){
  if(!empty($item['legacy'])&&isset($events[$key])){$events[$key]['publication']='publicado';$events[$key]['mode']=$item['mode'];continue;}
  if(empty($item['legacy'])&&$item['publication']==='rascunho'&&!nibe_admin())continue;
  $events[$key]=['name'=>$item['name'],'date'=>substr($item['start'],0,10),'status'=>$item['publication']==='rascunho'?'rascunho':($item['publication']==='encerrado'?'encerrado':'ativo'),'folder'=>$item['folder']??'','config'=>$item['config']??'','amount'=>($item['amount_cents']??0)/100,'page'=>nibe_page($item),'kind'=>in_array($item['mode'],['pago','gratuito'],true)?'local':'externo','mode'=>$item['mode'],'publication'=>$item['publication'],'banner'=>$item['banner']];
 }
}catch(Throwable $e){error_log('NIB event catalog unavailable: '.$e->getMessage());}
// NIB Jornada DNA: acervo importado, protegido pela autenticação geral.
$dnaMetaPath=nibe_private().'/jornada-dna-importacao.json';
if(is_file($dnaMetaPath)&&!is_link($dnaMetaPath)){
 $dnaMeta=json_decode((string)file_get_contents($dnaMetaPath),true,512,JSON_THROW_ON_ERROR);
 if(($dnaMeta['folder']??'')!=='jornada-dna-2026-10-25')throw new RuntimeException('Acervo DNA inválido.');
 $events['jornada-dna']=array_replace($events['jornada-dna'],['date'=>'2026-10-25','kind'=>'local','folder'=>'jornada-dna-2026-10-25','config'=>'','amount'=>0,'imported'=>true]);
}
function h($v):string{return htmlspecialchars((string)$v,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
function when($v):string{try{return (new DateTimeImmutable((string)$v))->setTimezone(new DateTimeZone('America/Porto_Velho'))->format('d/m/Y · H:i');}catch(Throwable $e){return 'Data não informada';}}
function phone($v):string{$n=preg_replace('/\D/','',(string)$v)??'';if(strlen($n)>11&&str_starts_with($n,'55'))$n=substr($n,2);if(strlen($n)===11)return '('.substr($n,0,2).') '.substr($n,2,5).'-'.substr($n,7);if(strlen($n)===10)return '('.substr($n,0,2).') '.substr($n,2,4).'-'.substr($n,6);return (string)$v?:'Não informado';}
function icon(string $name):string{$paths=['download'=>'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5','receipt'=>'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6','check'=>'M5 12l4 4L19 6','grid'=>'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z','calendar'=>'M4 5h16v16H4z M8 3v4 M16 3v4 M4 11h16','archive'=>'M3 4h18v5H3z M5 9v12h14V9 M10 13h4','arrow'=>'M5 12h14 M13 6l6 6-6 6','exit'=>'M10 4H4v16h6 M8 12h13 M16 7l5 5-5 5'];return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'.'<path d="'.($paths[$name]??$paths['grid']).'"/></svg>';}
function cash(float $v):string{return 'R$ '.number_format($v,2,',','.');}
function go(string $id=''):never{header('Location: /inscricoes/'.($id!==''?'?evento='.rawurlencode($id):''),true,303);exit;}
function granted(string $id):bool{return nibe_admin();}
function putjson(string $path,array $row):void{
 $tmp=$path.'.'.bin2hex(random_bytes(6)).'.tmp';
 try{if(file_put_contents($tmp,json_encode($row,JSON_THROW_ON_ERROR|JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT),LOCK_EX)===false||!rename($tmp,$path))throw new RuntimeException('write failed');}
 finally{if(is_file($tmp))unlink($tmp);}
}
function records(string $folder):array{
 $out=[];
 foreach(glob($folder.'/*.json')?:[] as $p){$id=basename($p,'.json');if(!preg_match('/^[a-f0-9]{32}$/D',$id)||is_link($p))continue;$r=json_decode((string)file_get_contents($p),true);if(!is_array($r)||empty($r['protocol']))continue;$r['_id']=$id;$out[]=$r;}
 usort($out,static fn($a,$b)=>strcmp((string)($b['created_at']??''),(string)($a['created_at']??'')));return $out;
}
function receipt_path(string $folder,array $r,string $id):string{
 $name=$r['receipt']??'';
 if(!is_string($name)||!preg_match('/^'.preg_quote($id,'/').'\.(jpg|png|webp|pdf)$/D',$name))throw new RuntimeException('invalid receipt');
 $p=$folder.'/'.$name;if(is_link($p))throw new RuntimeException('invalid receipt');return $p;
}
function cs():string{return '<input type="hidden" name="csrf" value="'.h($_SESSION['csrf']).'">';}
$id=is_string($_GET['evento']??null)?$_GET['evento']:'';
$ev=$events[$id]??null;
if($id!==''&&!$ev){http_response_code(404);exit('Evento não encontrado.');}
$free=($ev['mode']??'')==='gratuito';
$view=is_string($_GET['aba']??null)?$_GET['aba']:'inscritos';if($free&&$view==='pagamentos')$view='inscritos';
if(!in_array($view,['inscritos','pagamentos','relatorios','lixeira'],true))$view='inscritos';
$error='';$notice=$_SESSION['notice']??'';unset($_SESSION['notice']);$rows=[];$available=false;$base='';$folder='';$config=[];
try{
 $web=realpath($_SERVER['DOCUMENT_ROOT']??'');
 if(!$web||$web==='/')throw new RuntimeException('invalid root');
 $base=realpath(dirname($web).'/nib-inscricoes-privado')?:'';
 if(!$base||str_starts_with($base.'/',$web.'/'))throw new RuntimeException('private storage unavailable');
 $statusPath=$base.'/eventos-painel.json';
 if(is_file($statusPath)&&!is_link($statusPath)){
  $saved=json_decode((string)file_get_contents($statusPath),true);
  if(is_array($saved))foreach($saved as $key=>$value)if(!isset($catalog[$key])&&isset($events[$key])&&in_array($value,['ativo','encerrado'],true))$events[$key]['status']=$value;
  $ev=$events[$id]??null;
 }
 if($ev&&$ev['kind']==='local'){
  $folder=$base.'/'.$ev['folder'];$cfgpath=$base.'/'.$ev['config'];
  if(!empty($ev['imported'])){if(is_link($folder)||!is_dir($folder)||dirname(realpath($folder)?:'')!==$base)throw new RuntimeException('archive unavailable');$available=true;}else{
  if(is_link($folder)||is_link($cfgpath)||!is_dir($folder)||!is_file($cfgpath))throw new RuntimeException('event unavailable');
  $config=json_decode((string)file_get_contents($cfgpath),true);
  if(!is_array($config)||!is_string($config['password_hash']??null))throw new RuntimeException('invalid config');
  $available=true;
  }
 }
 if($_SERVER['REQUEST_METHOD']==='POST'){
  if(!is_string($_POST['csrf']??null)||!hash_equals($_SESSION['csrf'],$_POST['csrf'])){http_response_code(403);throw new RuntimeException('csrf');}
  $action=$_POST['action']??'';
  if($action==='logout'){
   $_SESSION['access']=[];unset($_SESSION['catalog_admin_at']);session_regenerate_id(true);$_SESSION['csrf']=bin2hex(random_bytes(32));go();
  }
  if(!$ev||!$available){http_response_code(400);throw new RuntimeException('invalid event');}
  {
   if(!granted($id)){http_response_code(403);throw new RuntimeException('not authenticated');}
   if($action==='event_status'){
    if(isset($catalog[$id])){http_response_code(403);throw new RuntimeException('Use o cadastro de eventos para alterar a publicação.');}
    $newStatus=$_POST['event_status']??'';if(!in_array($newStatus,['ativo','encerrado'],true))throw new RuntimeException('invalid status');
    $l=fopen($base.'/.eventos-painel-lock','c');if(!$l||!flock($l,LOCK_EX))throw new RuntimeException('lock unavailable');
    try{$saved=is_file($statusPath)?json_decode((string)file_get_contents($statusPath),true):[];if(!is_array($saved))throw new RuntimeException('invalid status storage');$saved[$id]=$newStatus;putjson($statusPath,$saved);}finally{flock($l,LOCK_UN);fclose($l);}
    $_SESSION['notice']='Classificação administrativa atualizada. O formulário público não foi alterado.';go($id);
    }elseif($action==='restore'){
    $token=$_POST['token']??'';if(!is_string($token))throw new RuntimeException('invalid token');
    $l=fopen($folder.'/.lock','c');if(!$l||!flock($l,LOCK_EX))throw new RuntimeException('lock unavailable');
    try{nib42_restore($base,$folder,$token);}finally{flock($l,LOCK_UN);fclose($l);}
    $_SESSION['notice']='Inscrição restaurada com sua situação de conferência original.';nib42_return($id);
   }elseif(in_array($action,['review','delete'],true)){
    $rid=$_POST['id']??'';if(!is_string($rid)||!preg_match('/^[a-f0-9]{32}$/D',$rid))throw new RuntimeException('invalid id');
    $l=fopen($folder.'/.lock','c');if(!$l||!flock($l,LOCK_EX))throw new RuntimeException('lock unavailable');
    try{
     $path=$folder.'/'.$rid.'.json';if(is_link($path)||!is_file($path))throw new RuntimeException('record missing');
     $row=json_decode((string)file_get_contents($path),true);if(!is_array($row)||empty($row['protocol']))throw new RuntimeException('invalid record');
     if($action==='review'){
      $to=$_POST['review_to']??'';if(!in_array($to,['0','1'],true))throw new RuntimeException('invalid review state');
      if($to==='0'&&($_POST['confirm_unreview']??'')!=='yes')throw new RuntimeException('confirmation required');
      if($to==='1'&&(float)($row['amount']??$ev['amount'])>0&&empty($row['receipt']))throw new RuntimeException('receipt missing');
      $desired=$to==='1';if($desired!==!empty($row['reviewed'])){$row['reviewed']=$desired;$row['reviewed_at']=$desired?gmdate('c'):null;putjson($path,$row);}
     }
     else{
      if(($_POST['confirm_delete']??'')!=='yes')throw new RuntimeException('confirmation required');
      nib42_archive($base,$folder,$rid,$row);
     }
    }finally{flock($l,LOCK_UN);fclose($l);}
    $_SESSION['notice']=$action==='review'?'Conferência atualizada.':'Inscrição movida para a lixeira. É possível restaurá-la.';nib42_return($id);
   }else{http_response_code(400);throw new RuntimeException('unknown action');}
  }
 }
 if($available&&granted($id)){
  $_SESSION['access'][$id]=time();
  if(isset($_GET['receipt'])){
   $rid=$_GET['receipt'];if(!is_string($rid)||!preg_match('/^[a-f0-9]{32}$/D',$rid)){http_response_code(404);exit;}
   $rp=$folder.'/'.$rid.'.json';$row=is_file($rp)&&!is_link($rp)?json_decode((string)file_get_contents($rp),true):null;
   if(!is_array($row)){http_response_code(404);exit;}
   $path=receipt_path($folder,$row,$rid);$mime=$row['receipt_mime']??'';
   if(!is_file($path)||!in_array($mime,['image/jpeg','image/png','image/webp','application/pdf'],true)){http_response_code(404);exit;}
   header('Content-Type: '.$mime);header('Content-Disposition: inline; filename="comprovante.'.pathinfo($path,PATHINFO_EXTENSION).'"');
   header("Content-Security-Policy: default-src 'none'; sandbox");readfile($path);exit;
  }
  $rows=records($folder);
 }
 if(isset($_GET['receipt'])&&(!$available||!granted($id))){http_response_code(403);exit('Acesso restrito.');}
}catch(Throwable $e){error_log('NIB unified: '.$e->getMessage());$error=$e->getMessage()==='csrf'?'Sessão inválida. Recarregue a página.':'Não foi possível concluir. Confira o acesso e tente novamente.';}
$q=is_string($_GET['q']??null)?trim($_GET['q']):'';
$status=is_string($_GET['status']??null)?$_GET['status']:'';
$filtered=array_values(array_filter($rows,static function($r)use($q,$status,$free){
 if(!$free&&$status==='pendente'&&!empty($r['reviewed']))return false;if(!$free&&$status==='conferido'&&empty($r['reviewed']))return false;
 $hay=implode(' ',array_map(static fn($v)=>is_scalar($v)?(string)$v:'',array_intersect_key($r,array_flip(['name','protocol','whatsapp','phone','guardian','guardian_phone','payer_name','cell','class','address']))));
 if($q==='')return true;$lower=static fn($s)=>function_exists('mb_strtolower')?mb_strtolower($s,'UTF-8'):strtolower($s);
 $digits=preg_replace('/\D/','',$q)??'';return str_contains($lower($hay),$lower($q))||(strlen($digits)>=6&&str_contains(preg_replace('/\D/','',$hay)??'',$digits));
}));
if(isset($_GET['export'])){
 if(!$available||!granted($id)){http_response_code(403);exit('Acesso restrito.');}
 header('Content-Type: text/csv; charset=utf-8');header('Content-Disposition: attachment; filename="inscricoes-'.$id.'.csv"');
 $customColumns=[];foreach($filtered as $record)foreach(($record['form_schema']??[]) as $field)$customColumns[$field['id']]=$field['label'].' ['.$field['id'].']';
 $o=fopen('php://output','w');fwrite($o,"\xEF\xBB\xBF");fputcsv($o,array_merge($free?['Protocolo','Participante','WhatsApp','Data']:(!empty($ev['imported'])?['Protocolo','Participante','WhatsApp','Nascimento','Endereço','Célula','Participação em célula','Turma','Data original','Origem']:['Protocolo','Participante','WhatsApp','Nascimento','Idade','Responsável','WhatsApp responsável','Parentesco','Saúde','Pagador','Valor','Data','Conferido']),array_values($customColumns)),';');
 foreach($filtered as $r){$cells=[$r['protocol']??'',$r['name']??'',$r['whatsapp']??$r['phone']??'',$r['birth']??'',$r['age']??'',$r['guardian']??'',$r['guardian_phone']??'',$r['relationship']??'',$r['health']??'',$r['payer_name']??'',$r['amount']??$ev['amount'],$r['created_at']??'',empty($r['reviewed'])?'Não':'Sim'];if(!empty($ev['imported']))$cells=[$r['protocol']??'',$r['name']??'',$r['whatsapp']??'',$r['birth']??'',$r['address']??'',$r['cell']??'',$r['cell_confirmation']??'',$r['class']??'',$r['source_timestamp']??'',$r['source_label']??''];if($free)$cells=[$r['protocol']??'',$r['name']??'',$r['whatsapp']??$r['phone']??'',$r['created_at']??''];foreach($customColumns as $fieldId=>$unused){$answer=$r['answers'][$fieldId]??'';$cells[]=is_array($answer)?implode(', ',$answer):$answer;}fputcsv($o,array_map(static fn($s)=>preg_match('/^[\s]*[=+@-]/u',(string)$s)?"'".$s:(string)$s,$cells),';');}fclose($o);exit;
}
$reviewed=count(array_filter($rows,static fn($r)=>!empty($r['reviewed'])));$received=0.0;
foreach($rows as $r)if(!empty($r['reviewed']))$received+=(float)($r['amount']??$ev['amount']??0);
$filter=is_string($_GET['filtro']??null)?$_GET['filtro']:'todos';
$eventSummaries=[];
if(!$ev&&$base!=='')foreach($events as $summaryKey=>$summaryEvent){
 if($summaryEvent['kind']!=='local'||($filter!=='todos'&&$summaryEvent['status']!==$filter))continue;
 try{
  $summaryFolder=$summaryEvent['folder']??'';
  if(!preg_match('/^[A-Za-z0-9_-]+$/D',$summaryFolder))throw new RuntimeException('folder');
  $summaryPath=$base.'/'.$summaryFolder;
  if(is_link($summaryPath)||!is_dir($summaryPath)||!is_readable($summaryPath)||dirname(realpath($summaryPath)?:'')!==$base)throw new RuntimeException('folder');
  $summary=['count'=>0,'total_cents'=>0,'reviewed_cents'=>0];
  foreach(records($summaryPath) as $summaryRow){
   $summary['count']++;
   $summaryAmount=$summaryRow['amount']??$summaryEvent['amount']??0;
   if(!is_numeric($summaryAmount)||!is_finite((float)$summaryAmount)||(float)$summaryAmount<0)throw new RuntimeException('amount');
   $summaryCents=(int)round((float)$summaryAmount*100);
   $summary['total_cents']+=$summaryCents;
   if(!empty($summaryRow['reviewed']))$summary['reviewed_cents']+=$summaryCents;
  }
  $eventSummaries[$summaryKey]=$summary;
 }catch(Throwable $summaryError){error_log('NIB resumo indisponível: '.$summaryKey);}
}

?>
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Inscrições · NIB</title><link rel="stylesheet" href="/inscricoes/painel.css?v=2"><link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-nib-32-v113.png?v=2.6"><link rel="stylesheet" href="/inscricoes/resumo-eventos.css?v=3.6"><script src="/inscricoes/resumo-eventos.js?v=3.6" defer></script><link rel="apple-touch-icon" sizes="180x180" href="/inscricoes/app-icon-180-v39.png"><link rel="manifest" href="/inscricoes/app.webmanifest?v=3.9"><meta name="theme-color" content="#041e42"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Gestão NIB"><link rel="stylesheet" href="/inscricoes/navegacao-mobile.css?v=4.0"><link rel="stylesheet" href="/inscricoes/refino-mobile.css?v=4.0"><link rel="stylesheet" href="/inscricoes/layout-mobile.css?v=4.1"><link rel="stylesheet" href="/inscricoes/fluxos.css?v=4.4"><script src="/inscricoes/fluxos.js?v=4.2" defer></script><script src="/inscricoes/participantes.js?v=4.4" defer></script><link rel="stylesheet" href="/inscricoes/navegacao-painel.css?v=4.10"><script src="/inscricoes/navegacao-painel.js?v=4.10" defer></script>
<!-- NIB COMPARTILHAMENTO 4.16 -->
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Nova Igreja Batista">
<meta property="og:title" content="Gestão de eventos e inscrições - NIB">
<meta property="og:description" content="Acesse o painel administrativo da Nova Igreja Batista para gerenciar eventos, inscrições e pagamentos em um só lugar.">
<meta property="og:url" content="https://novaigrejabatista.com.br/inscricoes/">
<meta property="og:image" content="https://novaigrejabatista.com.br/assets/gestao-inscricoes-compartilhar-v416.png">
<meta property="og:image:secure_url" content="https://novaigrejabatista.com.br/assets/gestao-inscricoes-compartilhar-v416.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1730">
<meta property="og:image:height" content="909">
<meta property="og:image:alt" content="Nova Igreja Batista — Gestão de eventos e inscrições. Acesso ao painel administrativo.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Gestão de eventos e inscrições - NIB">
<meta name="twitter:description" content="Acesse o painel administrativo da Nova Igreja Batista para gerenciar eventos, inscrições e pagamentos em um só lugar.">
<meta name="twitter:image" content="https://novaigrejabatista.com.br/assets/gestao-inscricoes-compartilhar-v416.png">
<!-- FIM NIB COMPARTILHAMENTO -->
<link rel="stylesheet" href="/assets/controles-nib.css?v=5.1"></head><body>
<header><?php if($ev||in_array($filter,['ativo','encerrado'],true)):$backUrl=$ev&&$view!=='inscritos'?'/inscricoes/?evento='.rawurlencode($id):'/inscricoes/';?><nav class="mobile-backbar" aria-label="Retornar"><a href="<?=h($backUrl)?>">VOLTAR</a></nav><?php endif;?><a class="brand" href="/inscricoes/"><img class="brand-logo" src="/img/logo/logo3-azul.svg" alt="Nova Igreja Batista"><span>Inscrições<small>Nova Igreja Batista</small></span></a><div class="header-right"><span class="workspace">Administração de eventos</span><a class="site-link" href="/">Visitar o site</a></div></header>
<details class="mobile-menu">
 <summary><span class="mobile-location"><span>Navegação</span><strong><?=h($ev['name']??($filter==='ativo'?'Eventos ativos':($filter==='encerrado'?'Eventos encerrados':'Visão geral')))?></strong></span><span class="mobile-menu-button"><span class="open-label">Menu</span><span class="close-label">Fechar</span></span></summary>
 <div class="mobile-menu-content">
  <nav aria-label="Navegação mobile">
   <div class="mobile-group-label">Administração</div>
   <?php foreach(['todos'=>'Visão geral','ativo'=>'Eventos ativos','encerrado'=>'Eventos encerrados'] as $mobileKey=>$mobileLabel):$mobileSelected=!$ev&&$filter===$mobileKey;?>
   <a href="/inscricoes/<?=$mobileKey==='todos'?'':'?filtro='.$mobileKey?>" <?=$mobileSelected?'aria-current="page"':''?>><?=h($mobileLabel)?><?php if($mobileSelected):?><span class="mobile-current">Atual</span><?php endif;?></a>
   <?php endforeach;?>
   <a href="/inscricoes/eventos.php">Gerenciar eventos</a><a href="/inscricoes/eventos.php?configuracoes=1">Configurações de acesso</a><div class="mobile-group-label mobile-events-label">Eventos</div>
   <?php foreach($events as $mobileKey=>$mobileEvent):$mobileSelected=$id===$mobileKey;?>
   <a href="/inscricoes/?evento=<?=h($mobileKey)?>" <?=$mobileSelected?'aria-current="page"':''?>><?=h($mobileEvent['name'])?><?php if($mobileSelected):?><span class="mobile-current">Atual</span><?php endif;?></a>
   <?php endforeach;?>
  </nav>
  <form method="post" action="/inscricoes/" class="mobile-logout"><?=cs()?><input type="hidden" name="action" value="logout"><button>Sair do painel</button></form>
 </div>
</details>

<div class="layout"><aside><button type="button" class="nib-sidebar-toggle" aria-controls="nib-desktop-navigation" aria-expanded="true" aria-label="Recolher menu lateral" title="Recolher menu lateral"></button><div class="sidebar-label">ADMINISTRAÇÃO</div><nav aria-label="Menu principal"><a class="<?=!$ev&&$filter==='todos'?'selected':''?>" <?=!$ev&&$filter==='todos'?'aria-current="page"':''?> href="/inscricoes/"><?=icon('grid')?>Visão geral</a><a class="<?=!$ev&&$filter==='ativo'?'selected':''?>" <?=!$ev&&$filter==='ativo'?'aria-current="page"':''?> href="/inscricoes/?filtro=ativo"><?=icon('calendar')?>Eventos ativos</a><a class="<?=!$ev&&$filter==='encerrado'?'selected':''?>" <?=!$ev&&$filter==='encerrado'?'aria-current="page"':''?> href="/inscricoes/?filtro=encerrado"><?=icon('archive')?>Eventos encerrados</a></nav><a class="create-event-nav" href="/inscricoes/eventos.php">Gerenciar eventos</a><div class="sidebar-events"><div class="sidebar-label">EVENTOS</div><?php foreach($events as $navKey=>$navEvent):?><a class="<?=$id===$navKey?'current':''?>" <?=$id===$navKey?'aria-current="page"':''?> href="/inscricoes/?evento=<?=h($navKey)?>"><span class="nav-dot <?=$navKey?>"></span><?=h($navEvent['name'])?></a><?php endforeach;?></div><a class="create-event-nav" href="/inscricoes/eventos.php?configuracoes=1">Configurações de acesso</a><div class="aside-note">Um só lugar para cuidar de cada encontro.</div><form method="post" action="/inscricoes/"><?=cs()?><input type="hidden" name="action" value="logout"><button class="quiet">Sair do painel</button></form></aside>
<main><div class="breadcrumb"><a href="/inscricoes/">Inscrições</a><?= $ev?' / '.h($ev['name']):''?></div>
<?php if($notice):?><p class="message success" role="status"><?=h($notice)?></p><?php endif;?><?php if($error):?><p class="message" role="alert"><?=h($error)?></p><?php endif;?>
<?php if(!$ev):?><span class="eyebrow">GESTÃO DE EVENTOS</span><h1><?= $filter==='ativo'?'Eventos ativos':($filter==='encerrado'?'Eventos encerrados':'Painel de inscrições')?></h1><p class="lead">Seus eventos, participantes e comprovantes em um só lugar.</p><div class="overview-strip"><div><strong><?=count($events)?></strong><span>Eventos cadastrados</span></div><div><strong><?=count(array_filter($events,static fn($e)=>$e['status']==='ativo'))?></strong><span>Eventos ativos</span></div><div><strong><?=count(array_filter($events,static fn($e)=>$e['status']==='encerrado'))?></strong><span>Eventos encerrados</span></div></div><div class="section-heading"><h2><?= $filter==='encerrado'?'Histórico de eventos':'Escolha um evento'?></h2><span>Gestão e acompanhamento</span></div><div class="catalog-toolbar"><a class="button primary" href="/inscricoes/eventos.php?novo=1">Criar evento</a><a class="button" href="/inscricoes/eventos.php">Gerenciar eventos</a></div><div class="cards">
<?php $count=0;foreach($events as $key=>$event):if($filter!=='todos'&&$filter!==$event['status'])continue;$count++;?><article class="event event-<?=h($key)?>"><div class="event-cover"><?php if(isset($catalog[$key])):?><?=nibe_image($catalog[$key])?><?php endif;?></div><div class="event-content"><div class="event-top"><span class="tag <?= $event['kind']==='externo'?'status-external':($event['status']==='ativo'?'status-active':'status-ended')?>"><?= ($event['publication']??'')==='rascunho'?'Rascunho':(($event['mode']??'')==='sem-inscricao'?'Sem inscrição':($event['kind']==='externo'?'Inscrição externa':($event['status']==='ativo'?'Ativo':'Encerrado')))?></span><span class="event-date"><?= $event['date']?date('d/m/Y',strtotime($event['date'])):'Google Forms'?></span></div><h2><?=h($event['name'])?></h2><p><?=!empty($event['imported'])?'Respostas do Google Forms preservadas no painel.':($event['kind']==='externo'?'Inscrição externa ou evento informativo. Consulte os detalhes cadastrados.':'Inscritos, comprovantes e relatórios do evento.')?></p><?php if($event['kind']==='local'):?><?php $summary=$eventSummaries[$key]??null;if((!empty($event['imported'])||($event['mode']??'')==='gratuito')&&$summary!==null):?><dl class="event-summary-metrics"><div><dt><?=!empty($event['imported'])?'Inscrições importadas':'Inscrições'?></dt><dd data-summary-value="<?=h($summary['count'])?>" data-summary-format="integer"><?=h($summary['count'])?></dd></div></dl><?php elseif($summary!==null):?><dl class="event-summary-metrics" aria-label="Resumo das inscrições"><div><dt>Inscrições</dt><dd data-summary-value="<?=h($summary['count'])?>" data-summary-format="integer"><?=h($summary['count'])?></dd></div><div><dt>Valor total</dt><dd data-summary-value="<?=h($summary['total_cents'])?>" data-summary-format="money"><?=h(cash($summary['total_cents']/100))?></dd></div><div class="summary-reviewed"><dt>Valor conferido</dt><dd data-summary-value="<?=h($summary['reviewed_cents'])?>" data-summary-format="money"><?=h(cash($summary['reviewed_cents']/100))?></dd></div></dl><div class="event-summary-hint">Total dos cadastros registrados. Conferência manual dos pagamentos.</div><?php else:?><div class="event-summary-unavailable">Resumo temporariamente indisponível.</div><?php endif;?><?php else:?><div class="event-summary-external">Inscritos e valores são gerenciados no formulário externo.</div><?php endif;?><a class="button primary" href="?evento=<?=h($key)?>"><?= $event['kind']==='externo'?'Ver informações':'Gerenciar inscrições'?></a></div></article><?php endforeach;?>
<?php if(!$count):?><div class="empty">Nenhum evento nesta categoria.</div><?php endif;?></div><p class="note">Seu acesso ao painel permite gerenciar todos os eventos.</p>
<?php elseif($ev['kind']==='externo'):?><span class="eyebrow"><?=(($ev['mode']??'')==='sem-inscricao')?'EVENTO SEM INSCRIÇÃO':'INSCRIÇÃO EXTERNA'?></span><h1><?=h($ev['name'])?></h1><p class="lead">Este evento tem inscrição externa ou participação sem formulário local.</p><section class="panel"><h2><?=(($ev['mode']??'')==='sem-inscricao')?'Participação sem cadastro':'Dados em formulário externo'?></h2><p>Consulte o endereço do evento. Dados de formulários externos não são importados automaticamente para este painel.</p><a class="button primary" href="<?=h($ev['page'])?>" target="_blank" rel="noopener">Abrir página do evento</a></section>
<?php elseif(!$available):?><h1><?=h($ev['name'])?></h1><p class="message">Os dados deste evento estão indisponíveis. Confira a configuração.</p>
<?php else:?><div class="title-row"><div><span class="eyebrow">ACOMPANHAMENTO DO EVENTO</span><h1><?=h($ev['name'])?></h1></div><a class="button" href="<?=h($ev['page'])?>" target="_blank" rel="noopener">Ver página pública</a></div>
<?php if($free):?><div class="stats"><div><strong><?=count($rows)?></strong><span>Inscrições registradas</span></div></div><?php elseif(!empty($ev['imported'])):?><p class="note">Registros importados do Google Forms. A importação preserva as respostas originais e não indica conferência de pagamento. Novas respostas do formulário externo precisam ser importadas.</p><div class="stats"><?php foreach(['Total de inscritos'=>null,'Descubra'=>'Descubra','Cresça 01'=>'Cresça 01','Cresça 02'=>'Cresça 02'] as $dnaLabel=>$dnaClass):?><div><strong><?= $dnaClass===null?count($rows):count(array_filter($rows,static fn($r)=>($r['class']??'')===$dnaClass))?></strong><span><?=h($dnaLabel)?></span></div><?php endforeach;?></div><?php else:?><div class="stats"><div class="stat-total"><strong><?=count($rows)?></strong><span>Inscritos</span></div><div class="stat-reviewed"><strong><?=$reviewed?></strong><span>Conferidos</span></div><div class="stat-pending"><strong><?=count($rows)-$reviewed?></strong><span>Pendentes</span></div><div class="stat-money"><strong><?=cash($received)?></strong><span>Valor conferido</span></div></div>
<?php endif;?><nav class="tabs" aria-label="Gestão do evento"><?php foreach((!empty($ev['imported'])||$free?['inscritos'=>'Inscritos','relatorios'=>'Relatórios','lixeira'=>'Lixeira']:['inscritos'=>'Inscritos','pagamentos'=>'Pagamentos','relatorios'=>'Relatórios','lixeira'=>'Lixeira']) as $tab=>$label):?><a class="<?=$view===$tab?'selected':''?>" href="?evento=<?=h($id)?>&amp;aba=<?=$tab?>"><?=$label?></a><?php endforeach;?></nav>
<?php if($view==='lixeira'):?><section class="panel"><h2>Lixeira de inscrições</h2><p>Inscrições retiradas da lista ativa. Os dados e comprovantes ficam guardados e podem ser restaurados.</p></section><div class="registrations trash-list"><?php $trashRows=nib42_trash_rows($base,$folder);foreach($trashRows as $r):?><article class="registration"><div><span class="tag status-ended">Na lixeira</span><h2><?=h($r['name']??'')?></h2><?=nibf_summary($r)?><p class="protocol"><?=h($r['protocol'])?></p><p>Arquivada em <?=h(when($r['_archived_at']))?></p></div><form method="post"><?=cs()?><?=nib42_context()?><input type="hidden" name="action" value="restore"><input type="hidden" name="token" value="<?=h($r['_trash_token'])?>"><button class="button">Restaurar inscrição</button></form></article><?php endforeach;if(!$trashRows):?><p class="empty">A lixeira deste evento está vazia.</p><?php endif;?></div>
<?php elseif($view==='relatorios'):?><section class="panel"><h2>Relatório do evento</h2><p>Exporte os inscritos, dados do formulário e situação da conferência em CSV.</p><a class="button primary" href="?evento=<?=h($id)?>&amp;export=1">Baixar relatório completo</a><?php if(empty($ev['imported'])&&!$free):?><p class="note">Valor conferido é a soma dos comprovantes marcados como conferidos; não representa conciliação bancária automática.</p><?php endif;?></section>
<?php else:?><form method="get" class="search"><input type="hidden" name="evento" value="<?=h($id)?>"><input type="hidden" name="aba" value="<?=h($view)?>"><label class="sr-only" for="q">Buscar inscritos</label><input id="q" name="q" value="<?=h($q)?>" placeholder="Nome, telefone ou protocolo"><?php if(!$free):?><label class="sr-only" for="status">Situação</label><select id="status" name="status"><option value="">Todas as situações</option><option value="pendente" <?=$status==='pendente'?'selected':''?>>Pendentes</option><option value="conferido" <?=$status==='conferido'?'selected':''?>>Conferidos</option></select><?php endif;?><button class="button primary">Filtrar</button><?php if($q!==''||$status!==''):?><a class="button" href="?evento=<?=h($id)?>&amp;aba=<?=h($view)?>">Limpar filtros</a><?php endif;?><a class="button export-results" href="?evento=<?=h($id)?>&amp;export=1&amp;q=<?=rawurlencode($q)?>&amp;status=<?=rawurlencode($status)?>">Exportar resultados</a></form>
<p class="note"><?=count($filtered)?> resultado(s). <?=!empty($ev['imported'])?'Respostas preservadas do Google Forms.':($free?'Inscrições gratuitas registradas.':'Comprovantes são conferidos manualmente.')?></p><div class="list-heading"><span>Participante</span><span><?=$view==='pagamentos'?'Pagamento e comprovante':'Dados da inscrição'?></span><span><?=$view==='pagamentos'?'Conferência':'Ações'?></span></div><div class="registrations">
<?php foreach($filtered as $r):?><article class="registration"><div class="person"><span class="tag <?=!empty($ev['imported'])||$free?'status-confirmed':(!empty($r['reviewed'])?'status-confirmed':'status-pending')?>"><?=!empty($ev['imported'])||$free?'Inscrição recebida':(!empty($r['reviewed'])?'Conferido':'Pendente')?></span><h2><?=h($r['name']??'')?></h2><?=nibf_summary($r)?><p class="protocol"><?=h($r['protocol']??'')?></p><p><?=h(phone($r['whatsapp']??$r['phone']??''))?></p><?php if($id==='jornada-dna'&&!empty($r['class'])):?><p class="participant-class"><strong>Turma:</strong> <?=h($r['class'])?></p><?php endif;?><?php if(!empty($r['guardian'])):?><p>Responsável: <?=h($r['guardian'])?> · <?=h(phone($r['guardian_phone']??''))?></p><?php endif;?></div>
<?php if($view==='pagamentos'):?><div class="payment"><strong><?=cash((float)($r['amount']??$ev['amount']))?></strong><p>Pagador: <?=h(trim((string)($r['payer_name']??''))?:'Não informado')?></p><p class="note"><?=h(when($r['created_at']??''))?></p><?php if(!empty($r['receipt'])):?><a class="receipt-action" href="?evento=<?=h($id)?>&amp;receipt=<?=h($r['_id'])?>" target="_blank" rel="noopener">Ver comprovante</a><?php else:?><span class="note"><?=(float)($r['amount']??$ev['amount'])>0?'Comprovante não enviado':'Inscrição gratuita'?></span><?php endif;?></div>
<?php else:?><div class="participant-data"><p>Inscrição em <?=h(when($r['created_at']??''))?></p><details class="participant-details"><summary>Ver dados completos</summary><dl><?php foreach(['name'=>'Nome completo','protocol'=>'Protocolo','whatsapp'=>'WhatsApp','phone'=>'Telefone','birth'=>'Nascimento','age'=>'Idade','guardian'=>'Responsável','guardian_phone'=>'Telefone do responsável','relationship'=>'Parentesco','health'=>'Informações de saúde','payer_name'=>'Pagador','address'=>'Endereço','cell'=>'Célula','cell_confirmation'=>'Confirmação de participação em célula','class'=>'Turma','source_label'=>'Origem','source_timestamp'=>'Data original no Google Forms'] as $field=>$label):if(isset($r[$field])&&$r[$field]!==''):?><dt><?=$label?></dt><dd><?=h($r[$field])?></dd><?php endif;endforeach;?><?php foreach(($r['form_schema']??[]) as $field):if(!array_key_exists($field['id'],$r['answers']??[]))continue;$answer=$r['answers'][$field['id']];?><dt><?=h($field['label'])?></dt><dd><?=h(is_array($answer)?implode(', ',$answer):($answer==='yes'?'Sim':$answer))?></dd><?php endforeach;?></dl></details></div><?php endif;?>
<div class="actions participant-actions"><div class="participant-primary-action"><?php if(empty($ev['imported'])&&!$free):?><?php if($view==='pagamentos'):?><?php if(empty($r['reviewed'])):?><?php if(!empty($r['receipt'])||(float)($r['amount']??$ev['amount'])<=0):?><form method="post"><?=cs()?><?=nib42_context()?><input type="hidden" name="action" value="review"><input type="hidden" name="id" value="<?=h($r['_id'])?>"><input type="hidden" name="review_to" value="1"><button class="button primary"><?=(float)($r['amount']??$ev['amount'])>0?'Conferir pagamento':'Conferir inscrição'?></button></form><?php endif;?><?php else:?><p class="review-state">Conferência concluída</p><details class="undo-review"><summary>Desfazer conferência</summary><form method="post"><?=cs()?><?=nib42_context()?><input type="hidden" name="action" value="review"><input type="hidden" name="id" value="<?=h($r['_id'])?>"><input type="hidden" name="review_to" value="0"><label><input type="checkbox" name="confirm_unreview" value="yes" required> Confirmo retornar esta inscrição para pendente.</label><button class="button">Desfazer conferência</button></form></details><?php endif;?>
<?php else:?><a class="button" href="?evento=<?=h($id)?>&amp;aba=pagamentos&amp;q=<?=rawurlencode($r['protocol']??'')?>"><?=(float)($r['amount']??$ev['amount'])>0?'Ver pagamento':'Ver conferência'?></a><?php endif;?>
<?php endif;?></div><div class="archive-control"><button type="button" class="button danger" data-archive-toggle aria-expanded="false" aria-controls="archive-<?=h($r['_id'])?>">Mover para a lixeira</button></div><form method="post" class="delete archive-confirm" id="archive-<?=h($r['_id'])?>" hidden><?=cs()?><?=nib42_context()?><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?=h($r['_id'])?>"><label><input type="checkbox" name="confirm_delete" value="yes" required> Retirar da lista ativa e dos totais. Os dados e o comprovante poderão ser restaurados.</label><button class="button danger">Mover para a lixeira</button></form></div></article><?php endforeach;?><?php if(!$filtered):?><div class="empty">Nenhuma inscrição encontrada.</div><?php endif;?></div><?php endif;?>
<section class="panel event-settings"><h2>Divulgação e situação do evento</h2><p class="note">A publicação no banner e o período de inscrições são definidos no cadastro do evento.</p><a class="button" href="/inscricoes/eventos.php?editar=<?=h($id)?>"><?=!empty($catalog[$id]['legacy'])?'Ver informações do evento':'Editar evento'?></a></section>

<?php endif;?></main></div><footer>Nova Igreja Batista <span>·</span> Gestão de inscrições</footer></body></html>

