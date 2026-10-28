(function(root){
const cap=n=>Math.max(0,Math.min(100,n));
function ensure(s){if(!s.social)s.social={version:1,active:null,seen:[...((s.flow?.months||0)>318?['partner']:[]),...((s.flow?.months||0)>372?['family']:[])],nextParty:Math.max(174,(s.flow?.months||0)+6),nextConnections:Math.max(300,(s.flow?.months||0)+18),nextReflection:Math.max(336,(s.flow?.months||0)+24),nextChildEvent:0,trust:60,controversy:0,access:s.family?.wealth==='wealthy'?65:25,ruleBreaking:0,repair:0,practice:null,friends:[{id:'nika',name:'Ника',focus:'встречи и компания',closeness:50},{id:'sasha',name:'Саша',focus:'учёба и работа',closeness:50},{id:'ren',name:'Рен',focus:'отдых и здоровье',closeness:50},{id:'family',name:s.family?.mother?.name||'Близкие',focus:'семья и надёжность',closeness:65}],partner:null,child:null,queue:[],lastMonth:s.flow?.months||0};return s.social;}
function now(s){return s.flow?.months||s.age*12;}
function random(s){s.rng=(Math.imul(1664525,s.rng)+1013904223)>>>0;return s.rng/4294967296;}
function friend(s,id,delta){const p=ensure(s).friends.find(p=>p.id===id);if(p)p.closeness=cap(p.closeness+delta);}
function event(out,type,text,scene='family'){out.push({type,text,scene});}
function make(s,topic){
 const n=ensure(s),party=s.age<18?'после школьного праздника':s.age<23?'после занятий':'после рабочей недели';
 const stories={
 party:['Встреча '+party,'Ника зовёт провести вечер вместе. Саша собирается закончить общую работу, а Рен предлагает выспаться перед утренней прогулкой. У людей разные планы; никто из них не обязан быть плохим другом.','family',[
 ['party','Пойти на встречу с Никой','Сблизиться с этой компанией; меньше времени на другие планы. Принять приглашение не значит соглашаться на вещества или игру на деньги.'],
 ['study','Встретиться с Сашей за общим делом','Продвинуть работу и провести время вместе. Ника может расстроиться из-за пропущенной встречи.'],
 ['rest','Выбрать спокойный вечер с Реном','Восстановиться и поддержать другую связь. Компания продолжит встречу без вас.'],['family','Провести вечер с близкими','Уделить время семье; пропустить встречу этой компании.']]],
 connections:['Предложение от влиятельного знакомого','Знакомый обещает помочь с выгодной работой. Можно получить обычную рекомендацию, а можно согласиться обойти общие правила. Второй путь даёт быстрый результат, но создаёт обязательства и риск огласки.','work',[
 ['lawful','Попросить законную рекомендацию','Знакомства помогают, но требования и правила сохраняются.'],['corrupt','Согласиться на обход правил','Быстрая выгода и сближение с этим кругом; риск для доверия, репутации и отношений.'],['decline','Отказаться от предложения','Искать другой путь; часть влиятельных знакомых может отдалиться.']]],
 bribe:['За деньги обещают обойти закон','Посредник из вашего круга предлагает решить вопрос взяткой. Быстрое преимущество связано с риском огласки, ответственности и утраты доверия.','work',[['lawful','Решать вопрос официально','Потребуется больше времени; правила и требования сохранятся.'],['corrupt','Согласиться на взятку','Получить преимущество сейчас, заплатить и принять риск последствий.'],['decline','Отказаться от посредника','Потерять часть доступа к этому кругу и искать законный путь.']]],
 cover:['Друг просит прикрыть его','Знакомый из влиятельного круга просит помочь скрыть последствия его поступка. Он напоминает, что раньше вы помогали друг другу.','work',[
 ['lawful','Помочь найти законную защиту','Поддержать человека, не скрывая его действий.'],['cover','Согласиться его прикрыть','Круг оценит лояльность; доверие других людей и риск последствий ухудшатся.'],['decline','Обозначить границу','Отказаться скрывать поступок, даже если знакомый обидится.']]],
 partner:['Какие отношения строить','Есть возможность развивать близкие отношения. В этом тесте выбор задаёт общие договорённости пары; партнёр остаётся отдельным человеком и может менять взгляды.','family',[
 ['honest','Строить отношения на открытости и границах','Партнёр ценит доверие и не согласен скрывать вред другим.'],['aligned','Сближаться с человеком из своего круга','Вас объединяют связи и привычные способы решать вопросы. Это не гарантирует согласия навсегда.'],['single','Пока жить без партнёра','Сохранить самостоятельность; близость и поддержка возможны и вне пары.']]],
 family:['Хотите ли вы стать родителем?','В этой тестовой истории можно выбрать родительство, жизнь без детей или вернуться к вопросу позже. Это разные пути, а не шкала успешности.','family',[
 ['parent','Выбрать родительство','Появятся забота, расходы, близость и ответственность за обстановку дома.'],['nochild','Выбрать жизнь без детей','Другие отношения и планы сохраняют свою ценность.'],['later','Пока не решать','Можно вернуться к вопросу через несколько лет.']]],
 child:['Ребёнку непросто','Из школы сообщили о трудностях. '+(n.child?.latest||'Ребёнок стал спорить, избегать занятий и чаще просить деньги. Причины стоит выяснить, а не приписывать ему плохой характер.'),'family',[
 ['support','Разобраться вместе и установить границы','Выслушать ребёнка, поговорить со школой и организовать поддержку. Потребуются время и средства.'],['pay','Дать денег и закрыть вопрос','Временное затишье возможно, но причины останутся.'],['ignore','Сосредоточиться на своих делах','Сейчас проще; ребёнку может не хватить внимания и помощи.']]],
 reflection:['Как жить дальше','Последние события заставляют задуматься о своих поступках. Можно искать опору разными способами. Ни вера, ни медитация сами по себе не стирают причинённый вред.','park',[
 ['faith','Обратиться к религиозной общине','Найти подходящую традицию, общение и время для размышлений. Не обещает автоматической перемены.'],['meditation','Попробовать медитацию и спокойный ритм','Начать посильную практику и пересмотреть привычные решения.'],['therapy','Обратиться к светской поддержке','Поговорить со специалистом или группой поддержки о поступках и изменениях.']]],
 repair:['Подкрепить перемены поступком','Вы нашли некоторую опору, но доверие возвращается через действия. Сейчас можно исправить часть последствий или оставить привычный порядок.','family',[
 ['repair','Признать свою ответственность и исправить посильное','Потратить время и ресурсы, отказаться от сомнительной выгоды. Доверие возвращается постепенно.'],['limits','Начать с границ для своего круга','Перестать участвовать в новых сомнительных делах; прежние последствия сохраняются.'],['continue','Пока сохранить прежний образ жизни','Размышления остаются размышлениями; отношения могут продолжить меняться.']]],
 spouse:['Партнёр хочет жить иначе','Партнёр больше не хочет участвовать в прежних сомнительных делах. Он предлагает пересмотреть общие договорённости. Это его собственное решение.','family',[
 ['join','Попробовать менять жизнь вместе','Обсудить конкретные действия и поддержку, без обещания мгновенного исправления.'],['talk','Выслушать и договориться о границах','Взгляды пока различаются, но разговор может сохранить доверие.'],['continue','Продолжить по-прежнему','Если пути будут расходиться, близость может уменьшаться.']]]
 };
 const d=stories[topic];if(!d)return null;return {kind:'social',topic,title:d[0],text:d[1],scene:d[2],options:d[3].map(([action,title,desc])=>({action,title,desc}))};
}
function offer(s,topic){const n=ensure(s);if(n.active||s.age<14)return false;if(topic!=='party'&&s.age<18)return false;if(topic==='child'&&!n.child)return false;if(topic==='spouse'&&!n.partner)return false;n.active=make(s,topic);return Boolean(n.active);}
function resolve(s,i){
 const n=ensure(s),p=n.active,o=p?.options[i];if(!o)return null;n.active=null;const m=now(s),out=[];let note='';
 const queue=(delay,text,effect={})=>n.queue.push({due:m+delay,text,effect});
 if(p.topic==='party'){
  if(o.action==='party'){
   friend(s,'nika',5);s.stats.energy-=3;note='Вы провели вечер с Никой. Общение стало ближе; остальные знакомые не исчезли из вашей жизни.';
   if(s.age>=18&&random(s)<.65){const choices=['tobacco','alcohol','lottery','gambling'];if(root.LifeHabits.vulnerability(s)>=65)choices.push('unknown');root.LifeHabits.offer(s,choices[Math.floor(random(s)*choices.length)]);}
  }else if(o.action==='study'){friend(s,'nika',-2);friend(s,'sasha',5);s.stats.skill+=2;s.stats.energy-=2;note='Вы продвинули общее дело с Сашей. Ника немного расстроилась из-за пропущенного вечера, но это не конец дружбы.';}
  else if(o.action==='family'){friend(s,'nika',-2);friend(s,'family',5);s.stats.bond+=2;note='Вы провели вечер с близкими. Эта связь укрепилась; Ника немного расстроилась из-за пропущенной встречи.';}else{friend(s,'nika',-2);friend(s,'ren',5);s.stats.energy+=4;note='Вы провели спокойный вечер с Реном. Ника стала реже звать на такие встречи, зато другой контакт укрепился.';}
 }else if(p.topic==='connections'||p.topic==='cover'||p.topic==='bribe'){
  if(o.action==='corrupt'||o.action==='cover'){
   n.ruleBreaking++;n.access=cap(n.access+8);n.trust=cap(n.trust-6);n.controversy=cap(n.controversy+9);s.stats.money+=p.topic==='bribe'?-5:o.action==='corrupt'?10:3;
   note=p.topic==='bribe'?'Посредник добился преимущества за взятку. Расходы, обязательства и риск последствий остались с вами.':o.action==='corrupt'?'Сработала договорённость в обход правил. Вы получили выгоду и обязательства перед этим кругом.':'Вы помогли скрыть поступок знакомого. Внутри круга вашу лояльность оценили; за его пределами доверие стало уязвимее.';
   if(random(s)<.55)queue(6,'История о сомнительной договорённости стала известна. Часть людей отказалась иметь с вами дело.',{money:-8,trust:-8,controversy:10});
  }else if(o.action==='lawful'){s.stats.money+=2;n.trust=cap(n.trust+1);note='Вы выбрали законную поддержку. Дружеская помощь не потребовала скрывать чужие поступки или обходить правила.';}
  else{n.access=cap(n.access-3);note='Вы обозначили границу. Некоторые связи стали прохладнее; это не закрыло остальные пути.';}
 }else if(p.topic==='partner'){
  if(o.action==='single'){n.partner=null;note='Вы сохранили самостоятельность. Жизнь без партнёра не обесценивает другие связи.';}
  else{n.partner={name:'Алекс',values:o.action==='honest'?'honest':n.ruleBreaking?'complicit':'independent',closeness:65,changed:false};note='Вы начали строить отношения с Алексом. Ваши договорённости будут проверяться поступками.';}
 }else if(p.topic==='family'){
  if(o.action==='parent'){n.child={bornAt:m,trust:65,security:65,school:65,stress:0,latest:null};s.stats.money-=4;note='В вашей жизни появился ребёнок. Его развитие будет зависеть от многих обстоятельств, поддержки и собственных решений.';n.nextChildEvent=m+72;}
  else if(o.action==='later'){n.queue.push({due:m+36,topic:'family'});note='Вы отложили решение о родительстве. К нему можно вернуться позже.';}
  else note='Вы выбрали жизнь без детей. Это полноценный путь со своими отношениями и планами.';
 }else if(p.topic==='child'){
  const c=n.child;if(!c)return null;
  if(o.action==='support'){c.trust=cap(c.trust+5);c.security=cap(c.security+5);c.stress=cap(c.stress-15);c.school=cap(c.school+4);s.stats.money-=3;s.stats.energy-=3;note='Вы выясняете причины трудностей вместе с ребёнком и школой. Для изменений понадобится время; поддержка не требует идеальной репутации родителя.';}
  else if(o.action==='pay'){s.stats.money-=3;c.trust=cap(c.trust+1);c.stress=cap(c.stress+2);note='На короткое время спор закончился. Вопросы безопасности, поведения и учёбы остались открытыми.';}
  else{c.trust=cap(c.trust-4);c.security=cap(c.security-3);c.stress=cap(c.stress+6);note='Разговор отложен. Ребёнок остался с трудностями без вашей помощи.';}
 }else if(p.topic==='reflection'){
  n.practice=o.action;n.queue.push({due:m+3,topic:'repair'});s.stats.energy+=2;note='Вы нашли время для '+({faith:'общины и размышлений',meditation:'спокойной практики',therapy:'светской поддержки'}[o.action])+'. Репутация не изменилась от одного выбора; дальше важны поступки.';
 }else if(p.topic==='repair'){
  if(o.action==='repair'){s.stats.money-=5;s.stats.energy-=3;n.repair++;n.trust=cap(n.trust+3);n.controversy=cap(n.controversy-2);n.ruleBreaking=Math.max(0,n.ruleBreaking-1);note='Вы исправили часть последствий и отказались от выгоды. Это небольшой шаг к доверию, а не стирание истории.';}
  else if(o.action==='limits'){n.repair++;n.access=cap(n.access-3);n.ruleBreaking=Math.max(0,n.ruleBreaking-1);note='Вы перестали соглашаться на новые сомнительные договорённости. Прежняя история сохраняется.';}
  else note='Вы пока сохранили прежний порядок. Одна практика не изменила ваших поступков.';
 }else if(p.topic==='spouse'){
  if(o.action==='join'){n.repair++;n.ruleBreaking=Math.max(0,n.ruleBreaking-1);n.partner.closeness=cap(n.partner.closeness+3);note='Вы договорились о первых изменениях вместе. Теперь нужны конкретные действия.';}
  else if(o.action==='talk'){n.partner.closeness=cap(n.partner.closeness+1);note='Вы выслушали друг друга и обсудили границы. Различия пока сохраняются.';}
  else note='Вы выбрали прежний путь. Партнёр не обязан разделять его дальше.';
 }
 for(const key of Object.keys(s.stats))s.stats[key]=cap(s.stats[key]);
 return {note,title:o.title,events:out,scene:p.scene};
}
function tick(s){
 const n=ensure(s),m=now(s),out=[];if(m<=n.lastMonth)return out;n.lastMonth=m;
 const due=n.queue.filter(q=>q.due<=m);n.queue=n.queue.filter(q=>q.due>m);
 for(const q of due){if(q.topic){if(!n.active)n.active=make(s,q.topic);else n.queue.push({...q,due:m+1});}else{for(const [k,v]of Object.entries(q.effect))if(k==='trust'||k==='controversy')n[k]=cap(n[k]+v);else s.stats[k]=cap(s.stats[k]+v);event(out,'social',q.text,'work');}}
 if(s.age<14)return out;
 if(!n.active&&m>=n.nextParty){n.nextParty=m+(s.age<23?9:24)+Math.floor(random(s)*7);if(random(s)<.65)offer(s,'party');}
 if(s.age>=25&&!n.active&&m>=n.nextConnections){n.nextConnections=m+24;if(random(s)<(n.access>=60?.6:.15))offer(s,n.ruleBreaking>1?'cover':random(s)<.4?'bribe':'connections');}
 if(m>=318&&!n.seen.includes('partner')){n.seen.push('partner');n.queue.push({due:m+1,topic:'partner'});}
 if(m>=372&&!n.seen.includes('family')){n.seen.push('family');n.queue.push({due:m+1,topic:'family'});}
 if(s.age>=28&&!n.active&&m>=n.nextReflection){n.nextReflection=m+48;if(n.controversy>=20||root.LifeHabits.vulnerability(s)>=65)offer(s,'reflection');}
 if(m%12===0){
  if(n.ruleBreaking){friend(s,'sasha',-Math.min(3,n.ruleBreaking));friend(s,'ren',-Math.min(3,n.ruleBreaking));friend(s,'family',-Math.min(2,n.ruleBreaking));if(n.partner&&n.partner.values==='honest')n.partner.closeness=cap(n.partner.closeness-3);}
  if(n.partner?.values==='complicit'&&!n.partner.changed&&n.ruleBreaking>=2&&random(s)<.2){n.partner.changed=true;n.partner.values='honest';n.queue.push({due:m+1,topic:'spouse'});}
  if(n.child){const c=n.child,age=Math.floor((m-c.bornAt)/12);if(age>=6&&age<18){
   const conflict=n.partner&&n.partner.closeness<40?8:0;
   const exposure=Math.min(18,n.ruleBreaking*3)+n.controversy*.08+conflict;
   c.stress=cap(c.stress+exposure-(c.security>=60?5:1));
   if(c.stress>=30)c.school=cap(c.school-2);
   if(m>=n.nextChildEvent&&c.stress>=25&&!n.active){
    n.nextChildEvent=m+24;
    const possibilities=age<12?['Учитель заметил резкие ответы и ссоры. Ребёнку трудно объяснить, что его тревожит.','Из школы сообщили о насмешках над одноклассником. Важно остановить травлю и разобраться, что происходит.','Ребёнок стал избегать заданий и сомневаться, что у него что-то получится.']:['Ребёнок чаще просит деньги и не рассказывает, на что они нужны.','Ребёнок задержался вне дома и не предупредил. Нужно разобраться в безопасности и договорённостях.','Учёба стала даваться тяжелее, а разговоры дома всё чаще заканчиваются спором.'];
    c.latest=possibilities[Math.floor(random(s)*possibilities.length)];offer(s,'child');
   }
  }}
 }
 return out;
}
function pending(s){return ensure(s).active;}
root.LifeSocial={ensure,offer,make,resolve,tick,pending};if(typeof module!=='undefined')module.exports=root.LifeSocial;
})(typeof window!=='undefined'?window:globalThis);
