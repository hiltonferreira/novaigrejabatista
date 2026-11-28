<?php
// Testes do servidor do app. Rodar por testes/app-api/rodar.sh (sobe um servidor PHP local com banco de teste).
// Cobre: regras de senha, CPF, nomes e perfis; proteção dos pedidos; cadastro e entrada; permissões por perfil;
// caderno de oração; troca e redefinição de senha; limite de tentativas; exclusão da conta; limpeza de vencidos.
declare(strict_types=1);
define('NIB_APP_RUNTIME', true);
$_SERVER['DOCUMENT_ROOT'] = sys_get_temp_dir();
require __DIR__ . '/../../aplicativo/api/conta-lib.php';

$URL = getenv('NIB_TESTE_URL') ?: 'http://127.0.0.1:8765/app/api';
$falhas = 0; $total = 0;
function confere(string $nome, bool $ok, string $extra = ''): void {
  global $falhas, $total; $total++;
  if ($ok) { echo "ok   $nome\n"; return; }
  $falhas++; echo "FALHA $nome" . ($extra !== '' ? " -> $extra" : '') . "\n";
}

// Cliente HTTP simples com cookie próprio (uma "pessoa" por cliente).
final class Cliente {
  private string $jar;
  public function __construct(private string $base) { $this->jar = tempnam(sys_get_temp_dir(), 'nibjar'); }
  public function pedir(string $arquivo, string $acao, ?array $corpo = null, array $cab = ['X-Nib: 1']): array {
    $ch = curl_init($this->base . '/' . $arquivo . '.php?acao=' . $acao);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_COOKIEJAR => $this->jar, CURLOPT_COOKIEFILE => $this->jar, CURLOPT_HTTPHEADER => array_merge($cab, ['Content-Type: application/json'])]);
    if ($corpo !== null) { curl_setopt($ch, CURLOPT_POST, true); curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($corpo)); }
    $txt = (string)curl_exec($ch); $st = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE); curl_close($ch);
    return [$st, json_decode($txt, true) ?: []];
  }
  public function conta(string $acao, ?array $corpo = null): array { return $this->pedir('conta', $acao, $corpo); }
}
$db = nib_db();
$zerarTentativas = fn() => $db->exec('DELETE FROM nib_tentativas');
$senha = 'Senha#Forte1';
$pessoa = fn(string $nome, string $email) => ['nome' => $nome, 'email' => $email, 'celular' => '69999990000', 'nascimento' => '1990-05-10', 'sexo' => 'f', 'vinculo' => 'membro', 'senha' => $senha, 'consentimento' => true];

echo "# Regras (sem servidor)\n";
confere('CPF válido aceito', nib_cpf_valido('52998224725'));
confere('CPF com dígito errado recusado', !nib_cpf_valido('52998224724'));
confere('CPF repetido recusado', !nib_cpf_valido('11111111111'));
confere('senha forte aceita', nib_senha_ok($senha));
confere('senha sem símbolo recusada', !nib_senha_ok('SenhaForte1'));
confere('senha curta recusada', !nib_senha_ok('Ab#1'));
confere('nome próprio com partículas', nib_nome_proprio('maria DA silva-souza') === 'Maria da Silva-Souza');
confere('perfis do mais alto ao mais baixo', nib_papeis(['papeis' => 'membro,secretaria,admin']) === ['admin', 'secretaria']);
confere('perfil desconhecido vira membro', nib_papeis(['papel' => 'root']) === ['membro']);
confere('push só para serviços conhecidos', nib_push_endpoint_ok('https://fcm.googleapis.com/x') && !nib_push_endpoint_ok('https://exemplo.com/x') && !nib_push_endpoint_ok('http://fcm.googleapis.com/x'));
confere('célula no formato Dia|Nome', nib_celula('Terça|Casa de Israel') !== '' && nib_celula('sem barra') === '');

echo "# Proteção dos pedidos\n";
$a = new Cliente($URL);
[$st] = $a->pedir('conta', 'entrar', ['login' => 'x', 'senha' => 'y'], []);
confere('POST sem cabeçalho X-Nib recusado (403)', $st === 403, "status $st");
[$st] = $a->pedir('conta', 'entrar', ['login' => 'x', 'senha' => 'y'], ['X-Nib: 1', 'Origin: https://site-malicioso.example']);
confere('POST de outra origem recusado (403)', $st === 403, "status $st");

echo "# Cadastro e entrada\n";
[$st] = $a->conta('cadastro', array_merge($pessoa('Ana Teste', 'ana@teste.local'), ['senha' => 'fraca']));
confere('cadastro com senha fraca recusado', $st === 400, "status $st");
[$st, $r] = $a->conta('cadastro', $pessoa('ana teste', 'ana@teste.local'));
confere('cadastro criado (201) e nome ajustado', $st === 201 && ($r['pessoa']['nome'] ?? '') === 'Ana Teste', "status $st");
[$st, $r] = $a->conta('eu');
confere('sessão aberta depois do cadastro', ($r['pessoa']['email'] ?? '') === 'ana@teste.local');
confere('senha nunca volta para o app', !array_key_exists('senha_hash', $r['pessoa'] ?? []));
[$st] = (new Cliente($URL))->conta('cadastro', $pessoa('Ana Outra', 'ana@teste.local'));
confere('e-mail repetido recusado (409)', $st === 409, "status $st");
$b = new Cliente($URL); [$st] = $b->conta('cadastro', $pessoa('Bruno Teste', 'bruno@teste.local'));
$c = new Cliente($URL); [$st2] = $c->conta('cadastro', $pessoa('Carla Teste', 'carla@teste.local'));
confere('mais dois cadastros', $st === 201 && $st2 === 201);
$zerarTentativas();
[$st] = (new Cliente($URL))->conta('entrar', ['login' => 'ana@teste.local', 'senha' => 'Errada#123']);
confere('senha errada recusada (401)', $st === 401, "status $st");
$a2 = new Cliente($URL); [$st] = $a2->conta('entrar', ['login' => 'ana@teste.local', 'senha' => $senha]);
confere('entrada com a senha certa', $st === 200, "status $st");
$ultimo = 0; for ($i = 0; $i < 9; $i++) { [$ultimo] = (new Cliente($URL))->conta('entrar', ['login' => 'bruno@teste.local', 'senha' => 'Errada#123']); }
confere('limite de tentativas na entrada (429)', $ultimo === 429, "status $ultimo");
$zerarTentativas();

echo "# Permissões por perfil\n";
[$st] = $a->conta('membros'); confere('membro não vê a lista de membros (403)', $st === 403, "status $st");
$idB = (int)$db->query("SELECT id FROM nib_pessoas WHERE email = 'bruno@teste.local'")->fetchColumn();
$idC = (int)$db->query("SELECT id FROM nib_pessoas WHERE email = 'carla@teste.local'")->fetchColumn();
[$st] = $a->conta('papel', ['id' => $idB, 'papeis' => ['admin']]); confere('membro não muda perfis (403)', $st === 403, "status $st");
[$st] = $a->pedir('avisos', 'publicar', ['titulo' => 'Oi', 'texto' => 'Teste']); confere('membro não publica aviso (403)', $st === 403, "status $st");
[$st] = $a->pedir('eventos-app', 'criar', ['nome' => 'Evento', 'dia' => date('Y-m-d', strtotime('+3 days'))]); confere('membro não cadastra evento (403)', $st === 403, "status $st");
$db->exec("UPDATE nib_pessoas SET papel = 'admin', papeis = 'admin' WHERE id = $idB");
[$st, $r] = $b->conta('papel', ['id' => $idC, 'papeis' => ['secretaria']]); confere('admin dá o perfil de Secretaria', $st === 200 && ($r['papel'] ?? '') === 'secretaria', "status $st");
[$st] = $b->conta('papel', ['id' => $idB, 'papeis' => ['membro']]); confere('não deixa a igreja sem administração', $st === 400, "status $st");
[$st] = $c->conta('membros'); confere('Secretaria vê a lista de membros', $st === 200, "status $st");
[$st, $r] = $c->pedir('avisos', 'publicar', ['titulo' => 'Culto especial', 'texto' => 'Domingo às 19h']); confere('Secretaria publica aviso', $st === 201, "status $st");
[$st] = $c->pedir('avisos', 'publicar', ['titulo' => 'Link', 'texto' => 'x', 'link' => 'javascript:alert(1)']); confere('aviso com link perigoso recusado', $st === 400, "status $st");
[$st] = $b->pedir('eventos-app', 'criar', ['nome' => 'Worship Night', 'dia' => date('Y-m-d', strtotime('+3 days')), 'hora' => '19:30']); confere('admin cadastra evento', $st === 201, "status $st");

echo "# Caderno de oração\n";
[$st, $r] = $a->pedir('caderno', 'publicar', ['titulo' => 'Saúde', 'motivo' => 'Pela recuperação da minha mãe']); $pid = (int)($r['id'] ?? 0);
confere('membro publica pedido', $st === 201 && $pid > 0, "status $st");
$d = new Cliente($URL); $zerarTentativas(); $d->conta('cadastro', $pessoa('Davi Teste', 'davi@teste.local'));
[$st] = $d->pedir('caderno', 'remover', ['id' => $pid]); confere('outro membro não remove o pedido (403)', $st === 403, "status $st");
[$st] = $d->pedir('caderno', 'atendido', ['id' => $pid, 'atendido' => true]); confere('outro membro não marca como atendido (403)', $st === 403, "status $st");
[$st, $r] = $d->pedir('caderno', 'orar', ['id' => $pid, 'orando' => true]); confere('outro membro pode orar pelo pedido', $st === 200 && ($r['orando'] ?? 0) === 1, "status $st");
[$st] = $c->pedir('caderno', 'remover', ['id' => $pid]); confere('Secretaria remove o pedido', $st === 200, "status $st");

echo "# Senha\n";
[$st] = $a2->conta('senha', ['atual' => $senha, 'nova' => 'Nova#Senha2']); confere('troca de senha', $st === 200, "status $st");
[$st, $r] = $a->conta('eu'); confere('troca de senha encerra as outras sessões', ($r['pessoa'] ?? null) === null);
$emails = (string)getenv('NIB_TESTE_EMAILS'); @unlink($emails);
[$st] = (new Cliente($URL))->conta('esqueci', ['email' => 'ninguem@teste.local']); confere('esqueci com e-mail inexistente responde igual', $st === 200, "status $st");
(new Cliente($URL))->conta('esqueci', ['email' => 'ana@teste.local']);
preg_match('/redefinir=([a-f0-9]{64})/', (string)@file_get_contents($emails), $m); $tok = $m[1] ?? '';
confere('e-mail de nova senha enviado só para quem tem conta', $tok !== '' && substr_count((string)file_get_contents($emails), 'Para:') === 1);
[$st] = (new Cliente($URL))->conta('redefinir', ['token' => $tok, 'senha' => 'Outra#Senha3']); confere('nova senha pelo link', $st === 200, "status $st");
[$st] = (new Cliente($URL))->conta('redefinir', ['token' => $tok, 'senha' => 'Outra#Senha4']); confere('link de nova senha só vale uma vez (410)', $st === 410, "status $st");
[$st, $r] = $a2->conta('eu'); confere('redefinir encerra as sessões antigas', ($r['pessoa'] ?? null) === null);

echo "# Exclusão da conta\n";
[$st] = $d->conta('excluir', ['senha' => 'Errada#123']); confere('excluir com senha errada recusado', $st === 401, "status $st");
[$st] = $d->conta('excluir', ['senha' => $senha]); confere('excluir a própria conta', $st === 200, "status $st");
confere('dados da conta apagados', (int)$db->query("SELECT COUNT(*) FROM nib_pessoas WHERE email = 'davi@teste.local'")->fetchColumn() === 0);

echo "# Limpeza de vencidos\n";
$db->exec("INSERT INTO nib_sessoes (id_hash, pessoa_id, criado_em, expira_em) VALUES (REPEAT('a', 64), $idB, '2020-01-01', '2020-02-01')");
$db->exec("INSERT INTO nib_tentativas (chave, contador, desde) VALUES (REPEAT('b', 64), 1, 1000)");
$n = nib_limpar_vencidos($db);
confere('apaga sessões e tentativas vencidas', $n['sessoes'] >= 1 && $n['tentativas'] >= 1, json_encode($n));
confere('mantém sessões válidas', (int)$db->query("SELECT COUNT(*) FROM nib_sessoes WHERE pessoa_id = $idB")->fetchColumn() >= 1);

echo "\n$total verificações, $falhas falha(s)\n";
exit($falhas ? 1 : 0);
