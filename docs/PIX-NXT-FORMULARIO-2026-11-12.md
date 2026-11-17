# Pix e pagamento do NXT CAMP — 12/11/2026

O ajuste visual do Pix deste PR foi publicado no cPanel. O formulário oficial manteve o QR Code, o código Pix, o link Sipag e o envio de comprovante. Em teste no navegador, o conteúdo da área de transferência coincidiu com o código e o campo ficou oculto. A confirmação de cópia dura 2,2 segundos; se a cópia automática falhar, o campo fica disponível para cópia manual.

Backup privado da publicação visual: `/home/novaigre/nib-manutencao/nib-pix-formulario-20261112-0uraj96z`. Os três arquivos publicados foram verificados por HTTPS e comparados com a versão preparada.

## Correção de texto pendente de publicação

No resumo do checkout oficial da Sipag para R$ 80,00, a modalidade exibida é cartão de crédito. O checkout não exibiu débito; parcelamento em 2x não foi verificado. O formulário deve informar **Pix ou cartão de crédito**, sem anunciar débito ou parcelamento.

O script `scripts/ajustar-nxt-cartao-credito.py` altera apenas quatro trechos de texto no HTML em produção. Não altera valor, QR Code, código Pix ou URL da Sipag. Foi testado com a cópia do HTML oficial e a comparação mostrou apenas as quatro alterações esperadas.

A correção do texto **não foi publicada**: o terminal do cPanel falhou na conexão e o Gerenciador de Arquivos retornou erro. O HTML público foi conferido após as tentativas e permaneceu idêntico ao original.

Para aplicar no servidor com o usuário da hospedagem: `python3 ajustar-nxt-cartao-credito.py`. O script verifica os trechos originais, cria backup privado e substitui o HTML. Depois, confira o texto no site oficial. A versão da main não contém o mesmo HTML de produção; não use o HTML inteiro da main para substituir o arquivo em produção.
