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
$tz = new DateTimeZone('America/Porto_Velho');
$today = (new DateTimeImmutable('now', $tz))->format('Y-m-d');
$out = []; $falhas = 0;
try {
  require ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/inscricoes/eventos-lib.php';
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
} catch (Throwable $err) {
  error_log('NIB app eventos (site): ' . $err->getMessage()); $falhas++;
}
// v16: eventos cadastrados direto no app pela administração (tabela nib_eventos_app). Se o banco falhar, os do site continuam.
try {
  define('NIB_APP_RUNTIME', true);
  require __DIR__ . '/conta-lib.php';
  $q = nib_db()->prepare("SELECT id, nome, categoria, resumo, inicio, fim, sem_horario, local, link FROM nib_eventos_app WHERE removido_em IS NULL AND (CASE WHEN fim <> '' THEN fim ELSE inicio END) >= ? ORDER BY inicio LIMIT 40");
  $q->execute([$today]);
  foreach ($q->fetchAll() as $r) {
    $out[] = [
      'name' => (string)$r['nome'], 'category' => (string)$r['categoria'], 'summary' => (string)$r['resumo'],
      'start' => (string)$r['inicio'], 'end' => (string)$r['fim'], 'time_unconfirmed' => (bool)$r['sem_horario'],
      'location' => (string)$r['local'], 'price' => '', 'cta' => 'Saiba mais', 'open' => (string)$r['link'] !== '',
      'url' => (string)$r['link'], 'banner' => '', 'order' => 50, 'app' => true, 'id' => (int)$r['id'],
    ];
  }
} catch (Throwable $err) {
  error_log('NIB app eventos (app): ' . $err->getMessage()); $falhas++;
}
if ($falhas === 2) { http_response_code(503); echo '{"eventos":[],"erro":"indisponivel"}'; exit; }
usort($out, static fn($a, $b) => [$a['start'], $a['order']] <=> [$b['start'], $b['order']]);
echo json_encode(['eventos' => $out, 'gerado_em' => (new DateTimeImmutable('now', $tz))->format(DATE_ATOM)], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
