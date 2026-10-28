(function(root){
// Original procedural pixels: everyday clothes, large heads and compact bodies.
const skins=[['#f2c6a2','#dba080','#e3a493'],['#e9ad83','#c78261','#cc866f'],['#ca885d','#a36549','#ad6658'],['#9e6345','#7d4938','#914d45'],['#794d3c','#5b362e','#713c36']];
const hairs=[['#503b35','#765044','#a67250'],['#49372f','#714e35','#a47746'],['#8b5835','#be8548','#e4b36c'],['#352f35','#51434b','#78606a']];
const clothes=[['#267f85','#1e5e68','#75b9af'],['#ca726d','#994f58','#e8a18b'],['#c59a45','#94703b','#e8c270'],['#4c6588','#364963','#8a9cbb']];
function actor(s,{x=0,floor=44,role='self',child=false}={}){
 const seed=s.seed>>>0,skin=skins[seed%skins.length],old=role==='gran'||role==='self'&&s.age>=64;
 const hair=old?['#80746b','#b3a797','#d8ccb6']:hairs[(seed+(role==='dad'?1:role==='mom'?2:0))%hairs.length];
 const cloth=clothes[role==='mom'?1:role==='dad'?3:role==='gran'?2:role==='friend'?2:seed%clothes.length];
 const top=floor-(child?35:42),cx=x+7,faceY=top+6,bodyY=top+21,bodyH=child?7:11,legsY=bodyY+bodyH,legH=floor-legsY-2;
 const style=role==='dad'||role==='friend'?0:role==='gran'?2:seed%3;let svg='';
 const r=(a,b,w,h,c)=>{if(h>0)svg+=`<rect x="${a}" y="${b}" width="${w}" height="${h}" fill="${c}"/>`;};
 // Hair silhouette and stepped warm shadows, without a heavy black outline.
 r(cx-8,top,15,2,hair[0]);r(cx-10,top+2,19,4,hair[0]);r(cx-11,top+6,21,10,hair[0]);
 if(style===1){r(cx-11,top+15,4,7,hair[0]);r(cx+7,top+15,4,7,hair[0]);}
 if(style===2){r(cx+7,top+1,6,5,hair[0]);r(cx+9,top+6,5,7,hair[1]);r(cx+10,top+13,3,5,hair[0]);}
 // Large face, two eyes, little blush; no fantasy anatomy or accessories.
 r(cx-8,faceY,16,10,skin[1]);r(cx-7,faceY+1,13,11,skin[0]);r(cx-5,faceY+12,10,2,skin[1]);
 r(cx-10,faceY+5,2,4,skin[0]);r(cx+8,faceY+5,2,4,skin[1]);
 r(cx-5,faceY+6,2,4,'#463c3b');r(cx+3,faceY+6,2,4,'#463c3b');
 r(cx-6,faceY+10,2,1,skin[2]);r(cx+5,faceY+10,2,1,skin[2]);r(cx,faceY+12,2,1,skin[1]);
 r(cx-7,top+3,13,3,hair[1]);r(cx-9,top+5,5,4,hair[1]);r(cx-4,top+5,5,3,hair[1]);r(cx+1,top+4,6,6,hair[1]);
 r(cx-5,top+2,7,1,hair[2]);r(cx-8,top+4,2,2,hair[2]);r(cx+3,top+4,2,2,hair[2]);
 // Compact torso and slim limbs, sleeves and everyday trousers.
 r(cx-2,bodyY-1,4,2,skin[1]);r(cx-5,bodyY+1,10,bodyH-1,cloth[0]);r(cx-4,bodyY,8,2,cloth[0]);
 r(cx+3,bodyY+2,2,bodyH-2,cloth[1]);r(cx-3,bodyY+2,2,Math.max(2,bodyH-4),cloth[2]);
 r(cx-7,bodyY+2,2,4,cloth[0]);r(cx+5,bodyY+2,2,4,cloth[1]);
 r(cx-7,bodyY+6,2,3,skin[0]);r(cx+5,bodyY+6,2,3,skin[1]);
 r(cx-4,legsY,8,2,'#4c4f65');r(cx-4,legsY+2,3,legH-2,'#4c4f65');r(cx+2,legsY+2,2,legH-2,'#383e54');
 r(cx-5,floor-2,4,2,'#3d3542');r(cx+1,floor-2,4,2,'#3d3542');
 return svg;
}
function portrait(s,role='self'){return `<svg viewBox="-7 -1 31 48" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${actor(s,{x:0,floor:45,role,child:role==='self'&&s.age<17})}</svg>`;}
root.PixelPeople={actor,portrait,skin:s=>skins[(s.seed>>>0)%skins.length][0]};if(typeof module!=='undefined')module.exports=root.PixelPeople;
})(typeof window!=='undefined'?window:globalThis);
