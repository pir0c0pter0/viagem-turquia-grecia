# Hospedagens de Santorini e Naxos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir no roteiro as reservas confirmadas de Santorini e Naxos, seus valores e rateios, e alinhar os deslocamentos às hospedagens reais.

**Architecture:** Manter os dados como conteúdo estático no `index.html`, seguindo o padrão já usado pelas hospedagens de Atenas. Estender o teste Node existente com verificações dos textos, links e ajustes logísticos; não criar componentes ou dependências.

**Tech Stack:** HTML, JavaScript inline e Node.js `assert`.

## Global Constraints

- Grupo de cinco hóspedes.
- Santorini: Athinais Mansion, Megalochori, 09–12/09/2026, três noites, R$ 6.784,59.
- Naxos: Melitoma Home, Chora, 12–15/09/2026, três noites, R$ 4.049,33.
- Manter horários e valores dos ferries já comprados.
- Apenas Paros permanece com hospedagem pendente.
- Não redesenhar o site, criar componentes ou adicionar imagens.

---

### Task 1: Registrar as duas hospedagens e ajustar o roteiro

**Files:**
- Modify: `test-itinerary.mjs:73-80`
- Modify: `index.html:194-212`
- Modify: `index.html:382-437`

**Interfaces:**
- Consumes: o HTML estático lido por `test-itinerary.mjs`.
- Produces: textos visíveis com reservas, valores, rateios, bases e logística de checkout.

- [x] **Step 1: Escrever o teste que falha**

Adicionar depois das verificações das hospedagens de Atenas:

```js
for (const stay of [
  '09–12/09 · 3 noites · R$ 6.784,59 total · R$ 1.356,92 por hóspede',
  '12–15/09 · 3 noites · R$ 4.049,33 total · R$ 809,87 por hóspede',
]) assert(html.includes(stay), `hospedagem reservada exibida: ${stay}`);
for (const booking of [
  'Hospedagem de Santorini · reservada ✓',
  'Hospedagem de Naxos · reservada ✓',
  'https://www.airbnb.com.br/rooms/1376191516126500714',
  'https://www.airbnb.com.br/rooms/586349424632209829',
  'Rateio final: 4 × R$ 1.356,92 + 1 × R$ 1.356,91',
  'Rateio final: 4 × R$ 809,87 + 1 × R$ 809,85',
]) assert(html.includes(booking), `reserva exibida: ${booking}`);
assert(html.includes('Hotel em Paros') && !html.includes('Hotéis em Paros, Santorini e Naxos'), 'somente Paros permanece pendente');
assert(html.includes('{sec:"Santorini",tag:"09–12/09 · 3 noites · reservado ✓ · R$ 6.784,59 total · R$ 1.356,92 por hóspede"}'), 'cabeçalho de Santorini atualizado');
assert(html.includes('{sec:"Naxos",tag:"12–15/09 · 3 noites · reservado ✓ · R$ 4.049,33 total · R$ 809,87 por hóspede"}'), 'cabeçalho de Naxos atualizado');
assert(html.includes('Athinais Mansion, em Megalochori') && html.includes('Melitoma Home, em Chora'), 'bases reservadas exibidas');
assert(html.includes('Checkout na Melitoma Home antes das 09:00') && html.includes('guarda-volumes local'), 'checkout antecipado e bagagem de Naxos exibidos');
```

- [x] **Step 2: Executar o teste e confirmar a falha**

Run: `node test-itinerary.mjs`

Expected: FAIL com `hospedagem reservada exibida: 09–12/09`.

- [x] **Step 3: Implementar o conteúdo mínimo**

Em “Reservas críticas”, inserir duas entradas com os links dos anúncios e estes textos:

```html
<strong>Hospedagem de Santorini · reservada ✓</strong>
<small><a href="https://www.airbnb.com.br/rooms/1376191516126500714" target="_blank" rel="noopener">Athinais Mansion · Megalochori</a> · 09–12/09 · 3 noites · R$ 6.784,59 total · R$ 1.356,92 por hóspede.<br><b>Rateio final: 4 × R$ 1.356,92 + 1 × R$ 1.356,91.</b></small>

<strong>Hospedagem de Naxos · reservada ✓</strong>
<small><a href="https://www.airbnb.com.br/rooms/586349424632209829" target="_blank" rel="noopener">Melitoma Home · Chora</a> · 12–15/09 · 3 noites · R$ 4.049,33 total · R$ 809,87 por hóspede.<br><b>Rateio final: 4 × R$ 809,87 + 1 × R$ 809,85.</b></small>
```

Substituir a pendência conjunta por “Hotel em Paros” e renumerar os itens posteriores. Atualizar as bases para:

```html
<strong>Santorini:</strong> Athinais Mansion, em Megalochori · <strong>Naxos:</strong> Melitoma Home, em Chora
```

Atualizar os cabeçalhos das seções para:

```js
{sec:"Santorini",tag:"09–12/09 · 3 noites · reservado ✓ · R$ 6.784,59 total · R$ 1.356,92 por hóspede"}
{sec:"Naxos",tag:"12–15/09 · 3 noites · reservado ✓ · R$ 4.049,33 total · R$ 809,87 por hóspede"}
```

Nos dias 09–12/09, substituir a base provisória em Fira pela Athinais Mansion em Megalochori e manter Fira apenas como passeio, incluindo os transfers necessários. Nos dias 12–14/09, identificar o check-in e a base como Melitoma Home em Chora. Em 15/09, usar esta sequência:

```js
["07:30-08:30","Acordar e se preparar","1h · café e organização das malas na Melitoma Home"],
["08:30-09:00","Checkout na Melitoma Home antes das 09:00","30 min · deixar as malas na hospedagem, se confirmado, ou em guarda-volumes local"],
["09:00-11:45","Manhã livre em Chora","2h45 · a pé · café e compras"],
["11:45-13:00","Almoço em Chora","1h15 · perto da hospedagem ou do guarda-volumes"],
["13:00-14:00","Retirar bagagem e seguir ao porto","1h · a pé ou transfer curto; estar no porto às 14:00"]
```

- [x] **Step 4: Executar a verificação completa**

Run: `node test-itinerary.mjs && git diff --check`

Expected: `OK: 17 dias, 17 agendas e 34 imagens locais.` e nenhum erro de whitespace.

- [x] **Step 5: Commitar a atualização**

```bash
git add index.html test-itinerary.mjs docs/superpowers/plans/2026-08-17-hospedagens-santorini-naxos.md
git commit -m "Registra hospedagens de Santorini e Naxos"
```
