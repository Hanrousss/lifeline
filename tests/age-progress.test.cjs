const assert=require('node:assert/strict'),A=require('../dist/age-progress.js');
const life=(age,months=age*12)=>({seed:42,age,flow:{months},origin:{name:'<Имя>',birthDate:'2023-10-30'}});
for(const [age,id,p]of [[0,'baby',0],[1,'early',0],[6,'child',0],[13,'teen',0],[17,'adult',0],[64,'elder',null],[109,'elder',null]]){const a=A.info(life(age));assert.equal(a.stage.id,id);assert.equal(a.progress,p);}
assert.equal(A.info(life(0,6)).progress,50);assert.equal(A.info(life(0,6)).year,2024);assert.equal(A.info(life(0,6)).age,'0 лет 6 мес.');assert.equal(A.info(life(3)).age,'3 года');assert.equal(A.info(life(11)).age,'11 лет');assert.equal(A.info(life(21)).age,'21 год');assert.equal(A.info(life(25)).year,2048);
assert(A.markup(life(3)).includes('&lt;Имя&gt;'));assert(!A.markup(life(109)).includes('role="progressbar"'),'elder stage must not imply a fixed death age');
const t=A.createTracker();assert(!t(life(5)));assert(t(life(6)));assert(!t(life(6)));assert(!t(life(7)));assert(t(life(17)));assert(!t(life(5)));assert(!t({...life(6),ended:true}));assert(!t({...life(64),seed:84}));assert(!A.createTracker()(life(64)),'reload must not replay');
const original=life(15),before=JSON.stringify(original);A.info(original);A.markup(original);A.createTracker()(original);assert.equal(JSON.stringify(original),before);
console.log('PASS: age boundaries, monthly progress, calendar year, safe names, open-ended elder stage, one celebration per forward transition, no celebration on reload/new life/death and read-only state.');

const moved={...life(25),origin:{...life(25).origin,country:'Бразилия',currentCountry:'Португалия'}};const strip=A.markup(moved);assert(strip.includes('Португалия'));assert(!strip.includes('Бразилия'),'use residence rather than birthplace after migration');assert(strip.indexOf('Португалия')<strip.indexOf('<time>'),'country appears before the year');assert(A.markup({...moved,origin:{...moved.origin,currentCountry:'<Страна>'}}).includes('&lt;Страна&gt;'));
