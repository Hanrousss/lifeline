(function(root){
const births=root.BirthData||(typeof require!=='undefined'?require('./birth-data.js'):null);
const survival=root.SurvivalData||(typeof require!=='undefined'?require('./survival-data.js'):null);
const countryTables=root.CountrySurvivalTables||(typeof require!=='undefined'?Object.assign({},...Array.from({length:4},(_,i)=>require('./country-survival-'+i+'.js'))):{});
// Period life table: a synthetic group under the mortality rates of 2023,
// NOT a forecast for the real 2023 birth cohort. No individual death draws.
function estimate(months,origin=null){
if(!Number.isFinite(months)||months<0||months>1200)throw Error('Unsupported cohort age');
const lx=countryTables[origin?.iso3]||survival.lx,world=lx===survival.lx;
const age=months/12,lo=Math.floor(age),hi=Math.min(lo+1,lx.length-1),fraction=age-lo;
const probability=(lx[lo]*(1-fraction)+lx[hi]*fraction)/survival.radix;
const initialOthers=Math.max(0,Math.round((!world&&origin?.births?origin.births:births.totalBirths)/365)-1);
return {initialOthers,aliveOthers:Math.round(initialOthers*probability),probability,year:survival.year,age,world,country:world?null:origin.country,iso3:world?null:origin.iso3};
}
root.LifeCohort={estimate,data:survival,countryTables};if(typeof module!=='undefined')module.exports=root.LifeCohort;
})(typeof window!=='undefined'?window:globalThis);
