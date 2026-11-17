const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const engine=require('../alphabet/mandarin.js');
test('Mandarin vocabulary has 48 balanced words with hanzi, pinyin and translations',()=>{
 assert.equal(engine.words.length,48);assert.equal(engine.language,'zh');assert.equal(engine.letterNames.length,0);
 assert.equal(new Set(engine.words.map(w=>w.word)).size,48);
 for(const w of engine.words){assert.match(w.word,/^[\u3400-\u9fff]+$/);assert.ok(w.translation&&w.sentenceTranslation);assert.equal(w.syllables.join(' '),w.pinyin);assert.equal(engine.normalize(w.sentence),w.sentence.slice(0,-1));const choices=engine.choices(w.word);assert.equal(choices.length,4);assert.equal(new Set(choices).size,4);assert.ok(choices.includes(w.word[0]));assert.ok(choices.every(c=>engine.alphabet.includes(c)))}
 for(const level of [1,2,3])for(const category of ['all','keluarga','sekolah'])for(let n=0;n<40;n++){const list=engine.session(category,level);assert.equal(list.length,8);assert.equal(new Set(list.map(w=>w.word)).size,8);assert.ok(list.every(w=>w.level===level));if(category==='all')assert.equal(list.filter(w=>w.category==='keluarga').length,4);else assert.ok(list.every(w=>w.category===category))}
 assert.equal(engine.normalize(' 妈妈！ '),'妈妈');assert.notEqual(engine.normalize('爸爸'),engine.normalize('妈妈'));
});
test('All 96 Mandarin clips have correct mapping and manifest hashes',()=>{
 const folder=path.join(__dirname,'../alphabet/audio');const manifest=require('../alphabet/audio/mandarin-speech.json');
 const mapping=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../alphabet/mandarin-audio.js'),'utf8')+';MandarinAudio;');
 assert.equal(manifest.locale,'zh-CN');assert.equal(manifest.voice,'zh-CN-XiaoxiaoNeural');assert.equal(Object.keys(manifest.clips).length,96);
 for(const w of engine.words)for(const [kind,text] of [['word',w.word],['sentence',w.sentence]]){const filename='zh-'+kind+'-'+w.id+'.mp3';assert.equal(mapping[text],filename);assert.equal(manifest.clips[filename].text,text);const audio=fs.readFileSync(path.join(folder,filename));assert.ok(audio.length>1000);assert.equal(crypto.createHash('sha256').update(audio).digest('hex'),manifest.clips[filename].sha256)}
});
test('Mandarin shares the language menu but has separate progress and no Latin alphabet lesson',()=>{
 const language=fs.readFileSync(path.join(__dirname,'../alphabet/language.js'),'utf8');const ui=fs.readFileSync(path.join(__dirname,'../alphabet/words-ui.js'),'utf8');const html=fs.readFileSync(path.join(__dirname,'../alphabet/index.html'),'utf8');
 assert.match(language,/\['zh','Mandarin · 中文'\]/);assert.match(language,/zh:'zh-CN'/);assert.match(language,/currentLanguage==='zh'\?MandarinAudio/);assert.match(language,/key\+'-'\+currentLanguage/);assert.match(language,/#open-alphabet'\).hidden=mandarin/);assert.match(language,/sentenceTranslation/);assert.match(ui,/current.lang=typeof speechLocale/);assert.ok(html.indexOf('mandarin.js')<html.indexOf('language.js'));
});
