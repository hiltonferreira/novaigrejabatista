<?php
// Eventos publicados no painel de eventos do site, para o app (/app/api/eventos.php).
// Somente leitura e somente campos públicos (os mesmos que a home mostra). Nada de inscrições ou participantes.
declare(strict_types=1);
define('NIB_EVENTOS_RUNTIME', true);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, max-age=0');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');
try {
  require ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/inscricoes/eventos-lib.php';
  $tz = new DateTimeZone('America/Porto_Velho');
  $today = (new DateTimeImmutable('now', $tz))->format('Y-m-d');
  $out = [];
  foreach (nibe_catalog() as $e) {
    if (!is_array($e) || ($e['publication'] ?? '') !== 'publicado' || empty($e['start'])) continue;
    $last = substr((string)($e['end'] ?: $e['start']), 0, 10);
    if ($last < $today) continue;
    $mode = (string)($e['mode'] ?? '');
    $price = $mode === 'pago' ? nibe_money((int)($e['amount_cents'] ?? 0)) : ($mode === 'gratuito' ? 'Gratuita' : ($mode === 'externo' ? 'Inscrição externa' : 'Entrada livre'));
    $url = $mode === 'externo' && !empty($e['external_url']) ? (string)$e['external_url'] : nibe_page($e);
    // Eventos com página própria (ex.: /next/camp-.../): com inscrições abertas, o app vai direto ao formulário (inscricao.html), sem a página de apresentação.
    if (!empty($e['legacy']) && nibe_open($e) && preg_match('~^/[A-Za-z0-9_./-]+/$~D', $url) && !str_contains($url, '..') && is_file(rtrim((string)($_SERVER['DOCUMENT_ROOT'] ?? ''), '/') . $url . 'inscricao.html')) $url .= 'inscricao.html';
    $banner = (string)($e['banner'] ?? '');
    $out[] = [
      'name' => (string)$e['name'],
      'category' => (string)($e['category'] ?? ''),
      'summary' => (string)($e['summary'] ?? ''),
      'start' => (string)$e['start'],
      'end' => (string)($e['end'] ?? ''),
      'time_unconfirmed' => !empty($e['time_unconfirmed']),
      'location' => (string)($e['location'] ?? ''),
      'price' => $price,
      'cta' => (string)(($e['cta'] ?? '') ?: ($mode === 'sem-inscricao' ? 'Saiba mais' : 'Inscreva-se')),
      'open' => nibe_open($e),
      'url' => $url,
      'banner' => preg_match('~^/img/eventos/[A-Za-z0-9_./-]+\.(png|jpg|jpeg|webp)$~D', $banner) ? $banner : '',
      'order' => (int)($e['order'] ?? 10),
    ];
  }
  usort($out, static fn($a, $b) => [$a['start'], $a['order']] <=> [$b['start'], $b['order']]);
  echo json_encode(['eventos' => $out, 'gerado_em' => (new DateTimeImmutable('now', $tz))->format(DATE_ATOM)], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $err) {
  error_log('NIB app eventos: ' . $err->getMessage());
  http_response_code(503);
  echo '{"eventos":[],"erro":"indisponivel"}';
}
