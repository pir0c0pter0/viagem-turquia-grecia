import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { Script, createContext, runInContext } from 'node:vm';

const root = new URL('./', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');

assert.equal([...html.matchAll(/\{d:"\d{2}\/\d{2}"/g)].length, 17, '17 dias no roteiro');
assert.equal([...html.matchAll(/\bschedule:\[/g)].length, 17, '17 dias com ordem detalhada');
const schedules = [...html.matchAll(/schedule:\[(.*?)\],\n  (?:links|planB):/gs)].map(x => x[1]);
assert.equal(schedules.length, 17, '17 agendas legíveis pelo teste');
assert(schedules.every(schedule => /Acordar e se preparar|Despertar a bordo/.test(schedule)), 'toda agenda contém despertar');
assert(schedules.every(schedule => /Almoço/.test(schedule)), 'toda agenda contém almoço');
assert(schedules.every(schedule => /Jantar/.test(schedule)), 'toda agenda contém jantar');
const galleries = [...html.matchAll(/gallery:\[(.*?)\]/gs)].map(x => x[1]);
assert.equal(galleries.length, 13, '13 dias de passeio com galeria');
assert(galleries.every(gallery => [...gallery.matchAll(/src:"assets\/images\//g)].length === 3), 'cada galeria tem exatamente 3 imagens');
assert(html.includes('5 pessoas') && !/grupo de 7|para 7|espaço para 7/.test(html), 'grupo atualizado para 5 pessoas');
assert(!/<img[^>]+src=["']https?:/i.test(html), 'nenhuma imagem HTML remota');
assert(!/img:"https?:/i.test(html), 'nenhuma imagem remota em DAYS');
assert(!html.includes('.card .pic{position:relative;min-height:100%'), 'foto não estica com a agenda');
assert(html.includes('.card-head{display:grid') && html.includes('.gallery img{display:block;width:100%;height:auto;aspect-ratio:3/2'), 'recorte 3:2 responsivo');
assert.equal([...html.matchAll(/img:""/g)].length, 4, 'só os quatro dias de voo ficam sem foto');
assert(!/catamar/i.test(html), 'catamarã removido');
assert(html.includes('<noscript>') && html.includes('Roteiro resumido'), 'fallback sem JavaScript');

for (const time of ['08:30→11:10', '13:25→15:05', '12:55→14:20', '15:00→18:55']) {
  assert(html.includes(time), `novo horário ${time}`);
}
for (const oldTime of [/12:55[–→-]14:30/, /08:25[–→-]09:55/, /14:10[–→-]17:50/]) {
  assert(!oldTime.test(html), `horário antigo removido: ${oldTime}`);
}

const ferryLinks = [
  'https://www.ferryhopper.com/?itinerary=PIR%2CPAS&dates=20260908',
  'https://www.ferryhopper.com/?itinerary=PAS%2CJTR&dates=20260909',
  'https://www.ferryhopper.com/?itinerary=JTR%2CJNX&dates=20260912',
  'https://www.ferryhopper.com/?itinerary=JNX%2CPIR&dates=20260915',
];
assert(ferryLinks.every(link => html.includes(link) || html.includes(link.replace('&', '&amp;'))), 'quatro links Ferryhopper corretos');

const attractionLinks = [
  'https://tickets.hh.gr/en/venues/acropolis-of-athens-tickets',
  'https://etickets.theacropolismuseum.gr/?culture=en',
  'https://tickets.hh.gr/en/venues/ancient-agora-of-athens-tickets',
  'https://tickets.hh.gr/en/venues/olympieion-tickets',
  'https://tickets.hh.gr/en/venues/akrotiri-thera-tickets',
  'https://tickets.hh.gr/en/venues/archaeological-museum-of-delphi-tickets',
  'https://tickets.hh.gr/en/venues/sounion',
  'https://tickets.hh.gr/en/venues/national-archaeological-museum',
  'https://www.panathenaicstadium.gr/',
  'https://archaeologicalmuseums.gr/en/museum/5df34af3deca5e2d79e8c1a0',
];
assert(attractionLinks.every(link => html.includes(link)), 'links oficiais das atrações');
assert([...html.matchAll(/💶 Comprar/g)].length >= 14, 'links de compra têm prefixo monetário');
for (const price of [
  'Acrópole · €30/pessoa · €150 grupo',
  'Museu da Acrópole · €20/pessoa · €100 grupo',
  'Ágora Antiga · €20/pessoa · €100 grupo',
  'Olympieion · €20/pessoa · €100 grupo',
  'Estádio Panatenaico · €12/pessoa · €60 grupo',
  'Akrotiri · €20/pessoa · €100 grupo',
  'Templo de Deméter · €5/pessoa · €25 grupo',
  'Delfos · €20/pessoa · €100 grupo',
  'Sounion · €20/pessoa · €100 grupo',
  'Museu Arqueológico Nacional · €20/pessoa · €100 grupo',
]) assert(html.includes(price), `preço exibido: ${price}`);
assert(html.includes('€187/pessoa · €935 para 5 adultos'), 'total das atrações para o grupo');

const day14 = html.match(/\{d:"14\/09"([\s\S]*?)\n \{sec:/)?.[1] ?? '';
const demeter = day14.indexOf('["09:20-10:20","Templo de Deméter"');
const halki = day14.indexOf('["10:40-12:15","Halki"');
const apiranthos = day14.indexOf('["14:15-15:30","Apiranthos"');
assert(demeter >= 0 && demeter < halki && halki < apiranthos, '14/09 segue Deméter → Halki → Apiranthos');
assert(day14.includes('visita concluída bem antes do fechamento às 15:30'), 'Templo de Deméter termina antes das 15:30');

const day13 = html.match(/\{d:"13\/09"([\s\S]*?)\n \{d:"14\/09"/)?.[1] ?? '';
assert(day13.includes('Lancha pela costa sudoeste') && day13.includes('lotação legal para as 5 pessoas'), '13/09 inclui lancha segura para todo o grupo');
assert(day13.includes('sem habilitação') && day13.includes('contratar skipper'), '13/09 mantém alternativa quando a lancha sem habilitação não comportar o grupo');

const images = new Set([...html.matchAll(/assets\/images\/[a-z0-9-]+\.webp/g)].map(x => x[0]));
await Promise.all([...images].map(path => access(new URL(path, root))));

// --- semântica, acessibilidade e compartilhamento ---
assert(html.includes('<main class="wrap">') && html.includes('</main>'), 'conteúdo dentro de <main>');
assert(html.includes('<meta name="description"') && html.includes('property="og:title"'), 'metadados de descrição e compartilhamento');
assert(html.includes('<meta name="color-scheme" content="light dark">'), 'color-scheme declarado');
assert(html.includes('<dialog id="idea-dialog" aria-labelledby="idea-h">'), 'diálogo com nome acessível');
assert(html.includes('class="route" role="img" aria-label="Rota da viagem:'), 'rota com descrição acessível');
for (const label of ['aria-label="Curtir', 'aria-label="Editar ideia"', 'aria-label="Excluir ideia"'])
  assert(html.includes(label), `botão de ideia com nome acessível: ${label}`);
assert(html.includes('aria-pressed="${liked'), 'estado do curtir exposto');
assert(html.includes('<figure>${image(p.src)}<figcaption>${p.alt}</figcaption>'), 'alt da galeria não repete a legenda');

// --- cor de link visitado: uma variável, sem regra duplicada vencendo o modo escuro ---
assert(html.includes('a:visited{color:var(--visited)}'), 'link visitado usa variável');
assert.equal([...html.matchAll(/a:visited\{/g)].length, 1, 'uma única regra a:visited');
assert(html.includes('--visited:#6b4aa5') && html.includes('--visited:#b89af5'), 'variante clara e escura do visitado');

// --- robustez do JavaScript ---
assert(html.includes('function imageFailed(img)') && html.includes("img.closest('.card')"),
  'foto quebrada colapsa o card certo, não o .card-head');
assert(!/onerror="this\.parentElement/.test(html), 'sem fallback de imagem no elemento errado');
assert(html.includes('onerror="imageFailed(this)"'), 'imagens usam o fallback único');
assert(html.includes('x.links.length?'), 'dias sem link não geram <nav> vazia');
assert(!/localStorage\.idea/.test(html), 'localStorage sempre via guarda try/catch');
assert(html.includes('self.crypto&&crypto.randomUUID'), 'id do cliente com alternativa fora de contexto seguro');
assert(html.includes("Object.prototype.hasOwnProperty.call(CATS,i.categoria)"), 'categoria não busca no protótipo');
assert(html.includes('const byDay=new Map()'), 'agrupamento por dia imune a chaves como __proto__');
assert.equal([...html.matchAll(/guard\(ref\./g)].length, 4, 'as quatro escritas no Firebase avisam em caso de erro');
assert(html.includes('campo.setCustomValidity'), 'título só com espaços recebe aviso');

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x => x[1]).join('\n');
new Script(scripts, { filename: 'index.inline.js' });

// --- regras do Firebase ---
const rules = JSON.parse(await readFile(new URL('firebase-rules.json', root), 'utf8'));
const idea = rules.rules.ideias.$id;
for (const field of ['ownerId', 'criadoEm'])
  assert(/!data\.exists\(\) \|\| data\.val\(\) === newData\.val\(\)/.test(idea[field]['.validate']),
    `${field} imutável depois de criado`);
assert.equal(rules.rules.$other['.read'], false, 'resto do banco fechado');

// --- link compartilhado no grupo ---
const site = 'https://pir0c0pter0.github.io/viagem-turquia-grecia/';
assert(html.includes(`<meta property="og:url" content="${site}">`), 'og:url absoluta');
assert(html.includes(`content="${site}assets/images/hero-oia.webp"`), 'og:image absoluta');
assert(html.includes('name="twitter:card" content="summary_large_image"'), 'preview grande no Twitter/X');

// --- painel de reservas: as datas se datam sozinhas na abertura da página ---
const reservas = html.match(/<section class="critical" id="reservas">([\s\S]*?)<\/section>/)[1];
assert.equal([...reservas.matchAll(/limite: <time datetime="\d{4}-\d{2}-\d{2}">/g)].length, 6, 'os seis itens críticos têm limite em <time>');
assert(!/limite: \d{2}\/\d{2}\/\d{4}/.test(reservas), 'nenhum limite solto, sem <time>');
assert(!/limite: <time datetime="2026-07/.test(reservas), 'nenhum limite anterior à revisão de agosto');
assert(!/lugares confirmados/.test(html), 'disponibilidade consultada não é reserva confirmada');
assert(reservas.includes('<b>Nenhuma outra reserva foi fechada até agora</b>'), 'estado real das reservas em destaque');
assert.equal([...reservas.matchAll(/<time datetime="2026-07-20" class="snap">/g)].length, 2, 'as duas cotações marcadas como retrato');

const firstScript = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const etiquetas = hoje => {
  const out = [];
  const els = [...reservas.matchAll(/<time datetime="([^"]+)"( class="snap")?>([^<]+)<\/time>/g)].map(m => ({
    dateTime: m[1],
    classList: { contains: c => c === 'snap' && Boolean(m[2]) },
    after: (_espaco, chip) => out.push(`${m[3]} ${chip.className}: ${chip.textContent}`),
  }));
  const ctx = {
    console,
    Date: class extends Date { constructor(...a) { a.length ? super(...a) : super(`${hoje}T12:00:00`) } },
    document: {
      getElementById: () => ({ set innerHTML(_) {} }),
      querySelectorAll: s => (s.includes('#reservas') ? els : []),
      createElement: () => ({ className: '', textContent: '' }),
    },
  };
  createContext(ctx);
  runInContext(firstScript, ctx);
  return out;
};
const emDia = etiquetas('2026-08-14');
assert(emDia.includes('17/08/2026 due: faltam 3 dias'), 'limite futuro mostra a contagem');
assert(emDia.includes('18/08/2026 due: faltam 4 dias'), 'limite dos hotéis na semana da revisão');
assert(emDia.includes('20/07/2026 due: cotação de 25 dias atrás · reconferir'), 'cotação antiga mostra a idade');
assert(etiquetas('2026-09-01').includes('17/08/2026 due overdue: prazo vencido há 15 dias'), 'limite passado aparece como vencido');
assert(etiquetas('2026-08-17').includes('17/08/2026 due overdue: vence hoje'), 'limite do dia avisa que vence hoje');
assert(etiquetas('2026-08-16').includes('17/08/2026 due: falta 1 dia'), 'singular correto na véspera');
assert(!etiquetas('2026-07-20').some(c => c.startsWith('20/07/2026')), 'cotação do próprio dia não vira aviso');

console.log(`OK: 17 dias, 17 agendas e ${images.size} imagens locais.`);
