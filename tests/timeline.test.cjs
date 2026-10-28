const assert=require('node:assert/strict'),E=require('../dist/engine.js'),F=require('../dist/timeline.js');
function run(seed,pattern){let s=E.fresh(seed);s.started=true;F.ensure(s);let counts=0,guard=0;while(!s.ended&&guard++<2000){let p=F.pending(s);if(p){let month=s.flow.months,shot=JSON.stringify(s);assert.equal(F.advance(s),false);assert.equal(JSON.stringify(s),shot);const n=p.kind==='side'?p.options.length:p.kind==='early'?E.earlyScene(s).options.length:3;assert(F.resolve(s,pattern(counts++)%n));assert.equal(s.flow.months,month);assert.equal(s.age,Math.floor(month/12));}else{assert(F.advance(s));assert.equal(s.age,Math.floor(s.flow.months/12));}}assert(s.ended);assert.equal(s.age,76);assert.equal(s.flow.months,912);assert(counts>30);assert(s.flow.feed.length>300);for(const t of ['news','everyday','career','choice','consequence'])assert(s.flow.feed.some(e=>e.type===t));for(let i=1;i<s.flow.feed.length;i++)assert(s.flow.feed[i].month>=s.flow.feed[i-1].month);assert.equal(s.childhood.moments.length,5);assert(s.flow.career.job);assert(s.family.mother.job&&s.family.father.job&&s.family.grandmother.job);return s;}
for(let i=0;i<20;i++)assert.deepEqual(run(i,n=>n%3),run(i,n=>n%3));
let a=E.fresh(9);a.started=true;F.ensure(a);for(let i=0;i<11;i++)F.advance(a);assert(a.flow.feed.length>1);assert(!F.pending(a));F.advance(a);assert.equal(F.pending(a).kind,'early');F.resolve(a,0);assert.equal(a.age,1);F.advance(a);assert.equal(a.flow.months,13);let restore=JSON.parse(JSON.stringify(a));assert.deepEqual(F.pending(restore),F.pending(a));F.advance(restore);F.advance(a);assert.deepEqual(a,restore);
let b=run(42,()=>1),c=run(42,()=>0);assert.notEqual(b.flow.career.job,c.flow.career.job);console.log('Passed: 40 full monthly lives, choice auto-pause, no age jumps, ordinary/news/career/delayed events, jobs, save restore, different paths.');

const school=E.fresh(42);school.started=true;school.age=6;school.step=1;school.childhood.finished=true;
F.ensure(school);school.flow.months=74;school.flow.seen=F.sideStories.filter(x=>x.month<=74).map(x=>x.month);school.rng=0;
assert(F.advance(school));
assert(school.flow.feed.some(e=>e.text.includes('Саша показал вам смешной рисунок.')),'School drawings are shared in person');
const child=E.fresh(42);child.started=true;child.age=6;child.childhood.finished=true;F.ensure(child);child.flow.months=72;
assert(F.resolve(child,1));
assert(child.flow.queue.some(e=>e.text.includes('предложил снова провести время вместе')),'Childhood social consequences do not assume a phone');
assert(child.flow.queue.every(e=>!/вышел на связь/.test(e.text)));
console.log('Passed: in-person school drawings and age-appropriate delayed social events.');
