<?php
// Cadastra um evento do app (tabela nib_eventos_app) pelo Terminal do cPanel, igual ao bloco "Cadastrar evento" da Agenda.
// Pedido de Hilton (26/11/2026): Worship Night, 28/11/2026 às 19h30, na Nib.
// Uso:
//   php evento-app-inserir.php           -> só confere (mostra se já existe), não grava
//   php evento-app-inserir.php --apply   -> grava (não duplica: se já existir igual, não faz nada)
declare(strict_types=1);
if (isset($_SERVER['REQUEST_METHOD'])) { http_response_code(404); exit; }
define('NIB_APP_RUNTIME', true);
require '/home/novaigre/public_html/app/api/conta-lib.php';

$ev = ['nome' => 'Worship Night', 'categoria' => 'Evento', 'resumo' => 'Uma noite de louvor e adoração na Nib.', 'inicio' => '2026-11-28T19:30', 'fim' => '', 'sem_horario' => 0, 'local' => 'Nova Igreja Batista', 'link' => ''];
$apply = in_array('--apply', $argv ?? [], true);
$db = nib_db();
if ((int)$db->query('SELECT MAX(v) FROM nib_versao')->fetchColumn() < 16) { echo "INTERROMPIDO: banco sem a migração v16 (publique o app v199 ou mais novo).\n"; exit(1); }
$q = $db->prepare('SELECT id FROM nib_eventos_app WHERE removido_em IS NULL AND nome = ? AND inicio = ?');
$q->execute([$ev['nome'], $ev['inicio']]);
$ja = $q->fetchColumn();
if ($ja) { echo "JA_EXISTE id=$ja ({$ev['nome']} {$ev['inicio']})\n"; exit(0); }
if (!$apply) { echo "CONFERENCIA_OK: vai cadastrar {$ev['nome']} em {$ev['inicio']} ({$ev['local']}). Rode de novo com --apply.\n"; exit(0); }
$db->prepare('INSERT INTO nib_eventos_app (nome, categoria, resumo, inicio, fim, sem_horario, local, link, criado_por, criado_em) VALUES (?,?,?,?,?,?,?,?,NULL,?)')
  ->execute([$ev['nome'], $ev['categoria'], $ev['resumo'], $ev['inicio'], $ev['fim'], $ev['sem_horario'], $ev['local'], $ev['link'], nib_agora()]);
echo 'EVENTO_OK id=' . $db->lastInsertId() . "\n";
