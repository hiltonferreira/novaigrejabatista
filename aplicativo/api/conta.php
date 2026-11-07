<?php
// API das contas do app: /app/api/conta.php?acao=...
// GET: eu, inscricoes, cadastros (equipe). POST (JSON + cabeçalho X-Nib: 1): cadastro, entrar, sair, atualizar, senha, esqueci, redefinir, excluir, confirmar (equipe).
declare(strict_types=1);
define('NIB_APP_RUNTIME', true);
ini_set('display_errors', '0');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');
header('Referrer-Policy: same-origin');
require __DIR__ . '/conta-lib.php';
require __DIR__ . '/push-lib.php';
require __DIR__ . '/inscricoes-lib.php';

$acao = is_string($_GET['acao'] ?? null) ? $_GET['acao'] : '';
$post = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';

try {
  if ($post) nib_conferir_origem();
  $db = nib_db();
  $eu = nib_pessoa_logada();
  $d = $post ? nib_corpo() : [];

  switch ($post ? "post:$acao" : "get:$acao") {

    case 'get:eu':
      nib_json(200, ['ok' => true, 'pessoa' => $eu ? nib_publico($eu) : null]);

    case 'post:cadastro': {
      nib_limite('cadastro', nib_ip(), 6, 3600);
      $nome = nib_nome_proprio(nib_texto($d['nome'] ?? '', 120)); $email = nib_email($d['email'] ?? ''); $cel = nib_digitos($d['celular'] ?? '');
      $senha = is_string($d['senha'] ?? null) ? $d['senha'] : '';
      $sexo = ($d['sexo'] ?? '') === 'm' ? 'm' : 'f';
      $vinculo = in_array($d['vinculo'] ?? '', ['membro', 'frequento', 'visitante'], true) ? $d['vinculo'] : 'visitante';
      if (count(explode(' ', $nome)) < 2) nib_erro('Escreva seu nome e sobrenome.');
      if (strlen($cel) < 10) nib_erro('Informe um celular com DDD.');
      $nasc = nib_texto($d['nascimento'] ?? '', 10); $dtn = DateTimeImmutable::createFromFormat('!Y-m-d', $nasc);
      if (!$dtn || $dtn->format('Y-m-d') !== $nasc || $nasc < '1900-01-01' || $nasc > date('Y-m-d')) nib_erro('Informe sua data de nascimento.');
      if ($email === '') nib_erro('Informe um e-mail válido.');
      if (!nib_senha_ok($senha)) nib_erro('A senha ainda não atende a todos os critérios.');
      if (($d['consentimento'] ?? false) !== true) nib_erro('Para continuar, aceite a política de privacidade.');
      $q = $db->prepare('SELECT id FROM nib_pessoas WHERE email = ?'); $q->execute([$email]);
      if ($q->fetch()) nib_erro('Já existe um cadastro com este e-mail. Entre com a sua senha ou use "Esqueci minha senha".', 409);
      $agora = nib_agora();
      $db->prepare('INSERT INTO nib_pessoas (nome, email, celular, nascimento, sexo, vinculo, celula, membro_status, senha_hash, consentimento_em, consentimento_versao, criado_em, atualizado_em) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([$nome, $email, $cel, $nasc, $sexo, $vinculo, nib_celula($d['celula'] ?? '') ?: null, $vinculo === 'membro' ? 'pendente' : 'nao', password_hash($senha, PASSWORD_DEFAULT), $agora, NIB_POLITICA, $agora, $agora]);
      $id = (int)$db->lastInsertId();
      nib_registrar($id, 'cadastro', $id, $vinculo);
      nib_abrir_sessao($id);
      $q = $db->prepare('SELECT * FROM nib_pessoas WHERE id = ?'); $q->execute([$id]);
      nib_json(201, ['ok' => true, 'pessoa' => nib_publico($q->fetch())]);
    }

    case 'post:entrar': {
      $login = nib_texto($d['login'] ?? '', 160); $senha = is_string($d['senha'] ?? null) ? $d['senha'] : '';
      nib_limite('entrar-ip', nib_ip(), 30, 900);
      nib_limite('entrar', mb_strtolower($login), 8, 900);
      $p = null;
      if (str_contains($login, '@')) { $q = $db->prepare('SELECT * FROM nib_pessoas WHERE email = ?'); $q->execute([nib_email($login)]); $p = $q->fetch() ?: null; }
      else { $cel = nib_digitos($login); if (strlen($cel) >= 10) { $q = $db->prepare('SELECT * FROM nib_pessoas WHERE celular = ? LIMIT 2'); $q->execute([$cel]); $rows = $q->fetchAll(); $p = count($rows) === 1 ? $rows[0] : null; } }
      if (!$p || !password_verify($senha, $p['senha_hash'])) { if (!$p) password_verify($senha, password_hash('nib-tempo-igual', PASSWORD_DEFAULT)); nib_erro('E-mail, celular ou senha não conferem.', 401); }
      if (password_needs_rehash($p['senha_hash'], PASSWORD_DEFAULT)) $db->prepare('UPDATE nib_pessoas SET senha_hash = ? WHERE id = ?')->execute([password_hash($senha, PASSWORD_DEFAULT), $p['id']]);
      nib_abrir_sessao((int)$p['id']);
      nib_json(200, ['ok' => true, 'pessoa' => nib_publico($p)]);
    }

    case 'post:sair':
      nib_fechar_sessao();
      nib_json(200, ['ok' => true]);

    case 'post:atualizar': {
      if (!$eu) nib_erro('Entre na sua conta.', 401);
      $nome = nib_nome_proprio(nib_texto($d['nome'] ?? $eu['nome'], 120)); $cel = nib_digitos($d['celular'] ?? $eu['celular']);
      $sexo = ($d['sexo'] ?? $eu['sexo']) === 'm' ? 'm' : 'f';
      $end = nib_texto($d['endereco'] ?? ($eu['endereco'] ?? ''), 250);
      $nasc = nib_texto($d['nascimento'] ?? ($eu['nascimento'] ?? ''), 10);
      if ($nasc !== '') { $dt = DateTimeImmutable::createFromFormat('!Y-m-d', $nasc); if (!$dt || $dt->format('Y-m-d') !== $nasc || $nasc < '1900-01-01' || $nasc > date('Y-m-d')) nib_erro('Data de nascimento inválida.'); }
      $celula = array_key_exists('celula', $d) ? nib_celula($d['celula']) : (string)($eu['celula'] ?? '');
      $cpf = array_key_exists('cpf', $d) ? nib_digitos($d['cpf'] ?? '') : (string)($eu['cpf'] ?? '');
      if ($cpf !== '' && !nib_cpf_valido($cpf)) nib_erro('CPF inválido. Confira os números.');
      if ($cpf !== '') { $q = $db->prepare('SELECT id FROM nib_pessoas WHERE cpf = ? AND id <> ?'); $q->execute([$cpf, $eu['id']]); if ($q->fetch()) nib_erro('Este CPF já está em outro cadastro. Fale com a Secretaria.', 409); }
      $mostrar = array_key_exists('mostrar_aniversario', $d) ? (bool)$d['mostrar_aniversario'] : (bool)$eu['mostrar_aniversario'];
      if (count(explode(' ', $nome)) < 2) nib_erro('Escreva seu nome e sobrenome.');
      if (strlen($cel) < 10) nib_erro('Informe um celular com DDD.');
      $db->prepare('UPDATE nib_pessoas SET nome = ?, celular = ?, sexo = ?, celula = ?, endereco = ?, nascimento = ?, cpf = ?, mostrar_aniversario = ?, atualizado_em = ? WHERE id = ?')
        ->execute([$nome, $cel, $sexo, $celula !== '' ? $celula : null, $end !== '' ? $end : null, $nasc !== '' ? $nasc : null, $cpf !== '' ? $cpf : null, $mostrar ? 1 : 0, nib_agora(), $eu['id']]);
      $q = $db->prepare('SELECT * FROM nib_pessoas WHERE id = ?'); $q->execute([$eu['id']]);
      nib_json(200, ['ok' => true, 'pessoa' => nib_publico($q->fetch())]);
    }

    case 'post:senha': {
      if (!$eu) nib_erro('Entre na sua conta.', 401);
      nib_limite('senha', (string)$eu['id'], 8, 900);
      $atual = is_string($d['atual'] ?? null) ? $d['atual'] : ''; $nova = is_string($d['nova'] ?? null) ? $d['nova'] : '';
      if (!password_verify($atual, $eu['senha_hash'])) nib_erro('A senha atual não confere.', 401);
      if (!nib_senha_ok($nova)) nib_erro('A nova senha ainda não atende a todos os critérios.');
      $db->prepare('UPDATE nib_pessoas SET senha_hash = ?, atualizado_em = ? WHERE id = ?')->execute([password_hash($nova, PASSWORD_DEFAULT), nib_agora(), $eu['id']]);
      // Encerra as outras sessões e mantém esta.
      $db->prepare('DELETE FROM nib_sessoes WHERE pessoa_id = ? AND id_hash <> ?')->execute([$eu['id'], hash('sha256', (string)$_COOKIE[NIB_COOKIE])]);
      nib_json(200, ['ok' => true]);
    }

    case 'post:esqueci': {
      $email = nib_email($d['email'] ?? '');
      nib_limite('esqueci-ip', nib_ip(), 10, 3600);
      if ($email !== '') {
        nib_limite('esqueci', $email, 3, 3600);
        $q = $db->prepare('SELECT id, nome FROM nib_pessoas WHERE email = ?'); $q->execute([$email]); $p = $q->fetch();
        if ($p) {
          $tok = bin2hex(random_bytes(32));
          $db->prepare('DELETE FROM nib_redefinicoes WHERE pessoa_id = ?')->execute([$p['id']]);
          $db->prepare('INSERT INTO nib_redefinicoes (token_hash, pessoa_id, expira_em) VALUES (?, ?, ?)')->execute([hash('sha256', $tok), $p['id'], nib_em('+1 hour')]);
          $link = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'novaigrejabatista.com.br') . '/app/?redefinir=' . $tok;
          $primeiro = explode(' ', $p['nome'])[0];
          nib_enviar_email($email, 'Criar nova senha · App da Nib', "Olá, $primeiro!\n\nRecebemos um pedido para criar uma nova senha no app da Nova Igreja Batista.\n\nToque no link abaixo para criar a nova senha. Ele vale por 1 hora:\n$link\n\nSe não foi você, ignore este e-mail. Sua senha atual continua valendo.\n\nNova Igreja Batista · Ariquemes, RO");
          nib_registrar((int)$p['id'], 'esqueci');
        }
      }
      // Mesma resposta exista ou não a conta, para não revelar quem tem cadastro.
      nib_json(200, ['ok' => true]);
    }

    case 'post:redefinir': {
      nib_limite('redefinir', nib_ip(), 10, 3600);
      $tok = is_string($d['token'] ?? null) ? $d['token'] : ''; $nova = is_string($d['senha'] ?? null) ? $d['senha'] : '';
      if (!preg_match('/^[a-f0-9]{64}$/', $tok)) nib_erro('Link inválido. Peça um novo em "Esqueci minha senha".');
      if (!nib_senha_ok($nova)) nib_erro('A nova senha ainda não atende a todos os critérios.');
      $q = $db->prepare('SELECT pessoa_id FROM nib_redefinicoes WHERE token_hash = ? AND usado_em IS NULL AND expira_em > ?'); $q->execute([hash('sha256', $tok), nib_agora()]); $r = $q->fetch();
      if (!$r) nib_erro('Este link já foi usado ou expirou. Peça um novo em "Esqueci minha senha".', 410);
      $db->prepare('UPDATE nib_redefinicoes SET usado_em = ? WHERE token_hash = ?')->execute([nib_agora(), hash('sha256', $tok)]);
      $db->prepare('UPDATE nib_pessoas SET senha_hash = ?, atualizado_em = ? WHERE id = ?')->execute([password_hash($nova, PASSWORD_DEFAULT), nib_agora(), $r['pessoa_id']]);
      $db->prepare('DELETE FROM nib_sessoes WHERE pessoa_id = ?')->execute([$r['pessoa_id']]);
      nib_registrar((int)$r['pessoa_id'], 'redefinir');
      nib_abrir_sessao((int)$r['pessoa_id']);
      $q = $db->prepare('SELECT * FROM nib_pessoas WHERE id = ?'); $q->execute([$r['pessoa_id']]);
      nib_json(200, ['ok' => true, 'pessoa' => nib_publico($q->fetch())]);
    }

    case 'post:excluir': {
      if (!$eu) nib_erro('Entre na sua conta.', 401);
      $senha = is_string($d['senha'] ?? null) ? $d['senha'] : '';
      if (!password_verify($senha, $eu['senha_hash'])) nib_erro('A senha não confere.', 401);
      nib_registrar(null, 'excluir-conta', null, 'pessoa ' . $eu['id']);
      $db->prepare('DELETE FROM nib_pessoas WHERE id = ?')->execute([$eu['id']]);
      nib_cookie('', time() - 3600);
      nib_json(200, ['ok' => true]);
    }

    // Equipe (Secretaria, Pastoral, administração): quem se cadastrou e confirmação de membro.
    case 'get:inscricoes': {
      if (!$eu) nib_erro('Entre na sua conta para ver suas inscrições.', 401);
      if (!NIB_INSCRICOES_AUTOMATICAS) nib_json(200, ['ok' => true, 'liberado' => false, 'desativado' => true, 'inscricoes' => []]);
      if (NIB_INSCRICOES_SO_CONFIRMADOS && ($eu['membro_status'] ?? '') !== 'confirmado') nib_json(200, ['ok' => true, 'liberado' => false, 'inscricoes' => []]);
      nib_limite('inscricoes', (string)$eu['id'], 120, 3600);
      nib_json(200, ['ok' => true, 'liberado' => true, 'inscricoes' => nib_minhas_inscricoes((string)$eu['celular'])]);
    }

    case 'post:sugestao': {
      if (!$eu) nib_erro('Entre na sua conta.', 401);
      nib_limite('sugestao', (string)$eu['id'], 10, 86400);
      $tipo = in_array($d['tipo'] ?? '', ['sugestao', 'problema', 'elogio'], true) ? $d['tipo'] : 'sugestao';
      $texto = nib_texto($d['texto'] ?? '', 1500);
      if (mb_strlen($texto) < 5) nib_erro('Escreva sua mensagem.');
      $db->prepare('INSERT INTO nib_sugestoes (pessoa_id, tipo, texto, aparelho, versao, criado_em) VALUES (?,?,?,?,?,?)')
        ->execute([$eu['id'], $tipo, $texto, mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 160), nib_texto($d['versao'] ?? '', 40), nib_agora()]);
      nib_json(201, ['ok' => true]);
    }
    case 'get:sugestoes': {
      if (!$eu || !nib_ve_cpf($eu)) nib_erro('Acesso só para a administração.', 403);
      $rows = $db->query('SELECT s.id, s.tipo, s.texto, s.aparelho, s.versao, s.lida, s.criado_em, p.nome FROM nib_sugestoes s LEFT JOIN nib_pessoas p ON p.id = s.pessoa_id ORDER BY s.criado_em DESC LIMIT 300')->fetchAll();
      foreach ($rows as &$r) { $r['nome'] = $r['nome'] !== null ? nib_nome_proprio((string)$r['nome']) : 'Conta excluída'; $r['lida'] = (bool)$r['lida']; } unset($r);
      nib_json(200, ['ok' => true, 'sugestoes' => $rows]);
    }
    case 'post:sugestao-lida': {
      if (!$eu || !nib_ve_cpf($eu)) nib_erro('Acesso só para a administração.', 403);
      $db->prepare('UPDATE nib_sugestoes SET lida = ? WHERE id = ?')->execute([!empty($d['lida']) ? 1 : 0, (int)($d['id'] ?? 0)]);
      nib_json(200, ['ok' => true]);
    }

    case 'get:cadastros': {
      if (!$eu || !nib_equipe($eu)) nib_erro('Acesso só para a equipe da igreja.', 403);
      $rows = $db->query('SELECT id, nome, email, celular, cpf, vinculo, celula, membro_status, papel, criado_em, ultimo_acesso, confirmado_em FROM nib_pessoas ORDER BY criado_em DESC LIMIT 2000')->fetchAll();
      $veCpf = nib_ve_cpf($eu);
      foreach ($rows as &$r) { $r['nome'] = nib_nome_proprio((string)$r['nome']); if (!$veCpf) unset($r['cpf']); } unset($r);
      nib_json(200, ['ok' => true, 'pessoas' => $rows]);
    }
    // Área da equipe (Fase 1): painel com números reais e lista de membros. O servidor confere o papel real.
    case 'get:equipe-painel': {
      if (!$eu || !nib_equipe($eu)) nib_erro('Acesso só para a equipe da igreja.', 403);
      $tz = new DateTimeZone('America/Porto_Velho'); $hoje = new DateTimeImmutable('today', $tz);
      $d30 = $hoje->modify('-30 days')->format('Y-m-d 00:00:00');
      $q = $db->prepare("SELECT COUNT(*) total,
        SUM(membro_status = 'confirmado') membros,
        SUM(membro_status = 'confirmado' AND confirmado_em >= ?) membros_novos,
        SUM(membro_status <> 'confirmado' AND vinculo = 'frequento') frequentadores,
        SUM(membro_status <> 'confirmado' AND vinculo = 'visitante') visitantes,
        SUM(membro_status = 'pendente') aguardando,
        SUM(criado_em >= ?) cadastros_novos,
        SUM(nascimento IS NULL OR endereco IS NULL OR endereco = '') dados_faltando,
        SUM(celula IS NOT NULL AND celula <> '') em_celula,
        SUM(membro_status = 'confirmado' AND (celula IS NULL OR celula = '')) membros_sem_celula,
        COUNT(DISTINCT NULLIF(celula, '')) celulas
        FROM nib_pessoas");
      $q->execute([$d30, $d30]); $n = array_map('intval', $q->fetch());
      // Cultos com check-in: os 8 mais recentes (dia + culto), do mais antigo ao mais novo.
      $cultos = array_reverse($db->query("SELECT culto_dia dia, culto, COUNT(*) pessoas FROM nib_checkins GROUP BY culto_dia, culto ORDER BY culto_dia DESC, culto DESC LIMIT 8")->fetchAll());
      foreach ($cultos as &$c) $c['pessoas'] = (int)$c['pessoas']; unset($c);
      $cad = $db->query("SELECT SUM(p.atendido = 0) ativos, SUM(p.atendido = 0 AND NOT EXISTS (SELECT 1 FROM nib_orando o WHERE o.pedido_id = p.id)) sem_oracao FROM nib_pedidos p WHERE p.removido_por IS NULL")->fetch();
      $sug = nib_ve_cpf($eu) ? (int)$db->query('SELECT COUNT(*) FROM nib_sugestoes WHERE lida = 0')->fetchColumn() : null;
      // Aniversariantes dos próximos 7 dias (só quem deixou aparecer).
      $dias = []; for ($i = 0; $i < 7; $i++) $dias[$hoje->modify("+$i days")->format('m-d')] = $i;
      $aniv = [];
      foreach ($db->query("SELECT nome, nascimento FROM nib_pessoas WHERE nascimento IS NOT NULL AND mostrar_aniversario = 1")->fetchAll() as $r) {
        $md = substr((string)$r['nascimento'], 5, 5); if (!isset($dias[$md])) continue;
        $aniv[] = ['nome' => nib_nome_proprio((string)$r['nome']), 'dia' => $md, 'em' => $dias[$md]];
      }
      usort($aniv, fn($a, $b) => $a['em'] <=> $b['em'] ?: strcmp($a['nome'], $b['nome']));
      nib_json(200, ['ok' => true, 'painel' => $n + ['cultos' => $cultos, 'caderno_ativos' => (int)($cad['ativos'] ?? 0), 'caderno_sem_oracao' => (int)($cad['sem_oracao'] ?? 0), 'sugestoes_novas' => $sug, 'aniversariantes' => array_slice($aniv, 0, 12)]]);
    }
    case 'get:membros': {
      if (!$eu || !nib_equipe($eu)) nib_erro('Acesso só para a equipe da igreja.', 403);
      $tz = new DateTimeZone('America/Porto_Velho'); $d56 = (new DateTimeImmutable('today', $tz))->modify('-56 days')->format('Y-m-d');
      $q = $db->prepare("SELECT p.id, p.nome, p.email, p.celular, p.cpf, p.sexo, p.vinculo, p.celula, p.membro_status, p.nascimento, p.endereco, p.mostrar_aniversario, p.criado_em, p.ultimo_acesso, p.confirmado_em,
        (SELECT MAX(c.culto_dia) FROM nib_checkins c WHERE c.pessoa_id = p.id) ultima_presenca,
        (SELECT COUNT(*) FROM nib_checkins c WHERE c.pessoa_id = p.id AND c.culto_dia >= ?) presencas_8sem
        FROM nib_pessoas p ORDER BY p.nome LIMIT 5000");
      $q->execute([$d56]); $rows = $q->fetchAll();
      $veCpf = nib_ve_cpf($eu);
      foreach ($rows as &$r) { $r['nome'] = nib_nome_proprio((string)$r['nome']); $r['presencas_8sem'] = (int)$r['presencas_8sem']; $r['mostrar_aniversario'] = (int)$r['mostrar_aniversario']; if (!$veCpf) unset($r['cpf']); } unset($r);
      $exporta = in_array($eu['papel'], ['secretaria', 'admin'], true);
      $log = [];
      if ($exporta) {
        $log = $db->query("SELECT r.criado_em em, r.detalhes, p.nome FROM nib_registro r LEFT JOIN nib_pessoas p ON p.id = r.pessoa_id WHERE r.acao = 'membros-exportar' ORDER BY r.id DESC LIMIT 3")->fetchAll();
        foreach ($log as &$l) $l['nome'] = nib_nome_proprio((string)($l['nome'] ?? '')); unset($l);
      }
      nib_json(200, ['ok' => true, 'pessoas' => $rows, 'pode_exportar' => $exporta, 'exportacoes' => $log]);
    }
    case 'post:membros-exportados': {
      // Só Secretaria e administração exportam (decisão de Hilton, 07/11/2026). Cada exportação fica registrada.
      if (!$eu || !in_array($eu['papel'], ['secretaria', 'admin'], true)) nib_erro('Só a Secretaria exporta a lista de membros.', 403);
      if (($d['uso_interno'] ?? false) !== true) nib_erro('Confirme que o arquivo é para uso interno da igreja.');
      $nn = max(0, min(100000, (int)($d['n'] ?? 0))); $fmt = ($d['formato'] ?? '') === 'pdf' ? 'pdf' : 'csv';
      $grupos = implode(',', array_values(array_intersect(is_array($d['grupos'] ?? null) ? $d['grupos'] : [], ['contato', 'endereco', 'igreja', 'pessoal'])));
      nib_registrar((int)$eu['id'], 'membros-exportar', null, "n=$nn;formato=$fmt;grupos=$grupos");
      nib_json(200, ['ok' => true]);
    }
    case 'post:confirmar': {
      if (!$eu || !nib_equipe($eu)) nib_erro('Acesso só para a equipe da igreja.', 403);
      $id = (int)($d['id'] ?? 0); $status = in_array($d['status'] ?? '', ['confirmado', 'pendente', 'nao'], true) ? $d['status'] : '';
      if ($id < 1 || $status === '') nib_erro('Pedido inválido.');
      $q = $db->prepare('UPDATE nib_pessoas SET membro_status = ?, confirmado_por = ?, confirmado_em = ?, atualizado_em = ? WHERE id = ?');
      $q->execute([$status, $status === 'confirmado' ? $eu['id'] : null, $status === 'confirmado' ? nib_agora() : null, nib_agora(), $id]);
      if (!$q->rowCount()) nib_erro('Cadastro não encontrado.', 404);
      nib_registrar((int)$eu['id'], 'membro-' . $status, $id);
      if ($status === 'confirmado') nib_push_depois([$id], ['title' => 'Membresia confirmada', 'body' => 'A Secretaria confirmou que você é membro da Nova Igreja Batista. Seja bem-vindo!', 'url' => '/app/', 'tag' => 'nib-membro']);
      nib_json(200, ['ok' => true]);
    }

    case 'get:push-chave':
      nib_json(200, ['ok' => true, 'chave' => nib_vapid()['publica']]);

    case 'post:push-inscrever': {
      if (!$eu) nib_erro('Entre na sua conta.', 401);
      $ep = is_string($d['endpoint'] ?? null) ? trim($d['endpoint']) : '';
      $k = is_array($d['keys'] ?? null) ? $d['keys'] : [];
      $p256 = is_string($k['p256dh'] ?? null) ? $k['p256dh'] : ''; $au = is_string($k['auth'] ?? null) ? $k['auth'] : '';
      if (strlen($ep) > 700 || !nib_push_endpoint_ok($ep) || !preg_match('/^[A-Za-z0-9_-]{80,100}$/', $p256) || !preg_match('/^[A-Za-z0-9_-]{16,30}$/', $au)) nib_erro('Este aparelho não pode receber notificações.');
      nib_limite('push', (string)$eu['id'], 20, 86400);
      $ins = $db->prepare('INSERT INTO nib_push (pessoa_id, endpoint, endpoint_hash, p256dh, auth, aparelho, criado_em) VALUES (?,?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE pessoa_id = VALUES(pessoa_id), p256dh = VALUES(p256dh), auth = VALUES(auth), aparelho = VALUES(aparelho)');
      $ins->execute([$eu['id'], $ep, hash('sha256', $ep), $p256, $au, mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 120), nib_agora()]);
      // Só avisa na primeira inscrição deste aparelho (1 = linha nova; 2 ou 0 = já existia).
      if ($ins->rowCount() === 1) nib_push_depois([(int)$eu['id']], ['title' => 'Notificações ativadas', 'body' => 'Você vai receber aqui os avisos da Nova Igreja Batista.', 'url' => '/app/', 'tag' => 'nib-ativado']);
      nib_json(200, ['ok' => true]);
    }

    case 'post:push-preferencia': {
      if (!$eu) nib_erro('Entre na sua conta.', 401);
      $ep = is_string($d['endpoint'] ?? null) ? trim($d['endpoint']) : '';
      foreach (['caderno', 'lembretes'] as $campo) if (array_key_exists($campo, $d)) $db->prepare("UPDATE nib_push SET $campo = ? WHERE endpoint_hash = ? AND pessoa_id = ?")->execute([!empty($d[$campo]) ? 1 : 0, hash('sha256', $ep), $eu['id']]);
      nib_json(200, ['ok' => true]);
    }

    case 'get:push-estado': {
      if (!$eu) nib_erro('Entre na sua conta.', 401);
      $ep = is_string($_GET['endpoint'] ?? null) ? $_GET['endpoint'] : '';
      $q = $db->prepare('SELECT caderno, lembretes FROM nib_push WHERE endpoint_hash = ? AND pessoa_id = ?'); $q->execute([hash('sha256', $ep), $eu['id']]);
      $r = $q->fetch(); nib_json(200, ['ok' => true, 'inscrito' => (bool)$r, 'caderno' => $r ? (bool)$r['caderno'] : false, 'lembretes' => $r ? (bool)$r['lembretes'] : true]);
    }

    case 'post:push-sair': {
      $ep = is_string($d['endpoint'] ?? null) ? trim($d['endpoint']) : '';
      if ($ep !== '') $db->prepare('DELETE FROM nib_push WHERE endpoint_hash = ?')->execute([hash('sha256', $ep)]);
      nib_json(200, ['ok' => true]);
    }

    default:
      nib_erro('Ação desconhecida.', 404);
  }
} catch (Throwable $e) {
  error_log('NIB app conta: ' . $e->getMessage());
  nib_erro('Serviço indisponível no momento. Tente de novo em instantes.', 503);
}
