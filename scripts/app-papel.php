<?php
// Define o(s) perfil(is) de uma pessoa no app (Terminal do cPanel):
//   php app-papel.php hiltoncrivelon@gmail.com admin
//   php app-papel.php maria@exemplo.com secretaria,tesouraria
// Perfis: membro, secretaria, pastoral, tesouraria, admin. Pode ter mais de um, separados por vírgula.
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
define('NIB_APP_RUNTIME', true);
$_SERVER['DOCUMENT_ROOT'] = getenv('NIB_DOCROOT') ?: '/home/novaigre/public_html';
require $_SERVER['DOCUMENT_ROOT'] . '/app/api/conta-lib.php';
[$_, $email, $lista] = $argv + [null, '', ''];
$pedidos = array_filter(array_map('trim', explode(',', (string)$lista)));
$novos = array_values(array_intersect(NIB_PAPEIS, $pedidos));
if (count($novos) > 1) $novos = array_values(array_diff($novos, ['membro']));
if (!$novos || count($novos) !== count(array_unique(array_diff($pedidos, count($pedidos) > 1 ? ['membro'] : [])))) { fwrite(STDERR, "Uso: php app-papel.php email perfil[,perfil]\n"); exit(1); }
$q = nib_db()->prepare('UPDATE nib_pessoas SET papel = ?, papeis = ?, atualizado_em = ? WHERE email = ?');
$q->execute([$novos[0], implode(',', $novos), nib_agora(), mb_strtolower(trim($email))]);
if (!$q->rowCount()) { fwrite(STDERR, "Nenhum cadastro com este e-mail (ou já tinha esses perfis).\n"); exit(1); }
nib_registrar(null, 'papel-' . implode('+', $novos), null, $email);
echo "OK: $email agora é " . implode(' + ', $novos) . "\n";
