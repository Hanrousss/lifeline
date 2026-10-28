import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const links=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]);
for(const url of links){if(/^(?:https?:|data:|#)/.test(url)||url==='./')continue;assert(!url.startsWith('/'),'Use a relative path for project Pages: '+url);const file=path.resolve(root,url.split(/[?#]/)[0]);assert(file.startsWith(root+path.sep));assert(fs.existsSync(file),'Missing asset: '+url);}
for(const name of ['birth-data.js','childhood-scenes.js','engine.js','survival-data.js','cohort.js','habits.js','social.js','timeline.js','live-scene.js','habits-ui.js','app.js'])assert(new RegExp('src="'+name.replaceAll('.', '\\.')+'(?:\\?[^"]*)?"').test(html));
assert(html.indexOf('birth-data.js')<html.indexOf('engine.js'));
assert(html.indexOf('engine.js')<html.indexOf('timeline.js'));
assert(html.indexOf('timeline.js')<html.indexOf('app.js'));
assert(fs.existsSync(path.join(root,'births-2023.csv')));
console.log('Static assets and project-relative paths verified.');

assert(html.indexOf('childhood-scenes.js')<html.indexOf('engine.js'));
assert(html.indexOf('survival-data.js')<html.indexOf('cohort.js'));
assert(html.indexOf('cohort.js')<html.indexOf('app.js'));

assert(html.indexOf('habits.js')<html.indexOf('social.js'));
assert(html.indexOf('social.js')<html.indexOf('timeline.js'));
assert(html.indexOf('habits-ui.js')<html.indexOf('app.js'));
