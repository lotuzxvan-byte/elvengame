const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
test('Indonesian neural audio manifests match all rebuilt files',()=>{
 for(const [game,count] of [['bible',162],['alphabet',122]]){
  const folder=path.join(__dirname,'..',game,'audio');const manifest=JSON.parse(fs.readFileSync(path.join(folder,'indonesian-speech.json'),'utf8'));
  assert.equal(manifest.locale,'id-ID');assert.equal(manifest.voice,'id-ID-GadisNeural');assert.equal(manifest.rate,'-8%');assert.equal(Object.keys(manifest.clips).length,count);
  for(const [filename,entry] of Object.entries(manifest.clips)){
   assert.ok(entry.text.length);assert.doesNotMatch(entry.text,/-(Nya|Ku|Mu)\b/);
   const audio=fs.readFileSync(path.join(folder,filename));assert.ok(audio.length>1000);assert.equal(crypto.createHash('sha256').update(audio).digest('hex'),entry.sha256,filename);
   if(filename.startsWith('letter-'))assert.match(entry.text,/^Huruf ini dibaca /);
  }
 }
});
test('Indonesian audio URLs invalidate stale recordings without changing English',()=>{
 const story=fs.readFileSync(path.join(__dirname,'../bible/story.js'),'utf8'),words=fs.readFileSync(path.join(__dirname,'../alphabet/words-ui.js'),'utf8');
 assert.match(story,/mp3\?v=id-neural-1/);assert.match(words,/speechLocale\(\)==='en-US'/);assert.match(words,/audioUrl.searchParams.set\('v','id-letters-2'\)/);
});
