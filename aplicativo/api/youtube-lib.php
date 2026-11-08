<?php
// Integração com o canal da igreja no YouTube (Pílulas de Sabedoria).
// O vídeo sai do app direto para o YouTube; a hospedagem do site não guarda vídeo.
// Chaves do projeto Google ficam só na configuração privada (youtube_client_id, youtube_client_secret), nunca no Git.
// A conexão com o canal (token de renovação) fica na tabela nib_ajustes, criada pelo botão "Conectar canal" do admin.
declare(strict_types=1);
if (!defined('NIB_APP_RUNTIME')) { http_response_code(404); exit; }

const NIB_YT_ESCOPO = 'https://www.googleapis.com/auth/youtube.force-ssl';

// Endereços do Google. Nos testes locais, NIB_YT_TESTE aponta para um simulador.
function nib_yt_url(string $qual): string {
  $t = getenv('NIB_YT_TESTE');
  if ($t) return rtrim($t, '/') . ['auth' => '/auth', 'token' => '/token', 'revoke' => '/revoke', 'api' => '', 'upload' => ''][$qual];
  return ['auth' => 'https://accounts.google.com/o/oauth2/v2/auth', 'token' => 'https://oauth2.googleapis.com/token', 'revoke' => 'https://oauth2.googleapis.com/revoke',
    'api' => 'https://www.googleapis.com', 'upload' => 'https://www.googleapis.com'][$qual];
}
function nib_yt_cliente(): ?array {
  $c = nib_config();
  $id = trim((string)($c['youtube_client_id'] ?? '')); $segredo = trim((string)($c['youtube_client_secret'] ?? ''));
  return $id !== '' && $segredo !== '' ? ['id' => $id, 'segredo' => $segredo] : null;
}
// Endereço de retorno cadastrado no Google: https://novaigrejabatista.com.br/app/api/youtube.php?retorno=1
function nib_yt_retorno(): string {
  $c = nib_config(); if (!empty($c['youtube_redirect'])) return (string)$c['youtube_redirect'];
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
  return ($https ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'novaigrejabatista.com.br') . '/app/api/youtube.php?retorno=1';
}

function nib_ajuste(string $chave): ?string {
  $q = nib_db()->prepare('SELECT valor FROM nib_ajustes WHERE chave = ?'); $q->execute([$chave]);
  $v = $q->fetchColumn(); return $v === false ? null : (string)$v;
}
function nib_ajuste_salvar(string $chave, ?string $valor): void {
  if ($valor === null) { nib_db()->prepare('DELETE FROM nib_ajustes WHERE chave = ?')->execute([$chave]); return; }
  nib_db()->prepare('REPLACE INTO nib_ajustes (chave, valor) VALUES (?, ?)')->execute([$chave, $valor]);
}

// Pedido HTTP simples. Devolve [código, corpo, cabeçalhos em minúsculas].
function nib_yt_http(string $metodo, string $url, array $cab = [], ?string $corpo = null, int $tempo = 30): array {
  $h = curl_init($url); $resp = [];
  curl_setopt_array($h, [CURLOPT_CUSTOMREQUEST => $metodo, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => $tempo, CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_HTTPHEADER => $cab, CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_HEADERFUNCTION => function ($c, $linha) use (&$resp) { $p = strpos($linha, ':'); if ($p) $resp[strtolower(trim(substr($linha, 0, $p)))] = trim(substr($linha, $p + 1)); return strlen($linha); }]);
  if ($corpo !== null) curl_setopt($h, CURLOPT_POSTFIELDS, $corpo);
  $b = curl_exec($h); $code = (int)curl_getinfo($h, CURLINFO_RESPONSE_CODE); $err = curl_error($h); curl_close($h);
  if ($b === false) throw new RuntimeException('youtube: ' . $err);
  return [$code, (string)$b, $resp];
}
function nib_yt_form(string $url, array $campos): array {
  [$code, $b] = nib_yt_http('POST', $url, ['Content-Type: application/x-www-form-urlencoded'], http_build_query($campos));
  return [$code, json_decode($b, true) ?: []];
}

function nib_yt_conectado(): bool { return nib_yt_cliente() !== null && (string)nib_ajuste('yt_renovar') !== ''; }

// Token de acesso (vale 1 hora): guardado e renovado sozinho com o token de renovação do canal.
function nib_yt_token(): string {
  $cli = nib_yt_cliente(); $renovar = (string)nib_ajuste('yt_renovar');
  if (!$cli || $renovar === '') throw new RuntimeException('canal não conectado');
  $cache = json_decode((string)nib_ajuste('yt_acesso'), true);
  if (is_array($cache) && ($cache['ate'] ?? 0) > time() + 60 && !empty($cache['token'])) return (string)$cache['token'];
  [$code, $d] = nib_yt_form(nib_yt_url('token'), ['client_id' => $cli['id'], 'client_secret' => $cli['segredo'], 'refresh_token' => $renovar, 'grant_type' => 'refresh_token']);
  if ($code !== 200 || empty($d['access_token'])) {
    if (($d['error'] ?? '') === 'invalid_grant') { nib_ajuste_salvar('yt_renovar', null); nib_ajuste_salvar('yt_acesso', null); }
    throw new RuntimeException('youtube token: ' . $code . ' ' . ($d['error'] ?? ''));
  }
  nib_ajuste_salvar('yt_acesso', json_encode(['token' => $d['access_token'], 'ate' => time() + (int)($d['expires_in'] ?? 3600)]));
  return (string)$d['access_token'];
}
function nib_yt_get(string $caminho, array $q): array {
  [$code, $b] = nib_yt_http('GET', nib_yt_url('api') . $caminho . '?' . http_build_query($q), ['Authorization: Bearer ' . nib_yt_token()]);
  if ($code !== 200) throw new RuntimeException("youtube GET $caminho: $code");
  return json_decode($b, true) ?: [];
}

// Abre o envio em partes (resumable upload). O vídeo vai como "não listado": só quem está no app encontra.
function nib_yt_abrir_envio(string $titulo, string $descricao, int $tamanho, string $tipo): string {
  $meta = json_encode(['snippet' => ['title' => mb_substr($titulo, 0, 100, 'UTF-8'), 'description' => mb_substr($descricao, 0, 4800, 'UTF-8'), 'categoryId' => '22', 'defaultLanguage' => 'pt-BR', 'defaultAudioLanguage' => 'pt-BR'],
    'status' => ['privacyStatus' => 'unlisted', 'embeddable' => true, 'selfDeclaredMadeForKids' => false]], JSON_UNESCAPED_UNICODE);
  [$code, $b, $h] = nib_yt_http('POST', nib_yt_url('upload') . '/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    ['Authorization: Bearer ' . nib_yt_token(), 'Content-Type: application/json; charset=UTF-8', 'X-Upload-Content-Length: ' . $tamanho, 'X-Upload-Content-Type: ' . $tipo], $meta);
  if ($code !== 200 || empty($h['location'])) {
    $motivo = (json_decode($b, true)['error']['errors'][0]['reason'] ?? '');
    error_log("youtube abrir envio: $code $motivo");
    if ($motivo === 'quotaExceeded' || $motivo === 'uploadLimitExceeded') throw new DomainException('O YouTube atingiu o limite de envios de hoje. Tente de novo amanhã.');
    throw new RuntimeException('youtube abrir envio: ' . $code);
  }
  return $h['location'];
}
// Envia uma parte. Devolve ['recebido' => bytes] ou ['id' => id do vídeo] quando termina.
function nib_yt_enviar_parte(string $sessao, int $inicio, string $dados, int $total): array {
  $fim = $inicio + strlen($dados) - 1;
  [$code, $b, $h] = nib_yt_http('PUT', $sessao, ['Content-Length: ' . strlen($dados), 'Content-Range: bytes ' . $inicio . '-' . $fim . '/' . $total], $dados, 120);
  return nib_yt_resposta_envio($code, $b, $h);
}
// Pergunta ao YouTube quanto já chegou (depois de uma queda de conexão).
function nib_yt_consultar_envio(string $sessao, int $total): array {
  [$code, $b, $h] = nib_yt_http('PUT', $sessao, ['Content-Length: 0', 'Content-Range: bytes */' . $total], '', 30);
  return nib_yt_resposta_envio($code, $b, $h);
}
function nib_yt_resposta_envio(int $code, string $b, array $h): array {
  if ($code === 308) return ['recebido' => preg_match('/bytes=0-(\d+)/', $h['range'] ?? '', $m) ? (int)$m[1] + 1 : 0];
  if ($code === 200 || $code === 201) { $id = (string)(json_decode($b, true)['id'] ?? ''); if (preg_match('/^[\w-]{6,20}$/', $id)) return ['id' => $id]; }
  if ($code === 404 || $code === 410) return ['expirou' => true];
  throw new RuntimeException('youtube envio: ' . $code);
}

// Atualiza título e descrição do vídeo no canal (quando o pastor edita a pílula no app). Devolve true se deu certo.
function nib_yt_atualizar(string $video, string $titulo, string $descricao): bool {
  if (!preg_match('/^[\w-]{6,20}$/', $video)) return false;
  $corpo = json_encode(['id' => $video, 'snippet' => ['title' => mb_substr($titulo, 0, 100, 'UTF-8'), 'description' => mb_substr($descricao, 0, 4800, 'UTF-8'), 'categoryId' => '22', 'defaultLanguage' => 'pt-BR', 'defaultAudioLanguage' => 'pt-BR']], JSON_UNESCAPED_UNICODE);
  try {
    [$code] = nib_yt_http('PUT', nib_yt_url('api') . '/youtube/v3/videos?part=snippet', ['Authorization: Bearer ' . nib_yt_token(), 'Content-Type: application/json; charset=UTF-8'], $corpo);
    if ($code === 200) return true;
    error_log("youtube atualizar $video: $code");
  } catch (Throwable $e) { error_log('youtube atualizar: ' . $e->getMessage()); }
  return false;
}
// Apaga um vídeo do canal. Devolve true se apagou ou se ele já não existia.
function nib_yt_apagar(string $video): bool {
  if (!preg_match('/^[\w-]{6,20}$/', $video)) return true;
  try {
    [$code] = nib_yt_http('DELETE', nib_yt_url('api') . '/youtube/v3/videos?' . http_build_query(['id' => $video]), ['Authorization: Bearer ' . nib_yt_token()]);
    if ($code === 204 || $code === 200 || $code === 404) return true;
    error_log("youtube apagar $video: $code");
  } catch (Throwable $e) { error_log('youtube apagar: ' . $e->getMessage()); }
  return false;
}

// Duração ISO 8601 (PT1H2M3S) em segundos.
function nib_yt_duracao(string $iso): int {
  return preg_match('/^P(?:\d+D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/', $iso, $m) ? (int)($m[1] ?? 0) * 3600 + (int)($m[2] ?? 0) * 60 + (int)($m[3] ?? 0) : 0;
}

// Legenda SRT ou VTT em trechos [segundos, texto], sem repetir linhas seguidas iguais (legenda automática repete).
function nib_legenda_trechos(string $txt): array {
  $txt = str_replace(["\r\n", "\r"], "\n", $txt); $out = []; $ultimo = '';
  foreach (preg_split('/\n{2,}/', $txt) as $bloco) {
    if (!preg_match('/(?:(\d+):)?(\d{1,2}):(\d{2})[,.]\d{3}\s*-->/', $bloco, $m)) continue;
    $seg = (int)$m[1] * 3600 + (int)$m[2] * 60 + (int)$m[3];
    $linhas = array_slice(explode("\n", $bloco), 0); $texto = [];
    $depois = false;
    foreach ($linhas as $l) { if (str_contains($l, '-->')) { $depois = true; continue; } if ($depois) $texto[] = trim(strip_tags($l)); }
    foreach ($texto as $t) {
      $t = trim(preg_replace('/\s+/u', ' ', html_entity_decode($t, ENT_QUOTES | ENT_HTML5, 'UTF-8')) ?? '');
      if ($t === '' || $t === $ultimo) continue;
      $out[] = [$seg, $t]; $ultimo = $t;
    }
  }
  return $out;
}
