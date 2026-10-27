import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const links=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]);
for(const url of links){if(/^(?:https?:|data:|#)/.test(url)||url==='./')continue;assert(!url.startsWith('/'),'Use a relative path for project Pages: '+url);const file=path.resolve(root,url.split(/[?#]/)[0]);assert(file.startsWith(root+path.sep));assert(fs.existsSync(file),'Missing asset: '+url);}
for(const name of ['birth-data.js','engine.js','timeline.js','live-scene.js','app.js'])assert(html.includes('src="'+name+'"'));
assert(html.indexOf('birth-data.js')<html.indexOf('engine.js'));
assert(html.indexOf('engine.js')<html.indexOf('timeline.js'));
assert(html.indexOf('timeline.js')<html.indexOf('app.js'));
assert(fs.existsSync(path.join(root,'births-2023.csv')));
console.log('Static assets and project-relative paths verified.');
