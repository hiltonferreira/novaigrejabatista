<?php
// Eventos cadastrados direto no app: /app/api/eventos-app.php?acao=...
// Só a administração cadastra e remove (pedido de Hilton, 26/11/2026). A leitura é pública, junto com os eventos do site, em eventos.php.
declare(strict_types=1);
define('NIB_APP_RUNTIME', true);
ini_set('display_errors', '0');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');
header('Referrer-Policy: same-origin');
require __DIR__ . '/conta-lib.php';

// Data "AAAA-MM-DD" com hora opcional "HH:MM" -> "AAAA-MM-DDTHH:MM" (ou só a data). Vazio se inválida.
function nib_evento_data($dia, $hora): string {
  if (!is_string($dia) || !preg_match('/^(\d{4})-(\d{2})-(\d{2})$/D', $dia, $m) || !checkdate((int)$m[2], (int)$m[3], (int)$m[1])) return '';
  if (is_string($hora) && $hora !== '') {
    if (!preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/D', $hora)) return '';
    return $dia . 'T' . $hora;
  }
  return $dia;
}

$acao = is_string($_GET['acao'] ?? null) ? $_GET['acao'] : '';
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') nib_erro('Ação desconhecida.', 404);

try {
  nib_conferir_origem();
  $db = nib_db();
  $eu = nib_pessoa_logada();
  if (!$eu) nib_erro('Entre na sua conta para continuar.', 401);
  if (!nib_tem_papel($eu, ['admin'])) nib_erro('Só a administração cadastra eventos no app.', 403);
  $d = nib_corpo();

  switch ($acao) {
    case 'criar': {
      $nome = nib_texto($d['nome'] ?? '', 100);
      if (mb_strlen($nome, 'UTF-8') < 3) nib_erro('Informe o nome do evento.');
      $sem = !empty($d['sem_horario']);
      $inicio = nib_evento_data($d['dia'] ?? '', $sem ? '' : ($d['hora'] ?? ''));
      if ($inicio === '') nib_erro('Informe uma data válida para o evento.');
      $hoje = (new DateTimeImmutable('now', new DateTimeZone('America/Porto_Velho')))->format('Y-m-d');
      if (substr($inicio, 0, 10) < $hoje) nib_erro('A data do evento já passou.');
      $fim = '';
      if (is_string($d['dia_fim'] ?? null) && $d['dia_fim'] !== '') {
        $fim = nib_evento_data($d['dia_fim'], $sem ? '' : ($d['hora_fim'] ?? ''));
        if ($fim === '') nib_erro('A data de término não é válida.');
        if (substr($fim, 0, 10) < substr($inicio, 0, 10) || (strlen($fim) > 10 && strlen($inicio) > 10 && $fim < $inicio)) nib_erro('O término precisa ser depois do início.');
        if ($fim === $inicio) $fim = '';
      }
      $link = nib_texto($d['link'] ?? '', 300);
      if ($link !== '' && !preg_match('~^https://[^\s<>"\']+$~D', $link)) nib_erro('O link precisa começar com https://');
      nib_limite('evento-app', (string)$eu['id'], 40, 86400);
      $db->prepare('INSERT INTO nib_eventos_app (nome, categoria, resumo, inicio, fim, sem_horario, local, link, criado_por, criado_em) VALUES (?,?,?,?,?,?,?,?,?,?)')
        ->execute([$nome, nib_texto($d['categoria'] ?? '', 60), nib_texto($d['resumo'] ?? '', 400), $inicio, $fim, $sem ? 1 : 0, nib_texto($d['local'] ?? '', 160), $link, $eu['id'], nib_agora()]);
      $id = (int)$db->lastInsertId();
      nib_registrar((int)$eu['id'], 'evento-app', $id);
      nib_json(201, ['ok' => true, 'id' => $id]);
    }

    case 'remover': {
      $q = $db->prepare('UPDATE nib_eventos_app SET removido_por = ?, removido_em = ? WHERE id = ? AND removido_em IS NULL');
      $q->execute([$eu['id'], nib_agora(), (int)($d['id'] ?? 0)]);
      if (!$q->rowCount()) nib_erro('Evento não encontrado.', 404);
      nib_registrar((int)$eu['id'], 'evento-app-removido', (int)($d['id'] ?? 0));
      nib_json(200, ['ok' => true]);
    }

    default:
      nib_erro('Ação desconhecida.', 404);
  }
} catch (Throwable $e) {
  error_log('eventos-app.php: ' . $e->getMessage());
  nib_erro('Serviço indisponível no momento. Tente de novo em instantes.', 503);
}
