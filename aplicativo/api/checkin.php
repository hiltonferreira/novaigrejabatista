<?php
// Check-in do culto no app: /app/api/checkin.php?acao=...
// Pedido de Hilton (06/11/2026): presença pelo local da igreja (GPS do celular) ou pelo QR Code fixo do telão.
// Regras: só com conta; só na janela do culto (1 h antes até 2 h depois); um check-in por pessoa por culto.
// A localização vem do celular, é comparada com o local da igreja e descartada: só a distância (em metros) fica gravada.
declare(strict_types=1);
define('NIB_APP_RUNTIME', true);
ini_set('display_errors', '0');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store');
require __DIR__ . '/conta-lib.php';

// Cultos fixos da semana (iguais ao site): dia da semana (0 = domingo) => [hora, nome].
const NIB_CULTOS = [0 => ['19:00', 'Noite de Glória'], 4 => ['19:30', 'Culto da Fé']];
const NIB_CHECKIN_ANTES = 60, NIB_CHECKIN_DEPOIS = 120; // minutos
const NIB_CHECKIN_RAIO = 150;  // metros a partir do local da igreja
const NIB_CHECKIN_LONGE = 3000; // pelo QR, acima disso (com localização informada) não vale

function nib_tz(): DateTimeZone { return new DateTimeZone('America/Porto_Velho'); }
// Culto com check-in aberto agora (ou null).
function nib_culto_aberto(?DateTimeImmutable $agora = null): ?array {
  $agora ??= new DateTimeImmutable('now', nib_tz());
  $c = NIB_CULTOS[(int)$agora->format('w')] ?? null; if (!$c) return null;
  $inicio = new DateTimeImmutable($agora->format('Y-m-d') . ' ' . $c[0], nib_tz());
  $abre = $inicio->modify('-' . NIB_CHECKIN_ANTES . ' minutes'); $fecha = $inicio->modify('+' . NIB_CHECKIN_DEPOIS . ' minutes');
  if ($agora < $abre || $agora > $fecha) return null;
  return ['dia' => $agora->format('Y-m-d'), 'hora' => $c[0], 'nome' => $c[1]];
}
function nib_ajuste(PDO $db, string $k): ?string { $q = $db->prepare('SELECT valor FROM nib_ajustes WHERE chave = ?'); $q->execute([$k]); $v = $q->fetchColumn(); return $v === false ? null : (string)$v; }
function nib_ajuste_set(PDO $db, string $k, string $v): void { $db->prepare('INSERT INTO nib_ajustes (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)')->execute([$k, $v]); }
// Código do QR fixo do telão: criado sozinho na primeira vez.
// Código fixo impresso na arte do telão (não é segredo: fica projetado na igreja). Trocar aqui e no banco só se precisar de uma arte nova.
const NIB_CHECKIN_QR_PADRAO = '05981c828247dbdfd70eda6a';
function nib_checkin_qr(PDO $db): string {
  $t = nib_ajuste($db, 'checkin_qr');
  if (!$t) { $t = NIB_CHECKIN_QR_PADRAO; $db->prepare('INSERT IGNORE INTO nib_ajustes (chave, valor) VALUES (?, ?)')->execute(['checkin_qr', $t]); $t = (string)nib_ajuste($db, 'checkin_qr'); }
  return $t;
}
function nib_local_igreja(PDO $db): ?array { $v = nib_ajuste($db, 'igreja_local'); $a = $v ? json_decode($v, true) : null; return is_array($a) && isset($a['lat'], $a['lng']) ? $a : null; }
function nib_metros(float $lat1, float $lng1, float $lat2, float $lng2): int {
  $r = 6371000; $p1 = deg2rad($lat1); $p2 = deg2rad($lat2); $dp = deg2rad($lat2 - $lat1); $dl = deg2rad($lng2 - $lng1);
  $a = sin($dp / 2) ** 2 + cos($p1) * cos($p2) * sin($dl / 2) ** 2; return (int)round(2 * $r * asin(min(1, sqrt($a))));
}
function nib_coord($d): ?array {
  $lat = $d['lat'] ?? null; $lng = $d['lng'] ?? null; $acc = $d['precisao'] ?? 0;
  if (!is_numeric($lat) || !is_numeric($lng) || abs((float)$lat) > 90 || abs((float)$lng) > 180) return null;
  return [(float)$lat, (float)$lng, max(0, min(5000, (int)$acc))];
}

$acao = is_string($_GET['acao'] ?? null) ? $_GET['acao'] : '';
$post = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';

try {
  if ($post) nib_conferir_origem();
  $db = nib_db();
  $eu = nib_pessoa_logada();
  if (!$eu) nib_erro('Entre na sua conta.', 401);
  $equipe = nib_equipe($eu);
  $d = $post ? nib_corpo() : [];

  switch ($post ? "post:$acao" : "get:$acao") {
    case 'get:estado': {
      $c = nib_culto_aberto(); $feito = false;
      if ($c) { $q = $db->prepare('SELECT 1 FROM nib_checkins WHERE pessoa_id = ? AND culto_dia = ? AND culto = ?'); $q->execute([$eu['id'], $c['dia'], $c['nome']]); $feito = (bool)$q->fetchColumn(); }
      nib_json(200, ['ok' => true, 'culto' => $c, 'feito' => $feito, 'local' => nib_local_igreja($db) !== null]);
    }

    case 'post:fazer': {
      nib_limite('checkin', (string)$eu['id'], 20, 3600);
      $c = nib_culto_aberto();
      if (!$c) nib_erro('O check-in abre 1 hora antes do culto e fecha 2 horas depois.', 409);
      $via = ($d['via'] ?? '') === 'qr' ? 'qr' : 'local';
      $pos = nib_coord($d); $igreja = nib_local_igreja($db); $dist = null;
      if ($pos && $igreja) $dist = nib_metros($pos[0], $pos[1], (float)$igreja['lat'], (float)$igreja['lng']);
      if ($via === 'qr') {
        if (!hash_equals(nib_checkin_qr($db), (string)($d['codigo'] ?? ''))) nib_erro('Este QR Code não é o do check-in da igreja.', 403);
        if ($dist !== null && $dist - min($pos[2], 500) > NIB_CHECKIN_LONGE) nib_erro('Pela sua localização, você não está na igreja. O check-in vale só para quem está no culto.', 403);
      } else {
        if (!$igreja) nib_erro('O local da igreja ainda não foi definido. Leia o QR Code do telão.', 409);
        if (!$pos) nib_erro('Não recebemos sua localização. Permita o acesso ou leia o QR Code do telão.');
        if ($dist - min($pos[2], 100) > NIB_CHECKIN_RAIO) nib_erro('Você parece estar longe da igreja (' . ($dist >= 1000 ? str_replace('.', ',', (string)round($dist / 1000, 1)) . ' km' : $dist . ' m') . '). Se já chegou, leia o QR Code do telão.', 403);
      }
      $q = $db->prepare('INSERT IGNORE INTO nib_checkins (pessoa_id, culto_dia, culto, via, distancia, criado_em) VALUES (?,?,?,?,?,?)');
      $q->execute([$eu['id'], $c['dia'], $c['nome'], $via, $dist, nib_agora()]);
      nib_json(200, ['ok' => true, 'culto' => $c, 'novo' => $q->rowCount() > 0]);
    }

    case 'get:painel': {
      if (!$equipe) nib_erro('Acesso só para a equipe da igreja.', 403);
      $c = nib_culto_aberto();
      $ult = $db->query('SELECT culto_dia, culto, COUNT(*) total, SUM(via = \'qr\') qr FROM nib_checkins GROUP BY culto_dia, culto ORDER BY culto_dia DESC LIMIT 12')->fetchAll();
      $hoje = [];
      if ($c) { $q = $db->prepare('SELECT p.nome, k.via, k.criado_em FROM nib_checkins k JOIN nib_pessoas p ON p.id = k.pessoa_id WHERE k.culto_dia = ? AND k.culto = ? ORDER BY k.criado_em DESC'); $q->execute([$c['dia'], $c['nome']]);
        $hoje = array_map(fn($r) => ['nome' => nib_nome_proprio((string)$r['nome']), 'via' => $r['via'], 'hora' => substr((string)$r['criado_em'], 11, 5)], $q->fetchAll()); }
      nib_json(200, ['ok' => true, 'culto' => $c, 'presentes' => $hoje, 'cultos' => array_map(fn($r) => ['dia' => $r['culto_dia'], 'culto' => $r['culto'], 'total' => (int)$r['total'], 'qr' => (int)$r['qr']], $ult),
        'qr' => nib_checkin_qr($db), 'local' => nib_local_igreja($db), 'pode_local' => in_array($eu['papel'], ['pastoral', 'admin'], true)]);
    }

    case 'post:local': {
      if (!in_array($eu['papel'], ['pastoral', 'admin'], true)) nib_erro('Só a Liderança Pastoral define o local da igreja.', 403);
      $pos = nib_coord($d); if (!$pos) nib_erro('Localização inválida.');
      if ($pos[2] > 60) nib_erro('A localização está imprecisa (' . $pos[2] . ' m). Vá para perto da porta ou de uma janela e tente de novo.');
      nib_ajuste_set($db, 'igreja_local', json_encode(['lat' => round($pos[0], 6), 'lng' => round($pos[1], 6), 'por' => (int)$eu['id'], 'em' => nib_agora()]));
      nib_registrar((int)$eu['id'], 'igreja-local');
      nib_json(200, ['ok' => true]);
    }

    default:
      nib_erro('Ação desconhecida.', 404);
  }
} catch (Throwable $e) {
  error_log('checkin.php: ' . $e->getMessage());
  nib_erro('Serviço indisponível no momento. Tente de novo em instantes.', 503);
}
