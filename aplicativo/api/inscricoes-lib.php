<?php
// "Minhas inscrições" no app: lista as inscrições dos eventos do site ligadas ao celular da conta.
// Lê os mesmos arquivos da consulta pública (/consulta-inscricao/), só leitura, fora do public_html.
// Decisão de privacidade: por padrão só para cadastros confirmados pela Secretaria (o celular da conta não é verificado).
declare(strict_types=1);
if (!defined('NIB_APP_RUNTIME')) { http_response_code(404); exit; }

const NIB_INSCRICOES_SO_CONFIRMADOS = true;
// Desligado (revisão do Codex, PR #14, 06/11/2026): a confirmação de membresia não prova que o celular é da pessoa.
// Só ligar quando houver vínculo verificado com o telefone (código por WhatsApp/SMS ou vínculo pelo protocolo).
const NIB_INSCRICOES_AUTOMATICAS = false;

function nib_insc_tel(string $v): string { $v = preg_replace('/\D/', '', $v) ?? ''; return strlen($v) > 11 && str_starts_with($v, '55') ? substr($v, 2) : $v; }

function nib_insc_base(): string {
  $web = realpath((string)($_SERVER['DOCUMENT_ROOT'] ?? '')); if (!$web || $web === '/') throw new RuntimeException('root');
  $base = realpath(dirname($web) . '/nib-inscricoes-privado') ?: '';
  if (!$base || str_starts_with($base . '/', $web . '/')) throw new RuntimeException('storage');
  return $base;
}

// Mesma lista da consulta pública: eventos antigos fixos + eventos do painel com inscrição (pago/gratuito).
function nib_insc_eventos(string $base): array {
  $ev = ['mulheres-virtuosas' => ['name' => 'Mulheres Virtuosas', 'folder' => 'mulheres-2026-10-30', 'paid' => true, 'url' => '/mulheres-virtuosas.html', 'start' => '2026-10-30'],
         'nxt-camp' => ['name' => 'NXT CAMP', 'folder' => 'nxt-camp-2026-11-21', 'paid' => true, 'url' => '/next/camp-sbgp1-nov26/inscricao.html', 'start' => '2026-11-21']];
  $cat = $base . '/eventos-catalogo.json';
  if (is_file($cat) && !is_link($cat)) {
    $j = json_decode((string)file_get_contents($cat), true);
    foreach (is_array($j) ? $j : [] as $k => $e) {
      if (!is_array($e) || !empty($e['legacy']) || !in_array($e['publication'] ?? '', ['publicado', 'encerrado'], true) || !in_array($e['mode'] ?? '', ['pago', 'gratuito'], true)) continue;
      if (!preg_match('/^[a-z0-9-]{1,70}$/D', (string)$k) || !preg_match('/^evento-[a-z0-9-]{1,70}$/D', (string)($e['folder'] ?? ''))) continue;
      $ev[$k] = ['name' => (string)$e['name'], 'folder' => $e['folder'], 'paid' => $e['mode'] === 'pago', 'url' => '/eventos/?evento=' . rawurlencode((string)$k), 'start' => substr((string)($e['start'] ?? ''), 0, 10)];
    }
  }
  return $ev;
}

function nib_minhas_inscricoes(string $celular): array {
  if (!NIB_INSCRICOES_AUTOMATICAS) throw new RuntimeException('inscricoes automaticas desligadas'); // trava dupla: não depende só do conta.php
  $tel = nib_insc_tel($celular); if (!preg_match('/^[1-9][0-9]{9,10}$/D', $tel)) return [];
  $base = nib_insc_base(); $out = [];
  foreach (nib_insc_eventos($base) as $slug => $ev) {
    $folder = $base . '/' . $ev['folder']; if (is_link($folder) || !is_dir($folder)) continue;
    foreach (glob($folder . '/*.json') ?: [] as $p) {
      if (is_link($p) || !preg_match('/^[a-f0-9]{32}\.json$/D', basename($p))) continue;
      $r = json_decode((string)file_get_contents($p), true); if (!is_array($r) || !is_string($r['protocol'] ?? null)) continue;
      $tels = array_filter([nib_insc_tel((string)($r['whatsapp'] ?? '')), nib_insc_tel((string)($r['phone'] ?? '')), nib_insc_tel((string)($r['guardian_phone'] ?? ''))]);
      if (!in_array($tel, $tels, true)) continue;
      $ok = !empty($r['reviewed']);
      $out[] = ['evento' => $ev['name'], 'url' => $ev['url'], 'inicio' => $ev['start'], 'nome' => nib_nome_proprio((string)($r['name'] ?? '')), 'protocolo' => $r['protocol'],
        'situacao' => $ok ? ($ev['paid'] ? 'Pagamento confirmado' : 'Inscrição confirmada') : ($ev['paid'] ? 'Pagamento em conferência' : 'Em conferência'), 'confirmada' => $ok,
        'criado_em' => is_string($r['created_at'] ?? null) ? substr($r['created_at'], 0, 10) : ''];
    }
  }
  usort($out, fn($a, $b) => [$b['inicio'], $a['nome']] <=> [$a['inicio'], $b['nome']]);
  return array_slice($out, 0, 50);
}
