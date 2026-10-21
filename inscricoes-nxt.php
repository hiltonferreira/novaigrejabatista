<?php
declare(strict_types=1);
ini_set('display_errors','0');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');
header("Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'none'");

$https=!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off';
session_name('nib_nxt_admin');
session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$https,'httponly'=>true,'samesite'=>'Lax']);
session_start();

function esc($s):string{return htmlspecialchars((string)$s,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
function lower_name(string $s):string{return function_exists('mb_strtolower')?mb_strtolower($s,'UTF-8'):strtolower($s);}
function display_name(string $s):string{
    $s=trim($s);
    return function_exists('mb_convert_case')?mb_convert_case(lower_name($s),MB_CASE_TITLE,'UTF-8'):ucwords(strtolower($s));
}
function atomic_json(string $path,array $data):void{
    $tmp=$path.'.tmp';
    $json=json_encode($data,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT|JSON_THROW_ON_ERROR);
    if(file_put_contents($tmp,$json,LOCK_EX)===false||!rename($tmp,$path))throw new RuntimeException('save failed');
}
function display_phone(string $phone):string{
    $phone=preg_replace('/\D/','',$phone)??'';
    if(strlen($phone)>11&&substr($phone,0,2)==='55')$phone=substr($phone,2);
    if(strlen($phone)<10)return $phone?:'—';
    $split=strlen($phone)===11?5:4;
    return '('.substr($phone,0,2).') '.substr($phone,2,$split).'-'.substr($phone,2+$split);
}
function money(float $v):string{return 'R$ '.number_format($v,2,',','.');}
function redirect_panel():never{header('Location: /inscricoes-nxt.php',true,303);exit;}

$error='';$storageError=false;$records=[];$notice='';$deletion=null;
$total=0;$reviewed=0;$pending=0;$received=0.0;

try{
    umask(0077);
    $web=realpath($_SERVER['DOCUMENT_ROOT']??'');
    if(!$web||$web==='/')throw new RuntimeException('invalid root');
    $base=dirname($web).'/nib-inscricoes-privado';
    if(!is_dir($base)&&!mkdir($base,0700,true)&&!is_dir($base))throw new RuntimeException('storage unavailable');
    $base=realpath($base);
    if(!$base||strpos($base.'/',$web.'/')===0)throw new RuntimeException('unsafe storage');

    $folder=$base.'/nxt-camp-2026-11-21';
    if(!is_dir($folder)&&!mkdir($folder,0700)&&!is_dir($folder))throw new RuntimeException('folder unavailable');

    $configfile=$base.'/administracao-nxt.json';
    $setupLock=fopen($base.'/.admin-nxt-lock','c');
    if(!$setupLock||!flock($setupLock,LOCK_EX))throw new RuntimeException('lock unavailable');
    if(!is_file($configfile)){
        $initial=bin2hex(random_bytes(12));
        $text="ACESSO AO PAINEL NXT CAMP\n\nEndereço: /inscricoes-nxt.php\nSenha inicial: ".$initial."\n\nEntre no painel e altere a senha. Após alterar, este arquivo será removido.\nNão compartilhe esta senha com participantes.\n";
        if(file_put_contents($base.'/ACESSO-PAINEL-NXT.txt',$text,LOCK_EX)===false)throw new RuntimeException('credentials unavailable');
        atomic_json($configfile,['password_hash'=>password_hash($initial,PASSWORD_DEFAULT)]);
    }
    $config=json_decode((string)file_get_contents($configfile),true);
    flock($setupLock,LOCK_UN);fclose($setupLock);
    if(!$config||empty($config['password_hash']))throw new RuntimeException('invalid config');

    if(empty($_SESSION['csrf']))$_SESSION['csrf']=bin2hex(random_bytes(32));
    if(!empty($_SESSION['admin_at'])&&time()-(int)$_SESSION['admin_at']>7200)unset($_SESSION['admin_at']);
    $authenticated=!empty($_SESSION['admin_at']);

    if($_SERVER['REQUEST_METHOD']==='POST'){
        $csrf=$_POST['csrf']??'';
        if(!is_string($csrf)||!hash_equals($_SESSION['csrf'],$csrf))throw new RuntimeException('session expired');
        $action=$_POST['action']??'';

        if($action==='login'){
            $password=$_POST['password']??'';
            if(is_string($password)&&password_verify($password,$config['password_hash'])){
                session_regenerate_id(true);
                $_SESSION['admin_at']=time();
                redirect_panel();
            }
            $error='Senha incorreta.';
        }elseif($authenticated&&$action==='logout'){
            unset($_SESSION['admin_at']);session_regenerate_id(true);redirect_panel();
        }elseif($authenticated&&$action==='password'){
            $old=$_POST['old_password']??'';$new=$_POST['new_password']??'';$repeat=$_POST['repeat_password']??'';
            if(!is_string($old)||!password_verify($old,$config['password_hash']))$error='A senha atual está incorreta.';
            elseif(!is_string($new)||strlen($new)<12||strlen($new)>72||$new!==$repeat)$error='Use de 12 a 72 caracteres e repita a nova senha corretamente.';
            else{
                atomic_json($configfile,['password_hash'=>password_hash($new,PASSWORD_DEFAULT)]);
                @unlink($base.'/ACESSO-PAINEL-NXT.txt');
                session_regenerate_id(true);$_SESSION['csrf']=bin2hex(random_bytes(32));
                $_SESSION['notice']='Senha alterada.';redirect_panel();
            }
        }elseif($authenticated&&$action==='review'){
            $id=$_POST['id']??'';
            if(!is_string($id)||!preg_match('/^[a-f0-9]{32}$/D',$id))throw new RuntimeException('invalid id');
            $path=$folder.'/'.$id.'.json';
            if(!is_file($path))throw new RuntimeException('missing');
            $row=json_decode((string)file_get_contents($path),true);
            if(!$row)throw new RuntimeException('invalid record');
            $row['reviewed']=empty($row['reviewed']);
            $row['reviewed_at']=$row['reviewed']?gmdate('c'):null;
            atomic_json($path,$row);
            redirect_panel();
        }elseif($authenticated&&$action==='delete'){
            $id=$_POST['id']??'';
            if(!is_string($id)||!preg_match('/^[a-f0-9]{32}$/D',$id)||($_POST['confirm_delete']??'')!=='yes')throw new RuntimeException('invalid deletion');
            $path=$folder.'/'.$id.'.json';
            if(is_file($path)){
                $row=json_decode((string)file_get_contents($path),true);
                if($row){
                    $receipt=$row['receipt']??'';
                    if(is_string($receipt)&&preg_match('/^'.preg_quote($id,'/').'\.(jpg|png|webp|pdf)$/D',$receipt))@unlink($folder.'/'.$receipt);
                }
                @unlink($path);
            }
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
                $deletion=is_file($path)?json_decode((string)file_get_contents($path),true):null;
                if($deletion)$deletion['_id']=$id;
            }
            if(!$deletion)$error='Esta inscrição não foi encontrada.';
        }

        if(isset($_GET['receipt'])){
            $id=$_GET['receipt'];
            if(!is_string($id)||!preg_match('/^[a-f0-9]{32}$/D',$id)){http_response_code(404);exit;}
            $path=$folder.'/'.$id.'.json';
            $row=is_file($path)?json_decode((string)file_get_contents($path),true):null;
            $receiptName=is_array($row)?($row['receipt']??''):'';
            if(!is_string($receiptName)||!preg_match('/^[a-f0-9]{32}\.(jpg|png|webp|pdf)$/D',$receiptName)){http_response_code(404);exit;}
            $receipt=$folder.'/'.$receiptName;
            $mime=(string)($row['receipt_mime']??'');
            if(!is_file($receipt)||!in_array($mime,['image/jpeg','image/png','image/webp','application/pdf'],true)){http_response_code(404);exit;}
            header('Content-Type: '.$mime);
            header('Content-Disposition: '.($mime==='application/pdf'?'attachment':'inline').'; filename="comprovante-'.preg_replace('/[^A-Z0-9-]/','',(string)$row['protocol']).'.'.pathinfo($receipt,PATHINFO_EXTENSION).'"');
            header("Content-Security-Policy: default-src 'none'; sandbox");
            readfile($receipt);exit;
        }

        foreach(glob($folder.'/*.json')?:[] as $path){
            $row=json_decode((string)file_get_contents($path),true);
            if(!$row||empty($row['protocol']))continue;
            $row['_id']=basename($path,'.json');
            $records[]=$row;
        }
        usort($records,static fn($a,$b)=>strcmp((string)$b['created_at'],(string)$a['created_at']));

        $total=count($records);
        $reviewed=count(array_filter($records,static fn($r)=>!empty($r['reviewed'])));
        $pending=$total-$reviewed;
        $received=array_reduce($records,static fn($sum,$r)=>$sum+(!empty($r['reviewed'])?(float)($r['amount']??80):0.0),0.0);

        $query=is_string($_GET['q']??null)?trim($_GET['q']):'';
        if($query!==''){
            $q=lower_name($query);
            $digits=preg_replace('/\D/','',$query)??'';
            $records=array_values(array_filter($records,static function($r)use($q,$digits){
                $hay=lower_name(
                    ($r['name']??'').' '.
                    ($r['guardian']??'').' '.
                    ($r['protocol']??'').' '.
                    ($r['payer_name']??'')
                );
                return strpos($hay,$q)!==false
                    ||(strlen($digits)>=6&&(strpos((string)($r['guardian_phone']??''),$digits)!==false||strpos((string)($r['phone']??''),$digits)!==false));
            }));
        }

        if(isset($_GET['export'])){
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename="inscricoes-nxt-camp-2026.csv"');
            $fp=fopen('php://output','w');
            fwrite($fp,"\xEF\xBB\xBF");
            fputcsv($fp,['Protocolo','Adolescente','Nascimento','Idade','WhatsApp adolescente','Responsável','Parentesco','WhatsApp responsável','Informações de saúde','Pagador Pix','Valor','Data da inscrição','Comprovante conferido'],';');
            foreach($records as $r){
                $cells=[
                    $r['protocol']??'',$r['name']??'',$r['birth']??'',$r['age']??'',$r['phone']??'',
                    $r['guardian']??'',$r['relationship']??'',$r['guardian_phone']??'',$r['health']??'',
                    $r['payer_name']??'',number_format((float)($r['amount']??80),2,',','.'),$r['created_at']??'',
                    !empty($r['reviewed'])?'Sim':'Não'
                ];
                $cells=array_map(static fn($s)=>preg_match('/^[\s]*[=+@-]/u',(string)$s)?"'".$s:(string)$s,$cells);
                fputcsv($fp,$cells,';');
            }
            fclose($fp);exit;
        }
    }
}catch(Throwable $e){
    error_log('NIB NXT admin: '.$e->getMessage());
    $storageError=true;
    $error='Não foi possível abrir o painel agora. Confira a configuração do servidor e tente novamente.';
}
?>
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Gestão de inscrições · NXT CAMP</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
<style>
:root{--navy:#041e42;--blue:#2187d5;--orange:#ff6d3a;--bg:#eeeee3;--surface:#fff;--line:#c9cbc3;--muted:#64738a;--green:#2f6b52;--red:#9e3f38}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--navy);font-family:Manrope,Arial,sans-serif}.header{max-width:1360px;margin:auto;padding:24px 34px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between}.header img{width:112px;height:auto}.header a{color:var(--navy);text-decoration:none;border-bottom:1px solid var(--line);padding-bottom:7px;font-size:.85rem}.admin{max-width:1360px;margin:0 auto;padding:36px 34px 70px}.eyebrow{font-size:.72rem;letter-spacing:.17em;text-transform:uppercase;color:var(--orange);font-weight:700}.admin-head{display:flex;justify-content:space-between;gap:24px;align-items:center;margin-bottom:28px}.admin h1{font-family:Montserrat,Arial,sans-serif;font-size:2.2rem;margin:7px 0 0}.button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 17px;border-radius:999px;border:1px solid var(--navy);font:600 .84rem Manrope;cursor:pointer;text-decoration:none}.primary{background:var(--navy);color:#fff}.secondary{background:transparent;color:var(--navy)}input{width:100%;min-height:46px;border:1px solid #9faebe;border-radius:9px;padding:10px 13px;background:#fff;font:400 .9rem Manrope;color:var(--navy)}label{display:block;font-size:.84rem;margin:15px 0 6px}.login{max-width:460px;margin:55px auto}.login p{color:var(--muted);line-height:1.6}.message{padding:14px 16px;border:1px solid #d7a6a1;border-radius:9px;background:#fff1ef;color:#7f302a}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:20px 0;margin:22px 0 28px}.stat{padding:6px 3px}.stat strong{display:block;font-family:Montserrat;font-size:1.8rem;line-height:1.05}.stat span{font-size:.78rem;color:var(--muted)}.stat.cash strong{color:var(--green)}.search{display:flex;gap:10px;flex-wrap:wrap}.search input{flex:1;min-width:270px}.note{color:var(--muted);font-size:.78rem;line-height:1.55}.table-wrap{overflow:auto;margin-top:26px;border-top:1px solid var(--line)}table{border-collapse:collapse;width:100%;min-width:1180px;font-size:.84rem}th,td{text-align:left;padding:16px 12px;border-bottom:1px solid var(--line);vertical-align:top}th{color:var(--muted);font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em}td strong{font-weight:650}td small{display:block;color:var(--muted);font-size:.74rem;line-height:1.5;margin-top:4px}.receipt-link{color:var(--navy);text-underline-offset:4px}.review{display:flex;flex-direction:column;align-items:flex-start;gap:7px}.state{font-size:.74rem;font-weight:700;color:#a14a16}.state.ok{color:var(--green)}.review .button{min-height:34px;padding:7px 11px;border-radius:8px;font-size:.76rem}.review .done{background:transparent;color:var(--muted);border:0;padding-left:0;text-decoration:underline;text-underline-offset:3px}.danger{color:var(--red);text-underline-offset:4px}.detail{margin-top:7px}.detail summary{cursor:pointer;color:var(--navy);font-size:.75rem;text-decoration:underline;text-underline-offset:3px}.detail p{margin:7px 0 0;color:var(--muted);font-size:.75rem;max-width:44ch}.delete-confirm{border:1px solid var(--line);background:#fff;padding:22px;border-radius:12px;margin:22px 0}.delete-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.password{margin-top:34px;padding-top:22px;border-top:1px solid var(--line)}.password summary{cursor:pointer}.password form{max-width:470px}.empty{padding:30px 0;color:var(--muted)}
@media(max-width:760px){.header,.admin{padding-left:18px;padding-right:18px}.stats{grid-template-columns:1fr 1fr}.admin-head{align-items:flex-start}.search .button{flex:1}.search input{flex-basis:100%}}
</style>
</head>
<body>
<header class="header"><a href="/" aria-label="Nova Igreja Batista"><img src="/img/logo/logo3-azul.svg" alt="Nib"></a><a href="/next/camp-sbgp1-nov26/inscricao.html">Voltar ao evento</a></header>
<main class="admin">
<?php if($error):?><p class="message" role="alert"><?=esc($error)?></p><?php endif;?>

<?php if(!$storageError&&!$authenticated):?>
<section class="login">
<span class="eyebrow">Área da organização</span>
<h1>NXT CAMP</h1>
<p>Entre para consultar inscrições, responsáveis e comprovantes.</p>
<form method="post">
<input type="hidden" name="csrf" value="<?=esc($_SESSION['csrf'])?>">
<input type="hidden" name="action" value="login">
<label for="password">Senha de acesso</label>
<input id="password" name="password" type="password" autocomplete="current-password" required>
<button class="button primary" type="submit" style="margin-top:18px">Entrar no painel</button>
</form>
</section>

<?php elseif(!$storageError):?>
<div class="admin-head">
<div><span class="eyebrow">Gestão de inscrições</span><h1>NXT CAMP · 2026</h1></div>
<form method="post"><input type="hidden" name="csrf" value="<?=esc($_SESSION['csrf'])?>"><input type="hidden" name="action" value="logout"><button class="button secondary">Sair</button></form>
</div>

<?php if($notice):?><p role="status"><?=esc($notice)?></p><?php endif;?>

<?php if($deletion):?>
<section class="delete-confirm">
<h2>Excluir inscrição?</h2>
<p>Você vai excluir a inscrição de <strong><?=esc(display_name((string)$deletion['name']))?></strong> e o comprovante enviado.</p>
<p class="note">Protocolo: <?=esc((string)$deletion['protocol'])?>. Esta ação é definitiva.</p>
<form method="post"><input type="hidden" name="csrf" value="<?=esc($_SESSION['csrf'])?>"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?=esc((string)$deletion['_id'])?>"><input type="hidden" name="confirm_delete" value="yes"><div class="delete-actions"><a class="button secondary" href="/inscricoes-nxt.php">Cancelar</a><button class="button primary" type="submit">Excluir inscrição</button></div></form>
</section>
<?php endif;?>

<section class="stats" aria-label="Resumo financeiro e das inscrições">
<div class="stat"><strong><?=$total?></strong><span>Inscritos</span></div>
<div class="stat"><strong><?=$reviewed?></strong><span>Comprovantes conferidos</span></div>
<div class="stat"><strong><?=$pending?></strong><span>A conferir</span></div>
<div class="stat cash"><strong><?=esc(money($received))?></strong><span>Total recebido</span></div>
</section>

<form method="get" class="search">
<input name="q" value="<?=esc($query??'')?>" placeholder="Adolescente, responsável, WhatsApp ou protocolo" aria-label="Buscar inscrição">
<button class="button secondary">Buscar</button>
<a class="button secondary" href="/inscricoes-nxt.php">Ver todas</a>
<a class="button primary" href="?export=1&amp;q=<?=esc(rawurlencode($query??''))?>">Exportar lista</a>
</form>
<p class="note">O total recebido soma apenas inscrições cujo comprovante foi marcado como conferido. O painel não consulta a conta bancária automaticamente.</p>

<?php if(!$records):?><p class="empty">Nenhuma inscrição encontrada.</p>
<?php else:?>
<div class="table-wrap">
<table>
<thead><tr><th>Adolescente</th><th>Responsável</th><th>Contato</th><th>Pagamento</th><th>Inscrição</th><th>Conferência</th><th>Ações</th></tr></thead>
<tbody>
<?php foreach($records as $r):
$date=new DateTimeImmutable((string)$r['created_at']);
$date=$date->setTimezone(new DateTimeZone('America/Porto_Velho'));
?>
<tr>
<td><strong><?=esc(display_name((string)$r['name']))?></strong><small><?=esc((string)$r['age'])?> anos · nasc. <?=esc((new DateTimeImmutable((string)$r['birth']))->format('d/m/Y'))?></small><small><?=esc((string)$r['protocol'])?></small>
<?php if(!empty($r['health'])):?><details class="detail"><summary>Cuidados informados</summary><p><?=esc((string)$r['health'])?></p></details><?php endif;?>
</td>
<td><strong><?=esc(display_name((string)$r['guardian']))?></strong><small><?=esc((string)$r['relationship'])?></small></td>
<td><strong><?=esc(display_phone((string)$r['guardian_phone']))?></strong><?php if(!empty($r['phone'])):?><small>Adolescente: <?=esc(display_phone((string)$r['phone']))?></small><?php endif;?></td>
<td><a class="receipt-link" href="?receipt=<?=esc((string)$r['_id'])?>" target="_blank" rel="noopener">Abrir comprovante</a><small><?=esc(money((float)($r['amount']??80)))?></small><?php if(!empty($r['payer_name'])):?><small>Pix: <?=esc(display_name((string)$r['payer_name']))?></small><?php endif;?></td>
<td><?=esc($date->format('d/m/Y H:i'))?></td>
<td><div class="review"><span class="state <?=!empty($r['reviewed'])?'ok':''?>"><?=!empty($r['reviewed'])?'Conferido':'A conferir'?></span><form method="post"><input type="hidden" name="csrf" value="<?=esc($_SESSION['csrf'])?>"><input type="hidden" name="action" value="review"><input type="hidden" name="id" value="<?=esc((string)$r['_id'])?>"><button class="button <?=!empty($r['reviewed'])?'done':'primary'?>" type="submit"><?=!empty($r['reviewed'])?'Desmarcar':'Marcar como conferido'?></button></form></div></td>
<td><a class="danger" href="?delete=<?=esc((string)$r['_id'])?>">Excluir</a></td>
</tr>
<?php endforeach;?>
</tbody></table></div>
<?php endif;?>

<details class="password"><summary>Alterar senha de acesso</summary>
<form method="post">
<input type="hidden" name="csrf" value="<?=esc($_SESSION['csrf'])?>">
<input type="hidden" name="action" value="password">
<label>Senha atual</label><input type="password" name="old_password" autocomplete="current-password" required>
<label>Nova senha · mínimo de 12 caracteres</label><input type="password" name="new_password" minlength="12" maxlength="72" autocomplete="new-password" required>
<label>Repita a nova senha</label><input type="password" name="repeat_password" minlength="12" maxlength="72" autocomplete="new-password" required>
<button class="button primary" style="margin-top:16px">Salvar nova senha</button>
</form>
</details>
<?php endif;?>
</main>
</body>
</html>
