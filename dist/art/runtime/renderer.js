(function(root){
'use strict';
function create(manifest,base=''){
 const cache=new Map(),tints=new Map(),actorCache=new Map(),petCache=new Map();
function image(path){if(!cache.has(path))cache.set(path,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Не удалось загрузить '+path));im.src=base+path;}));return cache.get(path);}
async function colored(path,color,furOnly=false){
 const key=path+'|'+color+'|'+furOnly;if(tints.has(key))return tints.get(key);const im=await image(path);if(!color)return im;
 const out=document.createElement('canvas');out.width=im.width;out.height=im.height;const x=out.getContext('2d');x.drawImage(im,0,0);const pixels=x.getImageData(0,0,out.width,out.height),d=pixels.data,rgb=color.match(/\w\w/g).map(h=>parseInt(h,16)),weights=new Float32Array(d.length/4);
 const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};let total=0,n=0;
 for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;let w=1;if(furOnly){const hi=Math.max(d[i],d[i+1],d[i+2]),lo=Math.min(d[i],d[i+1],d[i+2]),sat=(hi-lo)/Math.max(1,hi);w=d[i]>d[i+1]&&d[i+1]>d[i+2]?smooth(.22,.36,sat):0;}weights[i/4]=w;total+=(.2126*d[i]+.7152*d[i+1]+.0722*d[i+2])*w;n+=w;}
 const mean=total/Math.max(1,n);for(let i=0;i<d.length;i+=4){const w=weights[i/4];if(!w)continue;const lum=(.2126*d[i]+.7152*d[i+1]+.0722*d[i+2])/Math.max(1,mean);for(let k=0;k<3;k++)d[i+k]=Math.round(d[i+k]*(1-w)+Math.min(255,rgb[k]*lum)*w);}
 x.putImageData(pixels,0,0);tints.set(key,out);return out;
}
async function makeActor(id,a){a=root.LifelineAssetCore.resolveExpression(a);const key=JSON.stringify([id,a.pose,a.head,a.skin,a.hairStyle,a.hairColor,a.top,a.bottom,a.fatigue,a.eyeTier,a.mouth||'smile']);if(actorCache.has(key))return actorCache.get(key);const p=manifest.profiles[id],pose=p.poses[a.pose],head=p.heads[a.head],out=document.createElement('canvas');out.width=384;out.height=512;const x=out.getContext('2d');const pal=manifest.palettes;const r=pose.headRect,hairDef=manifest.hairStyles[a.hairStyle];let hairBox=null;if(hairDef){const [hx,hy,hw,hh]=r;const b=hairDef.box;hairBox=[hx+hw*b[0],hy+hh*b[1],hw*b[2],hh*b[3]];if(hairDef.back)x.drawImage(await colored(hairDef.back,pal.hair[a.hairColor]),...hairBox);}
for(const layer of ['neutral','skin','top','bottom','shoes']){const color=layer==='skin'?pal.skin[a.skin]:layer==='top'?pal.top[a.top]:layer==='bottom'?pal.bottom[a.bottom]:null;x.drawImage(await colored(pose.layers[layer],color),0,0);}
const mouth=head.mouths?.[a.mouth||'smile']||head.mouths?.smile;
for(const layer of ['neutral','skin']){const path=mouth?(layer==='neutral'?head.mouthlessNeutral:head.mouthlessSkin):head[layer];x.drawImage(await colored(path,layer==='skin'?pal.skin[a.skin]:null),...r);}
const energy=100*(1-Math.max(0,Math.min(1,a.fatigue||0))),eyeTier=a.mouthMode==='auto'?a.eyeTier:energy>=75?0:energy>=50?1:energy>=25?2:3,lids=head.eyelids;
if(eyeTier>0&&lids){x.drawImage(await colored(lids.upperSkin,pal.skin[a.skin]),...r);x.drawImage(await image(lids.upperInk),...r);if(eyeTier>=2){x.drawImage(await colored(lids.lowerSkin,pal.skin[a.skin]),...r);x.drawImage(await image(lids.lowerInk),...r);}if(eyeTier===3)x.drawImage(await image(lids.bruises),...r);}
if(mouth)x.drawImage(await image(mouth),...r);
if(hairDef?.front)x.drawImage(await colored(hairDef.front,pal.hair[a.hairColor]),...hairBox);
actorCache.set(key,out);return out;}
async function pet(state){const age=state.dogAge||'adult',pose=state.dogPose||'standing',color=state.dogColor||0,breed=state.dogBreed||'prototype',key=JSON.stringify([breed,age,pose,color]);if(petCache.has(key))return petCache.get(key);const def=breed==='prototype'?manifest.pets.dog:manifest.pets.dog.breeds?.[breed],data=def?.ages?.[age]?.poses?.[pose];if(!data)throw new Error('Нет рисунка для породы/возраста/позы собаки');const out=document.createElement('canvas');[out.width,out.height]=data.frame||[320,256];const c=out.getContext('2d');c.drawImage(await colored(data.layers.base,color===0?null:manifest.palettes.dog[color],true),0,0);c.drawImage(await image(data.layers.gray),0,0);c.drawImage(await image(data.layers.accessory||data.layers.collar),0,0);petCache.set(key,out);return out;}
function geometry(id,a){const p=manifest.profiles[id],pose=p.poses[a.pose],scale=p.worldStandingHeight/p.poses.standing.visibleHeight;const slot=a.pose==='sitting'?manifest.scene.slots.find(s=>s.id===a.seatId):null;const anchor=slot?pose.seatAnchor:pose.footAnchor;const position=slot?slot.position:a.position;return {scale,x:position[0]-anchor[0]*scale,y:position[1]-anchor[1]*scale,footY:position[1]+(pose.footAnchor[1]-anchor[1])*scale};}

return {image,colored,actor:makeActor,geometry,pet};
}
root.LifelinePngRenderer={create};
})(typeof window!=='undefined'?window:globalThis);
