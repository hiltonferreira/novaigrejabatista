<?php
// Coloca as chaves do projeto Google (Pílulas de Sabedoria) na configuração privada do app, sem passar pelo chat nem pelo GitHub.
// Uso, no Terminal do cPanel:
//   php app-youtube-chaves.php /home/novaigre/nib-app-privado/client_secret_XXXX.json            -> só confere
//   php app-youtube-chaves.php /home/novaigre/nib-app-privado/client_secret_XXXX.json --apply    -> grava (com backup) e apaga o JSON
// O JSON é o arquivo baixado em Google Cloud > Google Auth Platform > Clientes > Baixar JSON.
declare(strict_types=1);
// Só pela linha de comando (no cPanel o "php" do Terminal pode ser CGI, por isso não exige PHP_SAPI === 'cli').
if (isset($_SERVER['REQUEST_METHOD'])) { http_response_code(404); exit; }
if (PHP_SAPI !== 'cli') { header_remove(); ini_set('html_errors', '0'); }
$argv = $argv ?? ($_SERVER['argv'] ?? []);
echo "Script das chaves do YouTube (PHP " . PHP_VERSION . ', ' . PHP_SAPI . ")\n";

const RETORNO = 'https://novaigrejabatista.com.br/app/api/youtube.php?retorno=1';
$json = $argv[1] ?? ''; $apply = in_array('--apply', $argv, true);
$config = getenv('NIB_APP_CONFIG') ?: '/home/novaigre/nib-app-privado/config.php';
function falha(string $m): never { echo "ERRO: $m\n"; exit(1); }

if ($json === '' || !is_file($json)) falha('informe o caminho do JSON baixado do Google.');
if (!is_file($config)) falha("configuração não encontrada em $config");
$d = json_decode((string)file_get_contents($json), true);
$w = is_array($d) ? ($d['web'] ?? null) : null;
if (!is_array($w)) falha('o JSON não é de um cliente "Aplicativo da Web".');
$id = (string)($w['client_id'] ?? ''); $seg = (string)($w['client_secret'] ?? '');
if (!preg_match('/^[\w.-]+\.apps\.googleusercontent\.com$/', $id) || strlen($seg) < 10) falha('ID do cliente ou chave secreta inválidos no JSON.');
$uris = (array)($w['redirect_uris'] ?? []);
if (!in_array(RETORNO, $uris, true)) falha('o cliente não tem o URI de redirecionamento ' . RETORNO . ' (cadastrado: ' . implode(', ', $uris) . ').');

$atual = require $config; if (!is_array($atual)) falha('configuração atual inválida.');
$src = (string)file_get_contents($config);
// Tira linhas antigas das chaves do YouTube (se for a segunda vez) e acrescenta as novas logo depois do "return [".
$src2 = preg_replace("/^[ \t]*'youtube_client_(id|secret)'\s*=>.*\R/m", '', $src) ?? $src;
$src2 = preg_replace("/'youtube_client_(id|secret)'\s*=>\s*'[^']*'\s*,\s*/", '', $src2) ?? $src2;
$linhas = "\n  'youtube_client_id' => " . var_export($id, true) . ",\n  'youtube_client_secret' => " . var_export($seg, true) . ",\n";
$n = 0; $src2 = preg_replace('/return\s*(\[|array\s*\()/', '$0' . str_replace(['\\', '$'], ['\\\\', '\\$'], $linhas), $src2, 1, $n);
if ($n !== 1) falha('não encontrei "return [" na configuração; edite à mão.');

// Confere a versão nova antes de trocar: sintaxe e todos os valores antigos iguais.
$tmp = $config . '.novo-' . bin2hex(random_bytes(4));
file_put_contents($tmp, $src2); @chmod($tmp, fileperms($config) & 0777);
exec('php -l ' . escapeshellarg($tmp) . ' 2>&1', $out, $rc);
if ($rc !== 0) { unlink($tmp); falha('a nova configuração teria erro de sintaxe: ' . implode(' ', $out)); }
$novo = (static fn($f) => require $f)($tmp);
foreach ($atual as $k => $v) if (!str_starts_with((string)$k, 'youtube_client_') && ($novo[$k] ?? null) !== $v) { unlink($tmp); falha("a chave $k mudaria; nada foi alterado."); }
if (($novo['youtube_client_id'] ?? '') !== $id || ($novo['youtube_client_secret'] ?? '') !== $seg) { unlink($tmp); falha('as chaves novas não ficaram corretas.'); }

echo 'CONFERIDO: cliente ' . substr($id, 0, 12) . ' (chave secreta com ' . strlen($seg) . " caracteres), URI de retorno correto.\n";
if (!$apply) { unlink($tmp); echo "Nada foi alterado. Rode de novo com --apply para gravar.\n"; exit(0); }
$bak = $config . '.antes-youtube-' . date('Ymd-His');
if (!copy($config, $bak)) { unlink($tmp); falha('não consegui criar o backup.'); }
@chmod($bak, 0600);
if (!rename($tmp, $config)) { unlink($tmp); falha('não consegui gravar a configuração.'); }
unlink($json);
echo "APLICADO. Backup da configuração anterior: $bak\nO JSON com a chave foi apagado. Agora conecte o canal pelo botão no app (Pílulas de Sabedoria).\n";
