(function(root){
'use strict';
const C=root.LifelineHumanV12,PREFIX='lifeline-human-v12:';let ready;
const storageKey=s=>PREFIX+(Number(s.seed)>>>0);
function load(){if(!ready)ready=fetch('art/people-v12/manifest.json?v=13').then(r=>{if(!r.ok)throw Error('Новый набор людей не загружен');return r.json();}).then(manifest=>({manifest,art:C.create(manifest,'art/people-v12/')})).catch(e=>{ready=null;throw e;});return ready;}
function saved(s,storage=root.localStorage){try{return JSON.parse(storage.getItem(storageKey(s))||'null');}catch{return null;}}
function character(s,legacy,manifest,override=null,storage=root.localStorage){
 let months=root.LifelineAssetCore?root.LifelineAssetCore.gameMonths(s):Math.max(0,Number(s.age)||0)*12,sex=s.origin?.sex==='male'?'male':'female';
 if(override){if(override==='child')months=108;else if(override==='elder_f'){months=900;sex='female';}else if(override==='adult_f'||override==='adult_m'){months=360;sex=override==='adult_m'?'male':'female';}}
 const stored=saved(s,storage),c=C.preset(stored?.traits?.base||'slavic',s.seed,months,sex),traits=stored?.traits||{};
 Object.assign(c,{skin:legacy.skin??c.skin,hairColor:legacy.hairColor??c.hairColor,hair:legacy.hairStyle||c.hair,face:legacy.head==='sitting'?1:0,top:legacy.top??c.top,bottom:legacy.bottom??c.bottom},traits);
 // Limited old controls remain useful after applying the expanded editor.
 const map={head:'face',hairStyle:'hair',skin:'skin',hairColor:'hairColor',top:'top',bottom:'bottom'};
 const baseline=stored?.legacyBaseline?.[legacy.profile]||stored?.legacyBaseline;if(baseline)for(const [key,target]of Object.entries(map))if(legacy[key]!==baseline[key])c[target]=key==='head'?(legacy.head==='sitting'?1:0):legacy[key];
 c.profile=C.profileFor(months,sex);c.months=months;c.sex=sex;c.pose=manifest.profiles[c.profile].poses.includes(legacy.pose)?legacy.pose:manifest.profiles[c.profile].poses[0];
 if(!override&&!root.LifelineDevMode?.()&&months<36){const poses=months<3?['lying','sleeping']:months<6?['tummy_time','lying']:months<12?['supported_sitting','tummy_time']:months<24?['floor_play','sitting']:['floor_play','sitting','standing'];c.pose=poses[((Number(s.seed)>>>0)+Math.floor(months/2))%poses.length];}
 if(!C.hairOptions(manifest,c).includes(c.hair))c.hair=C.fallbackHair(c);
 c.happiness=Number.isFinite(legacy.happiness)?legacy.happiness:100;c.energy=100*(1-(legacy.fatigue||0));
 if(legacy.mouthMode==='manual')c.manualMouth=legacy.mouth||'smile';
 return C.migrate(manifest,c);
}
async function render(s,legacy,scene,override=null){const {manifest,art}=await load();const c=character(s,legacy,manifest,override),slot=c.pose==='sitting'&&legacy.pose==='sitting'?(scene.slots||[]).find(slot=>slot.id===legacy.seatId):null,position=slot?slot.position:legacy.position;
 if(c.profile==='infant'){const im=document.createElement('canvas');im.width=960;im.height=960;const ctx=im.getContext('2d');ctx.scale(3,3);const g=await art.drawInScene(ctx,c,position,null,{crib:['lying','sleeping'].includes(c.pose)});return {im,c,x:0,y:0,scale:1/3,footY:g.footY};}
 const im=await art.actor(c),g=art.geometry(c,position,Boolean(slot)),ratio=scene.personScale||1;
 if(ratio!==1){g.scale*=ratio;const d=manifest.profiles[c.profile].outfits[String(c.outfit)].poses[c.pose],anchor=slot&&d.seatAnchor?d.seatAnchor:d.footAnchor;g.x=position[0]-anchor[0]*g.scale;g.y=position[1]-anchor[1]*g.scale;g.footY=position[1]+(d.footAnchor[1]-anchor[1])*g.scale;}
 return {im,c,...g};
}
async function relative(s,legacy,scene){const {manifest,art}=await load(),none={getItem:()=>null},c=C.migrate(manifest,Object.assign(character(s,legacy,manifest,legacy.profile,none),legacy.humanTraits||{})),slot=c.pose==='sitting'&&legacy.pose==='sitting'?(scene.slots||[]).find(v=>v.id===legacy.seatId):null,pos=slot?slot.position:legacy.position,im=await art.actor(c),g=art.geometry(c,pos,Boolean(slot)),ratio=scene.personScale||1;if(ratio!==1){g.scale*=ratio;const d=manifest.profiles[c.profile].outfits[String(c.outfit)].poses[c.pose],anchor=slot&&d.seatAnchor?d.seatAnchor:d.footAnchor;g.x=pos[0]-anchor[0]*g.scale;g.y=pos[1]-anchor[1]*g.scale;g.footY=pos[1]+(d.footAnchor[1]-anchor[1])*g.scale;}return {im,c,...g};}
async function portrait(s,legacy,role='self'){const {manifest,art}=await load(),c=role==='self'?character(s,legacy,manifest):C.migrate(manifest,Object.assign(character(s,legacy,manifest,legacy.profile,{getItem:()=>null}),legacy.humanTraits||{}));c.pose=c.profile==='infant'?'lying':'standing';return art.portrait(c);}
const api={PREFIX,storageKey,load,saved,character,render,relative,portrait};root.LifelineHumanGame=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
