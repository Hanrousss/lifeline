(function(root){
// All pay, requirements and durations here are authored prototype values.
const fields={code:{name:'Разработка',scene:'work',titles:['Начинающая разработчица','Разработчица','Старшая разработчица'],degree:false},design:{name:'Дизайн',scene:'draw',titles:['Младшая дизайнерка','Дизайнерка','Ведущая дизайнерка'],degree:false},trade:{name:'Ремесло и ремонт',scene:'repair',titles:['Помощница мастера','Мастер по ремонту','Опытный мастер'],degree:false},service:{name:'Сервис и продажи',scene:'work',titles:['Помощница в магазине','Специалист по работе с клиентами','Старший специалист'],degree:false},education:{name:'Образование',scene:'school',titles:['Помощница педагога','Педагог','Опытный педагог'],degree:true},care:{name:'Социальная помощь',scene:'family',titles:['Помощница в центре поддержки','Социальный работник','Старший социальный работник'],degree:true}};
const cap=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const now=s=>s.flow.months;
function ensure(s){const c=s.flow.career;if(!c.version){Object.assign(c,{version:1,active:null,currentJob:null,experience:{code:0,design:0,trade:0,service:0,education:0,care:0},qualifications:[],interests:[],training:null,desiredField:c.field||'service',lastMonth:now(s),nextReview:now(s)+18,searchAfter:0,serial:0,transferCredits:{},seen:[],project:null,goal:null,completedGoals:[]});
 if(s.age>=17&&c.job&&!/Студент|поиск|Поиск|не выбрано|Пенсия/.test(c.job)){const f=fields[c.field]?c.field:/мастер/i.test(c.job)?'trade':'service';c.currentJob=job(f,0,'balanced',++c.serial);c.currentJob.title=c.job;c.experience[f]=Math.max(0,(s.age-18)*6);}
 if(s.age>=17&&c.route==='education'&&!s.flow.graduated)c.training={field:c.desiredField,remaining:Math.max(1,(20-s.age)*12),total:36,kind:'degree'};
 if(s.flow.graduated&&c.route==='education')c.qualifications.push(c.desiredField);
 if(s.age>=18)c.seen.push('school');if(s.age>=20)c.seen.push('internship');
 }return c;}
function rand(s){s.rng=(Math.imul(1664525,s.rng)+1013904223)>>>0;return s.rng/4294967296;}
function job(field,grade,profile,serial){const p={balanced:{pay:5,hours:36,commute:20,load:43,team:'поддерживающий',employer:'Небольшая команда'},intense:{pay:8,hours:46,commute:55,load:78,team:'соревновательный',employer:'Крупная организация'},flexible:{pay:3,hours:22,commute:10,load:32,team:'спокойный',employer:'Местная организация'}}[profile];return {id:field+'-'+serial,field,grade,title:fields[field].titles[Math.min(grade,2)],...p,pay:p.pay+grade*2,role:'specialist',self:false};}
function eligible(s,j){const c=ensure(s);return s.age>=18&&(!fields[j.field].degree||j.grade===0||c.qualifications.includes(j.field))&&c.experience[j.field]>=j.grade*18;}
function describe(j){return `${j.employer} · ${j.pay} усл. ед./квартал · ${j.hours} ч/нед. · дорога ${j.commute} мин в одну сторону · нагрузка ${j.load}/100 · коллектив ${j.team}`;}
function make(s,topic){const c=ensure(s),field=fields[c.desiredField]?c.desiredField:'service';let title,text,options,scene='work';
 if(topic==='school'||topic==='field'||topic==='retrain'){
  title=topic==='school'?'Попробовать занятие':topic==='retrain'?'В какую сторону переучиваться?':'Выбрать направление обучения';text=topic==='school'?'Есть возможность попробовать короткое занятие. Необязательно сразу выбирать профессию.':'Можно выбрать направление. При переобучении текущая работа и прошлый опыт сохранятся; на учёбу понадобятся время и средства.';scene='read';
  options=Object.entries(fields).map(([key,f])=>({action:'field',field:key,title:f.name,desc:topic==='school'?'Небольшая проба: узнать, нравится ли само занятие.':f.degree?'В тесте требуется длительная подготовка; квалификация сохранится после завершения.':'Курс или практика с небольшим проектом.'}));
  if(topic==='retrain')options.push({action:'stay',title:'Пока сохранить направление',desc:'Вернуться к вопросу позже.'});
 }else if(topic==='jobs'){
  title=c.currentJob?'Предложения другой работы':'Сравнить предложения работы';text='Сравните условия. Можно сохранить нынешнюю работу или продолжить поиск; самая высокая оплата не обязана быть лучшим вариантом.';
  const grade=Math.min(2,Math.floor(c.experience[field]/18));
  options=['balanced','intense','flexible'].map(profile=>{const j=job(field,grade,profile,++c.serial);if(fields[field].degree&&!c.qualifications.includes(field))j.grade=0,j.title=fields[field].titles[0];return {action:'take',job:j,title:j.title+' · '+j.employer,desc:describe(j)};});
  options.push({action:'stay',title:c.currentJob?'Остаться на нынешней работе':'Продолжить поиск',desc:'Ни одно предложение не подходит. Новую подборку можно запросить через три игровых месяца.'});
 }else if(topic==='promotion'){
  if(!c.currentJob)return null;const j=c.currentJob;if(fields[j.field].degree&&!c.qualifications.includes(j.field))return make(s,'retrain');title='Как развиваться дальше?';text='Ваш опыт заметили. Можно руководить людьми, углублять специальность или сохранить нынешний ритм.';
  const expert={...j,id:j.id+'-expert',grade:Math.min(2,j.grade+1),title:fields[j.field].titles[Math.min(2,j.grade+1)],pay:j.pay+2,role:'expert'};
  const lead={...j,id:j.id+'-lead',title:'Руководитель команды · '+fields[j.field].name,pay:j.pay+4,hours:Math.min(50,j.hours+6),load:Math.min(90,j.load+15),role:'lead'};
  options=[{action:'promote',job:expert,title:'Развиваться как специалист',desc:describe(expert)},{action:'promote',job:lead,title:'Попробовать руководство',desc:describe(lead)},{action:'stay',title:'Сохранить нынешние обязанности',desc:'Опыт остаётся с вами. К развитию можно вернуться позже.'}];
 }else if(topic==='balance'){
  title='Работа занимает слишком много сил';text='Привычный график стало трудно выдерживать. Можно изменить нагрузку, начать поиск или временно дать себе восстановиться.';
  options=[{action:'parttime',title:'Договориться о меньшей занятости',desc:'Меньше рабочих часов и дохода; больше времени вне работы.'},{action:'search',title:'Посмотреть другие предложения',desc:'Продолжать нынешнюю работу, пока не найдётся подходящая замена.'},{action:'break',title:'Взять перерыв',desc:'Пауза в заработке и время на восстановление. Опыт и квалификация сохраняются.'}];
 }else if(topic==='internship'){
  title='Попробовать работу во время учёбы';text='Появилась возможность короткой практики. Можно совмещать её с учёбой, выбрать разовую пробу или пока сосредоточиться на занятиях.';scene='read';
  options=[{action:'intern',title:'Взять практику с небольшой занятостью',desc:'Практический опыт и небольшой доход; меньше свободного времени.'},{action:'try',title:'Попробовать один небольшой проект',desc:'Немного опыта без постоянной рабочей нагрузки.'},{action:'stay',title:'Пока сосредоточиться на учёбе',desc:'Возможности работы появятся и позже.'}];
 }else if(topic==='self'){
  title='Дать место собственному делу';text='Можно проверить идею рядом с основной работой или сделать её главным занятием. Доход собственного проекта в тесте меняется от периода к периоду.';
  options=[{action:'project',title:'Начать небольшой проект по вечерам',desc:'Сохранить работу, выделить часть времени и средств на пробу.'},{action:'self',disabled:fields[field].degree&&!c.qualifications.includes(field),title:'Сделать собственное дело основной работой',desc:'Потратить часть резерва; получить гибкий график и переменный доход.'},{action:'stay',title:'Пока сохранить нынешний ритм',desc:'Необязательно превращать увлечение в заработок.'}];
 }else return null;
 return {kind:'career',topic,title,text,scene,options};
}
function offer(s,topic){const c=ensure(s);if(s.ended||c.active||s.age<14||(topic!=='school'&&s.age<17))return false;if(topic==='jobs'&&s.age<18)return false;const p=make(s,topic);if(!p)return false;c.active=p;return true;}
function finishGoal(s,kind,out){const c=ensure(s);if(c.goal&&!c.goal.done&&c.goal.type===kind){c.goal.done=true;c.completedGoals.push({...c.goal,month:now(s)});out.push({type:'goal',text:'Рабочая цель выполнена: '+c.goal.name,scene:'work'});}}
function setGoal(s,type){const names={find:'Найти подходящую работу',train:'Освоить новое направление',promote:'Выбрать следующий шаг в профессии',balance:'Найти более посильный график'};if(s.ended||s.age<18||!names[type])return false;ensure(s).goal={type,name:names[type],done:false};return true;}
function take(s,j,out){const c=ensure(s);if(!eligible(s,j))return false;if(!c.transferCredits[j.field]){const other=Math.max(0,...Object.entries(c.experience).filter(([field])=>field!==j.field).map(([,v])=>v));c.experience[j.field]+=Math.min(6,Math.floor(other*.15));c.transferCredits[j.field]=true;}c.currentJob={...j};c.job=j.title;c.field=j.field;c.desiredField=j.field;c.nextReview=now(s)+18;c.searchAfter=now(s)+3;s.flow.retired=false;finishGoal(s,'find',out);if(j.hours<=28)finishGoal(s,'balance',out);return true;}
function resolve(s,i){const c=ensure(s),p=c.active,o=p?.options[i];if(!o||o.disabled)return null;let note='',out=[];
 if(['take','promote'].includes(o.action)&&!eligible(s,o.job))return null;
 c.active=null;
 if(o.action==='field'){
  c.desiredField=o.field;if(!c.interests.includes(o.field))c.interests.push(o.field);
  if(p.topic==='school'){c.experience[o.field]+=1;s.stats.skill+=1;note='Вы попробовали направление «'+fields[o.field].name+'». Стало понятнее, нравится ли само занятие.';}
  else{const degree=fields[o.field].degree||c.route==='education'&&p.topic==='field';c.training={field:o.field,remaining:degree?36:12,total:degree?36:12,kind:degree?'degree':'course'};s.stats.money-=2;if(!c.currentJob)c.job='Учёба · '+fields[o.field].name;note='Началось обучение: '+fields[o.field].name+'. Прошлый опыт не исчез; новая подготовка займёт время.';}
 }else if(o.action==='take'){take(s,o.job,out);note='Вы выбрали работу «'+o.job.title+'» в «'+o.job.employer+'». Новый график начинает действовать со следующего месяца.';}
 else if(o.action==='promote'){c.currentJob={...o.job};c.job=o.job.title;c.nextReview=now(s)+24;finishGoal(s,'promote',out);note='Вы выбрали новый путь развития: '+o.job.title+'. Условия работы изменились.';}
 else if(o.action==='parttime'){if(c.currentJob){c.currentJob={...c.currentJob,hours:22,pay:Math.max(2,Math.round(c.currentJob.pay*.65)),load:Math.max(25,c.currentJob.load-15)};finishGoal(s,'balance',out);note='Вы договорились о меньшей занятости. Доход сократился, а вне работы стало больше времени.';}else note='Постоянной работы сейчас нет. Можно искать предложения с небольшой занятостью.';}
 else if(o.action==='search'){c.active=make(s,'jobs');note='Вы начали сравнивать предложения. До нового решения нынешняя работа сохраняется.';}
 else if(o.action==='break'){c.currentJob=null;c.job='Перерыв в работе';c.nextReview=now(s)+12;s.stats.energy+=6;finishGoal(s,'balance',out);note='Вы взяли перерыв. Рабочий доход приостановился; опыт и квалификация остались.';}
 else if(o.action==='intern'){const j=job(c.desiredField,0,'flexible',++c.serial);j.hours=16;j.pay=2;j.title='Практикантка · '+fields[j.field].name;take(s,j,out);note='Вы начали небольшую практику. Теперь нужно учитывать и учебное, и рабочее время.';}
 else if(o.action==='try'){c.experience[c.desiredField]+=2;s.stats.skill+=2;note='Небольшой проект помог попробовать реальные задачи. Постоянная работа пока не появилась.';}
 else if(o.action==='project'){c.project={field:c.desiredField,months:0};s.stats.money-=3;note='У вас появился небольшой личный проект рядом с основной работой. Он потребует времени.';}
 else if(o.action==='self'){const j=job(c.desiredField,Math.min(2,Math.floor(c.experience[c.desiredField]/18)),'flexible',++c.serial);j.title='Своё дело · '+fields[j.field].name;j.self=true;j.hours=30;j.load=55;j.pay=5;if(eligible(s,j)){s.stats.money-=6;take(s,j,out);note='Вы сделали собственное дело главным занятием. Доход будет переменным, а часть резерва ушла на начало.';}else{c.active=p;return null;}}
 else{c.searchAfter=now(s)+3;c.nextReview=now(s)+18;note='Вы сохранили нынешний путь. Отказ от предложения не стирает накопленный опыт.';}
 for(const k of Object.keys(s.stats))s.stats[k]=Math.round(cap(s.stats[k]));return {note,title:o.title,scene:p.scene,events:out};}
function onChapter(s,step,i){const c=ensure(s),out=[];
 if(step===0&&i===0&&!c.interests.includes('code'))c.interests.push('code');
 if(step===2){c.route=i===0?'education':i===1?'practice':'search';if(i===0){c.job='Студентка';offer(s,'field');}else if(i===1){c.desiredField='trade';c.training={field:'trade',remaining:24,total:24,kind:'apprenticeship'};c.currentJob=job('trade',0,'flexible',++c.serial);c.job=c.currentJob.title;}else{c.desiredField='service';c.job='Поиск направления';}}
 if(step===3&&i===0&&s.age>=18)offer(s,'jobs');
 if(step===5&&i!==1)offer(s,'self');
 if(step===11){if(i===0&&c.currentJob){c.currentJob={...c.currentJob,hours:20,pay:Math.max(2,Math.round(c.currentJob.pay*.6)),load:30};c.job=c.currentJob.title+' · частичная занятость';finishGoal(s,'balance',out);}else if(i===0){c.desiredField=c.field||'service';offer(s,'jobs');}else{c.currentJob=null;c.job='Пенсия и личные занятия';s.flow.retired=true;}}
 return out;
}
function tryField(s,field){const c=ensure(s);if(!fields[field])return;if(!c.interests.includes(field))c.interests.push(field);c.experience[field]+=2;s.stats.skill=cap(s.stats.skill+1);}
function request(s,topic){const c=ensure(s);if(s.ended||s.age<18||c.active)return false;if(topic==='jobs'&&now(s)<c.searchAfter)return false;return offer(s,topic);}
function tick(s){const c=ensure(s),m=now(s),out=[];if(m<=c.lastMonth)return out;c.lastMonth=m;
 if(s.age>=14&&!c.seen.includes('school')){c.seen.push('school');offer(s,'school');}
 if(c.training){c.training.remaining--;if(c.training.remaining<=0){const t=c.training;c.experience[t.field]+=t.kind==='degree'?18:12;if(!c.qualifications.includes(t.field))c.qualifications.push(t.field);c.training=null;c.desiredField=t.field;s.flow.graduated=true;if(!c.currentJob)c.job='Поиск работы · '+fields[t.field].name;out.push({type:'career',text:'Подготовка завершена: '+fields[t.field].name+'. Новые возможности доступны, но работу ещё нужно выбрать.',scene:'read'});finishGoal(s,'train',out);if(!c.active&&s.age>=18)offer(s,'jobs');}}
 if(s.age>=18&&c.training&&!c.seen.includes('internship')){c.seen.push('internship');if(!c.active)offer(s,'internship');}
 if(s.age>=18&&!c.currentJob&&!c.training&&!s.flow.retired&&!c.active&&m>=c.searchAfter&&m%12===6)offer(s,'jobs');
 if(c.currentJob){const j=c.currentJob;c.experience[j.field]+=j.hours>=30?1:.5;if(m%3===0){const pay=j.self?Math.max(0,j.pay+Math.floor(rand(s)*7)-3):j.pay;const costs=3+(c.training?1:0);const drain=Math.round((j.load-45)/15+(j.hours-32)/10+j.commute/45)+(c.training?1:0)+(c.project?1:0);s.stats.money=cap(s.stats.money+pay-costs);s.stats.energy=cap(s.stats.energy-drain);s.stats.skill=cap(s.stats.skill+1);if(c.interests.includes(j.field)&&m%6===0)s.stats.joy=cap(s.stats.joy+1);else if(j.load>=70)s.stats.joy=cap(s.stats.joy-1);out.push({type:'career',text:j.title+': рабочий период завершён. Доход '+pay+' усл. ед., обычные расходы '+costs+'; график '+j.hours+' ч/нед.',scene:fields[j.field].scene});}
 if(!c.active&&m>=c.nextReview){c.nextReview=m+18;if(s.stats.energy<30)offer(s,'balance');else if(c.experience[j.field]>=18&&!j.self&&j.role!=='lead'&&j.grade<2)offer(s,'promotion');}
 }
 if(c.project){c.project.months++;if(c.project.months===6){c.experience[c.project.field]+=3;out.push({type:'career',text:'Первый небольшой проект завершён. Можно оставить его увлечением или попробовать своё дело.',scene:fields[c.project.field].scene});}}
 return out;
}
function activity(s){const c=ensure(s);if(c.training&&now(s)%3===1)return 'read';const j=c.currentJob;if(j&&now(s)%4<Math.max(1,Math.round(j.hours/12)))return fields[j.field].scene;return null;}
root.LifeCareer={ensure,fields,eligible,describe,offer,resolve,onChapter,tryField,request,tick,activity,setGoal,pending:s=>ensure(s).active};if(typeof module!=='undefined')module.exports=root.LifeCareer;
})(typeof window!=='undefined'?window:globalThis);
