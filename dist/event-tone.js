(function(root){
 const labels={bad:'Плохое',warning:'Тревожное',good:'Хорошее',memorable:'Памятное'};
 function describe(event){
  if(labels[event.tone])return {key:event.tone,label:labels[event.tone]};
  const text=String(event.text||'').toLowerCase();let key='';
  // Concrete adverse outcomes outrank warnings and positive context.
  if(/самочувствие ухудшилось|непредвиденный расход|часть людей отказалась иметь с вами дело|впечатление оказалось неприятным|остался с трудностями без вашей помощи/.test(text))key='bad';
  else if(/привычка заметно укрепляется|желание повторить отвлекает|мысль вернуть потраченное|неизвестный состав по-прежнему означал риск|источники напряжения остались|труднее восстановиться|цены на часть повседневных покупок выросли|риск последствий остались/.test(text))key='warning';
  else if(event.type==='goal'||/подготовка завершена|первый небольшой проект завершён|помогли немного восстановиться|удалось найти спокойное занятие|обычные дела снова даются легче|лечение начало уменьшать симптомы|согласованное постепенное завершение лечения закончено|получилось пройти этот эпизод без повторения|пространства для отдыха|разговор сделал этот период теплее|после разговора стало спокойнее и теплее|оказалось, у вас есть общее увлечение/.test(text))key='good';
  else if(event.type==='milestone'||event.type==='choice'||/мама завершила основную работу/.test(text))key='memorable';
  return {key,label:labels[key]||''};
 }
 const api={describe};root.LifeEventTone=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
