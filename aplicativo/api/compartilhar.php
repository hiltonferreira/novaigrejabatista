<?php
// Link de compartilhamento de uma pílula (pedido de Hilton, 13/11/2026): /app/api/compartilhar.php?pilula=ID
// WhatsApp, Instagram e outros leem as etiquetas Open Graph desta página e mostram a capa, o título e o resumo.
// Quem toca no link é levado para /app/?pilula=ID (entra na conta, se precisar, e cai direto na pílula).
// ?pilula=ID&img=1 devolve a imagem da prévia (1200x630, recorte da capa). Só pílulas visíveis para a igreja.
declare(strict_types=1);
define('NIB_APP_RUNTIME', true);
ini_set('display_errors', '0');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
require __DIR__ . '/conta-lib.php';

$id = (int)($_GET['pilula'] ?? 0);
$base = 'https://novaigrejabatista.com.br/app/';
$r = null;
try {
  if ($id > 0) {
    $q = nib_db()->prepare('SELECT * FROM nib_pilulas WHERE id = ? AND removido_em IS NULL'); $q->execute([$id]); $r = $q->fetch() ?: null;
    $visivel = $r && ($r['estado'] === 'publicado' || ($r['estado'] === 'enviando' && $r['youtube_id'])) && !(int)$r['oculto'] && (!$r['publicar_em'] || $r['publicar_em'] <= nib_agora());
    if (!$visivel) $r = null;
  }
} catch (Throwable $e) { error_log('compartilhar: ' . $e->getMessage()); $r = null; }

// Imagem da prévia: capa escolhida (recortada para 1200x630, focando no alto, onde fica o rosto) ou a miniatura do YouTube.
if (!empty($_GET['img'])) {
  if (!$r) { http_response_code(404); exit; }
  $c = null;
  try { $q = nib_db()->prepare('SELECT tipo, imagem FROM nib_pilula_capas WHERE pilula_id = ?'); $q->execute([$id]); $c = $q->fetch() ?: null; } catch (Throwable $e) {}
  if (!$c) { header('Location: https://i.ytimg.com/vi/' . rawurlencode((string)$r['youtube_id']) . '/hqdefault.jpg', true, 302); exit; }
  header('Cache-Control: public, max-age=86400');
  $src = function_exists('imagecreatefromstring') ? @imagecreatefromstring($c['imagem']) : false;
  if (!$src) { header('Content-Type: ' . $c['tipo']); echo $c['imagem']; exit; }
  $W = 1200; $H = 630; $sw = imagesx($src); $sh = imagesy($src);
  $k = max($W / $sw, $H / $sh); $cw = (int)round($W / $k); $ch = (int)round($H / $k);
  $x = (int)max(0, ($sw - $cw) / 2); $y = (int)max(0, min($sh - $ch, ($sh - $ch) * 0.18));
  $dst = imagecreatetruecolor($W, $H);
  imagecopyresampled($dst, $src, 0, 0, $x, $y, $W, $H, $cw, $ch);
  header('Content-Type: image/jpeg');
  imagejpeg($dst, null, 82); exit;
}

// Resumo em frases inteiras (até ~220 caracteres), sem reticências; a passagem vai ao fim.
function nib_resumo_frases(string $t, int $max = 220): string {
  $t = trim(preg_replace('/\s+/u', ' ', $t) ?? '');
  if (mb_strlen($t, 'UTF-8') <= $max) return $t;
  $out = '';
  foreach (preg_split('/(?<=[.!?])\s+/u', $t) ?: [] as $f) {
    if ($out !== '' && mb_strlen($out . ' ' . $f, 'UTF-8') > $max) break;
    $out = $out === '' ? $f : "$out $f";
  }
  return $out;
}

$e = fn($s) => htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$destino = $base . ($r ? '?pilula=' . $id : '');
if ($r) {
  $titulo = $r['titulo'] . ' · Pílula de Sabedoria';
  $desc = trim(nib_resumo_frases((string)$r['texto']) . ($r['passagem'] ? ' ' . $r['passagem'] . '.' : ''));
  if ($desc === '') $desc = 'Uma Pílula de Sabedoria da Nova Igreja Batista.';
  $desc .= ' Assista agora no app da Nib.';
  $img = $base . 'api/compartilhar.php?pilula=' . $id . '&img=1&v=' . (int)($r['capa_em'] ?? 0);
  $url = $base . 'api/compartilhar.php?pilula=' . $id;
} else {
  $titulo = 'Nib · Nova Igreja Batista'; $desc = 'Pílulas de Sabedoria, agenda, células e mais no app da Nova Igreja Batista.';
  $img = $base . 'assets/icons/icon-512.png'; $url = $base;
}
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=300');
?><!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= $e($titulo) ?></title>
<meta name="description" content="<?= $e($desc) ?>">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Nib · Nova Igreja Batista">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="<?= $e($titulo) ?>">
<meta property="og:description" content="<?= $e($desc) ?>">
<meta property="og:url" content="<?= $e($url) ?>">
<meta property="og:image" content="<?= $e($img) ?>">
<?php if ($r): ?><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><?php endif; ?>
<meta property="og:image:alt" content="<?= $e($r ? 'Capa da pílula ' . $r['titulo'] : 'Nib') ?>">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#041e42">
<meta http-equiv="refresh" content="0;url=<?= $e($destino) ?>">
<script>location.replace(<?= json_encode($destino) ?>);</script>
<style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:#041e42;color:#fff;font:16px/1.5 Arial,sans-serif;text-align:center}a{color:#fff}</style>
</head><body><p>Abrindo a pílula no app da Nib<br><a href="<?= $e($destino) ?>">Toque aqui se não abrir</a></p></body></html>
