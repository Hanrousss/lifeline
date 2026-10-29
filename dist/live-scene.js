// Original pixel environments built directly from the supplied color harmonies.
const LifeArtColors=Object.freeze({sky:'#80AEE8',frost:'#E6F1FA',denim:'#5798D7',blueberry:'#93A8D9',lilac:'#E7BEF0',violet:'#9D87B9',ivory:'#F7F2E0',beige:'#F7F4D5',pistachio:'#B9C255',moss:'#839958',deep:'#0A3323',teal:'#105666',rain:'#00847E',rose:'#D3968C',peony:'#FFC0C0',berry:'#F2619C',bordeaux:'#5B0015',lemon:'#EDE986',sun:'#F4D242',clay:'#C45F3F',wood:'#B97848',woodLight:'#E5B574',woodDark:'#865234'});
function renderLiveScene(s){
 const F=LifeFlow;F.ensure(s);const kind=F.activeScene(s),pending=F.pending(s),C=LifeArtColors,outdoor=kind==='park';let a='';
 const r=(x,y,w,h,color)=>{a+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;};
 const p=(points,color)=>{a+=`<polygon points="${points}" fill="${color}"/>`;};
 const group=name=>{a+=`<g data-scene-layer="${name}">`;},end=()=>{a+='</g>';};
 const cloud=(x,y)=>{r(x+8,y,28,4,C.ivory);r(x,y+4,49,5,C.frost);r(x+5,y+9,56,3,'#C8DCEC');};
 const plant=(x,y,size=1)=>{a+=`<g transform="translate(${x} ${y}) scale(${size})">`;r(8,4,3,25,C.moss);r(0,8,10,7,C.deep);r(9,0,12,8,C.moss);r(12,8,12,8,C.rain);r(5,16,11,7,C.moss);r(2,26,20,4,C.woodLight);r(4,30,16,12,C.clay);r(6,31,3,8,C.rose);end();};
 const book=(x,y,w,h,color)=>{r(x,y,w,h,color);r(x+1,y+2,1,h-3,C.ivory);};
 const table=(x,y,w)=>{r(x,y,w,5,C.woodDark);r(x,y,w,2,C.woodLight);r(x+4,y+5,5,23,C.wood);r(x+w-9,y+5,5,23,C.wood);};
 const picture=(x,y,w,h)=>{r(x,y,w,h,C.wood);r(x+3,y+3,w-6,h-6,C.ivory);r(x+6,y+6,w-12,h-12,C.sky);p(`${x+6},${y+h-7} ${x+w*.4},${y+13} ${x+w*.6},${y+h*.6} ${x+w-7},${y+14} ${x+w-7},${y+h-7}`,C.moss);r(x+w-17,y+10,5,5,C.lemon);};
 const shelf=(x,y,w,h)=>{r(x,y,w,h,C.woodDark);r(x+4,y+4,w-8,h-8,C.woodLight);for(let row=0;row<Math.max(1,Math.floor((h-4)/24));row++){const floor=y+23+row*24;r(x+3,floor,w-6,4,C.wood);for(let i=0;i<5;i++)book(x+7+i*6,floor-13-(i%2)*4,4,13+(i%2)*4,[C.teal,C.rose,C.blueberry,C.pistachio,C.bordeaux][(i+row)%5]);}};
 const sprite=(x,role='self',child=false,walking=false)=>{r(x-4,277,23,3,outdoor?'#718F49':'#B39168');a+=`<g class="pixel-actor ${walking?'actor-walk':'actor-idle'}">${PixelPeople.actor(s,{x,floor:278,role,child})}</g>`;};
 group('background');
 if(outdoor){
  r(0,0,320,320,C.sky);r(0,112,320,70,'#A8CDEB');r(0,182,320,38,C.frost);cloud(16,58);cloud(188,110);cloud(263,166);r(245,78,17,17,C.lemon);r(249,74,9,4,C.lemon);
  p('0,205 28,157 53,157 87,86 103,86 145,164 173,176 205,214',C.blueberry);p('58,147 87,86 103,86 133,145 116,138 103,116 92,131 83,120 72,145',C.frost);
  p('116,215 160,159 179,159 212,118 225,118 275,184 320,199 320,230', '#C1B7DC');p('185,155 212,118 225,118 250,153 233,145 221,136 215,145 205,138 197,153',C.ivory);
  p('0,216 40,199 87,207 127,197 173,211 219,194 268,200 320,184 320,255 0,255',C.moss);p('0,235 54,219 105,231 166,213 225,229 278,213 320,220 320,269 0,269',C.teal);
  r(0,244,320,76,C.pistachio);r(0,270,320,50,'#C9CE69');r(0,310,320,10,C.moss);
  p('190,240 205,240 174,258 187,269 158,287 175,299 143,320 99,320 135,295 122,282 155,263',C.denim);r(150,278,22,3,C.frost);r(121,307,25,3,C.frost);
  p('12,285 94,263 157,258 246,263 308,280 306,290 246,275 156,269 97,274 18,295',C.beige);
  // Cottage, trees and flower beds form a lived-in garden rather than an empty backdrop.
  r(27,204,47,43,C.rose);r(31,207,39,40,C.ivory);p('20,208 47,182 57,182 83,208',C.bordeaux);p('28,204 49,185 54,185 75,204',C.clay);r(62,183,6,14,C.woodDark);r(37,226,12,21,C.wood);r(54,217,12,13,C.lemon);r(59,217,2,13,C.wood);r(53,222,14,2,C.wood);
  for(const [x,y]of [[-10,164],[279,158]]){r(x+19,y+38,7,66,C.woodDark);r(x+21,y+41,2,61,C.woodLight);r(x+6,y,33,10,C.moss);r(x,y+10,49,24,C.deep);r(x+7,y+34,36,13,C.teal);r(x+5,y+9,25,8,C.rain);r(x+9,y+4,23,5,C.pistachio);}
  r(244,239,50,5,C.woodDark);r(247,227,44,10,C.woodLight);r(248,244,4,15,C.wood);r(286,244,4,15,C.wood);
  for(let i=0;i<48;i++){const x=(i*47+(s.seed%13))%320,y=273+(i*9)%42;if(x>105&&x<211)continue;r(x,y,3,1,i%3?C.moss:C.lemon);if(i%4===0){r(x,y-4,1,5,C.deep);r(x-2,y-6,5,3,i%8?C.berry:C.ivory);r(x,y-5,1,1,C.sun);}}
 }else{
  const walls={home:C.ivory,school:C.frost,work:C.frost,draw:'#E8D7EF',read:C.beige,family:'#F5D2C7',play:'#F2EDBA',repair:C.ivory,sleep:C.deep},panels={home:C.pistachio,school:C.sky,work:C.denim,draw:C.blueberry,read:C.moss,family:C.rose,play:C.pistachio,repair:C.clay,sleep:C.teal};
  r(0,0,320,320,walls[kind]||C.ivory);r(0,0,320,8,kind==='sleep'?C.teal:C.rose);r(0,8,320,3,C.beige);r(0,198,320,42,panels[kind]||C.pistachio);r(0,196,320,3,C.woodLight);r(0,238,320,6,C.woodDark);r(0,244,320,76,kind==='sleep'?'#655C70':'#DDB579');
  for(let i=0;i<10;i++){r(i*34,245+(i%2)*22,1,22,'#BB8A58');r(i*34+15,290,1,30,'#BB8A58');}r(0,268,320,1,'#C69765');r(0,291,320,1,'#C69765');
  for(let i=0;i<30;i++){const x=105+(i%9)*24,y=100+Math.floor(i/9)*23;r(x,y,1,3,kind==='sleep'?C.teal:'#E1D5B0');r(x-1,y+1,3,1,kind==='sleep'?C.teal:'#E1D5B0');}
  // Large garden window, stitched curtains, pendant light, wall art and an inset rug.
  r(14,140,83,104,C.woodDark);r(18,144,75,96,C.woodLight);r(22,148,67,86,kind==='sleep'?C.denim:C.sky);r(22,189,67,45,kind==='sleep'?C.teal:C.pistachio);p('22,207 40,182 61,200 76,179 89,195 89,231 22,231',kind==='sleep'?C.deep:C.moss);r(53,148,4,86,C.ivory);r(22,187,67,3,C.ivory);r(11,239,89,5,C.woodLight);
  r(9,138,12,91,C.violet);r(12,140,3,85,C.lilac);r(89,138,12,91,C.violet);r(93,140,3,85,C.lilac);r(8,135,94,3,C.woodDark);
  if(kind==='sleep'){r(72,157,9,10,C.beige);r(76,155,7,7,C.denim);r(32,166,2,2,C.ivory);r(65,176,2,2,C.ivory);}else{a+='<g class="window-sunlight" opacity="0.15">';p('22,245 88,245 142,288 49,288',C.lemon);p('29,245 39,245 77,284 62,284',C.ivory);end();}
  r(174,12,2,109,C.woodDark);r(162,121,27,4,C.wood);r(157,125,37,10,C.woodLight);r(161,135,29,3,C.lemon);
  picture(216,138,68,48);r(70,280,183,31,C.violet);r(74,282,175,26,C.lilac);r(82,286,159,18,C.blueberry);r(88,290,147,10,C.lilac);
  plant(7,245,.75);plant(293,247,.8);
 }
 end();group('scene-furniture');
 if(kind==='home'||kind==='sleep'){
  r(92,240,73,34,C.teal);r(96,228,65,22,C.rain);r(91,246,75,6,C.teal);r(97,253,63,2,'#60A99A');r(96,273,5,7,C.woodDark);r(155,273,5,7,C.woodDark);r(105,233,20,14,C.rose);r(130,232,20,14,C.pistachio);table(227,254,31);r(238,244,9,10,C.beige);r(239,242,7,2,C.clay);shelf(277,181,36,59);
 }else if(kind==='school'){
  r(115,170,181,49,C.woodDark);r(120,174,171,39,C.deep);r(128,184,65,2,C.ivory);r(128,192,48,2,C.ivory);r(245,180,25,21,C.lemon);r(123,213,161,3,C.woodLight);r(132,211,9,2,C.ivory);table(108,254,54);table(205,254,54);book(117,249,22,4,C.berry);book(214,249,22,4,C.sky);
 }else if(kind==='work'){
  shelf(270,172,38,76);table(100,251,111);r(116,205,64,39,C.bordeaux);r(120,209,56,31,C.denim);r(125,215,25,3,C.frost);r(125,222,42,2,C.pistachio);r(125,228,32,2,C.frost);r(145,244,7,7,C.woodDark);r(121,248,56,3,C.beige);r(219,245,22,29,C.teal);r(203,243,11,9,C.rose);r(207,237,2,6,C.moss);
 }else if(kind==='draw'){
  table(119,252,99);r(239,210,5,70,C.woodDark);r(220,216,46,39,C.woodLight);r(224,220,38,31,C.ivory);p('226,247 235,228 243,237 253,225 260,247',C.lilac);r(228,226,9,9,C.berry);r(249,237,9,10,C.pistachio);r(133,241,31,11,C.ivory);r(137,244,8,3,C.sky);r(149,246,8,3,C.rose);r(184,239,8,13,C.blueberry);r(187,229,2,10,C.woodDark);
 }else if(kind==='read'){
  shelf(259,161,48,91);shelf(111,166,48,69);r(169,241,53,28,C.teal);r(173,227,45,24,C.rain);r(179,233,19,12,C.lemon);table(226,260,27);book(228,254,20,4,C.rose);book(230,250,18,4,C.pistachio);
 }else if(kind==='family'){
  table(110,250,117);r(117,244,104,6,C.beige);r(139,236,9,8,C.rose);r(193,236,9,8,C.teal);r(169,228,8,16,C.blueberry);r(172,218,2,10,C.moss);r(166,215,12,5,C.berry);r(171,211,3,4,C.lemon);picture(115,166,34,28);
  if(pending?.kind==='early'&&s.age===3){r(156,235,32,14,C.rose);r(156,232,32,4,C.beige);for(const x of [162,171,180]){r(x,225,2,7,C.rain);r(x,221,2,4,C.sun);}}
 }else if(kind==='play'){
  r(106,254,54,24,C.sky);r(103,251,60,7,C.denim);r(114,260,12,8,C.lemon);r(144,259,8,8,C.rose);r(212,265,12,13,C.rain);r(224,252,12,26,C.woodLight);r(212,240,12,25,C.rose);r(247,270,14,8,C.violet);r(256,265,7,5,C.pistachio);r(116,224,36,4,C.woodLight);book(120,209,6,15,C.berry);book(129,213,6,11,C.teal);
 }else if(kind==='repair'){
  table(109,253,109);r(130,238,34,15,C.teal);r(134,242,26,7,C.blueberry);r(172,245,23,4,C.woodDark);r(185,235,4,12,C.woodLight);r(122,172,67,44,C.woodLight);for(let i=0;i<5;i++){r(130+i*11,181,2,20,C.woodDark);r(128+i*11,178,6,4,i%2?C.denim:C.clay);}r(223,264,24,13,C.rose);r(228,259,14,5,C.woodDark);
 }
 end();group('people');
 const child=s.age<17;
 if(kind==='park'){if(s.age>=1)sprite(145,'self',child,true);sprite(208,s.age<6?'mom':'friend',s.age>=6&&child,true);}
 else if(kind==='school'){sprite(258,'mom');if(s.age>=1)sprite(162,'self',child);sprite(208,'friend',child);}
 else if(kind==='work'){if(s.age>=1)sprite(185,'self');sprite(250,'dad');}
 else if(kind==='family'){sprite(84,'mom');sprite(250,'dad');if(s.age>=1)sprite(168,'self',child);}
 else if(kind==='repair'){sprite(245,'dad');if(s.age>=1)sprite(130,'self',child);}
 else{if(s.age>=1)sprite(kind==='read'?195:183,'self',child);if(s.age<6)sprite(91,'mom');}
 if(s.age<1){a+='<g class="scene-cradle">';r(155,256,43,23,C.woodDark);r(158,260,37,10,C.beige);r(159,265,35,8,C.pistachio);r(164,260,9,6,PixelPeople.skin(s));r(174,262,15,6,C.rose);r(155,249,3,31,C.wood);r(195,249,3,31,C.wood);r(158,279,4,5,C.woodDark);r(191,279,4,5,C.woodDark);end();}
 end();
 return `<svg class="live-pixel-scene" data-perspective="overview" data-scene-kind="${kind}" preserveAspectRatio="xMidYMid meet" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="Пиксельная сцена: ${F.names[kind]||'Дома'}">${a}</svg>`;
}
