#!/usr/bin/env bash
# Testes do servidor do app (PHP + MySQL/MariaDB), sem tocar na produção.
# Uso, na raiz do repositório:  bash testes/app-api/rodar.sh
# Precisa de: php (com pdo_mysql e curl) e um MySQL/MariaDB local com um banco vazio de teste.
# Variáveis (com padrão): NIB_TESTE_DB_HOST=127.0.0.1 NIB_TESTE_DB_NAME=nib_teste NIB_TESTE_DB_USER=nib NIB_TESTE_DB_PASS=nib
# ATENÇÃO: o banco de teste é APAGADO no começo. Nunca aponte para o banco real.
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
TMP="$(mktemp -d)"; trap 'kill $(jobs -p) 2>/dev/null || true; rm -rf "$TMP"' EXIT
mkdir -p "$TMP/www" "$TMP/privado"
ln -s "$RAIZ/aplicativo" "$TMP/www/app"
cat > "$TMP/privado/config.php" <<PHP
<?php return ['db_host' => '${NIB_TESTE_DB_HOST:-127.0.0.1}', 'db_name' => '${NIB_TESTE_DB_NAME:-nib_teste}', 'db_user' => '${NIB_TESTE_DB_USER:-nib}', 'db_pass' => '${NIB_TESTE_DB_PASS:-nib}', 'app_secret' => 'segredo-de-teste'];
PHP
NIB_TESTE_DB_NAME="${NIB_TESTE_DB_NAME:-nib_teste}"
case "$NIB_TESTE_DB_NAME" in *teste*|*test*) ;; *) echo "Recusado: o nome do banco precisa conter 'teste'."; exit 1;; esac
php -r '$c = require $argv[1]; $db = new PDO("mysql:host=".$c["db_host"].";dbname=".$c["db_name"], $c["db_user"], $c["db_pass"]); $db->exec("SET FOREIGN_KEY_CHECKS=0"); foreach ($db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN) as $t) $db->exec("DROP TABLE `$t`");' "$TMP/privado/config.php"
PORTA="${NIB_TESTE_PORTA:-8765}"
NIB_APP_CONFIG="$TMP/privado/config.php" NIB_APP_MAIL_LOG="$TMP/emails.txt" php -S 127.0.0.1:$PORTA -t "$TMP/www" >"$TMP/servidor.log" 2>&1 &
for i in $(seq 1 50); do curl -s -o /dev/null "http://127.0.0.1:$PORTA/app/index.html" && break; sleep 0.1; done
NIB_TESTE_URL="http://127.0.0.1:$PORTA/app/api" NIB_TESTE_EMAILS="$TMP/emails.txt" NIB_APP_CONFIG="$TMP/privado/config.php" php "$RAIZ/testes/app-api/api-teste.php" || { echo '--- log do servidor ---'; tail -40 "$TMP/servidor.log"; exit 1; }
