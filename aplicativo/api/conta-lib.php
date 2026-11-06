<?php
// Contas reais do app (/app): banco, sessão, limites de tentativa e e-mail.
// Configuração privada fora do site: /home/novaigre/nib-app-privado/config.php (nunca no Git).
declare(strict_types=1);
if (!defined('NIB_APP_RUNTIME')) { http_response_code(404); exit; }

const NIB_POLITICA = '2026-11-06';
const NIB_SESSAO_DIAS = 30;
const NIB_COOKIE = 'nib_sessao';

function nib_config(): array {
  static $c = null; if ($c !== null) return $c;
  $path = getenv('NIB_APP_CONFIG') ?: dirname((string)realpath($_SERVER['DOCUMENT_ROOT'] ?? '')) . '/nib-app-privado/config.php';
  if (!is_file($path)) throw new RuntimeException('Configuração indisponível.');
  $c = require $path; if (!is_array($c)) throw new RuntimeException('Configuração inválida.');
  return $c;
}
function nib_db(): PDO {
  static $db = null; if ($db) return $db;
  $c = nib_config();
  $db = new PDO('mysql:host=' . $c['db_host'] . ';dbname=' . $c['db_name'] . ';charset=utf8mb4', $c['db_user'], $c['db_pass'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
  $db->exec("SET time_zone = '-04:00'");
  nib_migrar($db);
  return $db;
}
// Cria as tabelas na primeira vez (e só acrescenta o que faltar nas próximas versões).
const NIB_MIGRACAO = 5;
function nib_migrar(PDO $db): void {
  $db->exec("CREATE TABLE IF NOT EXISTS nib_versao (v INT NOT NULL) ENGINE=InnoDB");
  $v = (int)($db->query('SELECT MAX(v) FROM nib_versao')->fetchColumn() ?: 0);
  if ($v >= NIB_MIGRACAO) return; // ao criar a v6, subir NIB_MIGRACAO
  // Uma migração por vez: pedidos simultâneos esperam a primeira terminar (evita versões repetidas).
  if ((int)$db->query("SELECT GET_LOCK('nib_migrar', 15)")->fetchColumn() !== 1) throw new RuntimeException('migração em andamento por outro pedido');
  try { nib_migrar_passos($db, (int)($db->query('SELECT MAX(v) FROM nib_versao')->fetchColumn() ?: 0)); }
  finally { $db->query("SELECT RELEASE_LOCK('nib_migrar')"); }
}

function nib_migrar_passos(PDO $db, int $v): void {
  if ($v < 1) nib_migrar_v1($db);
  if ($v < 2) {
    // v2: célula escolhida no cadastro ("Dia|Nome", da lista de células do site).
    $tem = $db->query("SHOW COLUMNS FROM nib_pessoas LIKE 'celula'")->fetch();
    if (!$tem) $db->exec('ALTER TABLE nib_pessoas ADD COLUMN celula VARCHAR(160) NULL AFTER vinculo');
    $db->exec('INSERT INTO nib_versao (v) VALUES (2)');
  }
  if ($v < 3) {
    // v3: Caderno de oração (pedidos publicados por quem tem conta; "Vou orar" por pessoa).
    $db->exec("CREATE TABLE IF NOT EXISTS nib_pedidos (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, pessoa_id INT UNSIGNED NOT NULL, titulo VARCHAR(120) NOT NULL, motivo VARCHAR(1000) NOT NULL,
      atendido TINYINT(1) NOT NULL DEFAULT 0, removido_por INT UNSIGNED NULL, criado_em DATETIME NOT NULL, atualizado_em DATETIME NOT NULL,
      KEY ix_criado (criado_em), CONSTRAINT fk_pedido_pessoa FOREIGN KEY (pessoa_id) REFERENCES nib_pessoas(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $db->exec("CREATE TABLE IF NOT EXISTS nib_orando (
      pedido_id INT UNSIGNED NOT NULL, pessoa_id INT UNSIGNED NOT NULL, criado_em DATETIME NOT NULL, PRIMARY KEY (pedido_id, pessoa_id),
      CONSTRAINT fk_orando_pedido FOREIGN KEY (pedido_id) REFERENCES nib_pedidos(id) ON DELETE CASCADE,
      CONSTRAINT fk_orando_pessoa FOREIGN KEY (pessoa_id) REFERENCES nib_pessoas(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $db->exec('INSERT INTO nib_versao (v) VALUES (3)');
  }
  if ($v < 4) {
    // v4: notificações no celular (inscrições Web Push) e ajustes internos (chave VAPID criada sozinha).
    $db->exec("CREATE TABLE IF NOT EXISTS nib_ajustes (chave VARCHAR(40) PRIMARY KEY, valor TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $db->exec("CREATE TABLE IF NOT EXISTS nib_push (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, pessoa_id INT UNSIGNED NOT NULL, endpoint VARCHAR(700) NOT NULL, endpoint_hash CHAR(64) NOT NULL,
      p256dh VARCHAR(120) NOT NULL, auth VARCHAR(40) NOT NULL, caderno TINYINT(1) NOT NULL DEFAULT 0, aparelho VARCHAR(120) NOT NULL DEFAULT '', criado_em DATETIME NOT NULL,
      UNIQUE KEY uq_endpoint (endpoint_hash), KEY ix_pessoa (pessoa_id),
      CONSTRAINT fk_push_pessoa FOREIGN KEY (pessoa_id) REFERENCES nib_pessoas(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $db->exec('INSERT INTO nib_versao (v) VALUES (4)');
  }
  if ($v < 5) {
    // v5: avisos da igreja publicados pela Secretaria/Pastoral, visíveis para toda a igreja no app.
    $db->exec("CREATE TABLE IF NOT EXISTS nib_avisos (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, titulo VARCHAR(120) NOT NULL, texto TEXT NOT NULL, link VARCHAR(300) NOT NULL DEFAULT '',
      fixado TINYINT(1) NOT NULL DEFAULT 0, ate DATE NULL, criado_por INT UNSIGNED NULL, criado_em DATETIME NOT NULL, removido_por INT UNSIGNED NULL, removido_em DATETIME NULL,
      KEY ix_criado (criado_em)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $db->exec('INSERT INTO nib_versao (v) VALUES (5)');
  }
}

function nib_migrar_v1(PDO $db): void {
  $db->exec("CREATE TABLE IF NOT EXISTS nib_pessoas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    celular VARCHAR(13) NOT NULL,
    sexo CHAR(1) NOT NULL DEFAULT 'f',
    vinculo VARCHAR(12) NOT NULL DEFAULT 'visitante',
    membro_status VARCHAR(12) NOT NULL DEFAULT 'pendente',
    papel VARCHAR(16) NOT NULL DEFAULT 'membro',
    nascimento DATE NULL,
    endereco VARCHAR(250) NULL,
    mostrar_aniversario TINYINT(1) NOT NULL DEFAULT 1,
    senha_hash VARCHAR(255) NOT NULL,
    consentimento_em DATETIME NOT NULL,
    consentimento_versao VARCHAR(20) NOT NULL,
    criado_em DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    ultimo_acesso DATETIME NULL,
    confirmado_por INT UNSIGNED NULL,
    confirmado_em DATETIME NULL,
    UNIQUE KEY uq_email (email), KEY ix_celular (celular)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  $db->exec("CREATE TABLE IF NOT EXISTS nib_sessoes (
    id_hash CHAR(64) NOT NULL PRIMARY KEY, pessoa_id INT UNSIGNED NOT NULL,
    criado_em DATETIME NOT NULL, expira_em DATETIME NOT NULL, aparelho VARCHAR(160) NOT NULL DEFAULT '',
    KEY ix_pessoa (pessoa_id), CONSTRAINT fk_sessao_pessoa FOREIGN KEY (pessoa_id) REFERENCES nib_pessoas(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  $db->exec("CREATE TABLE IF NOT EXISTS nib_redefinicoes (
    token_hash CHAR(64) NOT NULL PRIMARY KEY, pessoa_id INT UNSIGNED NOT NULL,
    expira_em DATETIME NOT NULL, usado_em DATETIME NULL,
    KEY ix_pessoa (pessoa_id), CONSTRAINT fk_redef_pessoa FOREIGN KEY (pessoa_id) REFERENCES nib_pessoas(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  $db->exec("CREATE TABLE IF NOT EXISTS nib_tentativas (
    chave CHAR(64) NOT NULL PRIMARY KEY, contador INT UNSIGNED NOT NULL, desde BIGINT NOT NULL
  ) ENGINE=InnoDB");
  $db->exec("CREATE TABLE IF NOT EXISTS nib_registro (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, pessoa_id INT UNSIGNED NULL, acao VARCHAR(40) NOT NULL,
    alvo_id INT UNSIGNED NULL, detalhes VARCHAR(250) NOT NULL DEFAULT '', criado_em DATETIME NOT NULL, KEY ix_acao (acao)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  $db->exec('INSERT INTO nib_versao (v) VALUES (1)');
}

function nib_agora(): string { return (new DateTimeImmutable('now', new DateTimeZone('America/Porto_Velho')))->format('Y-m-d H:i:s'); }
function nib_em(string $mod): string { return (new DateTimeImmutable('now', new DateTimeZone('America/Porto_Velho')))->modify($mod)->format('Y-m-d H:i:s'); }
function nib_texto($v, int $max = 200): string { if (!is_string($v)) return ''; $v = trim(preg_replace('/\s+/u', ' ', $v) ?? ''); return mb_substr($v, 0, $max, 'UTF-8'); }
function nib_digitos($v, int $max = 13): string { return substr(preg_replace('/\D/', '', is_string($v) ? $v : '') ?? '', 0, $max); }
function nib_email($v): string { $e = mb_strtolower(nib_texto($v, 160), 'UTF-8'); return filter_var($e, FILTER_VALIDATE_EMAIL) ? $e : ''; }
function nib_senha_ok(string $s): bool {
  return strlen($s) >= 8 && strlen($s) <= 200 && preg_match('/\p{Lu}/u', $s) && preg_match('/\p{Ll}/u', $s) && preg_match('/\d/', $s) && preg_match('/[^\p{L}\d\s]/u', $s);
}

function nib_json(int $status, array $body): never {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
function nib_erro(string $msg, int $status = 400): never { nib_json($status, ['ok' => false, 'erro' => $msg]); }

// Pedidos que mudam dados só valem do próprio app (cabeçalho próprio + mesma origem).
function nib_conferir_origem(): void {
  if (($_SERVER['HTTP_X_NIB'] ?? '') !== '1') nib_erro('Pedido inválido.', 403);
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if ($origin !== '') {
    $host = parse_url($origin, PHP_URL_HOST);
    if (!$host || strcasecmp($host, (string)parse_url('http://' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST)) !== 0) nib_erro('Pedido inválido.', 403);
  }
}
function nib_corpo(): array {
  $raw = file_get_contents('php://input', false, null, 0, 20000);
  $d = json_decode((string)$raw, true);
  return is_array($d) ? $d : [];
}
function nib_ip(): string { return (string)($_SERVER['REMOTE_ADDR'] ?? 'desconhecido'); }

// Limite de tentativas: no máximo $max em $janela segundos para a mesma chave.
function nib_limite(string $tipo, string $quem, int $max, int $janela): void {
  $db = nib_db(); $k = hash('sha256', $tipo . '|' . $quem . '|' . nib_config()['app_secret']);
  $db->beginTransaction();
  $r = $db->prepare('SELECT contador, desde FROM nib_tentativas WHERE chave = ? FOR UPDATE'); $r->execute([$k]); $row = $r->fetch();
  $agora = time();
  if (!$row || $agora - (int)$row['desde'] > $janela) {
    $db->prepare('REPLACE INTO nib_tentativas (chave, contador, desde) VALUES (?, 1, ?)')->execute([$k, $agora]);
    $db->commit(); return;
  }
  if ((int)$row['contador'] >= $max) { $db->commit(); nib_erro('Muitas tentativas. Aguarde alguns minutos e tente de novo.', 429); }
  $db->prepare('UPDATE nib_tentativas SET contador = contador + 1 WHERE chave = ?')->execute([$k]);
  $db->commit();
}

function nib_registrar(?int $pessoa, string $acao, ?int $alvo = null, string $detalhes = ''): void {
  nib_db()->prepare('INSERT INTO nib_registro (pessoa_id, acao, alvo_id, detalhes, criado_em) VALUES (?, ?, ?, ?, ?)')->execute([$pessoa, $acao, $alvo, mb_substr($detalhes, 0, 250), nib_agora()]);
}

// Sessão: cookie aleatório; o banco guarda só o hash.
function nib_cookie(string $valor, int $expira): void {
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
  setcookie(NIB_COOKIE, $valor, ['expires' => $expira, 'path' => '/app/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Lax']);
}
function nib_abrir_sessao(int $pessoa): void {
  $tok = bin2hex(random_bytes(32));
  nib_db()->prepare('INSERT INTO nib_sessoes (id_hash, pessoa_id, criado_em, expira_em, aparelho) VALUES (?, ?, ?, ?, ?)')
    ->execute([hash('sha256', $tok), $pessoa, nib_agora(), nib_em('+' . NIB_SESSAO_DIAS . ' days'), mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 160)]);
  nib_db()->prepare('UPDATE nib_pessoas SET ultimo_acesso = ? WHERE id = ?')->execute([nib_agora(), $pessoa]);
  nib_cookie($tok, time() + NIB_SESSAO_DIAS * 86400);
}
function nib_pessoa_logada(): ?array {
  $tok = $_COOKIE[NIB_COOKIE] ?? '';
  if (!is_string($tok) || !preg_match('/^[a-f0-9]{64}$/', $tok)) return null;
  $q = nib_db()->prepare('SELECT p.* FROM nib_sessoes s JOIN nib_pessoas p ON p.id = s.pessoa_id WHERE s.id_hash = ? AND s.expira_em > ?');
  $q->execute([hash('sha256', $tok), nib_agora()]);
  return $q->fetch() ?: null;
}
function nib_fechar_sessao(): void {
  $tok = $_COOKIE[NIB_COOKIE] ?? '';
  if (is_string($tok) && preg_match('/^[a-f0-9]{64}$/', $tok)) nib_db()->prepare('DELETE FROM nib_sessoes WHERE id_hash = ?')->execute([hash('sha256', $tok)]);
  nib_cookie('', time() - 3600);
}
function nib_publico(array $p): array {
  $nome = nib_nome_proprio((string)$p['nome']);
  return ['id' => (int)$p['id'], 'nome' => $nome, 'primeiro' => explode(' ', $nome)[0], 'email' => $p['email'], 'celular' => $p['celular'],
    'sexo' => $p['sexo'], 'vinculo' => $p['vinculo'], 'celula' => $p['celula'] ?? '', 'membro_status' => $p['membro_status'], 'papel' => $p['papel'],
    'nascimento' => $p['nascimento'], 'endereco' => $p['endereco'] ?? '', 'mostrar_aniversario' => (bool)$p['mostrar_aniversario'], 'criado_em' => $p['criado_em']];
}
// Nome próprio: "maria DA silva" -> "Maria da Silva" (partículas em minúsculas, exceto no começo).
function nib_nome_proprio(string $n): string {
  $partes = preg_split('/\s+/u', trim($n), -1, PREG_SPLIT_NO_EMPTY);
  foreach ($partes as $i => $w) {
    $w = mb_strtolower($w, 'UTF-8');
    $partes[$i] = ($i > 0 && in_array($w, ['da', 'das', 'de', 'do', 'dos', 'e', "d'"], true)) ? $w
      : implode('-', array_map(fn($x) => mb_strtoupper(mb_substr($x, 0, 1, 'UTF-8'), 'UTF-8') . mb_substr($x, 1, null, 'UTF-8'), explode('-', $w)));
  }
  return implode(' ', $partes);
}
function nib_celula($v): string {
  $t = nib_texto(is_string($v) ? $v : '', 160);
  return preg_match('/^[^|]{3,40}\|[^|]{2,100}$/u', $t) ? $t : '';
}
// Só serviços de push conhecidos (Google, Mozilla, Apple, Microsoft); evita o servidor chamar endereços quaisquer.
function nib_push_endpoint_ok(string $u): bool {
  if (getenv('NIB_PUSH_TESTE') && str_starts_with($u, 'http://127.0.0.1:')) return true;
  $p = parse_url($u); if (!$p || ($p['scheme'] ?? '') !== 'https' || empty($p['host'])) return false;
  return (bool)preg_match('/(^|\.)(fcm\.googleapis\.com|android\.googleapis\.com|push\.services\.mozilla\.com|push\.apple\.com|notify\.windows\.com)$/', $p['host']);
}
function nib_equipe(array $p): bool { return in_array($p['papel'], ['secretaria', 'pastoral', 'admin'], true); }

function nib_enviar_email(string $para, string $assunto, string $texto): bool {
  $c = nib_config();
  $from = $c['mail_from'] ?? 'nao-responda@novaigrejabatista.com.br';
  $nome = mb_encode_mimeheader($c['mail_from_name'] ?? 'Nova Igreja Batista', 'UTF-8');
  $h = "From: $nome <$from>\r\nReply-To: " . ($c['mail_reply_to'] ?? $from) . "\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit";
  if (getenv('NIB_APP_MAIL_LOG')) { file_put_contents((string)getenv('NIB_APP_MAIL_LOG'), "Para: $para\nAssunto: $assunto\n$texto\n---\n", FILE_APPEND); return true; }
  return mail($para, mb_encode_mimeheader($assunto, 'UTF-8'), $texto, $h, '-f' . $from);
}
