<?php
// Lembretes do dia no celular (Web Push): cultos, a célula de cada pessoa e eventos do site.
// Pedido de Hilton (06/11/2026): avisar só no dia em que há programação. Nos outros dias nada é enviado.
// A célula vem do "Meu cadastro" de cada pessoa (nib_pessoas.celula = "Dia|Nome").
//
// Uso (Terminal ou Cron do cPanel, uma vez por dia, de manhã em Rondônia):
//   php /home/novaigre/public_html/app/api/lembretes.php            -> só mostra o que seria enviado hoje
//   php /home/novaigre/public_html/app/api/lembretes.php --enviar   -> envia (uma vez por dia; repetir não duplica)
//   php .../lembretes.php --dia=2026-11-08                          -> simula outra data (sem --enviar)
// Só roda pela linha de comando. Pelo navegador responde 404.
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
define('NIB_APP_RUNTIME', true);
define('NIB_EVENTOS_RUNTIME', true);
$docroot = dirname(__DIR__, 2); // public_html
if (empty($_SERVER['DOCUMENT_ROOT'])) $_SERVER['DOCUMENT_ROOT'] = $docroot;
require __DIR__ . '/conta-lib.php';
require __DIR__ . '/push-lib.php';

// Programação fixa da semana (igual ao site e à Agenda do app): dia da semana (0 = domingo) => [[hora, nome]].
const NIB_LEMBRETE_FIXOS = [0 => [['09:30', 'EBS'], ['19:00', 'Noite de Glória']], 4 => [['19:30', 'Culto da Fé']]];
const NIB_DIAS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

$args = array_slice($argv, 1);
$enviar = in_array('--enviar', $args, true);
$tz = new DateTimeZone('America/Porto_Velho');
$hoje = new DateTimeImmutable('now', $tz);
foreach ($args as $a) if (preg_match('/^--dia=(\d{4}-\d{2}-\d{2})$/', $a, $m)) { if ($enviar) exit("Use --dia só para simular (sem --enviar).\n"); $hoje = new DateTimeImmutable($m[1] . ' 08:00', $tz); }
$dia = $hoje->format('Y-m-d'); $semana = (int)$hoje->format('w');

$hora = fn(string $h) => preg_match('/^(\d{1,2}):(\d{2})/', $h, $m) ? ((int)$m[1]) . 'h' . ($m[2] === '00' ? '' : $m[2]) : '';
$item = fn(string $nome, string $h) => $nome . ($hora($h) !== '' ? ' às ' . $hora($h) : '');

// 1. Para todos: cultos fixos do dia + eventos publicados no site que começam hoje. Cada item: [tipo, texto].
$geral = [];
foreach (NIB_LEMBRETE_FIXOS[$semana] ?? [] as [$h, $nome]) $geral[] = ['culto', $item($nome, $h), ''];
try {
  require $docroot . '/inscricoes/eventos-lib.php';
  foreach (nibe_catalog() as $e) {
    if (!is_array($e) || ($e['publication'] ?? '') !== 'publicado') continue;
    $ini = (string)($e['start'] ?? '');
    if (substr($ini, 0, 10) !== $dia) continue;
    $h = empty($e['time_unconfirmed']) && preg_match('/[T ](\d{2}:\d{2})/', $ini, $m) ? $m[1] : '';
    $geral[] = ['evento', $item((string)$e['name'], $h), (string)($e['location'] ?? '')];
  }
} catch (Throwable $e) { fwrite(STDERR, "Aviso: eventos do site indisponíveis ({$e->getMessage()}).\n"); }

// 2. Células do dia (horário e local vêm da lista do site guardada no app: site-data.js).
$celulas = [];
$js = (string)@file_get_contents(dirname(__DIR__) . '/site-data.js');
if (preg_match('/SNAPSHOT_CELULAS\s*=\s*(\[.*?\]);\s*\n/s', $js, $m)) {
  foreach ((array)json_decode($m[1], true) as $d) foreach ((array)($d['celulas'] ?? []) as $c) $celulas[($d['dia'] ?? '') . '|' . ($c['nome'] ?? '')] = $c;
}

// Mensagem de ação no fim (pedido de Hilton) e tela que abre ao tocar.
const NIB_ACAO = ['celula' => 'Convide alguém para ir com você!', 'culto' => 'Convide alguém e venha com a gente!', 'evento' => 'Toque para ver os detalhes. Te esperamos!'];
const NIB_TELA = ['celula' => 'celulas', 'culto' => 'agenda', 'evento' => 'eventos'];
function nib_lembrete_msg(array $itens): array {
  $tipos = array_unique(array_column($itens, 0));
  $principal = in_array('celula', $tipos, true) ? 'celula' : (in_array('evento', $tipos, true) ? 'evento' : 'culto');
  $acao = count($tipos) > 1 ? 'Convide alguém e venha com a gente!' : NIB_ACAO[$principal];
  if (count($itens) === 1) {
    [$tipo, $txt] = $itens[0];
    $partes = explode(' às ', $txt, 2);
    $quando = isset($partes[1]) ? 'Às ' . $partes[1] . '. ' : ''; // sem endereço (Hilton, 06/11/2026)
    $msg = ['title' => 'Hoje tem ' . $partes[0], 'body' => $quando . $acao];
  } else {
    $msg = ['title' => 'Hoje na Nova Igreja Batista', 'body' => implode(' · ', array_column($itens, 1)) . '. ' . $acao];
  }
  return $msg + ['url' => '/app/#' . NIB_TELA[$principal], 'tipo' => 'lembrete'];
}

// 3. Quem recebe: quem ativou notificações e deixou "lembretes" ligado.
$db = nib_db();
$pessoas = $db->query('SELECT DISTINCT p.id, p.celula FROM nib_pessoas p JOIN nib_push s ON s.pessoa_id = p.id WHERE s.lembretes = 1')->fetchAll();
$grupos = []; // mensagem => [ids]
foreach ($pessoas as $p) {
  $itens = $geral; $cel = (string)($p['celula'] ?? '');
  [$cDia, $cNome] = array_pad(explode('|', $cel, 2), 2, '');
  if ($cNome !== '' && $cDia === NIB_DIAS[$semana]) { $c = $celulas[$cel] ?? []; $itens[] = ['celula', $item('Célula ' . $cNome, (string)($c['horario'] ?? '')), (string)($c['local'] ?? '')]; }
  if (!$itens) continue; // nada hoje para esta pessoa: não envia
  $msg = nib_lembrete_msg($itens) + ['tag' => 'nib-lembrete-' . $dia];
  $grupos[json_encode($msg, JSON_UNESCAPED_UNICODE)][] = (int)$p['id'];
}

echo "Dia {$dia} (" . NIB_DIAS[$semana] . "): " . ($geral ? implode(' · ', array_column($geral, 1)) : 'sem culto ou evento geral') . "\n";
foreach ($grupos as $k => $ids) { $m = json_decode($k, true); echo '- ' . count($ids) . " pessoa(s): {$m['title']} | {$m['body']}\n"; }
if (!$grupos) { echo "NADA_HOJE\n"; exit(0); }
if (!$enviar) { echo "CONFERIDO (use --enviar para mandar)\n"; exit(0); }

// Uma vez por dia: a primeira execução reserva o dia; as seguintes não reenviam.
try { $db->prepare('INSERT INTO nib_lembretes_envio (dia, criado_em) VALUES (?, ?)')->execute([$dia, nib_agora()]); }
catch (PDOException $e) { echo "JA_ENVIADO_HOJE\n"; exit(0); }
$total = 0;
foreach ($grupos as $k => $ids) { $m = json_decode($k, true); $total += nib_push_enviar($ids, $m); }
$db->prepare('UPDATE nib_lembretes_envio SET enviados = ? WHERE dia = ?')->execute([$total, $dia]);
echo "ENVIADO: {$total} notificação(ões)\n";
