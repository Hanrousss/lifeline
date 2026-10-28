(function(root){
// Fictional balance values for testing, never medical probabilities or advice.
const kinds={tobacco:'Сигареты',alcohol:'Алкоголь',lottery:'Лотереи',gambling:'Азартные игры',unknown:'Неизвестные вещества'};
const keyFor=k=>k==='lottery'?'gambling':k;
const cap=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
function ensure(s){if(!s.habits)s.habits={version:1,comfort:0,comfortUntil:0,urges:{tobacco:0,alcohol:0,gambling:0,unknown:0},uses:{tobacco:0,alcohol:0,gambling:0,unknown:0},recent:{tobacco:[],alcohol:[],gambling:[],unknown:[]},cooldowns:{},network:0,active:null,nextOpportunity:Math.max(222,(s.flow?.months||0)+6),lastMonth:s.flow?.months||0,queue:[],care:{symptomMonths:0,severity:0,assessed:false,plan:null,started:null,remission:null,reviewed:false,taper:null,reviewAfter:0}};return s.habits;}
function month(s){return s.flow?.months||s.age*12;}
function vulnerability(s){return Math.round(cap((100-s.stats.joy)*.45+(100-s.stats.energy)*.35+(100-s.stats.bond)*.2));}
function roll(s){s.rng=(Math.imul(1664525,s.rng)+1013904223)>>>0;return s.rng/4294967296;}
function context(s){const v=vulnerability(s);return v>=65?'Последнее время вам тяжело: мало сил, радости или поддержки. Обещание быстро отвлечься звучит особенно заманчиво.':v>=40?'Неделя была непростой. Хочется передышки и ощущения, что вы не одни.':'В вашей жизни есть силы, поддержка и приятные планы. Отказ не оставляет вас без других способов провести вечер.';}
function level(n){return n>=65?'сильная':n>=30?'заметная':'слабая';}
function makeOffer(s,kind){
 const h=ensure(s),v=vulnerability(s),key=keyFor(kind),urge=h.urges[key]||0;
 const options=[{action:'use',title:'Согласиться',desc:'Возможное краткое облегчение; результат и дальнейшие последствия не гарантированы.'},{action:'decline',title:'Отказаться',desc:v>=65?'Отказ доступен, но напряжение сразу не исчезнет.':'Можно сохранить привычный вечер и свои планы.'},{action:'support',title:'Выбрать другую передышку',desc:s.stats.bond>=40?'Позвать близкого человека на прогулку или поговорить.':'Найти спокойное место и доступную поддержку; на это потребуются силы и время.'}];
 const defs={
 tobacco:['Перерыв с компанией','Знакомые выходят поговорить и предлагают сигарету. Хочется остаться частью разговора.','park','Согласиться на сигарету','Возможны короткая передышка и чувство принадлежности к этой компании.'],
 alcohol:['Тяжёлый день позади','Знакомый предлагает выпить вместе: «Может, хоть сегодня получится расслабиться».','family','Выпить с компанией','Возможно краткое облегчение; следующие дни могут оказаться тяжелее.'],
 lottery:['А вдруг повезёт?','По дороге домой попалась реклама лотереи. Мысль о выигрыше ненадолго делает будущее ярче.','home','Купить один билет','Предвкушение сейчас; деньги за билет будут потрачены независимо от результата.'],
 gambling:['Ещё одна попытка','Пришло приглашение сыграть на деньги. '+(h.uses.gambling?'Вспоминается прошлый выигрыш или хочется вернуть потраченное.':'Обещают азарт и возможность выиграть.'),'home','Сыграть на небольшую сумму','Азарт и возможный выигрыш; потраченная ставка может не вернуться.'],
 unknown:['Обещание быстрого облегчения','На встрече знакомый протягивает неизвестную таблетку: «Станет веселее». Вы не знаете, что в ней.','family','Принять неизвестную таблетку','Обещанное облегчение может не наступить; состав и действие неизвестны.']
 };
 if(!defs[kind]||s.age<18||(kind==='unknown'&&v<65))return null;
 const d=defs[kind];options[0].title=d[3];options[0].desc=d[4];
 if(kind==='tobacco'||kind==='alcohol'){options[1].title='Отказаться и остаться общаться';options[1].desc='Отказ не разрывает дружбу. Возможна неловкая пауза.';}
 return {kind:'habit',topic:kind,title:urge>=30?'Снова хочется повторить':d[0],text:d[1],scene:d[2],context:context(s),appeal:level(cap(v*.7+urge*.7)),urge:level(urge),options};
}
function careOffer(s,topic){
 const c=ensure(s).care;let title,text,options;
 if(topic==='assessment'){
  title='Трудности не проходят';text='Уже несколько месяцев обычные дела даются тяжело. По одной шкале настроения нельзя определить болезнь. Можно обратиться за профессиональной оценкой.';
  options=[{action:'assessment',title:'Записаться к специалисту',desc:'Потребуются время и часть средств. Сначала нужно разобраться в состоянии.'},{action:'support',title:'Начать с поддержки и разговора',desc:'Попросить помощи с нагрузкой и не оставаться с трудностями в одиночку.'},{action:'defer',title:'Вернуться к этому позже',desc:'Решение остаётся за вами; трудности могут сохраняться.'}];
 }else if(topic==='treatment'){
  title='План лечения';text='В этой тестовой истории специалист после оценки состояния выявил депрессивный эпизод. Он обсудил психотерапию, поддержку и возможность медикаментозного лечения. Это отдельный сюжет болезни, а не наказание за образ жизни.';
  options=[{action:'combined',title:'Начать согласованный план лечения',desc:'Психотерапия и назначенные антидепрессанты. Улучшение постепенно; возможны побочные эффекты и корректировка.'},{action:'therapy',title:'Обсудить психотерапию без лекарств',desc:'В этой тестовой ситуации специалист согласовал такой вариант с наблюдением.'},{action:'defer',title:'Пока отложить решение',desc:'Можно вернуться к специалисту позже. Поддержка остаётся доступной.'}];
 }else{
  title='Пора пересмотреть лечение';text='Состояние устойчиво улучшилось, лечение продолжалось и после этого. Специалист предлагает вместе решить, что делать дальше. Улучшение не требует немедленной отмены препарата.';
  options=[{action:'continue',title:'Продолжить и наблюдаться',desc:'Сохранить согласованный план и вернуться к вопросу позднее.'},{action:'taper',title:c.plan==='combined'?'Согласовать постепенное завершение':'Согласовать завершение регулярных встреч',desc:'Под наблюдением специалиста; поддержка и наблюдение за состоянием сохраняются.'},{action:'adjust',title:'Обсудить трудности лечения',desc:'Рассказать о побочных эффектах или неудобном расписании и скорректировать план.'}];
 }
 return {kind:'habit',topic,title,text,scene:'read',context:'Лечение снижает симптомы, а не даёт мгновенный универсальный бонус счастья. Оно не повышает тягу к веществам.',options};
}
function offer(s,kind){const h=ensure(s);if(h.active||s.age<18)return false;if(kind==='treatment'&&!h.care.assessed)return false;if(kind==='review'&&!['combined','therapy'].includes(h.care.plan))return false;const o=['assessment','treatment','review'].includes(kind)?careOffer(s,kind):makeOffer(s,kind);if(!o)return false;h.active=o;return true;}
function emit(events,type,text,scene='home'){events.push({type,text,scene});}
function later(s,delay,text,effect={},type='consequence',scene='home'){ensure(s).queue.push({due:month(s)+delay,text,effect,type,scene});}
function resolve(s,index){
 const h=ensure(s),p=h.active,o=p?.options[index];if(!o)return null;
 const now=month(s),v=vulnerability(s),c=h.care,events=[];let note='';h.active=null;
 if(['assessment','treatment','review'].includes(p.topic)){
  c.reviewAfter=now+6;
  if(o.action==='assessment'){s.stats.money-=3;c.assessed=true;later(s,1,'После разговора и оценки состояния специалист предложил обсудить план лечения.',{},'care','read');c.plan='waiting';c.started=now;note='Вы записались на консультацию. Впереди оценка состояния и обсуждение помощи.';}
  else if(o.action==='combined'||o.action==='therapy'){c.plan=o.action;c.started=now;c.severity=Math.max(65,c.severity);c.remission=null;c.reviewed=false;c.taper=null;note='Вы начали согласованное лечение. Его эффект будет оцениваться со временем.';later(s,1,o.action==='combined'?'В первые недели лечения мгновенного облегчения не случилось. Вы обсудили самочувствие со специалистом.':'Первые встречи помогли назвать трудности и договориться о посильных изменениях.',{},'care','read');}
  else if(o.action==='taper'){c.taper=now+3;c.reviewed=true;note='Со специалистом согласован постепенный переход к завершению лечения. Резкой отмены нет.';}
  else if(o.action==='continue'){c.reviewed=false;c.reviewAfter=now+12;note='Вы решили продолжить согласованный план. Новая оценка будет позже.';}
  else if(o.action==='adjust'){c.reviewed=false;c.reviewAfter=now+6;note='Вы обсудили трудности лечения. План скорректирован вместе со специалистом.';}
  else if(o.action==='support'){s.stats.energy-=2;later(s,1,'Вам помогли с частью дел. Появилось немного пространства для отдыха и обращения за помощью.',{energy:4,bond:2},'care','family');note='Вы попросили поддержки. Это не заменяет оценку состояния, но помогает не оставаться одним.';}
  else{note='Вы пока отложили решение. К помощи можно вернуться.';c.reviewAfter=now+6;}
 }else{
  const key=keyFor(p.topic);h.cooldowns[key]=now+(o.action==='use'?6:18);
  if(o.action==='use'){
   h.uses[key]++;h.recent[key]=h.recent[key].filter(m=>now-m<=24);h.recent[key].push(now);
   const unpleasant=roll(s)<(p.topic==='unknown'?.4:.2),relief=unpleasant?0:Math.round(3+v/10);
   h.comfort=relief;h.comfortUntil=now+1;
   // Acute comfort is displayed separately; it never permanently adds joy.
   s.stats.money-=p.topic==='gambling'?5:p.topic==='unknown'?4:2;
   if(p.topic==='tobacco'||p.topic==='alcohol'){s.stats.bond+=1;h.network=cap(h.network+3);}
   h.urges[key]=cap(h.urges[key]+(h.recent[key].length>=2?17:5)+Math.round(v/20));
   note=unpleasant?'Ожидаемого облегчения не получилось. Впечатление оказалось неприятным.':'На короткое время стало легче'+((p.topic==='tobacco'||p.topic==='alcohol')?', и разговор с этой компанией продолжился.':'.');
   if(key==='gambling'){
    const win=roll(s)<.12;if(win){s.stats.money+=p.topic==='gambling'?7:3;note+=' Случился небольшой выигрыш. Это не меняет риска потерять деньги при следующей попытке.';}else note+=' В этот раз выигрыша нет.';
    later(s,1,win?'Небольшой выигрыш вспоминается чаще, чем стоимость прошлых попыток. Это ощущение не повышает шанс следующего выигрыша.':'Мысль вернуть потраченное появилась снова. Новая ставка не гарантирует возврата денег.');
   }else if(p.topic==='unknown'){
    const bad=roll(s)<.5;later(s,1,bad?'После неизвестной таблетки самочувствие ухудшилось. Вы обратились за медицинской помощью.':'Приятное ощущение не удержалось. Неизвестный состав по-прежнему означал риск.',bad?{health:-7,energy:-5,money:-3}:{energy:-3});
   }else later(s,1,p.topic==='alcohol'?'На следующий день было труднее восстановиться. Временная передышка не решила накопившиеся трудности.':'Перерыв закончился. Источники напряжения остались прежними.',p.topic==='alcohol'?{energy:-4}:{health:-1});
   if(h.recent[key].length>=2)emit(events,'habit','Схожие ситуации всё чаще вызывают желание повторить. Это пока не диагноз, но привычка заметно укрепляется.');
  }else if(o.action==='decline'){
   note=(p.topic==='tobacco'||p.topic==='alcohol')?'Вы отказались и остались в разговоре. Дружба не исчезла из-за этого решения.':'Вы отказались. Предложение осталось предложением.';
   if(v>=65||h.urges[key]>=30){s.stats.energy-=3;note+=' Решение потребовало усилия; напряжение не исчезло сразу.';}
   later(s,1,'У вас получилось пройти этот эпизод без повторения. Желание можно переждать, а поддержку — искать снова.',{energy:1});
  }else{
   s.stats.energy-=v>=65?4:2;note='Вы выбрали другую передышку. На неё понадобились силы и время.';
   later(s,1,s.stats.bond>=40?'Разговор с близким и спокойная прогулка помогли немного восстановиться.':'Удалось найти спокойное занятие и доступную поддержку. Стало немного легче.',{joy:3,energy:4},'care','park');
  }
 }
 for(const k of Object.keys(s.stats))s.stats[k]=Math.round(cap(s.stats[k]));
 return {note,title:o.title,events,scene:p.scene};
}
function tick(s){
 const h=ensure(s),now=month(s),events=[];if(now<=h.lastMonth)return events;h.lastMonth=now;
 if(now>=h.comfortUntil)h.comfort=0;
 const due=h.queue.filter(q=>q.due<=now);h.queue=h.queue.filter(q=>q.due>now);
 for(const q of due){for(const [k,v]of Object.entries(q.effect))s.stats[k]=cap(s.stats[k]+v);emit(events,q.type,q.text,q.scene);}
 if(s.age<18)return events;
 const v=vulnerability(s),c=h.care;
 if(now%3===0){for(const key of Object.keys(h.urges)){const recent=h.recent[key].some(m=>now-m<6);if(!recent)h.urges[key]=cap(h.urges[key]-(v>=65?1:3));if(h.urges[key]>=45&&recent){s.stats.energy=cap(s.stats.energy-1);s.stats.money=cap(s.stats.money-1);emit(events,'habit','Желание повторить отвлекает от обычных дел. Можно выбрать поддержку и другой распорядок.');}}}
 if(v>=65&&!c.plan)c.symptomMonths++;else if(!c.plan)c.symptomMonths=Math.max(0,c.symptomMonths-1);
 if(c.plan==='waiting'&&now>c.started&&!h.active)h.active=careOffer(s,'treatment');
 if(c.plan==='combined'||c.plan==='therapy'){
  const elapsed=now-c.started;
  if(elapsed>=(c.plan==='combined'?2:3)){
   const previous=c.severity;c.severity=cap(c.severity-7);
   if(previous>15){if(s.stats.joy<70)s.stats.joy=Math.min(70,s.stats.joy+3);if(s.stats.energy<75)s.stats.energy=Math.min(75,s.stats.energy+2);}
   if(elapsed===2&&c.plan==='combined')emit(events,'care','В этой истории лечение начало уменьшать симптомы. Эффект оценивают со специалистом; у разных людей ответ может отличаться.','read');
   if(c.severity<=15&&c.remission===null){c.remission=now;emit(events,'care','Обычные дела снова даются легче. Улучшение ещё не означает, что лечение пора сразу прекращать.','park');}
  }
  if(c.taper!==null&&now>=c.taper){c.plan='maintenance';c.taper=null;emit(events,'care','Согласованное постепенное завершение лечения закончено. Поддержка и наблюдение за состоянием продолжаются.','read');}
  else if(c.remission!==null&&now-c.remission>=6&&!c.reviewed&&now>=c.reviewAfter&&!h.active){h.active=careOffer(s,'review');}
 }
 if(!h.active&&c.symptomMonths>=6&&!c.plan&&now>=c.reviewAfter){h.active=careOffer(s,'assessment');return events;}
 if(!h.active&&now>=h.nextOpportunity){
  h.nextOpportunity=now+6+Math.floor(roll(s)*7);
  if(roll(s)<.55){
   const pool=['tobacco','alcohol','lottery','gambling'];
   if(h.uses.gambling)pool.push('gambling');
   if(v>=65)pool.push('unknown');
   const k=pool[Math.floor(roll(s)*pool.length)],key=keyFor(k);
   if((h.cooldowns[key]||0)<=now)offer(s,k);
  }
 }
 return events;
}
function pending(s){return ensure(s).active;}
root.LifeHabits={ensure,vulnerability,context,makeOffer,offer,resolve,tick,pending,kinds,keyFor};if(typeof module!=='undefined')module.exports=root.LifeHabits;
})(typeof window!=='undefined'?window:globalThis);
