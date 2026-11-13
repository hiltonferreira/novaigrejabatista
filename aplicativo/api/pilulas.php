<?php
// Pílulas de Sabedoria: vídeos curtos do pastor para meditar na Palavra. /app/api/pilulas.php?acao=...
// Pedido de Hilton (08/11/2026): o pastor envia pelo app, o vídeo vai direto para o YouTube da igreja (não listado)
// e a igreja assiste dentro do app. Busca por título, tema, passagem e pelas palavras faladas (legenda automática do YouTube).
// GET (com conta): lista, ver, capa. POST (JSON + X-Nib: 1), só Liderança Pastoral e administração: criar (ou trocar o vídeo, com substituir; publicar_em programa), parte, capa, ocultar, sincronizar, conferir, editar, legenda, remover.
// Troca de vídeo (pedido de Hilton, 08/11/2026): o vídeo novo vai para a mesma pílula; o antigo continua no ar até o novo chegar e depois é apagado do canal.
declare(strict_types=1);
define('NIB_APP_RUNTIME', true);
ini_set('display_errors', '0');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');
header('Referrer-Policy: same-origin');
require __DIR__ . '/conta-lib.php';
require __DIR__ . '/push-lib.php';
require __DIR__ . '/youtube-lib.php';

// Vídeo visível para a igreja: publicado (ou com a troca de vídeo em andamento, o anterior continua valendo),
// não oculto e já na data programada.
function nib_pil_visivel_sql(PDO $db): string {
  return "((estado = 'publicado' OR (estado = 'enviando' AND youtube_id IS NOT NULL)) AND oculto = 0 AND (publicar_em IS NULL OR publicar_em <= " . $db->quote(nib_agora()) . '))';
}
function nib_pil_visivel(array $r): bool {
  return ($r['estado'] === 'publicado' || ($r['estado'] === 'enviando' && $r['youtube_id'])) && !(int)$r['oculto'] && (!$r['publicar_em'] || $r['publicar_em'] <= nib_agora());
}
// Data e hora programadas ("2026-11-12T07:00", horário de Rondônia). Vazio ou no passado: publica assim que ficar pronto.
function nib_pil_data_programada($v): ?string {
  if (!is_string($v) || !preg_match('/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/', $v, $m)) return null;
  $d = DateTimeImmutable::createFromFormat('!Y-m-d H:i', $m[1] . ' ' . $m[2], new DateTimeZone('America/Porto_Velho'));
  if (!$d) return null; $s = $d->format('Y-m-d H:i:s');
  if ($s <= nib_agora()) return null;
  if ($s > nib_em('+400 days')) nib_erro('Programe a publicação para no máximo um ano à frente.');
  return $s;
}
// Aviso no celular da igreja, uma vez por pílula (notificar volta a 0 depois de enviar).
function nib_pil_avisar(PDO $db, array $r): void {
  $db->prepare('UPDATE nib_pilulas SET notificar = 0 WHERE id = ?')->execute([$r['id']]);
  nib_push_depois(null, ['title' => 'Pílula de Sabedoria', 'body' => $r['titulo'] . ($r['passagem'] !== '' ? ' · ' . $r['passagem'] : ''), 'url' => '/app/#pilulas', 'tag' => 'nib-pilula-' . $r['id']]);
}
// Pílulas programadas que chegaram na hora: avisa a igreja. Roda na manutenção e pelo Cron (pilulas-agenda.php).
function nib_pil_avisar_programadas(PDO $db): int {
  $q = $db->prepare("SELECT * FROM nib_pilulas WHERE removido_em IS NULL AND notificar = 1 AND estado = 'publicado' AND oculto = 0 AND publicar_em IS NOT NULL AND publicar_em <= ? LIMIT 5");
  $q->execute([nib_agora()]); $n = 0;
  foreach ($q->fetchAll() as $r) { nib_pil_avisar($db, $r); $n++; }
  return $n;
}
const NIB_PIL_PRIVADO = 'O YouTube deixou o vídeo como privado. Isso acontece até o Google verificar a integração do app; depois, os próximos vídeos saem não listados.';

// Texto para busca: minúsculas, sem acentos e sem pontuação ("Fé, João 3.16" -> "fe joao 3 16").
function nib_dobrar(string $s): string {
  $s = mb_strtolower($s, 'UTF-8');
  $s = strtr($s, ['á' => 'a', 'à' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a', 'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e', 'í' => 'i', 'ì' => 'i', 'î' => 'i', 'ï' => 'i',
    'ó' => 'o', 'ò' => 'o', 'ô' => 'o', 'õ' => 'o', 'ö' => 'o', 'ú' => 'u', 'ù' => 'u', 'û' => 'u', 'ü' => 'u', 'ç' => 'c', 'ñ' => 'n']);
  return trim(preg_replace('/[^a-z0-9]+/', ' ', $s) ?? '');
}
function nib_pil_busca(array $r): string { return nib_dobrar(implode(' ', [$r['titulo'], $r['tema'], $r['passagem'], $r['texto'], (string)($r['transcricao'] ?? '')])); }
function nib_pil_palavras(string $q): array {
  $w = array_values(array_filter(explode(' ', nib_dobrar($q)), fn($x) => strlen($x) >= 2 || ctype_digit($x)));
  return array_slice(array_unique($w), 0, 6);
}
// Descrição do vídeo no YouTube: passagem, mensagem e a assinatura da igreja.
function nib_pil_descricao(string $passagem, string $texto): string { return trim(($passagem !== '' ? $passagem . "\n\n" : '') . ($texto !== '' ? $texto . "\n\n" : '') . 'Pílula de Sabedoria · Nova Igreja Batista'); }
function nib_ini_bytes(string $v): int { $n = (int)$v; $u = strtolower(substr(trim($v), -1)); return $u === 'g' ? $n << 30 : ($u === 'm' ? $n << 20 : ($u === 'k' ? $n << 10 : $n)); }
// Tamanho de cada parte do envio: múltiplo de 256 KB, abaixo do limite de upload do PHP, no máximo 4 MB.
function nib_pil_parte(): int {
  $max = nib_ini_bytes((string)(ini_get('post_max_size') ?: '8M')); if ($max <= 0) $max = 64 << 20;
  return max(262144, min(4 << 20, intdiv($max - 65536, 262144) * 262144));
}
function nib_pil_dados(array $r, bool $equipe, bool $completo = false, array $palavras = []): array {
  $o = ['id' => (int)$r['id'], 'titulo' => $r['titulo'], 'tema' => $r['tema'], 'passagem' => $r['passagem'], 'texto' => $r['texto'], 'youtube_id' => $r['youtube_id'],
    'duracao' => (int)$r['duracao'], 'vertical' => (bool)$r['vertical'], 'data' => $r['publicar_em'] ?: ($r['publicado_em'] ?: $r['criado_em']), 'transcricao_ok' => trim((string)$r['transcricao']) !== '',
    'capa' => (int)($r['capa_em'] ?? 0) ? 'api/pilulas.php?acao=capa&id=' . (int)$r['id'] . '&v=' . (int)$r['capa_em'] : ''];
  if ($equipe) $o += ['oculto' => (bool)(int)$r['oculto'], 'publicar_em' => $r['publicar_em'], 'agendado' => $r['publicar_em'] !== null && $r['publicar_em'] > nib_agora(), 'troca' => $r['estado'] === 'enviando' && $r['youtube_id'] !== null, 'estado' => $r['estado'], 'aviso' => $r['aviso'], 'progresso' => (int)$r['tamanho'] ? (int)floor((int)$r['recebido'] * 100 / (int)$r['tamanho']) : 0];
  if ($completo) $o += ['transcricao' => (string)$r['transcricao'], 'legendas' => json_decode((string)$r['legendas'], true) ?: []];
  if ($palavras && $r['legendas']) {
    // Trechos da fala com as palavras buscadas, com o segundo em que aparecem (no máximo 3).
    $t = []; foreach (json_decode((string)$r['legendas'], true) ?: [] as [$seg, $txt]) {
      $d = ' ' . nib_dobrar((string)$txt) . ' ';
      foreach ($palavras as $p) if (str_contains($d, ctype_digit($p) ? " $p " : $p)) { $t[] = [(int)$seg, (string)$txt]; break; }
      if (count($t) >= 3) break;
    }
    $o['trechos'] = $t;
  }
  return $o;
}
// Total de curtidas e se quem está vendo curtiu, para uma lista de pílulas.
function nib_pil_curtidas(PDO $db, array $lista, int $eu): array {
  $ids = array_values(array_filter(array_map(fn($p) => (int)$p['id'], $lista))); if (!$ids) return $lista;
  $q = $db->prepare('SELECT pilula_id, COUNT(*) n, MAX(pessoa_id = ?) eu FROM nib_pilula_curtidas WHERE pilula_id IN (' . implode(',', array_fill(0, count($ids), '?')) . ') GROUP BY pilula_id');
  $q->execute(array_merge([$eu], $ids)); $c = [];
  foreach ($q->fetchAll() as $r) $c[(int)$r['pilula_id']] = [(int)$r['n'], (bool)(int)$r['eu']];
  foreach ($lista as &$p) { [$p['curtidas'], $p['curti']] = $c[(int)$p['id']] ?? [0, false]; }
  return $lista;
}
function nib_pil_linha(PDO $db, int $id): ?array {
  $q = $db->prepare('SELECT * FROM nib_pilulas WHERE id = ? AND removido_em IS NULL'); $q->execute([$id]); return $q->fetch() ?: null;
}
function nib_pil_salvar_busca(PDO $db, int $id): void {
  $r = nib_pil_linha($db, $id); if ($r) $db->prepare('UPDATE nib_pilulas SET busca = ? WHERE id = ?')->execute([nib_pil_busca($r), $id]);
}

// Confere no YouTube se o vídeo terminou de processar. Ao ficar pronto, aparece para a igreja (e avisa no celular, se pedido).
const NIB_PIL_BLOQUEADO = 'O YouTube bloqueou este vídeo no Brasil por direitos autorais (geralmente a música de fundo). A igreja não vê esta pílula. No YouTube Studio, abra o vídeo, vá em Direitos autorais e silencie ou substitua a música; o app libera sozinho depois.';
function nib_pil_conferir(PDO $db, array $r): void {
  $db->prepare('UPDATE nib_pilulas SET conferido_em = ? WHERE id = ?')->execute([nib_agora(), $r['id']]);
  $it = nib_yt_get('/youtube/v3/videos', ['part' => 'status,contentDetails', 'id' => $r['youtube_id']])['items'][0] ?? null;
  if (!$it) return; // ainda sendo registrado no YouTube
  $up = (string)($it['status']['uploadStatus'] ?? ''); $priv = (string)($it['status']['privacyStatus'] ?? '');
  $dur = nib_yt_duracao((string)($it['contentDetails']['duration'] ?? '')) ?: (int)$r['duracao'];
  if (in_array($up, ['rejected', 'failed', 'deleted'], true)) {
    $motivo = (string)($it['status']['rejectionReason'] ?? $it['status']['failureReason'] ?? $up);
    $db->prepare("UPDATE nib_pilulas SET estado = 'falhou', aviso = ? WHERE id = ?")->execute([mb_substr('O YouTube não aceitou o vídeo (' . $motivo . '). Envie de novo ou confira no YouTube Studio.', 0, 250), $r['id']]);
    return;
  }
  if ($up !== 'processed') return;
  if ($priv === 'private') { $db->prepare("UPDATE nib_pilulas SET estado = 'privado', aviso = ?, duracao = ? WHERE id = ?")->execute([NIB_PIL_PRIVADO, $dur, $r['id']]); return; }
  // Bloqueio por direitos autorais (ex.: música de fundo): o YouTube não deixa assistir no Brasil. A igreja não vê; a liderança vê o aviso.
  // Volta sozinho quando o bloqueio sai (a manutenção confere de novo).
  $reg = $it['contentDetails']['regionRestriction'] ?? [];
  if (in_array('BR', (array)($reg['blocked'] ?? []), true) || (isset($reg['allowed']) && !in_array('BR', (array)$reg['allowed'], true))) {
    $db->prepare("UPDATE nib_pilulas SET estado = 'bloqueado', aviso = ?, duracao = ? WHERE id = ?")->execute([NIB_PIL_BLOQUEADO, $dur, $r['id']]);
    return;
  }
  $db->prepare("UPDATE nib_pilulas SET estado = 'publicado', aviso = '', duracao = ?, publicado_em = COALESCE(publicado_em, ?), legenda_proxima = COALESCE(legenda_proxima, ?) WHERE id = ?")
    ->execute([$dur, nib_agora(), nib_em('+5 minutes'), $r['id']]);
  // Avisa no celular agora, ou na hora programada (nib_pil_avisar_programadas). Oculta não avisa.
  // Só na primeira publicação (a conferência periódica de pílulas já publicadas não avisa de novo).
  if (!$r['publicado_em'] && (int)$r['notificar'] && !(int)$r['oculto'] && (!$r['publicar_em'] || $r['publicar_em'] <= nib_agora())) nib_pil_avisar($db, $r);
}

// Busca a legenda automática do YouTube (texto falado com o tempo de cada trecho). Tenta de novo com intervalos cada vez maiores.
function nib_pil_legenda(PDO $db, array $r, bool $agora = false): bool {
  $n = (int)$r['legenda_tentativas'] + 1;
  $db->prepare('UPDATE nib_pilulas SET legenda_tentativas = ?, legenda_proxima = ? WHERE id = ?')
    ->execute([$n, $n >= 10 && !$agora ? null : nib_em('+' . min(1440, 10 * 2 ** min(8, $n - 1)) . ' minutes'), $r['id']]);
  $lista = nib_yt_get('/youtube/v3/captions', ['part' => 'snippet', 'videoId' => $r['youtube_id']])['items'] ?? [];
  // Legenda enviada pelo próprio canal (revisada) vem antes da automática.
  usort($lista, fn($a, $b) => (($a['snippet']['trackKind'] ?? '') === 'asr') <=> (($b['snippet']['trackKind'] ?? '') === 'asr'));
  $cap = null; foreach ($lista as $c) if (str_starts_with((string)($c['snippet']['language'] ?? ''), 'pt')) { $cap = $c; break; }
  $cap = $cap ?: ($lista[0] ?? null);
  if (!$cap || empty($cap['id'])) return false;
  [$code, $b] = nib_yt_http('GET', nib_yt_url('api') . '/youtube/v3/captions/' . rawurlencode((string)$cap['id']) . '?tfmt=srt', ['Authorization: Bearer ' . nib_yt_token()]);
  if ($code !== 200) { error_log('pilulas legenda: ' . $code); return false; }
  $trechos = nib_legenda_trechos($b); if (!$trechos) return false;
  $texto = implode(' ', array_column($trechos, 1));
  $db->prepare('UPDATE nib_pilulas SET legendas = ?, legenda_proxima = NULL, transcricao = IF(transcricao_editada = 1, transcricao, ?) WHERE id = ?')
    ->execute([json_encode($trechos, JSON_UNESCAPED_UNICODE), $texto, $r['id']]);
  nib_pil_salvar_busca($db, (int)$r['id']);
  return true;
}

// Manutenção depois de responder: confere vídeos em processamento e busca transcrições pendentes, sem atrasar a tela.
function nib_pil_manutencao(): void {
  register_shutdown_function(function () {
    ignore_user_abort(true); @set_time_limit(60);
    if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
    elseif (function_exists('litespeed_finish_request')) litespeed_finish_request();
    try {
      if (!nib_yt_conectado()) return;
      $db = nib_db();
      $q = $db->prepare("SELECT * FROM nib_pilulas WHERE removido_em IS NULL AND youtube_id IS NOT NULL AND (
          (estado = 'processando' AND (conferido_em IS NULL OR conferido_em < ?)) OR (estado IN ('privado', 'bloqueado') AND conferido_em < ?)
          OR (estado = 'publicado' AND (conferido_em IS NULL OR conferido_em < ?))) ORDER BY id DESC LIMIT 3");
      $q->execute([nib_em('-20 seconds'), nib_em('-30 minutes'), nib_em('-6 hours')]);
      foreach ($q->fetchAll() as $r) nib_pil_conferir($db, $r);
      $q = $db->prepare("SELECT * FROM nib_pilulas WHERE removido_em IS NULL AND estado = 'publicado' AND legendas IS NULL AND legenda_proxima IS NOT NULL AND legenda_proxima <= ? ORDER BY id DESC LIMIT 1");
      $q->execute([nib_agora()]);
      foreach ($q->fetchAll() as $r) nib_pil_legenda($db, $r);
      nib_pil_avisar_programadas($db);
    } catch (Throwable $e) { error_log('pilulas manutencao: ' . $e->getMessage()); }
  });
}
function nib_pil_concluir(PDO $db, array $r, string $video, int $quem): void {
  $antigo = (string)($r['youtube_id'] ?? '');
  if ($antigo !== '' && $antigo !== $video) {
    // Troca de vídeo: a transcrição do vídeo anterior não vale para o novo; busca de novo depois que ele ficar pronto.
    $db->prepare("UPDATE nib_pilulas SET youtube_id = ?, estado = 'processando', aviso = '', notificar = 0, sessao = NULL, recebido = tamanho, conferido_em = NULL, legendas = NULL, transcricao = '', transcricao_editada = 0, legenda_tentativas = 0, legenda_proxima = NULL WHERE id = ?")->execute([$video, $r['id']]);
    nib_pil_salvar_busca($db, (int)$r['id']);
    nib_registrar($quem, 'pilula-video-trocado', (int)$r['id'], $antigo . ' > ' . $video);
    if (!nib_yt_apagar($antigo)) $db->prepare('UPDATE nib_pilulas SET aviso = ? WHERE id = ?')->execute(['O vídeo anterior não foi apagado do YouTube. Apague no YouTube Studio.', $r['id']]);
    return;
  }
  $db->prepare("UPDATE nib_pilulas SET youtube_id = ?, estado = 'processando', sessao = NULL, recebido = tamanho, conferido_em = NULL WHERE id = ?")->execute([$video, $r['id']]);
  nib_registrar($quem, 'pilula-enviada', (int)$r['id'], $video);
}
// O envio expirou: na troca de vídeo, a pílula volta para o vídeo anterior; num envio novo, fica como não publicado.
function nib_pil_expirou(PDO $db, array $r): never {
  if ($r['youtube_id']) $db->prepare("UPDATE nib_pilulas SET estado = IF(publicado_em IS NULL, 'privado', 'publicado'), sessao = NULL, recebido = tamanho, aviso = 'A troca do vídeo não terminou. O vídeo anterior continua no ar.' WHERE id = ?")->execute([$r['id']]);
  else $db->prepare("UPDATE nib_pilulas SET estado = 'falhou', sessao = NULL, aviso = 'O envio expirou antes de terminar. Envie o vídeo de novo.' WHERE id = ?")->execute([$r['id']]);
  nib_erro('O envio expirou. Envie o vídeo de novo.', 410);
}

$acao = is_string($_GET['acao'] ?? null) ? $_GET['acao'] : '';
$post = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';

try {
  if ($post) nib_conferir_origem();
  $db = nib_db();
  $eu = nib_pessoa_logada();
  if (!$eu) nib_erro('Entre na sua conta para ver as Pílulas de Sabedoria.', 401);
  $lider = nib_tem_papel($eu, ['pastoral', 'admin']);
  $d = $post && $acao !== 'parte' && $acao !== 'capa' ? nib_corpo() : [];
  $id = (int)($d['id'] ?? $_GET['id'] ?? 0);
  if ($post && !$lider && $acao !== 'curtir') nib_erro('Só a Liderança Pastoral publica as Pílulas de Sabedoria.', 403);

  switch ($post ? "post:$acao" : "get:$acao") {
    case 'get:lista': {
      $q = is_string($_GET['q'] ?? null) ? mb_substr($_GET['q'], 0, 80) : ''; $tema = nib_texto($_GET['tema'] ?? '', 60);
      $w = ['removido_em IS NULL']; $args = [];
      if (!$lider) $w[] = nib_pil_visivel_sql($db);
      if ($tema !== '') { $w[] = 'tema = ?'; $args[] = $tema; }
      $palavras = nib_pil_palavras($q);
      foreach ($palavras as $p) { $w[] = "CONCAT(' ', busca, ' ') LIKE ?"; $args[] = ctype_digit($p) ? "% $p %" : '%' . $p . '%'; }
      $s = $db->prepare('SELECT * FROM nib_pilulas WHERE ' . implode(' AND ', $w) . ' ORDER BY COALESCE(publicar_em, publicado_em, criado_em) DESC, id DESC LIMIT ' . ($palavras ? 40 : 60));
      $s->execute($args);
      $lista = nib_pil_curtidas($db, array_map(fn($r) => nib_pil_dados($r, $lider, false, $palavras), $s->fetchAll()), (int)$eu['id']);
      $temas = $db->query("SELECT tema, COUNT(*) n FROM nib_pilulas WHERE removido_em IS NULL AND " . nib_pil_visivel_sql($db) . " AND tema <> '' GROUP BY tema ORDER BY n DESC, tema LIMIT 20")->fetchAll(PDO::FETCH_COLUMN);
      nib_pil_manutencao();
      $extra = $lider ? ['youtube' => ['configurado' => nib_yt_cliente() !== null, 'conectado' => nib_yt_conectado(), 'canal' => (string)nib_ajuste('yt_canal'), 'pode_conectar' => nib_tem_papel($eu, ['admin'])]] : [];
      nib_json(200, ['ok' => true, 'pilulas' => $lista, 'temas' => $temas, 'equipe' => $lider] + $extra);
    }

    case 'get:ver': {
      $r = nib_pil_linha($db, $id);
      if (!$r || (!$lider && !nib_pil_visivel($r))) nib_erro('Pílula não encontrada.', 404);
      nib_json(200, ['ok' => true, 'pilula' => nib_pil_curtidas($db, [nib_pil_dados($r, $lider, true)], (int)$eu['id'])[0]]);
    }

    // Curtir ou descurtir (qualquer pessoa logada que vê a pílula). Devolve o total atualizado.
    case 'post:curtir': {
      $r = nib_pil_linha($db, $id);
      if (!$r || (!$lider && !nib_pil_visivel($r))) nib_erro('Pílula não encontrada.', 404);
      if (!empty($d['curtir'])) $db->prepare('INSERT IGNORE INTO nib_pilula_curtidas (pilula_id, pessoa_id, criado_em) VALUES (?, ?, ?)')->execute([$id, (int)$eu['id'], nib_agora()]);
      else $db->prepare('DELETE FROM nib_pilula_curtidas WHERE pilula_id = ? AND pessoa_id = ?')->execute([$id, (int)$eu['id']]);
      $o = nib_pil_curtidas($db, [['id' => $id]], (int)$eu['id'])[0];
      nib_json(200, ['ok' => true, 'curtidas' => $o['curtidas'], 'curti' => $o['curti']]);
    }

    // Imagem da capa. O endereço muda a cada troca (v=), então pode ficar no cache do aparelho.
    case 'get:capa': {
      $r = nib_pil_linha($db, $id);
      if (!$r || (!$lider && !nib_pil_visivel($r))) nib_erro('Capa não encontrada.', 404);
      $q = $db->prepare('SELECT tipo, imagem FROM nib_pilula_capas WHERE pilula_id = ?'); $q->execute([$id]); $c = $q->fetch();
      if (!$c) nib_erro('Capa não encontrada.', 404);
      header('Content-Type: ' . $c['tipo']); header('Cache-Control: private, max-age=31536000, immutable');
      echo $c['imagem']; exit;
    }

    // Capa escolhida pelo pastor (corpo binário: JPEG, PNG ou WebP). Com ?remover=1 volta para a miniatura automática do YouTube.
    case 'post:capa': {
      $r = nib_pil_linha($db, $id); if (!$r) nib_erro('Pílula não encontrada.', 404);
      if (!empty($_GET['remover'])) {
        $db->prepare('DELETE FROM nib_pilula_capas WHERE pilula_id = ?')->execute([$id]);
        $db->prepare('UPDATE nib_pilulas SET capa_em = 0 WHERE id = ?')->execute([$id]);
        nib_registrar((int)$eu['id'], 'pilula-capa-removida', $id);
        nib_json(200, ['ok' => true, 'pilula' => nib_pil_dados(nib_pil_linha($db, $id), true, true)]);
      }
      $img = (string)file_get_contents('php://input', false, null, 0, 1600001);
      if ($img === '' || strlen($img) > 1600000) nib_erro('A imagem da capa precisa ter até 1,5 MB.');
      $info = @getimagesizefromstring($img);
      $tipos = [IMAGETYPE_JPEG => 'image/jpeg', IMAGETYPE_PNG => 'image/png', IMAGETYPE_WEBP => 'image/webp'];
      if (!$info || !isset($tipos[$info[2]]) || $info[0] < 120 || $info[1] < 120 || $info[0] > 4000 || $info[1] > 4000) nib_erro('Escolha uma imagem WebP, JPEG ou PNG para a capa.');
      $db->prepare('REPLACE INTO nib_pilula_capas (pilula_id, tipo, imagem) VALUES (?, ?, ?)')->execute([$id, $tipos[$info[2]], $img]);
      $db->prepare('UPDATE nib_pilulas SET capa_em = ? WHERE id = ?')->execute([time(), $id]);
      nib_registrar((int)$eu['id'], 'pilula-capa', $id);
      nib_json(200, ['ok' => true, 'pilula' => nib_pil_dados(nib_pil_linha($db, $id), true, true)]);
    }

    // Começa um envio: guarda os dados e abre a sessão de envio no YouTube. O app manda o vídeo em partes (acao=parte).
    case 'post:criar': {
      if (!nib_yt_conectado()) nib_erro('O canal do YouTube ainda não foi conectado ao app. Peça à administração para conectar.', 409);
      $troca = (int)($d['substituir'] ?? 0) ? nib_pil_linha($db, (int)$d['substituir']) : null;
      if ((int)($d['substituir'] ?? 0) && (!$troca || !$troca['youtube_id'])) nib_erro('Pílula não encontrada para trocar o vídeo.', 404);
      if ($troca) foreach (['titulo', 'tema', 'passagem', 'texto'] as $k) $d[$k] = $troca[$k];
      $titulo = nib_texto($d['titulo'] ?? '', 120); $tema = nib_texto($d['tema'] ?? '', 60); $passagem = nib_texto($d['passagem'] ?? '', 80);
      $texto = nib_texto($d['texto'] ?? '', 1000);
      $tamanho = (int)($d['tamanho'] ?? 0); $tipo = is_string($d['tipo'] ?? null) && preg_match('~^video/[\w.+-]{1,30}$~', $d['tipo']) ? $d['tipo'] : 'video/mp4';
      $duracao = max(0, min(36000, (int)($d['duracao'] ?? 0)));
      if ($titulo === '') nib_erro('Informe o título da pílula.');
      if ($tamanho < 20000 || $tamanho > 4 * 1024 ** 3) nib_erro('Escolha um arquivo de vídeo válido (até 4 GB).');
      if ($duracao > 1800) nib_erro('A pílula pode ter até 30 minutos.');
      $programada = $troca ? null : nib_pil_data_programada($d['publicar_em'] ?? '');
      nib_limite('pilula', (string)$eu['id'], 20, 86400);
      $desc = nib_pil_descricao($passagem, $texto);
      try { $sessao = nib_yt_abrir_envio($titulo, $desc, $tamanho, $tipo); }
      catch (DomainException $e) { nib_erro($e->getMessage(), 429); }
      if ($troca) {
        // O vídeo anterior continua no ar enquanto o novo é enviado.
        $db->prepare("UPDATE nib_pilulas SET estado = 'enviando', aviso = '', sessao = ?, tamanho = ?, recebido = 0, duracao = ?, vertical = ? WHERE id = ?")
          ->execute([$sessao, $tamanho, $duracao, empty($d['vertical']) ? 0 : 1, $troca['id']]);
        nib_registrar((int)$eu['id'], 'pilula-troca-iniciada', (int)$troca['id']);
        nib_json(201, ['ok' => true, 'id' => (int)$troca['id'], 'parte' => nib_pil_parte()]);
      }
      $db->prepare('INSERT INTO nib_pilulas (titulo, tema, passagem, texto, estado, sessao, tamanho, duracao, vertical, notificar, publicar_em, criado_por, criado_em) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([$titulo, $tema, $passagem, $texto, 'enviando', $sessao, $tamanho, $duracao, empty($d['vertical']) ? 0 : 1, empty($d['notificar']) ? 0 : 1, $programada, $eu['id'], nib_agora()]);
      $novo = (int)$db->lastInsertId();
      nib_pil_salvar_busca($db, $novo);
      nib_registrar((int)$eu['id'], 'pilula-criada', $novo);
      nib_json(201, ['ok' => true, 'id' => $novo, 'parte' => nib_pil_parte()]);
    }

    // Uma parte do vídeo (corpo binário). Repassa ao YouTube e devolve quanto já chegou.
    case 'post:parte': {
      $r = nib_pil_linha($db, $id);
      if (!$r || $r['estado'] !== 'enviando' || !$r['sessao']) nib_erro('Envio não encontrado. Comece de novo.', 404);
      $inicio = (int)($_GET['inicio'] ?? -1);
      if ($inicio !== (int)$r['recebido']) nib_json(409, ['ok' => false, 'erro' => 'Parte fora de ordem.', 'recebido' => (int)$r['recebido']]);
      $max = nib_pil_parte();
      $dados = (string)file_get_contents('php://input', false, null, 0, $max + 1);
      $n = strlen($dados); $total = (int)$r['tamanho'];
      if ($n === 0 || $n > $max || $inicio + $n > $total || ($inicio + $n < $total && $n % 262144 !== 0)) nib_erro('Parte do vídeo inválida.');
      @set_time_limit(180);
      try { $res = nib_yt_enviar_parte((string)$r['sessao'], $inicio, $dados, $total); }
      catch (RuntimeException $e) { error_log('pilulas parte: ' . $e->getMessage()); nib_erro('A conexão com o YouTube oscilou. Tentando de novo.', 502); }
      if (!empty($res['expirou'])) nib_pil_expirou($db, $r);
      if (!empty($res['id'])) { nib_pil_concluir($db, $r, $res['id'], (int)$eu['id']); nib_json(200, ['ok' => true, 'pronto' => true]); }
      $db->prepare('UPDATE nib_pilulas SET recebido = ? WHERE id = ?')->execute([$res['recebido'], $id]);
      nib_json(200, ['ok' => true, 'recebido' => (int)$res['recebido']]);
    }

    // Depois de uma queda: pergunta ao YouTube quanto chegou, para continuar do ponto certo.
    case 'post:sincronizar': {
      $r = nib_pil_linha($db, $id);
      if (!$r || $r['estado'] !== 'enviando' || !$r['sessao']) nib_erro('Envio não encontrado. Comece de novo.', 404);
      $res = nib_yt_consultar_envio((string)$r['sessao'], (int)$r['tamanho']);
      if (!empty($res['expirou'])) nib_pil_expirou($db, $r);
      if (!empty($res['id'])) { nib_pil_concluir($db, $r, $res['id'], (int)$eu['id']); nib_json(200, ['ok' => true, 'pronto' => true]); }
      $db->prepare('UPDATE nib_pilulas SET recebido = ? WHERE id = ?')->execute([$res['recebido'], $id]);
      nib_json(200, ['ok' => true, 'recebido' => (int)$res['recebido']]);
    }

    // O app pergunta, logo depois do envio, se o YouTube já terminou de processar.
    case 'post:conferir': {
      $r = nib_pil_linha($db, $id); if (!$r) nib_erro('Pílula não encontrada.', 404);
      if ($r['youtube_id'] && in_array($r['estado'], ['processando', 'privado', 'bloqueado'], true) && (!$r['conferido_em'] || $r['conferido_em'] < nib_em('-8 seconds'))) nib_pil_conferir($db, $r);
      nib_json(200, ['ok' => true, 'pilula' => nib_pil_dados(nib_pil_linha($db, $id), true)]);
    }

    case 'post:editar': {
      $r = nib_pil_linha($db, $id); if (!$r) nib_erro('Pílula não encontrada.', 404);
      $titulo = nib_texto($d['titulo'] ?? '', 120); if ($titulo === '') nib_erro('Informe o título da pílula.');
      $campos = [$titulo, nib_texto($d['tema'] ?? '', 60), nib_texto($d['passagem'] ?? '', 80), nib_texto($d['texto'] ?? '', 1000)];
      if (array_key_exists('transcricao', $d)) {
        $t = is_string($d['transcricao']) ? mb_substr(trim(preg_replace('/\s+/u', ' ', $d['transcricao']) ?? ''), 0, 60000, 'UTF-8') : '';
        $db->prepare('UPDATE nib_pilulas SET titulo = ?, tema = ?, passagem = ?, texto = ?, transcricao = ?, transcricao_editada = 1 WHERE id = ?')->execute([...$campos, $t, $id]);
      } else $db->prepare('UPDATE nib_pilulas SET titulo = ?, tema = ?, passagem = ?, texto = ? WHERE id = ?')->execute([...$campos, $id]);
      // Programação: só muda se o formulário mandou o campo (vazio = publicar já).
      if (array_key_exists('publicar_em', $d)) $db->prepare('UPDATE nib_pilulas SET publicar_em = ? WHERE id = ?')->execute([nib_pil_data_programada($d['publicar_em']), $id]);
      nib_pil_salvar_busca($db, $id);
      nib_registrar((int)$eu['id'], 'pilula-editada', $id);
      // Título, passagem ou mensagem mudaram: atualiza também no YouTube.
      $yt = null;
      if ($r['youtube_id'] && ($campos[0] !== $r['titulo'] || $campos[2] !== $r['passagem'] || $campos[3] !== $r['texto'])) $yt = nib_yt_atualizar((string)$r['youtube_id'], $campos[0], nib_pil_descricao($campos[2], $campos[3]));
      nib_json(200, ['ok' => true, 'youtube' => $yt, 'pilula' => nib_pil_dados(nib_pil_linha($db, $id), true, true)]);
    }

    // Ocultar: a pílula some para a igreja, mas continua no app para a liderança (e no YouTube). Mostrar desfaz.
    case 'post:ocultar': {
      $r = nib_pil_linha($db, $id); if (!$r) nib_erro('Pílula não encontrada.', 404);
      $oculto = !empty($d['oculto']) ? 1 : 0;
      $db->prepare('UPDATE nib_pilulas SET oculto = ? WHERE id = ?')->execute([$oculto, $id]);
      nib_registrar((int)$eu['id'], $oculto ? 'pilula-oculta' : 'pilula-mostrada', $id);
      nib_json(200, ['ok' => true, 'pilula' => nib_pil_dados(nib_pil_linha($db, $id), true, true)]);
    }

    // "Buscar transcrição agora": o pastor não precisa esperar a próxima tentativa automática.
    case 'post:legenda': {
      $r = nib_pil_linha($db, $id); if (!$r || !$r['youtube_id']) nib_erro('Pílula não encontrada.', 404);
      $ok = nib_pil_legenda($db, $r, true);
      nib_json(200, ['ok' => true, 'achou' => $ok, 'pilula' => nib_pil_dados(nib_pil_linha($db, $id), true, true)]);
    }

    // Exclui a pílula: sai do app e o vídeo é apagado do canal do YouTube (pedido de Hilton, 08/11/2026).
    case 'post:remover': {
      $r = nib_pil_linha($db, $id); if (!$r) nib_erro('Pílula não encontrada.', 404);
      $q = $db->prepare('UPDATE nib_pilulas SET removido_por = ?, removido_em = ?, sessao = NULL WHERE id = ? AND removido_em IS NULL');
      $q->execute([$eu['id'], nib_agora(), $id]);
      if (!$q->rowCount()) nib_erro('Pílula não encontrada.', 404);
      nib_registrar((int)$eu['id'], 'pilula-removida', $id, (string)$r['youtube_id']);
      $apagado = !$r['youtube_id'] || nib_yt_apagar((string)$r['youtube_id']);
      nib_json(200, ['ok' => true, 'youtube_apagado' => $apagado]);
    }

    default:
      nib_erro('Ação desconhecida.', 404);
  }
} catch (Throwable $e) {
  error_log('pilulas.php: ' . $e->getMessage());
  nib_erro('Serviço indisponível no momento. Tente de novo em instantes.', 503);
}
