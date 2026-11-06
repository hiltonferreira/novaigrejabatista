<?php
// Caderno de oração do app: /app/api/caderno.php?acao=...
// Só para quem tem conta. GET: lista. POST (JSON + X-Nib: 1): publicar, orar, atendido, remover.
// Publicação sem aprovação prévia (decisão de Hilton, 03/11/2026), com o mesmo filtro de palavras do app (moderation.js).
declare(strict_types=1);
define('NIB_APP_RUNTIME', true);
ini_set('display_errors', '0');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');
header('Referrer-Policy: same-origin');
require __DIR__ . '/conta-lib.php';

// Mesmo filtro do moderation.js (lista lida do próprio arquivo, para haver uma só fonte).
function nib_normalizar(string $t): string {
  $t = mb_strtolower($t, 'UTF-8');
  $t = class_exists('Normalizer') ? preg_replace('/\p{Mn}/u', '', Normalizer::normalize($t, Normalizer::FORM_D)) : $t;
  $t = strtr($t, ['@' => 'a', '4' => 'a', '3' => 'e', '1' => 'i', '!' => 'i', '0' => 'o', '$' => 's', '7' => 't']);
  $t = preg_replace('/[^a-z\s]/', ' ', $t);
  $t = preg_replace('/(.)\1{2,}/', '$1', $t);
  return trim(preg_replace('/\s+/', ' ', $t));
}
function nib_ofensivo(string $texto): bool {
  static $palavras = null, $frases = null;
  if ($palavras === null) {
    $js = (string)@file_get_contents(dirname(__DIR__) . '/moderation.js');
    $ler = function (string $nome) use ($js): array {
      if (!preg_match('/const ' . $nome . ' = \[(.*?)\];/s', $js, $m)) return [];
      preg_match_all("/'([^']*)'/", $m[1], $q); return $q[1];
    };
    $palavras = array_flip(array_map('nib_normalizar', $ler('words')));
    $frases = array_map('nib_normalizar', $ler('phrases'));
  }
  $limpo = nib_normalizar($texto); if ($limpo === '') return false;
  $com = ' ' . $limpo . ' ';
  foreach ($frases as $f) if ($f !== '' && str_contains($com, ' ' . $f . ' ')) return true;
  foreach (explode(' ', $limpo) as $w) if (isset($palavras[$w]) || isset($palavras[preg_replace('/(.)\1+/', '$1', $w)])) return true;
  return false;
}

$acao = is_string($_GET['acao'] ?? null) ? $_GET['acao'] : '';
$post = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';

try {
  if ($post) nib_conferir_origem();
  $db = nib_db();
  $eu = nib_pessoa_logada();
  if (!$eu) nib_erro('Entre na sua conta para ver o caderno de oração.', 401);
  $d = $post ? nib_corpo() : [];
  $equipe = nib_equipe($eu);
  $pedido = function () use ($db, $d): array {
    $id = (int)($d['id'] ?? 0);
    $q = $db->prepare('SELECT * FROM nib_pedidos WHERE id = ? AND removido_por IS NULL'); $q->execute([$id]);
    $p = $q->fetch(); if (!$p) nib_erro('Pedido não encontrado.', 404);
    return $p;
  };

  switch ($post ? "post:$acao" : "get:$acao") {
    case 'get:lista': {
      $q = $db->prepare('SELECT p.id, p.pessoa_id, p.titulo, p.motivo, p.atendido, p.criado_em, s.nome,
          (SELECT COUNT(*) FROM nib_orando o WHERE o.pedido_id = p.id) AS orando,
          EXISTS(SELECT 1 FROM nib_orando o WHERE o.pedido_id = p.id AND o.pessoa_id = ?) AS eu_orando
        FROM nib_pedidos p JOIN nib_pessoas s ON s.id = p.pessoa_id
        WHERE p.removido_por IS NULL ORDER BY p.criado_em DESC, p.id DESC LIMIT 200');
      $q->execute([$eu['id']]);
      $lista = array_map(fn($r) => [
        'id' => (int)$r['id'], 'autor' => nib_nome_proprio((string)$r['nome']), 'titulo' => $r['titulo'], 'motivo' => $r['motivo'],
        'atendido' => (bool)$r['atendido'], 'orando' => (int)$r['orando'], 'eu_orando' => (bool)$r['eu_orando'],
        'meu' => (int)$r['pessoa_id'] === (int)$eu['id'], 'criado_em' => $r['criado_em'],
      ], $q->fetchAll());
      nib_json(200, ['ok' => true, 'pedidos' => $lista, 'equipe' => $equipe]);
    }

    case 'post:publicar': {
      $titulo = nib_texto($d['titulo'] ?? '', 120); $motivo = nib_texto($d['motivo'] ?? '', 1000);
      if ($titulo === '' || $motivo === '') nib_erro('Informe o título e o pedido.');
      if (nib_ofensivo($titulo . ' ' . $motivo)) nib_erro('Seu pedido tem palavras ofensivas ou de baixo calão. Revise o texto para publicar no caderno.');
      nib_limite('pedido', (string)$eu['id'], 10, 86400);
      $agora = nib_agora();
      $db->prepare('INSERT INTO nib_pedidos (pessoa_id, titulo, motivo, criado_em, atualizado_em) VALUES (?,?,?,?,?)')->execute([$eu['id'], $titulo, $motivo, $agora, $agora]);
      $id = (int)$db->lastInsertId();
      nib_registrar((int)$eu['id'], 'pedido', $id);
      nib_json(201, ['ok' => true, 'id' => $id]);
    }

    case 'post:orar': {
      $p = $pedido();
      nib_limite('orar', (string)$eu['id'], 300, 3600);
      if (!empty($d['orando'])) $db->prepare('INSERT IGNORE INTO nib_orando (pedido_id, pessoa_id, criado_em) VALUES (?,?,?)')->execute([$p['id'], $eu['id'], nib_agora()]);
      else $db->prepare('DELETE FROM nib_orando WHERE pedido_id = ? AND pessoa_id = ?')->execute([$p['id'], $eu['id']]);
      $q = $db->prepare('SELECT COUNT(*) FROM nib_orando WHERE pedido_id = ?'); $q->execute([$p['id']]);
      nib_json(200, ['ok' => true, 'orando' => (int)$q->fetchColumn()]);
    }

    case 'post:atendido': {
      $p = $pedido();
      if ((int)$p['pessoa_id'] !== (int)$eu['id']) nib_erro('Só quem publicou pode marcar o pedido.', 403);
      $db->prepare('UPDATE nib_pedidos SET atendido = ?, atualizado_em = ? WHERE id = ?')->execute([!empty($d['atendido']) ? 1 : 0, nib_agora(), $p['id']]);
      nib_json(200, ['ok' => true]);
    }

    case 'post:remover': {
      $p = $pedido();
      $dono = (int)$p['pessoa_id'] === (int)$eu['id'];
      if (!$dono && !$equipe) nib_erro('Só quem publicou ou a equipe da igreja pode remover.', 403);
      if ($dono) $db->prepare('DELETE FROM nib_pedidos WHERE id = ?')->execute([$p['id']]);
      else $db->prepare('UPDATE nib_pedidos SET removido_por = ?, atualizado_em = ? WHERE id = ?')->execute([$eu['id'], nib_agora(), $p['id']]);
      nib_registrar((int)$eu['id'], $dono ? 'pedido-excluido' : 'pedido-removido', (int)$p['id']);
      nib_json(200, ['ok' => true]);
    }

    default:
      nib_erro('Ação desconhecida.', 404);
  }
} catch (Throwable $e) {
  error_log('caderno.php: ' . $e->getMessage());
  nib_erro('Serviço indisponível no momento. Tente de novo em instantes.', 503);
}
