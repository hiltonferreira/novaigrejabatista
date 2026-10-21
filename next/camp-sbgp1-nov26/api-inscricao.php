<?php
declare(strict_types=1);

ini_set('display_errors','0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

function respond(int $status,array $body):never{
    http_response_code($status);
    echo json_encode($body,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
    exit;
}
function clean_text($value,int $max=120):string{
    if(!is_string($value))return '';
    $value=trim(preg_replace('/\s+/u',' ',$value)??'');
    if(function_exists('mb_substr'))return mb_substr($value,0,$max,'UTF-8');
    return substr($value,0,$max);
}
function digits($value,int $max=15):string{
    $value=is_string($value)?preg_replace('/\D+/','',$value):'';
    return substr((string)$value,0,$max);
}
function atomic_json(string $path,array $data):void{
    $tmp=$path.'.tmp';
    $json=json_encode($data,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT|JSON_THROW_ON_ERROR);
    if(file_put_contents($tmp,$json,LOCK_EX)===false || !rename($tmp,$path))throw new RuntimeException('save failed');
}

if($_SERVER['REQUEST_METHOD']!=='POST')respond(405,['ok'=>false,'message'=>'Método não permitido.']);

try{
    $contentLength=(int)($_SERVER['CONTENT_LENGTH']??0);
    if($contentLength>8*1024*1024)respond(413,['ok'=>false,'message'=>'O envio ultrapassou o limite permitido.']);

    // Honeypot anti-bot.
    if(clean_text($_POST['website']??'',80)!=='')respond(400,['ok'=>false,'message'=>'Não foi possível concluir a inscrição.']);

    $name=clean_text($_POST['name']??'',120);
    $birth=clean_text($_POST['birth']??'',10);
    $age=(int)($_POST['age']??0);
    $phone=digits($_POST['phone']??'',13);
    $guardian=clean_text($_POST['guardian']??'',120);
    $guardianPhone=digits($_POST['guardian_phone']??'',13);
    $relationship=clean_text($_POST['relationship']??'',40);
    $health=clean_text($_POST['health']??'',600);
    $payer=clean_text($_POST['payer']??'',120);

    if($name===''||$guardian===''||$guardianPhone===''||$relationship===''||$birth===''){
        respond(422,['ok'=>false,'message'=>'Revise os dados obrigatórios antes de concluir.']);
    }
    if(!preg_match('/^\d{4}-\d{2}-\d{2}$/D',$birth))respond(422,['ok'=>false,'message'=>'Data de nascimento inválida.']);
    if($age<12||$age>17)respond(422,['ok'=>false,'message'=>'A inscrição é destinada a adolescentes de 12 a 17 anos.']);
    if(strlen($guardianPhone)<10)respond(422,['ok'=>false,'message'=>'Informe um WhatsApp válido do responsável.']);

    if(!isset($_FILES['receipt']) || !is_array($_FILES['receipt']))respond(422,['ok'=>false,'message'=>'Envie o comprovante do Pix.']);
    $file=$_FILES['receipt'];
    if(($file['error']??UPLOAD_ERR_NO_FILE)!==UPLOAD_ERR_OK)respond(422,['ok'=>false,'message'=>'Não foi possível receber o comprovante. Tente novamente.']);
    if((int)($file['size']??0)<=0 || (int)$file['size']>6*1024*1024)respond(422,['ok'=>false,'message'=>'O comprovante deve ter no máximo 6 MB.']);

    $tmp=(string)($file['tmp_name']??'');
    if($tmp===''||!is_uploaded_file($tmp))respond(422,['ok'=>false,'message'=>'Arquivo de comprovante inválido.']);

    $finfo=new finfo(FILEINFO_MIME_TYPE);
    $mime=(string)$finfo->file($tmp);
    $allowed=[
        'image/jpeg'=>'jpg',
        'image/png'=>'png',
        'image/webp'=>'webp',
        'application/pdf'=>'pdf'
    ];
    if(!isset($allowed[$mime]))respond(422,['ok'=>false,'message'=>'Use comprovante JPG, PNG, WebP ou PDF.']);

    umask(0077);
    $web=realpath($_SERVER['DOCUMENT_ROOT']??'');
    if(!$web||$web==='/')throw new RuntimeException('invalid root');

    $base=dirname($web).'/nib-inscricoes-privado';
    if(!is_dir($base)&&!mkdir($base,0700,true)&&!is_dir($base))throw new RuntimeException('storage unavailable');
    $base=realpath($base);
    if(!$base||strpos($base.'/',$web.'/')===0)throw new RuntimeException('unsafe storage');

    $folder=$base.'/nxt-camp-2026-11-21';
    if(!is_dir($folder)&&!mkdir($folder,0700)&&!is_dir($folder))throw new RuntimeException('folder unavailable');

    // Rate-limit simples por IP: até 12 tentativas em 15 minutos.
    $rateFile=$base.'/.nxt-rate-'.hash('sha256',$_SERVER['REMOTE_ADDR']??'unknown').'.json';
    $rate=fopen($rateFile,'c+');
    if(!$rate||!flock($rate,LOCK_EX))throw new RuntimeException('rate unavailable');
    $raw=stream_get_contents($rate);
    $state=$raw?json_decode($raw,true):null;
    if(!is_array($state)||time()-(int)($state['since']??0)>900)$state=['count'=>0,'since'=>time()];
    if((int)$state['count']>=12){
        flock($rate,LOCK_UN);fclose($rate);
        respond(429,['ok'=>false,'message'=>'Muitas tentativas. Aguarde alguns minutos e tente novamente.']);
    }
    $state['count']++;
    rewind($rate);ftruncate($rate,0);fwrite($rate,json_encode($state));flock($rate,LOCK_UN);fclose($rate);

    $id=bin2hex(random_bytes(16));
    $ext=$allowed[$mime];
    $receiptName=$id.'.'.$ext;
    $receiptPath=$folder.'/'.$receiptName;

    if(!move_uploaded_file($tmp,$receiptPath))throw new RuntimeException('upload save failed');
    @chmod($receiptPath,0600);

    $protocol='NXT-'.gmdate('ymd').'-'.strtoupper(substr(bin2hex(random_bytes(4)),0,8));
    $row=[
        'protocol'=>$protocol,
        'name'=>$name,
        'birth'=>$birth,
        'age'=>$age,
        'phone'=>$phone,
        'guardian'=>$guardian,
        'guardian_phone'=>$guardianPhone,
        'relationship'=>$relationship,
        'health'=>$health,
        'payer_name'=>$payer,
        'amount'=>80.00,
        'created_at'=>gmdate('c'),
        'receipt'=>$receiptName,
        'receipt_mime'=>$mime,
        'reviewed'=>false,
        'reviewed_at'=>null
    ];

    try{
        atomic_json($folder.'/'.$id.'.json',$row);
        @chmod($folder.'/'.$id.'.json',0600);
    }catch(Throwable $e){
        @unlink($receiptPath);
        throw $e;
    }

    respond(201,['ok'=>true,'protocol'=>$protocol]);
}catch(Throwable $e){
    error_log('NIB NXT registration: '.$e->getMessage());
    respond(500,['ok'=>false,'message'=>'Não foi possível concluir a inscrição agora. Tente novamente em instantes.']);
}
