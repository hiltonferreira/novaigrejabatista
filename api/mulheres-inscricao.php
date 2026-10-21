<?php
declare(strict_types=1);
// PHP 7.4+ / Fileinfo. All participant data lives outside the public document root.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
function respond(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function fail(int $status, string $message): void { respond($status, ['ok'=>false, 'message'=>$message]); }
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET','POST'], true)) {
    header('Allow: GET, POST'); fail(405, 'Método não permitido.');
}
$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_name('nib_eventos');
session_set_cookie_params(['lifetime'=>0, 'path'=>'/', 'secure'=>$secure, 'httponly'=>true, 'samesite'=>'Lax']);
if (!session_start()) fail(503, 'Não foi possível iniciar a inscrição. Tente novamente.');
try {
    if (!class_exists('finfo') || !ini_get('file_uploads')) throw new RuntimeException('File uploads and Fileinfo must be enabled');
    $webroot = realpath($_SERVER['DOCUMENT_ROOT'] ?? '');
    if (!$webroot || $webroot === '/') throw new RuntimeException('Invalid document root');
    $base = dirname($webroot) . '/nib-inscricoes-privado';
    umask(0077);
    if (!is_dir($base) && !mkdir($base, 0700, true) && !is_dir($base)) throw new RuntimeException('Storage unavailable');
    $realbase = realpath($base);
    if (!$realbase || strpos($realbase . '/', $webroot . '/') === 0) throw new RuntimeException('Storage must be outside webroot');
    $folder = $realbase . '/mulheres-2026-10-30';
    if (!is_dir($folder) && !mkdir($folder, 0700) && !is_dir($folder)) throw new RuntimeException('Event storage unavailable');
    if (!is_writable($folder)) throw new RuntimeException('Storage not writable');
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    if ($_SERVER['REQUEST_METHOD'] === 'GET') respond(200, ['ok'=>true, 'csrf'=>$_SESSION['csrf'], 'maxBytes'=>6291456]);
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 8 * 1024 * 1024) fail(413, 'O arquivo é muito grande. Envie até 6 MB.');
    if (!is_string($_POST['csrf'] ?? null) || !hash_equals($_SESSION['csrf'], $_POST['csrf'])) fail(403, 'Sua sessão foi renovada. Tente concluir novamente.');
    if (!empty($_POST['website'])) fail(422, 'Não foi possível enviar a inscrição.');
    $key = $_POST['request_id'] ?? '';
    if (!is_string($key) || !preg_match('/^[a-f0-9]{32}$/D', $key)) fail(422, 'Recarregue a página e tente novamente.');
    $name = $_POST['name'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $payer = $_POST['payer'] ?? '';
    if (!is_string($name) || !is_string($phone) || !is_string($payer)) fail(422, 'Confira seus dados.');
    $name = trim(preg_replace('/\s+/u', ' ', $name) ?? '');
    $phone = preg_replace('/\D/', '', $phone);
    $payer = trim($payer);
    if (strlen($name) < 3 || strlen($name) > 180 || preg_match('/[\x00-\x1F]/', $name)) fail(422, 'Informe seu nome completo.');
    if (!preg_match('/^(?:55)?[1-9][0-9]{9,10}$/D', $phone)) fail(422, 'Informe um WhatsApp válido com DDD.');
    if (strlen($payer) > 180 || preg_match('/[\x00-\x1F]/', $payer)) fail(422, 'Confira o nome de quem fez o pagamento.');
    if (($_POST['consent'] ?? '') !== 'yes') fail(422, 'Autorize o uso dos dados para a inscrição.');
    $fingerprint = hash('sha256', $name . '|' . $phone . '|' . $payer);
    $lock = fopen($folder . '/.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('Could not lock storage');
    $recordfile = $folder . '/' . $key . '.json';
    if (is_file($recordfile)) {
        $existing = json_decode(file_get_contents($recordfile), true);
        if (!$existing || !hash_equals($existing['fingerprint'], $fingerprint)) fail(409, 'Os dados mudaram após o envio. Recarregue para iniciar outra inscrição.');
        respond(200, ['ok'=>true, 'protocol'=>$existing['protocol']]);
    }
    if ((int)($_SESSION['submitted'] ?? 0) >= 10) fail(429, 'Limite de inscrições desta sessão atingido. Entre em contato com a organização.');
    $file = $_FILES['receipt'] ?? null;
    if (!$file || is_array($file['error'] ?? null) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        fail(422, 'Não recebemos o comprovante. Envie imagem ou PDF de até 6 MB.');
    }
    if ($file['size'] < 1 || $file['size'] > 6291456 || !is_uploaded_file($file['tmp_name'])) fail(422, 'Envie um comprovante de até 6 MB.');
    if (!class_exists('finfo')) throw new RuntimeException('Fileinfo extension required');
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $extensions = ['image/jpeg'=>'jpg', 'image/png'=>'png', 'image/webp'=>'webp', 'application/pdf'=>'pdf'];
    if (!isset($extensions[$mime])) fail(422, 'Formato não aceito. Envie JPG, PNG, WebP ou PDF.');
    if ($mime !== 'application/pdf' && !@getimagesize($file['tmp_name'])) fail(422, 'A imagem não pôde ser lida. Escolha outro arquivo.');
    if ($mime === 'application/pdf') {
        $stream = fopen($file['tmp_name'], 'rb'); $signature = fread($stream, 5); fclose($stream);
        if ($signature !== '%PDF-') fail(422, 'O PDF não pôde ser lido. Escolha outro arquivo.');
    }
    $protocol = 'MV26-' . strtoupper(bin2hex(random_bytes(6)));
    $receipt = $key . '.' . $extensions[$mime];
    $record = ['protocol'=>$protocol, 'event'=>'Mulheres Virtuosas', 'event_date'=>'2026-10-30',
        'created_at'=>gmdate('c'), 'name'=>$name, 'whatsapp'=>$phone, 'payer_name'=>$payer,
        'amount_cents'=>2000, 'receipt'=>$receipt, 'receipt_mime'=>$mime,
        'status'=>'inscricao_recebida', 'payment_verified'=>false, 'consent'=>true, 'fingerprint'=>$fingerprint];
    $json = json_encode($record, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
    if (!move_uploaded_file($file['tmp_name'], $folder . '/' . $receipt)) throw new RuntimeException('Could not store receipt');
    $temporary = $recordfile . '.tmp';
    if (file_put_contents($temporary, $json, LOCK_EX) === false || !rename($temporary, $recordfile)) {
        @unlink($folder . '/' . $receipt); @unlink($temporary); throw new RuntimeException('Could not store registration');
    }
    $_SESSION['submitted'] = (int)($_SESSION['submitted'] ?? 0) + 1;
    flock($lock, LOCK_UN); fclose($lock);
    respond(201, ['ok'=>true, 'protocol'=>$protocol]);
} catch (Throwable $error) {
    error_log('NIB event registration: ' . $error->getMessage());
    fail(503, 'Não foi possível salvar sua inscrição agora. Seus dados continuam nesta tela. Tente novamente em instantes.');
}
