import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=JSON.parse(fs.readFileSync('data/world-life-table-2023.json','utf8'));
const rows=source.rows.slice().sort((a,b)=>Number(a.AgeGrpStart)-Number(b.AgeGrpStart));
assert.equal(rows.length,101);
for(let i=0;i<rows.length;i++){const r=rows[i];assert.equal(r.LocID,'900');assert.equal(r.Time,'2023');assert.equal(r.SexID,'3');assert.equal(Number(r.AgeGrpStart),i);}
const lx=rows.map(r=>Number(r.lx));assert.equal(lx[0],100000);
assert(lx.every((v,i)=>Number.isFinite(v)&&v>=0&&(!i||v<=lx[i-1])));
const data={year:2023,location:'World',sex:'Both sexes',radix:100000,lx,sourceUrl:source.sourceUrl,source:'United Nations DESA, World Population Prospects 2024',license:'CC BY 3.0 IGO',retrieved:source.retrieved};
fs.writeFileSync('dist/survival-data.js',`(function(root){const data=${JSON.stringify(data)};root.SurvivalData=data;if(typeof module!=='undefined')module.exports=data;})(typeof window!=='undefined'?window:globalThis);\n`);
console.log('Built world 2023 period life table: 101 ages.');
