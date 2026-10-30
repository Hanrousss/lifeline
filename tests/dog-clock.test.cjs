const assert=require('node:assert/strict');
const C=require('../dist/art/runtime/core.js'),m=require('../dist/art/manifest.json');
const clock=C.dogClockFor('puppy',240);
assert.deepEqual(C.dogAgeAt(clock,240),{months:0,stage:'puppy'});
assert.deepEqual(C.dogAgeAt(clock,251),{months:11,stage:'puppy'});
assert.deepEqual(C.dogAgeAt(clock,252),{months:12,stage:'adult'});
assert.equal(C.dogAgeAt(clock,335).stage,'adult');assert.equal(C.dogAgeAt(clock,336).stage,'senior');
assert.equal(C.dogAgeAt(C.dogClockFor('adult',120),204).stage,'senior');
assert.deepEqual(C.dogAgeAt(clock,100),{months:0,stage:'puppy'});
assert.equal(C.gameMonths({age:42,flow:{months:510}}),510);
const cfg=C.defaultState();cfg.dogBreed='spitz';cfg.dogClock=clock;cfg.dogColor=2;
const before=JSON.stringify(cfg),aged=C.petStateAt(cfg,336);assert.equal(aged.dogAge,'senior');assert.equal(aged.dogBreed,'spitz');assert.equal(aged.dogColor,2);assert.equal(JSON.stringify(cfg),before);
assert.deepEqual(C.validateState(cfg,m).dogClock,clock);
const old=C.defaultState();delete old.dogBreed;delete old.dogClock;assert.equal(C.validateState(old,m).dogBreed,'prototype');
for(const key of ['anchorGameMonth','ageAtAnchorMonths']){const bad=C.copy(cfg);bad.dogClock[key]=-1;assert.equal(C.validateState(bad,m).dogClock,null);}
console.log('PASS: pet clock boundaries, adoption anchor, immutable aging, appearance preservation and old-save migration.');
