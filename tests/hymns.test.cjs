const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const engine=require('../hymns/data.js');
test('Four identifiable traditional hymns have original-language lyrics, sources and bundled audio',()=>{
 assert.equal(engine.songs.length,4);assert.deepEqual(engine.songs.map(s=>s.id),['adeste','silent','sanctissima','joy']);
 const manifest=require('../hymns/audio/manifest.json');assert.equal(Object.keys(manifest.clips).length,8);assert.equal(manifest.clueSeconds,11);
 for(const song of engine.songs){assert.ok(song.title&&song.originalTitle&&song.meaning&&song.hint&&song.author&&song.musicCredit);assert.ok(['la','de','en'].includes(song.language));assert.ok(song.lyrics.length>=3);assert.match(song.source,/^https?:\/\//);assert.match(song.textSource,/^https?:\/\//);assert.ok(song.lyrics.every(verse=>verse.length>=4&&verse.every(line=>typeof line==='string'&&line.length>5)));for(const filename of [song.audio,song.clue]){const clip=manifest.clips[filename];assert.equal(clip.song,song.id);const bytes=fs.readFileSync(path.join(__dirname,'../hymns/audio',filename));assert.ok(bytes.length>10000);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),clip.sha256);if(filename===song.clue)assert.equal(clip.duration,11);else assert.ok(clip.duration>20&&clip.duration<90)}}
 assert.ok(engine.songs.find(s=>s.id==='silent').lyrics[0][0].startsWith('Stille Nacht'));
});
test('Each session asks all songs exactly once and all four choices are unique',()=>{
 for(let i=0;i<100;i++){const game=engine.create();assert.equal(game.songs.length,4);assert.equal(new Set(game.songs.map(s=>s.id)).size,4);for(const song of game.songs){const choices=engine.choices(song.id);assert.equal(choices.length,4);assert.equal(new Set(choices).size,4);assert.ok(choices.includes(song.id))}}assert.throws(()=>engine.choices('missing'));
});
test('A completed no-hint quiz scores 400 with no duplicate scoring',()=>{
 const game=engine.create();for(let i=0;i<4;i++){assert.equal(engine.next(game),false);assert.equal(engine.answer(game,'missing'),'ignored');const song=game.songs[game.index];assert.equal(engine.answer(game,song.id),'correct');assert.equal(engine.answer(game,song.id),'ignored');assert.equal(engine.hint(game),false);assert.equal(engine.next(game),i===3?'done':true)}assert.equal(game.score,400);assert.equal(game.firstTry,4);assert.equal(game.history.length,4);assert.equal(game.finished,true);assert.equal(engine.next(game),false);assert.equal(engine.answer(game,game.songs[3].id),'ignored');
});
test('Hint and mistaken guesses have consistent bounded scoring',()=>{
 for(const [mistake,hint,score] of [[false,false,100],[false,true,80],[true,false,60],[true,true,40]]){const game=engine.create();const song=game.songs[0];if(mistake){engine.answer(game,engine.songs.find(s=>s.id!==song.id).id);assert.equal(game.score,0);assert.equal(game.attempts,1)}if(hint)assert.equal(engine.hint(game),true);engine.answer(game,song.id);assert.equal(game.score,score);assert.equal(game.firstTry,!mistake&&!hint?1:0);assert.equal(game.history[0].points,score)}
});
test('Hymn score bridge reports only completed quiz sessions, not library listening',async()=>{
 const handlers={},reports=[],starts=[];vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../score-bridge.js'),'utf8'),{document:{currentScript:{dataset:{game:'hymns'}}},parent:{GameScores:{begin(game,difficulty){starts.push([game,difficulty]);return {game,difficulty}},finish(session,data){reports.push({session,data})}}},addEventListener(name,fn){handlers[name]=fn}});
 handlers['hymns-session-finish']({detail:{score:100}});assert.equal(reports.length,0);handlers['hymns-session-start']({detail:{difficulty:'traditional'}});handlers['hymns-session-finish']({detail:{score:400,firstTry:4,status:'completed'}});handlers['hymns-session-finish']({detail:{score:400}});await Promise.resolve();assert.deepEqual(starts,[['hymns','traditional']]);assert.equal(reports.length,1);assert.equal(reports[0].data.score,400);
});
