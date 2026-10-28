const assert=require('node:assert/strict'),E=require('../dist/engine.js'),F=require('../dist/timeline.js'),S=require('../dist/life-spheres.js');
const s=E.fresh(123);s.started=true;F.ensure(s);const before=JSON.stringify(s);let v=S.snapshot(s);assert.equal(JSON.stringify(s),before);assert.equal(v.areas.length,5);assert.equal(v.areas.find(a=>a.key==='hobbies').value,0);assert(!v.temporary.some(a=>a.key==='love'||a.key.startsWith('urge-')));
s.memories.push({tag:'create'});assert.equal(S.snapshot(s).areas.find(a=>a.key==='hobbies').value,8);
s.habits.urges.alcohol=47;s.social.partner={name:'Алекс',closeness:65};s.stats.energy=20;s.habits.comfort=12;s.habits.comfortUntil=s.flow.months+2;
v=S.snapshot(s);for(const key of ['urge-alcohol','love','fatigue','comfort'])assert(v.temporary.some(a=>a.key===key));
s.social.partner=null;s.habits.urges.alcohol=0;s.stats.energy=60;s.flow.months+=3;v=S.snapshot(s);assert.equal(v.temporary.length,0);
s.stats.health=102;s.stats.money=-10;v=S.snapshot(s);assert.equal(v.areas[0].value,100);assert.equal(v.areas[1].value,0);assert.equal(v.energy,60);
console.log('Passed: five life areas, hobby progress from saved choices, conditional love/craving/comfort/fatigue, expired states removed, bounds, read-only rendering.');
