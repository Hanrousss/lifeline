const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../dist/app.js'),'utf8');
const code=source.split('\n').find(line=>line.startsWith('function setConsoleTime('));
let pending=false,saves=0,renders=0,decisions=0;
const context={state:{flow:{speed:6,playing:true},ended:false},F:{pending:()=>pending,ensure:s=>s.flow},save:()=>saves++,render:()=>renders++,returnToDecision:()=>decisions++};
vm.createContext(context);vm.runInContext(code,context);
context.setConsoleTime(0);assert.equal(context.state.flow.playing,false);assert.equal(context.state.flow.speed,6);
for(const speed of [1,2,4,6]){context.setConsoleTime(speed);assert.equal(context.state.flow.speed,speed);assert.equal(context.state.flow.playing,true);}
const before={saves,renders};pending=true;context.state.flow.playing=false;context.setConsoleTime(6);assert.equal(decisions,1);assert.equal(context.state.flow.playing,false);assert.equal(saves,before.saves);assert.equal(renders,before.renders);
context.setConsoleTime(0);assert.equal(decisions,1);pending=false;context.state.ended=true;context.setConsoleTime(1);assert.equal(context.state.flow.playing,false);assert.equal(saves,before.saves);
context.state.ended=false;context.setConsoleTime(99);assert.equal(saves,before.saves);
console.log('PASS: separate pause/play/2x/4x/6x controls, normal-speed reset, pending-decision stop, ended-life guard and invalid speed rejection.');
vm.runInContext(source.split('\n').filter(line=>line.startsWith('function setConsoleSpeed(')||line.startsWith('function toggleConsolePlayback(')).join('\n'),context);
context.state.flow.playing=false;context.setConsoleSpeed(4);
assert.equal(context.state.flow.speed,4);assert.equal(context.state.flow.playing,false);
context.toggleConsolePlayback();assert.equal(context.state.flow.playing,true);assert.equal(context.state.flow.speed,4);
context.setConsoleSpeed(6);assert.equal(context.state.flow.playing,true);assert.equal(context.state.flow.speed,6);
context.toggleConsolePlayback();assert.equal(context.state.flow.playing,false);assert.equal(context.state.flow.speed,6);
pending=true;context.setConsoleSpeed(1);assert.equal(context.state.flow.speed,6);
pending=false;context.state.ended=true;context.setConsoleSpeed(1);assert.equal(context.state.flow.speed,6);
console.log('PASS: speed selection preserves paused/playing state, toggle resumes chosen speed, decisions and ended life lock speed.');
vm.runInContext(source.split('\n').filter(line=>line.startsWith('function stepConsoleSpeed(')||line.startsWith('function scenePlayback(')).join('\n'),context);
context.musicControl=()=>'';pending=false;context.state.ended=false;context.state.flow.playing=false;context.state.flow.speed=1;
for(const expected of [2,4,6,6]){context.stepConsoleSpeed(1);assert.equal(context.state.flow.speed,expected);assert.equal(context.state.flow.playing,false,'Changing speed must keep pause');}
for(const expected of [4,2,1,1]){context.stepConsoleSpeed(-1);assert.equal(context.state.flow.speed,expected);}
for(const [speed,left]of [[1,1],[2,1],[4,2],[6,4]]){context.state.flow.speed=speed;const html=context.scenePlayback(),button=id=>html.match(new RegExp('<button[^>]*id="'+id+'"[^>]*>[\\s\\S]*?</button>'))[0];assert(button('console-faster').includes('>'+speed+'×</span>'));assert(button('console-slower').includes('>'+left+'×</span>'));assert.equal(button('console-faster').includes(' disabled'),speed===6);assert.equal(button('console-slower').includes(' disabled'),speed===1);}
pending=true;context.state.flow.speed=4;context.stepConsoleSpeed(1);assert.equal(context.state.flow.speed,4);assert(context.scenePlayback().match(/id="console-faster"[^>]*disabled/));pending=false;
const E=require('../dist/engine.js'),F=require('../dist/timeline.js'),saved=E.fresh(44);F.ensure(saved);saved.flow.speed=3;assert.equal(F.ensure(saved).speed,2,'Existing 3× saves migrate to the next lower supported speed');for(const speed of [1,2,4,6]){saved.flow.speed=speed;assert.equal(F.ensure(saved).speed,speed);}
console.log('PASS: 1/2/4/6 steps, boundaries, speed labels, pending-choice lock and old-save migration.');
