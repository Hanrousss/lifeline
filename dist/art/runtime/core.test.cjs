const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('./core.js'),R=path.resolve(__dirname,'..'),m=JSON.parse(fs.readFileSync(path.join(R,'manifest.json'))),catalog=JSON.parse(fs.readFileSync(path.join(R,'room_catalog.json')));
const initial=C.defaultState(),before=JSON.stringify(initial);
assert.deepEqual(C.PROFILES,['adult_f','adult_m','elder_f','child']);assert.equal(Object.keys(initial.actors).length,4);
assert(C.isWalkable([200,270],m.scene));assert(!C.isWalkable([50,240],m.scene));assert(!C.isWalkable([310,270],m.scene));
assert(!C.move(initial,'adult_f',[50,240],m).ok);const moved=C.move(initial,'adult_f',[210,275],m);assert(moved.ok);assert.deepEqual(moved.state.actors.adult_f.position,[210,275]);assert.equal(JSON.stringify(initial),before,'Core actions must not mutate input');
for(const id of C.PROFILES){const result=C.sit(initial,id,'sofa_left',m);assert(result.ok);assert.equal(result.state.actors[id].pose,'sitting');assert.equal(result.state.actors[id].id,initial.actors[id].id);}
let all=C.showAll(initial,m);all=C.sit(all,'adult_f','sofa_left',m).state;assert(!C.sit(all,'adult_m','sofa_left',m).ok,'Seat occupancy must be enforced');assert(C.sit(all,'adult_m','sofa_right',m).ok);
assert.deepEqual(C.mixRooms(173,catalog,'village_low_pilot'),C.mixRooms(173,catalog,'village_low_pilot'));assert.equal(C.countMixes(catalog,'village_low_pilot'),8);
const fixture=[];for(const room of ['kitchen','bedroom','bathroom'])for(let i=1;i<=3;i++)fixture.push({id:room+i,room,compatibilityGroup:'fixture'});assert.equal(C.countMixes(fixture,'fixture'),27);
const combinations=new Set();for(let seed=1;seed<10000;seed++)combinations.add(JSON.stringify(C.mixRooms(seed,fixture,'fixture').rooms));assert.equal(combinations.size,27);
assert.throws(()=>C.mixRooms(1,catalog,'unknown'));assert.deepEqual(C.validateState(JSON.parse(JSON.stringify(initial)),m),initial);
const bad=C.copy(initial);bad.actors.adult_f.skin=-1;assert.throws(()=>C.validateState(bad,m));bad.actors.adult_f.skin=0;bad.actors.adult_f.position=[10,10];assert.throws(()=>C.validateState(bad,m));
const state=C.copy(initial);state.actors.child.skin=4;state.actors.adult_m.head='sitting';state.actors.elder_f.fatigue=1;state.dogPose='sitting';state.houseRooms=C.mixRooms(173,catalog,'village_low_pilot');const roundtrip=C.validateState(JSON.parse(JSON.stringify(state)),m);assert.deepEqual(roundtrip,state);
for(const f of m.files){assert(fs.existsSync(path.join(R,f.path)),f.path);assert(!path.isAbsolute(f.path));}
assert.notEqual(C.rng(1)(),C.rng(2)());
for(const id of ['adult_f','elder_f']){assert(!C.availableHairStyles(id).includes('none'));const legacy=C.copy(initial);legacy.actors[id].hairStyle='none';const migrated=C.validateState(legacy,m);assert.equal(migrated.actors[id].hairStyle,'bob');assert.equal(migrated.actors[id].skin,legacy.actors[id].skin);}
assert(C.availableHairStyles('adult_m').includes('none'));const pet=C.petGeometry(m);assert.equal(pet.scale,.35);assert.equal(pet.x+160*pet.scale,m.pets.dog.footPosition[0]);assert.equal(pet.y+246*pet.scale,m.pets.dog.footPosition[1]);
console.log('PASS: 4 people + dog state, independent traits, static poses, occupied seats, blocked floor, deterministic mixing (8 real / 27 fixture combinations), serialization, validation and declared asset paths.');
