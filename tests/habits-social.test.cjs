const assert=require('node:assert/strict');
const E=require('../dist/engine.js'),F=require('../dist/timeline.js'),R=require('../dist/habits.js'),S=require('../dist/social.js');
function adult(seed=9,strained=false){const s=E.fresh(seed);s.started=true;s.born=true;s.childhood.finished=true;s.childhood.step=5;s.age=24;s.step=4;F.ensure(s);s.flow.months=288;Object.assign(s.stats,strained?{joy:10,energy:15,bond:15}:{joy:85,energy:85,bond:85});R.ensure(s).lastMonth=288;S.ensure(s).lastMonth=288;return s;}
const well=adult(),low=adult(9,true);
assert(R.vulnerability(low)>R.vulnerability(well));
assert.equal(R.makeOffer(well,'unknown'),null);assert(R.makeOffer(low,'unknown'));
assert.notEqual(R.makeOffer(well,'alcohol').appeal,R.makeOffer(low,'alcohol').appeal);
for(const kind of ['tobacco','alcohol','lottery','gambling','unknown']){
 const s=adult(17,true);R.offer(s,kind);const before=JSON.stringify(s);const copy=JSON.parse(before);assert.deepEqual(R.pending(s),R.pending(copy));assert.equal(JSON.stringify(s),before);
 const uses={...s.habits.uses};R.resolve(s,1);assert.deepEqual(s.habits.uses,uses,'Refusal must never consume');assert.equal(s.habits.active,null);
}
for(let seed=0;seed<80;seed++){
 const s=adult(seed,true);const joy=s.stats.joy;R.offer(s,'alcohol');R.resolve(s,0);assert.equal(s.stats.joy,joy,'Acute relief is not permanent happiness');assert(s.habits.queue.length);s.flow.months++;R.tick(s);assert.equal(s.habits.comfort,0);
}
const habits=adult(4,true);for(let i=0;i<5;i++){R.offer(habits,'tobacco');R.resolve(habits,0);habits.flow.months+=3;}assert(habits.habits.urges.tobacco>=30);
let recoveryStart=habits.habits.urges.tobacco;habits.stats.joy=90;habits.stats.energy=90;habits.stats.bond=90;
for(let i=0;i<60;i++){habits.flow.months++;habits.age=Math.floor(habits.flow.months/12);R.tick(habits);if(R.pending(habits))R.resolve(habits,1);}
assert(habits.habits.urges.tobacco<recoveryStart);assert.equal(habits.habits.uses.tobacco,5,'No automatic consumption');
const treatment=adult(1,true);R.ensure(treatment).care.assessed=true;R.offer(treatment,'treatment');R.resolve(treatment,0);const baseline={...treatment.habits.urges};
treatment.habits.nextOpportunity=10000;let firstReview=null;
for(let i=1;i<=30;i++){treatment.flow.months++;R.tick(treatment);if(R.pending(treatment)?.topic==='review'){firstReview=treatment.flow.months;break;}}
assert(firstReview);assert(firstReview-treatment.habits.care.remission>=6);assert.deepEqual(treatment.habits.urges,baseline,'Treatment does not add substance craving');
R.resolve(treatment,1);assert.equal(treatment.habits.care.plan,'combined');for(let i=0;i<3;i++){treatment.flow.months++;R.tick(treatment);}assert.equal(treatment.habits.care.plan,'maintenance');
const rich=adult(1),poor=adult(1);delete rich.social;delete poor.social;rich.family.wealth='wealthy';poor.family.wealth='modest';assert(S.ensure(rich).access>S.ensure(poor).access);assert.equal(rich.social.trust,poor.social.trust);assert.equal(rich.social.ruleBreaking,0);
for(const [choice,expected]of [[0,'nika'],[1,'sasha'],[2,'ren'],[3,'family']]){const s=adult();S.offer(s,'party');const previous=s.social.friends.find(x=>x.id===expected).closeness;S.resolve(s,choice);assert(s.social.friends.find(x=>x.id===expected).closeness>previous);assert.equal(s.social.ruleBreaking,0,'Parties do not automatically mean corruption');assert.equal(s.habits.uses.alcohol,0);}
const corrupt=adult(9);S.offer(corrupt,'connections');S.resolve(corrupt,1);assert(corrupt.social.controversy>0);assert(corrupt.social.trust<60);
const bribe=adult(4);const moneyBefore=bribe.stats.money;S.offer(bribe,'bribe');S.resolve(bribe,1);assert(bribe.stats.money<moneyBefore);assert(bribe.social.controversy>0);
const trustBefore=corrupt.social.trust;S.offer(corrupt,'reflection');S.resolve(corrupt,0);assert.equal(corrupt.social.trust,trustBefore,'Religion does not erase reputation');
S.offer(corrupt,'repair');S.resolve(corrupt,0);assert(corrupt.social.trust>trustBefore);assert(corrupt.social.trust<60,'Repair is gradual');
function family(complicit){const s=adult(3);const n=S.ensure(s);n.partner={name:'Алекс',values:complicit?'complicit':'honest',closeness:65,changed:false};n.ruleBreaking=2;n.nextParty=10000;n.nextConnections=10000;n.nextReflection=10000;s.flow.months=299;n.lastMonth=299;S.tick({...s,flow:{...s.flow,months:300}});return n.partner.closeness;}
assert(family(false)<family(true));
const child=adult(2);S.offer(child,'family');S.resolve(child,0);assert(child.social.child);child.social.child.stress=50;const beforeChild=child.social.child.stress;S.offer(child,'child');S.resolve(child,0);assert(child.social.child.stress<beforeChild);
const legacy=adult(1);delete legacy.habits;delete legacy.social;legacy.age=64;legacy.flow.months=768;F.ensure(legacy);assert(legacy.social.seen.includes('family'));assert.equal(legacy.habits.lastMonth,768);
for(let seed=0;seed<30;seed++){
 const s=E.fresh(seed);s.started=true;F.ensure(s);let guard=0;
 while(!s.ended&&guard++<2200){const p=F.pending(s);if(p){const count=p.kind==='early'?E.earlyScene(s).options.length:p.kind==='chapter'?3:p.options.length;assert(F.resolve(s,seed%count));}else assert(F.advance(s));}
 assert(s.ended);assert.equal(s.flow.months,912);assert(s.habits);assert(s.social);
 const restored=JSON.parse(JSON.stringify(s));assert.deepEqual(F.pending(restored),F.pending(s));
}
console.log('Passed: contextual temptation, permanent refusal, delayed consequences, no auto-use, craving recovery, separate treatment and supervised completion, peer priorities, wealth without moral labels, reputation repair, partner differences, child support, migrations and 30 complete lives.');
