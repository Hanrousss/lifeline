(function(root){'use strict';
async function create(onChange){
 const [m,catalog]=await Promise.all([fetch('../manifest.json?lab=15').then(r=>r.json()),fetch('../graphics_catalog.json').then(r=>r.json())]);
 const C=root.LifelineAssetCore,art=root.LifelinePngRenderer.create(m,'../'),$=id=>document.getElementById(id),key='lifeline-people-scene-lab-v1';
 let s={house:'modest_01',room:'living_room',kind:'dog',variant:'cavalier',age:'adult',pose:'standing',color:0};try{Object.assign(s,JSON.parse(localStorage.getItem(key)||'{}'))}catch{}
 const houses=catalog.houses,kinds=['dog',...Object.keys(C.PET_TYPES).filter(k=>m.pets[k]?.available)],dogAges={puppy:'Щенок',adult:'Взрослая',senior:'Пожилая'};
 function fill(id,rows,value){$(id).replaceChildren(...rows.map(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;return o}));$(id).value=String(value)}
 function room(){return houses.find(h=>h.id===s.house).rooms.find(r=>r.kind===s.room)}
 function variants(){return s.kind==='dog'?Object.entries(m.pets.dog.breeds):Object.entries(m.pets[s.kind].variants)}
 function definition(){return variants().find(([id])=>id===s.variant)[1]}
 function selection(){return {kind:s.kind,variant:s.variant,age:s.age,pose:s.pose,color:s.color}}
 function sync(){
  if(!houses.some(h=>h.id===s.house))s.house=houses[0].id;const h=houses.find(h=>h.id===s.house);if(!h.rooms.some(r=>r.kind===s.room))s.room=h.rooms[0].kind;
  fill('room-house',houses.map(h=>[h.id,h.label]),s.house);fill('room-choice',h.rooms.map(r=>[r.kind,r.label]),s.room);
  if(s.kind!=='none'&&!kinds.includes(s.kind))s.kind='dog';fill('pet-kind',[['none','Не показывать'],['dog','Собака'],...kinds.filter(k=>k!=='dog').map(k=>[k,C.PET_TYPES[k]])],s.kind);
  $('pet-options').hidden=s.kind==='none';$('pet-view').hidden=s.kind==='none';
  if(s.kind==='none')return;
  const vv=variants();if(!vv.some(([id])=>id===s.variant))s.variant=vv[0][0];const def=definition(),ages=Object.keys(def.ages);if(!ages.includes(s.age))s.age=ages.includes('adult')?'adult':ages[0];const poses=Object.keys(def.ages[s.age].poses);if(!poses.includes(s.pose))s.pose=poses[0];
  const colors=s.kind==='dog'?['Исходный','Коричневый','Светлый']:m.pets[s.kind].colorLabels;if(!Number.isInteger(s.color)||s.color<0||s.color>=colors.length)s.color=0;
  fill('pet-variant',vv.map(([id,v])=>[id,v.label||C.DOG_BREEDS[id]||id]),s.variant);fill('pet-age',ages.map(id=>[id,(s.kind==='dog'?dogAges:m.pets[s.kind].ageLabels)[id]]),s.age);fill('pet-pose',poses.map(id=>[id,(s.kind==='dog'?C.DOG_POSES:m.pets[s.kind].poseLabels)[id]]),s.pose);fill('pet-color',colors.map((c,i)=>[i,c]),s.color);
 }
 function changed(id,value){s[id]=value;sync();localStorage.setItem(key,JSON.stringify(s));onChange()}
 for(const [id,field]of Object.entries({'room-house':'house','room-choice':'room','pet-kind':'kind','pet-variant':'variant','pet-age':'age','pet-pose':'pose','pet-color':'color'}))$(id).onchange=e=>changed(field,field==='color'?Number(e.target.value):e.target.value);
 async function snapshot(){const r={...room()},pet=s.kind==='none'?null:selection();return {room:r,pet,background:await art.image(r.background),petImage:pet?await art.companion(pet):null}}
 function drawPet(ctx,shot){const p=shot.petImage;if(!p)return;const g=C.companionGeometry(m,shot.pet),factor=shot.room.petScale??1,anchor=shot.room.petAnchor||m.pets.dog.footPosition,base=m.pets.dog.footPosition,scale=g.scale*factor;ctx.drawImage(p,anchor[0]+(g.x-base[0])*factor,anchor[1]+(g.y-base[1])*factor,p.width*scale,p.height*scale)}
 function drawPreview(shot){if(!shot.petImage)return;const c=$('pet-preview'),p=shot.petImage;c.width=p.width;c.height=p.height;c.getContext('2d').drawImage(p,0,0)}
 sync();return {snapshot,drawPet,drawPreview,currentRoom:room,get selection(){return {...s}},manifest:m,catalog};
}
root.LifelinePeopleSceneLab={create};
})(window);
