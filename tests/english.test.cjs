const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const engine=require('../alphabet/english.js');
test('English vocabulary and all bundled audio are complete',()=>{
 assert.equal(engine.words.length,48);assert.equal(engine.alphabet.length,26);assert.equal(engine.letterNames.length,26);assert.equal(new Set(engine.words.map(w=>w.word)).size,48);
 const mapping=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../alphabet/english-audio.js'),'utf8')+';EnglishAudio;');
 for(const w of engine.words){assert.equal(w.syllables.join(''),w.word);assert.ok(w.translation&&w.sentence);assert.ok(engine.choices(w.word).includes(w.word[0].toUpperCase()))}
 for(const text of [...engine.letterNames,...engine.words.flatMap(w=>[w.word,w.sentence])]){assert.ok(mapping[text],text);assert.ok(fs.statSync(path.join(__dirname,'../alphabet/audio',mapping[text])).size>1000)}
 for(const level of [1,2,3])for(const category of ['all','keluarga','sekolah']){const list=engine.session(category,level);assert.equal(list.length,8);assert.equal(new Set(list.map(w=>w.word)).size,8);assert.ok(list.every(w=>w.level===level));if(category==='all')assert.equal(list.filter(w=>w.category==='keluarga').length,4)}
});
