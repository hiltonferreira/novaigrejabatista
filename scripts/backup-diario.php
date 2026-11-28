<?php
// Backup automático diário do app e das inscrições (28/11/2026). Roda pelo Cron do cPanel, uma vez por dia.
// Fica no servidor em ~/nib-manutencao/ferramentas/backup-diario.php.
//
// O que faz:
//   1. Dump do banco do app (contas, check-ins, caderno, avisos, pílulas...) em
//      ~/nib-manutencao/backups/banco/diario/app-AAAAMMDD.sql.gz (feito pelo PHP, porque o PHP do servidor não chama o mysqldump).
//   2. Cópia dos dados das inscrições (~/nib-inscricoes-privado, arquivos JSON) em
//      ~/nib-manutencao/backups/inscricoes/diario/inscricoes-AAAAMMDD.tar.gz
//   3. Guarda os 14 dias mais recentes e, além deles, o do dia 1º de cada mês por 6 meses. Apaga só os mais antigos que isso.
//   4. Limpa sessões vencidas, links de nova senha velhos e contadores de tentativa antigos do app.
//   5. Escreve uma linha por dia em ~/nib-manutencao/backups/backup-diario.log.
//
// Uso, no Terminal do cPanel:
//   php ~/nib-manutencao/ferramentas/backup-diario.php           -> faz o backup agora e mostra o resultado
// Cron (cPanel > Cron Jobs), todo dia às 3h15 do horário do servidor:
//   15 3 * * * php /home/novaigre/nib-manutencao/ferramentas/backup-diario.php >/dev/null 2>&1
// Só roda pela linha de comando. Arquivos gravados com permissão 600 (só o dono lê).
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
ini_set('display_errors', '1'); error_reporting(E_ALL);
date_default_timezone_set('America/Porto_Velho');

$home = rtrim((string)(getenv('NIB_HOME') ?: getenv('HOME') ?: '/home/novaigre'), '/');
$man = "$home/nib-manutencao";
$dirBanco = "$man/backups/banco/diario";
$dirInsc = "$man/backups/inscricoes/diario";
$log = "$man/backups/backup-diario.log";
$hoje = date('Ymd');
$resumo = [];
$falhou = false;

function registrar(string $log, string $linha): void { echo $linha . "\n"; @file_put_contents($log, date('Y-m-d H:i:s') . ' ' . $linha . "\n", FILE_APPEND); }
foreach ([$dirBanco, $dirInsc] as $d) if (!is_dir($d) && !mkdir($d, 0700, true)) { registrar($log, "ERRO não criei $d"); exit(1); }

// 1. Banco do app
try {
  if (!defined('NIB_APP_RUNTIME')) define('NIB_APP_RUNTIME', true);
  $config = getenv('NIB_APP_CONFIG') ?: "$home/nib-app-privado/config.php";
  if (!is_file($config)) throw new RuntimeException("não achei $config");
  $c = require $config;
  $db = new PDO('mysql:host=' . $c['db_host'] . ';dbname=' . $c['db_name'] . ';charset=utf8mb4', $c['db_user'], $c['db_pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
  $db->exec('SET NAMES utf8mb4'); $db->exec('START TRANSACTION WITH CONSISTENT SNAPSHOT');
  $destino = "$dirBanco/app-$hoje.sql.gz"; $tmp = "$destino.parcial";
  $gz = gzopen($tmp, 'wb9'); if (!$gz) throw new RuntimeException('não abri o arquivo do dump');
  gzwrite($gz, '-- Dump diário NIB, ' . date('c') . "\nSET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS=0;\n");
  $tabelas = 0; $linhas = 0;
  foreach ($db->query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")->fetchAll(PDO::FETCH_NUM) as $t) {
    $t = $t[0]; $tabelas++; $q = '`' . str_replace('`', '``', $t) . '`';
    $cr = $db->query("SHOW CREATE TABLE $q")->fetch(PDO::FETCH_NUM);
    gzwrite($gz, "\nDROP TABLE IF EXISTS $q;\n" . $cr[1] . ";\n");
    // Colunas binárias (fotos de perfil, capas das pílulas) vão em hexadecimal, para voltarem iguais na restauração.
    $bin = array_map(fn($col) => (bool)preg_match('/blob|binary/i', (string)$col['Type']), $db->query("SHOW COLUMNS FROM $q")->fetchAll(PDO::FETCH_ASSOC));
    foreach ($db->query("SELECT * FROM $q", PDO::FETCH_NUM) as $l) {
      $v = []; foreach ($l as $k => $x) $v[] = $x === null ? 'NULL' : (!empty($bin[$k]) ? ($x === '' ? "''" : '0x' . bin2hex((string)$x)) : $db->quote((string)$x));
      gzwrite($gz, "INSERT INTO $q VALUES (" . implode(',', $v) . ");\n"); $linhas++;
    }
  }
  gzwrite($gz, "SET FOREIGN_KEY_CHECKS=1;\n-- Dump completed\n"); gzclose($gz); $db->exec('COMMIT');
  $fim = ''; $h = gzopen($tmp, 'rb'); while (!gzeof($h)) { $fim = substr($fim . gzread($h, 65536), -200); } gzclose($h);
  if (strpos($fim, '-- Dump completed') === false) throw new RuntimeException('o dump não terminou');
  rename($tmp, $destino); chmod($destino, 0600);
  $resumo[] = sprintf('banco OK %d tabelas %d linhas %d KB', $tabelas, $linhas, intdiv(filesize($destino), 1024));
} catch (Throwable $e) {
  if (isset($tmp) && is_file($tmp)) @unlink($tmp);
  $resumo[] = 'banco ERRO ' . $e->getMessage(); $falhou = true;
}

// 2. Dados das inscrições (JSON fora do site)
try {
  $origem = "$home/nib-inscricoes-privado";
  if (!is_dir($origem)) throw new RuntimeException("não achei $origem");
  $tar = "$dirInsc/inscricoes-$hoje.tar";
  foreach ([$tar, "$tar.gz"] as $f) if (is_file($f)) unlink($f);
  $p = new PharData($tar);
  $p->buildFromDirectory($origem);
  $n = $p->count();
  if ($n === 0) { unset($p); @unlink($tar); throw new RuntimeException('a pasta das inscrições está vazia'); }
  $p->compress(Phar::GZ); unset($p); @unlink($tar);
  chmod("$tar.gz", 0600);
  $resumo[] = sprintf('inscricoes OK %d arquivos %d KB', $n, intdiv(filesize("$tar.gz"), 1024));
} catch (Throwable $e) {
  $resumo[] = 'inscricoes ERRO ' . $e->getMessage(); $falhou = true;
}

// 3. Retenção: 14 dias mais recentes + dia 1º de cada mês por 6 meses
$apagados = 0;
foreach ([[$dirBanco, '/^app-(\d{8})\.sql\.gz$/'], [$dirInsc, '/^inscricoes-(\d{8})\.tar\.gz$/']] as [$dir, $re]) {
  $arqs = [];
  foreach (scandir($dir) ?: [] as $f) if (preg_match($re, $f, $m)) $arqs[$m[1]] = "$dir/$f";
  krsort($arqs); $i = 0; $seisMeses = date('Ymd', strtotime('-6 months'));
  foreach ($arqs as $dia => $f) {
    $i++;
    if ($i <= 14) continue;
    if (substr((string)$dia, 6, 2) === '01' && (string)$dia >= $seisMeses) continue;
    if (@unlink($f)) $apagados++;
  }
}
$resumo[] = "retencao $apagados antigos apagados";

// 4. Limpeza de vencidos no banco do app
try {
  $lib = "$home/public_html/app/api/conta-lib.php";
  if (is_file($lib)) {
    if (empty($_SERVER['DOCUMENT_ROOT'])) $_SERVER['DOCUMENT_ROOT'] = "$home/public_html";
    require_once $lib;
    if (function_exists('nib_limpar_vencidos')) { $l = nib_limpar_vencidos(nib_db()); $resumo[] = sprintf('limpeza %d sessoes %d links %d tentativas', $l['sessoes'], $l['redefinicoes'], $l['tentativas']); }
  }
} catch (Throwable $e) { $resumo[] = 'limpeza ERRO ' . $e->getMessage(); }

registrar($log, ($falhou ? 'FALHA ' : 'OK ') . implode(' | ', $resumo));
exit($falhou ? 1 : 0);
