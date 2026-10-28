(function(root){
const births=root.BirthData||(typeof require!=='undefined'?require('./birth-data.js'):null);
const survival=root.SurvivalData||(typeof require!=='undefined'?require('./survival-data.js'):null);
// Period life table: a synthetic group under the mortality rates of 2023,
// NOT a forecast for the real 2023 birth cohort. No individual death draws.
function estimate(months){
if(!Number.isFinite(months)||months<0||months>1200)throw Error('Unsupported cohort age');
const age=months/12,lo=Math.floor(age),hi=Math.min(lo+1,survival.lx.length-1),fraction=age-lo;
const probability=(survival.lx[lo]*(1-fraction)+survival.lx[hi]*fraction)/survival.radix;
const initialOthers=Math.max(0,Math.round(births.totalBirths/365)-1);
return {initialOthers,aliveOthers:Math.round(initialOthers*probability),probability,year:survival.year,age,world:true};
}
root.LifeCohort={estimate,data:survival};if(typeof module!=='undefined')module.exports=root.LifeCohort;
})(typeof window!=='undefined'?window:globalThis);
