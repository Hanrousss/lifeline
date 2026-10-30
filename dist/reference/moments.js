/* Lifeline-only journal moments. The supplied upstream client remains unchanged. */
(function(root){
'use strict';
function state(){return S.lifelineMoments||(S.lifelineMoments={version:1,queue:[],active:null,capsule:null});}
const clock=()=>S.age+(S.t||0);
function enqueue(id,view){const m=state();if(m.active?.id===id||m.queue.some(item=>item.id===id))return;m.queue.push({id,view});promote();}
function promote(){const m=state();if(!m.active&&m.queue.length)m.active=m.queue.shift();}
function journal(question,value){const note=String(value||'').trim().slice(0,600);if(!note)return;S.journal=S.journal||[];S.journal.push({a:S.age,q:question,t:note});log(question+' «'+note+'»','note');}
function graduation(){const m=state();if(m.capsule)return;m.capsule={status:'invited',at:clock(),age:S.age};enqueue('lifeline-capsule-bury',{title:'Капсула времени',body:'Последний день школы. Одноклассники закапывают капсулу времени и предлагают присоединиться. Через 10 лет вы откроете свои письма.',q:'Кем вы видите себя через 10 лет?',note:{max:600,placeholder:'Я думаю, что через 10 лет…',requiredFor:'bury'},choices:[{k:'bury',label:'Закопать своё письмо'},{k:'skip',label:'Не участвовать'}]});}
function capture(){return {kids:S.fam.kids.length,marriages:S.fam.marriages||0};}
function observe(before){const m=state();if(S.phase!=='life')return;
 if(before&&(S.fam.marriages||0)>before.marriages)enqueue('lifeline-wedding-'+S.fam.marriages,{title:'День свадьбы',body:'Этот день останется частью вашей общей истории.',q:'Что хочется сохранить в памяти об этом дне?',note:{max:600,placeholder:'Несколько слов для вашей истории (необязательно)'},choices:[{k:'write',label:'Сохранить запись'},{k:'skip',label:'Продолжить без записи'}]});
 const babies=before?S.fam.kids.slice(before.kids).filter(k=>k.alive&&!k.sk&&k.bornAt===S.age):[];
 if(babies.length)enqueue('lifeline-birth-'+before.kids+'-'+S.age,{title:'Рождение ребёнка',body:babies.length>1?'В вашей семье родились малыши. Начинается новая глава.':'В вашей семье родился ребёнок. Начинается новая глава.',q:'Что вы чувствуете в этот момент?',note:{max:600,placeholder:'Несколько слов для вашей истории (необязательно)'},choices:[{k:'write',label:'Сохранить запись'},{k:'skip',label:'Продолжить без записи'}]});
 if(m.capsule?.status==='buried'&&clock()+1e-8>=m.capsule.dueAt){m.capsule.status='ready';const now='Сейчас вам '+S.age+' лет. '+(JOBS[S.job]?.n||S.job||'')+'. '+C().ko+'. '+(S.fam.married?'Вы в браке. ':'')+'Детей: '+S.fam.kids.filter(k=>k.alive).length+'.';m.capsule.actual=now;enqueue('lifeline-capsule-open',{title:'Письмо из прошлого',body:'Прошло 10 лет. Вы открываете школьную капсулу времени. Тогда вы написали: «'+m.capsule.text+'»\n\n'+now,q:'Как сложилась жизнь по сравнению с вашим письмом?',choices:[{k:'yes',label:'Всё сбылось',sub:'Мечта сбылась · +6 счастья'},{k:'partly',label:'Частично сбылось',sub:'На полпути · +3 счастья'},{k:'different',label:'Пока что жизнь сложилась иначе',sub:'Другой путь · −3 счастья'}]});}
 promote();
}
function settle(){if(S.pending?.id==='reflect'){choose('skip');}observe();}
function resolve(key,extra){const m=state(),item=m.active;if(!item)return false;if(!item.view.choices.some(c=>c.k===key))throw new Error('Unavailable choice');const value=String(extra||'').trim().slice(0,600);
 if(item.id==='lifeline-capsule-bury'){if(key==='bury'){if(!value)throw new Error('Напишите, кем видите себя через 10 лет, или выберите «Не участвовать».');Object.assign(m.capsule,{status:'buried',text:value,dueAt:m.capsule.at+10});journal('Школьная капсула времени. Через 10 лет',value);}else{m.capsule.status='declined';log('В последний день школы вы решили не участвовать в капсуле времени.','note');}}
 else if(item.id==='lifeline-capsule-open'){const verdict={yes:'Всё сбылось',partly:'Частично сбылось',different:'Пока что жизнь сложилась иначе'}[key];const effect={yes:6,partly:3,different:-3}[key],label={yes:'Мечта сбылась',partly:'На полпути',different:'Другой путь'}[key],previous=S.st.h;S.st.h=Math.max(0,Math.min(100,S.st.h+effect));Object.assign(m.capsule,{status:'opened',openedAt:clock(),verdict:key,result:{label,happiness:S.st.h-previous,effect}});log('Вы открыли школьную капсулу времени. Ваше письмо: «'+m.capsule.text+'» '+m.capsule.actual+' Ваш итог: '+verdict+'. Статус: '+label+' ('+(effect>0?'+':'')+effect+' счастья).',effect>0?'warm':'bad');}
 else if(key==='write')journal(item.view.title,value);
 m.active=null;promote();return true;
}
function install(){HOOK.noPause=()=>true;reflectQuiet=()=>{};const original=graduate;graduate=function(...args){const school=S?.school,result=original(...args);if(['usec','voc'].includes(school)&&S.flags.justGrad===school)graduation();return result;};}
root.LifelineMoments={install,settle,capture,observe,pending:()=>state().active,resolve};
})(self);
