# Plataforma Nib — gestão: Secretaria da igreja e Liderança Pastoral (2026-11-03)

Pedido de Hilton: mapear o que do app de membros precisa de administração e preparar as telas desses dois perfis, no padrão visual consolidado. Versão de teste: dados fictícios, só na sessão; o seletor de perfil não é controle de acesso.

## Recomendação: um app só

Um único app, com a área de gestão liberada conforme o perfil (pode ter endereço próprio, ex.: `/gestao`). Motivos: a mesma pessoa é membro e liderança (portal: uma Pessoa, vários papéis); segurança vem da permissão no servidor, não de um link separado; um código, um visual e o que o membro envia chega direto na gestão. Exceção: o financeiro, que pelas regras do portal fica isolado.

## Regra de autoridade aplicada

Base: portal-novaigrejabatista `docs/14-PERMISSOES-E-AUTORIDADE.md`. A Liderança Pastoral decide; a Secretaria organiza e registra. Onde a Secretaria registra uma decisão pastoral, o app grava "Decisão: Liderança Pastoral · Registro: Secretaria".

## Mapa: o que o membro faz → o que a gestão administra

| Área do membro | Gestão | Secretaria | Liderança Pastoral |
|---|---|---|---|
| Meu cadastro (pedido de atualização) | Cadastros | Confere e marca como atualizado | Acompanha (só leitura) |
| Membresia (formulário, reunião, apresentação no culto) | Membresia | Registra cada etapa | Registra cada etapa |
| Calendário / agenda | Agenda | Inclui e remove itens (aparecem no calendário do membro) | Vê no painel |
| Sino de avisos | Avisos | Publica e remove | Publica e remove |
| Versículo do dia | Palavra do dia | Registra a escolha pastoral (confirmação obrigatória) | Escolhe |
| Caderno de oração | Cuidado e oração | — | Acompanha pedidos (marca visível só para a liderança) e oculta do mural |
| Eventos e inscrições | Painel | Link para o painel de inscrições do site | Link para o painel de inscrições do site |
| Generosidade | Fora | Financeiro isolado, fora desta fase | Financeiro isolado, fora desta fase |
| Células | Fora | Plataforma de células própria | Plataforma de células própria |

## Telas

- **Painel**: "O que precisa da sua atenção", com contadores laranja e acesso direto a cada área. Também mostra os próximos dias da agenda e o link para o painel de inscrições.
- **Membresia**: um cartão por pessoa, com o stepper laranja 01/02/03 (Formulário → Reunião → Apresentação), um botão para a próxima etapa e o histórico de quem registrou cada uma. A apresentação exige uma data já passada e confirmação explícita.
- **Cadastros**: pedidos dos membros, mostrando o dado pedido, o status e quem atualizou.
- **Agenda**: formulário para incluir itens (nome, data, horário, tipo), a lista do que foi incluído e a programação fixa.
- **Avisos**: formulário para publicar e a lista do que foi publicado. O membro vê um ponto laranja no sino e a lista de avisos.
- **Palavra do dia**: escolha por data e prévia do versículo de hoje com o registro de autoria.
- **Cuidado e oração** (Pastoral): números do caderno e, por pedido, os botões "Acompanhar" e "Ocultar do mural".

Na barra inferior do celular aparecem 5 atalhos por perfil. O menu completo fica no menu lateral.

## Integração dentro da sessão de teste

Pedido de cadastro do membro → Cadastros. Item incluído na agenda → calendário do membro. Aviso publicado → sino do membro. Pedido ocultado → some do mural do membro. O caderno não reinicia mais ao trocar de perfil, para a liderança ver o que o membro publicou.

## Decisões de Hilton (2026-11-03)

- Ordem das etapas de membresia é obrigatória: formulário → reunião de integração → apresentação. O app bloqueia registrar fora da ordem.
- Todos podem publicar no caderno de oração sem aprovação; há um filtro simples de palavras de baixo calão e ofensas (`aplicativo/moderation.js`, testes em `moderation.test.cjs`).
- A Secretaria pode ver o caderno (sem acompanhar ou ocultar, que ficam com a Liderança Pastoral).
- Painel da gestão usa o mesmo bloco de atalhos da inicial do membro.
- Avisos e agenda cadastrados na gestão aparecem também em Informações → Programação e avisos.

## Decisões em aberto

- Quem pode publicar avisos e se precisam de aprovação (hoje: Secretaria e Liderança, sem aprovação).
- Login, permissões no servidor e persistência (o que deixa de ser teste).

## Ajustes (2026-11-03, tarde)

- A Secretaria também pode ocultar ou mostrar pedidos no mural. "Acompanhar" continua só com a Liderança Pastoral.
- Agenda e Avisos: data de início, data de término, horário de início e horário de término, e a opção "Acontece em um único dia" (marcada por padrão). Um item de vários dias aparece em cada dia do período. Validações: término não pode ser antes do início, período de até 60 dias, e no mesmo dia o horário de término vem depois do de início.
- Campos dentro do bloco: no iOS Safari, campos de data e hora deixam de ter largura própria; grades com `minmax(0,1fr)`; datas em coluna única no celular.
- Aviso com data: aparece no sino, em Informações → Avisos (com o período) e na lista Programação/calendário nas datas informadas. Remover o aviso tira também da programação.
