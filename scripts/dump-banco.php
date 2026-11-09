<?php
// Dump do banco do app para backup (09/11/2026), sem expor a senha.
// Lê o acesso de ~/nib-app-privado/config.php, o mesmo arquivo que o app usa, e passa para o mysqldump
// por um arquivo temporário com permissão 600, que é apagado no fim. A senha não aparece na tela nem no comando.
// Confere o resultado: código de saída, gzip -t e fim do dump ("Dump completed").
// Uso, no Terminal do cPanel:
//   php dump-banco.php /home/novaigre/nib-manutencao/backup-completo-20261109/novaigre_app.sql.gz
declare(strict_types=1);
if (isset($_SERVER['REQUEST_METHOD'])) { http_response_code(404); exit; }
$argv = $argv ?? ($_SERVER['argv'] ?? []);
$destino = (string)($argv[1] ?? '');
$config = getenv('NIB_APP_CONFIG') ?: getenv('HOME') . '/nib-app-privado/config.php';
function falha(string $m): never { echo "ERRO: $m\n"; exit(1); }
if ($destino === '' || !str_ends_with($destino, '.sql.gz')) falha('informe o arquivo de destino terminado em .sql.gz');
if (!is_dir(dirname($destino))) falha('a pasta do destino não existe');
if (!is_file($config)) falha("não achei $config");
$c = require $config;
foreach (['db_host', 'db_name', 'db_user', 'db_pass'] as $k) if (!is_array($c) || !isset($c[$k]) || $c[$k] === '') falha("config sem $k");
if (trim((string)shell_exec('command -v mysqldump')) === '') falha('mysqldump não encontrado');

$q = fn($v) => '"' . addcslashes((string)$v, "\\\"") . '"';
$cnf = tempnam(getenv('HOME') . '/nib-manutencao', '.dump-');
if ($cnf === false) falha('não criei o arquivo temporário');
chmod($cnf, 0600);
file_put_contents($cnf, "[client]\nhost=" . $q($c['db_host']) . "\nuser=" . $q($c['db_user']) . "\npassword=" . $q($c['db_pass']) . "\n");
$erros = $cnf . '.err';
$cmd = 'set -o pipefail; mysqldump --defaults-extra-file=' . escapeshellarg($cnf)
  . ' --single-transaction --quick --routines --triggers --no-tablespaces --default-character-set=utf8mb4 '
  . escapeshellarg((string)$c['db_name']) . ' 2>' . escapeshellarg($erros) . ' | gzip -9 > ' . escapeshellarg($destino);
exec('bash -c ' . escapeshellarg($cmd), $out, $cod);
$msg = is_file($erros) ? trim((string)file_get_contents($erros)) : '';
@unlink($cnf); @unlink($erros);
if ($cod !== 0) { @unlink($destino); falha("mysqldump saiu com código $cod" . ($msg !== '' ? ": $msg" : '')); }
chmod($destino, 0600);
exec('gzip -t ' . escapeshellarg($destino), $o2, $cod2);
if ($cod2 !== 0) falha('gzip -t falhou');
$fim = (string)shell_exec('gzip -dc ' . escapeshellarg($destino) . ' | tail -c 300');
if (!str_contains($fim, 'Dump completed')) falha('o dump não terminou (sem "Dump completed")');
$tabelas = (int)trim((string)shell_exec('gzip -dc ' . escapeshellarg($destino) . ' | grep -c "^CREATE TABLE"'));
printf("OK: %s (%d KB, %d tabelas)%s\n", $destino, intdiv(filesize($destino), 1024), $tabelas, $msg !== '' ? "\nAviso do mysqldump: $msg" : '');
