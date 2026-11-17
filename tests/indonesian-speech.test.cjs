const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
test('Indonesian neural audio manifests match all rebuilt files',()=>{
 for(const [game,count] of [['bible',162],['alphabet',96]]){
  const folder=path.join(__dirname,'..',game,'audio');const manifest=JSON.parse(fs.readFileSync(path.join(folder,'indonesian-speech.json'),'utf8'));
  assert.equal(manifest.locale,'id-ID');assert.equal(manifest.voice,'id-ID-GadisNeural');assert.equal(manifest.rate,'-8%');assert.equal(Object.keys(manifest.clips).length,count);
  for(const [filename,entry] of Object.entries(manifest.clips)){
   assert.ok(entry.text.length);assert.doesNotMatch(entry.text,/-(Nya|Ku|Mu)\b/);
   const audio=fs.readFileSync(path.join(folder,filename));assert.ok(audio.length>1000);assert.equal(crypto.createHash('sha256').update(audio).digest('hex'),entry.sha256,filename);
   if(filename.startsWith('letter-'))assert.match(entry.text,/^[a-zé]+\.$/);
  }
 }
});
test('Indonesian audio URLs invalidate stale recordings without changing English',()=>{
 const story=fs.readFileSync(path.join(__dirname,'../bible/story.js'),'utf8'),words=fs.readFileSync(path.join(__dirname,'../alphabet/words-ui.js'),'utf8');
 assert.match(story,/mp3\?v=id-neural-1/);assert.match(words,/speechLocale\(\)==='id-ID'/);assert.match(words,/audioUrl.searchParams.set\('v',file.startsWith\('letter-'\)\?'id-letters-5':'id-letters-4'\)/);
});
test('letter names and pronunciations follow the EYD V table',()=>{
 const data=require('../alphabet/words.js'),manifest=require('../alphabet/audio/letter-pronunciation.json');
 const names=['a','be','ce','de','e','ef','ge','ha','i','je','ka','el','em','en','o','pe','qi','er','es','te','u','ve','we','eks','ye','zet'];
 const pronunciation=[...names];pronunciation[16]='ki';pronunciation[21]='fe';assert.deepEqual(data.letterNames,names);assert.deepEqual(data.letterPronunciations,pronunciation);
 assert.equal(manifest.version,'id-letters-5');assert.equal(manifest.locale,'id-ID');assert.deepEqual(manifest.voices,['Piper id_ID-news_tts-medium','id-ID-GadisNeural']);assert.equal(manifest.lengthScale,1.25);assert.equal(Object.keys(manifest.clips).length,26);
 for(let i=0;i<26;i++){const entry=manifest.clips['letter-'+data.alphabet[i].toLowerCase()+'.mp3'];assert.equal(entry.name,names[i]);assert.equal(entry.pronunciation,pronunciation[i]);assert.equal(entry.text,pronunciation[i]+'.');assert.ok(entry.duration>.2&&entry.duration<3);assert.doesNotMatch(entry.text,/huruf|dibaca|Indonesia/);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'../alphabet/audio/letter-'+data.alphabet[i].toLowerCase()+'.mp3'))).digest('hex'),entry.sha256)}
});
test('Indonesian letter failures never switch to a device voice; words and English still can',()=>{
 const vm=require('node:vm'),data=require('../alphabet/words.js'),elements=new Map(),audios=[],spoken=[];
 const node=()=>({value:'morning',style:{},dataset:{},hidden:false,textContent:'',classList:{add(){},remove(){}},focus(){},setAttribute(){},append(){},replaceChildren(){},close(){},showModal(){},addEventListener(){}});
 const document={baseURI:'https://example.test/elvengame/alphabet/index.html',querySelector(s){if(!elements.has(s))elements.set(s,node());return elements.get(s)},querySelectorAll(){return []},addEventListener(){},createElement:node};
 const window={speechSynthesis:{getVoices(){return [{lang:'id-ID'},{lang:'en-US'}]},addEventListener(){},cancel(){},speak(utterance){spoken.push(utterance)}}};window.self=window.top=window;
 class Audio{constructor(){audios.push(this)}pause(){}play(){return Promise.resolve()}}
 const mapping=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../alphabet/audio-map.js'),'utf8')+';WordAudio;');
 const context=vm.createContext({document,window,Audio,URL,WordGarden:data,WordAudio:mapping,speechLocale:()=> 'id-ID',localStorage:{getItem(){return null},setItem(){}},addEventListener(){},setTimeout,clearTimeout,SpeechSynthesisUtterance:class{constructor(text){this.text=text}}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../alphabet/words-ui.js'),'utf8'),context);
 vm.runInContext("mode='alphabet-panel';speak('be')",context);assert.match(audios[0].src,/letter-b\.mp3\?v=id-letters-5$/);audios[0].onerror();assert.equal(spoken.length,0);assert.match(elements.get('#voice-status').textContent,/tidak menggantikan/);
 vm.runInContext("mode='word-panel';speak('ibu')",context);assert.match(audios[0].src,/word-ibu\.mp3\?v=id-letters-4$/);audios[0].onerror();assert.equal(spoken.length,1);assert.equal(spoken[0].lang,'id-ID');
 context.WordGarden=require('../alphabet/english.js');context.speechLocale=()=> 'en-US';context.selectedAudio=()=> ({bee:'en-letter-b.mp3'});vm.runInContext("detectVoice();mode='alphabet-panel';speak('bee')",context);assert.match(audios[0].src,/en-letter-b\.mp3$/);audios[0].onerror();assert.equal(spoken.at(-1).lang,'en-US');
});
