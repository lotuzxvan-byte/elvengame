const assert=require('node:assert/strict');
const engine=require('../math/engine.js');
let checked=0;
for(const difficulty of ['easy','normal']){
 const limit=difficulty==='normal'?20:10,factor=difficulty==='normal'?10:5;
 for(const operation of ['add','subtract','multiply','divide']){
  for(let n=0;n<1500;n++){
   const q=engine.createQuestion(operation,difficulty);
   assert.equal(q.choices.length,4);
   assert.equal(new Set(q.choices).size,4);
   assert.ok(q.choices.includes(q.answer));
   assert.ok(q.choices.every(value=>Number.isInteger(value)&&value>=0));
   assert.ok(Number.isInteger(q.answer)&&q.answer>=0);
   if(operation==='add'){assert.equal(q.answer,q.a+q.b);assert.ok(q.answer<=limit)}
   if(operation==='subtract'){assert.equal(q.answer,q.a-q.b);assert.ok(q.a<=limit&&q.b<=q.a)}
   if(operation==='multiply'){assert.equal(q.answer,q.a*q.b);assert.ok(q.a<=factor&&q.b<=factor)}
   if(operation==='divide'){assert.ok(q.b>0&&q.b<=factor);assert.equal(q.answer,q.a/q.b);assert.ok(q.answer<=factor)}
   checked++;
  }
 }
 for(let n=0;n<100;n++){
  const session=engine.makeSession('mix',difficulty);
  assert.equal(session.length,12);
  assert.equal(session.filter(q=>q.operation==='add').length,6);
  assert.equal(session.filter(q=>q.operation==='subtract').length,6);
  assert.equal(new Set(session.map(q=>q.a+q.symbol+q.b)).size,12);
 }
 for(const operation of ['add','subtract','multiply','divide'])assert.equal(engine.makeSession(operation,difficulty).length,12);
}
console.log(`PASS: ${checked} questions checked, mixed sessions balanced, four unique choices, valid whole-number arithmetic.`);
