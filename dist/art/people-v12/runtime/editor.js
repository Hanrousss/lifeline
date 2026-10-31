(async function(){
'use strict';
const C=LifelineHumanV12,$=id=>document.getElementById(id),m=await fetch('manifest.json?v=13').then(r=>r.json()),art=C.create(m),key='lifeline-human-v12-editor',params=new URLSearchParams(location.search);
[$('figure').width,$('figure').height]=m.frame;
const labels={infant:'Младенец · до года',toddler:'Малыш · 1–6',child:'Ребёнок · 6–13',teen:'Подросток · 13–17',adult:'Взрослый · 17–64',elder:'Пожилой · 64+',standing:'Стоит',sitting:'Сидит прямо',relaxed_sitting:'Сидит расслабленно',desk:'За столом',sleeping:'Спит',lying:'Лежит',supported_sitting:'Сидит с поддержкой',tummy_time:'На животе',floor_play:'Играет на полу',short:'Короткие кудри',bob:'Каре',compact_coils:'Плотные кудри',tousled:'Короткие волнистые',long_straight:'Прямые до плеч',long_sleek:'Длинные прямые',long_curly:'Длинные кудрявые',single_braid:'Одна коса',ponytail:'Хвост',bun:'Пучок',braids:'Две косы',baby_tuft:'Младенческий пушок',none:'Без волос'};
let state=C.preset('slavic',1,360,'female'),token=0,actorCanvas;
try{const saved=localStorage.getItem(key);if(saved)state=C.migrate(m,JSON.parse(saved));}catch{}
const life=/^\d+$/.test(params.get('life')||'')?String(Number(params.get('life'))>>>0):null;
if(life!==null){
 const month=Number(params.get('month')),sex=params.get('sex')==='male'?'male':'female';
 state=C.preset('slavic',Number(life),Number.isFinite(month)&&month>=0?month:360,sex);
 try{const saved=JSON.parse(localStorage.getItem('lifeline-human-v12:'+life)||'null');if(saved?.traits)Object.assign(state,saved.traits);state.profile=C.profileFor(state.months,state.sex);if(!C.hairOptions(m,state).includes(state.hair))state.hair=C.fallbackHair(state);state=C.migrate(m,state);}catch{}
 $('apply').hidden=false;
}
function fill(id,rows,value){$(id).replaceChildren(...rows.map(([v,label])=>{const o=document.createElement('option');o.value=v;o.textContent=label;return o;}));$(id).value=value;}
function sync(){
 fill('age',C.AGE_GROUPS.map(([id])=>[id,labels[id]]),C.ageGroup(state.months));$('months').value=state.months;$('sex').value=state.sex;
 fill('base',m.appearanceBases.map(b=>[b.id,b.label]),state.base);fill('face',[0,1,2,3].map(i=>[i,'Лицо '+(i+1)]),state.face);
 fill('skin',m.palettes.skin.map((_,i)=>[i,'Тон '+(i+1)]),state.skin);fill('hair',C.hairOptions(m,state).map(id=>[id,labels[id]]),state.hair);
 fill('hairColor',['Каштановый','Чёрный','Рыжий','Седой','Светлый'].map((s,i)=>[i,s]),state.hairColor);
 for(const id of ['top','bottom','shoes'])fill(id,m.palettes[id].map((_,i)=>[i,'Цвет '+(i+1)]),state[id]||0);
 const p=m.profiles[state.profile];fill('outfit',Object.keys(p.outfits).map(k=>[k,({0:'Повседневный',1:'Лёгкий',2:'Для сна',3:'Платье с кардиганом',4:'Блузка с юбкой',5:'Жакет с брюками'})[k]]),state.outfit);fill('pose',p.poses.filter(pose=>state.months>=(p.outfits[String(state.outfit)].poses[pose].minimumMonths||0)).map(id=>[id,labels[id]]),state.pose);
 for(const id of ['outfit','happiness','energy'])$(id).value=state[id];
}
function adapt(){state.profile=C.profileFor(state.months,state.sex);const p=m.profiles[state.profile];if(!p.outfits[String(state.outfit)])state.outfit=0;if(!C.hairOptions(m,state).includes(state.hair))state.hair=C.fallbackHair(state);const d=p.outfits[String(state.outfit)].poses[state.pose];if(!d||state.months<(d.minimumMonths||0))state.pose=p.poses[0];}
let bg;
try{bg=new Image();bg.src=params.get('background')||'assets/review_background.png';await bg.decode();}catch{bg=null;}
async function render(){
 const t=++token;for(const id of ['png','save','apply'])$(id).disabled=true;
 try{
  state=C.validate(m,state);const c=JSON.parse(JSON.stringify(state)),im=await art.actor(c);
  const staged=document.createElement('canvas');staged.width=960;staged.height=960;
  const r=staged.getContext('2d');r.setTransform(3,0,0,3,0,0);
  const template=c.profile!=='infant'&&['sleeping','desk'].includes(c.pose);
  if(bg&&!template)r.drawImage(bg,0,0,320,320);else{r.fillStyle='#eee5d6';r.fillRect(0,0,320,320);}
  const seat=['sitting','relaxed_sitting','desk'].includes(c.pose);
  await art.drawInScene(r,c,seat?[151,205]:[160,278],seat,{crib:true,templates:true});
  if(t!==token)return;
  actorCanvas=im;const figure=$('figure'),x=figure.getContext('2d');x.clearRect(0,0,figure.width,figure.height);x.drawImage(im,0,0);
  const visible=$('room').getContext('2d');visible.setTransform(1,0,0,1,0,0);visible.clearRect(0,0,960,960);visible.drawImage(staged,0,0);
  $('room-heading').textContent=template?'Поза с мебелью':'Масштаб в комнате';
  const p=m.profiles[c.profile],d=p.outfits[String(c.outfit)].poses[c.pose],h=m.heads[p.age+'_'+c.sex+'_'+c.face];
  $('layers').replaceChildren(...Object.entries({...d.layers,head:h.layers.skin,face:h.layers.neutral,mouth:h.mouths.smile,...(c.hair!=='none'?{hair_back:h.hairLayers[c.hair].back,hair_front:h.hairLayers[c.hair].front}:{})}).map(([name,path])=>{const f=document.createElement('figure'),img=document.createElement('img'),cap=document.createElement('figcaption');img.src=path;img.alt=name;cap.textContent=name;f.append(img,cap);return f;}));
  const e=C.expression(c.happiness,c.energy);$('status').textContent='Готово · '+labels[p.age]+' · '+labels[c.pose]+' · состояние '+Math.round(e.score)+'/100';
  figure.dataset.ready=JSON.stringify(c);for(const k of ['profile','sex','face','skin','hair','hairColor','pose','outfit','months','happiness','energy','shoes','top','bottom'])figure.dataset[k]=String(c[k]);
  localStorage.setItem(key,JSON.stringify(c));window.PeopleEditor.state=c;
  for(const id of ['png','save','apply'])$(id).disabled=false;
 }catch(e){if(t===token)$('status').textContent=e.message;throw e;}
}
async function change(key,value){if(key==='months'&&(!Number.isFinite(value)||value<0)){$('status').textContent='Возраст должен быть от нуля месяцев.';return;}state[key]=value;adapt();sync();await render();}
for(const id of ['face','skin','hairColor','outfit','top','bottom','shoes','happiness','energy','months'])$(id).onchange=e=>change(id,Number(e.target.value));
for(const id of ['months','happiness','energy'])$(id).oninput=e=>change(id,Number(e.target.value));
for(const id of ['sex','hair','pose'])$(id).onchange=e=>change(id,e.target.value);
$('base').onchange=e=>{state=C.preset(e.target.value,state.seed,state.months,state.sex);sync();render();};
$('age').onchange=e=>{const from=C.AGE_GROUPS.find(([id])=>id===e.target.value)[1];state.months=from;adapt();sync();render();};
$('variation').onclick=()=>{state=C.preset(state.base,state.seed+1,state.months,state.sex);sync();render();};
function download(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
$('png').onclick=()=>actorCanvas?.toBlob(b=>download('lifeline-'+state.profile+'-'+state.pose+'.png',b));$('save').onclick=()=>download('lifeline-person.json',new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
$('apply').onclick=()=>{
 if(life===null)return;const c=C.validate(m,state),traits=Object.fromEntries(['base','face','skin','hair','hairColor','outfit','top','bottom','shoes'].map(k=>[k,c[k]??0]));let legacyBaseline;
 try{const oldkey='lifeline-art-v1:'+life,old=JSON.parse(localStorage.getItem(oldkey)||'null');if(old?.actors){legacyBaseline={};for(const [id,a]of Object.entries(old.actors)){Object.assign(a,{skin:c.skin,hairColor:c.hairColor,top:c.top,bottom:c.bottom});if(c.face<2)a.head=c.face===1?'sitting':'standing';if(['short','bob'].includes(c.hair))a.hairStyle=id.endsWith('_m')&&c.hair==='bob'?'short':c.hair;legacyBaseline[id]=Object.fromEntries(['head','hairStyle','skin','hairColor','top','bottom'].map(k=>[k,a[k]]));}localStorage.setItem(oldkey,JSON.stringify(old));}}catch{}
 localStorage.setItem('lifeline-human-v12:'+life,JSON.stringify({version:1,traits,legacyBaseline}));$('status').textContent='Внешность сохранена для этой жизни. Возраст и пол в игре не меняются.';
};
window.PeopleEditor={manifest:m,art,state,set:async c=>{state=C.validate(m,c);sync();await render();},render};sync();await render();
})().catch(e=>{document.getElementById('status').textContent='Ошибка: '+e.message;console.error(e);});
