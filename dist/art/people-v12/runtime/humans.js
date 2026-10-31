(function(root){
'use strict';
const AGE_GROUPS=[['infant',0],['toddler',12],['child',72],['teen',156],['adult',204],['elder',768]];
const MALE_HAIR=['short','compact_coils','tousled','baby_tuft'];
const BASES={
 slavic:{faces:[0,2],skins:[0,1],hairColors:[0,1,2,4],styles:['short','bob','long_straight','braids','ponytail','bun','tousled']},
 european:{faces:[0,1,2,3],skins:[0,1,2],hairColors:[0,1,2,4],styles:['short','bob','long_straight','compact_coils','braids','ponytail','bun','tousled']},
 east_asian:{faces:[1,0],skins:[0,1,2],hairColors:[0,1],styles:['short','bob','long_straight','braids','ponytail','bun','tousled']},
 south_asian:{faces:[1,3],skins:[1,2,3,4],hairColors:[0,1],styles:['short','bob','long_straight','compact_coils','braids','ponytail','bun','tousled']},
 middle_eastern:{faces:[2,3],skins:[1,2,3],hairColors:[0,1],styles:['short','bob','long_straight','compact_coils','braids','ponytail','bun','tousled']},
 african:{faces:[0,3],skins:[2,3,4],hairColors:[0,1],styles:['short','compact_coils','braids','tousled','bun','ponytail']},
 latin_american:{faces:[0,1,2,3],skins:[0,1,2,3,4],hairColors:[0,1,2,4],styles:['short','bob','long_straight','compact_coils','braids','ponytail','bun','tousled']}
};
const copy=x=>JSON.parse(JSON.stringify(x));
function ageGroup(months){if(!Number.isFinite(months)||months<0)throw Error('Возраст должен быть числом месяцев от нуля.');return AGE_GROUPS.filter(([,from])=>months>=from).at(-1)[0];}
function profileFor(months,sex='female'){const age=ageGroup(months);return ['infant','toddler'].includes(age)?age:age+'_'+(sex==='male'?'m':'f');}
function worldHeight(c){const age=ageGroup(c.months),n=c.months;if(age==='infant')return 52+Math.min(11,n)*18/11;if(age==='toddler')return 80+Math.min(59,n-12)*40/59;if(age==='child')return 125+Math.min(83,n-72)*30/83;if(age==='teen')return 160+Math.min(47,n-156)*25/47;return age==='elder'?180:190;}
function expression(happiness=100,energy=100){const clamp=n=>Math.max(0,Math.min(100,Number.isFinite(n)?n:100)),score=Math.min(clamp(happiness),clamp(energy)),eyeTier=score>=75?0:score>=50?1:score>=25?2:3,mouth=eyeTier===0?'smile':eyeTier===3?'sad':'neutral';return {score,eyeTier,mouth};}
function hash(seed,text){let h=(Number(seed)>>>0)^2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function preset(base='slavic',seed=1,months=360,sex='female'){
 const b=BASES[base];if(!b)throw Error('Неизвестная основа внешности.');const pick=(key,list)=>list[hash(seed,key)%list.length],age=ageGroup(months);
 return {version:1,base,seed,months,sex,profile:profileFor(months,sex),face:pick('face',b.faces),skin:pick('skin',b.skins),hairColor:age==='elder'?3:pick('hair-color',b.hairColors),hair:age==='infant'?'baby_tuft':pick('hair',sex==='male'?b.styles.filter(k=>MALE_HAIR.includes(k)):b.styles),outfit:0,top:pick('top',[0,1,2,3]),bottom:pick('bottom',[0,1,2]),pose:age==='infant'?'lying':'standing',happiness:100,energy:100};
}
function fallbackHair(c){return c.profile==='infant'?'baby_tuft':c.sex==='male'?'short':'bob';}
function hairOptions(m,c){const age=m.profiles[c.profile].age,items=Object.keys(m.hairStyles).filter(k=>m.hairStyles[k].ages.includes(age)&&(c.sex!=='male'||MALE_HAIR.includes(k)));if(c.sex==='male'||age==='infant')items.push('none');return items;}
function migrate(m,input){const c=copy(input),p=m.profiles[c.profile];if(p){if(c.pose==='running')c.pose=p.poses[0];if(!hairOptions(m,c).includes(c.hair)&&(c.hair==='none'||Object.hasOwn(m.hairStyles,c.hair)))c.hair=fallbackHair(c);}return validate(m,c);}
function validate(m,input){
 const c=copy(input);c.shoes=c.shoes??0;if(c.version!==1||!['male','female'].includes(c.sex)||!m.profiles[c.profile])throw Error('Неизвестный профиль человека.');
 if(profileFor(c.months,c.sex)!==c.profile)throw Error('Возраст и профиль не совпадают.');
 const p=m.profiles[c.profile];if(!p.outfits[String(c.outfit)]?.poses[c.pose])throw Error('У этого тела нет выбранной одежды или позы.');
 if(c.months<(p.outfits[String(c.outfit)].poses[c.pose].minimumMonths||0))throw Error('Эта поза ещё не подходит возрасту.');
 for(const [key,max]of Object.entries({face:4,skin:m.palettes.skin.length,hairColor:m.palettes.hair.length,top:m.palettes.top.length,bottom:m.palettes.bottom.length,shoes:m.palettes.shoes.length})){if(!Number.isInteger(c[key])||c[key]<0||c[key]>=max)throw Error('Неверный признак: '+key);}
 if(!hairOptions(m,c).includes(c.hair))throw Error('Причёска несовместима с возрастом.');
 for(const key of ['happiness','energy'])if(!Number.isFinite(c[key])||c[key]<0||c[key]>100)throw Error('Показатель вне шкалы.');
 if(c.manualMouth!==undefined&&!['smile','soft','neutral','sad'].includes(c.manualMouth))throw Error('Неизвестный рот.');
 return c;
}
function create(manifest,base=''){
 const images=new Map(),colored=new Map(),actors=new Map();
 function image(path){if(!images.has(path)){if(images.size>96)images.delete(images.keys().next().value);images.set(path,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Не загружен PNG: '+path));im.src=base+path+'?art=12';}));}return images.get(path);}
 async function tint(path,color,referenceMean=null){if(!color)return image(path);const key=path+'|'+color+'|'+referenceMean;if(colored.has(key))return colored.get(key);const im=await image(path),out=document.createElement('canvas');out.width=im.width;out.height=im.height;const x=out.getContext('2d');x.drawImage(im,0,0);const p=x.getImageData(0,0,out.width,out.height),d=p.data,rgb=color.match(/\w\w/g).map(h=>parseInt(h,16));let total=0,n=0;for(let i=0;i<d.length;i+=4)if(d[i+3]){total+=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];n++;}const mean=referenceMean||total/Math.max(1,n);for(let i=0;i<d.length;i+=4)if(d[i+3]){const l=(.2126*d[i]+.7152*d[i+1]+.0722*d[i+2])/Math.max(1,mean);for(let k=0;k<3;k++)d[i+k]=Math.round(Math.min(255,rgb[k]*l));}x.putImageData(p,0,0);if(colored.size>64)colored.delete(colored.keys().next().value);colored.set(key,out);return out;}
 async function actor(input){
  const c=validate(manifest,input),key=JSON.stringify(c);if(actors.has(key))return actors.get(key);
  const p=manifest.profiles[c.profile],d=p.outfits[String(c.outfit)].poses[c.pose],hd=manifest.heads[p.age+'_'+c.sex+'_'+c.face],pal=manifest.palettes,e=expression(c.happiness,c.energy),out=document.createElement('canvas');[out.width,out.height]=manifest.frame;const x=out.getContext('2d');if(c.manualMouth&&e.eyeTier===0)e.mouth=c.manualMouth;
  // Fetch selected layers together so the new art does not add serial network delays.
  const hairAssets=c.hair!=='none'?hd.hairLayers[c.hair]:null,eyeNames=c.pose==='sleeping'?['closedSkin','closedInk']:e.eyeTier?['upperSkin','upperInk',...(e.eyeTier>=2?['lowerSkin','lowerInk']:[]),...(e.eyeTier===3?['bruises']:[])]:[];
  await Promise.all([...Object.values(d.layers),...Object.values(hd.layers),hd.mouths[c.pose==='sleeping'?'neutral':e.mouth],hairAssets?.back,hairAssets?.front,...eyeNames.map(name=>hd.eyelids[name])].filter(Boolean).map(image));
  for(const [k,path]of Object.entries(d.layers))x.drawImage(await tint(path,k==='skin'?pal.skin[c.skin]:k==='top'?pal.top[c.top]:k==='bottom'?pal.bottom[c.bottom]:k==='shoes'?pal.shoes[c.shoes]:null),0,0);
  const head=document.createElement('canvas');head.width=768;head.height=896;const h=head.getContext('2d'),off=[264,160],hl=c.hair!=='none'?hd.hairLayers[c.hair]:null;
  if(hl)h.drawImage(await tint(hl.back,pal.hair[c.hairColor],manifest.hairStyles[c.hair].meanLuminance),off[0]+hl.offset[0],off[1]+hl.offset[1]);
  for(const [k,path]of Object.entries(hd.layers))h.drawImage(await tint(path,k==='skin'?pal.skin[c.skin]:null),...off);
  if(c.pose==='sleeping'){h.drawImage(await tint(hd.eyelids.closedSkin,pal.skin[c.skin]),...off);h.drawImage(await image(hd.eyelids.closedInk),...off);}
  else if(e.eyeTier){for(const name of ['upperSkin','upperInk',...(e.eyeTier>=2?['lowerSkin','lowerInk']:[]),...(e.eyeTier===3?['bruises']:[])])h.drawImage(await tint(hd.eyelids[name],name.endsWith('Skin')?pal.skin[c.skin]:null),...off);}
  h.drawImage(await image(hd.mouths[c.pose==='sleeping'?'neutral':e.mouth]),...off);
  if(hl)h.drawImage(await tint(hl.front,pal.hair[c.hairColor],manifest.hairStyles[c.hair].meanLuminance),off[0]+hl.offset[0],off[1]+hl.offset[1]);
  const scale=p.headHeight/280,[ax,ay]=hd.headAnchor,[nx,ny]=d.neckAnchor;x.save();x.translate(nx,ny);x.rotate(-d.headRotation*Math.PI/180);x.scale(scale,scale);x.drawImage(head,-ax-off[0],-ay-off[1]);x.restore();
  if(actors.size>24)actors.delete(actors.keys().next().value);actors.set(key,out);return out;
 }
 function geometry(c,position=[160,278],slot=null){c=validate(manifest,c);const p=manifest.profiles[c.profile],d=p.outfits[String(c.outfit)].poses[c.pose],scale=worldHeight(c)/p.referenceHeight,anchor=slot&&d.seatAnchor?d.seatAnchor:d.footAnchor;return {x:position[0]-anchor[0]*scale,y:position[1]-anchor[1]*scale,scale,footY:position[1]+(d.footAnchor[1]-anchor[1])*scale};}
 async function drawInScene(ctx,c,position=[160,278],slot=null,options={}){
  const im=await actor(c),p=manifest.profiles[c.profile],crib=options.crib&&p.age==='infant'&&manifest.furniture?.crib?.poses.includes(c.pose)?manifest.furniture.crib:null;
  if(crib){const [back,front]=await Promise.all([image(crib.back),image(crib.front)]),pos=options.cribPosition||crib.defaultPosition,fg={x:pos[0]-crib.footAnchor[0]*crib.scale,y:pos[1]-crib.footAnchor[1]*crib.scale};ctx.drawImage(back,fg.x,fg.y,back.width*crib.scale,back.height*crib.scale);const anchor=p.outfits[String(c.outfit)].poses[c.pose].footAnchor,scale=worldHeight(c)/p.referenceHeight;ctx.save();ctx.translate(pos[0]+crib.babyFootOffset[0],pos[1]+crib.babyFootOffset[1]);if(c.pose==='lying')ctx.rotate(crib.lyingRotationDegrees*Math.PI/180);ctx.drawImage(im,-anchor[0]*scale,-anchor[1]*scale,im.width*scale,im.height*scale);ctx.restore();ctx.drawImage(front,fg.x,fg.y,front.width*crib.scale,front.height*crib.scale);return {footY:pos[1],crib:true};}
  const template=options.furniture||(options.templates&&p.age!=='infant'?(c.pose==='sleeping'?'bed':c.pose==='desk'?'desk':null):null),f=manifest.furniture?.[template];
  if(f){
   if(!f.accepts.includes(p.age)||!f.poses.includes(c.pose))throw Error('Эта поза несовместима с мебелью.');
   const [back,front]=await Promise.all([image(f.back),image(f.front)]),pos=options.furniturePosition||f.defaultPosition,fx=pos[0]-f.footAnchor[0]*f.scale,fy=pos[1]-f.footAnchor[1]*f.scale,d=p.outfits[String(c.outfit)].poses[c.pose],scale=worldHeight(c)/p.referenceHeight;
   ctx.drawImage(back,fx,fy,back.width*f.scale,back.height*f.scale);let x,y;
   if(template==='bed'){
    const hd=manifest.heads[p.age+'_'+c.sex+'_'+c.face],hs=p.headHeight/280,[ax,ay]=hd.headAnchor,[nx,ny]=d.neckAnchor;
    const cx=d.headRotation?nx+(140-ay)*hs:nx+(120-ax)*hs,cy=d.headRotation?ny-(120-ax)*hs:ny+(140-ay)*hs;
    x=pos[0]+f.headTargetOffset[0]-cx*scale;y=pos[1]+f.headTargetOffset[1]-cy*scale;
   }else{x=pos[0]-d.footAnchor[0]*scale;y=pos[1]+(f.tableHandY-f.footAnchor[1])*f.scale-d.handAnchor[1]*scale;}
   ctx.drawImage(im,x,y,im.width*scale,im.height*scale);ctx.drawImage(front,fx,fy,front.width*f.scale,front.height*f.scale);return {x,y,scale,footY:pos[1],furniture:template};
  }
  const g=geometry(c,position,slot);ctx.drawImage(im,g.x,g.y,im.width*g.scale,im.height*g.scale);return g;
 }
 async function portrait(c,size=256){const im=await actor(c),p=manifest.profiles[c.profile],d=p.outfits[String(c.outfit)].poses[c.pose],h=manifest.heads[p.age+'_'+c.sex+'_'+c.face],factor=p.headHeight/280,[nx,ny]=d.neckAnchor,[ax,ay]=h.headAnchor;const cx=nx+(120-ax)*factor,cy=ny+(125-ay)*factor,box=p.headHeight*1.65,out=document.createElement('canvas');out.width=size;out.height=size;out.getContext('2d').drawImage(im,cx-box/2,cy-box/2,box,box,0,0,size,size);return out;}
 return {manifest,image,actor,geometry,drawInScene,portrait};
}
const api={AGE_GROUPS,BASES,MALE_HAIR,ageGroup,profileFor,worldHeight,expression,preset,hairOptions,fallbackHair,migrate,validate,create};root.LifelineHumanV12=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
