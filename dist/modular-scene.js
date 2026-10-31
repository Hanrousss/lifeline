(function(root){
'use strict';
const BASE='art/',HOME_KINDS=new Set(['home']),KEY_PREFIX='lifeline-art-v1:';
let ready,selectedProfile=null,showDog=false,lastMount=null;
function selectDog(visible){showDog=Boolean(visible);}
const PROFILE_LABELS={adult_f:'Девушка',adult_m:'Мужчина',elder_f:'Пожилая женщина',child:'Ребёнок'};
function displayProfileFor(s){return selectedProfile||root.GraphicsLab?.profile(s)||profileFor(s)||(s.origin?.sex==='male'?'adult_m':'adult_f');}
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
function editorUrl(s){return BASE+'index.html?life='+(s.seed>>>0)+'&profile='+displayProfileFor(s)+'&month='+root.LifelineAssetCore.gameMonths(s)+'&sex='+(s.origin?.sex==='male'?'male':'female');}
function supported(s,kind){return HOME_KINDS.has(kind);}
function roomArrow(step,label){return '<button type="button" class="scene-room-arrow '+(step<0?'previous-room':'next-room')+'" data-room-step="'+step+'" aria-label="'+label+'" disabled><svg viewBox="0 0 36 40" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 9-11 11 11 11" stroke="#684e3c" stroke-width="12" opacity=".3" transform="translate(0 2)"/><path d="m22 8-11 11 11 11" stroke="#765b42" stroke-width="11"/><path d="m22 8-11 11 11 11" stroke="#f4e7c8" stroke-width="8"/><path d="m21 7-10 11" stroke="#fff9e8" stroke-width="2.5"/></svg></button>';}
function markup(s,kind){return supported(s,kind)?'<div class="modular-scene" data-art-style="modular-png"><canvas width="960" height="960" aria-label="Домашняя сцена с персонажем. Нажмите на свободный пол, чтобы переставить его."></canvas>'+roomArrow(-1,'Предыдущая комната')+roomArrow(1,'Следующая комната')+'<span class="art-load-status" role="status">Загрузка комнаты…</span></div>':null;}
function settings(s,manifest,storage){const C=root.LifelineAssetCore;try{const raw=storage.getItem(storageKey(s));if(raw)return C.validateState(JSON.parse(raw),manifest);}catch{}return root.FamilyAppearance?root.FamilyAppearance.defaults(s):C.defaultState();}
function load(){if(!ready)ready=fetch(BASE+'manifest.json?v=12').then(r=>{if(!r.ok)throw new Error('manifest');return r.json();}).then(manifest=>({manifest,art:root.LifelinePngRenderer.create(manifest,BASE)})).catch(error=>{ready=null;throw error;});return ready;}
async function mount(host,s,kind){
 lastMount={host,s,kind};
 const node=host.querySelector('.modular-scene');if(!node||!supported(s,kind))return;
 const token=Symbol();node.renderToken=token;const canvas=node.querySelector('canvas'),fallback=null,status=node.querySelector('.art-load-status');
 try{
  const {manifest,art}=await load(),config=root.GraphicsLab?root.GraphicsLab.preparePet(s,manifest):settings(s,manifest,root.localStorage),scene=root.GraphicsLab?await root.GraphicsLab.sceneFor(s):manifest.scene,id=displayProfileFor(s),pref=root.GraphicsLab?.preferences(s),a={...config.actors[id]};
  if(!pref||pref.emotionFromGame){a.mouthMode='auto';a.happiness=Number.isFinite(s.stats?.joy)?s.stats.joy:100;a.fatigue=1-(Number.isFinite(s.stats?.energy)?Math.max(0,Math.min(100,s.stats.energy)):100)/100;Object.assign(a,root.LifelineAssetCore.resolveExpression(a));}else Object.assign(a,root.LifelineAssetCore.resolveExpression(a));
  if(root.GraphicsLab)a.position=root.GraphicsLab.positionFor(s,scene,id,a.position);
  if(!scene.slots?.length){a.pose='standing';a.seatId=null;}
  const household=root.HouseholdScene&&!root.GraphicsLab?.profile(s)?root.HouseholdScene.arrange(s,scene,a):null;if(household)Object.assign(a,household.self);
  const animal=root.GraphicsLab?root.GraphicsLab.animalVisible(s):showDog,selection=animal?(root.GraphicsLab?root.GraphicsLab.selectionFor(s,config,manifest):root.LifelineAssetCore.companionSelection(manifest,config,'dog')):null;
  // The optional test dog is visual only and does not create a family/ownership record.
  const expanded=root.LifelineHumanGame?await root.LifelineHumanGame.render(s,a,scene,selectedProfile||root.GraphicsLab?.profile(s)):null;
  const [bg,actor,dog]=await Promise.all([art.image(scene.background),expanded?expanded.im:art.actor(id,a),animal?(selection.kind==='dog'?art.pet({dogBreed:selection.variant,dogAge:selection.age,dogPose:selection.pose,dogColor:selection.color}):art.companion(selection)):null]);
  if(!node.isConnected||node.renderToken!==token)return;
  const g=expanded|| (root.HouseholdScene?root.HouseholdScene.geometry(manifest,scene,id,a):art.geometry(id,a)),ratio=expanded||root.HouseholdScene?1:scene.personScale||1;
  if(ratio!==1){g.scale*=ratio;const anchor=manifest.profiles[id].poses[a.pose].footAnchor;g.x=a.position[0]-anchor[0]*g.scale;g.y=a.position[1]-anchor[1]*g.scale;g.footY=a.position[1];}
  const x=canvas.getContext('2d');x.setTransform(3,0,0,3,0,0);x.clearRect(0,0,320,320);x.drawImage(bg,0,0,320,320);const draws=s.age<1&&!expanded&&!root.GraphicsLab?.profile(s)?[]:[{im:actor,...g}];
  if(node.dataset&&expanded){node.dataset.humanRevision='12';node.dataset.humanProfile=expanded.c.profile;node.dataset.humanFace=String(expanded.c.face);node.dataset.humanHair=expanded.c.hair;node.dataset.humanOutfit=String(expanded.c.outfit);}
  if(dog){const pet=root.LifelineAssetCore.companionGeometry(manifest,selection);if(scene.petAnchor){pet.scale*=scene.petScale||1;const entry=root.LifelineAssetCore.companionEntry(manifest,selection).entry,anchor=entry.footAnchor;pet.x=scene.petAnchor[0]-anchor[0]*pet.scale;pet.y=scene.petAnchor[1]-anchor[1]*pet.scale-(entry.flightHeight||0)*(scene.petScale||1);pet.footY=scene.petAnchor[1];}draws.push({im:dog,...pet});}
  if(household&&root.FamilyAppearance){await Promise.all(household.parents.map(async member=>{const parent=root.FamilyAppearance.actor(s,member.role,manifest),pa={...config.actors[parent.profile],...parent,...member},person=root.LifelineHumanGame?await root.LifelineHumanGame.relative(s,pa,scene):null,im=person?person.im:await art.actor(parent.profile,pa),pg=person||root.HouseholdScene.geometry(manifest,scene,parent.profile,pa);draws.push({im,...pg});node.dataset[member.role+'Appearance']=JSON.stringify(parent);}));}
  if(!node.isConnected||node.renderToken!==token)return;
  for(const d of draws.sort((a,b)=>a.footY-b.footY))x.drawImage(d.im,d.x,d.y,(d.im.width||384)*d.scale,(d.im.height||512)*d.scale);
  if(node.dataset)node.dataset.household=JSON.stringify(household?.schedule.members||[]);
  const label=host.querySelector('.activity-label');if(label&&label!==node)label.textContent=(scene.label||'Дома');
  if(node.dataset){const emotion=expanded?root.LifelineHumanV12.expression(expanded.c.happiness,expanded.c.energy):null;if(emotion&&expanded.c.manualMouth&&emotion.eyeTier===0)emotion.mouth=expanded.c.manualMouth;node.dataset.sceneId=scene.id;node.dataset.profile=id;node.dataset.head=a.head;node.dataset.emotionScore=String(emotion?.score??a.emotionScore??'');node.dataset.mouth=emotion?.mouth??a.mouth;node.dataset.eyeTier=String(emotion?.eyeTier??a.eyeTier??'manual');node.dataset.pet=selection?.kind||'none';node.dataset.petBreed=selection?.variant||'';node.dataset.petAge=selection?.age||'';node.dataset.petPose=selection?.pose||'';node.dataset.petFootY=String(scene.petAnchor?.[1]??manifest.pets.dog.footPosition[1]);}
  node.hidden=false;canvas.style.visibility='visible';status.hidden=true;if(fallback)fallback.hidden=true;
  const controls=[...(node.querySelectorAll?.('[data-room-step]')||[])];
  controls.forEach(button=>{button.disabled=false;button.onclick=async()=>{controls.forEach(b=>b.disabled=true);try{if(await root.GraphicsLab?.changeRoom(s,Number(button.dataset.roomStep))){await mount(host,s,kind);root.GraphicsLab.mountPanel(host,s);}}catch{controls.forEach(b=>b.disabled=false);status.hidden=false;status.textContent='Не удалось перейти в комнату. Попробуйте ещё раз.';}};});
  canvas.style.touchAction='pan-y';
  canvas.onclick=event=>{
   const box=canvas.getBoundingClientRect(),point=[(event.clientX-box.left)*320/box.width,(event.clientY-box.top)*320/box.height];
   if(root.GraphicsLab){if(root.GraphicsLab.move(s,scene,id,point,manifest)){mount(host,s,kind);root.GraphicsLab.mountPanel(host,s);}return;}if(!root.LifelineAssetCore.isWalkable(point,manifest.scene))return;
   const savedActor=config.actors[id];savedActor.pose='standing';savedActor.seatId=null;savedActor.position=point;
   try{root.localStorage.setItem(storageKey(s),JSON.stringify(config));}catch{status.textContent='Не удалось сохранить положение';status.hidden=false;return;}
   mount(host,s,kind);
  };
 }catch{if(!node.isConnected||node.renderToken!==token)return;canvas.style.visibility='hidden';status.hidden=false;status.textContent='Не удалось загрузить PNG-сцену. Обновите страницу.';}
}
if(root.addEventListener)root.addEventListener('storage',event=>{if(lastMount&&event.key===root.LifelineHumanGame?.storageKey(lastMount.s)){mount(lastMount.host,lastMount.s,lastMount.kind);root.FamilyAppearance?.mount(lastMount.host,lastMount.s);}});
const api={load,selectDog,displayProfileFor,selectProfile,profileControl,profileFor,storageKey,editorUrl,supported,markup,mount,settings};root.LifelineGameArt=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
