const assert=require('node:assert/strict'),T=require('../dist/event-tone.js');
const cases=[
 [{type:'consequence',text:'После неизвестной таблетки самочувствие ухудшилось. Вы обратились за медицинской помощью.'},'bad'],
 [{type:'event',text:'Небольшой непредвиденный расход уменьшил запас денег.'},'bad'],
 [{type:'habit',text:'Схожие ситуации всё чаще вызывают желание повторить. Это пока не диагноз, но привычка заметно укрепляется.'},'warning'],
 [{type:'news',text:'Цены на часть повседневных покупок выросли. Привычный бюджет пришлось немного пересмотреть.'},'warning'],
 [{type:'goal',text:'Цель выполнена: попробовать кружок.'},'good'],
 [{type:'career',text:'Подготовка завершена: Дизайн. Новые возможности доступны, но работу ещё нужно выбрать.'},'good'],
 [{type:'care',text:'Обычные дела снова даются легче. Улучшение ещё не означает, что лечение пора сразу прекращать.'},'good'],
 [{type:'milestone',text:'Первый учебный год: новые лица, уроки и дорога в школу.'},'memorable'],
 [{type:'choice',text:'Первый рисунок занял место на холодильнике.'},'memorable'],
 [{type:'career',text:'Дизайнер: рабочий период завершён. Доход 12 усл. ед., обычные расходы 3; график 40 ч/нед.'},''],
 [{type:'everyday',text:'Любимая игрушка потерялась под диваном. К вечеру её нашли.'},''],
 [{type:'news',text:'В городе открылась небольшая библиотека с бесплатными встречами для жителей.'},''],
 [{type:'consequence',text:'Новое событие без заданного смысла.'},''],
 [{type:'milestone',tone:'warning',text:'Авторская оценка события.'},'warning']
];
for(const [event,key]of cases){const before=JSON.stringify(event),result=T.describe(event);assert.equal(result.key,key);assert.equal(Boolean(result.label),Boolean(key),'Color categories also have readable labels');assert.equal(JSON.stringify(event),before,'Presentation must not edit the save');}
console.log('Passed: adverse outcomes, warnings, achievements, memories, neutral routine events, explicit metadata and read-only presentation.');
