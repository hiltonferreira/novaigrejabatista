<?php
// Pílulas de exemplo (pedido de Hilton, 12/11/2026): publica vídeos de teste no bloco Pílulas de Sabedoria pelo servidor,
// usando o canal do YouTube já conectado ao app. Não avisa ninguém no celular (notificar = 0). Vídeos sobem não listados.
// Terminal do cPanel, dentro da pasta com este script, pilulas.json e os .mp4:
//   php pilulas-exemplo.php enviar    -> envia o que falta (ids ficam em enviados.json; rodar de novo não duplica)
//   php pilulas-exemplo.php estado    -> mostra o estado de cada pílula no app
//   php pilulas-exemplo.php remover   -> tira do app e apaga do YouTube as pílulas desta pasta
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
define('NIB_APP_RUNTIME', true);
$_SERVER['DOCUMENT_ROOT'] = getenv('NIB_DOCROOT') ?: '/home/novaigre/public_html';
$_SERVER['HTTPS'] = 'on'; $_SERVER['HTTP_HOST'] = 'novaigrejabatista.com.br';
require $_SERVER['DOCUMENT_ROOT'] . '/app/api/conta-lib.php';
require $_SERVER['DOCUMENT_ROOT'] . '/app/api/youtube-lib.php';

$pasta = __DIR__; $acao = $argv[1] ?? '';
$cfg = json_decode((string)file_get_contents("$pasta/pilulas.json"), true) ?: exit("pilulas.json inválido\n");
$arqIds = "$pasta/enviados.json";
$ids = is_file($arqIds) ? (json_decode((string)file_get_contents($arqIds), true) ?: []) : [];
$salvar = function () use (&$ids, $arqIds) { file_put_contents($arqIds, json_encode($ids, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)); };
$db = nib_db();

function dobrar(string $s): string {
  $s = mb_strtolower($s, 'UTF-8');
  $s = strtr($s, ['á'=>'a','à'=>'a','â'=>'a','ã'=>'a','é'=>'e','ê'=>'e','í'=>'i','ó'=>'o','ô'=>'o','õ'=>'o','ú'=>'u','ü'=>'u','ç'=>'c']);
  return trim(preg_replace('/[^a-z0-9]+/', ' ', $s) ?? '');
}

if ($acao === 'enviar') {
  if (!nib_yt_conectado()) exit("O canal do YouTube não está conectado ao app (Painel > Canal do YouTube).\n");
  $q = $db->prepare('SELECT id FROM nib_pessoas WHERE email = ?'); $q->execute([mb_strtolower((string)$cfg['criado_por_email'])]);
  $quem = (int)($q->fetchColumn() ?: 0) ?: null;
  foreach ($cfg['pilulas'] as $p) {
    $arq = "$pasta/{$p['arquivo']}";
    if (isset($ids[$p['arquivo']])) { echo "já enviado: {$p['arquivo']} (pílula {$ids[$p['arquivo']]})\n"; continue; }
    if (!is_file($arq)) { echo "FALTA o arquivo {$p['arquivo']}\n"; continue; }
    $total = filesize($arq);
    $desc = trim($p['passagem'] . "\n\n" . $p['texto'] . "\n\nPílula de Sabedoria · Nova Igreja Batista");
    $sessao = nib_yt_abrir_envio($p['titulo'], $desc, $total, 'video/mp4');
    $db->prepare('INSERT INTO nib_pilulas (titulo, tema, passagem, texto, estado, sessao, tamanho, duracao, vertical, notificar, criado_por, criado_em) VALUES (?,?,?,?,?,?,?,?,1,0,?,?)')
      ->execute([$p['titulo'], $p['tema'], $p['passagem'], $p['texto'], 'enviando', $sessao, $total, (int)$p['duracao'], $quem, nib_agora()]);
    $id = (int)$db->lastInsertId();
    $db->prepare('UPDATE nib_pilulas SET busca = ? WHERE id = ?')->execute([dobrar(implode(' ', [$p['titulo'], $p['tema'], $p['passagem'], $p['texto']])), $id]);
    $ids[$p['arquivo']] = $id; $salvar();
    $fh = fopen($arq, 'rb'); $inicio = 0; $video = ''; $falhas = 0; $parte = 8 * 1024 * 1024;
    while ($video === '') {
      fseek($fh, $inicio); $dados = (string)fread($fh, $parte);
      try { $res = nib_yt_enviar_parte($sessao, $inicio, $dados, $total); }
      catch (RuntimeException $e) {
        if (++$falhas > 5) exit("Falhou o envio de {$p['arquivo']}: {$e->getMessage()}\n");
        sleep(3); $res = nib_yt_consultar_envio($sessao, $total);
      }
      if (!empty($res['expirou'])) exit("O envio de {$p['arquivo']} expirou. Rode de novo depois de apagar a pílula $id.\n");
      if (!empty($res['id'])) $video = $res['id']; else $inicio = (int)$res['recebido'];
      echo "  {$p['arquivo']}: " . ($video ? 100 : (int)floor($inicio * 100 / $total)) . "%\n";
    }
    fclose($fh);
    $db->prepare("UPDATE nib_pilulas SET youtube_id = ?, estado = 'processando', sessao = NULL, recebido = tamanho, conferido_em = NULL WHERE id = ?")->execute([$video, $id]);
    nib_registrar($quem, 'pilula-enviada', $id, $video . ' exemplo');
    echo "OK: {$p['titulo']} -> pílula $id, YouTube $video\n";
  }
  echo "Pronto. O app confere o processamento no YouTube sozinho quando alguém abre as pílulas (alguns minutos).\n";
} elseif ($acao === 'estado') {
  foreach ($ids as $arq => $id) {
    $q = $db->prepare('SELECT id, titulo, estado, youtube_id, aviso, removido_em FROM nib_pilulas WHERE id = ?'); $q->execute([$id]);
    echo json_encode($q->fetch(), JSON_UNESCAPED_UNICODE) . "\n";
  }
} elseif ($acao === 'remover') {
  foreach ($ids as $arq => $id) {
    $q = $db->prepare('SELECT * FROM nib_pilulas WHERE id = ? AND removido_em IS NULL'); $q->execute([$id]); $r = $q->fetch();
    if (!$r) { echo "pílula $id já removida\n"; continue; }
    $db->prepare('UPDATE nib_pilulas SET removido_em = ?, sessao = NULL WHERE id = ?')->execute([nib_agora(), $id]);
    $ok = !$r['youtube_id'] || nib_yt_apagar((string)$r['youtube_id']);
    nib_registrar(null, 'pilula-removida', (int)$id, (string)$r['youtube_id'] . ' exemplo');
    echo "removida pílula $id ({$r['titulo']})" . ($ok ? ", apagada do YouTube\n" : ", MAS não apagou no YouTube: apague no YouTube Studio\n");
  }
} else {
  echo "Uso: php pilulas-exemplo.php enviar | estado | remover\n";
}
