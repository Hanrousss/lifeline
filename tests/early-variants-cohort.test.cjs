const assert=require('node:assert/strict');
const E=require('../dist/engine.js'),F=require('../dist/timeline.js'),C=require('../dist/cohort.js');
const seen=Array.from({length:5},()=>new Set());
for(let seed=0;seed<1000;seed++){
 const s=E.fresh(seed);s.started=true;
 if(s.family.tone==='harsh')continue;
 for(let i=0;i<5;i++){
  s.childhood.step=i;s.age=i+1;
  const before=JSON.stringify(s),scene=E.earlyScene(s);seen[i].add(scene.title);
  assert.deepEqual(scene,E.earlyScene(JSON.parse(before)));
  assert.equal(JSON.stringify(s),before,'Rendering must not reroll scenes or consume randomness');
  assert.equal(scene.age,i+1);assert.equal(scene.options.length,3);
  assert(!/[{}]/.test(scene.text),'All character names are substituted');
 }
}
assert.deepEqual(seen.map(x=>x.size),[8,8,8,8,8]);
const old=E.fresh(1);delete old.childhood.sceneVariants;old.childhood.step=0;
assert.equal(E.earlyScene(old).title,'Знакомый голос','Legacy saves retain their original pending scene');
const newborn=E.fresh(10);assert(F.begin(newborn));assert.equal(newborn.flow.months,0);
assert(newborn.flow.feed.some(x=>x.type==='family'&&x.month===0));
const initial=JSON.stringify(newborn);assert.equal(F.begin(newborn),false);assert.equal(JSON.stringify(newborn),initial);
for(let month=1;month<12;month++){assert(F.advance(newborn));assert.equal(F.pending(newborn),null);}
for(const month of [0,1,2])assert(newborn.flow.feed.some(x=>x.month===month));
F.advance(newborn);assert.equal(F.pending(newborn).kind,'early');
const raw=require('../data/world-life-table-2023.json').rows;
for(const row of raw){const age=Number(row.AgeGrpStart);assert.equal(C.estimate(age*12).probability,Number(row.lx)/100000);}
assert.equal(C.estimate(0).initialOthers,Math.round(E.birthData.totalBirths/365)-1);
assert.equal(C.estimate(0).aliveOthers,C.estimate(0).initialOthers);
assert.equal(C.estimate(0).probability,1);
let last=C.estimate(0).aliveOthers;
for(let m=0;m<=912;m++){const c=C.estimate(m);assert(c.aliveOthers<=last);assert(c.aliveOthers>=0);last=c.aliveOthers;}
assert(Math.abs(C.estimate(6).probability-(1+C.estimate(12).probability)/2)<1e-12);
assert.throws(()=>C.estimate(-1));assert.throws(()=>C.estimate(NaN));
console.log('Passed: eight stable scenes per early age, legacy saves, passive events from birth, official life-table endpoints and monotone monthly cohort estimates.');
