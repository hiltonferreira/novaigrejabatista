<?php
// Pílulas de Sabedoria programadas: avisa a igreja no celular quando chega a hora marcada pelo pastor.
// O app também faz isso sozinho quando alguém abre as Pílulas ou o Início; o Cron só deixa o aviso pontual.
// Uso (Cron do cPanel, a cada 15 minutos):
//   php /home/novaigre/public_html/app/api/pilulas-agenda.php            -> só mostra o que seria avisado agora
//   php /home/novaigre/public_html/app/api/pilulas-agenda.php --enviar   -> avisa (cada pílula uma vez só)
// Só roda pela linha de comando. Pelo navegador responde 404.
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
define('NIB_APP_RUNTIME', true);
if (empty($_SERVER['DOCUMENT_ROOT'])) $_SERVER['DOCUMENT_ROOT'] = dirname(__DIR__, 2);
require __DIR__ . '/conta-lib.php';
require __DIR__ . '/push-lib.php';

$enviar = in_array('--enviar', array_slice($argv, 1), true);
$db = nib_db();
$q = $db->prepare("SELECT * FROM nib_pilulas WHERE removido_em IS NULL AND notificar = 1 AND estado = 'publicado' AND oculto = 0 AND publicar_em IS NOT NULL AND publicar_em <= ? ORDER BY publicar_em LIMIT 10");
$q->execute([nib_agora()]);
$lista = $q->fetchAll();
if (!$lista) { echo "Nenhuma pílula programada para avisar agora.\n"; exit(0); }
foreach ($lista as $r) {
  echo ($enviar ? 'Avisando: ' : 'Avisaria: ') . $r['titulo'] . ' (programada para ' . $r['publicar_em'] . ")\n";
  if (!$enviar) continue;
  // Marca antes de enviar: se o envio cair no meio, não repete o aviso para quem já recebeu.
  $u = $db->prepare('UPDATE nib_pilulas SET notificar = 0 WHERE id = ? AND notificar = 1'); $u->execute([$r['id']]);
  if (!$u->rowCount()) continue;
  nib_push_enviar(null, ['title' => 'Pílula de Sabedoria', 'body' => $r['titulo'] . ($r['passagem'] !== '' ? ' · ' . $r['passagem'] : ''), 'url' => '/app/#pilulas', 'tag' => 'nib-pilula-' . $r['id']]);
}
