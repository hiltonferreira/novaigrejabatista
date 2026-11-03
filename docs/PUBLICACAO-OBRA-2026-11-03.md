# Publicação pontual da fonte da obra — 03/11/2026

Solicitação de Hilton: consultar último comentário do Claude no PR #14 e atualizar o site. Comentário6596962817, commit de origem68a3f879f3409d546737e543cce13c63dae9501a. Escopo autorizado: produção cPanel, exclusivamente dados/obra.json, dados/.htaccess e bloco JavaScript da construção do index.html atual. Não integrar o PR14 inteiro, não atualizar Vercel nem sobrescrever home a partir do repositório.

Dados públicos indicados:30%,1.500lugares,entrega2028,atualizado2026-11-03. CORS de leitura pública só no diretório de dados, que não poderá conter arquivos inesperados. Inscrições, APIs privadas e dados reais de participantes fora do escopo.

## Revisão e preparação

HTML público de produção capturado com HTTP200 e197355bytes, SHA256 e5fa5fe3949eea3fe5541c13fa01c17ea95044baafa827927a34427b63840501. Bloco da construção corresponde exatamente ao pai do commit68a3f87. Substituição pontual é reversível byte a byte; nenhuma alteração fora do bloco. O arquivo completo diverge da cópia do Git e será preservado.

Encontrado problema no patch de origem: d&&Number(d.percentual) com d=null passa pelas comparações >=0/<=100 e escreve0 antes de lançar erro. Correção local exige objeto, tipo numérico/string não vazio e Number.isFinite/faixa0–100. Um0válido continua permitido. Somente correção defensiva, sem alteração de regra de negócio.

Testes:60aprovados(55do aplicativo do PR14+5do bloco do site com DOM/RAF/IntersectionObserver simulados): atualização35/42,contador/barra/estatísticas, movimento reduzido,0válido,falhasHTTP/rede eJSON inválido. Script de aplicação também conferido contra fixture da home real: modo de conferência não escreve, publicação altera apenas alvo, backup íntegro e reaplicação bloqueada por hash.

scripts/deploy-obra-source.py confere hash integral antes de aplicar, faz backup privado fora de public_html, publica arquivos com troca atômica e oferece restauração automática se verificações locais falharem. Padrão somente conferência; --apply faz a aplicação autorizada. Alteração concorrente aborta e exige nova comparação, sem forçar escrita.

## Publicação concluída

Após nova autenticação segura, o Terminal permaneceu acessível. Conferência sem escrita aprovada; aplicação pontual concluída com backup privado em `/home/novaigre/nib-manutencao/obra-fonte-unica-20261103-bp0upu7h`.

Verificação pública: `/dados/obra.json` retorna HTTP 200, application/json, Access-Control-Allow-Origin: *, Cache-Control: no-cache, max-age=0 e X-Content-Type-Options: nosniff. Dados conferidos: 30%, 1.500 lugares, entrega 2028. HTML público corresponde byte a byte ao original com somente o bloco da obra substituído; SHA256 final `afcbd15af5638dd9b73f0dee5f06b81782b9bd51b336aeb253cd05ee2e8d9152`.

Navegador confirmou contador 30%, barra com width: 30%, 1.500 lugares e entrega 2028. Nenhum percentual fictício foi publicado. Sem merge do PR #14 e sem publicação Vercel; eventos, inscrições e APIs privadas não foram alterados. O aplicativo em Preview pode consumir o mesmo endpoint público, mas sua publicação não fez parte desta execução.

Responsabilidades:Claude forneceu patch/comentário;Codex revisou/corrigiu/testou/preparou aplicação;Hilton autorizou atualização na conversa e fornece autenticação quando necessária. Credenciais não coletadas pelo modelo nem salvas no repositório.
