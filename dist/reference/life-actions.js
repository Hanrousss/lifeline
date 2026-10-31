/* Lifeline presentation and availability adapters; upstream rules remain authoritative. */
(function(root){
'use strict';
function educationReason(id){
 if(S.phase!=='life')return 'Жизнь завершена';
 if(S.age<16)return 'Доступно с 16 лет';
 if(S.job==='prison')return 'Недоступно во время заключения';
 if(S.serveLeft>0||svcAway())return 'Сначала завершите службу';
 if(S.refugee)return 'Сначала нужно устроиться на новом месте';
 if(talibanF())return 'В вашей текущей ситуации обучение ограничено';
 if(S.school)return 'Вы уже учитесь — сначала завершите текущую программу';
 if(id==='ged'){if(S.edu>=3)return 'Среднее образование уже получено';if(S.age>=85)return 'Эта программа доступна до 85 лет';if(S.flags.gedAt!=null)return 'Подготовка уже идёт';}
 if(id==='nightuni'||id==='openuni'){
  if(S.edu<3)return 'Сначала получите среднее образование';if(S.edu>=4)return 'Высшее образование уже получено';
  if(S.flags.nightUni||S.flags.openUni)return 'Обучение в университете уже идёт';
  if(id==='nightuni'&&(S.age<20||S.age>=50))return 'Вечерний университет доступен с 20 до 49 лет';
  if(id==='openuni'&&(S.age<50||S.age>75))return 'Эта программа доступна с 50 до 75 лет';
  if(id==='openuni'&&!openUniOK())return 'Открытый университет недоступен в текущей стране или ситуации';
 }
 if(id==='nightgrad'){if(S.edu<4)return 'Нужен диплом университета';if(S.edu>4)return 'Магистратура уже пройдена';if(S.age<24||S.age>=70)return 'Доступно с 24 до 69 лет';if(S.flags.nightGrad)return 'Обучение в магистратуре уже идёт';if(!isWorking()&&!S.retired)return 'Нужна работа или статус пенсионера';if(inOffice())return 'Недоступно во время исполнения государственных обязанностей';}
 return 'Не выполнены условия программы в текущей жизненной ситуации';
}
function educationActions(existing){
 const names={ged:'Закончить школу',nightuni:'Университет — вечернее обучение',openuni:'Открытый университет',nightgrad:'Магистратура'};
 return Object.entries(names).filter(([id])=>!existing.some(a=>a.id===id||a.id.startsWith(id+'@'))).map(([id,title])=>({id,title,disabled:true,reason:educationReason(id),cost:0}));
}
function jobComparison(view){if(!view)return view;const now=payNow(),name=id=>text(JOBS[id]?.n||id),income=n=>usdStr(n)+' в год · '+usdStr(n/12)+' в месяц';
 view.jobComparison={current:{name:name(S.job),income:income(now),formal:S.formal?'Официальная':'Неофициальная',tenure:S.jobY+' лет на этом месте'},offers:(S.flags.offers||[]).map((offer,i)=>({key:'o'+i,name:name(offer.id),income:income(offerInc(offer)),formal:offer.formal?'Официальная':'Неофициальная',tenure:'Новое место · стаж здесь начинается заново',change:Math.round((offerInc(offer)/Math.max(1,now)-1)*100),exam:!!offer.exam}))};
 view.choices.forEach(choice=>{const offer=view.jobComparison.offers.find(o=>o.key===choice.k);if(offer&&!offer.exam)choice.sub=(offer.change>=0?'+':'')+offer.change+'% к текущему доходу';});return view;
}
function familyBonds(){const f=S.fam,b=S.lifelineFamily||(S.lifelineFamily={bonds:{mom:Math.round(f.mom?.bond??S.st.so),dad:Math.round(f.dad?.bond??S.st.so)},lastLove:null});return b;}
function loveTargets(){const f=S.fam,b=familyBonds(),alive=['mom','dad'].filter(k=>f[k]?.alive&&!f[k].absent),strong=alive.length===2&&f.dad.sep==null&&S.lifelineChildCare?.tone!=='harsh';return strong?alive:alive.sort((a,c)=>(b.bonds[c]||0)-(b.bonds[a]||0)).slice(0,1);}
function installThanks(){DEC.thanks.build=()=>{const targets=loveTargets();return {title:'Сказать, что любите',body:'Вы давно не говорили родителям, что любите их.',choices:[{k:'call',label:targets.length===2?'Позвонить родителям':targets[0]==='dad'?'Позвонить папе':'Позвонить маме',sub:targets.length===2?'Поговорить с обоими вместе':''},{k:'next',label:'Не звонить сейчас'}]};};DEC.thanks.apply=key=>{if(key!=='call'){S.flags.thanksLater=1;return {t:'Вы решили пока не звонить родителям.',k:'note'};}const b=familyBonds(),targets=loveTargets();if(!targets.length)return false;S.flags.saidThanks=1;b.lastLove=S.age;const lines=targets.map(k=>{const good=b.bonds[k]>=45,n=k==='dad'?'Папа':'Мама';b.bonds[k]=Math.min(100,b.bonds[k]+(good?5:2));return good?n+' тепло ответил'+(k==='mom'?'а':'')+': «Я тоже тебя люблю».':n+' помолчал'+(k==='mom'?'а':'')+'. Между вами пока остаётся напряжение.';});eff({so:3,h:targets.some(k=>b.bonds[k]>=45)?4:1});return {t:(targets.length===2?'Вы позвонили обоим родителям. ':'')+lines.join(' '),k:targets.every(k=>b.bonds[k]>=45)?'warm':'note'};};}
function installParenting(){const build=DEC.discipline.build,apply=DEC.discipline.apply;DEC.discipline.build=function(p){const view=build(p),cost=med()*.002;for(const c of view.choices){if(c.k==='talk'){c.label='Обсудить и договориться';c.sub='Потребует сил · результат не всегда сразу';}if(c.k==='calm'){c.label='Взять паузу';c.sub='Быстрее успокоиться · разговор останется';}}view.choices.splice(2,0,{k:'lifeline-give-in',label:'Уступить и купить желаемое',sub:'Тишина сейчас · '+wonStr(cost),dis:S.money<cost},{k:'lifeline-ground',label:'Отменить развлечения на неделю',sub:'Меньше спора сейчас · риск обиды'});return view;};DEC.discipline.apply=function(key,p){const kid=S.fam.kids[p.i];if(!kid||!kid.alive)throw Error('Ребёнок сейчас недоступен');if(key==='lifeline-give-in'){const cost=med()*.002;if(S.money<cost)throw Error('Недостаточно денег');S.money-=cost;book('Покупка по просьбе ребёнка',-cost);eff({h:3});kid.lifelineBoundary={style:'give-in',due:S.age+1};return {t:'Вы уступили и купили желаемое. Дома сразу стало тихо, но о правиле вы так и не договорились.',k:'note'};}if(key==='lifeline-ground'){kid.bd=(kid.bd||0)-2;eff({h:1});kid.lifelineBoundary={style:'ground',due:S.age+1};return {t:'Вы отменили развлечения на неделю. Спор прекратился, но ребёнок обиделся.',k:'note'};}if(key==='talk')eff({h:-2});if(key==='calm')kid.lifelineBoundary={style:'pause',due:S.age+1};return apply(key,p);};}
function observeParenting(){for(const kid of S.fam.kids){const b=kid.lifelineBoundary;if(!kid.alive||!b||b.settled||S.age<b.due)continue;b.settled=true;if(!chance(b.style==='pause'?.3:.6))continue;kid.bd=(kid.bd||0)-(b.style==='give-in'?2:1);log(b.style==='give-in'?'После прошлых уступок ребёнок стал чаще проверять границы. Вы снова обсуждаете, о чём можно договориться.':b.style==='ground'?'Ребёнок всё ещё вспоминает наказание с обидой. Чтобы наладить отношения, нужен разговор.':'После паузы разговор о правилах так и не состоялся. Семье пришлось вернуться к нему позже.','note');}}
let airData=null;
function setAirData(data){airData=data;}
function decorateLog(raw){for(const row of raw.log||[]){if(!/Плохой воздух|загрязн|мелкодисперс|PM2\.5|смог|мелких частиц|воздух.*перш|щипало глаза/i.test(row.text+' '+(row.fact||'')))continue;const country=row.country||(raw.years||[]).filter(y=>y.a<=row.a&&y.cur).at(-1)?.cur||raw.born,record=airData?.countries?.[country];if(record){row.air={country:text(CBY[country]?.ko||country),value:record.value,year:record.year,source:airData.sourcePage};row.fact='Всемирный банк: среднегодовой уровень частиц PM2.5, взвешенный по населению, — '+record.value+' мкг/м³ ('+record.year+' г., '+row.air.country+'). Рекомендация ВОЗ 2021 года для среднегодового уровня — 5 мкг/м³. Среднее по стране не показывает число плохих дней в конкретном городе. Событие в игре — иллюстрация риска, а не сводка погоды.';}}return raw;}
function install(){installThanks();installParenting();const build=DEC.jobchange.build;DEC.jobchange.build=function(...args){return jobComparison(build.apply(this,args));};}
function adapt(){if(S.pending?.id==='jobchange')jobComparison(S.pending.view);}
root.LifelineLifeActions={observeParenting,setAirData,decorateLog,educationActions,jobComparison,familyBonds,loveTargets,install,adapt};
})(self);
