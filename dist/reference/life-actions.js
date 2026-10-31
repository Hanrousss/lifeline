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
function install(){const build=DEC.jobchange.build;DEC.jobchange.build=function(...args){return jobComparison(build.apply(this,args));};}
function adapt(){if(S.pending?.id==='jobchange')jobComparison(S.pending.view);}
root.LifelineLifeActions={educationActions,jobComparison,install,adapt};
})(self);
