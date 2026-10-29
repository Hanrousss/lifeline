// Layered scenery uses original, deterministic pixel shapes; drawing never consumes game randomness.
function cozySceneBackdrop(s,outdoor){
 let art='';const r=(x,y,w,h,color)=>art+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`,poly=(points,color)=>art+=`<polygon points="${points}" fill="${color}"/>`;
 const cloud=(x,y)=>{r(x+7,y,23,3,'#eaf7f2');r(x,y+3,40,4,'#f9fff5');r(x+4,y+7,47,3,'#d8ece9');};
 const plant=(x,y)=>{r(x+4,y+8,2,12,'#759d80');r(x-2,y+6,7,5,'#8bb99b');r(x+6,y+2,7,5,'#adc994');r(x+5,y+6,5,5,'#6d9e87');r(x,y+18,11,3,'#e4bc9f');r(x+1,y+21,9,7,'#c99485');r(x+3,y+22,2,4,'#eac8aa');};
 if(outdoor){
  art+='<g data-scene-layer="distant-landscape">';r(0,0,320,112,'#9ed7e3');r(0,0,320,25,'#8ccddd');r(0,25,320,23,'#a9dfe6');r(0,48,320,20,'#c7e8e6');
  r(245,10,16,16,'#f4e7b3');r(248,7,10,3,'#f7edc8');cloud(18,10);cloud(102,5);cloud(266,26);
  poly('22,69 48,40 61,40 84,13 96,13 119,43 130,43 157,73','#a7bcd6');poly('64,37 84,13 96,13 116,39 103,36 94,29 89,34 81,28 72,39','#f5f4e9');
  poly('106,75 145,37 156,37 171,24 178,24 207,60 231,76','#bed1df');poly('153,42 171,24 178,24 190,40 180,36 174,40 168,34 161,43','#eff6ee');
  poly('0,67 24,60 59,61 83,72 128,64 166,72 208,58 253,63 287,52 320,55 320,94 0,94','#a0c7ae');poly('0,81 41,75 85,81 125,75 165,81 209,70 252,74 290,66 320,69 320,99 0,99','#82b79c');
  r(0,83,320,29,'#c0d58d');r(0,91,320,21,'#cdda98');r(0,105,320,7,'#a9c681');
  poly('179,80 191,80 163,91 172,95 153,101 167,105 153,112 117,112 139,103 130,99 153,90','#8fcdd0');r(155,92,14,2,'#d7eee0');r(136,104,19,2,'#cce9dd');
  // A small lived-in cottage sits behind the path.
  r(36,60,34,24,'#d4b5a4');r(40,62,27,22,'#e6cdb1');poly('31,62 48,46 57,46 75,62','#9c8c9d');poly('37,60 50,49 55,49 68,60','#c6a6ad');r(56,46,4,9,'#bba79c');r(45,68,10,16,'#a48780');r(58,67,7,8,'#f4dca1');r(61,67,1,8,'#c8ae8f');r(38,82,33,3,'#bfa48f');
  art+='</g><g data-scene-layer="near-garden">';
  const tree=(x,y,leaf)=>{r(x+12,y+23,5,28,'#9f8b7d');r(x+13,y+24,2,28,'#c5af8e');r(x+4,y+5,23,8,leaf);r(x,y+13,33,14,leaf);r(x+6,y+27,23,7,leaf);r(x+4,y+12,15,6,'#b3d0a1');r(x+2,y+20,9,4,'#bad5aa');r(x+21,y+20,10,8,'#7da98c');};tree(-5,29,'#97bc96');tree(281,24,'#97c5a4');
  poly('42,96 113,89 210,88 268,94 269,99 205,94 111,95 49,102','#e9dfb1');r(221,79,42,4,'#b49a86');r(223,72,38,6,'#d1b79a');r(225,83,3,8,'#927f75');r(257,83,3,8,'#927f75');r(224,73,35,1,'#e9d5ad');
  for(let i=0;i<46;i++){const x=(i*47+(s.seed%17))%320,y=93+(i*7)%18;if(x>102&&x<205)continue;r(x,y,3,1,i%3?'#a7c888':'#e6e5a8');if(i%4===0){r(x,y-3,1,4,'#83ad82');r(x-1,y-4,3,2,i%8?'#f1b3c6':'#fcf0c6');}}
  art+='</g>';
 }else{
  art+='<g data-scene-layer="room-depth">';r(0,0,320,112,'#eee7d8');r(0,0,320,7,'#d8c7bf');r(0,7,320,2,'#faf1de');r(0,9,320,61,'#eee5d9');r(0,69,320,17,'#e2d8cc');r(0,69,320,2,'#f8edde');r(0,84,320,4,'#bba290');r(0,87,320,25,'#d1b69e');
  for(let i=0;i<8;i++){r(i*42,90+(i%2)*6,1,9,'#bca18d');r(i*42+12,104,1,8,'#bca18d');}r(0,99,320,1,'#c2a78f');r(0,111,320,1,'#b9a18c');
  for(let i=0;i<15;i++){const x=75+(i%10)*20,y=19+Math.floor(i/10)*17;r(x,y,1,3,'#dfd5cb');r(x-1,y+1,3,1,'#dfd5cb');}
  // Window recess, distant garden, curtains and a stepped patch of sunlight.
  r(10,16,49,47,'#d4c4b6');r(13,18,44,42,'#b69e8f');r(16,21,38,34,'#b1dce3');r(16,21,38,9,'#9bcfdc');r(21,26,14,3,'#eef4e9');r(25,23,8,3,'#eef4e9');r(17,44,36,11,'#c0d5a8');r(39,35,9,20,'#a7c5a0');r(36,40,17,8,'#a7c5a0');r(33,21,3,35,'#faf1d9');r(16,37,38,2,'#faf1d9');r(9,58,52,4,'#c5ad95');r(9,58,52,1,'#f4e6cc');
  r(6,16,7,37,'#c1b9d1');r(7,17,2,32,'#ded6e1');r(13,16,5,10,'#c1b9d1');r(54,16,7,38,'#b2a6c1');r(56,17,2,31,'#d6cbdd');r(6,14,56,2,'#a99389');
  poly('20,63 52,63 96,95 43,95','#e9d6af');poly('25,64 32,64 63,91 51,91','#f0e1c2');
  // Framed prints, a bookcase, and plants frame the central action.
  r(238,17,25,22,'#c0a98d');r(240,19,21,18,'#f9f0d9');r(242,21,17,8,'#c3d6d3');poly('242,33 249,25 254,31 259,27 259,35 242,35','#a4bbaa');r(247,23,3,3,'#ead6a5');
  r(280,20,25,57,'#baa38e');r(283,23,19,50,'#d5c3a8');r(282,43,21,3,'#ac9483');r(282,62,21,3,'#ac9483');
  for(let i=0;i<5;i++){r(284+i*3,29-(i%2)*3,2,12+(i%2)*3,['#8faeab','#c9a0a8','#dabf84','#a9b6c5','#b9c1a0'][i]);r(284+i*3,30,1,2,'#eadcc0');}r(286,51,13,9,'#b6bf9d');r(287,52,11,1,'#dbe0bc');r(286,67,14,3,'#d4b99d');r(288,70,10,2,'#c5a6a1');
  r(65,96,177,10,'#bcb6ca');r(71,93,165,16,'#c6c1d3');r(76,96,155,10,'#dbd5df');r(82,98,143,6,'#c6c1d3');r(90,100,127,2,'#d7ccdb');
  plant(16,67);plant(294,71);r(79,37,3,4,'#e1bb94');r(76,35,9,3,'#f0d5ae');r(78,39,5,1,'#b19a88');
  art+='</g>';
 }
 return art;
}

function renderLiveScene(s){const F=LifeFlow,flow=F.ensure(s),kind=F.activeScene(s),pending=F.pending(s);let a='';const r=(x,y,w,h,c)=>a+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;const sprite=(x,y,shirt,child=false,pose='stand',extra='')=>{const role=shirt==='#ce8575'?'self':shirt==='#8696a7'||shirt==='#8697a4'?'dad':s.age>=6&&s.age<17?'friend':'mom';r(x-4,y+(child?34:40),22,3,outdoor?'#83ab8b':'#b7a498');a+=`<g class="pixel-actor ${pose==='walk'?'actor-walk':'actor-idle'} ${extra}">${PixelPeople.actor(s,{x,floor:y+(child?36:42),role,child})}</g>`;};
const outdoor=kind==='park';a+=cozySceneBackdrop(s,outdoor);
if(kind==='school'){r(83,14,134,35,'#86705a');r(86,17,128,29,'#56786b');r(99,26,40,2,'#d6ddbe');r(99,33,25,2,'#d6ddbe');r(164,25,12,12,'#e1c68f');r(178,27,23,2,'#d6ddbe');[[68,73],[201,73]].forEach(([x,y])=>{r(x,y,42,4,'#927159');r(x+3,y+4,3,12,'#927159');r(x+36,y+4,3,12,'#927159');});sprite(225,43,'#809b92',false);sprite(126,s.age<17?52:45,'#ce8575',s.age<17);sprite(159,52,'#9a9c78',true);}
else if(kind==='work'){r(90,18,48,32,'#455b69');r(94,22,40,24,'#b1d3d6');r(97,25,16,2,'#e9f3e5');r(97,30,27,1,'#8fb4bc');r(97,34,20,1,'#8fb4bc');r(117,38,12,5,'#c7ded4');r(112,50,4,7,'#455b69');r(82,64,93,5,'#8e7058');r(86,69,4,19,'#8e7058');r(167,69,4,19,'#8e7058');r(96,58,48,4,'#eee5d0');r(146,58,7,6,'#c3b4cc');r(149,55,1,3,'#859c88');r(231,55,20,30,'#719386');sprite(185,45,'#ce8575');sprite(242,45,'#8697a4');}
else if(kind==='draw'||kind==='read'){r(112,69,98,5,'#8c6f58');r(116,74,4,14,'#8c6f58');r(202,74,4,14,'#8c6f58');r(128,60,30,9,'#fff0cc');r(130,62,26,1,kind==='draw'?'#b18489':'#8b9f8f');r(140,60,2,9,'#beaa85');r(184,42,3,27,'#b38468');r(178,39,15,4,'#d6b17e');r(175,43,21,3,'#d6b17e');sprite(156,s.age<17?52:45,'#ce8575',s.age<17);if(s.age<6)sprite(88,45,'#819b8b');}
else if(kind==='family'){r(104,70,118,5,'#96755a');r(109,75,4,13,'#96755a');r(213,75,4,13,'#96755a');r(140,64,8,6,'#f3e7c4');r(182,64,8,6,'#f3e7c4');sprite(76,45,'#819b8b');sprite(231,45,'#8696a7');if(s.age>=1)sprite(157,s.age<17?52:45,'#ce8575',s.age<17);if(pending?.kind==='early'&&s.age===3){r(150,61,20,9,'#e7a18c');r(150,59,20,3,'#f6e3b2');[153,159,165].forEach(x=>{r(x,52,2,7,'#7c9b93');r(x,49,2,2,'#edc572');});}}
else if(kind==='play'){r(89,87,132,13,'#d2a078');r(104,79,10,8,'#809e9f');r(114,71,10,16,'#d5ad6c');r(104,63,10,16,'#ce8979');r(182,80,11,7,'#83998a');sprite(141,52,'#ce8575',true);if(s.age<6)sprite(223,45,'#819b8b');}
else if(kind==='repair'){r(119,74,67,4,'#8a705b');r(122,78,4,10,'#8a705b');r(179,78,4,10,'#8a705b');r(144,66,20,8,'#879b90');r(153,61,3,9,'#526576');sprite(192,45,'#8696a7');if(s.age>=1)sprite(98,s.age<17?52:45,'#ce8575',s.age<17);}
else if(kind==='park'){sprite(118,s.age<17?52:45,'#ce8575',s.age<17,'walk');sprite(172,s.age<6?45:s.age<17?52:45,'#819b8b',s.age>=6&&s.age<17,'walk','actor-companion');}
else{r(74,68,63,17,'#397e80');r(77,61,57,12,'#65a29b');r(75,84,5,4,'#816c56');r(130,84,5,4,'#816c56');r(94,63,17,10,'#e0bd9d');r(96,65,13,1,'#f1d7b7');r(79,77,52,1,'#81b9b0');r(78,84,55,2,'#568e8b');r(208,75,24,4,'#8e7359');r(211,79,3,9,'#8e7359');r(226,79,3,9,'#8e7359');r(217,66,6,9,'#d8ad7a');if(s.age>=1)sprite(166,s.age<17?52:45,'#ce8575',s.age<17);if(s.age<6)sprite(244,45,'#819b8b');}
if(s.age<1){a+='<g class="scene-cradle">';r(153,76,37,6,'#8e715a');r(153,66,3,16,'#8e715a');r(187,66,3,16,'#8e715a');r(156,72,31,5,'#9eb6a6');r(163,68,8,5,PixelPeople.skin(s));r(160,72,22,4,'#eed5ae');r(156,82,3,6,'#8e715a');r(184,82,3,6,'#8e715a');a+='</g>';}
if(kind==='sleep')r(0,0,320,112,'#54678533');return `<svg class="live-pixel-scene" data-perspective="overview" preserveAspectRatio="xMidYMid meet" viewBox="0 0 320 112" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="Пиксельная сцена: ${F.names[kind]||'Дома'}">${a}</svg>`;}
