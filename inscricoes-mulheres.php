<?php
declare(strict_types=1);
ini_set('display_errors','0');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');
header("Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'none'");
$https=!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off';
session_name('nib_eventos');
session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$https,'httponly'=>true,'samesite'=>'Lax']);
session_start();
function esc($s):string{return htmlspecialchars((string)$s,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
function name_lower(string $name):string{
    if(function_exists('mb_strtolower'))return mb_strtolower($name,'UTF-8');
    return strtolower(strtr($name,array_combine(preg_split('//u','ÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇÑÝŸ',-1,PREG_SPLIT_NO_EMPTY),preg_split('//u','àáâãäåèéêëìíîïòóôõöùúûüçñýÿ',-1,PREG_SPLIT_NO_EMPTY))));
}
function display_name(string $name):string{
    $name=name_lower(trim($name));
    return preg_replace_callback('/^\p{L}/u',static function($m){
        if(function_exists('mb_strtoupper'))return mb_strtoupper($m[0],'UTF-8');
        return strtoupper(strtr($m[0],array_combine(preg_split('//u','àáâãäåèéêëìíîïòóôõöùúûüçñýÿ',-1,PREG_SPLIT_NO_EMPTY),preg_split('//u','ÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇÑÝŸ',-1,PREG_SPLIT_NO_EMPTY))));
    },$name)??$name;
}
function atomic_json(string $path,array $data):void{
    $temporary=$path.'.tmp';
    if(file_put_contents($temporary,json_encode($data,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT|JSON_THROW_ON_ERROR),LOCK_EX)===false || !rename($temporary,$path))throw new RuntimeException('Unable to save');
}
function display_phone(string $phone):string{if(strlen($phone)>11 && substr($phone,0,2)==='55')$phone=substr($phone,2);$split=strlen($phone)===11?5:4;return '('.substr($phone,0,2).') '.substr($phone,2,$split).'-'.substr($phone,2+$split);}
function money(float $v):string{return 'R$ '.number_format($v,2,',','.');}
function redirect_panel():void{header('Location: inscricoes-mulheres.php',true,303);exit;}
$error='';$storageError=false;$records=[];$notice='';$deletion=null;
try{
    umask(0077);
    $web=realpath($_SERVER['DOCUMENT_ROOT']??'');
    if(!$web || $web==='/')throw new RuntimeException('Invalid root');
    $base=dirname($web).'/nib-inscricoes-privado';
    if(!is_dir($base) && !mkdir($base,0700,true) && !is_dir($base))throw new RuntimeException('Storage unavailable');
    $base=realpath($base);
    if(!$base || strpos($base.'/',$web.'/')===0)throw new RuntimeException('Invalid storage');
    $folder=$base.'/mulheres-2026-10-30';
    if(!is_dir($folder) && !mkdir($folder,0700) && !is_dir($folder))throw new RuntimeException('Folder unavailable');
    $configfile=$base.'/administracao-mulheres.json';
    $setupLock=fopen($base.'/.admin-lock','c');
    if(!$setupLock || !flock($setupLock,LOCK_EX))throw new RuntimeException('Lock unavailable');
    if(!is_file($configfile)){
        $initial=bin2hex(random_bytes(12));
        $text="ACESSO AO PAINEL MULHERES VIRTUOSAS\n\nEndereço: /inscricoes-mulheres.php\nSenha inicial: ".$initial."\n\nEntre no painel e altere a senha. Após alterar, este arquivo será removido.\nNão compartilhe esta senha com participantes.\n";
        if(file_put_contents($base.'/ACESSO-PAINEL-MULHERES.txt',$text,LOCK_EX)===false)throw new RuntimeException('Credentials unavailable');
        atomic_json($configfile,['password_hash'=>password_hash($initial,PASSWORD_DEFAULT)]);
    }
    $config=json_decode(file_get_contents($configfile),true);
    flock($setupLock,LOCK_UN);fclose($setupLock);
    if(!$config || empty($config['password_hash']))throw new RuntimeException('Invalid configuration');
    if(empty($_SESSION['admin_csrf']))$_SESSION['admin_csrf']=bin2hex(random_bytes(32));
    if(!empty($_SESSION['admin_at']) && time()-(int)$_SESSION['admin_at']>7200)unset($_SESSION['admin_at']);
    $authenticated=!empty($_SESSION['admin_at']);
    if($_SERVER['REQUEST_METHOD']==='POST'){
        $csrf=$_POST['csrf']??'';
        if(!is_string($csrf)||!hash_equals($_SESSION['admin_csrf'],$csrf))throw new RuntimeException('Session expired, reload');
        $action=$_POST['action']??'';
        if($action==='login'){
            $attemptFile=$base.'/.login-'.hash('sha256',$_SERVER['REMOTE_ADDR']??'unknown').'.json';
            $lock=fopen($attemptFile,'c+');
            if(!$lock || !flock($lock,LOCK_EX))throw new RuntimeException('Login unavailable');
            $attempts=json_decode(stream_get_contents($lock),true)?:['count'=>0,'since'=>time()];
            if(time()-(int)$attempts['since']>900)$attempts=['count'=>0,'since'=>time()];
            $password=$_POST['password']??'';
            if($attempts['count']>=8)$error='Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.';
            elseif(is_string($password)&&password_verify($password,$config['password_hash'])){
                $attempts=['count'=>0,'since'=>time()];
                rewind($lock);ftruncate($lock,0);fwrite($lock,json_encode($attempts));flock($lock,LOCK_UN);fclose($lock);
                session_regenerate_id(true);$_SESSION['admin_at']=time();redirect_panel();
            }else{
                $attempts['count']++;$error='Senha incorreta.';
            }
            rewind($lock);ftruncate($lock,0);fwrite($lock,json_encode($attempts));flock($lock,LOCK_UN);fclose($lock);
        }elseif($authenticated && $action==='logout'){
            unset($_SESSION['admin_at']);session_regenerate_id(true);redirect_panel();
        }elseif($authenticated && $action==='password'){
            $old=$_POST['old_password']??'';$new=$_POST['new_password']??'';$repeat=$_POST['repeat_password']??'';
            if(!is_string($old)||!password_verify($old,$config['password_hash']))$error='A senha atual está incorreta.';
            elseif(!is_string($new)||strlen($new)<12||strlen($new)>72||$new!==$repeat)$error='Use de 12 a 72 caracteres e repita a nova senha corretamente.';
            else{
                $lock=fopen($base.'/.admin-lock','c');if(!$lock||!flock($lock,LOCK_EX))throw new RuntimeException('Lock unavailable');
                atomic_json($configfile,['password_hash'=>password_hash($new,PASSWORD_DEFAULT)]);
                @unlink($base.'/ACESSO-PAINEL-MULHERES.txt');flock($lock,LOCK_UN);fclose($lock);
                session_regenerate_id(true);$_SESSION['admin_csrf']=bin2hex(random_bytes(32));$_SESSION['notice']='Senha alterada.';redirect_panel();
            }
        }elseif($authenticated && $action==='review'){
            $id=$_POST['id']??'';
            if(!is_string($id)||!preg_match('/^[a-f0-9]{32}$/D',$id))throw new RuntimeException('Invalid registration');
            $lock=fopen($folder.'/.lock','c');if(!$lock||!flock($lock,LOCK_EX))throw new RuntimeException('Lock unavailable');
            $path=$folder.'/'.$id.'.json';
            if(!is_file($path))throw new RuntimeException('Registration missing');
            $row=json_decode(file_get_contents($path),true);if(!$row)throw new RuntimeException('Invalid record');
            $row['reviewed']=empty($row['reviewed']);$row['reviewed_at']=gmdate('c');atomic_json($path,$row);
            flock($lock,LOCK_UN);fclose($lock);redirect_panel();
        }elseif($authenticated && $action==='delete'){
            $id=$_POST['id']??'';
            if(!is_string($id)||!preg_match('/^[a-f0-9]{32}$/D',$id)||($_POST['confirm_delete']??'')!=='yes')throw new RuntimeException('Invalid deletion');
            $lock=fopen($folder.'/.lock','c');
            if(!$lock||!flock($lock,LOCK_EX))throw new RuntimeException('Lock unavailable');
            try{
                $path=$folder.'/'.$id.'.json';
                if(is_file($path)){
                    $row=json_decode(file_get_contents($path),true);
                    if(!$row||empty($row['protocol']))throw new RuntimeException('Invalid record');
                    $receipt=$row['receipt']??'';
                    if(!is_string($receipt)||!preg_match('/^'.preg_quote($id,'/').'\.(jpg|png|webp|pdf)$/D',$receipt))throw new RuntimeException('Invalid receipt');
                    if(is_file($folder.'/'.$receipt)&&!unlink($folder.'/'.$receipt))throw new RuntimeException('Unable to remove receipt');
                    if(!unlink($path))throw new RuntimeException('Unable to remove registration');
                }
            }finally{flock($lock,LOCK_UN);fclose($lock);}
            $_SESSION['notice']='Inscrição e comprovante excluídos.';redirect_panel();
        }elseif($action!=='login'){
            http_response_code(403);$error='Entre no painel para continuar.';
        }
    }
    if($authenticated){
        $_SESSION['admin_at']=time();
        $notice=$_SESSION['notice']??'';unset($_SESSION['notice']);
        if(isset($_GET['delete'])){
            $id=$_GET['delete'];
            if(is_string($id)&&preg_match('/^[a-f0-9]{32}$/D',$id)){
                $path=$folder.'/'.$id.'.json';
                $deletion=is_file($path)?json_decode(file_get_contents($path),true):null;
                if($deletion)$deletion['_id']=$id;
            }
            if(!$deletion)$error='Esta inscrição não foi encontrada. Ela pode já ter sido excluída.';
        }
        if(isset($_GET['receipt'])){
            $id=$_GET['receipt'];
            if(!is_string($id)||!preg_match('/^[a-f0-9]{32}$/D',$id)){http_response_code(404);exit;}
            $path=$folder.'/'.$id.'.json';$row=is_file($path)?json_decode(file_get_contents($path),true):null;
            if(!$row||!preg_match('/^[a-f0-9]{32}\.(jpg|png|webp|pdf)$/D',$row['receipt']??'')){http_response_code(404);exit;}
            $receipt=$folder.'/'.$row['receipt'];
            $mime=$row['receipt_mime']??'';
            if(!is_file($receipt)||!in_array($mime,['image/jpeg','image/png','image/webp','application/pdf'],true)){http_response_code(404);exit;}
            header('Content-Type: '.$mime);
            header('Content-Disposition: inline; filename="comprovante-'.preg_replace('/[^A-Z0-9-]/','',$row['protocol']).'.'.pathinfo($receipt,PATHINFO_EXTENSION).'"');
            header("Content-Security-Policy: default-src 'none'; sandbox");readfile($receipt);exit;
        }
        foreach(glob($folder.'/*.json')?:[] as $path){
            $row=json_decode(file_get_contents($path),true);
            if(!$row||empty($row['protocol']))continue;
            $row['_id']=basename($path,'.json');$records[]=$row;
        }
        usort($records,static function($a,$b){return strcmp($b['created_at'],$a['created_at']);});
        $total=count($records);$reviewed=count(array_filter($records,static function($r){return !empty($r['reviewed']);}));$received=$reviewed*20.0;
        $query=is_string($_GET['q']??null)?trim($_GET['q']):'';
        if($query!=='')$records=array_values(array_filter($records,static function($r)use($query){$digits=preg_replace('/\D/','',$query);return strpos(name_lower($r['name'].' '.$r['whatsapp'].' '.$r['protocol']),name_lower($query))!==false || (strlen($digits)>=6 && strpos($r['whatsapp'],$digits)!==false);}));
        if(isset($_GET['export'])){
            header('Content-Type: text/csv; charset=utf-8');header('Content-Disposition: attachment; filename="inscricoes-mulheres-virtuosas.csv"');
            $out=fopen('php://output','w');fwrite($out,"\xEF\xBB\xBF");
            fputcsv($out,['Protocolo','Participante','WhatsApp','Nome do pagador','Recebida em','Comprovante conferido'], ';');
            foreach($records as $r){$cells=[$r['protocol'],display_name($r['name']),$r['whatsapp'],display_name($r['payer_name']),$r['created_at'],!empty($r['reviewed'])?'Sim':'Não'];
                $cells=array_map(static function($s){$s=(string)$s;return preg_match('/^[\s]*[=+@-]/u',$s)?"'".$s:$s;},$cells);fputcsv($out,$cells,';');}
            fclose($out);exit;
        }
    }
}catch(Throwable $e){error_log('NIB event admin: '.$e->getMessage());$storageError=true;$error='Não foi possível abrir o painel agora. Confira a configuração PHP e tente novamente.';}
?>
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Gestão de inscrições · Mulheres Virtuosas</title><link rel="icon" type="image/png" href="/img/favicon-nib-180-v113.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet"><style>
:root{--navy:#041e42;--blue:#2187d5;--orange:#ff6d3a;--bg:#eeeee3;--surface:#fff;--line:#c9cbc3;--muted:#64738a;--green:#2f6b52;--red:#9e3f38}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--navy);font-family:Manrope,Arial,sans-serif}.header{max-width:1360px;margin:auto;padding:24px 34px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between}.header img{width:112px;height:auto}.header a{color:var(--navy);text-decoration:none;border-bottom:1px solid var(--line);padding-bottom:7px;font-size:.85rem}.admin{max-width:1360px;margin:0 auto;padding:36px 34px 70px}.eyebrow{font-size:.72rem;letter-spacing:.17em;text-transform:uppercase;color:var(--orange);font-weight:700}.admin-head{display:flex;justify-content:space-between;gap:24px;align-items:center;margin-bottom:28px}.admin h1{font-family:Montserrat,Arial,sans-serif;font-size:2.2rem;margin:7px 0 0}.button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 17px;border-radius:999px;border:1px solid var(--navy);font:600 .84rem Manrope;cursor:pointer;text-decoration:none}.primary{background:var(--navy);color:#fff}.secondary{background:transparent;color:var(--navy)}input{width:100%;min-height:46px;border:1px solid #9faebe;border-radius:9px;padding:10px 13px;background:#fff;font:400 .9rem Manrope;color:var(--navy)}label{display:block;font-size:.84rem;margin:15px 0 6px}.login{max-width:460px;margin:55px auto}.login p{color:var(--muted);line-height:1.6}.message{padding:14px 16px;border:1px solid #d7a6a1;border-radius:9px;background:#fff1ef;color:#7f302a}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:20px 0;margin:22px 0 28px}.stat{padding:6px 3px}.stat strong{display:block;font-family:Montserrat;font-size:1.8rem;line-height:1.05}.stat span{font-size:.78rem;color:var(--muted)}.stat.cash strong{color:var(--green)}.search{display:flex;gap:10px;flex-wrap:wrap}.search input{flex:1;min-width:270px}.note{color:var(--muted);font-size:.78rem;line-height:1.55}.table-wrap{overflow:auto;margin-top:26px;border-top:1px solid var(--line)}table{border-collapse:collapse;width:100%;min-width:1180px;font-size:.84rem}th,td{text-align:left;padding:16px 12px;border-bottom:1px solid var(--line);vertical-align:top}th{color:var(--muted);font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em}td strong{font-weight:650}td small{display:block;color:var(--muted);font-size:.74rem;line-height:1.5;margin-top:4px}.receipt-link{color:var(--navy);text-underline-offset:4px}.review{display:flex;flex-direction:column;align-items:flex-start;gap:7px}.state{font-size:.74rem;font-weight:700;color:#a14a16}.state.ok{color:var(--green)}.review .button{min-height:34px;padding:7px 11px;border-radius:8px;font-size:.76rem}.review .done{background:transparent;color:var(--muted);border:0;padding-left:0;text-decoration:underline;text-underline-offset:3px}.danger{color:var(--red);text-underline-offset:4px}.detail{margin-top:7px}.detail summary{cursor:pointer;color:var(--navy);font-size:.75rem;text-decoration:underline;text-underline-offset:3px}.detail p{margin:7px 0 0;color:var(--muted);font-size:.75rem;max-width:44ch}.delete-confirm{border:1px solid var(--line);background:#fff;padding:22px;border-radius:12px;margin:22px 0}.delete-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.password{margin-top:34px;padding-top:22px;border-top:1px solid var(--line)}.password summary{cursor:pointer}.password form{max-width:470px}.empty{padding:30px 0;color:var(--muted)}
@media(max-width:760px){.header,.admin{padding-left:18px;padding-right:18px}.stats{grid-template-columns:1fr 1fr}.admin-head{align-items:flex-start}.search .button{flex:1}.search input{flex-basis:100%}}

/* Extensões específicas do painel Mulheres Virtuosas */
.review-control{display:flex;flex-direction:column;align-items:flex-start;gap:7px;min-width:150px}
.review-control form{margin:0}
.review-button{min-height:34px!important;padding:7px 11px!important;border-radius:8px!important;font-size:.76rem!important}
.review-button.pending{background:var(--navy)!important;color:#fff!important;border-color:var(--navy)!important}
.review-button.reviewed{background:transparent!important;color:var(--muted)!important;border:0!important;padding-left:0!important;text-decoration:underline;text-underline-offset:3px}
.state.reviewed{color:var(--green)}
.delete-link{color:var(--red);text-underline-offset:4px}
.delete-button{background:#fff1ef!important;color:var(--red)!important;border-color:#d7a6a1!important}
.delete-button:hover{background:var(--red)!important;color:#fff!important}
.login .button{margin-top:18px}
.admin td:first-child{font-weight:650}
.admin td small{font-weight:400}
.search{margin-bottom:0}
.password form{max-width:470px}
.password label{display:block;font-size:.84rem;margin:15px 0 6px}
.password .button{margin-top:16px}
@media(max-width:760px){
  .review-control{min-width:145px}
}


/* V8.9 — status principal em tag + ação textual lado a lado */
.conference-status{
  display:flex;
  align-items:center;
  gap:12px;
  flex-wrap:nowrap;
  min-width:260px;
}
.conference-status form{margin:0}
.conference-status .state{
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  min-height:28px!important;
  padding:5px 11px!important;
  border-radius:999px!important;
  font-size:.72rem!important;
  font-weight:700!important;
  line-height:1!important;
  white-space:nowrap!important;
}
.conference-status .state.pending{
  color:#9a4a00!important;
  background:#fff0df!important;
  border:1px solid #efc18e!important;
}
.conference-status .state.reviewed{
  color:#245b45!important;
  background:#e7f3ec!important;
  border:1px solid #b8d9c7!important;
}
.review-action{
  appearance:none!important;
  border:0!important;
  background:transparent!important;
  color:var(--navy)!important;
  padding:2px 0!important;
  margin:0!important;
  min-height:auto!important;
  font:600 .76rem Manrope,Arial,sans-serif!important;
  text-decoration:underline!important;
  text-underline-offset:3px!important;
  cursor:pointer!important;
  white-space:nowrap!important;
}
.review-action:hover{opacity:.65}
.review-action:focus-visible{
  outline:2px solid var(--navy)!important;
  outline-offset:3px!important;
  border-radius:3px!important;
}
@media(max-width:760px){
  .conference-status{
    min-width:235px;
    gap:9px;
  }
}


/* V9.0 — tabela mais equilibrada + ação de conferência discreta */
.table-wrap table{
  table-layout:fixed!important;
}
.table-wrap th:nth-child(1),
.table-wrap td:nth-child(1){width:22%;text-align:left!important}
.table-wrap th:nth-child(2),
.table-wrap td:nth-child(2){width:14%;text-align:center!important}
.table-wrap th:nth-child(3),
.table-wrap td:nth-child(3){width:16%;text-align:center!important}
.table-wrap th:nth-child(4),
.table-wrap td:nth-child(4){width:15%;text-align:center!important}
.table-wrap th:nth-child(5),
.table-wrap td:nth-child(5){width:22%;text-align:center!important}
.table-wrap th:nth-child(6),
.table-wrap td:nth-child(6){width:11%;text-align:center!important}

.conference-status{
  justify-content:center!important;
  min-width:0!important;
}
.review-action{
  color:#7a8798!important;
  font-weight:500!important;
  text-decoration:none!important;
  opacity:.82!important;
}
.review-action:hover{
  color:var(--navy)!important;
  opacity:1!important;
  text-decoration:underline!important;
  text-underline-offset:3px!important;
}
.receipt-link{
  display:inline-block!important;
}
@media(max-width:980px){
  .table-wrap table{table-layout:auto!important;min-width:1050px!important}
  .table-wrap th,
  .table-wrap td{width:auto!important}
}


/* V9.1 — tabela reequilibrada + seletor moderno de conferência */
.table-wrap table{
  table-layout:fixed!important;
  width:100%!important;
}
.table-wrap th:nth-child(1),
.table-wrap td:nth-child(1){width:22%!important;text-align:left!important}
.table-wrap th:nth-child(2),
.table-wrap td:nth-child(2){width:14%!important;text-align:center!important}
.table-wrap th:nth-child(3),
.table-wrap td:nth-child(3){width:16%!important;text-align:center!important}
.table-wrap th:nth-child(4),
.table-wrap td:nth-child(4){width:15%!important;text-align:center!important}
.table-wrap th:nth-child(5),
.table-wrap td:nth-child(5){width:21%!important;text-align:center!important}
.table-wrap th:nth-child(6),
.table-wrap td:nth-child(6){width:12%!important;text-align:center!important}

.conference-status{
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:12px!important;
  flex-wrap:nowrap!important;
  min-width:0!important;
}
.conference-status form{margin:0!important}

.review-toggle{
  appearance:none!important;
  border:0!important;
  background:transparent!important;
  padding:0!important;
  margin:0!important;
  min-width:0!important;
  min-height:0!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  cursor:pointer!important;
  border-radius:999px!important;
}
.review-toggle-track{
  position:relative!important;
  display:block!important;
  width:42px!important;
  height:24px!important;
  border-radius:999px!important;
  border:1px solid #b9c2cc!important;
  background:#dfe4e9!important;
  transition:background-color .22s ease,border-color .22s ease,box-shadow .22s ease!important;
}
.review-toggle-knob{
  position:absolute!important;
  top:3px!important;
  left:3px!important;
  width:16px!important;
  height:16px!important;
  border-radius:50%!important;
  background:#fff!important;
  box-shadow:0 1px 3px rgba(4,30,66,.18)!important;
  transition:transform .22s ease!important;
}
.review-toggle.is-on .review-toggle-track{
  background:#2f6b52!important;
  border-color:#2f6b52!important;
}
.review-toggle.is-on .review-toggle-knob{
  transform:translateX(18px)!important;
}
.review-toggle:hover .review-toggle-track{
  box-shadow:0 0 0 4px rgba(4,30,66,.06)!important;
}
.review-toggle:focus-visible{
  outline:2px solid var(--navy)!important;
  outline-offset:4px!important;
}
.review-toggle.is-off .review-toggle-track{
  background:#e4e8ec!important;
  border-color:#bcc5cf!important;
}

@media(max-width:980px){
  .table-wrap table{
    table-layout:auto!important;
    min-width:1050px!important;
  }
  .table-wrap th,
  .table-wrap td{
    width:auto!important;
  }
}


/* ==========================================================
   V9.2 — MOBILE PREMIUM
   Resumo em cards + lista responsiva sem rolagem horizontal
   ========================================================== */

@media(max-width:760px){

  /* Cabeçalho */
  .header{
    padding:16px 14px!important;
  }
  .header img{
    width:84px!important;
  }
  .header a{
    font-size:.68rem!important;
  }

  .admin{
    padding:28px 14px 54px!important;
  }

  .admin-head{
    gap:16px!important;
    margin-bottom:20px!important;
  }
  .admin h1,
  .login h1{
    font-size:1.72rem!important;
    line-height:1.05!important;
    letter-spacing:-.025em!important;
  }
  .eyebrow{
    font-size:.62rem!important;
    letter-spacing:.15em!important;
  }
  .admin-head .button{
    min-height:38px!important;
    padding:8px 14px!important;
    font-size:.72rem!important;
  }

  /* Resumo premium */
  .stats{
    grid-template-columns:1fr 1fr!important;
    gap:10px!important;
    border:0!important;
    padding:0!important;
    margin:18px 0 26px!important;
  }
  .stat{
    position:relative!important;
    min-height:104px!important;
    padding:15px 14px 13px!important;
    border:1px solid rgba(4,30,66,.10)!important;
    border-radius:16px!important;
    background:rgba(255,255,255,.48)!important;
    overflow:hidden!important;
  }
  .stat::before{
    content:""!important;
    position:absolute!important;
    left:0!important;
    top:0!important;
    width:3px!important;
    height:100%!important;
    background:rgba(4,30,66,.16)!important;
  }
  .stat strong{
    font-size:1.65rem!important;
    letter-spacing:-.035em!important;
    margin-top:3px!important;
  }
  .stat span{
    display:block!important;
    margin-top:7px!important;
    font-size:.67rem!important;
    line-height:1.25!important;
  }
  .stat.cash{
    background:rgba(47,107,82,.07)!important;
    border-color:rgba(47,107,82,.17)!important;
  }
  .stat.cash::before{
    background:var(--green)!important;
  }
  .stat.cash strong{
    font-size:1.48rem!important;
  }

  /* Busca */
  .search{
    display:grid!important;
    grid-template-columns:1fr 1fr 1.15fr!important;
    gap:8px!important;
    margin-top:0!important;
  }
  .search input{
    grid-column:1 / -1!important;
    width:100%!important;
    min-width:0!important;
    min-height:44px!important;
    font-size:16px!important; /* evita zoom no iPhone */
  }
  .search .button{
    width:100%!important;
    min-height:42px!important;
    padding:8px 8px!important;
    font-size:.68rem!important;
  }
  .note{
    margin:10px 0 23px!important;
    font-size:.66rem!important;
    line-height:1.45!important;
  }

  /* A tabela deixa de ser tabela e vira cards empilhados */
  .table-wrap{
    overflow:visible!important;
    border-top:0!important;
    margin-top:10px!important;
  }
  .table-wrap table{
    display:block!important;
    width:100%!important;
    min-width:0!important;
    table-layout:auto!important;
  }
  .table-wrap thead{
    display:none!important;
  }
  .table-wrap tbody{
    display:grid!important;
    gap:12px!important;
  }
  .table-wrap tr{
    display:grid!important;
    grid-template-columns:1fr 1fr!important;
    gap:0 14px!important;
    width:100%!important;
    padding:14px 14px 12px!important;
    border:1px solid rgba(4,30,66,.10)!important;
    border-radius:16px!important;
    background:rgba(255,255,255,.42)!important;
  }
  .table-wrap td{
    display:block!important;
    width:auto!important;
    min-width:0!important;
    padding:9px 0!important;
    border:0!important;
    text-align:left!important;
  }
  .table-wrap td::before{
    display:block!important;
    margin-bottom:5px!important;
    color:var(--muted)!important;
    font-size:.58rem!important;
    line-height:1.1!important;
    font-weight:700!important;
    letter-spacing:.08em!important;
    text-transform:uppercase!important;
  }

  .table-wrap td:nth-child(1){
    grid-column:1 / -1!important;
    padding-top:2px!important;
    padding-bottom:11px!important;
    border-bottom:1px solid rgba(4,30,66,.08)!important;
  }
  .table-wrap td:nth-child(1)::before{content:"Participante"!important}
  .table-wrap td:nth-child(2)::before{content:"WhatsApp"!important}
  .table-wrap td:nth-child(3)::before{content:"Data da inscrição"!important}
  .table-wrap td:nth-child(4)::before{content:"Comprovante"!important}
  .table-wrap td:nth-child(5)::before{content:"Conferência"!important}
  .table-wrap td:nth-child(6)::before{content:"Ações"!important}

  .table-wrap td:nth-child(4),
  .table-wrap td:nth-child(5){
    border-top:1px solid rgba(4,30,66,.07)!important;
    padding-top:11px!important;
  }
  .table-wrap td:nth-child(6){
    grid-column:1 / -1!important;
    border-top:1px solid rgba(4,30,66,.07)!important;
    padding-top:11px!important;
    padding-bottom:1px!important;
  }

  .table-wrap td strong,
  .table-wrap td:first-child{
    font-size:.82rem!important;
  }
  .table-wrap td small{
    font-size:.65rem!important;
    margin-top:4px!important;
  }
  .receipt-link,
  .delete-link{
    font-size:.74rem!important;
  }

  /* Conferência compacta no card */
  .conference-status{
    justify-content:flex-start!important;
    gap:9px!important;
    min-width:0!important;
  }
  .conference-status .state{
    min-height:25px!important;
    padding:4px 9px!important;
    font-size:.64rem!important;
  }
  .review-toggle-track{
    width:38px!important;
    height:22px!important;
  }
  .review-toggle-knob{
    width:14px!important;
    height:14px!important;
  }
  .review-toggle.is-on .review-toggle-knob{
    transform:translateX(16px)!important;
  }

  /* Rodapé do painel */
  .password{
    margin-top:26px!important;
    padding-top:18px!important;
  }
  .password summary{
    font-size:.78rem!important;
  }
}

/* Smartphones muito estreitos */
@media(max-width:380px){
  .admin{
    padding-left:11px!important;
    padding-right:11px!important;
  }
  .stats{
    gap:8px!important;
  }
  .stat{
    padding-left:12px!important;
    padding-right:12px!important;
  }
  .search{
    grid-template-columns:1fr 1fr!important;
  }
  .search .button:last-child{
    grid-column:1 / -1!important;
  }
  .table-wrap tr{
    grid-template-columns:1fr!important;
  }
  .table-wrap td,
  .table-wrap td:nth-child(1),
  .table-wrap td:nth-child(6){
    grid-column:1!important;
  }
  .table-wrap td:nth-child(n+2){
    border-top:1px solid rgba(4,30,66,.07)!important;
  }
}


/* ==========================================================
   V9.3 — MOBILE REFINADO / LEGIBILIDADE REAL
   ========================================================== */

@media(max-width:760px){

  body{
    -webkit-text-size-adjust:100%!important;
    text-rendering:optimizeLegibility!important;
  }

  .header{
    padding:14px 16px!important;
  }
  .header img{
    width:92px!important;
  }
  .header>a:last-child{
    font-size:.72rem!important;
    padding-bottom:5px!important;
  }

  .admin{
    padding:30px 16px 56px!important;
  }

  .admin-head{
    align-items:flex-start!important;
    margin-bottom:24px!important;
  }
  .admin h1,
  .login h1{
    max-width:240px!important;
    font-size:1.82rem!important;
    line-height:1.02!important;
    letter-spacing:-.035em!important;
  }
  .eyebrow{
    margin-bottom:5px!important;
    font-size:.64rem!important;
    letter-spacing:.14em!important;
  }
  .admin-head .button{
    min-height:40px!important;
    padding:8px 15px!important;
    font-size:.74rem!important;
  }

  /* resumo */
  .stats{
    grid-template-columns:1fr 1fr!important;
    gap:12px!important;
    margin:18px 0 28px!important;
  }
  .stat{
    min-height:112px!important;
    padding:16px!important;
    border-radius:18px!important;
    border:1px solid rgba(4,30,66,.09)!important;
    background:rgba(255,255,255,.62)!important;
  }
  .stat::before{
    width:4px!important;
  }
  .stat strong{
    font-size:1.78rem!important;
    line-height:1!important;
    margin-top:2px!important;
  }
  .stat span{
    margin-top:9px!important;
    font-size:.72rem!important;
    line-height:1.25!important;
  }
  .stat.cash strong{
    font-size:1.62rem!important;
  }

  /* busca */
  .search{
    grid-template-columns:1fr 1fr 1.15fr!important;
    gap:10px!important;
  }
  .search input{
    min-height:48px!important;
    padding:12px 14px!important;
    font-size:16px!important;
    border-radius:12px!important;
  }
  .search .button{
    min-height:44px!important;
    border-radius:999px!important;
    font-size:.72rem!important;
    padding:8px 10px!important;
  }
  .note{
    margin:11px 1px 26px!important;
    font-size:.72rem!important;
    line-height:1.5!important;
  }

  /* cards de inscrição */
  .table-wrap{
    margin-top:8px!important;
  }
  .table-wrap tbody{
    gap:14px!important;
  }
  .table-wrap tr{
    grid-template-columns:1fr 1fr!important;
    column-gap:18px!important;
    row-gap:0!important;
    padding:18px 16px 16px!important;
    border-radius:18px!important;
    border:1px solid rgba(4,30,66,.085)!important;
    background:rgba(255,255,255,.58)!important;
  }

  .table-wrap td{
    padding:11px 0!important;
    font-size:.86rem!important;
    line-height:1.35!important;
  }

  .table-wrap td::before{
    margin-bottom:6px!important;
    font-size:.62rem!important;
    font-weight:700!important;
    letter-spacing:.08em!important;
    color:#7a8798!important;
  }

  .table-wrap td:nth-child(1){
    padding-top:0!important;
    padding-bottom:14px!important;
    margin-bottom:2px!important;
  }
  .table-wrap td:nth-child(1)::before{
    margin-bottom:7px!important;
  }

  .table-wrap td:first-child{
    font-size:.98rem!important;
    line-height:1.22!important;
    font-weight:700!important;
    letter-spacing:-.01em!important;
  }
  .table-wrap td:first-child small{
    margin-top:6px!important;
    font-size:.68rem!important;
    line-height:1.25!important;
    color:#7b8796!important;
  }

  .table-wrap td:nth-child(2),
  .table-wrap td:nth-child(3){
    min-height:78px!important;
  }

  .table-wrap td:nth-child(4),
  .table-wrap td:nth-child(5){
    padding-top:14px!important;
    border-top:1px solid rgba(4,30,66,.07)!important;
  }

  .table-wrap td:nth-child(6){
    grid-column:1/-1!important;
    padding-top:13px!important;
    border-top:1px solid rgba(4,30,66,.07)!important;
  }

  .table-wrap a{
    font-size:.82rem!important;
    line-height:1.35!important;
  }

  .receipt-link{
    font-weight:600!important;
    text-decoration-thickness:1px!important;
    text-underline-offset:4px!important;
  }
  .delete-link{
    color:#b75b4e!important;
    font-weight:500!important;
    text-decoration:none!important;
  }
  .delete-link:hover{
    text-decoration:underline!important;
    text-underline-offset:3px!important;
  }

  /* conferencia */
  .conference-status{
    align-items:center!important;
    justify-content:flex-start!important;
    gap:10px!important;
  }
  .conference-status .state{
    min-height:28px!important;
    padding:5px 10px!important;
    font-size:.68rem!important;
    font-weight:700!important;
  }
  .review-toggle-track{
    width:40px!important;
    height:23px!important;
  }
  .review-toggle-knob{
    width:15px!important;
    height:15px!important;
  }
  .review-toggle.is-on .review-toggle-knob{
    transform:translateX(17px)!important;
  }

  /* senha */
  .password{
    margin-top:30px!important;
    padding-top:20px!important;
  }
  .password summary{
    font-size:.82rem!important;
  }
}

/* iPhone estreito */
@media(max-width:390px){
  .admin{
    padding-left:14px!important;
    padding-right:14px!important;
  }

  .stats{
    gap:10px!important;
  }
  .stat{
    min-height:108px!important;
    padding:14px!important;
  }

  .search{
    grid-template-columns:1fr 1fr!important;
  }
  .search .button:last-child{
    grid-column:1/-1!important;
  }

  .table-wrap tr{
    grid-template-columns:1fr 1fr!important;
    column-gap:14px!important;
    padding:17px 14px 15px!important;
  }

  .table-wrap td{
    font-size:.83rem!important;
  }

  .table-wrap td:first-child{
    font-size:.94rem!important;
  }
}

/* celulares muito estreitos: só os blocos secundários passam a 1 coluna */
@media(max-width:340px){
  .table-wrap tr{
    grid-template-columns:1fr!important;
  }
  .table-wrap td,
  .table-wrap td:nth-child(1),
  .table-wrap td:nth-child(6){
    grid-column:1!important;
  }
  .table-wrap td:nth-child(n+2){
    min-height:0!important;
    border-top:1px solid rgba(4,30,66,.07)!important;
    padding-top:12px!important;
  }
}


/* V9.4 — mobile: evitar quebra de texto dentro dos cards */
@media(max-width:760px){

  /* Participante e protocolo */
  .table-wrap td:nth-child(1),
  .table-wrap td:nth-child(1) strong,
  .table-wrap td:nth-child(1) small{
    white-space:nowrap!important;
    overflow:hidden!important;
    text-overflow:ellipsis!important;
  }

  /* WhatsApp e data */
  .table-wrap td:nth-child(2),
  .table-wrap td:nth-child(3){
    white-space:nowrap!important;
  }

  /* Links e ações */
  .receipt-link,
  .delete-link{
    white-space:nowrap!important;
  }

  /* Tag e toggle nunca quebram */
  .conference-status{
    flex-wrap:nowrap!important;
    white-space:nowrap!important;
  }
  .conference-status .state{
    white-space:nowrap!important;
  }

  /* Rótulos internos */
  .table-wrap td::before{
    white-space:nowrap!important;
  }
}

/* iPhones estreitos: permitir mais espaço horizontal para os pares */
@media(max-width:390px){
  .table-wrap tr{
    grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr)!important;
  }

  .table-wrap td:nth-child(2),
  .table-wrap td:nth-child(3),
  .table-wrap td:nth-child(4),
  .table-wrap td:nth-child(5){
    min-width:0!important;
  }
}


/* V9.5 — participante e protocolo sempre completos no mobile */
@media(max-width:760px){

  /* Nome completo visível */
  .table-wrap td:nth-child(1),
  .table-wrap td:nth-child(1) strong{
    white-space:normal!important;
    overflow:visible!important;
    text-overflow:clip!important;
  }

  /* Protocolo completo em uma linha sempre que couber; 
     se faltar espaço, quebra somente o protocolo de forma controlada */
  .table-wrap td:nth-child(1) small{
    white-space:normal!important;
    overflow:visible!important;
    text-overflow:clip!important;
    overflow-wrap:anywhere!important;
    word-break:break-word!important;
  }

  /* Nome fica visualmente destacado e legível */
  .table-wrap td:nth-child(1){
    line-height:1.3!important;
  }

  .table-wrap td:nth-child(1) strong{
    display:block!important;
    font-size:1rem!important;
    line-height:1.28!important;
  }

  .table-wrap td:nth-child(1) small{
    display:block!important;
    margin-top:6px!important;
    font-size:.7rem!important;
    line-height:1.35!important;
    letter-spacing:.01em!important;
  }
}


/* V9.6 — participante em uma linha, sem reticências e sem quebra */
@media(max-width:760px){

  /* A primeira linha do card ocupa toda a largura disponível */
  .table-wrap td:nth-child(1){
    grid-column:1 / -1!important;
    width:100%!important;
    min-width:0!important;
    overflow:visible!important;
  }

  /* Nome completo em uma única linha.
     O tamanho se adapta à largura da tela para evitar quebra. */
  .table-wrap td:nth-child(1){
    white-space:nowrap!important;
  }

  .table-wrap td:nth-child(1) strong,
  .table-wrap td:nth-child(1){
    white-space:nowrap!important;
    overflow:visible!important;
    text-overflow:clip!important;
  }

  .table-wrap td:nth-child(1){
    font-size:clamp(.78rem,3.45vw,.94rem)!important;
    line-height:1.22!important;
    letter-spacing:-.018em!important;
  }

  /* Protocolo também em uma única linha, menor e secundário */
  .table-wrap td:nth-child(1) small{
    display:block!important;
    white-space:nowrap!important;
    overflow:visible!important;
    text-overflow:clip!important;
    overflow-wrap:normal!important;
    word-break:normal!important;
    font-size:clamp(.59rem,2.6vw,.68rem)!important;
    line-height:1.2!important;
    letter-spacing:0!important;
    margin-top:6px!important;
  }
}

/* Em aparelhos muito estreitos, reduz um pouco mais o nome,
   preservando a linha única e o conteúdo completo. */
@media(max-width:360px){
  .table-wrap td:nth-child(1){
    font-size:.75rem!important;
    letter-spacing:-.025em!important;
  }
  .table-wrap td:nth-child(1) small{
    font-size:.58rem!important;
  }
}


/* ==========================================================
   V9.7 — refinamento dos cards de resumo no mobile
   Cards dos participantes preservados
   ========================================================== */
@media(max-width:760px){

  /* aproxima título e resumo */
  .admin-head{
    margin-bottom:18px!important;
  }

  .stats{
    grid-template-columns:1fr 1fr!important;
    gap:10px!important;
    margin:12px 0 24px!important;
  }

  .stat{
    position:relative!important;
    min-height:94px!important;
    padding:14px 14px 12px!important;
    border-radius:14px!important;
    border:1px solid rgba(4,30,66,.08)!important;
    background:#f8f8f3!important;
    overflow:hidden!important;
  }

  /* detalhe superior discreto, em vez da faixa lateral pesada */
  .stat::before{
    content:""!important;
    position:absolute!important;
    top:0!important;
    left:0!important;
    width:100%!important;
    height:3px!important;
    background:rgba(4,30,66,.13)!important;
  }

  .stat strong{
    display:block!important;
    margin:2px 0 0!important;
    font-size:1.55rem!important;
    line-height:1!important;
    letter-spacing:-.03em!important;
  }

  .stat span{
    display:block!important;
    margin-top:8px!important;
    font-size:.7rem!important;
    line-height:1.2!important;
    color:#68778f!important;
  }

  /* pequenos indicadores visuais no canto */
  .stat::after{
    position:absolute!important;
    top:12px!important;
    right:12px!important;
    display:flex!important;
    align-items:center!important;
    justify-content:center!important;
    width:26px!important;
    height:26px!important;
    border-radius:8px!important;
    font-size:.82rem!important;
    font-weight:800!important;
    color:#5f6d82!important;
    background:rgba(4,30,66,.045)!important;
  }

  .stat:nth-child(1)::after{
    content:"01"!important;
  }
  .stat:nth-child(2){
    background:#f5f8fb!important;
    border-color:rgba(33,135,213,.12)!important;
  }
  .stat:nth-child(2)::before{
    background:#8fb9db!important;
  }
  .stat:nth-child(2)::after{
    content:"✓"!important;
    color:#3b6f98!important;
    background:rgba(33,135,213,.08)!important;
  }

  .stat:nth-child(3){
    background:#fbf8f3!important;
    border-color:rgba(255,109,58,.12)!important;
  }
  .stat:nth-child(3)::before{
    background:#e6a476!important;
  }
  .stat:nth-child(3)::after{
    content:"!"!important;
    color:#a8632f!important;
    background:rgba(255,109,58,.08)!important;
  }

  .stat.cash{
    background:#eef4ef!important;
    border-color:rgba(47,107,82,.14)!important;
  }
  .stat.cash::before{
    background:#3f7d60!important;
  }
  .stat.cash::after{
    content:"R$"!important;
    color:#2f6b52!important;
    background:rgba(47,107,82,.08)!important;
  }
  .stat.cash strong{
    color:#2f6b52!important;
    font-size:1.48rem!important;
  }
}

/* telas menores */
@media(max-width:390px){
  .stats{
    gap:8px!important;
  }
  .stat{
    min-height:90px!important;
    padding:13px 12px 11px!important;
  }
  .stat strong{
    font-size:1.46rem!important;
  }
  .stat.cash strong{
    font-size:1.38rem!important;
  }
  .stat::after{
    top:10px!important;
    right:10px!important;
    width:24px!important;
    height:24px!important;
    font-size:.76rem!important;
  }
}


/* ==========================================================
   V9.8 — RESUMO MOBILE MINIMAL / PREMIUM
   Sem ícones, sem cores por categoria, sem aparência de dashboard
   ========================================================== */
@media(max-width:760px){

  .admin-head{
    margin-bottom:16px!important;
  }

  .stats{
    grid-template-columns:1fr 1fr!important;
    gap:10px!important;
    margin:12px 0 25px!important;
  }

  .stat,
  .stat.cash{
    position:relative!important;
    min-height:92px!important;
    padding:15px 15px 13px!important;
    border:1px solid rgba(4,30,66,.10)!important;
    border-radius:14px!important;
    background:rgba(255,255,255,.48)!important;
    box-shadow:none!important;
    overflow:hidden!important;
  }

  /* remove faixas e ícones das versões anteriores */
  .stat::before,
  .stat::after,
  .stat.cash::before,
  .stat.cash::after{
    content:none!important;
    display:none!important;
  }

  .stat strong,
  .stat.cash strong{
    display:block!important;
    margin:0!important;
    color:var(--navy)!important;
    font-family:Montserrat,Arial,sans-serif!important;
    font-size:1.52rem!important;
    line-height:1!important;
    letter-spacing:-.035em!important;
    font-weight:800!important;
  }

  .stat span,
  .stat.cash span{
    display:block!important;
    margin-top:9px!important;
    color:#6f7e92!important;
    font-size:.71rem!important;
    line-height:1.25!important;
    font-weight:400!important;
  }

  /* detalhe premium discreto: apenas o total financeiro ganha peso tipográfico */
  .stat.cash{
    border-color:rgba(4,30,66,.14)!important;
    background:rgba(255,255,255,.58)!important;
  }

  .stat.cash strong{
    font-size:1.48rem!important;
    font-weight:800!important;
  }
}

@media(max-width:390px){
  .stats{
    gap:8px!important;
  }

  .stat,
  .stat.cash{
    min-height:88px!important;
    padding:14px 13px 12px!important;
    border-radius:13px!important;
  }

  .stat strong,
  .stat.cash strong{
    font-size:1.43rem!important;
  }

  .stat span,
  .stat.cash span{
    font-size:.68rem!important;
  }
}


/* V9.9 — legendas do resumo mais legíveis no mobile */
@media(max-width:760px){
  .stat span,
  .stat.cash span{
    margin-top:8px!important;
    color:#59697f!important;
    font-size:.78rem!important;
    line-height:1.28!important;
    font-weight:500!important;
    letter-spacing:-.005em!important;
  }
}

@media(max-width:390px){
  .stat span,
  .stat.cash span{
    font-size:.75rem!important;
  }
}


/* V10.0 — desktop: centralização do resumo */
@media(min-width:761px){
  .stats{
    text-align:center!important;
  }

  .stat{
    display:flex!important;
    flex-direction:column!important;
    align-items:center!important;
    justify-content:center!important;
  }

  .stat strong,
  .stat span{
    text-align:center!important;
  }
}


/* V11.0 — trava horizontal global */
html,body{width:100%;max-width:100%;overflow-x:hidden!important;overscroll-behavior-x:none}
@supports (overflow:clip){html,body{overflow-x:clip!important}}
body{position:relative;touch-action:pan-y pinch-zoom}
header,main,footer{max-width:100%}


/* V11.1 — total recebido verde também no mobile */
@media(max-width:760px){
  .stat.cash strong{
    color:var(--green) !important;
  }
}


/* V11.2 — tela de login Mulheres no padrão visual do NXT */
@media(max-width:760px){
  .login{
    width:100% !important;
    max-width:460px !important;
    margin:46px auto 0 !important;
  }

  .login .eyebrow{
    margin-bottom:6px !important;
  }

  .login h1{
    width:100% !important;
    max-width:none !important;
    margin:7px 0 0 !important;
    font-size:1.72rem !important;
    line-height:1.05 !important;
    letter-spacing:-.025em !important;
    white-space:nowrap !important;
  }

  .login p{
    max-width:34ch !important;
    margin:12px 0 20px !important;
    font-size:.82rem !important;
    line-height:1.55 !important;
  }

  .login label{
    margin:0 0 7px !important;
    font-size:.78rem !important;
  }

  .login input{
    min-height:48px !important;
    height:48px !important;
    font-size:16px !important;
    border-radius:9px !important;
  }

  .login .button{
    min-height:44px !important;
    margin-top:18px !important;
    padding:10px 17px !important;
    font-size:.78rem !important;
  }
}

@media(max-width:340px){
  .login h1{
    font-size:1.58rem !important;
  }
}


/* V11.3 — login mobile refinado */
@media(max-width:760px){

  /* largura geral mais elegante e alinhada */
  .admin{
    padding-left:18px!important;
    padding-right:18px!important;
  }

  .login{
    width:100%!important;
    max-width:360px!important;
    margin:54px auto 0!important;
  }

  /* eyebrow sem caixa alta forçada */
  .login .eyebrow{
    display:block!important;
    margin-bottom:8px!important;
    color:var(--orange)!important;
    font-size:.72rem!important;
    line-height:1.2!important;
    font-weight:600!important;
    letter-spacing:.03em!important;
    text-transform:none!important;
  }

  .login h1{
    margin:0!important;
    width:100%!important;
    max-width:none!important;
    font-size:1.78rem!important;
    line-height:1.04!important;
    letter-spacing:-.03em!important;
    white-space:normal!important;
  }

  .login p{
    width:100%!important;
    max-width:31ch!important;
    margin:14px 0 24px!important;
    color:#66768a!important;
    font-size:.82rem!important;
    line-height:1.55!important;
  }

  .login form{
    width:100%!important;
    max-width:320px!important;
  }

  .login label{
    margin:0 0 7px!important;
    font-size:.76rem!important;
    line-height:1.2!important;
    font-weight:500!important;
    text-transform:none!important;
  }

  .login input{
    width:100%!important;
    height:44px!important;
    min-height:44px!important;
    padding:0 12px!important;
    border-radius:8px!important;
    font-size:16px!important;
  }

  .login .button{
    min-height:42px!important;
    margin-top:14px!important;
    padding:9px 16px!important;
    font-size:.76rem!important;
    font-weight:600!important;
    border-radius:999px!important;
  }
}

@media(max-width:390px){
  .login{
    max-width:100%!important;
  }

  .login form{
    max-width:100%!important;
  }

  .login h1{
    font-size:1.68rem!important;
  }

  .login p{
    max-width:100%!important;
  }
}


/* V11.4 — login mobile alinhado ao padrão NXT */
@media(max-width:760px){

  /* Garante que nada ultrapasse a viewport */
  .admin,
  .login,
  .login form,
  .login p,
  .login h1,
  .login input,
  .login .button{
    max-width:100%!important;
    box-sizing:border-box!important;
  }

  .admin{
    width:100%!important;
    padding-left:18px!important;
    padding-right:18px!important;
    overflow-x:hidden!important;
  }

  .login{
    width:100%!important;
    max-width:360px!important;
    margin:52px auto 0!important;
  }

  /* padrão NXT: eyebrow em caixa alta */
  .login .eyebrow{
    display:block!important;
    margin-bottom:8px!important;
    font-size:.66rem!important;
    line-height:1.2!important;
    font-weight:700!important;
    letter-spacing:.14em!important;
    text-transform:uppercase!important;
  }

  /* nome do evento em caixa alta, como padrão visual */
  .login h1{
    width:100%!important;
    margin:0!important;
    font-size:1.68rem!important;
    line-height:1.06!important;
    letter-spacing:-.025em!important;
    text-transform:uppercase!important;
    white-space:normal!important;
    overflow-wrap:normal!important;
    word-break:normal!important;
  }

  .login p{
    width:100%!important;
    margin:14px 0 22px!important;
    font-size:.8rem!important;
    line-height:1.5!important;
    color:#66768a!important;
  }

  .login form{
    width:100%!important;
    max-width:100%!important;
  }

  .login label{
    display:block!important;
    margin:0 0 7px!important;
    font-size:.76rem!important;
    line-height:1.2!important;
    font-weight:500!important;
  }

  .login input{
    display:block!important;
    width:100%!important;
    min-width:0!important;
    height:44px!important;
    min-height:44px!important;
    padding:0 12px!important;
    border-radius:8px!important;
    font-size:16px!important;
  }

  .login .button{
    width:auto!important;
    min-width:0!important;
    min-height:42px!important;
    margin-top:14px!important;
    padding:9px 16px!important;
    font-size:.76rem!important;
    border-radius:999px!important;
  }
}

@media(max-width:390px){
  .admin{
    padding-left:16px!important;
    padding-right:16px!important;
  }

  .login{
    max-width:100%!important;
  }

  .login h1{
    font-size:1.58rem!important;
  }
}


/* V11.5 — corrige cortes reais no mobile: header + senha */
@media(max-width:760px){

  html,
  body{
    width:100%!important;
    max-width:100%!important;
    overflow-x:hidden!important;
  }

  /* Cabeçalho realmente contido na viewport */
  .header{
    width:100%!important;
    max-width:100%!important;
    padding:14px 14px!important;
    margin:0!important;
    box-sizing:border-box!important;
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    gap:12px!important;
    overflow:hidden!important;
  }

  .header>a{
    min-width:0!important;
    max-width:100%!important;
    box-sizing:border-box!important;
  }

  .header>a:first-child{
    flex:0 0 auto!important;
    border-bottom:0!important;
    padding-bottom:0!important;
  }

  .header>a:last-child{
    flex:0 0 auto!important;
    white-space:nowrap!important;
    font-size:.68rem!important;
    padding-bottom:5px!important;
    margin-left:auto!important;
  }

  .header img{
    width:82px!important;
    max-width:82px!important;
    height:auto!important;
  }

  /* Área principal sem largura excedente */
  .admin{
    width:auto!important;
    max-width:none!important;
    margin:0!important;
    padding:0 16px 54px!important;
    box-sizing:border-box!important;
    overflow:visible!important;
  }

  .login{
    width:auto!important;
    max-width:360px!important;
    margin:52px 0 0!important;
    padding:0!important;
    box-sizing:border-box!important;
  }

  .login form{
    width:100%!important;
    max-width:100%!important;
    margin:0!important;
    padding:0!important;
    box-sizing:border-box!important;
  }

  .login input{
    display:block!important;
    width:100%!important;
    max-width:100%!important;
    min-width:0!important;
    box-sizing:border-box!important;
    height:44px!important;
    min-height:44px!important;
    margin:0!important;
    padding:0 12px!important;
  }

  .login .button{
    max-width:100%!important;
  }
}

@media(max-width:360px){
  .header{
    padding-left:12px!important;
    padding-right:12px!important;
    gap:8px!important;
  }

  .header img{
    width:76px!important;
    max-width:76px!important;
  }

  .header>a:last-child{
    font-size:.64rem!important;
  }

  .admin{
    padding-left:14px!important;
    padding-right:14px!important;
  }
}


/* V11.6 — layout fluido por largura disponível, sem depender de um aparelho específico */
@media(max-width:760px){

  :root{
    --mobile-gutter:clamp(10px,4vw,18px);
  }

  html,
  body{
    inline-size:100%!important;
    max-inline-size:100%!important;
    overflow-x:hidden!important;
  }

  /* Cabeçalho fluido: logo e link se adaptam à largura real disponível */
  .header{
    inline-size:100%!important;
    max-inline-size:none!important;
    margin:0!important;
    padding-block:14px!important;
    padding-inline:var(--mobile-gutter)!important;
    box-sizing:border-box!important;
    display:grid!important;
    grid-template-columns:minmax(0,auto) minmax(0,1fr)!important;
    align-items:center!important;
    column-gap:clamp(8px,3vw,16px)!important;
    overflow:visible!important;
  }

  .header>a{
    min-inline-size:0!important;
    max-inline-size:100%!important;
    box-sizing:border-box!important;
  }

  .header>a:first-child{
    justify-self:start!important;
    border-bottom:0!important;
    padding-bottom:0!important;
  }

  .header img{
    inline-size:clamp(72px,21vw,90px)!important;
    max-inline-size:100%!important;
    height:auto!important;
    display:block!important;
  }

  .header>a:last-child{
    justify-self:end!important;
    text-align:right!important;
    white-space:nowrap!important;
    overflow:visible!important;
    font-size:clamp(.58rem,2.7vw,.72rem)!important;
    line-height:1.2!important;
    padding-bottom:5px!important;
  }

  /* Área principal usa a largura REAL restante após os gutters */
  .admin{
    inline-size:100%!important;
    max-inline-size:none!important;
    margin:0!important;
    padding-block:0 54px!important;
    padding-inline:var(--mobile-gutter)!important;
    box-sizing:border-box!important;
    overflow:visible!important;
  }

  .login{
    inline-size:min(100%,23rem)!important;
    max-inline-size:100%!important;
    margin:52px 0 0!important;
    padding:0!important;
    box-sizing:border-box!important;
  }

  .login .eyebrow,
  .login h1,
  .login p,
  .login form,
  .login label,
  .login input,
  .login .button{
    max-inline-size:100%!important;
    box-sizing:border-box!important;
  }

  .login h1{
    inline-size:100%!important;
    font-size:clamp(1.35rem,6.6vw,1.68rem)!important;
    line-height:1.05!important;
    white-space:normal!important;
  }

  .login p{
    inline-size:100%!important;
    max-inline-size:32ch!important;
    font-size:clamp(.75rem,3.2vw,.82rem)!important;
  }

  .login form{
    inline-size:100%!important;
    max-inline-size:100%!important;
    margin:0!important;
    padding:0!important;
  }

  .login input{
    display:block!important;
    inline-size:100%!important;
    min-inline-size:0!important;
    max-inline-size:100%!important;
    height:44px!important;
    min-height:44px!important;
    margin:0!important;
    padding-inline:12px!important;
  }

  .login .button{
    inline-size:max-content!important;
    max-inline-size:100%!important;
  }
}


/* V11.7 — correção estrutural: sem larguras travadas no login mobile */
@media(max-width:760px){

  html,
  body{
    margin:0!important;
    padding:0!important;
    width:100%!important;
    max-width:100%!important;
    overflow-x:hidden!important;
  }

  /* Cabeçalho adaptativo: a segunda coluna recebe somente o espaço necessário.
     Se faltar largura, o link pode quebrar em até 2 linhas em vez de ser cortado. */
  .header{
    display:grid!important;
    grid-template-columns:minmax(0,1fr) auto!important;
    align-items:center!important;
    gap:10px!important;
    width:auto!important;
    max-width:none!important;
    margin:0!important;
    padding:14px clamp(10px,4vw,18px)!important;
    box-sizing:border-box!important;
    overflow:visible!important;
  }

  .header>a:first-child{
    min-width:0!important;
    justify-self:start!important;
    border-bottom:0!important;
    padding:0!important;
  }

  .header img{
    display:block!important;
    width:clamp(72px,22vw,88px)!important;
    max-width:100%!important;
    height:auto!important;
  }

  .header>a:last-child{
    min-width:0!important;
    max-width:13ch!important;
    justify-self:end!important;
    text-align:right!important;
    white-space:normal!important;
    overflow:visible!important;
    overflow-wrap:normal!important;
    word-break:normal!important;
    line-height:1.15!important;
    font-size:clamp(.62rem,2.8vw,.72rem)!important;
    padding:0 0 5px!important;
  }

  /* Conteúdo usa grid real; nenhum elemento calcula 100% + padding. */
  .admin{
    display:grid!important;
    grid-template-columns:minmax(0,1fr)!important;
    width:auto!important;
    max-width:none!important;
    margin:0!important;
    padding:0 clamp(10px,4vw,18px) 54px!important;
    box-sizing:border-box!important;
    overflow:visible!important;
  }

  .login{
    display:grid!important;
    grid-template-columns:minmax(0,1fr)!important;
    width:auto!important;
    max-width:23rem!important;
    min-width:0!important;
    margin:52px 0 0!important;
    padding:0!important;
    box-sizing:border-box!important;
  }

  .login .eyebrow,
  .login h1,
  .login p,
  .login form,
  .login label{
    min-width:0!important;
    max-width:100%!important;
    box-sizing:border-box!important;
  }

  .login .eyebrow{
    text-transform:uppercase!important;
    letter-spacing:.14em!important;
    font-size:.66rem!important;
    font-weight:700!important;
  }

  .login h1{
    width:auto!important;
    max-width:100%!important;
    margin:7px 0 0!important;
    font-size:clamp(1.38rem,6.4vw,1.68rem)!important;
    line-height:1.05!important;
    text-transform:uppercase!important;
    white-space:normal!important;
  }

  .login p{
    width:auto!important;
    max-width:32ch!important;
    margin:14px 0 22px!important;
    font-size:clamp(.75rem,3.2vw,.82rem)!important;
    line-height:1.5!important;
  }

  /* A chave: form e input usam stretch do grid, não width:100%.
     Isso evita o estouro que continuava acontecendo em telas estreitas. */
  .login form{
    display:grid!important;
    grid-template-columns:minmax(0,1fr)!important;
    width:auto!important;
    max-width:none!important;
    min-width:0!important;
    margin:0!important;
    padding:0!important;
    box-sizing:border-box!important;
  }

  .login label{
    margin:0 0 7px!important;
    font-size:.76rem!important;
  }

  .login input{
    justify-self:stretch!important;
    width:auto!important;
    max-width:none!important;
    min-width:0!important;
    height:44px!important;
    min-height:44px!important;
    margin:0!important;
    padding:0 12px!important;
    box-sizing:border-box!important;
    font-size:16px!important;
  }

  .login .button{
    justify-self:start!important;
    width:auto!important;
    max-width:100%!important;
    min-width:0!important;
    margin-top:14px!important;
  }
}

</style></head><body><header class="header"><a href="/" aria-label="Nova Igreja Batista"><img src="/img/logo/logo3-azul.svg" alt="Nib"></a><a href="/mulheres-virtuosas.html">Voltar ao evento</a></header><main class="admin">
<?php if($error):?><p class="message error" role="alert"><?=esc($error)?></p><?php endif;?>
<?php if(!$storageError && !$authenticated):?>
<section class="login"><span class="eyebrow">Área da organização</span><h1>Mulheres Virtuosas</h1><p>Entre para consultar inscrições e comprovantes.</p>
<form method="post"><input type="hidden" name="action" value="login"><input type="hidden" name="csrf" value="<?=esc($_SESSION['admin_csrf'])?>"><label for="password">Senha de acesso</label><input id="password" name="password" type="password" autocomplete="current-password" required><button class="button primary" type="submit">Entrar no painel</button></form></section>
<?php elseif(!$storageError):?>
<div class="admin-head"><div><span class="eyebrow">Gestão de inscrições</span><h1>Mulheres Virtuosas · 2026</h1></div><form method="post"><input type="hidden" name="csrf" value="<?=esc($_SESSION['admin_csrf'])?>"><input type="hidden" name="action" value="logout"><button class="button secondary">Sair</button></form></div>
<?php if($notice):?><p role="status"><?=esc($notice)?></p><?php endif;?>
<?php if($deletion):?>
<section class="delete-confirm" aria-labelledby="delete-title">
<h2 id="delete-title">Excluir inscrição?</h2>
<p>Você vai excluir a inscrição de <strong><?=esc(display_name($deletion['name']))?></strong> e o comprovante enviado.</p>
<p class="small-note">Protocolo: <?=esc($deletion['protocol'])?>. Esta ação é definitiva.</p>
<form method="post"><input type="hidden" name="csrf" value="<?=esc($_SESSION['admin_csrf'])?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?=esc($deletion['_id'])?>"><input type="hidden" name="confirm_delete" value="yes"><div class="delete-actions"><a class="button secondary" href="inscricoes-mulheres.php">Cancelar</a><button class="button delete-button" type="submit">Excluir inscrição e comprovante</button></div></form>
</section>
<?php endif;?>
<section class="stats" aria-label="Resumo financeiro e das inscrições"><div class="stat"><strong><?=$total?></strong><span>Inscritos</span></div><div class="stat"><strong><?=$reviewed?></strong><span>Comprovantes conferidos</span></div><div class="stat"><strong><?=$total-$reviewed?></strong><span>A conferir</span></div><div class="stat cash"><strong><?=esc(money($received))?></strong><span>Total recebido</span></div></section>
<form method="get" class="search" id="registration-search" data-applied-query="<?=esc($query)?>"><input name="q" value="<?=esc($query)?>" placeholder="Nome, WhatsApp ou protocolo" aria-label="Buscar inscrição"><button class="button secondary">Buscar</button><a class="button secondary" href="inscricoes-mulheres.php">Ver todas</a><a class="button primary" href="?export=1&amp;q=<?=esc(rawurlencode($query))?>">Exportar lista</a></form>
<p class="note">O total recebido soma apenas inscrições cujo comprovante foi marcado como conferido. O painel não consulta a conta bancária automaticamente.</p>
<?php if(!$records):?><p class="empty">Nenhuma inscrição encontrada.</p><?php else:?>
<div class="table-wrap"><table><thead><tr><th>Participante</th><th>WhatsApp</th><th>Data da inscrição</th><th>Comprovante</th><th>Conferência</th><th>Ações</th></tr></thead><tbody>
<?php foreach($records as $r):$date=new DateTimeImmutable($r['created_at']);$date=$date->setTimezone(new DateTimeZone('America/Porto_Velho'));?>
<tr><td><?=esc(display_name($r['name']))?><small><?=esc($r['protocol'])?></small><?php if($r['payer_name']):?><small>Pix em nome de <?=esc(display_name($r['payer_name']))?></small><?php endif;?></td><td><?=esc(display_phone($r['whatsapp']))?></td><td><?=esc($date->format('d/m/Y H:i'))?></td><td><a class="receipt-link" href="?receipt=<?=esc($r['_id'])?>" target="_blank" rel="noopener">Abrir comprovante</a></td><td><div class="conference-status"><span class="state <?=!empty($r['reviewed'])?'reviewed':'pending'?>"><?=!empty($r['reviewed'])?'Conferido':'A conferir'?></span><form method="post" class="review-toggle-form"><input type="hidden" name="csrf" value="<?=esc($_SESSION['admin_csrf'])?>"><input type="hidden" name="action" value="review"><input type="hidden" name="id" value="<?=esc($r['_id'])?>"><button class="review-toggle <?=!empty($r['reviewed'])?'is-on':'is-off'?>" type="submit" aria-label="<?=!empty($r['reviewed'])?'Marcar como a conferir':'Marcar como conferido'?>" title="<?=!empty($r['reviewed'])?'Marcar como a conferir':'Marcar como conferido'?>"><span class="review-toggle-track" aria-hidden="true"><span class="review-toggle-knob"></span></span></button></form></div></td><td><a class="delete-link" href="?delete=<?=esc($r['_id'])?>" aria-label="Excluir inscrição de <?=esc(display_name($r['name']))?>">Excluir inscrição</a></td></tr>
<?php endforeach;?></tbody></table></div><?php endif;?>
<details class="password"><summary>Alterar senha de acesso</summary><form method="post"><input type="hidden" name="csrf" value="<?=esc($_SESSION['admin_csrf'])?>"><input type="hidden" name="action" value="password"><label>Senha atual<input type="password" name="old_password" autocomplete="current-password" required></label><label>Nova senha · mínimo de 12 caracteres<input type="password" name="new_password" minlength="12" maxlength="72" autocomplete="new-password" required></label><label>Repita a nova senha<input type="password" name="repeat_password" minlength="12" maxlength="72" autocomplete="new-password" required></label><button class="button primary">Salvar nova senha</button></form></details>
<?php endif;?></main><script src="assets/painel-mulheres-v193.js" defer></script></body></html>
