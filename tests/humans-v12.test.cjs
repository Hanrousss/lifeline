const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const R=path.join(__dirname,'../dist/art/people-v12');
const C=require(path.join(R,'runtime/humans.js'));global.LifelineHumanV12=C;
const B=require(path.join(R,'runtime/game-bridge.js'));
const m=JSON.parse(fs.readFileSync(path.join(R,'manifest.json')));
for(const [months,age]of [[0,'infant'],[11,'infant'],[12,'toddler'],[71,'toddler'],[72,'child'],[155,'child'],[156,'teen'],[203,'teen'],[204,'adult'],[767,'adult'],[768,'elder']])assert.equal(C.ageGroup(months),age);
assert.throws(()=>C.ageGroup(-1));assert.throws(()=>C.ageGroup(NaN));
assert.equal(C.expression(100,50).score,50);assert.equal(C.expression(100,50).mouth,'neutral');assert.equal(C.expression(0,100).score,0);assert.equal(C.expression(100,0).mouth,'sad');
let defaults=0,poses=0;
for(const base of Object.keys(C.BASES))for(const [age,months]of C.AGE_GROUPS)for(const sex of ['male','female']){
 const c=C.preset(base,1122,months,sex);assert.equal(C.validate(m,c).profile,C.profileFor(months,sex));defaults++;
 assert.equal(C.preset(base,1122,months,sex).skin,c.skin,'stable identity');
 for(const pose of m.profiles[c.profile].poses){const d=m.profiles[c.profile].outfits['0'].poses[pose];const test={...c,months:Math.max(months,d.minimumMonths||0),pose};assert.equal(C.validate(m,test).pose,pose);poses++;}
 if(sex==='female'&&age!=='infant')assert(!C.hairOptions(m,c).includes('none'));
}
for(const [id,p]of Object.entries(m.profiles))assert(!p.poses.includes('running'),id);
const baby=C.preset('slavic',2,0,'female');assert.throws(()=>C.validate(m,{...baby,pose:'supported_sitting'}));assert.equal(C.validate(m,{...baby,months:6,pose:'supported_sitting'}).pose,'supported_sitting');
const toddler=C.preset('slavic',2,12,'male');assert.throws(()=>C.validate(m,{...toddler,pose:'running'}));assert.equal(C.migrate(m,{...toddler,months:24,pose:'running'}).pose,'standing');
const formerMan={...C.preset('slavic',5,360,'male'),face:3,skin:4,outfit:2,hairColor:2,hair:'bob',pose:'running'},formerSnapshot=JSON.stringify(formerMan),moved=C.migrate(m,formerMan);
assert.equal(moved.hair,'short');assert.equal(moved.pose,'standing');for(const k of ['face','skin','outfit','hairColor'])assert.equal(moved[k],formerMan[k]);assert.equal(JSON.stringify(formerMan),formerSnapshot);
for(const [age,months]of C.AGE_GROUPS){const male=C.preset('slavic',8,months,'male');for(const hair of C.hairOptions(m,male))assert(['short','compact_coils','tousled','baby_tuft','none'].includes(hair));for(const forbidden of ['bob','long_straight','braids','ponytail','bun'])assert.throws(()=>C.validate(m,{...male,hair:forbidden}));}
assert(C.hairOptions(m,C.preset('slavic',1,360,'female')).includes('bob'));
assert(C.worldHeight({...toddler,months:12})<C.worldHeight({...toddler,months:60}));
const seen=new Set();for(const f of m.files){assert(!seen.has(f.path),'duplicate '+f.path);seen.add(f.path);assert(fs.existsSync(path.join(R,f.path)),f.path);}
assert.equal(Object.keys(m.heads).length,48);assert.equal(Object.keys(m.profiles).length,10);assert.equal(Object.keys(m.hairStyles).length,12);
const fakeStore=value=>({getItem:()=>value?JSON.stringify(value):null});
const legacy={profile:'child',pose:'standing',head:'standing',hairStyle:'short',skin:2,hairColor:0,top:1,bottom:2,happiness:70,fatigue:.4};
const s={seed:42,age:3,origin:{sex:'female'}};
assert.equal(B.character(s,legacy,m,null,fakeStore(null)).profile,'toddler');
const record={version:1,traits:{base:'african',face:3,hair:'braids',skin:4,outfit:2},legacyBaseline:{child:{...legacy}}};
let c=B.character(s,legacy,m,null,fakeStore(record));assert.equal(c.face,3);assert.equal(c.hair,'braids');assert.equal(c.outfit,2);
c=B.character(s,{...legacy,hairStyle:'bob'},m,null,fakeStore(record));assert.equal(c.hair,'bob');assert.equal(c.face,3,'old control changes only its trait');
assert.equal(B.character({...s,age:65,origin:{sex:'male'}},legacy,m,null,fakeStore(null)).profile,'elder_m');
assert.equal(B.character(s,legacy,m,'adult_f',fakeStore(null)).profile,'adult_f');
global.LifelineAssetCore=require('../dist/art/runtime/core.js');const memory=new Map();global.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
const F=require('../dist/family-appearance.js'),old=JSON.parse(fs.readFileSync(path.join(R,'../manifest.json'))),before=JSON.stringify(s);
F.setActor(s,'mother',{face:3,hair:'braids',outfit:1,shoes:2},old);let mother=F.actor(s,'mother',old);assert.deepEqual(mother.humanTraits,{face:3,outfit:1,shoes:2,hair:'braids'});
F.setActor(s,'mother',{top:2},old);mother=F.actor(s,'mother',old);assert.equal(mother.humanTraits.face,3);assert.equal(mother.humanTraits.hair,'braids');
F.setActor(s,'grandmother',{hair:'none'},old);assert.notEqual(F.actor(s,'grandmother',old).humanTraits?.hair,'none');assert.equal(JSON.stringify(s),before,'appearance never changes game state');
console.log(`Human v12: ${defaults} age/sex/basis defaults, ${poses} age-safe poses, ${m.files.length} PNG paths, migration and compatibility passed`);

for(let happy=0;happy<=100;happy+=5)for(let energy=0;energy<=100;energy+=5){const e=C.expression(happy,energy);assert.equal(e.score,Math.min(happy,energy));assert.deepEqual(e,C.expression(energy,happy),'both inputs have equal influence');assert.deepEqual(e,C.expression(Math.min(happy,energy),100),'the worst input determines the entire expression');}console.log('PASS: v12 preserves Lifeline worst-input emotions across all 441 combinations.');

// Additional female wardrobe is family-specific; changing age/sex must remain safe.
for(const id of ['adult_f','elder_f']){assert.equal(Object.keys(m.profiles[id].outfits).length,6);for(const outfit of [3,4,5])for(const pose of m.profiles[id].poses)assert(C.validate(m,{...C.preset('slavic',1,id==='elder_f'?900:360,'female'),outfit,pose}));}
for(const hair of ['long_sleek','long_curly','single_braid','bun']){assert(C.hairOptions(m,C.preset('slavic',1,360,'female')).includes(hair));assert(!C.hairOptions(m,C.preset('slavic',1,360,'male')).includes(hair));}
const changedSex=C.migrate(m,{...C.preset('slavic',1,360,'male'),outfit:5,hair:'long_curly'});assert.equal(changedSex.outfit,0);assert.equal(changedSex.hair,'short');
F.setActor(s,'mother',{outfit:5,hair:'long_curly'},old);assert.equal(F.actor(s,'mother',old).humanTraits.outfit,5);assert.equal(F.actor(s,'mother',old).humanTraits.hair,'long_curly');
// Semi-transparent dark edge pixels must not brighten small skin parts such as the neck.
const flat=[180,120,80,255],data=new Uint8ClampedArray([...flat,...flat,...flat,20,10,5,50]);assert.equal(C.skinReference(data),.2126*180+.7152*120+.0722*80);

for(const months of [12,15,18,23,24,30,35]){const life={seed:42,age:months/12,origin:{sex:'female'}};assert(['floor_play','sitting','standing'].includes(B.character(life,legacy,m,null,fakeStore(null)).pose));}for(const months of [3,4,5])assert(['tummy_time','lying'].includes(B.character({seed:42,age:months/12,origin:{sex:'female'}},legacy,m,null,fakeStore(null)).pose));for(const months of [6,8,11])assert(['supported_sitting','tummy_time'].includes(B.character({seed:42,age:months/12,origin:{sex:'female'}},legacy,m,null,fakeStore(null)).pose));
