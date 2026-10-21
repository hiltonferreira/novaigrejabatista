<?php
declare(strict_types=1);
if(!defined('NIB_EVENTOS_RUNTIME')){http_response_code(404);exit;}
function nib42_trash_root(string $base,string $folder):string{
 if(!preg_match('/^[A-Za-z0-9_-]+$/D',basename($folder))||dirname($folder)!==$base)throw new RuntimeException('invalid trash folder');
 $root=$base.'/lixeira-inscricoes';$path=$root.'/'.basename($folder);
 foreach([$root,$path] as $dir){if(is_link($dir))throw new RuntimeException('invalid trash path');if(!is_dir($dir)&&!mkdir($dir,0700)&&!is_dir($dir))throw new RuntimeException('trash unavailable');}
 return $path;
}
function nib42_archive(string $base,string $folder,string $id,array $row):void{
 $root=nib42_trash_root($base,$folder);$dest=$root.'/'.bin2hex(random_bytes(16));
 if(!mkdir($dest,0700))throw new RuntimeException('archive unavailable');
 $record=$folder.'/'.$id.'.json';$receipt=!empty($row['receipt'])?receipt_path($folder,$row,$id):'';
 if(is_link($record)||!is_file($record))throw new RuntimeException('record missing');
 $hasReceipt=$receipt!==''&&is_file($receipt);$meta=['id'=>$id,'archived_at'=>gmdate('c'),'receipt'=>$hasReceipt?basename($receipt):null,'record_sha256'=>hash_file('sha256',$record),'receipt_sha256'=>$hasReceipt?hash_file('sha256',$receipt):null];
 putjson($dest.'/arquivo.json',$meta);$moved=false;
 try{
  if($hasReceipt){if(!rename($receipt,$dest.'/'.basename($receipt)))throw new RuntimeException('archive receipt failed');$moved=true;}
  if(!rename($record,$dest.'/'.$id.'.json'))throw new RuntimeException('archive record failed');
 }catch(Throwable $e){if($moved&&!rename($dest.'/'.basename($receipt),$receipt))throw new RuntimeException('archive rollback failed');throw $e;}
}
function nib42_trash_rows(string $base,string $folder):array{
 $path=$base.'/lixeira-inscricoes/'.basename($folder);if(is_link($base.'/lixeira-inscricoes')||is_link($path)||!is_dir($path))return [];$out=[];
 foreach(glob($path.'/*',GLOB_ONLYDIR)?:[] as $dir){
  $token=basename($dir);if(!preg_match('/^[a-f0-9]{32}$/D',$token)||is_link($dir)||is_link($dir.'/arquivo.json'))continue;
  $meta=json_decode((string)@file_get_contents($dir.'/arquivo.json'),true);$id=$meta['id']??'';
  if(!is_string($id)||!preg_match('/^[a-f0-9]{32}$/D',$id)||is_link($dir.'/'.$id.'.json'))continue;
  $row=json_decode((string)@file_get_contents($dir.'/'.$id.'.json'),true);if(!is_array($row)||empty($row['protocol']))continue;
  $row['_trash_token']=$token;$row['_archived_at']=$meta['archived_at']??'';$out[]=$row;
 }
 usort($out,static fn($a,$b)=>strcmp($b['_archived_at'],$a['_archived_at']));return $out;
}
function nib42_restore(string $base,string $folder,string $token):void{
 if(!preg_match('/^[a-f0-9]{32}$/D',$token))throw new RuntimeException('invalid trash token');
 $root=nib42_trash_root($base,$folder);$dir=$root.'/'.$token;
 if(is_link($dir)||!is_dir($dir)||is_link($dir.'/arquivo.json'))throw new RuntimeException('archive missing');
 $meta=json_decode((string)file_get_contents($dir.'/arquivo.json'),true);$id=$meta['id']??'';
 if(!is_string($id)||!preg_match('/^[a-f0-9]{32}$/D',$id))throw new RuntimeException('invalid archive');
 $record=$dir.'/'.$id.'.json';$target=$folder.'/'.$id.'.json';
 if(is_link($record)||!is_file($record)||file_exists($target)||is_link($target)||hash_file('sha256',$record)!==($meta['record_sha256']??''))throw new RuntimeException('restore conflict');
 $row=json_decode((string)file_get_contents($record),true);if(!is_array($row)||empty($row['protocol']))throw new RuntimeException('invalid archived record');
 $receipt=$meta['receipt']??null;$receiptTarget='';$receiptSource='';
 if($receipt!==null){
  if(!is_string($receipt)||$receipt!==($row['receipt']??null)||!preg_match('/^'.preg_quote($id,'/').'\.(jpg|png|webp|pdf)$/D',$receipt))throw new RuntimeException('invalid archived receipt');
  $receiptSource=$dir.'/'.$receipt;$receiptTarget=$folder.'/'.$receipt;
  if(is_link($receiptSource)||!is_file($receiptSource)||file_exists($receiptTarget)||is_link($receiptTarget)||hash_file('sha256',$receiptSource)!==($meta['receipt_sha256']??''))throw new RuntimeException('receipt restore conflict');
 }
 $moved=false;
 try{
  if($receiptSource!==''){if(!rename($receiptSource,$receiptTarget))throw new RuntimeException('restore receipt failed');$moved=true;}
  if(!rename($record,$target))throw new RuntimeException('restore record failed');
 }catch(Throwable $e){if($moved&&!rename($receiptTarget,$receiptSource))throw new RuntimeException('restore rollback failed');throw $e;}
}
function nib42_return(string $id):never{
 $tab=is_string($_POST['return_aba']??null)?$_POST['return_aba']:'inscritos';if(!in_array($tab,['inscritos','pagamentos','lixeira'],true))$tab='inscritos';
 $q=is_string($_POST['return_q']??null)?substr($_POST['return_q'],0,250):'';
 $status=is_string($_POST['return_status']??null)?$_POST['return_status']:'';if(!in_array($status,['pendente','conferido'],true))$status='';
 header('Location: /inscricoes/?'.http_build_query(['evento'=>$id,'aba'=>$tab,'q'=>$q,'status'=>$status],'','&',PHP_QUERY_RFC3986),true,303);exit;
}
function nib42_context():string{
 global $view,$q,$status;return '<input type="hidden" name="return_aba" value="'.h($view).'"><input type="hidden" name="return_q" value="'.h($q).'"><input type="hidden" name="return_status" value="'.h($status).'">';
}
function nib42_management_menu(bool $settings):void{
 $label=$settings?'Configurações de acesso':'Gerenciar eventos';$csrf=nibe_h($_SESSION['csrf']);
 echo '<details class="mobile-menu"><summary><span class="mobile-location"><span>Navegação</span><strong>'.nibe_h($label).'</strong></span><span class="mobile-menu-button"><span class="open-label">Menu</span><span class="close-label">Fechar</span></span></summary><div class="mobile-menu-content"><nav aria-label="Administração"><div class="mobile-group-label">Administração</div><a href="/inscricoes/">Visão geral</a><a href="/inscricoes/eventos.php" '.(!$settings?'aria-current="page"':'').'>Gerenciar eventos</a><a href="/inscricoes/eventos.php?configuracoes=1" '.($settings?'aria-current="page"':'').'>Configurações de acesso</a></nav><form method="post" action="/inscricoes/" class="mobile-logout"><input type="hidden" name="csrf" value="'.$csrf.'"><input type="hidden" name="action" value="logout"><button>Sair do painel</button></form></div></details>';
 echo '<nav class="management-nav" aria-label="Administração"><a href="/inscricoes/">Visão geral</a><a href="/inscricoes/eventos.php" '.(!$settings?'aria-current="page"':'').'>Gerenciar eventos</a><a href="/inscricoes/eventos.php?configuracoes=1" '.($settings?'aria-current="page"':'').'>Configurações de acesso</a><form method="post" action="/inscricoes/"><input type="hidden" name="csrf" value="'.$csrf.'"><input type="hidden" name="action" value="logout"><button class="button">Sair do painel</button></form></nav>';
}
