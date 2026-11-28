<?php
// Avisos da igreja no app: /app/api/avisos.php?acao=...
// GET lista: aberto a todos (é o mural da igreja). POST (JSON + X-Nib: 1): publicar e remover, só para a equipe (Secretaria, Pastoral, admin).
// Pedido de Hilton (06/11/2026): atalho de avisos em que Pastor ou Secretaria cadastram e aparece para toda a igreja.
declare(strict_types=1);
define('NIB_APP_RUNTIME', true);
ini_set('display_errors', '0');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');
header('Referrer-Policy: same-origin');
require __DIR__ . '/conta-lib.php';
require __DIR__ . '/push-lib.php';

// Texto com quebras de linha (no máximo duas seguidas).
function nib_aviso_texto($v, int $max): string {
  if (!is_string($v)) return '';
  $v = str_replace(["\r\n", "\r"], "\n", $v);
  $v = preg_replace('/[^\S\n]+/u', ' ', $v) ?? ''; $v = preg_replace('/ *\n */', "\n", $v) ?? ''; $v = preg_replace('/\n{3,}/', "\n\n", $v) ?? '';
  return mb_substr(trim($v), 0, $max, 'UTF-8');
}

$acao = is_string($_GET['acao'] ?? null) ? $_GET['acao'] : '';
$post = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';

try {
  if ($post) nib_conferir_origem();
  $db = nib_db();
  $eu = nib_pessoa_logada();
  $equipe = $eu ? nib_equipe($eu) : false;
  $d = $post ? nib_corpo() : [];

  switch ($post ? "post:$acao" : "get:$acao") {
    case 'get:lista': {
      $hoje = (new DateTimeImmutable('now', new DateTimeZone('America/Porto_Velho')))->format('Y-m-d');
      $q = $db->prepare('SELECT a.id, a.titulo, a.texto, a.link, a.fixado, a.ate, a.criado_em, p.nome FROM nib_avisos a LEFT JOIN nib_pessoas p ON p.id = a.criado_por
        WHERE a.removido_em IS NULL AND (a.ate IS NULL OR a.ate >= ?) ORDER BY a.fixado DESC, a.criado_em DESC, a.id DESC LIMIT 30');
      $q->execute([$hoje]);
      $lista = array_map(fn($r) => ['id' => (int)$r['id'], 'titulo' => $r['titulo'], 'texto' => $r['texto'], 'link' => $r['link'], 'fixado' => (bool)$r['fixado'], 'ate' => $r['ate'],
        'criado_em' => $r['criado_em'], 'autor' => $equipe && $r['nome'] ? explode(' ', nib_nome_proprio((string)$r['nome']))[0] : ''], $q->fetchAll());
      header('Cache-Control: no-store');
      nib_json(200, ['ok' => true, 'avisos' => $lista, 'equipe' => $equipe]);
    }

    case 'post:publicar': {
      if (!$equipe) nib_erro('Só a Secretaria e a Liderança Pastoral publicam avisos.', 403);
      $titulo = nib_texto($d['titulo'] ?? '', 120); $texto = nib_aviso_texto($d['texto'] ?? '', 1500);
      if ($titulo === '' || $texto === '') nib_erro('Informe o título e o texto do aviso.');
      $link = nib_texto($d['link'] ?? '', 300);
      if ($link !== '' && !preg_match('~^https://[^\s<>"\']+$~D', $link)) nib_erro('O link precisa começar com https://');
      $ate = is_string($d['ate'] ?? null) && preg_match('/^\d{4}-\d{2}-\d{2}$/D', $d['ate']) ? $d['ate'] : null;
      nib_limite('aviso', (string)$eu['id'], 30, 86400);
      $db->prepare('INSERT INTO nib_avisos (titulo, texto, link, fixado, ate, criado_por, criado_em) VALUES (?,?,?,?,?,?,?)')
        ->execute([$titulo, $texto, $link, !empty($d['fixado']) ? 1 : 0, $ate, $eu['id'], nib_agora()]);
      $id = (int)$db->lastInsertId();
      nib_registrar((int)$eu['id'], 'aviso', $id);
      if (!empty($d['notificar'])) nib_push_depois(null, ['title' => $titulo, 'body' => mb_substr(str_replace("\n", ' ', $texto), 0, 170), 'url' => '/app/#avisos', 'tag' => 'nib-aviso-' . $id]);
      nib_json(201, ['ok' => true, 'id' => $id]);
    }

    case 'post:remover': {
      if (!$equipe) nib_erro('Só a Secretaria e a Liderança Pastoral removem avisos.', 403);
      $q = $db->prepare('UPDATE nib_avisos SET removido_por = ?, removido_em = ? WHERE id = ? AND removido_em IS NULL');
      $q->execute([$eu['id'], nib_agora(), (int)($d['id'] ?? 0)]);
      if (!$q->rowCount()) nib_erro('Aviso não encontrado.', 404);
      nib_registrar((int)$eu['id'], 'aviso-removido', (int)($d['id'] ?? 0));
      nib_json(200, ['ok' => true]);
    }

    default:
      nib_erro('Ação desconhecida.', 404);
  }
} catch (Throwable $e) {
  error_log('avisos.php: ' . $e->getMessage());
  nib_erro('Serviço indisponível no momento. Tente de novo em instantes.', 503);
}
