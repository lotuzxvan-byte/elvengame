const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const words=require('../alphabet/words.js');
test('every letter, word and sentence has a bundled MP3',()=>{const map=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../alphabet/audio-map.js'),'utf8')+';WordAudio;');const texts=[...words.letterNames,...words.words.flatMap(w=>[w.word,w.sentence])];assert.equal(texts.length,122);for(const text of texts){assert.ok(map[text],text);const file=fs.readFileSync(path.join(__dirname,'../alphabet/audio',map[text]));assert.ok(file.length>1000);assert.ok(file[0]===0xff||file.toString('ascii',0,3)==='ID3')}assert.match(fs.readFileSync(path.join(__dirname,'../alphabet/words-ui.js'),'utf8'),/new Audio\(\)/)});
