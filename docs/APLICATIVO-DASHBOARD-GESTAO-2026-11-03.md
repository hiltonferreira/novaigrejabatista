# Dashboard da gestão (Secretaria e Liderança Pastoral)

Data: 03/11/2026 · Branch `claude/project-thread-gyen3b` · Link de teste: https://claude.ai/artifact/6ebkPb5arSJLyinBbzuwmP

## Referência de mercado

Esta análise compara o que os sistemas de gestão de igrejas mais usados costumam mostrar no painel inicial: Planning Center, Breeze, ChurchTrac e Church Community Builder (EUA), e InChurch (Brasil). A lista vem do conhecimento geral sobre esses produtos. Não fiz uma auditoria de cada painel.

| Indicador | Aparece com frequência | Entrou no app |
|---|---|---|
| Total de membros e novos membros no período | Sim, em todos | Sim |
| Vínculos: membro, frequentador e visitante | Sim (o portal usa os mesmos três vínculos, doc 03) | Sim |
| Visitantes no mês e quantos vieram pela primeira vez | Sim (cartão do visitante / check-in) | Sim |
| Presença nos cultos ao longo das semanas | Sim (contagem por culto) | Sim, gráfico de 8 domingos |
| Funil de integração do visitante até a membresia | Comum nos sistemas de "assimilação" | Sim, usando as 3 etapas obrigatórias |
| Grupos pequenos (células): quantidade, participantes e membros sem grupo | Sim | Sim, com quantidade de células (pedido do Hilton) |
| Aniversariantes da semana | Muito comum nos sistemas brasileiros | Sim, no perfil Secretaria |
| Pessoas afastadas (sem presença há X semanas) e visitantes sem retorno | Sim, como lista de "follow-up" | Sim, no perfil Liderança Pastoral |
| Financeiro: total do mês, contribuintes, meta | Sim | **Não.** O financeiro fica isolado (decisão anterior). Precisa da decisão do Hilton |
| Voluntários e escalas | Sim | Não. Fica para quando houver escalas (portal, doc 06) |
| Inscrições em eventos | Sim | Atalho para o painel de inscrições do site, que já existe |

## O que cada perfil vê

- **Os dois perfis:** cinco números (membros ativos, frequentadores, visitantes do mês, células ativas e presença média), o gráfico de presença, o funil de integração e o bloco Vida em célula.
- **Secretaria:** os aniversariantes da semana, porque a Secretaria envia os parabéns (portal, doc 05).
- **Liderança Pastoral:** o bloco "Quem precisa de atenção", com membros afastados, visitantes sem retorno e pedidos de oração ativos.

## De onde virão os números

Todos os números da versão de teste são fictícios. Para cada número, a versão real vai precisar de uma fonte:

- **Membros, frequentadores e aniversários:** o cadastro de pessoas, que ainda será criado e terá o vínculo e a data de nascimento.
- **Visitantes:** o cartão do visitante, em papel ou formulário, lançado pela Secretaria.
- **Presença nos cultos:** uma contagem por culto, lançada pela Secretaria ou pela recepção.
- **Células:** a plataforma de células. A fonte ainda está em aberto, junto com a célula do membro no calendário.
- **Funil de integração:** as etapas registradas em Membresia (este número já é real dentro do app).
- **Afastados:** a presença no culto e na célula, cruzada com o cadastro.

## Decisões pendentes

1. O Pastoral vê um resumo financeiro (total do mês e número de contribuintes, sem nomes)? Ou o financeiro continua só com a tesouraria?
2. A presença nos cultos será contada? Quem lança a contagem?
3. Como o visitante é registrado: cartão em papel, QR Code na recepção ou formulário no site?
