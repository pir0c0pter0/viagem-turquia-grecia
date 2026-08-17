# Rateio inteiro das hospedagens

## Objetivo

Exibir os valores das hospedagens como um rateio simples entre cinco pessoas, sempre arredondando o valor individual para cima até o próximo real inteiro e recalculando o total como valor individual multiplicado por cinco.

## Regra

- Aplicar `arredondar para cima(total pago ÷ 5)` ao valor por hóspede.
- Exibir o novo total como `valor inteiro por hóspede × 5`.
- Identificar os valores como rateio arredondado, sem apresentá-los como o total exato do comprovante.
- Remover rateios com centavos residuais.
- Manter ferries e atrações como estão, pois seus valores por pessoa já são inteiros.

## Valores resultantes

- Atenas, 05–08/09: R$ 569 por hóspede e R$ 2.845 para o grupo.
- Atenas, 15–19/09: R$ 884 por hóspede e R$ 4.420 para o grupo.
- Atenas, consolidado: R$ 1.453 por hóspede e R$ 7.265 para o grupo.
- Santorini, 09–12/09: R$ 1.357 por hóspede e R$ 6.785 para o grupo.
- Naxos, 12–15/09: R$ 810 por hóspede e R$ 4.050 para o grupo.

## Exibição

- Atualizar os itens de hospedagem em “Reservas críticas”.
- Atualizar os cabeçalhos das seções de Atenas, Santorini e Naxos.
- Incluir uma nota curta informando que os valores das hospedagens são rateios arredondados para cima.
- Não alterar datas, nomes, links, reservas ou logística do roteiro.

## Verificação

Atualizar o teste existente para confirmar os cinco rateios inteiros, os totais recalculados e a nota de arredondamento, além de impedir que os antigos valores com centavos continuem visíveis nas hospedagens.

## Fora do escopo

- Não recalcular ferries ou atrações.
- Não criar cálculo dinâmico em JavaScript.
- Não alterar os valores históricos registrados nas especificações anteriores.
