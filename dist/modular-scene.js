(function(root){
'use strict';
const BASE='art/',HOME_KINDS=new Set(['home']),KEY_PREFIX='lifeline-art-v1:';
let ready,selectedProfile=null,showDog=false;
function selectDog(visible){showDog=Boolean(visible);}
const PROFILE_LABELS={adult_f:'Девушка',adult_m:'Мужчина',elder_f:'Пожилая женщина',child:'Ребёнок'};
function displayProfileFor(s){return selectedProfile||root.GraphicsLab?.profile(s)||profileFor(s)||(s.origin?.sex==='male'?'adult_m':'adult_f');}
function selectProfile(id){if(Object.hasOwn(PROFILE_LABELS,id))selectedProfile=id;}
function profileControl(s){return '<div class="art-profile-control"><label>Тест графики <select id="scene-art-profile" aria-label="Готовый персонаж">'+Object.entries(PROFILE_LABELS).map(([id,label])=>'<option value="'+id+'"'+(id===displayProfileFor(s)?' selected':'')+'>'+label+'</option>').join('')+'</select></label><label class="scene-dog-toggle"><input type="checkbox" id="scene-art-dog"'+(showDog?' checked':'')+'> Собака</label></div>';}

function profileFor(s){
 const age=Number(s.age),sex=s.origin?.sex;
 if(age>=6&&age<=12)return 'child';
 if(age>=17&&age<64)return sex==='male'?'adult_m':sex==='female'?'adult_f':null;
 if(age>=64&&sex==='female')return 'elder_f';
 return null;
}
function storageKey(s){return KEY_PREFIX+(s.seed>>>0);}
function editorUrl(s){return BASE+'index.html?life='+(s.seed>>>0)+'&profile='+displayProfileFor(s)+'&month='+root.LifelineAssetCore.gameMonths(s);}
function supported(s,kind){return HOME_KINDS.has(kind);}
function markup(s,kind){return supported(s,kind)?'<div class="modular-scene" data-art-style="modular-png"><canvas width="960" height="960" aria-label="Домашняя сцена с персонажем. Нажмите на свободный пол, чтобы переставить его."></canvas><span class="art-load-status" role="status">Загрузка комнаты…</span></div>':null;}
function settings(s,manifest,storage){const C=root.LifelineAssetCore;try{const raw=storage.getItem(storageKey(s));if(raw)return C.validateState(JSON.parse(raw),manifest);}catch{}return root.FamilyAppearance?root.FamilyAppearance.defaults(s):C.defaultState();}
function load(){if(!ready)ready=fetch(BASE+'manifest.json').then(r=>{if(!r.ok)throw new Error('manifest');return r.json();}).then(manifest=>({manifest,art:root.LifelinePngRenderer.create(manifest,BASE)})).catch(error=>{ready=null;throw error;});return ready;}
async function mount(host,s,kind){
 const node=host.querySelector('.modular-scene');if(!node||!supported(s,kind))return;
 const token=Symbol();node.renderToken=token;const canvas=node.querySelector('canvas'),fallback=null,status=node.querySelector('.art-load-status');
 try{
  const {manifest,art}=await load(),config=root.GraphicsLab?root.GraphicsLab.preparePet(s,manifest):settings(s,manifest,root.localStorage),scene=root.GraphicsLab?await root.GraphicsLab.sceneFor(s):manifest.scene,id=displayProfileFor(s),pref=root.GraphicsLab?.preferences(s),a={...config.actors[id]};
  if(!pref||pref.emotionFromGame){a.mouthMode='auto';a.happiness=Number.isFinite(s.stats?.joy)?s.stats.joy:100;a.fatigue=1-(Number.isFinite(s.stats?.energy)?Math.max(0,Math.min(100,s.stats.energy)):100)/100;Object.assign(a,root.LifelineAssetCore.resolveExpression(a));}else Object.assign(a,root.LifelineAssetCore.resolveExpression(a));
  if(root.GraphicsLab)a.position=root.GraphicsLab.positionFor(s,scene,id,a.position);
  if(!scene.slots?.length){a.pose='standing';a.seatId=null;}
  const animal=root.GraphicsLab?root.GraphicsLab.animalVisible(s):showDog;
  // The optional test dog is visual only and does not create a family/ownership record.
  const [bg,actor,dog]=await Promise.all([art.image(scene.background),art.actor(id,a),animal?art.pet(config):null]);
  if(!node.isConnected||node.renderToken!==token)return;
  const g=art.geometry(id,a),ratio=scene.personScale||1;
  if(ratio!==1){g.scale*=ratio;const anchor=manifest.profiles[id].poses[a.pose].footAnchor;g.x=a.position[0]-anchor[0]*g.scale;g.y=a.position[1]-anchor[1]*g.scale;g.footY=a.position[1];}
  const x=canvas.getContext('2d');x.setTransform(3,0,0,3,0,0);x.clearRect(0,0,320,320);x.drawImage(bg,0,0,320,320);const draws=s.age<1&&!root.GraphicsLab?.profile(s)?[]:[{im:actor,...g}];
  if(dog){const pet=root.LifelineAssetCore.petGeometry(manifest,config.dogAge,config.dogPose,config.dogBreed);if(scene.petAnchor){pet.scale*=scene.petScale||1;const anchor=root.LifelineAssetCore.petEntry(manifest,config).entry.footAnchor;pet.x=scene.petAnchor[0]-anchor[0]*pet.scale;pet.y=scene.petAnchor[1]-anchor[1]*pet.scale;pet.footY=scene.petAnchor[1];}draws.push({im:dog,...pet});}
  for(const d of draws.sort((a,b)=>a.footY-b.footY))x.drawImage(d.im,d.x,d.y,(d.im.width||384)*d.scale,(d.im.height||512)*d.scale);
  if(root.FamilyAppearance&&!root.GraphicsLab?.profile(s)&&(s.age<6||s.flow?.activity==='family')){const parents=['mother','father'].filter(role=>s.family?.[role]?.alive!==false);for(const [index,role]of parents.entries()){const parent=root.FamilyAppearance.actor(s,role,manifest),position=[index===0?155:265,scene.personAnchor?.[1]||278],pa={...config.actors[parent.profile],...parent,position,pose:'standing',seatId:null},im=await art.actor(parent.profile,pa),pg=art.geometry(parent.profile,pa);if(!node.isConnected||node.renderToken!==token)return;if(ratio!==1){pg.scale*=ratio;const pivot=manifest.profiles[parent.profile].poses.standing.footAnchor;pg.x=position[0]-pivot[0]*pg.scale;pg.y=position[1]-pivot[1]*pg.scale;}x.drawImage(im,pg.x,pg.y,im.width*pg.scale,im.height*pg.scale);node.dataset[role+'Appearance']=JSON.stringify(parent);}}
  const label=host.querySelector('.activity-label');if(label&&label!==node)label.textContent=(scene.label||'Дома')+' · тест графики';
  if(node.dataset){node.dataset.sceneId=scene.id;node.dataset.profile=id;node.dataset.head=a.head;node.dataset.emotionScore=String(a.emotionScore??'');node.dataset.mouth=a.mouth;node.dataset.eyeTier=String(a.eyeTier??'manual');node.dataset.pet=animal?'dog':'none';node.dataset.petBreed=config.dogBreed||'prototype';node.dataset.petAge=config.dogAge;node.dataset.petPose=config.dogPose;node.dataset.petFootY=String(scene.petAnchor?.[1]??manifest.pets.dog.footPosition[1]);}
  node.hidden=false;canvas.style.visibility='visible';status.hidden=true;if(fallback)fallback.hidden=true;
  canvas.onclick=event=>{
   const box=canvas.getBoundingClientRect(),point=[(event.clientX-box.left)*320/box.width,(event.clientY-box.top)*320/box.height];
   if(root.GraphicsLab){if(root.GraphicsLab.move(s,scene,id,point,manifest)){mount(host,s,kind);root.GraphicsLab.mountPanel(host,s);}return;}if(!root.LifelineAssetCore.isWalkable(point,manifest.scene))return;
   const savedActor=config.actors[id];savedActor.pose='standing';savedActor.seatId=null;savedActor.position=point;
   try{root.localStorage.setItem(storageKey(s),JSON.stringify(config));}catch{status.textContent='Не удалось сохранить положение';status.hidden=false;return;}
   mount(host,s,kind);
  };
 }catch{if(!node.isConnected||node.renderToken!==token)return;canvas.style.visibility='hidden';status.hidden=false;status.textContent='Не удалось загрузить PNG-сцену. Обновите страницу.';}
}
const api={load,selectDog,displayProfileFor,selectProfile,profileControl,profileFor,storageKey,editorUrl,supported,markup,mount,settings};root.LifelineGameArt=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
