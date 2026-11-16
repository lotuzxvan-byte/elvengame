const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const engine=require('../adventure/runner-engine.js');
test('automatic runner has a finite course, twenty stars and two difficulty modes',()=>{
 for(const easy of [true,false]){const s=engine.create(easy);assert.equal(s.stars.length,20);assert.equal(s.obstacles.length,20);assert.equal(s.hearts,easy?3:1);assert.ok(s.end>s.obstacles.at(-1).x);assert.equal(s.y,engine.ground);engine.tick(s,1/60);assert.ok(s.distance>0);assert.equal(s.y,engine.ground)}
 assert.ok(engine.create(true).speed<engine.create(false).speed);
});
test('each tap boosts upward, even in the air, and the floor is safe',()=>{
 const s=engine.create();engine.flap(s);engine.tick(s,1/60);assert.ok(s.y<engine.ground);s.vy=120;engine.flap(s);assert.equal(s.vy,engine.impulse);
 s.y=engine.ceiling-1;s.vy=-200;engine.tick(s,1/60);assert.equal(s.y,engine.ceiling);assert.ok(s.vy>=0);
 s.y=engine.ground-1;s.vy=100;engine.tick(s,1/60);assert.equal(s.y,engine.ground);assert.equal(s.status,'playing');
 for(const dt of [-1,NaN,Infinity,0]){const before=s.distance;engine.tick(s,dt);assert.equal(s.distance,before)}
});
test('collisions cost one life per obstacle and loss stops all progress',()=>{
 const s=engine.create(false);s.distance=s.obstacles[0].x-25;engine.tick(s,1/60);assert.equal(s.status,'lost');assert.equal(s.hearts,0);const distance=s.distance;engine.tick(s,1);engine.flap(s);assert.equal(s.distance,distance);
 const easy=engine.create(true);easy.distance=easy.obstacles[0].x-25;engine.tick(easy,1/60);assert.equal(easy.hearts,2);engine.tick(easy,1/60);assert.equal(easy.hearts,2);assert.ok(easy.immune>0);
});
test('stars score only once and finishing does not require every star',()=>{
 const s=engine.create();s.distance=s.stars[0].x;s.y=s.stars[0].y+55;engine.tick(s,1/120);assert.equal(s.collected,1);assert.equal(s.points,100);engine.tick(s,1/120);assert.equal(s.collected,1);
 const empty=engine.create();empty.distance=empty.end-1;engine.tick(empty,1/60);assert.equal(empty.status,'won');assert.equal(empty.collected,0);assert.equal(empty.points,900);const points=empty.points;engine.tick(empty,1);assert.equal(empty.points,points);
});
test('both courses are playable with tap-only control at 30, 60 and 120 Hz',()=>{
 for(const easy of [true,false])for(const hz of [30,60,120]){const s=engine.create(easy);engine.flap(s);
  for(let i=0;i<hz*60&&s.status==='playing';i++){const obstacle=s.obstacles.find(o=>o.x+o.w/2+20>s.distance);if(obstacle&&obstacle.x-s.distance<260){const threshold=obstacle.top?350:engine.ground-obstacle.h-18;if(s.y>threshold&&s.vy>=0)engine.flap(s)}engine.tick(s,1/hz)}
  assert.equal(s.status,'won',JSON.stringify({easy,hz,distance:s.distance,hearts:s.hearts,y:s.y}));assert.equal(s.hearts,easy?3:1);assert.ok(s.collected>=15);assert.equal(s.passed,20);assert.ok(s.points<=2900);
 }
});
test('runner preserves original assets and uses a separate best-score key',()=>{
 const source=fs.readFileSync(require.resolve('../adventure/runner.js'),'utf8');assert.match(source,/\.\.\/assets\/character\.png/);assert.match(source,/\.\.\/assets\/school-/);assert.match(source,/taman-runner-best/);assert.doesNotMatch(source,/localStorage\.removeItem/);assert.match(source,/e\.repeat/);assert.match(source,/visibilitychange/);
 const html=fs.readFileSync(require.resolve('../adventure/index.html'),'utf8');assert.doesNotMatch(html,/data-key="(left|right)"|enhancements\.js/);assert.match(html,/runner-engine\.js\?v=runner-1/);
});
test('score bridge starts new runner sessions but does not restart on pause',()=>{
 const start={onclick(){},},relaxed={checked:true};const sessions=[],results=[];const context=vm.createContext({document:{currentScript:{dataset:{game:'adventure'}},querySelector(id){return id==='#start'?start:id==='#relaxed'?relaxed:null}},parent:{GameScores:{begin(game,difficulty){sessions.push({game,difficulty});return {}},finish(session,data){results.push(data)}}},mode:'ready',points:120,finish(){}});
 vm.runInContext(fs.readFileSync(require.resolve('../score-bridge.js'),'utf8'),context);start.onclick();assert.equal(sessions[0].difficulty,'runner-santai');context.mode='paused';start.onclick();assert.equal(sessions.length,1);relaxed.checked=false;context.mode='ready';start.onclick();assert.equal(sessions.at(-1).difficulty,'runner-normal');
});
