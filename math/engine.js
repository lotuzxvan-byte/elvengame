'use strict';
const MathGarden=(()=>{
 const randomInt=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
 function shuffle(list){for(let i=list.length-1;i>0;i--){const j=randomInt(0,i);[list[i],list[j]]=[list[j],list[i]]}return list}
 function createQuestion(operation,difficulty){
  const limit=difficulty==='normal'?20:10,factor=difficulty==='normal'?10:5;
  let a,b,answer,symbol;
  if(operation==='add'){a=randomInt(0,limit);b=randomInt(0,limit-a);answer=a+b;symbol='+'}
  else if(operation==='subtract'){a=randomInt(1,limit);b=randomInt(0,a);answer=a-b;symbol='−'}
  else if(operation==='multiply'){a=randomInt(1,factor);b=randomInt(1,factor);answer=a*b;symbol='×'}
  else if(operation==='divide'){b=randomInt(1,factor);answer=randomInt(1,factor);a=b*answer;symbol='÷'}
  else throw new Error('Jenis soal tidak dikenal');
  const choices=new Set([answer]);
  for(const value of shuffle([answer-1,answer+1,answer-2,answer+2,a,b,a+b])){if(value>=0)choices.add(value);if(choices.size===4)break}
  while(choices.size<4)choices.add(randomInt(0,Math.max(10,answer+5)));
  return {a,b,answer,symbol,operation,choices:shuffle(Array.from(choices).slice(0,4))};
 }
 function makeSession(operation,difficulty){
  const operations=operation==='mix'?shuffle(Array(6).fill('add').concat(Array(6).fill('subtract'))):Array(12).fill(operation);
  const seen=new Set();
  return operations.map(op=>{let q,key;for(let i=0;i<80;i++){q=createQuestion(op,difficulty);key=q.a+q.symbol+q.b;if(!seen.has(key))break}seen.add(key);return q});
 }
 return Object.freeze({createQuestion,makeSession});
})();
if(typeof module!=='undefined')module.exports=MathGarden;
