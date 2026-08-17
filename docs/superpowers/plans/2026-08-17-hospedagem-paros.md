# Hospedagem de Paros Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Registrar o Hotel Kontes Comfort como reservado em Paros com o rateio inteiro aprovado.

**Architecture:** Alterar somente os textos de reserva e base existentes em `index.html`. Proteger a informação com as asserções simples já usadas em `test-itinerary.mjs`.

**Tech Stack:** HTML, JavaScript e `node:assert`.

## Global Constraints

- Exibir somente `R$ 4.530 total do rateio · R$ 906 por hóspede`.
- Não exibir o valor aproximado de R$ 4.527.
- Manter cinco hóspedes, quatro quartos e uma noite de 08 a 09/09/2026.
- Não alterar o visual, criar componentes ou adicionar dependências.

---

### Task 1: Registrar a hospedagem de Paros

**Files:**
- Modify: `test-itinerary.mjs:73-101`
- Modify: `index.html:198-215`
- Modify: `index.html:372`

**Interfaces:**
- Consumes: o HTML estático lido por `test-itinerary.mjs`.
- Produces: textos consistentes da reserva de Paros nas reservas críticas, bases e cabeçalho da seção.

- [ ] **Step 1: Escrever o teste que falha**

Adicionar às verificações de hospedagem:

```js
for (const booking of [
  'Hospedagem de Paros · reservada ✓',
  'Hotel Kontes Comfort · Parikia',
  '08–09/09 · 1 noite · 4 quartos · R$ 4.530 total do rateio · R$ 906 por hóspede',
  'https://www.booking.com/hotel/gr/kontes.pt-br.html?checkin=2026-09-08&amp;checkout=2026-09-09&amp;group_adults=5&amp;no_rooms=4&amp;group_children=0',
]) assert(html.includes(booking), `reserva de Paros exibida: ${booking}`);
assert(html.includes('<strong>Paros:</strong> Hotel Kontes Comfort, em Parikia'), 'base reservada de Paros exibida');
assert(html.includes('Todas as hospedagens do roteiro estão reservadas.'), 'nenhuma hospedagem permanece pendente');
assert(html.includes('{sec:"Paros",tag:"08–09/09 · 1 noite · reservado ✓ · R$ 4.530 total do rateio · R$ 906 por hóspede"}'), 'cabeçalho de Paros atualizado');
assert(!html.includes('R$ 4.527'), 'valor aproximado de Paros não exibido');
assert(!html.includes('Hotel em Paros'), 'pendência de Paros removida');
```

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `node test-itinerary.mjs`

Expected: FAIL em `reserva de Paros exibida: Hospedagem de Paros · reservada ✓`.

- [ ] **Step 3: Implementar o menor ajuste**

Substituir a pendência por:

```html
<li><span class="n">7</span><div><strong>Hospedagem de Paros · reservada ✓</strong><small><a href="https://www.booking.com/hotel/gr/kontes.pt-br.html?checkin=2026-09-08&amp;checkout=2026-09-09&amp;group_adults=5&amp;no_rooms=4&amp;group_children=0" target="_blank" rel="noopener">Hotel Kontes Comfort · Parikia</a> · 08–09/09 · 1 noite · 4 quartos · R$ 4.530 total do rateio · R$ 906 por hóspede.</small></div></li>
```

Atualizar a base para `Hotel Kontes Comfort, em Parikia`, informar que todas as hospedagens estão reservadas e trocar o cabeçalho da seção por:

```js
{sec:"Paros",tag:"08–09/09 · 1 noite · reservado ✓ · R$ 4.530 total do rateio · R$ 906 por hóspede"}
```

- [ ] **Step 4: Executar a verificação completa**

Run: `node test-itinerary.mjs && git diff --check`

Expected: `OK: itinerário validado` e saída sem erros.

- [ ] **Step 5: Commitar**

```bash
git add test-itinerary.mjs index.html docs/superpowers/plans/2026-08-17-hospedagem-paros.md
git commit -m "Registra hospedagem de Paros"
```
