const assert=require('node:assert/strict');
const E=require('../dist/engine.js'),F=require('../dist/timeline.js'),K=require('../dist/career.js');
function adult(seed=7){const s=E.fresh(seed);s.started=true;s.born=true;s.age=24;s.step=4;s.childhood.finished=true;s.childhood.step=5;F.ensure(s);s.flow.months=288;const c=K.ensure(s);c.lastMonth=288;c.desiredField='design';c.currentJob=null;c.training=null;c.active=null;c.searchAfter=0;c.nextReview=10000;c.seen=['school','internship'];return s;}
function take(s,index=0){assert(K.offer(s,'jobs'));const p=K.pending(s);const chosen={...p.options[index].job};assert(K.resolve(s,index));return chosen;}
const s=adult();K.setGoal(s,'find');K.offer(s,'jobs');const options=K.pending(s).options;
assert.equal(options.length,4);assert(options[1].job.pay>options[0].job.pay);assert(options[1].job.hours>options[0].job.hours);assert(options[2].job.hours<options[0].job.hours);
const pending=JSON.stringify(s);assert.deepEqual(K.pending(JSON.parse(pending)),K.pending(s));assert.equal(JSON.stringify(s),pending,'Reading offers does not reroll them');
assert(K.resolve(s,0));assert(s.flow.career.goal.done);const jobId=s.flow.career.currentJob.id;
assert.equal(K.request(s,'jobs'),false,'Search has a cooldown');s.flow.months+=3;assert(K.request(s,'jobs'));K.resolve(s,3);assert.equal(s.flow.career.currentJob.id,jobId,'Rejecting offers retains current employment');
const oldExperience=42;s.flow.career.experience.design=oldExperience;s.flow.career.desiredField='code';s.flow.months+=3;take(s,0);assert.equal(s.flow.career.experience.design,oldExperience);assert(s.flow.career.experience.code>0&&s.flow.career.experience.code<=6,'General experience partially transfers, not a full seniority jump');
const studying=adult();take(studying);const oldJob=studying.flow.career.currentJob.id;K.setGoal(studying,'train');K.offer(studying,'retrain');const codeIndex=K.pending(studying).options.findIndex(x=>x.field==='code');K.resolve(studying,codeIndex);assert.equal(studying.flow.career.currentJob.id,oldJob);assert(studying.flow.career.training);
for(let i=0;i<12;i++){studying.flow.months++;K.tick(studying);}assert.equal(studying.flow.career.training,null);assert(studying.flow.career.qualifications.includes('code'));assert(studying.flow.career.goal.done);assert.equal(studying.flow.career.currentJob.id,oldJob,'Finishing a course does not silently replace the job');
const teacher=adult();teacher.flow.career.desiredField='education';K.offer(teacher,'jobs');for(const o of K.pending(teacher).options.filter(o=>o.job))assert.equal(o.job.grade,0,'No qualified teacher offers before preparation');K.resolve(teacher,0);teacher.flow.career.experience.education=30;K.offer(teacher,'promotion');assert.equal(K.pending(teacher).topic,'retrain','Qualified progression requires preparation');
const expert=adult(),lead=adult();take(expert);take(lead);expert.flow.career.experience.design=lead.flow.career.experience.design=24;K.offer(expert,'promotion');K.offer(lead,'promotion');K.resolve(expert,0);K.resolve(lead,1);assert.equal(expert.flow.career.currentJob.role,'expert');assert.equal(lead.flow.career.currentJob.role,'lead');assert(lead.flow.career.currentJob.hours>expert.flow.career.currentJob.hours);
const balanced=adult(),intense=adult();take(balanced,0);take(intense,1);balanced.stats.energy=intense.stats.energy=75;balanced.stats.money=intense.stats.money=40;
for(let i=0;i<12;i++){balanced.flow.months++;intense.flow.months++;K.tick(balanced);K.tick(intense);}assert(intense.stats.money>balanced.stats.money);assert(intense.stats.energy<balanced.stats.energy);
const part=adult();take(part,1);K.setGoal(part,'balance');K.offer(part,'balance');K.resolve(part,0);assert(part.flow.career.currentJob.hours<30);assert(part.flow.career.goal.done);
const school=E.fresh(4);school.started=true;school.age=14;F.ensure(school);K.offer(school,'school');K.resolve(school,0);assert.equal(school.flow.career.currentJob,null);assert(school.flow.career.interests.includes('code'));
for(let seed=0;seed<50;seed++){
 const a=E.fresh(seed);a.started=true;F.ensure(a);let steps=0;
 while(!a.ended&&steps++<2300){const p=F.pending(a);if(p){let n=p.kind==='early'?E.earlyScene(a).options.length:p.kind==='chapter'?3:p.options.length;let choice=seed%n;if(p.options?.[choice]?.disabled)choice=p.options.findIndex(o=>!o.disabled);assert(F.resolve(a,choice));}else assert(F.advance(a));}
 assert(a.ended);assert.equal(a.flow.months,912);assert(a.flow.career.version);assert(a.history.some(x=>x.career));
}
console.log('Passed: job comparisons, stable saved offers, cooldown and rejection, transfer of experience, study alongside work, qualification gates, specialist/manager paths, workload tradeoffs, flexible hours, optional career goals, early interests and 50 complete lives.');
