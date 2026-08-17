# Hospedagem reservada em Naxos

## Objetivo

Registrar no roteiro a Melitoma Home, em Naxos, já reservada para cinco pessoas de 12 a 15/09/2026, e ajustar a logística do último dia ao checkout antecipado.

## Exibição

- Incluir em “Reservas críticas” um item “Hospedagem de Naxos · reservada ✓”, com link para o anúncio do Airbnb.
- Mostrar as três noites, o total pago de R$ 4.049,33 e aproximadamente R$ 809,87 por hóspede.
- Mostrar o rateio exato: quatro hóspedes pagam R$ 809,87 e um paga R$ 809,85.
- Atualizar o cabeçalho do bloco de Naxos com datas, status, total e valor aproximado por hóspede.
- Retirar Naxos das hospedagens pendentes. Com a implementação da especificação de Santorini já aprovada, apenas Paros permanecerá pendente.

## Base e deslocamentos

- Manter Chora como base de Naxos e identificar a hospedagem como Melitoma Home.
- Ajustar o check-in de 12/09 e as referências à base nos dias 13 e 14/09.
- Em 15/09, registrar checkout antes das 09:00 e armazenamento das malas na hospedagem, se confirmado, ou em guarda-volumes local antes do ferry das 15:00.
- Não alterar horários ou valores dos ferries já comprados.

## Verificação

Ampliar o teste existente para confirmar que nome, datas, link, total, rateio, status reservado, checkout e nova identificação da base aparecem no HTML, e que Naxos não permanece entre as hospedagens pendentes.

## Fora do escopo

- Não redesenhar o site nem criar componentes.
- Não adicionar imagem da hospedagem.
- Não alterar a hospedagem ainda não reservada em Paros.
- Não replanejar os passeios de Naxos além dos ajustes necessários de origem, destino e bagagem.
