function renderPixelScene(s){
const C={ink:'#343f50',sky:'#bedee1',cloud:'#f8f3da',grass:'#7f9d68',leaf:'#477a62',leafLight:'#70a473',trunk:'#866349',roof:'#ad5e53',roofLight:'#d58366',wall:'#f1dbad',wallShade:'#d5b888',floor:'#ae805a',wood:'#805e4c',cream:'#fff0cc',blue:'#88b8c3',teal:'#528b85',sofa:'#6a9290',rose:'#d98e7d',skin:'#e4af87',hair:s.age>=64?'#d4d4c1':'#685145'};
let art='';const r=(x,y,w,h,c)=>art+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const tiles=(x,y,rows,palette,scale=1)=>{rows.forEach((row,dy)=>[...row].forEach((ch,dx)=>{if(palette[ch])r(x+dx*scale,y+dy*scale,scale,scale,palette[ch]);}));};
const flower=(x,y,c)=>{r(x,y,1,6,C.leaf);r(x-2,y-2,5,3,c);r(x-1,y-3,3,5,c);r(x,y-1,1,1,'#f6d681');};
// A flat, front-facing cutaway. Every shape follows the same pixel grid.
r(0,0,320,196,C.sky);r(0,116,320,80,'#a9be87');r(0,151,320,45,C.grass);r(0,153,320,2,'#6b8e5d');
r(259,15,14,24,'#f4cd77');r(254,20,24,14,'#f4cd77');r(260,18,11,15,'#f8dc98');
[[23,25],[112,14],[278,59]].forEach(([x,y])=>{r(x,y,23,5,C.cloud);r(x+5,y-4,13,4,C.cloud);r(x-4,y+3,34,4,C.cloud);});
// Distant shrubs, flat picket fence and tree.
[[0,107],[20,113],[286,112],[307,104]].forEach(([x,y])=>{r(x,y,18,26,'#8ca77c');r(x+3,y-6,12,6,'#8ca77c');});
r(0,132,46,3,'#e6d5a8');r(274,132,46,3,'#e6d5a8');r(0,143,46,3,'#e6d5a8');r(274,143,46,3,'#e6d5a8');
[5,18,31,283,296,309].forEach(x=>{r(x,128,5,24,'#f2dfb0');r(x+1,126,3,2,'#f2dfb0');});
r(21,99,7,53,C.trunk);r(25,103,3,49,'#674e42');r(7,78,38,26,C.leaf);r(13,66,27,14,C.leaf);r(17,60,18,8,C.leaf);r(3,86,45,13,C.leaf);r(13,71,19,8,C.leafLight);r(8,82,12,10,C.leafLight);r(28,94,12,6,'#3e6959');
// House roof, chimney, wall, and timber outline.
r(225,31,12,30,C.ink);r(228,31,6,26,C.roofLight);r(223,29,16,5,C.ink);
r(54,59,212,96,C.ink);r(58,63,204,86,C.wall);r(58,63,204,4,C.wallShade);r(58,142,204,7,C.floor);r(54,149,212,6,C.wood);r(49,155,222,4,'#c9a278');
r(45,57,230,8,C.ink);r(51,50,218,7,C.ink);r(58,43,204,7,C.ink);r(65,36,190,7,C.ink);r(72,29,176,7,C.ink);r(79,22,162,7,C.ink);
r(49,57,222,4,C.roof);r(55,50,210,7,C.roof);r(62,43,196,7,C.roof);r(69,36,182,7,C.roof);r(76,29,168,7,C.roof);r(81,25,158,4,C.roofLight);
for(let y=34;y<59;y+=8){r(84,y,151,1,'#c77860');for(let x=70+(y%3)*5;x<252;x+=24)r(x,y,1,5,'#9a534e');}
r(59,66,4,76,C.wallShade);r(257,66,4,76,C.wallShade);
// Large window, curtains, and light. All frames face the viewer.
r(76,76,47,41,C.wood);r(79,79,41,34,C.blue);r(82,81,17,14,'#afd5d5');r(103,81,14,14,'#bcdfe0');r(82,98,17,12,'#9dc6ce');r(103,98,14,12,'#a5ced1');r(98,79,3,34,C.cream);r(79,95,41,3,C.cream);r(73,73,53,3,C.wood);r(73,76,6,38,C.rose);r(120,76,6,38,C.rose);r(72,113,55,4,C.wood);
// A clock and pendant light.
r(150,72,15,15,C.wood);r(153,75,9,9,C.cream);r(157,76,1,5,C.ink);r(157,80,4,1,C.ink);r(190,64,1,14,C.wood);r(184,78,13,3,'#e2b46c');r(181,81,19,4,'#e2b46c');r(184,85,13,2,C.cream);
// Sofa, side table, rug, desk, and shelf.
r(70,124,57,16,C.wood);r(73,119,51,17,C.sofa);r(77,117,20,16,'#81aaa0');r(100,117,20,16,'#81aaa0');r(70,125,6,12,C.teal);r(121,125,6,12,C.teal);r(73,140,5,4,C.wood);r(119,140,5,4,C.wood);r(110,122,8,7,'#e1b879');
r(133,133,14,3,C.wood);r(135,136,2,8,C.wood);r(143,136,2,8,C.wood);r(136,127,8,6,'#db9a70');r(137,125,6,2,C.cream);
r(82,145,119,3,'#cf9a73');r(78,148,127,6,'#dfb18a');r(83,150,117,2,'#b97f64');
r(212,123,35,4,C.wood);r(214,127,3,17,C.wood);r(242,127,3,17,C.wood);r(220,119,14,4,C.cream);r(235,114,3,9,C.rose);r(231,114,11,2,'#edbd78');r(233,110,7,4,'#edbd78');
r(230,77,21,39,C.wood);r(233,80,15,14,'#d0b288');r(233,97,15,15,'#d0b288');r(234,82,3,12,'#6f9ba2');r(238,84,4,10,'#c77f6e');r(243,81,3,13,'#e8c880');r(234,103,12,8,C.teal);r(237,100,6,3,C.teal);
// Life memories acquire their own places in the room.
const tags=new Set(s.memories.map(m=>m.tag));
if(tags.has('create')){r(174,91,18,21,C.wood);r(176,93,14,17,C.cream);r(180,96,5,5,'#e2b879');r(178,105,9,3,'#7b9e7d');r(181,102,4,4,'#7b9e7d');}
if(tags.has('learn')){r(151,138,13,4,'#688caa');r(153,134,12,4,'#d69b73');r(154,130,10,4,'#e6cc92');}
if(tags.has('people')){r(133,102,14,17,C.wood);r(135,104,10,13,C.cream);r(137,107,3,3,C.hair);r(141,107,2,3,'#ad7758');r(136,111,4,4,C.teal);r(141,111,3,4,C.rose);}
// A familiar adult shares the room during the early years.
if(s.age<6){tiles(136,115,['...HHHH...','..HHHHHH..','..HSSSSH..','..HSESSH..','...SSSS...','..TTTTTT..','.STTTTTTS.','.STTTTTTS.','.STTTTTTS.','..TTTTTT..','...PPPP...','...PPPP...','...P..P...','...P..P...','..BB..BB..'],{H:s.family?.tone==='harsh'?'#c4beb4':'#665044',S:C.skin,E:C.ink,T:'#78958a',P:'#7b6a62',B:C.ink},2);}
// Distinct baby / child / adult / older adult sprites.
if(s.age<1){r(165,132,33,5,C.wood);r(168,137,3,8,C.wood);r(192,137,3,8,C.wood);r(165,123,3,12,C.wood);r(195,123,3,12,C.wood);r(168,127,27,6,'#9dbab2');r(175,124,8,4,C.skin);r(173,127,15,5,'#f0c9a2');r(167,120,5,3,C.cream);r(191,120,6,3,C.cream);}
else{let child=s.age<17,old=s.age>=64;let x=178,y=s.age<3?123:child?115:105;let rows=s.age<3?['...HHHH...','..HHHHHH..','..HSSSSH..','..HSESSH..','...SSSS...','..TTTTTT..','.STTTTTTS.','.STTTTTTS.','..TTTTTT..','...PPPP...','..PP..PP..','..BB..BB..']:child?[
'....HHHH....','...HHHHHH...','...HSSSSH...','...HSESSH...','....SSSS....','.....SS.....','...TTTTTT...','..STTTTTTS..','..STTTTTTS..','..STTTTTTS..','...TTTTTT...','....PPPP....','....PPPP....','....P..P....','....P..P....','...BB..BB...']:[
'....HHHH....','...HHHHHH...','...HSSSSH...','...HSESSH...','...HSSSSH...','....SSSS....','.....SS.....','...TTTTTT...','..STTTTTTS..','..STTTTTTS..','..STTTTTTS..','..STTTTTTS..','..STTTTTTS..','...TTTTTT...','....PPPP....','....PPPP....','....PPPP....','....P..P....','....P..P....','....P..P....','...BB..BB...'];
r(x+3,y+rows.length*2,19,2,'#8d7357');tiles(x,y,rows,{H:C.hair,S:C.skin,E:C.ink,T:old?'#87919c':'#d5846e',P:'#52697b',B:C.ink},2);if(old){r(x+25,y+25,2,18,C.wood);r(x+22,y+25,5,2,C.wood);}}
// Outdoor details provide a readable ground line without perspective.
r(275,146,27,4,C.wood);r(277,150,3,8,C.wood);r(296,150,3,8,C.wood);r(277,138,23,5,'#bf916b');r(279,142,2,4,C.wood);r(296,142,2,4,C.wood);
[[11,168],[30,179],[66,170],[253,177],[285,167],[306,182]].forEach(([x,y],i)=>flower(x,y,i%2?'#df9b89':'#f1d589'));
[[42,161],[96,177],[232,166],[265,186],[155,181],[13,188]].forEach(([x,y])=>{r(x,y,3,2,'#a7bd83');r(x+6,y+3,2,1,'#587e5a');});
return `<svg class="world pixel-world" viewBox="0 0 320 196" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="Пиксельный дом в разрезе, вид сбоку. ${s.age<1?'Младенец в колыбели':s.age<17?'Ребёнок':s.age>=64?'Пожилой персонаж':'Взрослый персонаж'} в комнате с диваном, окном и письменным столом.">${art}</svg>`;
}
