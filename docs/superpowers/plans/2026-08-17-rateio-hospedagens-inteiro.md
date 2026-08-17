# Rateio Inteiro das Hospedagens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir todas as hospedagens com valor inteiro por hóspede, arredondado para cima, e total do rateio recalculado para cinco pessoas.

**Architecture:** Substituir somente os textos estáticos de hospedagem no `index.html`, preservando o total pago original nos documentos históricos. Atualizar o teste Node existente para proteger os novos rateios e impedir a reintrodução dos valores com centavos.

**Tech Stack:** HTML, JavaScript inline e Node.js `assert`.

## Global Constraints

- Aplicar `arredondar para cima(total pago ÷ 5)` ao valor por hóspede.
- Calcular o total do rateio como `valor inteiro por hóspede × 5`.
- Identificar os totais como rateio arredondado, não como valor exato do comprovante.
- Não alterar ferries, atrações, datas, nomes, links, reservas ou logística.
- Não criar cálculo dinâmico ou dependências.

---

### Task 1: Atualizar os rateios das hospedagens

**Files:**
- Modify: `test-itinerary.mjs:73-97`
- Modify: `index.html:198-205`
- Modify: `index.html:355-434`

**Interfaces:**
- Consumes: o HTML estático lido por `test-itinerary.mjs`.
- Produces: cinco rateios inteiros e seus totais recalculados para o grupo.

- [x] **Step 1: Escrever o teste que falha**

Substituir as verificações atuais das hospedagens por:

```js
for (const stay of [
  '05–08/09 · 3 noites · R$ 2.845 total do rateio · R$ 569 por hóspede',
  '15–19/09 · 4 noites · R$ 4.420 total do rateio · R$ 884 por hóspede',
  '09–12/09 · 3 noites · R$ 6.785 total do rateio · R$ 1.357 por hóspede',
  '12–15/09 · 3 noites · R$ 4.050 total do rateio · R$ 810 por hóspede',
]) assert(html.includes(stay), `rateio inteiro exibido: ${stay}`);
assert(html.includes('Total do rateio: R$ 7.265 · R$ 1.453 por hóspede'), 'consolidado inteiro de Atenas exibido');
assert(html.includes('Hospedagens: valores individuais arredondados para cima'), 'regra de arredondamento explicada');
for (const oldValue of [
  'R$ 2.844,70 total · R$ 568,94',
  'R$ 4.419,31 total · R$ 883,86',
  'R$ 6.784,59 total · R$ 1.356,92',
  'R$ 4.049,33 total · R$ 809,87',
  '4 × R$ 1.356,92 + 1 × R$ 1.356,91',
  '4 × R$ 809,87 + 1 × R$ 809,85',
]) assert(!html.includes(oldValue), `rateio antigo removido: ${oldValue}`);
assert(html.includes('{sec:"Atenas",tag:"05–08/09 · 3 noites · reservado ✓ · R$ 2.845 total do rateio · R$ 569 por hóspede"}'), 'cabeçalho inicial de Atenas arredondado');
assert(html.includes('{sec:"Santorini",tag:"09–12/09 · 3 noites · reservado ✓ · R$ 6.785 total do rateio · R$ 1.357 por hóspede"}'), 'cabeçalho de Santorini arredondado');
assert(html.includes('{sec:"Naxos",tag:"12–15/09 · 3 noites · reservado ✓ · R$ 4.050 total do rateio · R$ 810 por hóspede"}'), 'cabeçalho de Naxos arredondado');
assert(html.includes('{sec:"Atenas · reta final",tag:"15–19/09 · 4 noites · reservado ✓ · R$ 4.420 total do rateio · R$ 884 por hóspede"}'), 'cabeçalho final de Atenas arredondado');
```

- [x] **Step 2: Executar o teste e confirmar a falha**

Run: `node test-itinerary.mjs`

Expected: FAIL com `rateio inteiro exibido: 05–08/09`.

- [x] **Step 3: Implementar os textos arredondados**

Usar estes resultados em “Reservas críticas” e nos cabeçalhos das seções:

```text
Atenas 05–08/09: R$ 569 por hóspede · R$ 2.845 total do rateio
Atenas 15–19/09: R$ 884 por hóspede · R$ 4.420 total do rateio
Atenas consolidado: R$ 1.453 por hóspede · R$ 7.265 total do rateio
Santorini 09–12/09: R$ 1.357 por hóspede · R$ 6.785 total do rateio
Naxos 12–15/09: R$ 810 por hóspede · R$ 4.050 total do rateio
```

Depois da lista de reservas, adicionar:

```html
<p class="lead">Hospedagens: valores individuais arredondados para cima; o total do rateio corresponde ao valor por hóspede × 5.</p>
```

Remover os dois rateios residuais com `4 × ... + 1 × ...`.

- [x] **Step 4: Executar a verificação completa**

Run: `node test-itinerary.mjs && git diff --check`

Expected: `OK: 17 dias, 17 agendas e 34 imagens locais.` e nenhum erro de whitespace.

- [x] **Step 5: Commitar a atualização**

```bash
git add index.html test-itinerary.mjs docs/superpowers/plans/2026-08-17-rateio-hospedagens-inteiro.md
git commit -m "Arredonda rateios das hospedagens"
```
