(function(root){
'use strict';
let data,birthScale=null;
function priceLevel(country){return profile(country).usdPerInternationalDollar;}
function profile(country){const id=typeof country==='string'?country:country?.id,d=data?.countries[id];if(d)return {...d,approximate:false};const c=typeof country==='object'?country:CBY[id],region=c?.p,peers=Object.values(CBY).filter(p=>p.p===region&&data?.countries[p.id]).map(p=>data.countries[p.id].usdPerInternationalDollar).sort((a,b)=>a-b);return {usdPerInternationalDollar:peers.length?peers[Math.floor(peers.length/2)]:1,year:null,approximate:true};}
function scale(){return birthScale||S?.lifelineEconomy?.usdPerUnit||1;}
function beginBirth(country){birthScale=profile(country).usdPerInternationalDollar;}
function endBirth(){initialize();birthScale=null;}
function initialize(){if(!S.lifelineEconomy)S.lifelineEconomy={version:1,currency:'USD',usdPerUnit:profile(C()).usdPerInternationalDollar,baseCountry:S.cur};return S.lifelineEconomy;}
function toUSD(value){return Number(value||0)*scale();}
function fromUSD(value){return Number(value||0)/scale();}
function format(value){return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:Math.abs(toUSD(value))<10?2:0}).format(toUSD(value))+' $';}
function install(input){data=input;const income=incomeAt,percentile=pctOfIncome;incomeAt=function(country,p){const value=income(country,p);return value*profile(country).usdPerInternationalDollar/scale();};pctOfIncome=function(country,value){return percentile(country,value*scale()/profile(country).usdPerInternationalDollar);};wonStr=format;}
function legacyMoney(text){return String(text||'').replace(/([−–-]?\s*\d[\d\s\u00a0\u202f]*(?:[,.]\d+)?)(?:\s*(тыс\.?|млн\.?|млрд\.?))?\s*(?:₽|руб\.(?![А-Яа-я])|рублей|рубля)(?![А-Яа-я])/g,(_,amount,suffix)=>{const value=Number(amount.replace(/[\s\u00a0\u202f]/g,'').replace(/[−–]/g,'-').replace(',','.'))*({ 'тыс':1e3,'млн':1e6,'млрд':1e9 }[suffix?.replace('.','')]||1)/29.6;return format(value);});}
function view(result){initialize();const raw=result.raw,p=profile(C());for(const row of raw.log||[])row.text=legacyMoney(row.text);result.currency={code:'USD',country:S.cur,year:p.year,approximate:p.approximate,source:'Всемирный банк',priceLevel:p.usdPerInternationalDollar};result.money={unitUSD:scale(),balance:toUSD(raw.money),income:toUSD(raw.income),house:toUSD(raw.house)};result.netWorth=toUSD(result.netWorth);result.debt=toUSD(result.debt);result.shop=result.shop.map(item=>({...item,cost:toUSD(item.cost)}));if(result.household){result.household.saving=toUSD(result.household.saving);result.household.partnerIncome=toUSD(result.household.partnerIncome);}if(result.certificate)for(const key of ['income','peakIncome','netWorth'])result.certificate[key]=toUSD(result.certificate[key]);return result;}
root.LifelineEconomy={beginBirth,endBirth,install,initialize,profile,priceLevel,toUSD,fromUSD,format,legacyMoney,view};
})(self);
