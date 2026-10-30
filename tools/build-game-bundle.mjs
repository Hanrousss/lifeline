import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),scripts=JSON.parse(fs.readFileSync(path.join(root,'tools/game-scripts.json'),'utf8'));
const output=scripts.map(name=>'\n;/* '+name+' */\n'+fs.readFileSync(path.join(root,'dist',name),'utf8')+'\n').join('');const target=path.join(root,'dist/game.js');
if(process.argv.includes('--check')){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==output)throw Error('Game bundle is stale. Run node tools/build-game-bundle.mjs.');}else fs.writeFileSync(target,output);
