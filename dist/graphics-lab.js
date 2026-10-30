(function(root){
'use strict';
const KEY='lifeline-graphics-lab-v1:',profiles=['adult_f','adult_m','elder_f','child'];let catalogPromise;
function defaults(){return {house:'modest_01',room:'living_room',profile:null,animal:'none',emotionFromGame:true,positions:{}};}
function preferences(s,storage=root.localStorage){try{const raw=JSON.parse(storage.getItem(KEY+(s.seed>>>0)));if(!raw||typeof raw!=='object')return defaults();return {...defaults(),...raw,profile:profiles.includes(raw.profile)?raw.profile:null,animal:raw.animal==='dog'?'dog':'none',positions:raw.positions&&typeof raw.positions==='object'?raw.positions:{}};}catch{return defaults();}}
function savePreferences(s,p){root.localStorage.setItem(KEY+(s.seed>>>0),JSON.stringify(p));}
function profile(s){return preferences(s).profile;}
function animalVisible(s){return preferences(s).animal==='dog';}
function loadCatalog(){if(!catalogPromise)catalogPromise=fetch('art/graphics_catalog.json').then(r=>{if(!r.ok)throw Error('Не удалось загрузить список комнат');return r.json();}).catch(e=>{catalogPromise=null;throw e;});return catalogPromise;}
function chooseScene(catalog,p){const house=catalog.houses.find(h=>h.id===p.house)||catalog.houses[0],scene=house.rooms.find(r=>r.kind===p.room)||house.rooms.find(r=>r.kind==='living_room')||house.rooms[0];return {...scene,houseId:house.id,label:house.label+' · '+scene.label};}
async function sceneFor(s){return chooseScene(await loadCatalog(),preferences(s));}
function positionFor(s,scene,id,fallback){const point=preferences(s).positions[scene.id+':'+id];return Array.isArray(point)&&root.LifelineAssetCore.isWalkable(point,scene)?point:scene.id==='pilot_living_room'?fallback:scene.personAnchor;}
function saveConfig(s,config,manifest){const checked=root.LifelineAssetCore.validateState(config,manifest);root.localStorage.setItem(root.LifelineGameArt.storageKey(s),JSON.stringify(checked));}
function move(s,scene,id,point,manifest){if(!root.LifelineAssetCore.isWalkable(point,scene))return false;const pref=preferences(s);pref.positions[scene.id+':'+id]=point;savePreferences(s,pref);const config=root.LifelineGameArt.settings(s,manifest,root.localStorage);config.actors[id].pose='standing';config.actors[id].seatId=null;saveConfig(s,config,manifest);return true;}
function preparePet(s,manifest){const C=root.LifelineAssetCore,config=root.LifelineGameArt.settings(s,manifest,root.localStorage);if(animalVisible(s)&&!config.dogClock){config.dogClock=C.dogClockFor(config.dogAge,C.gameMonths(s));saveConfig(s,config,manifest);}return C.petStateAt(config,C.gameMonths(s));}
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
   panel.innerHTML='<div class="lab-grid">'+select('house','Дом',catalog.houses.map(h=>[h.id,h.label]),house.id)+select('room','Комната',house.rooms.map(r=>[r.kind,r.label]),scene.kind)+select('profile','Человек',Object.entries(C.LABELS),id)+select('head','Черты лица',[['standing','Лицо 1'],['sitting','Лицо 2']],a.head)+select('animal','Животное',[['none','Нет'],['dog','Собака']],pref.animal)+select('dogBreed','Порода',Object.entries(C.DOG_BREEDS).filter(([key])=>key!=='prototype'||config.dogBreed==='prototype'),config.dogBreed,pref.animal!=='dog')+select('dogAge','Возраст собаки',[['puppy','Щенок'],['adult','Взрослая'],['senior','Пожилая']],config.dogAge,pref.animal!=='dog')+'</div>'+
   '<details><summary>Внешность человека</summary><div class="lab-grid">'+select('skin','Кожа',colors(['Тон 1','Тон 2','Тон 3','Тон 4','Тон 5']),a.skin)+select('hairStyle','Причёска',C.availableHairStyles(id).map(k=>[k,{short:'Короткая',bob:'Каре',none:'Без волос'}[k]]),a.hairStyle)+select('hairColor','Волосы',colors(['Каштановые','Почти чёрные','Рыжие','Седые','Светлые']),a.hairColor)+select('top','Верх',colors(['Мох','Терракота','Голубой','Сиреневый']),a.top)+select('bottom','Низ',colors(['Тёмно-синий','Графит','Коричневый']),a.bottom)+'</div></details>'+
   '<details><summary>Позы и эмоции</summary><div class="lab-grid">'+select('pose','Поза человека',[['standing','Стоит'],...(scene.slots.length?[['sofa_left','Сидит слева'],['sofa_right','Сидит справа']]:[])],scene.slots.length?pose:'standing')+'<label class="lab-check"><input type="checkbox" data-lab="emotionFromGame"'+(pref.emotionFromGame?' checked':'')+'> Эмоции по игре</label>'+select('expression','Выражение',[['auto','По счастью и усталости'],['smile','Улыбка'],['soft','Небольшая улыбка'],['neutral','Нейтральное'],['sad','Грустное']],a.mouthMode==='auto'?'auto':a.mouth,pref.emotionFromGame)+range('happiness','Счастье',a.happiness)+range('fatigue','Усталость',a.fatigue*100)+'</div></details>'+
   '<details><summary>Животное: поза и окрас</summary><div class="lab-grid">'+select('dogPose','Поза',Object.entries(C.DOG_POSES).filter(([key])=>config.dogBreed!=='prototype'||['standing','sitting'].includes(key)),config.dogPose,pref.animal!=='dog')+select('dogColor','Окрас',colors(['Рыжий','Коричневый','Светлый']),config.dogColor,pref.animal!=='dog')+'</div></details><p class="lab-note">Возраст собаки меняется с игровыми годами: до 1 / 1–7 / с 8 лет. Здесь можно задать начальный возраст. Меняются только рисунки. Нажмите на свободный пол, чтобы переставить человека.</p><p class="lab-error" role="status"></p>';
   panel.querySelectorAll('details').forEach(d=>{d.open=opened.includes(d.querySelector('summary').textContent);});
   panel.querySelectorAll('[data-lab]').forEach(input=>{
    const handler=()=>{
     try{
      const key=input.dataset.lab,value=input.type==='checkbox'?input.checked:input.type==='range'?Number(input.value):input.value,p=preferences(s),cfg=A.settings(s,manifest,root.localStorage),who=A.displayProfileFor(s),actor=cfg.actors[who];
      if(['house','room','profile','animal','emotionFromGame'].includes(key)){p[key]=value;savePreferences(s,p);if(key==='profile')A.selectProfile(value);}
      else if(key==='dogAge'){cfg.dogAge=value;cfg.dogClock=C.dogClockFor(value,C.gameMonths(s));}else if(key==='dogBreed'){cfg.dogBreed=value;if(value==='prototype'&&!['standing','sitting'].includes(cfg.dogPose))cfg.dogPose='standing';}else if(key==='dogPose')cfg.dogPose=value;
      else if(key==='dogColor')cfg[key]=Number(value);
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
const api={preparePet,defaults,preferences,profile,animalVisible,loadCatalog,chooseScene,sceneFor,positionFor,move,markup,mountPanel};root.GraphicsLab=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
