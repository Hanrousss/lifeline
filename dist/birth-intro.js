(function(root){
 function prepare(s,year=2023){
  if(!s.origin.birthDate){const days=(Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/86400000;const day=(Math.imul(s.seed>>>0,2654435761)>>>0)%days;s.origin.birthDate=new Date(Date.UTC(year,0,1)+day*86400000).toISOString().slice(0,10);}
  s.birthIntroPending=true;
 }
 function facts(s){return {name:s.origin.name,sex:s.origin.sex==='male'?'Мальчик':'Девочка',country:s.origin.country,date:new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(s.origin.birthDate+'T12:00:00Z')),chance:s.origin.birthProbability,income:({modest:'Невысокий',steady:'Средний',wealthy:'Высокий'})[s.family.wealth]||'Не указан'};}
 const api={prepare,facts};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.BirthIntro=api;
})(typeof globalThis!=='undefined'?globalThis:this);
