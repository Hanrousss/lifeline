(function(root){
 const cap=n=>Math.max(0,Math.min(100,Math.round(Number(n)||0)));
 function snapshot(s){
  const stats=s.stats||{},creative=(s.memories||[]).filter(m=>m.tag==='create').length;
  const areas=[
   {key:'health',name:'Здоровье',value:cap(stats.health),color:'#859975'},
   {key:'finances',name:'Финансы',value:cap(stats.money),color:'#c5a16d'},
   {key:'relationships',name:'Отношения',value:cap(stats.bond),color:'#bd8c83'},
   {key:'hobbies',name:'Хобби',value:cap(creative*8),color:'#a49ab7'},
   {key:'growth',name:'Саморазвитие',value:cap(stats.skill),color:'#7c9fa0'}
  ];
  const temporary=[],names={tobacco:'к сигаретам',alcohol:'к алкоголю',gambling:'к азартным играм',unknown:'к веществам'};
  for(const [key,value] of Object.entries(s.habits?.urges||{}))if(value>0)temporary.push({key:'urge-'+key,name:'Тяга '+(names[key]||''),value:cap(value),tone:'strain',hint:'Игровая шкала тяги; сама по себе не означает диагноз зависимости.'});
  if(s.habits?.comfort>0&&(s.habits.comfortUntil||0)>(s.flow?.months||0))temporary.push({key:'comfort',name:'Облегчение',value:cap(s.habits.comfort),tone:'calm',hint:'Краткое облегчение, действует временно.'});
  const partner=s.social?.partner;
  if(partner&&partner.closeness>=50)temporary.push({key:'love',name:'Любовь',value:cap(partner.closeness),tone:'love',hint:'Близость с '+partner.name+'. Условная шкала отношений в паре.'});
  if(stats.energy<30)temporary.push({key:'fatigue',name:'Истощение',value:cap(100-stats.energy),tone:'strain',hint:'Появляется, когда запас сил ниже 30.'});
  return {areas,happiness:cap(stats.joy),energy:cap(stats.energy),temporary};
 }
 const api={snapshot};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.LifeSpheres=api;
})(typeof globalThis!=='undefined'?globalThis:this);
