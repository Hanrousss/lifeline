(function(root){
'use strict';
const KEY='lifeline-graphics-lab-v1:',profiles=['adult_f','adult_m','elder_f','child'];let catalogPromise;const petReactions=new Map();
function defaults(){return {house:'modest_01',room:'living_room',profile:null,animal:'none',emotionFromGame:true,positions:{}};}
function preferences(s,storage=root.localStorage){let contextual=null;if(s.reference&&!root.LifelineDevMode?.()){const h=s.reference.snapshot.raw.lifelineHome;if(h)contextual=h.house||['village_low_02','modest_01','village_middle_01','village_high_01'][Math.max(0,Math.min(3,h.quality??1))];}try{const raw=JSON.parse(storage.getItem(KEY+(s.seed>>>0)));if(!raw||typeof raw!=='object')return {...defaults(),...(contextual?{house:contextual}:{})};return {...defaults(),...raw,...(contextual?{house:contextual}:{}),profile:profiles.includes(raw.profile)?raw.profile:null,animal:raw.animal==='dog'||Object.hasOwn(root.LifelineAssetCore.PET_TYPES,raw.animal)?raw.animal:'none',positions:raw.positions&&typeof raw.positions==='object'?raw.positions:{}};}catch{return {...defaults(),...(contextual?{house:contextual}:{})};}}
function savePreferences(s,p){root.localStorage.setItem(KEY+(s.seed>>>0),JSON.stringify(p));}
function profile(s){return root.LifelineDevMode&&!root.LifelineDevMode()?null:preferences(s).profile;}
function gameplayPet(s){return s.reference&&!(root.LifelineDevMode?.())?s.reference.snapshot.pet:null;}
const petKinds={d:'dog',c:'cat',h:'hamster',r:'rabbit',b:'budgerigar'};
function animalVisible(s){return s.reference&&!root.LifelineDevMode?.()?Boolean(gameplayPet(s)?.here&&petKinds[gameplayPet(s).kind]):preferences(s).animal!=='none';}
function petHash(s,p){let n=Number(s.seed)>>>0;for(const c of p.name+':'+p.at)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
function gameplaySelection(s,manifest){const p=gameplayPet(s),kind=petKinds[p?.kind];if(!p?.here||!kind||!manifest.pets[kind])return null;const C=root.LifelineAssetCore,hash=petHash(s,p),months=Math.max(0,(s.reference.snapshot.raw.age+(s.reference.snapshot.raw.t||0)-p.at)*12),pet=manifest.pets[kind],variants=Object.keys(kind==='dog'?pet.breeds:pet.variants),variant=variants[hash%variants.length],age=kind==='dog'?C.dogAgeFromMonths(months):months<pet.ageBoundariesMonths[0]?'juvenile':months<pet.ageBoundariesMonths[1]?'adult':'senior',entry=(kind==='dog'?pet.breeds[variant]:pet.variants[variant]).ages[age],poses=Object.keys(entry.poses),pose=poses[(hash+Math.floor(months/3))%poses.length];return {kind,variant,age,pose,color:hash%3};}

function loadCatalog(){if(!catalogPromise)catalogPromise=fetch('art/graphics_catalog.json').then(r=>{if(!r.ok)throw Error('Не удалось загрузить список комнат');return r.json();}).catch(e=>{catalogPromise=null;throw e;});return catalogPromise;}
function chooseScene(catalog,p){const house=catalog.houses.find(h=>h.id===p.house)||catalog.houses[0],scene=house.rooms.find(r=>r.kind===p.room)||house.rooms.find(r=>r.kind==='living_room')||house.rooms[0];return {...scene,houseId:house.id,label:house.label+' · '+scene.label};}
async function sceneFor(s){return chooseScene(await loadCatalog(),preferences(s));}
async function changeRoom(s,direction){const catalog=await loadCatalog(),pref=preferences(s),scene=chooseScene(catalog,pref),house=catalog.houses.find(h=>h.id===scene.houseId),rooms=house.rooms.filter(r=>r.kind!=='exterior'),index=rooms.findIndex(r=>r.kind===scene.kind);pref.room=rooms[(index+direction+rooms.length)%rooms.length].kind;savePreferences(s,pref);return true;}
function positionFor(s,scene,id,fallback){const point=preferences(s).positions[scene.id+':'+id];return Array.isArray(point)&&root.LifelineAssetCore.isWalkable(point,scene)?point:scene.id==='pilot_living_room'?fallback:scene.personAnchor;}
function saveConfig(s,config,manifest){const checked=root.LifelineAssetCore.validateState(config,manifest);root.localStorage.setItem(root.LifelineGameArt.storageKey(s),JSON.stringify(checked));}
function move(s,scene,id,point,manifest){if(!root.LifelineAssetCore.isWalkable(point,scene))return false;const pref=preferences(s);pref.positions[scene.id+':'+id]=point;savePreferences(s,pref);const config=root.LifelineGameArt.settings(s,manifest,root.localStorage);config.actors[id].pose='standing';config.actors[id].seatId=null;saveConfig(s,config,manifest);return true;}
function selectionFor(s,config,manifest){const kind=preferences(s).animal,selection=s.reference&&!root.LifelineDevMode?.()?gameplaySelection(s,manifest):kind==='none'?null:root.LifelineAssetCore.companionSelection(manifest,config,kind,root.LifelineAssetCore.gameMonths(s));const reaction=petReactions.get(s.seed);if(selection&&reaction?.until>Date.now()&&reaction.kind===selection.kind)selection.pose=reaction.pose;return selection;}
function reactPet(s,selection,manifest){const pet=selection.kind==='dog'?manifest.pets.dog.breeds[selection.variant]||manifest.pets.dog:manifest.pets[selection.kind].variants[selection.variant],poses=Object.keys(pet.ages[selection.age].poses).filter(p=>p!=='sleeping'),next=poses[(poses.indexOf(selection.pose)+1)%poses.length];petReactions.set(s.seed,{kind:selection.kind,pose:next,until:Date.now()+4000});return next;}
function preparePet(s,manifest){const C=root.LifelineAssetCore,config=root.LifelineGameArt.settings(s,manifest,root.localStorage),kind=s.reference&&!root.LifelineDevMode?.()?'none':preferences(s).animal;if(kind!=='none'){const selection=C.companionSelection(manifest,config,kind);if(!selection.clock){const clock=kind==='dog'?C.dogClockFor(selection.age,C.gameMonths(s)):C.companionClock(selection.age,C.gameMonths(s),manifest.pets[kind]);C.setCompanion(config,kind,'clock',clock,C.gameMonths(s),manifest);saveConfig(s,config,manifest);}}return C.petStateAt(config,C.gameMonths(s));}
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function select(key,label,items,value,disabled=false){return '<label>'+label+'<select data-lab="'+key+'"'+(disabled?' disabled':'')+'>'+items.map(([id,name])=>'<option value="'+id+'"'+(String(id)===String(value)?' selected':'')+'>'+esc(name)+'</option>').join('')+'</select></label>';}
function range(key,label,value){return '<label>'+label+' <span data-lab-out="'+key+'">'+Math.round(value)+'%</span><input data-lab="'+key+'" type="range" min="0" max="100" value="'+Math.round(value)+'"></label>';}
function markup(){return '<div class="graphics-lab" data-graphics-lab><p>Загрузка настроек…</p></div>';}
async function mountPanel(host,s){
 const panel=host.querySelector('[data-graphics-lab]');if(!panel)return;const token=Symbol();panel.loadToken=token;
 try{
  const [{manifest},catalog]=await Promise.all([root.LifelineGameArt.load(),loadCatalog()]);if(!panel.isConnected||panel.loadToken!==token)return;
  const C=root.LifelineAssetCore,A=root.LifelineGameArt;
  function refresh(){
   const opened=[...panel.querySelectorAll('details[open]')].map(d=>d.querySelector('summary').textContent);
   const pref=preferences(s),config=preparePet(s,manifest),id=A.displayProfileFor(s),a=config.actors[id],scene=chooseScene(catalog,pref),house=catalog.houses.find(h=>h.id===scene.houseId);
   const colors=values=>values.map((name,i)=>[i,name]),pose=a.pose==='sitting'?a.seatId:'standing';
   const petKind=pref.animal==='none'?'dog':pref.animal,petDef=manifest.pets[petKind],chosen=C.companionSelection(manifest,config,petKind,C.gameMonths(s)),petDisabled=pref.animal==='none',variantOptions=petKind==='dog'?Object.entries(C.DOG_BREEDS).filter(([key])=>key!=='prototype'||chosen.variant==='prototype'):Object.entries(petDef.variants).map(([key,v])=>[key,v.label]),ageOptions=petKind==='dog'?[['puppy','Щенок'],['adult','Взрослая'],['senior','Пожилая']]:Object.entries(petDef.ageLabels),poseOptions=petKind==='dog'?Object.entries(C.DOG_POSES).filter(([key])=>chosen.variant!=='prototype'||['standing','sitting'].includes(key)):Object.entries(petDef.poseLabels);
   panel.innerHTML='<div class="lab-grid">'+select('house','Дом',catalog.houses.map(h=>[h.id,h.label]),house.id)+select('room','Комната',house.rooms.map(r=>[r.kind,r.label]),scene.kind)+select('profile','Человек',Object.entries(C.LABELS),id)+select('head','Черты лица',[['standing','Лицо 1'],['sitting','Лицо 2']],a.head)+select('animal','Животное',[['none','Нет'],['dog','Собака'],...Object.entries(C.PET_TYPES).filter(([key])=>manifest.pets[key]?.available)],pref.animal)+select('petVariant','Порода / вариант',variantOptions,chosen.variant,petDisabled)+select('petAge','Возраст питомца',ageOptions,chosen.age,petDisabled)+'</div>'+
   '<details><summary>Внешность человека</summary><div class="lab-grid">'+select('skin','Кожа',colors(['Тон 1','Тон 2','Тон 3','Тон 4','Тон 5']),a.skin)+select('hairStyle','Причёска',C.availableHairStyles(id).map(k=>[k,{short:'Короткая',bob:'Каре',none:'Без волос'}[k]]),a.hairStyle)+select('hairColor','Волосы',colors(['Каштановые','Почти чёрные','Рыжие','Седые','Светлые']),a.hairColor)+select('top','Верх',colors(['Мох','Терракота','Голубой','Сиреневый']),a.top)+select('bottom','Низ',colors(['Тёмно-синий','Графит','Коричневый']),a.bottom)+'</div></details>'+
   '<details><summary>Позы и эмоции</summary><div class="lab-grid">'+select('pose','Поза человека',[['standing','Стоит'],...(scene.slots.length?[['sofa_left','Сидит слева'],['sofa_right','Сидит справа']]:[])],scene.slots.length?pose:'standing')+'<label class="lab-check"><input type="checkbox" data-lab="emotionFromGame"'+(pref.emotionFromGame?' checked':'')+'> Эмоции по игре</label>'+select('expression','Выражение',[['auto','По счастью и усталости'],['smile','Улыбка'],['soft','Небольшая улыбка'],['neutral','Нейтральное'],['sad','Грустное']],a.mouthMode==='auto'?'auto':a.mouth,pref.emotionFromGame)+range('happiness','Счастье',a.happiness)+range('fatigue','Усталость',a.fatigue*100)+'</div></details>'+
   '<details><summary>Животное: поза и окрас</summary><div class="lab-grid">'+select('petPose','Поза',poseOptions,chosen.pose,petDisabled)+select('petColor','Окрас',colors(petKind==='dog'?['Рыжий','Коричневый','Светлый']:petDef.colorLabels),chosen.color,petDisabled)+'</div></details><p class="lab-note">Возраст питомца меняется с игровым временем по границам его вида. Выбор возраста задаёт начальную точку. Меняются только рисунки. Нажмите на свободный пол, чтобы переставить человека.</p><p class="lab-error" role="status"></p>';
   panel.querySelectorAll('details').forEach(d=>{d.open=opened.includes(d.querySelector('summary').textContent);});
   panel.querySelectorAll('[data-lab]').forEach(input=>{
    const handler=()=>{
     try{
      const key=input.dataset.lab,value=input.type==='checkbox'?input.checked:input.type==='range'?Number(input.value):input.value,p=preferences(s),cfg=A.settings(s,manifest,root.localStorage),who=A.displayProfileFor(s),actor=cfg.actors[who];
      if(['house','room','profile','animal','emotionFromGame'].includes(key)){p[key]=value;savePreferences(s,p);if(key==='profile')A.selectProfile(value);}
      else if(['petVariant','petAge','petPose','petColor'].includes(key)){const kind=p.animal==='none'?'dog':p.animal,field={petVariant:'variant',petAge:'age',petPose:'pose',petColor:'color'}[key];C.setCompanion(cfg,kind,field,key==='petColor'?Number(value):value,C.gameMonths(s),manifest);}
      else if(key==='pose'){if(value==='standing'){actor.pose='standing';actor.seatId=null;}else{const result=C.sit(cfg,who,value,manifest);if(!result.ok)throw Error(result.error);Object.assign(cfg,result.state);}}
      else if(key==='expression'){actor.mouthMode=value==='auto'?'auto':'manual';if(value!=='auto')actor.mouth=value;}
      else if(key==='fatigue'){actor.fatigue=value/100;actor.mouthMode='auto';}
      else if(key==='happiness'){actor.happiness=value;actor.mouthMode='auto';}
      else actor[key]=['skin','hairColor','top','bottom'].includes(key)?Number(value):value;
      if(['fatigue','happiness'].includes(key)){p.emotionFromGame=false;savePreferences(s,p);const linked=panel.querySelector('[data-lab="emotionFromGame"]'),expression=panel.querySelector('[data-lab="expression"]');if(linked)linked.checked=false;if(expression){expression.disabled=false;expression.value='auto';}}
      saveConfig(s,cfg,manifest);A.mount(host,s,'home');
      if(input.type==='range'){const out=panel.querySelector('[data-lab-out="'+key+'"]');if(out)out.textContent=Math.round(value)+'%';}
      else refresh();
     }catch(e){panel.querySelector('.lab-error').textContent=e.message;}
    };
    if(input.type==='range')input.oninput=handler;else input.onchange=handler;
   });
  }
  refresh();
 }catch(e){panel.textContent=e.message;}
}
const api={reactPet,gameplayPet,gameplaySelection,changeRoom,selectionFor,preparePet,defaults,preferences,profile,animalVisible,loadCatalog,chooseScene,sceneFor,positionFor,move,markup,mountPanel};root.GraphicsLab=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
