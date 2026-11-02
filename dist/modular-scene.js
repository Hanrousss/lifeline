(function(root){
'use strict';
const BASE='art/',HOME_KINDS=new Set(['home']),KEY_PREFIX='lifeline-art-v1:';
const frames=new Map();
let ready,selectedProfile=null,showDog=false,lastMount=null;
function selectDog(visible){showDog=Boolean(visible);}
const PROFILE_LABELS={adult_f:'Девушка',adult_m:'Мужчина',elder_f:'Пожилая женщина',child:'Ребёнок'};
function manualProfile(s){if(root.LifelineDevMode&&!root.LifelineDevMode())return null;return selectedProfile||root.GraphicsLab?.profile(s);}
function displayProfileFor(s){return manualProfile(s)||profileFor(s)||(s.origin?.sex==='male'?'adult_m':'adult_f');}
function selectProfile(id){if(Object.hasOwn(PROFILE_LABELS,id))selectedProfile=id;}
function profileControl(s){return '<div class="art-profile-control"><label>Тест графики <select id="scene-art-profile" aria-label="Готовый персонаж">'+Object.entries(PROFILE_LABELS).map(([id,label])=>'<option value="'+id+'"'+(id===displayProfileFor(s)?' selected':'')+'>'+label+'</option>').join('')+'</select></label><label class="scene-dog-toggle"><input type="checkbox" id="scene-art-dog"'+(showDog?' checked':'')+'> Собака</label></div>';}

function profileFor(s){
 const age=Number(s.age),sex=s.origin?.sex;
 if(age>=1&&age<17)return 'child';
 if(age>=17&&age<64)return sex==='male'?'adult_m':sex==='female'?'adult_f':null;
 if(age>=64&&sex==='female')return 'elder_f';
 return null;
}
function storageKey(s){return KEY_PREFIX+(s.seed>>>0);}
function editorUrl(s){return BASE+'people-v12/index.html?life='+(s.seed>>>0)+'&profile='+displayProfileFor(s)+'&month='+root.LifelineAssetCore.gameMonths(s)+'&sex='+(s.origin?.sex==='male'?'male':'female');}
function supported(s,kind){return HOME_KINDS.has(kind);}
function roomArrow(step,label){return '<button type="button" class="scene-room-arrow '+(step<0?'previous-room':'next-room')+'" data-room-step="'+step+'" aria-label="'+label+'" disabled><svg viewBox="0 0 36 40" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 9-11 11 11 11" stroke="#684e3c" stroke-width="12" opacity=".3" transform="translate(0 2)"/><path d="m22 8-11 11 11 11" stroke="#765b42" stroke-width="11"/><path d="m22 8-11 11 11 11" stroke="#f4e7c8" stroke-width="8"/><path d="m21 7-10 11" stroke="#fff9e8" stroke-width="2.5"/></svg></button>';}
function markup(s,kind){return supported(s,kind)?'<div class="modular-scene" data-art-style="modular-png"><canvas width="960" height="960" aria-label="Домашняя сцена с персонажем. Нажмите на свободный пол, чтобы переставить его."></canvas>'+roomArrow(-1,'Предыдущая комната')+roomArrow(1,'Следующая комната')+'<span class="art-load-status" role="status">Загрузка комнаты…</span></div>':null;}
function settings(s,manifest,storage){const C=root.LifelineAssetCore;try{const raw=storage.getItem(storageKey(s));if(raw)return C.validateState(JSON.parse(raw),manifest);}catch{}return root.FamilyAppearance?root.FamilyAppearance.defaults(s):C.defaultState();}
function load(){if(!ready)ready=fetch(BASE+'game-manifest.json?v=15-sealed-seams').then(r=>{if(!r.ok)throw new Error('manifest');return r.json();}).then(manifest=>({manifest,art:root.LifelinePngRenderer.create(manifest,BASE)})).catch(error=>{ready=null;throw error;});return ready;}
async function mount(host,s,kind){
 lastMount={host,s,kind};
 const node=host.querySelector('.modular-scene');if(!node||!supported(s,kind))return;
 const token=Symbol();node.renderToken=token;const canvas=node.querySelector('canvas'),fallback=null,status=node.querySelector('.art-load-status');const previous=frames.get(s.seed);if(previous){const visible=canvas.getContext('2d');visible.setTransform(1,0,0,1,0,0);visible.drawImage(previous,0,0);canvas.style.visibility='visible';status.hidden=true;}
 try{
  const {manifest,art}=await load(),config=root.GraphicsLab?root.GraphicsLab.preparePet(s,manifest):settings(s,manifest,root.localStorage),scene=root.GraphicsLab?await root.GraphicsLab.sceneFor(s):manifest.scene,id=displayProfileFor(s),pref=root.GraphicsLab?.preferences(s),a={...config.actors[id]};
  if(!pref||pref.emotionFromGame||root.LifelineDevMode&&!root.LifelineDevMode()){a.mouthMode='auto';a.happiness=Number.isFinite(s.stats?.joy)?s.stats.joy:100;a.fatigue=1-(Number.isFinite(s.stats?.energy)?Math.max(0,Math.min(100,s.stats.energy)):100)/100;Object.assign(a,root.LifelineAssetCore.resolveExpression(a));}else Object.assign(a,root.LifelineAssetCore.resolveExpression(a));
  if(root.GraphicsLab)a.position=root.GraphicsLab.positionFor(s,scene,id,a.position);
  if(!scene.slots?.length){a.pose='standing';a.seatId=null;}
  const household=root.HouseholdScene&&!manualProfile(s)?root.HouseholdScene.arrange(s,scene,a):null;if(household)Object.assign(a,household.self);if(s.reference?.snapshot?.details?.health?.disability?.wheelchair){a.pose='sitting';a.seatId=null;}
  const animal=root.GraphicsLab?root.GraphicsLab.animalVisible(s):showDog,selection=animal?(root.GraphicsLab?root.GraphicsLab.selectionFor(s,config,manifest):root.LifelineAssetCore.companionSelection(manifest,config,'dog')):null;
  // The optional test dog is visual only and does not create a family/ownership record.
  const background=art.image(scene.background.replace(/\.png$/,'.webp')).catch(()=>art.image(scene.background));
  // Show the room immediately, while people and pets load concurrently.
  background.then(bg=>{if(node.isConnected&&node.renderToken===token)node.parentElement.style.setProperty('--scene-backdrop','url('+JSON.stringify(bg.src)+')');if(!previous&&node.isConnected&&node.renderToken===token){const x=canvas.getContext('2d');x.setTransform(3,0,0,3,0,0);x.clearRect(0,0,320,320);x.drawImage(bg,0,0,320,320);canvas.style.visibility='visible';status.hidden=true;}}).catch(()=>{});
  const relatives=household&&root.FamilyAppearance?Promise.all(household.parents.map(async member=>{const identity=['mother','father'].includes(member.role)?null:root.FamilyAppearance.personConfig(member.person,s.seed),parent=identity?{profile:identity.sex==='male'?'adult_m':'adult_f',humanTraits:{...identity,pose:identity.months<36?identity.pose:member.pose}}:root.FamilyAppearance.actor(s,member.role,manifest),pa={...config.actors[parent.profile],...parent,...member},person=root.LifelineHumanGame?await root.LifelineHumanGame.relative(s,pa,scene):null,im=person?person.im:await art.actor(parent.profile,pa),pg=person||root.HouseholdScene.geometry(manifest,scene,parent.profile,pa);return {im,...pg,role:member.role,parent,name:member.name||(/^(?:sibling|child|friend|partner)[-:]/i.test(member.person?.name?.full||'')?'':member.person?.name?.full)||s.family?.[member.role]?.name||member.relation,relation:member.relation||({mother:'Мама',father:'Папа'}[member.role]||'')};})):Promise.resolve([]);
  const [bg,expanded,dog,parents]=await Promise.all([background,root.LifelineHumanGame?root.LifelineHumanGame.render(s,a,scene,manualProfile(s)):null,animal?(selection.kind==='dog'?art.pet({dogBreed:selection.variant,dogAge:selection.age,dogPose:selection.pose,dogColor:selection.color}):art.companion(selection)):null,relatives]);
  const actor=expanded?expanded.im:await art.actor(id,a);
  if(!node.isConnected||node.renderToken!==token)return;
  const g=expanded|| (root.HouseholdScene?root.HouseholdScene.geometry(manifest,scene,id,a):art.geometry(id,a)),ratio=expanded||root.HouseholdScene?1:scene.personScale||1;
  if(ratio!==1){g.scale*=ratio;const anchor=manifest.profiles[id].poses[a.pose].footAnchor;g.x=a.position[0]-anchor[0]*g.scale;g.y=a.position[1]-anchor[1]*g.scale;g.footY=a.position[1];}
  const frame=document.createElement('canvas');frame.width=canvas.width;frame.height=canvas.height;const x=frame.getContext('2d');x.setTransform(3,0,0,3,0,0);x.drawImage(bg,0,0,320,320);node.petHit=null;const draws=s.age<1&&!expanded&&!manualProfile(s)?[]:[{im:actor,...g}];
  if(node.dataset&&expanded){node.dataset.humanRevision='12';node.dataset.humanProfile=expanded.c.profile;node.dataset.humanFace=String(expanded.c.face);node.dataset.humanHair=expanded.c.hair;node.dataset.humanOutfit=String(expanded.c.outfit);}
  if(dog){const pet=root.LifelineAssetCore.companionGeometry(manifest,selection);if(scene.petAnchor){pet.scale*=scene.petScale||1;const entry=root.LifelineAssetCore.companionEntry(manifest,selection).entry,anchor=entry.footAnchor;pet.x=scene.petAnchor[0]-anchor[0]*pet.scale;pet.y=scene.petAnchor[1]-anchor[1]*pet.scale-(entry.flightHeight||0)*(scene.petScale||1);pet.footY=scene.petAnchor[1];}node.petHit={im:dog,...pet};draws.push({im:dog,...pet});}
  for(const parent of parents){draws.push(parent);node.dataset[parent.role+'Appearance']=JSON.stringify(parent.parent);}
  if(!node.isConnected||node.renderToken!==token)return;
  drawHobbyObject(x,s,draws);drawWheelchair(x,s,g,actor);
  for(const d of draws.sort((a,b)=>a.footY-b.footY))x.drawImage(d.im,d.x,d.y,(d.im.width||384)*d.scale,(d.im.height||512)*d.scale);
  drawHealthAid(x,s,g,actor);
  const visible=canvas.getContext('2d');visible.setTransform(1,0,0,1,0,0);visible.drawImage(frame,0,0);(node.querySelectorAll?.('.scene-nameplate')||[]).forEach(n=>n.remove());
  const plates=[],addPlate=(name,image,geometry,relation='')=>{if(!name)return;const bounds=visibleActorBounds(image,geometry);plates.push({name,relation,...nameplateAnchor(bounds)});};
  if(!(s.age<1&&!expanded&&!manualProfile(s)))addPlate('Вы',actor,g);
  for(const member of parents)addPlate(member.name,member.im,member,member.relation);
  if(node.petHit&&s.reference?.snapshot?.pet)addPlate(s.reference.snapshot.pet.name,node.petHit.im,node.petHit);
  for(const p of plates){const tag=document.createElement('span');tag.className='scene-nameplate';tag.style.left=(p.x/3.2)+'%';tag.style.top=(p.y/3.2)+'%';tag.textContent=root.LifelineRussian?.text(p.name)||p.name;tag.title=tag.textContent+(p.relation?' · '+p.relation:'');node.append(tag);}

  if(node.dataset)node.dataset.household=JSON.stringify(household?.schedule.members||[]);
  const label=host.querySelector('.activity-label');if(label&&label!==node)label.textContent=(scene.label||'Дома');
  if(node.dataset){const emotion=expanded?root.LifelineHumanV12.expression(expanded.c.happiness,expanded.c.energy):null;if(emotion&&expanded.c.manualMouth&&emotion.eyeTier===0)emotion.mouth=expanded.c.manualMouth;node.dataset.sceneId=scene.id;node.dataset.profile=id;node.dataset.head=a.head;node.dataset.emotionScore=String(emotion?.score??a.emotionScore??'');node.dataset.mouth=emotion?.mouth??a.mouth;node.dataset.eyeTier=String(emotion?.eyeTier??a.eyeTier??'manual');node.dataset.pet=selection?.kind||'none';node.dataset.petBreed=selection?.variant||'';node.dataset.petAge=selection?.age||'';node.dataset.petPose=selection?.pose||'';node.dataset.petFootY=String(scene.petAnchor?.[1]??manifest.pets.dog.footPosition[1]);}
  if(frames.size>=2&&!frames.has(s.seed))frames.delete(frames.keys().next().value);frames.set(s.seed,frame);
  node.hidden=false;canvas.style.visibility='visible';status.hidden=true;if(fallback)fallback.hidden=true;
  const controls=[...(node.querySelectorAll?.('[data-room-step]')||[])];
  controls.forEach(button=>{button.disabled=false;button.onclick=async()=>{controls.forEach(b=>b.disabled=true);try{if(await root.GraphicsLab?.changeRoom(s,Number(button.dataset.roomStep))){await mount(host,s,kind);root.GraphicsLab.mountPanel(host,s);}}catch{controls.forEach(b=>b.disabled=false);status.hidden=false;status.textContent='Не удалось перейти в комнату. Попробуйте ещё раз.';}};});
  canvas.style.touchAction='pan-y';
  canvas.onclick=event=>{
   const box=canvas.getBoundingClientRect(),point=[(event.clientX-box.left)*320/box.width,(event.clientY-box.top)*320/box.height];
   const hit=node.petHit;if(hit){const px=Math.floor((point[0]-hit.x)/hit.scale),py=Math.floor((point[1]-hit.y)/hit.scale);if(px>=0&&py>=0&&px<hit.im.width&&py<hit.im.height){const probe=document.createElement('canvas');probe.width=hit.im.width;probe.height=hit.im.height;const ctx=probe.getContext('2d');ctx.drawImage(hit.im,0,0);if(ctx.getImageData(px,py,1,1).data[3]>20){for(let i=0;i<3;i++){const heart=document.createElement('span');heart.className='pet-touch-heart';heart.textContent='♥';heart.setAttribute('aria-hidden','true');heart.style.cssText='left:'+(event.clientX-box.left+i*7-7)+'px;top:'+(event.clientY-box.top-12)+'px;--pet-drift:'+((i-1)*18)+'px;--pet-delay:'+i*.08+'s';node.append(heart);setTimeout(()=>heart.remove(),1300);}root.GraphicsLab.reactPet(s,selection,manifest);mount(host,s,kind);return;}}}
   if(root.GraphicsLab){if(root.GraphicsLab.move(s,scene,id,point,manifest)){mount(host,s,kind);root.GraphicsLab.mountPanel(host,s);}return;}if(!root.LifelineAssetCore.isWalkable(point,manifest.scene))return;
   const savedActor=config.actors[id];savedActor.pose='standing';savedActor.seatId=null;savedActor.position=point;
   try{root.localStorage.setItem(storageKey(s),JSON.stringify(config));}catch{status.textContent='Не удалось сохранить положение';status.hidden=false;return;}
   mount(host,s,kind);
  };
 }catch{if(!node.isConnected||node.renderToken!==token)return;canvas.style.visibility=previous?'visible':'hidden';status.hidden=false;status.textContent=previous?'Не удалось обновить сцену. Попробуйте ещё раз.':'Не удалось загрузить сцену. Обновите страницу.';}
}
function drawHobbyObject(x,s,draws){const hobby=s.reference?.snapshot?.details?.hobbies?.[0];if(!hobby)return;const candidates=[[35,290],[275,290],[155,300]],free=candidates.find(([cx,cy])=>!draws.some(d=>cx+19>d.x&&cx-19<d.x+d.im.width*d.scale&&cy>d.y&&cy-50<d.y+d.im.height*d.scale));if(!free)return;const [cx,cy]=free;x.save();x.translate(cx,cy);x.strokeStyle='#5e4936';x.lineWidth=1.6;x.lineJoin='round';if(/art|draw|paint|photo/.test(hobby.id)){x.beginPath();x.moveTo(-14,0);x.lineTo(0,-53);x.lineTo(14,0);x.stroke();x.fillStyle='#f0dfbc';x.fillRect(-18,-46,36,30);x.strokeRect(-18,-46,36,30);x.fillStyle='#8eae83';x.fillRect(-14,-28,28,8);x.fillStyle='#a3bfce';x.fillRect(-14,-42,28,13);}else if(/music/.test(hobby.id)){x.fillStyle='#ad7847';x.beginPath();x.ellipse(-4,-12,12,15,-.25,0,Math.PI*2);x.fill();x.stroke();x.fillStyle='#66503a';x.fillRect(-1,-48,5,30);x.beginPath();x.arc(-3,-13,4,0,Math.PI*2);x.fill();x.strokeStyle='#ecd9b1';x.lineWidth=.7;for(let i=0;i<3;i++){x.beginPath();x.moveTo(i,-45);x.lineTo(i-3,-4);x.stroke();}}else if(/garden|plant/.test(hobby.id)){x.fillStyle='#b57e5d';x.fillRect(-12,-18,24,18);x.strokeRect(-12,-18,24,18);x.strokeStyle='#5b744a';x.beginPath();x.moveTo(0,-18);x.lineTo(0,-43);x.stroke();x.fillStyle='#829c66';for(const side of [-1,1]){x.beginPath();x.ellipse(side*7,-32,10,5,side*.5,0,Math.PI*2);x.fill();}}else{x.fillStyle='#7e9d8b';x.fillRect(-18,-8,36,8);x.strokeRect(-18,-8,36,8);x.fillStyle='#d3b77e';x.fillRect(-15,-16,31,8);x.strokeRect(-15,-16,31,8);}x.restore();}
function nameplateAnchor(bounds){return {x:Math.max(24,Math.min(296,bounds.x+bounds.width/2)),y:Math.max(16,Math.min(300,bounds.y-5))};}
function visibleActorBounds(actor,g){const c=document.createElement('canvas');c.width=actor.width;c.height=actor.height;const ctx=c.getContext('2d');ctx.drawImage(actor,0,0);const data=ctx.getImageData(0,0,c.width,c.height).data;let minX=c.width,minY=c.height,maxX=0,maxY=0;for(let y=0;y<c.height;y++)for(let px=0;px<c.width;px++)if(data[(y*c.width+px)*4+3]>30){minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}return {x:g.x+minX*g.scale,y:g.y+minY*g.scale,width:(maxX-minX)*g.scale,height:(maxY-minY)*g.scale};}
function drawWheelchair(x,s,g,actor){if(!s.reference?.snapshot?.details?.health?.disability?.wheelchair)return;const b=visibleActorBounds(actor,g),w=b.width,h=b.height,c=b.x+w*.5,f=b.y+h;x.save();x.strokeStyle='#525e60';x.lineWidth=1.7;x.fillStyle='#748f98';x.fillRect(c-w*.48,f-h*.53,w*.75,h*.3);x.strokeRect(c-w*.48,f-h*.53,w*.75,h*.3);x.beginPath();x.moveTo(c-w*.48,f-h*.23);x.lineTo(c+w*.25,f-h*.23);x.lineTo(c+w*.45,f-1);x.lineTo(c+w*.65,f-1);x.stroke();for(const [px,r]of [[c-w*.34,h*.16],[c+w*.52,h*.055]]){x.beginPath();x.arc(px,f-r,r,0,Math.PI*2);x.fillStyle='#d4d9d5';x.fill();x.stroke();if(r>h*.1){for(let angle=0;angle<Math.PI*2;angle+=Math.PI/3){x.beginPath();x.moveTo(px,f-r);x.lineTo(px+Math.cos(angle)*r,f-r+Math.sin(angle)*r);x.stroke();}}}x.restore();}
function drawHealthAid(x,s,g,actor){const h=s.reference?.snapshot?.details?.health;if(!h||!g)return;const b=visibleActorBounds(actor,g),width=b.width,height=b.height,cx=b.x+width*.5,foot=b.y+height;x.save();x.lineWidth=2;x.strokeStyle='#675644';if(h.injury?.kind==='cast'){x.fillStyle='#e8e7dc';x.fillRect(cx-width*.15,foot-height*.18,Math.max(5,width*.12),height*.1);x.strokeRect(cx-width*.15,foot-height*.18,Math.max(5,width*.12),height*.1);}if(h.disability?.kind==='move'&&!h.disability.wheelchair){x.beginPath();x.moveTo(cx+width*.3,foot-height*.38);x.lineTo(cx+width*.4,foot-3);x.stroke();}if(h.disability?.kind==='hear'&&h.disability.aid){x.fillStyle='#9faea4';x.fillRect(cx+width*.13,foot-height*.8,3,5);}x.restore();}
if(root.addEventListener)root.addEventListener('storage',event=>{if(lastMount&&event.key===root.LifelineHumanGame?.storageKey(lastMount.s)){mount(lastMount.host,lastMount.s,lastMount.kind);root.FamilyAppearance?.mount(lastMount.host,lastMount.s);}});
const api={load,selectDog,displayProfileFor,selectProfile,profileControl,profileFor,storageKey,editorUrl,supported,markup,mount,settings,nameplateAnchor};root.LifelineGameArt=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
