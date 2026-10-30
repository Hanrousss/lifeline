const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../dist/art/runtime/core.js'),L=require('../dist/graphics-lab.js'),A=require('../dist/modular-scene.js'),m=require('../dist/art/manifest.json');
const breeds=Object.keys(C.DOG_BREEDS).filter(k=>k!=='prototype');assert.equal(breeds.length,7);assert.equal(Object.keys(m.pets.dog.breeds).length,7);
let count=0;
for(const breed of breeds){const b=m.pets.dog.breeds[breed];assert.equal(b.accessory,breed==='spitz'?'harness':'collar');for(const age of C.DOG_AGES)for(const pose of Object.keys(C.DOG_POSES)){
 const state={dogBreed:breed,dogAge:age,dogPose:pose},e=C.petEntry(m,state).entry;assert.deepEqual(e.frame,[480,320]);assert.deepEqual(e.footAnchor,[240,310]);assert.equal(C.petGeometry(m,age,pose,breed).footY,303);
 for(const rel of [...Object.values(e.layers),...Object.values(e.renders)]){const png=fs.readFileSync(path.join(__dirname,'../dist/art',rel));assert.equal(png.readUInt32BE(16),480);assert.equal(png.readUInt32BE(20),320);}
 count++;
 }assert(b.ages.puppy.poses.standing.visibleHeight<b.ages.adult.poses.standing.visibleHeight*.65);assert.equal(b.ages.senior.poses.standing.visibleHeight,b.ages.adult.poses.standing.visibleHeight);
}
assert.equal(count,105);assert(m.pets.dog.breeds.german_shepherd.ages.adult.poses.standing.visibleHeight>m.pets.dog.breeds.cavalier.ages.adult.poses.standing.visibleHeight*1.5);
const memory=new Map();global.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
const life={seed:678,flow:{months:240},age:20},original=JSON.stringify(life);memory.set('lifeline-graphics-lab-v1:678',JSON.stringify({animal:'dog'}));let cfg=C.defaultState();cfg.dogAge='puppy';cfg.dogBreed='spitz';memory.set(A.storageKey(life),JSON.stringify(cfg));assert.equal(L.preparePet(life,m).dogAge,'puppy');assert.deepEqual(JSON.parse(memory.get(A.storageKey(life))).dogClock,{anchorGameMonth:240,ageAtAnchorMonths:0});assert.equal(L.preparePet({...life,flow:{months:252}},m).dogAge,'adult');assert.equal(L.preparePet({...life,flow:{months:336}},m).dogAge,'senior');assert.equal(L.preparePet({...life,flow:{months:336}},m).dogBreed,'spitz');assert.equal(JSON.stringify(life),original);assert(!memory.has('lifeline-test-v1'));
console.log('PASS: 7 breeds × 3 ages × 5 poses, 630 PNG layers/renders, breed scales, harness/collars and game-connected visual-only aging.');
