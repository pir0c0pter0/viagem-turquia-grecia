# Hospedagens de Atenas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir no roteiro as duas hospedagens de Atenas já reservadas, seus valores totais e o rateio entre cinco hóspedes.

**Architecture:** Manter os dados como conteúdo estático no `index.html`, seguindo o padrão existente das reservas compradas. Estender o teste simples em Node para impedir a remoção acidental de datas, valores, status e rateio.

**Tech Stack:** HTML, JavaScript inline e Node.js `assert`.

## Global Constraints

- Grupo de exatamente cinco hóspedes.
- Primeira estadia: 05–08/09, R$ 2.844,70 no total e R$ 568,94 por hóspede.
- Segunda estadia: 15–19/09, R$ 4.419,31 no total e R$ 883,86 por hóspede.
- Acumulado: R$ 7.264,01; quatro hóspedes pagam R$ 1.452,80 e um paga R$ 1.452,81.
- Não alterar hotéis ainda não reservados, atrações, voos ou ferries.

---

### Task 1: Registrar as hospedagens reservadas

**Files:**
- Modify: `test-itinerary.mjs:72`
- Modify: `index.html:194-200`
- Modify: `index.html:352`
- Modify: `index.html:431`

**Interfaces:**
- Consumes: o HTML estático lido por `test-itinerary.mjs`.
- Produces: textos visíveis com datas, status, totais e rateios das hospedagens de Atenas.

- [ ] **Step 1: Escrever o teste que falha**

Adicionar depois da verificação do total das atrações:

```js
for (const stay of [
  '05–08/09 · 3 noites · R$ 2.844,70 total · R$ 568,94 por hóspede',
  '15–19/09 · 4 noites · R$ 4.419,31 total · R$ 883,86 por hóspede',
]) assert(html.includes(stay), `hospedagem reservada exibida: ${stay}`);
assert(html.includes('Hospedagens de Atenas · reservadas ✓'), 'status das hospedagens de Atenas exibido');
assert(html.includes('Total reservado: R$ 7.264,01 · rateio final: 4 × R$ 1.452,80 + 1 × R$ 1.452,81'), 'total e centavo residual exibidos');
```

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `node test-itinerary.mjs`

Expected: FAIL com `hospedagem reservada exibida: 05–08/09`.

- [ ] **Step 3: Implementar o conteúdo mínimo**

Em “Reservas críticas”, inserir uma entrada dedicada e renumerar as entradas seguintes:

```html
<li><span class="n">4</span><div><strong>Hospedagens de Atenas · reservadas ✓</strong><small>05–08/09 · 3 noites · R$ 2.844,70 total · R$ 568,94 por hóspede.<br>15–19/09 · 4 noites · R$ 4.419,31 total · R$ 883,86 por hóspede.<br><b>Total reservado: R$ 7.264,01 · rateio final: 4 × R$ 1.452,80 + 1 × R$ 1.452,81.</b></small></div></li>
```

Atualizar os cabeçalhos dos blocos para repetir cada reserva no ponto de uso:

```js
{sec:"Atenas",tag:"05–08/09 · 3 noites · reservado ✓ · R$ 2.844,70 total · R$ 568,94 por hóspede"},
{sec:"Atenas · reta final",tag:"15–19/09 · 4 noites · reservado ✓ · R$ 4.419,31 total · R$ 883,86 por hóspede"},
```

- [ ] **Step 4: Executar todas as verificações**

Run: `node test-itinerary.mjs && git diff --check`

Expected: `OK: 17 dias, 17 agendas e 34 imagens locais.` e saída zero de `git diff --check`.

- [ ] **Step 5: Commitar a atualização**

```bash
git add index.html test-itinerary.mjs docs/superpowers/plans/2026-08-17-hospedagens-atenas.md
git commit -m "Registra hospedagens reservadas em Atenas"
```
