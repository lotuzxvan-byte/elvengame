'use strict';
const PrayerAudioText=(()=>{
 const data=typeof module!=='undefined'?require('./data.js'):CatholicPrayers;
 function prayerText(prayer){return prayer.lines.flatMap(line=>line==='[Doakan Salam Maria]'?data.prayers.find(p=>p.id==='hail').lines:line.startsWith('[')?[]:[line]).join(' ')}
 function clips(){return [...data.prayers.map(p=>({id:'prayer-'+p.id,text:prayerText(p)})),...data.mysteries.flatMap(m=>m.entries.map(([title,ref,reflection],i)=>({id:'mystery-'+m.id+'-'+(i+1),text:title+'. '+reflection})))]}
 return {prayerText,clips};
})();
if(typeof module!=='undefined')module.exports=PrayerAudioText;
