const assert=require('node:assert/strict'),E=require('../dist/engine.js'),F=require('../dist/timeline.js'),B=require('../dist/birth-intro.js');
for(let i=0;i<100;i++){const s=E.fresh(i);F.ensure(s);const rng=s.rng;B.prepare(s,2023);assert(!s.started);assert(s.birthIntroPending);assert.equal(s.flow.months,0);assert.equal(s.rng,rng);const date=s.origin.birthDate;assert(/^2023-\d\d-\d\d$/.test(date));const restored=JSON.parse(JSON.stringify(s));B.prepare(restored,2023);assert.equal(restored.origin.birthDate,date);const f=B.facts(restored);assert.equal(f.chance,s.origin.birthProbability);assert.equal(f.country,s.origin.country);assert(f.income);delete restored.birthIntroPending;F.begin(restored);assert(restored.started);assert.equal(restored.flow.months,0);assert.equal(restored.origin.birthDate,date);}
console.log('Passed: persisted birth introduction, stable valid dates, no time or RNG advancement before continue, unchanged country probability and family income, game starts once confirmed.');

const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const view=vm.createContext({LifeFlow:F,PixelPeople:require('../dist/pixel-people.js')});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/live-scene.js'),'utf8'),view);
for(const months of [0,1,6,11,12,18,23,24]){
 const s=E.fresh(42);F.begin(s);s.flow.playing=false;s.flow.months=months;s.age=Math.floor(months/12);view.state=s;
 const before=JSON.stringify(s),html=vm.runInContext('renderLiveScene(state)',view);
 assert.equal(JSON.stringify(s),before,'Rendering must not change a save');
 if(months<12){assert.match(html,/data-perspective="infant"/);assert.match(html,/feGaussianBlur/);assert.match(html,/scale\(4/);}
 else if(months<24){assert.match(html,/data-perspective="nursery"/);assert(!html.includes('infant-background-blur'));}
 else assert.match(html,/data-perspective="room"/);
}
const stroller=E.fresh(42);F.begin(stroller);stroller.flow.activity='park';view.state=stroller;
assert.match(vm.runInContext('renderLiveScene(state)',view),/из коляски/);
console.log('Passed: infant close-up indoors and in stroller, nursery from 12 months, normal scene from 24 months, read-only rendering.');
