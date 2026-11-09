<?php
// Converte para WebP os comprovantes de Pix já guardados (pedido de Hilton, 09/11/2026).
// Cada inscrição é um <id>.json com "receipt" = "<id>.jpg|png" e "receipt_mime". O script grava <id>.webp,
// atualiza esses dois campos no JSON e só então apaga o arquivo antigo. PDF e WebP ficam como estão.
// Segurança:
//  - Pula o comprovante se o nome dele aparecer em qualquer outro arquivo da pasta privada (não quebra referência).
//  - Pula JPEG de foto com rotação (EXIF) se o PHP não tiver a extensão exif para girar certo.
//  - Pula se a versão WebP não ficar menor.
//  - Com --apply, copia antes os originais (imagem e JSON) para ~/nib-manutencao/comprovantes-originais-DATA.
// Uso, no Terminal do cPanel:
//   php comprovantes-webp.php /home/novaigre/nib-inscricoes-privado            -> só mostra o que faria
//   php comprovantes-webp.php /home/novaigre/nib-inscricoes-privado --apply    -> converte
declare(strict_types=1);
if (isset($_SERVER['REQUEST_METHOD'])) { http_response_code(404); exit; }
ini_set('display_errors', '1'); error_reporting(E_ALL); ini_set('memory_limit', '512M');
$argv = $argv ?? ($_SERVER['argv'] ?? []);
$raiz = rtrim((string)($argv[1] ?? ''), '/'); $apply = in_array('--apply', $argv, true);
const MAXIMO = 1600; const QUALIDADE = 82;
function falha(string $m): never { echo "ERRO: $m\n"; exit(1); }
if ($raiz === '' || !is_dir($raiz)) falha('informe a pasta nib-inscricoes-privado.');
if (!function_exists('imagewebp') || !function_exists('imagecreatefromstring')) falha('o PHP deste servidor não tem GD com WebP.');
$temExif = function_exists('exif_read_data');
echo 'Comprovantes em WebP (PHP ' . PHP_VERSION . ', exif ' . ($temExif ? 'sim' : 'não') . ")\n";

// Todos os arquivos de texto da pasta, para conferir se o nome do comprovante é citado em outro lugar.
$textos = [];
$it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($raiz, FilesystemIterator::SKIP_DOTS));
foreach ($it as $f) { if ($f->isFile() && !$f->isLink() && preg_match('/\.(json|csv|txt|log|php)$/i', $f->getFilename()) && $f->getSize() < 20000000) $textos[$f->getPathname()] = null; }

function orientacao(string $arq, bool $temExif): ?int {
  $cab = (string)file_get_contents($arq, false, null, 0, 65536);
  if (!str_contains($cab, "Exif\0\0")) return 1;
  if (!$temExif) return null;
  $e = @exif_read_data($arq); return (int)($e['Orientation'] ?? 1) ?: 1;
}
function girar(GdImage $im, int $o): GdImage {
  if ($o === 2) imageflip($im, IMG_FLIP_HORIZONTAL);
  elseif ($o === 3) $im = imagerotate($im, 180, 0);
  elseif ($o === 4) imageflip($im, IMG_FLIP_VERTICAL);
  elseif ($o === 5) { $im = imagerotate($im, -90, 0); imageflip($im, IMG_FLIP_HORIZONTAL); }
  elseif ($o === 6) $im = imagerotate($im, -90, 0);
  elseif ($o === 7) { $im = imagerotate($im, 90, 0); imageflip($im, IMG_FLIP_HORIZONTAL); }
  elseif ($o === 8) $im = imagerotate($im, 90, 0);
  return $im;
}

$total = $antes = $depois = 0; $pulados = [];
$bak = $apply ? getenv('HOME') . '/nib-manutencao/comprovantes-originais-' . date('Ymd-His') : '';
if ($apply && !mkdir($bak, 0700, true)) falha('não consegui criar a pasta de backup.');

foreach (array_keys($textos) as $json) {
  if (!str_ends_with($json, '.json')) continue;
  $id = basename($json, '.json'); $pasta = dirname($json);
  $r = json_decode((string)file_get_contents($json), true);
  if (!is_array($r) || !is_string($r['receipt'] ?? null)) continue;
  $nome = $r['receipt'];
  if (!preg_match('/^' . preg_quote($id, '/') . '\.(jpg|png)$/D', $nome)) continue;
  $img = $pasta . '/' . $nome;
  if (!is_file($img) || is_link($img)) { $pulados[] = "$nome: arquivo não encontrado"; continue; }
  // O nome não pode aparecer em nenhum outro arquivo (índices, exportações): senão a troca quebraria a referência.
  foreach (array_keys($textos) as $t) {
    if ($t === $json) continue;
    if (str_contains((string)file_get_contents($t), $nome)) { $pulados[] = "$nome: citado também em " . substr($t, strlen($raiz) + 1); continue 2; }
  }
  $o = orientacao($img, $temExif);
  if ($o === null) { $pulados[] = "$nome: foto com rotação e PHP sem exif"; continue; }
  $im = @imagecreatefromstring((string)file_get_contents($img));
  if (!$im) { $pulados[] = "$nome: imagem ilegível"; continue; }
  $im = girar($im, $o);
  $w = imagesx($im); $h = imagesy($im); $k = min(1, MAXIMO / max($w, $h));
  if ($k < 1) { $nw = (int)round($w * $k); $nh = (int)round($h * $k); $n = imagecreatetruecolor($nw, $nh); imagefill($n, 0, 0, imagecolorallocate($n, 255, 255, 255)); imagecopyresampled($n, $im, 0, 0, 0, 0, $nw, $nh, $w, $h); $im = $n; }
  elseif (!imageistruecolor($im)) { imagepalettetotruecolor($im); }
  ob_start(); imagewebp($im, null, QUALIDADE); $webp = (string)ob_get_clean();
  $tam = filesize($img);
  if ($webp === '' || strlen($webp) >= $tam || !@getimagesizefromstring($webp)) { $pulados[] = "$nome: WebP não ficou menor"; continue; }
  $novo = $id . '.webp';
  printf("%s %s -> %s (%d KB -> %d KB)\n", $apply ? 'CONVERTIDO' : 'CONVERTERIA', substr($img, strlen($raiz) + 1), $novo, intdiv($tam, 1024), intdiv(strlen($webp), 1024));
  $total++; $antes += $tam; $depois += strlen($webp);
  if (!$apply) continue;
  $destBak = $bak . '/' . str_replace('/', '__', substr($pasta, strlen($raiz) + 1));
  if (!is_dir($destBak) && !mkdir($destBak, 0700, true)) falha('backup');
  if (!copy($img, "$destBak/$nome") || !copy($json, "$destBak/$id.json")) falha("backup de $nome");
  // 1) grava o WebP; 2) troca o JSON de forma atômica; 3) apaga o original.
  if (file_put_contents("$pasta/$novo", $webp, LOCK_EX) === false) falha("não gravou $novo");
  @chmod("$pasta/$novo", fileperms($img) & 0777);
  $r['receipt'] = $novo; $r['receipt_mime'] = 'image/webp';
  $tmp = "$json.tmp"; $txt = json_encode($r, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_PRESERVE_ZERO_FRACTION);
  if ($txt === false || file_put_contents($tmp, $txt, LOCK_EX) === false) { @unlink("$pasta/$novo"); falha("não gravou o JSON de $id"); }
  @chmod($tmp, fileperms($json) & 0777);
  if (!rename($tmp, $json)) { @unlink($tmp); @unlink("$pasta/$novo"); falha("não trocou o JSON de $id"); }
  unlink($img);
}
printf("\n%d comprovantes %s: %.1f MB -> %.1f MB\n", $total, $apply ? 'convertidos' : 'para converter', $antes / 1048576, $depois / 1048576);
foreach ($pulados as $p) echo "PULADO $p\n";
if ($apply) echo "Originais guardados em $bak (apague depois de conferir os comprovantes no painel).\n";
else echo "Nada foi alterado. Rode de novo com --apply para converter.\n";
