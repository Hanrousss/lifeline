(function(root){
'use strict';
const ROOMS=['living_room','kitchen','bedroom'];
function hash(seed,key){let n=(Number(seed)>>>0)^2166136261;for(const c of key)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
// Visual schedules never advance the simulation RNG or change family records.
function plan(s,currentRoom){
 const month=Math.max(0,Math.floor(Number(s.age||0)*12)),pick=key=>hash(s.seed,month+':'+key),eligible=Number(s.age)<17||s.flow?.activity==='family',members=[];
 if(eligible)for(const role of ['mother','father']){const p=s.family?.[role];if(p&&p.alive!==false&&!p.absent&&!p.sep)members.push({role,room:ROOMS[pick(role)%ROOMS.length]});}
 if(members.length===2&&members[0].room===members[1].room)members[1].room=ROOMS[(ROOMS.indexOf(members[0].room)+1)%ROOMS.length];
 // One visitor alongside the player; the other relative stays elsewhere in the house.
 const visible=members.filter(p=>p.room===currentRoom);
 return {month,members,visible};
}
function arrange(s,scene,player){
 const schedule=plan(s,scene.kind),slots=scene.slots||[],self={...player,position:[...player.position]},parents=[];
 for(const member of schedule.visible){
  const free=slots.find(slot=>self.pose!=='sitting'||slot.id!==self.seatId);
  if(free){parents.push({...member,pose:'sitting',seatId:free.id,position:[...free.position]});if(self.pose!=='sitting'&&Math.abs(self.position[0]-free.position[0])<80){const low=scene.walkableAreas?.flat().map(p=>p[0])||[140,278],left=Math.min(...low)+5,right=Math.max(...low)-5;self.position=[Math.abs(left-free.position[0])>Math.abs(right-free.position[0])?left:right,self.position[1]];}}
  else {self.pose='standing';self.seatId=null;self.position=[140,scene.personAnchor?.[1]||282];parents.push({...member,pose:'standing',seatId:null,position:[278,scene.personAnchor?.[1]||282]});}
 }
 return {self,parents,schedule};
}
function geometry(manifest,scene,id,a){
 const p=manifest.profiles[id],pose=p.poses[a.pose],scale=p.worldStandingHeight/p.poses.standing.visibleHeight*(scene.personScale||1),slot=a.pose==='sitting'?(scene.slots||[]).find(v=>v.id===a.seatId):null,anchor=slot?pose.seatAnchor:pose.footAnchor,position=slot?slot.position:a.position;
 return {scale,x:position[0]-anchor[0]*scale,y:position[1]-anchor[1]*scale,footY:position[1]+(pose.footAnchor[1]-anchor[1])*scale};
}
const api={plan,arrange,geometry};root.HouseholdScene=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
