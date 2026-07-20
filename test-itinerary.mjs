import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { Script } from 'node:vm';

const root = new URL('./', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');

assert.equal([...html.matchAll(/\{d:"\d{2}\/\d{2}"/g)].length, 17, '17 dias no roteiro');
assert.equal([...html.matchAll(/\bschedule:\[/g)].length, 13, '13 dias com ordem detalhada');
assert(!/<img[^>]+src=["']https?:/i.test(html), 'nenhuma imagem HTML remota');
assert(!/img:"https?:/i.test(html), 'nenhuma imagem remota em DAYS');
assert(!html.includes('.card .pic{position:relative;min-height:100%'), 'foto não estica com a agenda');
assert(html.includes('.card-head{display:grid') && html.includes('.gallery img{display:block;width:100%;height:auto;aspect-ratio:3/2'), 'recorte 3:2 responsivo');
assert.equal([...html.matchAll(/img:""/g)].length, 4, 'só os quatro dias de voo ficam sem foto');
assert(!/catamar/i.test(html), 'catamarã removido');
assert(html.includes('<noscript>') && html.includes('Roteiro resumido'), 'fallback sem JavaScript');

const images = new Set([...html.matchAll(/assets\/images\/[a-z0-9-]+\.webp/g)].map(x => x[0]));
await Promise.all([...images].map(path => access(new URL(path, root))));

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x => x[1]).join('\n');
new Script(scripts, { filename: 'index.inline.js' });

console.log(`OK: 17 dias, 13 agendas e ${images.size} imagens locais.`);
