<?php
// Conexão do app com o canal da igreja no YouTube: /app/api/youtube.php?acao=...
// Só a administração conecta ou desconecta. A Liderança Pastoral vê se está conectado para enviar as pílulas.
// Retorno do Google (cadastrado no projeto): /app/api/youtube.php?retorno=1&code=...&state=...
declare(strict_types=1);
define('NIB_APP_RUNTIME', true);
ini_set('display_errors', '0');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');
header('Referrer-Policy: same-origin');
require __DIR__ . '/conta-lib.php';
require __DIR__ . '/youtube-lib.php';

function nib_yt_voltar(string $resultado): never {
  header('Cache-Control: no-store');
  header('Location: /app/?youtube=' . rawurlencode($resultado) . '#equipe', true, 303);
  exit;
}

$acao = is_string($_GET['acao'] ?? null) ? $_GET['acao'] : '';
$post = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';

try {
  if ($post) nib_conferir_origem();
  nib_db();
  $eu = nib_pessoa_logada();
  $admin = $eu && nib_tem_papel($eu, ['admin']);

  // Volta do Google depois que a pessoa escolheu o canal e permitiu.
  if (!$post && isset($_GET['retorno'])) {
    if (!$admin) nib_yt_voltar('sem-permissao');
    $estado = json_decode((string)nib_ajuste('yt_estado'), true);
    nib_ajuste_salvar('yt_estado', null);
    $st = is_string($_GET['state'] ?? null) ? $_GET['state'] : '';
    if (!is_array($estado) || !hash_equals((string)($estado['s'] ?? ''), $st) || (int)($estado['p'] ?? 0) !== (int)$eu['id'] || (int)($estado['t'] ?? 0) < time() - 900) nib_yt_voltar('expirou');
    if (!empty($_GET['error'])) nib_yt_voltar('cancelado');
    $cli = nib_yt_cliente(); $code = is_string($_GET['code'] ?? null) ? $_GET['code'] : '';
    if (!$cli || $code === '') nib_yt_voltar('erro');
    [$st2, $d] = nib_yt_form(nib_yt_url('token'), ['client_id' => $cli['id'], 'client_secret' => $cli['segredo'], 'code' => $code, 'redirect_uri' => nib_yt_retorno(), 'grant_type' => 'authorization_code']);
    if ($st2 !== 200 || empty($d['refresh_token'])) { error_log('youtube retorno: ' . $st2 . ' ' . ($d['error'] ?? '')); nib_yt_voltar('erro'); }
    nib_ajuste_salvar('yt_renovar', (string)$d['refresh_token']);
    nib_ajuste_salvar('yt_acesso', json_encode(['token' => (string)$d['access_token'], 'ate' => time() + (int)($d['expires_in'] ?? 3600)]));
    $canal = '';
    try { $c = nib_yt_get('/youtube/v3/channels', ['part' => 'snippet', 'mine' => 'true']); $canal = (string)($c['items'][0]['snippet']['title'] ?? ''); $cid = (string)($c['items'][0]['id'] ?? ''); nib_ajuste_salvar('yt_canal_id', $cid); }
    catch (Throwable $e) { error_log('youtube canal: ' . $e->getMessage()); }
    nib_ajuste_salvar('yt_canal', $canal);
    nib_registrar((int)$eu['id'], 'youtube-conectado', null, $canal);
    nib_yt_voltar('ok');
  }

  switch ($post ? "post:$acao" : "get:$acao") {
    case 'get:estado': {
      if (!$eu || !nib_tem_papel($eu, ['pastoral', 'admin'])) nib_erro('Só a Liderança Pastoral e a administração.', 403);
      nib_json(200, ['ok' => true, 'configurado' => nib_yt_cliente() !== null, 'conectado' => nib_yt_conectado(), 'canal' => (string)nib_ajuste('yt_canal'), 'pode_conectar' => $admin]);
    }

    // Abre a tela do Google (navegação comum, não fetch). Guarda um código de uso único para conferir na volta.
    case 'get:conectar': {
      if (!$admin) nib_yt_voltar('sem-permissao');
      $cli = nib_yt_cliente(); if (!$cli) nib_yt_voltar('sem-projeto');
      $s = bin2hex(random_bytes(24));
      nib_ajuste_salvar('yt_estado', json_encode(['s' => $s, 'p' => (int)$eu['id'], 't' => time()]));
      header('Cache-Control: no-store');
      header('Location: ' . nib_yt_url('auth') . '?' . http_build_query(['client_id' => $cli['id'], 'redirect_uri' => nib_yt_retorno(), 'response_type' => 'code',
        'scope' => NIB_YT_ESCOPO, 'access_type' => 'offline', 'prompt' => 'consent select_account', 'include_granted_scopes' => 'true', 'state' => $s]), true, 303);
      exit;
    }

    case 'post:desconectar': {
      if (!$admin) nib_erro('Só a administração desconecta o canal.', 403);
      $r = (string)nib_ajuste('yt_renovar');
      if ($r !== '') { try { nib_yt_form(nib_yt_url('revoke'), ['token' => $r]); } catch (Throwable $e) { error_log('youtube revoke: ' . $e->getMessage()); } }
      foreach (['yt_renovar', 'yt_acesso', 'yt_canal', 'yt_canal_id'] as $k) nib_ajuste_salvar($k, null);
      nib_registrar((int)$eu['id'], 'youtube-desconectado');
      nib_json(200, ['ok' => true]);
    }

    default:
      nib_erro('Ação desconhecida.', 404);
  }
} catch (Throwable $e) {
  error_log('youtube.php: ' . $e->getMessage());
  nib_erro('Serviço indisponível no momento. Tente de novo em instantes.', 503);
}
