# Imagens do site mais leves (2026-11-06)

Troca **só os arquivos de imagem**, com o mesmo nome, formato e tamanho em pixels. Nenhum HTML, CSS ou JSON muda, por isso o painel administrativo e o `index.html` de produção não são afetados.

Total: 7,3 MB → 2,6 MB. O banner do NXT CAMP (inicial e formulário) passa de 2,5 MB para 434 KB cada (PNG de 256 cores, visualmente igual).

## Como publicar

1. Para cada arquivo, confira se o sha256 do arquivo atual no servidor é igual ao **sha256 de produção** abaixo. Se for diferente, não troque esse arquivo (alguém o atualizou depois de 06/11).
2. Faça backup dos originais em `/home/novaigre/nib-manutencao/imagens-leves-20261106/`.
3. Envie o arquivo do branch `claude/project-thread-gyen3b` para o mesmo caminho em `public_html`.
4. Confira o sha256 do arquivo enviado e abra `/`, `/linkdabio/` e `/next/camp-sbgp1-nov26/inscricao.html` no celular.

Para desfazer: copie de volta os arquivos do backup.

| Arquivo (em public_html) | Antes | Depois | sha256 de produção | sha256 novo |
|---|---|---|---|---|
| `img/comunidade-bg.jpg` | 52 KB | 47 KB | `4002f077320f2170e4f07b779492ce143b9436102907c04dc26dbc291b4d28d6` | `c90c2cb302e780a161641151d54426b0e021018135879f03af7a53f676b4f94b` |
| `img/construcao/obra-poster.jpg` | 183 KB | 147 KB | `cf9345bce01673d6f6ac554457964d80be7bc56db2673feaf7faf7e6d415730b` | `3ef81df68cde170cf38a4be49f8fb2ad3dcbad9413a785880e4971a63591bac7` |
| `img/cultos-bg-nova-v2.webp` | 201 KB | 164 KB | `aaa5ffdaa3e0dc1d1eebebea4e59f89186e6b1c4370dbbae12a094ae5b16525b` | `0c7494356dfc1ae45ef9aff5c1e74b5b5fd45b257052646dbe5e4361dbcfa02a` |
| `img/eventos/festa-multiplicacao-bg.webp` | 150 KB | 92 KB | `f7fa3c6d43f700b70b2d7bbec0bf57da2476bb016d1cbe63415e46266d17505b` | `2ecd28c748d9d57bc0ac886d22cdbc76fcfadfc0b7fe9d618f79bf45ca4e2a5b` |
| `img/eventos/jornada-dna.webp` | 117 KB | 29 KB | `e2c3d6e4de2201c7844cbaa8544297349115aad8530bca2d242bd38bcae0143f` | `bb5ca4e94134c0c0dc78feb938ad5e223946c519d284de228c14ec2a16e164cb` |
| `img/eventos/mulheres-virtuosas-2026.webp` | 96 KB | 55 KB | `d4c657f6368772c06d65775a79b600bea70e40c7cc4185e572378b09030a25fd` | `6cbb451acb11e33fac47ad7c412907a6fd4edcd5958b9189910fddab74c2e618` |
| `img/eventos/nxt-camp-oficial-led-recorte-v85.png` | 2496 KB | 434 KB | `17b2404c070334aaa39df4c10d55aeb559cb232078029d0022b36dd58ff9f2b5` | `d00d2c4d54884802f33573aa62658487360e3e8ebd177c1bfda83ec679937c6f` |
| `img/galeria/momentos-celebracao-01.jpg` | 332 KB | 300 KB | `d984ebef87bfe3bdbacaa0b8c762382be03c00851a8ce8d375357498dff747fb` | `df550cd636ef2be4a2619af4190f464566e9a747ab6ac264335e8f397f14cacb` |
| `img/galeria/momentos-kids-01.jpg` | 240 KB | 219 KB | `5449fd669b510309c63c3f5b122de26c0819225c5f88e6a89f53e20cab8f8eae` | `3c0eb4dccd5666ac8b99df45d5454fb10bac8124521281892d8a1bd6123234bf` |
| `img/galeria/momentos-poster.jpg` | 80 KB | 74 KB | `32d454d94ff4ee668847d4a544c3b747b6cfc1f672a719671e9d6fc6457e36ba` | `4e4950ed4c70265a2007d763544b98ff5698e927db3ac7d92fd5c986848492f3` |
| `img/hero-nib-mobile.webp` | 219 KB | 94 KB | `b54b167eaadd4ff8b67e72d2b2848061d619c42d8fc14a25e56339d652c620d9` | `09a06fff4cdfb9569bd749168183988c323659627179584aa670b81a87e41fa0` |
| `img/pastor-alex-card.webp` | 149 KB | 99 KB | `4a6527c44ba981dfca5cc4618d1f0c80bea291eb403c498420589d4daad47c21` | `a602f64efea957cba5b0343a9e27f33e144ec36905f802784724b557eb7379cd` |
| `img/pastor-sidiel-card.webp` | 86 KB | 51 KB | `ecfca4ead7d38fa5d5c066c4af06c13b85cad80ead319050f95674f44a291bc7` | `196dc92ee7737ed86ef5cbb1d575d12275c76280b6f57aeff4b68a4a40ffe6bd` |
| `img/pastora-sheila-card.webp` | 147 KB | 99 KB | `e095e4b6df0663102f6a534cec4b088c7fb8fa5bc1f6aec7705b0e1a8ccbad00` | `983528f7c4ea47e39bf1b5b1edcb4aba77cb4f0597bf6d9e323e2b11b9e4e263` |
| `img/somos-a-bg.webp` | 234 KB | 135 KB | `0d0ce036ed08b021fc6e505f1bcfe2fe271894629a8430045810aedfc3a4cb09` | `7d7517e9593d7ffec8d64db9e9439ff391a6944f1c7e12c8ccee35fef699fb74` |
| `linkdabio/img/capa.jpg` | 90 KB | 77 KB | `24c61607a1618fbe7031555348dd73471e13a899bdebb368d389652a0c0cd687` | `77e7b3d476de0a2a9574bfd84d1b17d9ab21ee4ee4b8f0359c32042f089c0c49` |
| `linkdabio/img/construcao.jpg` | 43 KB | 35 KB | `7676e5650c6a7ecdfbbe98194de8edfbd7576945a711c88793ea8265ca82ea03` | `de1b4706250977c3d96a6553b3dac2eec6b0e532774d2ed438cb1605aa389328` |
| `linkdabio/img/contato.jpg` | 34 KB | 27 KB | `90c9234653808120d5051c5482880824ece99e9441d63cd6415af18240e6b39d` | `b9a2e2cfaeabea30c67fdd5749ac55f9aedcdad88aa566f94921e24547e80b25` |
| `linkdabio/img/fundo.jpg` | 68 KB | 60 KB | `47134fdb4444f0f3f4062957282d4083abea00a2cb7ef775a389853a12d043ba` | `e5e8ab1e342cf95e01ccaece20e391b67266bb5c422b047352bfc47bf48825da` |
| `next/camp-sbgp1-nov26/img/nxt-camp-banner-form-v11.5.png` | 2496 KB | 434 KB | `17b2404c070334aaa39df4c10d55aeb559cb232078029d0022b36dd58ff9f2b5` | `d00d2c4d54884802f33573aa62658487360e3e8ebd177c1bfda83ec679937c6f` |
