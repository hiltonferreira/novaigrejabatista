<?php
// Define o papel de uma pessoa no app (Terminal do cPanel):
//   php app-papel.php hiltoncrivelon@gmail.com admin
// Papéis: membro, secretaria, pastoral, admin. Admin e equipe veem os cadastros e confirmam membros.
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
define('NIB_APP_RUNTIME', true);
$_SERVER['DOCUMENT_ROOT'] = getenv('NIB_DOCROOT') ?: '/home/novaigre/public_html';
require $_SERVER['DOCUMENT_ROOT'] . '/app/api/conta-lib.php';
[$_, $email, $papel] = $argv + [null, '', ''];
if (!in_array($papel, ['membro', 'secretaria', 'pastoral', 'admin'], true)) { fwrite(STDERR, "Uso: php app-papel.php email papel\n"); exit(1); }
$q = nib_db()->prepare('UPDATE nib_pessoas SET papel = ?, atualizado_em = ? WHERE email = ?');
$q->execute([$papel, nib_agora(), mb_strtolower(trim($email))]);
if (!$q->rowCount()) { fwrite(STDERR, "Nenhum cadastro com este e-mail (ou já tinha esse papel).\n"); exit(1); }
nib_registrar(null, 'papel-' . $papel, null, $email);
echo "OK: $email agora é $papel\n";
