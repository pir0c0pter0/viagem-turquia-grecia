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
assert([...html.matchAll(/💶 Comprar|✅ [^<"]+ · comprado/g)].length >= 16, 'links de compra ou comprados exibem status');
for (const price of [
  'Pireu → Paros · comprado · R$529/pessoa · R$2.645 grupo',
  'Paros → Santorini · comprado · R$459/pessoa · R$2.295 grupo',
  'Santorini → Naxos · comprado · R$438/pessoa · R$2.190 grupo',
  'Naxos → Pireu · comprado · R$444/pessoa · R$2.220 grupo',
  'Ingresso da Acrópole de Atenas · comprado · R$192/pessoa · R$960 grupo',
  'Ingresso do Museu da Acrópole · comprado · R$129/pessoa · R$645 grupo',
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
for (const stay of [
  '05–08/09 · 3 noites · R$ 2.844,70 total · R$ 568,94 por hóspede',
  '15–19/09 · 4 noites · R$ 4.419,31 total · R$ 883,86 por hóspede',
]) assert(html.includes(stay), `hospedagem reservada exibida: ${stay}`);
assert(html.includes('Hospedagens de Atenas · reservadas ✓'), 'status das hospedagens de Atenas exibido');
assert(html.includes('Total reservado: R$ 7.264,01 · rateio final: 4 × R$ 1.452,80 + 1 × R$ 1.452,81'), 'total e centavo residual exibidos');

const day06 = html.match(/\{d:"06\/09"([\s\S]*?)\n \{d:"07\/09"/)?.[1] ?? '';
const acropolis = day06.indexOf('["11:00-13:00","Acrópole e encostas"');
const lunch = day06.indexOf('["13:10-14:30","Almoço em Koukaki"');
const museum = day06.indexOf('["15:00-17:00","Museu da Acrópole"');
const plaka = day06.indexOf('["17:15-19:15","Plaka e Anafiotika"');
assert(acropolis >= 0 && acropolis < lunch && lunch < museum && museum < plaka, '06/09 segue Acrópole → almoço → museu → Plaka');
assert(html.includes('slot das 11:00–12:00 em 06/09') && html.includes('slot das 15:00–16:00'), 'reservas de 06/09 exibem os horários comprados');

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
