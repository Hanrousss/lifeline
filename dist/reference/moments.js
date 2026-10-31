/* Lifeline-only journal moments. The supplied upstream client remains unchanged. */
(function(root){
'use strict';
function state(){return S.lifelineMoments||(S.lifelineMoments={version:1,queue:[],active:null,capsule:null});}
const clock=()=>S.age+(S.t||0);
function enqueue(id,view){const m=state();if(m.active?.id===id||m.queue.some(item=>item.id===id))return;m.queue.push({id,view});promote();}
function promote(){const m=state();if(!m.active&&m.queue.length)m.active=m.queue.shift();}
function journal(question,value){const note=String(value||'').trim().slice(0,600);if(!note)return;S.journal=S.journal||[];S.journal.push({a:S.age,q:question,t:note});log(question+' «'+note+'»','note');}
const CAREERS={creative:{label:'Творчество',jobs:['artist','musician','actor','writer','creator','idol','designer','journalist','hair'],hobbies:['music','dance','drawing','art','writing','photo']},science:{label:'Наука и технологии',jobs:['dev','engineer','scientist','prof','astro','tech'],hobbies:['reading','games','coding','science']},care:{label:'Помогать людям',jobs:['doctor','nurse','teacher','social','civil','care','childcare','healthtech','clergy'],hobbies:['faith','volunteer']},practical:{label:'Практическое дело',jobs:['farm','farmhand','herder','fisher','construct','factory','craft','cook','driver','mechanic','artisan','haenyeo','agbiz','garment','miner','electric','domestic','delivery','guard','cleaner','warehouse','welder','pilot','cabin','seafarer'],hobbies:['fishing','cooking','gardening','craft']},business:{label:'Бизнес и общение',jobs:['biz','finance','manager','sales','clerk','lawyer','owner','vendor','shop','callc','salesagent','dealer','mp','leader'],hobbies:['sns']},sport:{label:'Спорт',jobs:['athlete','coach','soldier','police','trainer'],hobbies:['sport']}};
function careerGroup(job){return Object.keys(CAREERS).find(k=>CAREERS[k].jobs.includes(job))||'other';}
function capsuleQuestions(){
 const score=Object.fromEntries(Object.keys(CAREERS).map(k=>[k,0]));
 for(const hobby of S.hobbies||[])for(const [id,c] of Object.entries(CAREERS))if(c.hobbies.some(h=>hobby.id===h||hobby.id.startsWith(h+'_')))score[id]+=2+(hobby.lv||0);
 if(S.focus==='study'||S.focus==='mind')score.science++;if(S.focus==='hobby')score.creative++;if(S.focus==='family')score.care++;if(S.focus==='work')score.business++;
 const careers=Object.keys(CAREERS).sort((a,b)=>score[b]-score[a]).slice(0,3);
 const yn=[{id:'yes',label:'Да'},{id:'unsure',label:'Не знаю'},{id:'no',label:'Нет'}];
 return [{id:'career',title:'В какой сфере вы будете работать?',options:careers.map(id=>({id,label:CAREERS[id].label})).concat({id:'other',label:'Другое'})},{id:'couple',title:'У вас будет любимый человек?',options:yn},{id:'children',title:'У вас будут дети?',options:yn},{id:'abroad',title:'Вы будете жить в другой стране?',options:yn},{id:'stable',title:'Вы будете финансово самостоятельны?',options:yn}];
}
function capsuleInvitation(){return {title:'Капсула времени',body:'Последний день школы. Одноклассники закапывают капсулу. Оставьте свои прогнозы — через 10 лет сравним их с жизнью.',quiz:state().capsule.questions,choices:[{k:'bury',label:'Закопать капсулу'},{k:'skip',label:'Не участвовать'}]};}
function graduation(){const m=state();if(m.capsule)return;m.capsule={status:'invited',at:clock(),age:S.age,country:S.cur,questions:capsuleQuestions()};enqueue('lifeline-capsule-bury',capsuleInvitation());}
function compareCapsule(c){
 const partner=S.fam.dating||(S.fam.married&&S.fam.partner?.alive!==false&&!S.fam.partner?.divorced),values={career:careerGroup(S.job),couple:!!partner,children:S.fam.kids.some(k=>!k.sk),abroad:S.cur!==c.country,stable:netWorth()>=0&&S.income>=incomeAt(C(),.3)},rows=[];
 for(const question of c.questions){const answer=c.answers[question.id];if(answer==='unsure')continue;let actual=values[question.id],match;
  if(question.id==='career'){if(!question.options.some(o=>o.id===actual))actual='other';match=answer===actual;}else match=(answer==='yes')===actual;
  rows.push({id:question.id,title:question.title,expected:question.options.find(o=>o.id===answer).label,actual:question.id==='career'?(CAREERS[values.career]?.label||'Другое'):(actual?'Да':'Нет'),match});
 }
 const matched=rows.filter(r=>r.match).length,ratio=rows.length?matched/rows.length:null,verdict=ratio===null?'unsure':ratio>=.8?'yes':ratio>=.4?'partly':'different',effect={yes:6,partly:3,different:-3,unsure:0}[verdict],label={yes:'Мечта сбылась',partly:'На полпути',different:'Пока что жизнь сложилась иначе',unsure:'Будущее было открыто'}[verdict];
 return {rows,matched,total:rows.length,ratio,verdict,effect,label};
}
function capsuleReturn(c,now){if(!c.answers)return {title:'Письмо из прошлого',body:'Прошло 10 лет. Тогда вы написали: «'+c.text+'»\n\n'+now,q:'Как сложилась жизнь по сравнению с вашим письмом?',choices:[{k:'yes',label:'Всё сбылось'},{k:'partly',label:'Частично сбылось'},{k:'different',label:'Пока что жизнь сложилась иначе'}]};
 const r=c.comparison=compareCapsule(c);return {title:'Капсула времени: 10 лет спустя',body:r.label+'. Совпало '+r.matched+' из '+r.total+' прогнозов.'+(r.total<c.questions.length?' Ответы «Не знаю» не оценивались.':''),comparison:r.rows,choices:[{k:'continue',label:'Продолжить',sub:(r.effect>0?'+':'')+r.effect+' счастья'}]};
}
function capture(){return {kids:S.fam.kids.length,marriages:S.fam.marriages||0};}
function observe(before){const m=state();if(S.phase!=='life')return;
 if(before&&(S.fam.marriages||0)>before.marriages)enqueue('lifeline-wedding-'+S.fam.marriages,{title:'День свадьбы',body:'Этот день останется частью вашей общей истории.',photo:true,note:{max:60,placeholder:'Название снимка'},choices:[{k:'write',label:'Сохранить снимок'},{k:'skip',label:'Продолжить'}]});
 const babies=before?S.fam.kids.slice(before.kids).filter(k=>k.alive&&!k.sk&&k.bornAt===S.age):[];
 if(babies.length)enqueue('lifeline-birth-'+before.kids+'-'+S.age,{title:'Рождение ребёнка',body:babies.length>1?'В вашей семье родились малыши. Начинается новая глава.':'В вашей семье родился ребёнок. Начинается новая глава.',photo:true,note:{max:60,placeholder:'Название снимка'},choices:[{k:'write',label:'Сохранить снимок'},{k:'skip',label:'Продолжить'}]});
 if(m.capsule?.status==='buried'&&clock()+1e-8>=m.capsule.dueAt){m.capsule.status='ready';const now='Сейчас вам '+S.age+' лет. '+(JOBS[S.job]?.n||S.job||'')+'. '+C().ko+'. '+(S.fam.married?'Вы в браке. ':'')+'Детей: '+S.fam.kids.filter(k=>k.alive).length+'.';m.capsule.actual=now;enqueue('lifeline-capsule-open',capsuleReturn(m.capsule,now));}
 promote();
}
function settle(){if(S.pending?.id==='reflect'){choose('skip');}const m=state();for(const item of [m.active,...m.queue].filter(Boolean))if(/^lifeline-(birth|wedding)-/.test(item.id)){delete item.view.q;item.view.photo=true;item.view.note={max:60,placeholder:'Название снимка'};item.view.choices=[{k:'write',label:'Сохранить снимок'},{k:'skip',label:'Продолжить'}];}if(m.active?.id==='lifeline-capsule-bury'&&!m.active.view.quiz){m.capsule.country=S.cur;m.capsule.questions=capsuleQuestions();m.active.view=capsuleInvitation();}observe();}
function resolve(key,extra){const m=state(),item=m.active;if(!item)return false;if(!item.view.choices.some(c=>c.k===key))throw new Error('Unavailable choice');const value=String(extra||'').trim().slice(0,2000);
 if(item.id==='lifeline-capsule-bury'){if(key==='bury'){let answers;try{answers=JSON.parse(value);}catch{}if(!answers||!m.capsule.questions.every(q=>q.options.some(o=>o.id===answers[q.id])))throw new Error('Ответьте на все вопросы или выберите «Не участвовать».');Object.assign(m.capsule,{status:'buried',answers,dueAt:m.capsule.at+10});log('Вы закопали школьную капсулу с пятью прогнозами о будущем.','note');}else{m.capsule.status='declined';log('В последний день школы вы решили не участвовать в капсуле времени.','note');}}
 else if(item.id==='lifeline-capsule-open'&&m.capsule.comparison){const r=m.capsule.comparison,previous=S.st.h;S.st.h=Math.max(0,Math.min(100,S.st.h+r.effect));Object.assign(m.capsule,{status:'opened',openedAt:clock(),verdict:r.verdict,result:{label:r.label,happiness:S.st.h-previous,effect:r.effect}});log('Вы открыли школьную капсулу. '+r.label+'. Совпало '+r.matched+' из '+r.total+' прогнозов. '+r.rows.map(row=>row.title+' Ожидание: '+row.expected+'; сейчас: '+row.actual+'.').join(' '),r.effect<0?'bad':'warm');}
 else if(item.id==='lifeline-capsule-open'){const verdict={yes:'Всё сбылось',partly:'Частично сбылось',different:'Пока что жизнь сложилась иначе'}[key];const effect={yes:6,partly:3,different:-3}[key],label={yes:'Мечта сбылась',partly:'На полпути',different:'Другой путь'}[key],previous=S.st.h;S.st.h=Math.max(0,Math.min(100,S.st.h+effect));Object.assign(m.capsule,{status:'opened',openedAt:clock(),verdict:key,result:{label,happiness:S.st.h-previous,effect}});log('Вы открыли школьную капсулу времени. Ваше письмо: «'+m.capsule.text+'» '+m.capsule.actual+' Ваш итог: '+verdict+'. Статус: '+label+' ('+(effect>0?'+':'')+effect+' счастья).',effect>0?'warm':'bad');}
 else if(key==='write')journal(item.view.title,item.view.photo?value.slice(0,60):value);
 m.active=null;promote();return true;
}
function pregnancyPolicy(){const code=ABL_C[S.cur];return {allowed:code===1||code===2,reason:code===5?'В вашей стране запрещено':code===3||code===4?'Недоступно без медицинских оснований':code===6?'Доступность зависит от региона':'Нет данных о доступности',fact:code?ablFact(S.cur):''};}
function householdShare(){const partner=S.fam.partner,together=!!(S.fam.married&&partner?.alive!==false&&partner&&!partner.divorced&&!ptAway()&&S.job!=='prison'),saving=together&&S.income>0&&partner.inc>0?Math.max(0,Math.min(incomeAt(C(),.5)*.3*.4*.5,S.income*.1,partner.inc*.1)):0;return {together,saving,partnerIncome:together?Math.max(0,partner.inc||0):0};}
function installPregnancyAndBudget(){
 const build=DEC.datepreg.build,apply=DEC.datepreg.apply;
 DEC.datepreg.build=function(...args){const view=build.apply(this,args),policy=pregnancyPolicy();view.choices.push({k:'lifeline-abortion',label:S.sex==='F'?'Прервать беременность':'Обсудить прерывание беременности',sub:policy.allowed?'':policy.reason,dis:!policy.allowed,warning:!policy.allowed});view.fact=[view.fact,policy.fact].filter(Boolean).join(' ');return view;};
 DEC.datepreg.apply=function(key,...args){if(key!=='lifeline-abortion')return apply.call(this,key,...args);if(!pregnancyPolicy().allowed)throw Error('Этот выбор недоступен в вашей стране');S.stats.lifelineAbortions=(S.stats.lifelineAbortions||0)+1;return {t:S.sex==='F'?'Вы решили прервать беременность.':'Вы вместе обсудили ситуацию и приняли решение прервать беременность.',k:'note'};};
 const original=finances;finances=function(...args){const result=original.apply(this,args),share=householdShare();S.lifelineHousehold=share;if(share.saving>0&&S.phase==='life'){S.money+=share.saving;book('Экономия на общих бытовых расходах',share.saving);}return result;};
}
function retirementContext(){
 const worth=netWorth(),liquid=Math.max(0,S.money-sovOwe()),cost=incomeAt(C(),.5)*.3*(S.fam.married?.6:1)*oldShare(),pension=Math.max(0,S.flags.retPen||S.pension||0),gap=Math.max(0,cost-pension);
 const note=liquid>=cost*20?'Накопления дают большую финансовую подушку — вы не зависите только от пенсии.':worth>cost*20&&liquid<cost*3?'Значительная часть состояния — имущество и другие активы. Это не то же самое, что деньги для повседневных расходов.':gap===0?'По текущей оценке пенсия покрывает основные расходы.':liquid>=gap?'Накопления могут покрывать разницу между пенсией и расходами.':'Без дополнительных доходов или накоплений бюджет после выхода на пенсию будет ограничен.';
 return 'Общее состояние: '+usdStr(worth)+' PPP. Доступные накопления: '+usdStr(liquid)+' PPP. '+note;
}
function installRetirement(){const build=DEC.retire.build;DEC.retire.build=function(...args){const view=build.apply(this,args),context=retirementContext(),pattern=/На пенсию(?: и то, что присылают дети,)? можно прожить, если экономить\./;view.body=pattern.test(view.body)?view.body.replace(pattern,context):view.body+'\n\n'+context;return view;};}
function certificate(){
 if(S.phase!=='dead')return null;
 const places=[{id:S.born,from:0}],years=S.years||[];for(const year of years)if(year.cur&&year.cur!==places.at(-1).id)places.push({id:year.cur,from:year.a});if(S.cur!==places.at(-1).id)places.push({id:S.cur,from:S.age});
 const spouses=[...(S.flags.exs||[]).map(p=>p.n),S.flags.exP?.name?.full,S.fam.partner?.name?.full].filter(Boolean),hardships=(S.log||[]).filter(row=>['bad','loss'].includes(row.kind)&&row.a<S.age);
 return {name:S.name.full,age:S.deathAt?.age??S.age,birthCountry:CBY[S.born]?.ko||S.born,residences:places.map((p,i)=>({name:CBY[p.id]?.ko||p.id,from:p.from,to:places[i+1]?.from??S.age})),marriages:S.fam.marriages||0,spouses:[...new Set(spouses)],children:S.fam.kids.filter(k=>!k.sk).length,income:years.reduce((sum,y)=>sum+Math.max(0,y.inc||0),0),peakIncome:S.stats.maxIncome||Math.max(0,...years.map(y=>y.inc||0)),netWorth:netWorth(),hardships:hardships.slice(-10).map(row=>({age:row.a,text:row.text})),hardshipCount:hardships.length,cause:S.deathAt?.label||'Причина не указана',where:CBY[S.deathAt?.where||S.cur]?.ko||S.cur};
}
function installDating(){
 const build=DEC.partner.build,apply=DEC.partner.apply;
 DEC.partner.build=function(...args){
  const view=build.apply(this,args),candidate=S.flags.cand;
  if(!candidate||candidate.arr||S.fam.married||S.fam.dating)return view;
  const name=callName(candidate.name),hash=[...String(candidate.name?.full||name)].reduce((n,c)=>n+c.codePointAt(0),S.age);
  candidate.lifelineOffer=hash%2?'incoming':'outgoing';
  return {...view,lifelineDating:true,title:hash%2?'Вам предложили встречаться':'Предложить встречаться?',body:view.body+'\n\n'+(hash%2?name+' предлагает стать парой.':'Вы чувствуете симпатию. Хотите предложить '+name+' стать парой?'),choices:[{k:'lifeline-date-yes',label:'Да'},{k:'lifeline-date-no',label:'Нет'},{k:'lifeline-date-friends',label:'Остаться друзьями'}]};
 };
 DEC.partner.apply=function(key,...args){
  if(!key.startsWith('lifeline-date-'))return apply.call(this,key,...args);
  const candidate=S.flags.cand;
  if(!candidate?.lifelineOffer)throw new Error('Unavailable relationship choice');
  if(key==='lifeline-date-yes')return apply.call(this,'date',...args);
  if(key==='lifeline-date-no')return apply.call(this,'no',...args);
  if(key!=='lifeline-date-friends')throw new Error('Unavailable relationship choice');
  const friends=S.lifelineFriends||(S.lifelineFriends=[]),name=callName(candidate.name);
  if(!friends.some(p=>p.name.full===candidate.name.full))friends.push({...candidate,since:S.age,kind:'friend'});
  S.flags.cand=null;
  return {t:'Вы и '+name+' решили остаться друзьями.',k:'warm'};
 };
}
function install(){installRetirement();installDating();installPregnancyAndBudget();HOOK.noPause=()=>true;reflectQuiet=()=>{};const original=graduate;graduate=function(...args){const school=S?.school,result=original(...args);if(['usec','voc'].includes(school)&&S.flags.justGrad===school)graduation();return result;};}
root.LifelineMoments={certificate,pregnancyPolicy,householdShare,install,settle,capture,observe,pending:()=>state().active,resolve};
})(self);
