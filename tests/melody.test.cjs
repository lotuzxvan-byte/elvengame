const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=require('../melody/engine.js');
test('Melody has five pentatonic flowers and two bounded difficulty levels',()=>{
 assert.equal(engine.notes.length,5);assert.deepEqual(engine.notes.map(n=>n.name),['Do','Re','Mi','Sol','La']);assert.ok(engine.notes.every(n=>n.frequency>250&&n.frequency<=440));
 for(const difficulty of ['easy','normal']){const game=engine.create(difficulty,()=>.99);assert.equal(game.total,difficulty==='easy'?6:8);assert.equal(game.pattern.length,difficulty==='easy'?2:3);assert.ok(game.pattern.every(n=>n===4))}
 assert.throws(()=>engine.create('invalid'));for(const value of [-1,1,NaN])assert.throws(()=>engine.create('easy',()=>value));
});
test('Completing every melody yields the correct maximum score and cannot be scored twice',()=>{
 for(const difficulty of ['easy','normal'])for(let n=0;n<80;n++){
  const game=engine.create(difficulty);let prior=[...game.pattern];
  for(let round=0;round<game.total;round++){assert.equal(game.pattern.length,engine.levels[difficulty].length+round);assert.deepEqual(game.pattern.slice(0,prior.length),prior);assert.equal(engine.press(game,0),'ignored');assert.equal(engine.beginInput(game),true);for(const note of [...game.pattern])engine.press(game,note);assert.equal(game.round,round+1);assert.equal(game.score,(round+1)*100);prior=[...game.pattern];if(round<game.total-1)assert.equal(engine.advance(game),true)}
  assert.equal(game.phase,'done');assert.equal(game.firstTry,game.total);assert.equal(engine.press(game,0),'ignored');assert.equal(engine.replay(game),false);assert.equal(engine.advance(game),false);assert.equal(engine.beginInput(game),false);assert.equal(game.score,game.total*100);
 }
});
test('Mistakes and replays reset the input but preserve earned flowers',()=>{
 const game=engine.create('easy',()=>0);assert.equal(engine.advance(game),false);engine.beginInput(game);for(const note of [-1,5,1.1,NaN])assert.equal(engine.press(game,note),'ignored');assert.equal(game.position,0);
 assert.equal(engine.press(game,1),'wrong');assert.equal(game.mistakes,1);assert.equal(game.phase,'retry');assert.equal(engine.press(game,0),'ignored');engine.replay(game);engine.beginInput(game);engine.press(game,0);engine.press(game,0);assert.equal(game.score,80);assert.equal(game.round,1);assert.equal(game.firstTry,0);engine.advance(game,()=>0);assert.equal(game.mistakes,0);
 for(let i=0;i<8;i++){engine.beginInput(game);engine.replay(game)}engine.beginInput(game);game.pattern.forEach(note=>engine.press(game,note));assert.equal(game.score,120);assert.equal(game.round,2);
});
test('Melody score bridge records only started, completed adventures, never free play',()=>{
 const handlers={},reports=[],starts=[];
 const context={document:{currentScript:{dataset:{game:'melody'}}},parent:{GameScores:{begin(game,difficulty){starts.push([game,difficulty]);return {game,difficulty}},finish(session,data){reports.push({session,data})}}},addEventListener(name,fn){handlers[name]=fn}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../score-bridge.js'),'utf8'),context);
 assert.ok(handlers['melody-session-start']);assert.ok(handlers['melody-session-finish']);handlers['melody-session-finish']({detail:{score:500}});assert.equal(reports.length,0);handlers['melody-session-start']({detail:{difficulty:'easy'}});handlers['melody-session-finish']({detail:{score:600,firstTry:6,status:'completed'}});handlers['melody-session-finish']({detail:{score:600}});
 return Promise.resolve().then(()=>{assert.deepEqual(starts,[['melody','easy']]);assert.equal(reports.length,1);assert.equal(reports[0].data.score,600)});
});
