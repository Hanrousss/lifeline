const assert=require('node:assert/strict'),R=require('../dist/russian-text.js');
for(const word of ['Isaac Phillips','Lucie Lefebvre','Wulan Purnomo','François','Émilie','Léo','Chakraborty']){const text=R.text(word);assert(text.length);assert(!/[a-zA-ZÀ-ž]/.test(text),text);}
assert.equal(R.text('John Smith'),'Джон Смит');assert.equal(R.text('WHO'),'ВОЗ');assert.equal(R.text('World Bank'),'Всемирный банк');assert.equal(R.text('1in8b'),'');assert.equal(R.text('100 USD PPP'),'100 долл. США');assert.equal(R.text('Вы родились в России.'),'Вы родились в России.');
console.log('PASS: Russian display names, accents, source abbreviations, currency labels and unchanged Cyrillic.');

const fs=require('node:fs');assert(!/1in8b/i.test(fs.readFileSync('dist/app.js','utf8')),'No reference-game mentions in gameplay UI');
