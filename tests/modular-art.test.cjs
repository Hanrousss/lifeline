const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../dist/art/runtime/core.js'),A=require('../dist/modular-scene.js'),m=require('../dist/art/manifest.json');
const life={seed:42,age:26,origin:{sex:'female'},stats:{energy:40}};
for(const [age,sex,expected] of [[0,'female',null],[5,'male','child'],[6,'male','child'],[12,'female','child'],[13,'female','child'],[16,'male','child'],[17,'female','adult_f'],[63,'male','adult_m'],[64,'female','elder_f'],[80,'male',null]])assert.equal(A.profileFor({...life,age,origin:{sex}}),expected);
assert(A.supported(life,'home'));assert(!A.supported(life,'park'));assert(!A.supported(life,'school'));assert(A.markup({...life,age:0},'home'));assert.equal(A.displayProfileFor({...life,age:0}),'adult_f');assert.equal(A.displayProfileFor({...life,age:0,origin:{sex:'male'}}),'adult_m');
assert.equal(A.storageKey(life),'lifeline-art-v1:42');assert.equal(A.editorUrl(life),'art/index.html?life=42&profile=adult_f&month=312&sex=female');assert(A.editorUrl({...life,origin:{sex:'male'}}).endsWith('&sex=male'));
const cfg=C.defaultState();cfg.actors.adult_f.hairStyle='none';cfg.actors.adult_f.top=3;
assert.equal(A.settings(life,m,{getItem:()=>JSON.stringify(cfg)}).actors.adult_f.hairStyle,'bob');assert.equal(A.settings(life,m,{getItem:()=>JSON.stringify(cfg)}).actors.adult_f.top,3);assert.deepEqual(A.settings(life,m,{getItem:()=>'{bad'}),C.defaultState());
for(const file of m.files){assert(fs.existsSync(path.join(__dirname,'../dist/art',file.path)),file.path);}
const original=JSON.stringify(life),writes=[],draws=[];let block=false;
global.localStorage={getItem:()=>JSON.stringify(C.defaultState()),setItem:(k,v)=>writes.push([k,JSON.parse(v)])};
global.fetch=async()=>({ok:true,json:async()=>m});
global.LifelinePngRenderer={create:()=>({image:async()=>{if(block)throw Error('unavailable');return {};},actor:async()=>({}),pet:async()=>({width:320,height:256}),geometry:()=>({x:1,y:2,scale:.5})})};
const canvas={style:{},getContext:()=>({setTransform(){},clearRect(){},drawImage(...args){draws.push(args);}}),getBoundingClientRect:()=>({left:0,top:0,width:320,height:320})};
const status={hidden:false},fallback={hidden:false},node={isConnected:true,parentElement:{querySelector:()=>fallback},querySelector:s=>s==='canvas'?canvas:status},host={querySelector:()=>node};
(async()=>{
 await A.mount(host,life,'home');assert.equal(draws.length,2);assert(status.hidden);assert.equal(writes.length,0);assert.equal(JSON.stringify(life),original);
 canvas.onclick({clientX:0,clientY:0});assert.equal(writes.length,0,'blocked floor must not save');
 // Same valid foreground used by the art editor; only the appearance key is written.
 const point=m.scene.walkableAreas[0].reduce((p,q)=>[p[0]+q[0]/m.scene.walkableAreas[0].length,p[1]+q[1]/m.scene.walkableAreas[0].length],[0,0]);
 if(C.isWalkable(point,m.scene)){canvas.onclick({clientX:point[0],clientY:point[1]});assert.equal(writes[0][0],A.storageKey(life));}
 await new Promise(resolve=>setImmediate(resolve));block=true;await A.mount(host,life,'home');assert.equal(canvas.style.visibility,'hidden');assert.equal(status.hidden,false);assert(status.textContent.includes('PNG'));assert.equal(JSON.stringify(life),original);block=false;await A.mount(host,life,'home');assert.equal(canvas.style.visibility,'visible');
 A.selectProfile('child');assert.equal(A.displayProfileFor(life),'child');A.selectProfile('unknown');assert.equal(A.displayProfileFor(life),'child');assert.equal(JSON.stringify(life),original);
 const beforeDogDraws=draws.length;A.selectDog(true);await A.mount(host,life,'home');assert.equal(draws.length-beforeDogDraws,3);A.selectDog(false);assert.equal(JSON.stringify(life),original);
 console.log('PASS: game art ages/contexts, separate appearance saves, all PNG paths, render/state isolation, floor interaction and PNG failure notice and recovery.');
})().catch(e=>{console.error(e);process.exitCode=1;});

// Legacy saves migrate only the new mouth trait, preserving the rest of the person.
const oldMouthState=C.defaultState();delete oldMouthState.actors.adult_f.mouth;
const migrated=C.validateState(oldMouthState,m);assert.equal(migrated.actors.adult_f.mouth,'smile');assert.equal(migrated.actors.adult_f.top,oldMouthState.actors.adult_f.top);
for(const mouth of C.MOUTHS){const config=C.defaultState();config.actors.adult_f.mouth=mouth;assert.equal(C.validateState(config,m).actors.adult_f.mouth,mouth);}
const invalid=C.defaultState();invalid.actors.adult_f.mouth='missing';assert.throws(()=>C.validateState(invalid,m),/рта/);
for(const [id,profile] of Object.entries(m.profiles))for(const [face,head] of Object.entries(profile.heads)){
 assert(head.mouthlessNeutral&&head.mouthlessSkin,id+' '+face+' missing mouthless base');
 assert.deepEqual(Object.keys(head.mouths),C.MOUTHS);assert.deepEqual(head.mouthAnchor.frame,[160,224]);
 for(const file of [head.mouthlessNeutral,head.mouthlessSkin,...Object.values(head.mouths)]){
  const png=fs.readFileSync(path.join(__dirname,'../dist/art',file));assert.equal(png.readUInt32BE(16),160);assert.equal(png.readUInt32BE(20),224);
 }
}
console.log('PASS: mouthless bases + 32 registered mouth PNGs, all four expressions, legacy appearance migration and invalid-expression rejection.');

for(const [happiness,energy,mouth,score,tier] of [[100,100,'smile',100,0],[80,20,'sad',20,3],[50,100,'neutral',50,1],[49.99,100,'neutral',49.99,2],[0,100,'sad',0,3],[100,75,'smile',75,0],[100,74.99,'neutral',74.99,1],[100,25,'neutral',25,2],[100,24.99,'sad',24.99,3]]){
 const e=C.expressionFor(happiness,energy);assert.equal(e.mouth,mouth);assert.equal(e.eyeTier,tier);assert(Math.abs(e.score-score)<1e-8);
}
for(let happiness=0;happiness<=100;happiness+=5)for(let energy=0;energy<=100;energy+=5){const e=C.expressionFor(happiness,energy);assert.deepEqual(e,C.expressionFor(energy,happiness),'equal influence of both inputs');assert.equal(e.score,Math.min(happiness,energy));assert.deepEqual(e,C.expressionFor(e.score,100));}
const actor=C.defaultState().actors.adult_f;actor.mouthMode='auto';actor.happiness=80;actor.fatigue=.8;const snapshot=JSON.stringify(actor);assert.equal(C.resolveExpression(actor).mouth,'sad');assert.equal(C.resolveExpression(actor).eyeTier,3);assert.equal(JSON.stringify(actor),snapshot);actor.mouthMode='manual';actor.mouth='soft';assert.equal(C.resolveExpression(actor),actor);assert.equal(C.resolveExpression(actor).mouth,'soft');
const happyLow=C.resolveExpression({...actor,mouthMode:'auto',happiness:30,fatigue:0}),fatigueHigh=C.resolveExpression({...actor,mouthMode:'auto',happiness:100,fatigue:.7});assert.equal(happyLow.mouth,fatigueHigh.mouth);assert.equal(happyLow.eyeTier,fatigueHigh.eyeTier);assert.equal(happyLow.fatigue,0,'presentation must not rewrite physical fatigue');
console.log('PASS: worst-input emotion, symmetric influence, exact boundaries, shared eye/mouth tiers, inverse fatigue scale, manual override and read-only resolution.');

const legacyDog=C.defaultState();delete legacyDog.dogAge;assert.equal(C.validateState(legacyDog,m).dogAge,'adult');
for(const age of C.DOG_AGES){const state=C.defaultState();state.dogAge=age;assert.equal(C.validateState(state,m).dogAge,age);for(const pose of ['standing','sitting']){const entry=m.pets.dog.ages[age].poses[pose];assert.deepEqual(entry.footAnchor,[160,246]);for(const file of Object.values(entry.layers))assert(fs.existsSync(path.join(__dirname,'../dist/art',file)));assert(entry.layers.collar);assert.equal(C.petGeometry(m,age,pose).footY,m.pets.dog.footPosition[1]);}}
const badDog=C.defaultState();badDog.dogAge='unknown';assert.throws(()=>C.validateState(badDog,m),/возраст/);
for(const pose of ['standing','sitting'])assert(m.pets.dog.ages.puppy.poses[pose].visibleHeight<m.pets.dog.ages.adult.poses[pose].visibleHeight*.8);
console.log('PASS: three dog ages, both poses, mandatory collar layers, age scale, legacy migration and visual-only scene toggle.');

for(const happiness of [0,25,50,80,100])for(const energy of [0,20,24.99,25,49.99,50,74.99]){const mouth=C.expressionFor(happiness,energy).mouth;assert(!['smile','soft'].includes(mouth),'tired lids must never smile');if(energy<25)assert.equal(mouth,'sad');}
assert.equal(C.expressionFor(100,75).mouth,'smile');assert.equal(C.expressionFor(100,50).mouth,'neutral');assert.equal(C.expressionFor(100,25).mouth,'neutral');assert.equal(C.expressionFor(80,20).score,20);
console.log('PASS: tired-eye stages 2/3 cannot smile; stage 4 is sad; worst-input score is used for the complete face.');
