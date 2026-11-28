# Partes do app.js e do app.css

`aplicativo/app.js` e `aplicativo/app.css` (o que vai ao ar) são montados juntando estas partes na ordem do nome.

- `js/01-base-estado.js` … `js/09-equipe.js`: o código do app, dividido por assunto (início, pílulas, check-in, navegação, contas, equipe).
- `css/01-base-inicio.css` … `css/09-pilulas-e-depois.css`: os estilos, na mesma ordem em que eram aplicados (a ordem importa: regras de baixo valem sobre as de cima).

Como editar:
1. Mude a parte certa aqui em `fonte/`.
2. Rode `python3 scripts/montar-app.py` na raiz do repositório (grava `app.js` e `app.css`).
3. Rode `node sw-version.cjs --write` dentro de `aplicativo/` (versão nova do app no celular) e os testes.

Se alguém editar `app.js`/`app.css` direto, `python3 scripts/montar-app.py --separar` leva a mudança de volta às partes.
A verificação do GitHub (`.github/workflows/testes-app.yml`) e o `scripts/empacotar-app.py` param se as partes e o arquivo montado estiverem diferentes.
As partes são uma única função (o app.js inteiro fica dentro de `(() => { ... })()`), então uma parte sozinha não roda: é só para organizar a edição.
