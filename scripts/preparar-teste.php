<?php
// Prepara o banco do ambiente de teste (teste.novaigrejabatista.com.br/app) com uma cópia do banco real (28/11/2026).
// Fica no servidor em ~/nib-manutencao/ferramentas/preparar-teste.php.
//
// O que faz:
//   1. Copia todas as tabelas do banco real (config.php) para o banco de teste (config-teste.php). Apaga o que havia no teste.
//   2. Protege as pessoas: no teste ninguém recebe notificação nem e-mail, e o canal do YouTube fica desconectado.
//      - apaga inscrições de notificação (nib_push), sessões, links de nova senha e contadores de tentativa;
//      - troca e-mail, celular, CPF e endereço de quem NÃO é da administração por dados fictícios;
//      - quem é da administração entra no teste com o mesmo e-mail e a mesma senha do app real;
//      - apaga as chaves do YouTube (yt_*), para nenhum vídeo de teste ir para o canal da igreja.
// O banco real só é lido. Recusa rodar se os dois arquivos apontarem para o mesmo banco.
//
// Uso, no Terminal do cPanel:
//   php ~/nib-manutencao/ferramentas/preparar-teste.php           -> só confere os dois acessos e mostra o que faria
//   php ~/nib-manutencao/ferramentas/preparar-teste.php --apply   -> copia e protege
//   php ~/nib-manutencao/ferramentas/preparar-teste.php --ficticio [--apply]
//        -> NÃO copia dados de membros: só a estrutura das tabelas, as contas da administração (nome, e-mail e senha,
//           para entrar no teste) e pessoas, pedidos, avisos e check-ins inventados. Recomendado (28/11/2026).
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
ini_set('display_errors', '1'); error_reporting(E_ALL);
if (!defined('NIB_APP_RUNTIME')) define('NIB_APP_RUNTIME', true);
$home = rtrim((string)(getenv('NIB_HOME') ?: getenv('HOME') ?: '/home/novaigre'), '/');
$apply = in_array('--apply', $argv, true);
$ficticio = in_array('--ficticio', $argv, true);
function falha(string $m): void { echo "INTERROMPIDO: $m\n"; exit(1); }
function conectar(array $c): PDO {
  return new PDO('mysql:host=' . $c['db_host'] . ';dbname=' . $c['db_name'] . ';charset=utf8mb4', $c['db_user'], $c['db_pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
}
$fReal = getenv('NIB_CONFIG_REAL') ?: "$home/nib-app-privado/config.php";
$fTeste = getenv('NIB_CONFIG_TESTE') ?: "$home/nib-app-privado/config-teste.php";
foreach ([$fReal, $fTeste] as $f) if (!is_file($f)) falha("não achei $f");
$cReal = require $fReal; $cTeste = require $fTeste;
if ($cReal['db_name'] === $cTeste['db_name'] && $cReal['db_host'] === $cTeste['db_host']) falha('config-teste.php aponta para o banco real. Use outro banco no teste.');
if (!preg_match('/test/i', (string)$cTeste['db_name'])) falha('o nome do banco de teste precisa conter "teste" (proteção contra engano).');
$real = conectar($cReal); $teste = conectar($cTeste);
$tabelas = $real->query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")->fetchAll(PDO::FETCH_NUM);
echo 'BANCO_REAL ' . $cReal['db_name'] . ' (' . count($tabelas) . " tabelas, só leitura)\n";
echo 'BANCO_TESTE ' . $cTeste['db_name'] . "\n";
foreach ($tabelas as [$t]) { $n = (int)$real->query('SELECT COUNT(*) FROM `' . str_replace('`', '``', $t) . '`')->fetchColumn(); echo "   $t: $n linhas\n"; }
echo $ficticio ? "MODO_FICTICIO: só estrutura, contas da administração e dados inventados\n" : "MODO_COPIA: cópia protegida de todas as linhas\n";
if (!$apply) { echo "MODO_CONFERENCIA: nada foi alterado. Para copiar: php preparar-teste.php --apply\n"; exit(0); }

$teste->exec('SET FOREIGN_KEY_CHECKS=0');
foreach ($teste->query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")->fetchAll(PDO::FETCH_NUM) as [$t]) $teste->exec('DROP TABLE `' . str_replace('`', '``', $t) . '`');
foreach ($tabelas as [$t]) {
  $q = '`' . str_replace('`', '``', $t) . '`';
  $teste->exec($real->query("SHOW CREATE TABLE $q")->fetch(PDO::FETCH_NUM)[1]);
  $cols = null; $ins = null; $n = 0;
  // No modo fictício só passam a versão do banco, os ajustes (local da igreja, QR do telão, chaves de notificação)
  // e as contas da administração; o resto da tabela fica vazio.
  $filtro = !$ficticio ? '' : ($t === 'nib_versao' || $t === 'nib_ajustes' ? '' : ($t === 'nib_pessoas' ? " WHERE papel = 'admin' OR CONCAT(',', papeis, ',') LIKE '%,admin,%'" : ' WHERE 1 = 0'));
  foreach ($real->query("SELECT * FROM $q$filtro") as $l) {
    if ($ins === null) { $cols = array_keys($l); $ins = $teste->prepare("INSERT INTO $q (`" . implode('`,`', $cols) . '`) VALUES (' . implode(',', array_fill(0, count($cols), '?')) . ')'); }
    $ins->execute(array_values($l)); $n++;
  }
  echo "COPIADA $t ($n linhas)\n";
}
$teste->exec('SET FOREIGN_KEY_CHECKS=1');
foreach (['nib_push', 'nib_sessoes', 'nib_redefinicoes', 'nib_tentativas'] as $t) if ($teste->query("SHOW TABLES LIKE '$t'")->fetch()) $teste->exec("DELETE FROM $t");
if ($teste->query("SHOW TABLES LIKE 'nib_ajustes'")->fetch()) $teste->exec("DELETE FROM nib_ajustes WHERE chave LIKE 'yt\\_%'");
$anon = $teste->exec("UPDATE nib_pessoas SET email = CONCAT('pessoa', id, '@teste.invalid'), celular = '69900000000', cpf = NULL, endereco = NULL
  WHERE papel <> 'admin' AND CONCAT(',', papeis, ',') NOT LIKE '%,admin,%'");
if ($ficticio) {
  $teste->exec('UPDATE nib_pessoas SET foto_em = 0'); // fotos não vêm para o teste
  $agora = date('Y-m-d H:i:s'); $senha = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);
  $nomes = [['Ana Beatriz Teste', 'f', 'membro', 'confirmado'], ['Bruno Teste', 'm', 'membro', 'confirmado'], ['Carla Teste', 'f', 'membro', 'pendente'], ['Daniel Teste', 'm', 'frequento', 'nao'],
    ['Elisa Teste', 'f', 'visitante', 'nao'], ['Felipe Teste', 'm', 'membro', 'confirmado'], ['Gabriela Teste', 'f', 'membro', 'confirmado'], ['Henrique Teste', 'm', 'frequento', 'nao']];
  $ins = $teste->prepare("INSERT INTO nib_pessoas (nome, email, celular, sexo, vinculo, membro_status, papel, papeis, nascimento, senha_hash, consentimento_em, consentimento_versao, criado_em, atualizado_em, celula) VALUES (?,?,?,?,?,?,'membro','',?,?,?,?,?,?,?)");
  $ids = [];
  foreach ($nomes as $i => [$nome, $sexo, $vinc, $st]) {
    $ins->execute([$nome, 'pessoa' . ($i + 1) . '@teste.invalid', '6990000000' . $i, $sexo, $vinc, $st, sprintf('19%02d-%02d-%02d', 70 + $i * 3, 1 + $i, 10 + $i), $senha, $agora, 'teste', $agora, $agora, $i % 2 ? 'Terça-feira|Casa de Israel' : null]);
    $ids[] = (int)$teste->lastInsertId();
  }
  $p = $teste->prepare('INSERT INTO nib_pedidos (pessoa_id, titulo, motivo, criado_em, atualizado_em) VALUES (?,?,?,?,?)');
  foreach ([['Saúde da família', 'Pela recuperação da minha mãe, que fará uma cirurgia.'], ['Emprego', 'Por uma nova oportunidade de trabalho.'], ['Gratidão', 'Pelo nascimento do meu sobrinho.']] as $k => [$t1, $t2]) $p->execute([$ids[$k], $t1, $t2, $agora, $agora]);
  $teste->prepare('INSERT INTO nib_avisos (titulo, texto, criado_em) VALUES (?,?,?)')->execute(['Aviso de teste', 'Este é o ambiente de teste do app. Nada aqui é real.', $agora]);
  $c = $teste->prepare("INSERT IGNORE INTO nib_checkins (pessoa_id, culto_dia, culto, via, criado_em) VALUES (?,?,?,'qr',?)");
  foreach (array_slice($ids, 0, 5) as $id) $c->execute([$id, date('Y-m-d', strtotime('last sunday')), 'Noite de Glória', $agora]);
  echo 'FICTICIO: ' . count($ids) . " pessoas, 3 pedidos, 1 aviso e 5 check-ins inventados (senha das contas inventadas é aleatória)\n";
}
echo "PROTEGIDO: notificações, sessões e YouTube desligados; $anon pessoas com contato fictício (administração mantida)\n";
echo "TESTE_OK https://teste.novaigrejabatista.com.br/app/\n";
