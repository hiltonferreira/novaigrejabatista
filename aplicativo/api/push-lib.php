<?php
// Notificações no celular (Web Push, RFC 8030/8291/8292) sem bibliotecas externas: só OpenSSL e cURL do PHP.
// A chave VAPID é criada sozinha na primeira vez e fica no banco (nib_ajustes), nunca no Git.
declare(strict_types=1);
if (!defined('NIB_APP_RUNTIME')) { http_response_code(404); exit; }

function nib_b64u(string $b): string { return rtrim(strtr(base64_encode($b), '+/', '-_'), '='); }
function nib_b64u_dec(string $s): string { return (string)base64_decode(strtr($s, '-_', '+/') . str_repeat('=', (4 - strlen($s) % 4) % 4), true); }

function nib_ec_raw($key): string {
  $d = openssl_pkey_get_details($key)['ec'];
  return "\x04" . str_pad($d['x'], 32, "\0", STR_PAD_LEFT) . str_pad($d['y'], 32, "\0", STR_PAD_LEFT);
}
function nib_ec_pub_pem(string $raw) {
  $der = hex2bin('3059301306072a8648ce3d020106082a8648ce3d030107034200') . $raw;
  return openssl_pkey_get_public("-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($der), 64, "\n") . "-----END PUBLIC KEY-----\n");
}
function nib_ec_novo() { return openssl_pkey_new(['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC]); }

function nib_vapid(): array {
  static $v = null; if ($v) return $v;
  $db = nib_db();
  $q = $db->query("SELECT chave, valor FROM nib_ajustes WHERE chave IN ('vapid_privada', 'vapid_publica')")->fetchAll(PDO::FETCH_KEY_PAIR);
  if (empty($q['vapid_privada'])) {
    $k = nib_ec_novo(); openssl_pkey_export($k, $pem);
    $ins = $db->prepare('INSERT IGNORE INTO nib_ajustes (chave, valor) VALUES (?, ?)');
    $ins->execute(['vapid_privada', $pem]); $ins->execute(['vapid_publica', nib_b64u(nib_ec_raw($k))]);
    $q = $db->query("SELECT chave, valor FROM nib_ajustes WHERE chave IN ('vapid_privada', 'vapid_publica')")->fetchAll(PDO::FETCH_KEY_PAIR);
  }
  return $v = ['privada' => $q['vapid_privada'], 'publica' => $q['vapid_publica']];
}

// Assinatura ES256: o OpenSSL devolve DER; o JWT usa r||s com 32 bytes cada.
function nib_der_para_raw(string $der): string {
  $p = 2; if (ord($der[1]) & 0x80) $p += ord($der[1]) & 0x7f;
  $lr = ord($der[$p + 1]); $r = substr($der, $p + 2, $lr); $p += 2 + $lr;
  $ls = ord($der[$p + 1]); $s = substr($der, $p + 2, $ls);
  return str_pad(ltrim($r, "\0"), 32, "\0", STR_PAD_LEFT) . str_pad(ltrim($s, "\0"), 32, "\0", STR_PAD_LEFT);
}
function nib_vapid_cabecalho(string $endpoint): string {
  $v = nib_vapid(); $u = parse_url($endpoint);
  $c = nib_config();
  $dados = nib_b64u('{"typ":"JWT","alg":"ES256"}') . '.' . nib_b64u(json_encode(['aud' => $u['scheme'] . '://' . $u['host'] . (isset($u['port']) ? ':' . $u['port'] : ''), 'exp' => time() + 12 * 3600, 'sub' => 'mailto:' . ($c['mail_reply_to'] ?? $c['mail_from'] ?? 'contato@novaigrejabatista.com.br')]));
  openssl_sign($dados, $sig, openssl_pkey_get_private($v['privada']), OPENSSL_ALGO_SHA256);
  return 'vapid t=' . $dados . '.' . nib_b64u(nib_der_para_raw($sig)) . ', k=' . $v['publica'];
}

// Criptografia aes128gcm da mensagem (RFC 8291).
function nib_push_cifrar(string $texto, string $p256dh, string $auth): string {
  $ua = nib_b64u_dec($p256dh); $seg = nib_b64u_dec($auth);
  if (strlen($ua) !== 65 || strlen($seg) !== 16) throw new RuntimeException('inscrição inválida');
  $eph = nib_ec_novo(); $as = nib_ec_raw($eph);
  $ecdh = openssl_pkey_derive(nib_ec_pub_pem($ua), $eph, 32);
  if ($ecdh === false) throw new RuntimeException('ecdh falhou');
  $ikm = hash_hkdf('sha256', $ecdh, 32, "WebPush: info\0" . $ua . $as, $seg);
  $sal = random_bytes(16);
  $cek = hash_hkdf('sha256', $ikm, 16, "Content-Encoding: aes128gcm\0", $sal);
  $nonce = hash_hkdf('sha256', $ikm, 12, "Content-Encoding: nonce\0", $sal);
  $cif = openssl_encrypt($texto . "\x02", 'aes-128-gcm', $cek, OPENSSL_RAW_DATA, $nonce, $tag);
  return $sal . pack('N', 4096) . chr(65) . $as . $cif . $tag;
}

// Envia para as pessoas indicadas (ids) ou para todos (null), menos quem estiver em $exceto.
function nib_push_enviar(?array $pessoas, array $msg, array $exceto = []): int {
  $db = nib_db();
  $sql = 'SELECT id, endpoint, p256dh, auth FROM nib_push WHERE 1=1' . (($msg['tipo'] ?? '') === 'caderno' ? ' AND caderno = 1' : '');
  $args = [];
  if ($pessoas !== null) { if (!$pessoas) return 0; $sql .= ' AND pessoa_id IN (' . implode(',', array_fill(0, count($pessoas), '?')) . ')'; $args = array_values($pessoas); }
  if ($exceto) { $sql .= ' AND pessoa_id NOT IN (' . implode(',', array_fill(0, count($exceto), '?')) . ')'; $args = array_merge($args, array_values($exceto)); }
  $q = $db->prepare($sql . ' LIMIT 5000'); $q->execute($args);
  // Título sempre "Nib" (igual ao nome do app, para o iPhone não repetir "from Nib"); o assunto vai no começo do texto.
  $texto = trim(($msg['title'] ?? '') !== '' ? $msg['title'] . ': ' . ($msg['body'] ?? '') : ($msg['body'] ?? ''), ': ');
  $corpo = json_encode(['title' => 'Nib', 'body' => mb_substr($texto, 0, 200), 'url' => $msg['url'] ?? '/app/', 'tag' => $msg['tag'] ?? 'nib'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  $mh = curl_multi_init(); $handles = []; $enviados = 0;
  foreach ($q->fetchAll() as $s) {
    try { $dados = nib_push_cifrar($corpo, $s['p256dh'], $s['auth']); } catch (Throwable $e) { continue; }
    $h = curl_init($s['endpoint']);
    curl_setopt_array($h, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $dados, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 4,
      CURLOPT_HTTPHEADER => ['Content-Type: application/octet-stream', 'Content-Encoding: aes128gcm', 'TTL: 86400', 'Urgency: normal', 'Authorization: ' . nib_vapid_cabecalho($s['endpoint'])]]);
    curl_multi_add_handle($mh, $h); $handles[(int)$s['id']] = $h;
    if (count($handles) >= 50) { $enviados += nib_push_rodar($mh, $handles); $mh = curl_multi_init(); $handles = []; }
  }
  return $enviados + nib_push_rodar($mh, $handles);
}
function nib_push_rodar($mh, array $handles): int {
  if (!$handles) return 0;
  do { $st = curl_multi_exec($mh, $ativos); if ($ativos) curl_multi_select($mh, 1.0); } while ($ativos && $st === CURLM_OK);
  $ok = 0; $db = nib_db();
  foreach ($handles as $id => $h) {
    $code = (int)curl_getinfo($h, CURLINFO_RESPONSE_CODE);
    if ($code >= 200 && $code < 300) $ok++;
    elseif ($code === 404 || $code === 410) $db->prepare('DELETE FROM nib_push WHERE id = ?')->execute([$id]); // inscrição vencida
    curl_multi_remove_handle($mh, $h); curl_close($h);
  }
  curl_multi_close($mh);
  return $ok;
}
// Envia depois de responder ao app, para a pessoa não esperar.
function nib_push_depois(?array $pessoas, array $msg, array $exceto = []): void {
  register_shutdown_function(function () use ($pessoas, $msg, $exceto) {
    ignore_user_abort(true); @set_time_limit(300);
    if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
    elseif (function_exists('litespeed_finish_request')) litespeed_finish_request();
    try { nib_push_enviar($pessoas, $msg, $exceto); } catch (Throwable $e) { error_log('push: ' . $e->getMessage()); }
  });
}
