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

const day14 = html.match(/\{d:"14\/09"([\s\S]*?)\n \{sec:/)?.[1] ?? '';
const demeter = day14.indexOf('["09:20-10:20","Templo de Deméter"');
const halki = day14.indexOf('["10:40-12:15","Halki"');
const apiranthos = day14.indexOf('["14:15-15:30","Apiranthos"');
assert(demeter >= 0 && demeter < halki && halki < apiranthos, '14/09 segue Deméter → Halki → Apiranthos');
assert(day14.includes('visita concluída bem antes do fechamento às 15:30'), 'Templo de Deméter termina antes das 15:30');

const images = new Set([...html.matchAll(/assets\/images\/[a-z0-9-]+\.webp/g)].map(x => x[0]));
await Promise.all([...images].map(path => access(new URL(path, root))));

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x => x[1]).join('\n');
new Script(scripts, { filename: 'index.inline.js' });

console.log(`OK: 17 dias, 17 agendas e ${images.size} imagens locais.`);
