# Encerramento de Mulheres Virtuosas — 01/11/2026

Publicado no site oficial por cPanel, partindo dos arquivos de produção e de main d4889c4955cc991d93ec82a0b5378bbb9975d5da. Nenhuma alteração do PR #8 foi publicada.

- Removidos slide e seletor Mulheres do carrossel; NXT e DNA preservados e reindexados.
- Cartão Mulheres informa realização em 30/10 e inscrições encerradas.
- Página pública mantém arte, informações, consulta e acesso administrativo; formulário e script de envio removidos.
- API retorna HTTP 410 em GET e POST antes de iniciar sessão ou gravar arquivos.
- Registros privados e comprovantes não foram alterados.

Backup privado anterior à troca: /home/novaigre/nib-manutencao/nib-encerramento-mulheres-20261101-cf8jtebr. Inclui os três arquivos e SHA256SUMS. Para reverter, restaurar os arquivos de mesma posição desse backup; isso reabre o formulário e a API.

Validação: PHP -l no servidor; hashes dos HTML publicados iguais aos preparados; GET da API HTTP 410 com mensagem de encerramento; página oficial sem formulário; botão de consulta abre Mulheres pré-selecionado; carrossel com dois seletores e troca para DNA funcional. Nenhuma inscrição ou pagamento real criado durante a conferência.

Hashes publicados (SHA256):
- index.html: e5fa5fe3949eea3fe5541c13fa01c17ea95044baafa827927a34427b63840501
- mulheres-virtuosas.html: be0dd8e96707507f8239aa38beb6ecf23d13d0087c7ee9cbcc43eaf5cc80961e
- api/mulheres-inscricao.php: 01b12f098075ce983a018b3a285bd4de7f89498e40b3f6258a169a44549ca013
