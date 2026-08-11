import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { Script } from 'node:vm';

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

// ---------- coerência dos horários ----------
const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fmt = v => `${Math.floor(v / 60)}h${String(v % 60).padStart(2, '0')}`;
// Trechos que cruzam fuso: o bloco é o relógio local, a nota traz a duração real do voo.
const crossTimezone = new Set(['08:15-11:10', '19:30-20:40']);

for (const [, day, body] of html.matchAll(/\{d:"(\d{2}\/\d{2})"[\s\S]*?schedule:\[(.*?)\],\n {2}(?:links|planB):/g)) {
  const blocks = [...body.matchAll(/\["(\d{2}:\d{2})-(\d{2}:\d{2})","(.*?)","(.*?)"\]/g)];
  assert(blocks.length >= 5, `${day}: agenda com blocos legíveis`);
  let prevEnd = null;
  for (const [, start, end, title, note] of blocks) {
    const [from, to] = [toMin(start), toMin(end)];
    assert(to > from, `${day} · ${title}: bloco ${start}-${end} termina antes de começar`);
    if (prevEnd !== null) {
      assert(from >= prevEnd, `${day} · ${title}: sobreposição com o bloco anterior`);
      assert(from - prevEnd < 20, `${day} · ${title}: buraco de ${fmt(from - prevEnd)} sem bloco antes de ${start}`);
    }
    const stated = note.match(/^~?(?:até )?(?:(\d+)h(\d{2})?|(\d+)\s*min)(?=$| |·)/);
    if (stated && !crossTimezone.has(`${start}-${end}`)) {
      const minutes = stated[1] !== undefined ? Number(stated[1]) * 60 + Number(stated[2] ?? 0) : Number(stated[3]);
      assert.equal(minutes, to - from, `${day} · ${title}: nota diz ${fmt(minutes)}, bloco tem ${fmt(to - from)}`);
    }
    prevEnd = to;
  }
}

// horários corrigidos na revisão das agendas
assert(html.includes('["03:30-06:50","Deslocamento, embarque e voo a Guarulhos"'), '04/09 cobre o voo até o pouso em GRU às 06:50');
assert(html.includes('["05:30-06:50","Despertar a bordo"'), '05/09 cobre a bordo até o pouso em Roma às 06:50');
assert(html.includes('voo de 1h55 · ITA 720') && html.includes('voo de 2h10 · ITA 721'), 'voos entre fusos com a duração real');
assert(html.includes('por volta das 19:45'), 'jantar em Naoussa alinhado com a agenda');

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

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x => x[1]).join('\n');
new Script(scripts, { filename: 'index.inline.js' });

console.log(`OK: 17 dias, 17 agendas e ${images.size} imagens locais.`);
