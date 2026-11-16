const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {prayers,mysteries,rosarySteps}=require('../prayers/data.js');
test('prayers contain traditional basics and clearly marked child compositions',()=>{
 assert.equal(prayers.length,14);assert.equal(new Set(prayers.map(p=>p.id)).size,14);
 for(const p of prayers){assert.ok(p.title&&p.note&&p.lines.length);assert.ok(p.lines.every(l=>typeof l==='string'&&l.length))}
 for(const id of ['cross','father','hail','glory','creed','angelus','queen','regina'])assert.ok(prayers.some(p=>p.id===id&&!p.original));
 for(const p of prayers.filter(p=>p.group==='harian'))assert.equal(p.original,true);
 assert.ok(prayers.find(p=>p.id==='hail').lines.includes('sekarang dan waktu kami mati. Amin.'));
 assert.equal(mysteries.length,4);for(const m of mysteries)assert.equal(m.entries.length,5);
 assert.match(mysteries.find(m=>m.id==='light').entries[3][0],/kemuliaan/);assert.match(mysteries.find(m=>m.id==='light').entries[4][0],/Ekaristi/);
});
test('all four rosaries have 53 Hail Marys and five ordered decades',()=>{
 for(const m of mysteries)for(const fatima of [true,false])for(const praise of [true,false]){
  const steps=rosarySteps(m.id,fatima,praise);assert.equal(steps[0].prayer,'cross');assert.equal(steps.at(-1).prayer,'cross');
  assert.equal(steps.filter(s=>s.prayer==='hail').length,53);assert.equal(steps.filter(s=>s.prayer==='father').length,6);assert.equal(steps.filter(s=>s.mystery).length,5);
  assert.equal(steps.filter(s=>s.prayer==='fatima').length,fatima?5:0);assert.equal(steps.filter(s=>s.prayer==='praise').length,praise?5:0);
  for(let decade=1;decade<=5;decade++)assert.deepEqual(steps.filter(s=>s.decade===decade&&s.prayer==='hail').map(s=>s.count),[1,2,3,4,5,6,7,8,9,10]);
  for(const s of steps)if(s.prayer)assert.ok(prayers.find(p=>p.id===s.prayer));
 }
 assert.throws(()=>rosarySteps('unknown'));
});
test('prayer mode avoids scoring and persistent personal intentions',()=>{
 const source=fs.readFileSync(require.resolve('../prayers/prayers.js'),'utf8');assert.doesNotMatch(source,/fetch\(|localStorage|sessionStorage|speechSynthesis|new Audio|GameScores/);
 const menu=fs.readFileSync(require.resolve('../menu.js'),'utf8');assert.match(menu,/type!=='prayers'&&window.GameScores/);assert.match(menu,/if\(type!=='prayers'\)window.GameScores\?\.attach/);
});
test('34 Indonesian male audio clips match prayer and reflection texts',()=>{
 const crypto=require('node:crypto'),path=require('node:path');
 const clips=require('../prayers/audio-text.js').clips();assert.equal(clips.length,34);assert.equal(new Set(clips.map(c=>c.id)).size,34);
 const manifest=require('../prayers/audio/manifest.json');assert.equal(manifest.voice,'id-ID-ArdiNeural');assert.equal(manifest.gender,'Male');assert.equal(manifest.locale,'id-ID');assert.equal(Object.keys(manifest.clips).length,34);
 for(const clip of clips){const entry=manifest.clips[clip.id+'.mp3'];assert.ok(entry);const expected=clip.text.normalize('NFC').replace(/([A-Za-z]+)-(Nya|Ku|Mu)\b/g,(_,word,suffix)=>word+suffix.toLowerCase()).replace(/…/g,'. ').replace(/[—–]/g,', ').replace(/\s+/g,' ').trim();assert.equal(entry.text,/[.!?]$/.test(expected)?expected:expected+'.');const file=fs.readFileSync(path.join(__dirname,'../prayers/audio',clip.id+'.mp3'));assert.ok(file.length>1000);assert.equal(crypto.createHash('sha256').update(file).digest('hex'),entry.sha256)}
 const angelus=clips.find(c=>c.id==='prayer-angelus');assert.equal(angelus.text.split('Salam Maria, penuh rahmat').length-1,3);assert.doesNotMatch(angelus.text,/\[/);
});
test('prayer audio plays only on request, pauses, restarts, stops and reports failures',async()=>{
 const vm=require('node:vm'),elements=new Map(),events={},players=[];
 const node=()=>({hidden:false,children:[],textContent:'',value:'',append(...nodes){this.children.push(...nodes)},before(n){this.panel=n},setAttribute(){}});
 const get=id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id)};get('#rosary').hidden=true;
 class Audio{constructor(){this.paused=true;this.currentTime=0;players.push(this)}play(){if(this.fail)return Promise.reject(Error('blocked'));this.paused=false;return Promise.resolve()}pause(){this.paused=true}load(){}removeAttribute(){this.src=''}}
 const document={hidden:false,querySelector:get,createElement:node,addEventListener(name,fn){events[name]=fn}};
 const window={addEventListener(name,fn){events[name]=fn}};
 const context=vm.createContext({window,document,Audio,currentPrayer:prayers[1],steps:[{prayer:'hail'},{mystery:true,decade:1}],stepIndex:0,sessionMystery:{id:'joy'}});
 vm.runInContext(fs.readFileSync(require.resolve('../prayers/audio.js'),'utf8'),context);
 assert.equal(players.length,0);const panel=get('#prayer-lines').panel,controls=panel.children[0],play=controls.children[0],repeat=controls.children[1],speed=controls.children[2].children[0],status=panel.children[1];
 await play.onclick();const audio=players[0];assert.match(audio.src,/prayer-father\.mp3\?v=prayer-male-id-1$/);assert.equal(audio.paused,false);
 audio.currentTime=8;await play.onclick();assert.equal(audio.paused,true);await play.onclick();assert.equal(audio.currentTime,8);assert.equal(audio.paused,false);
 speed.value='0.85';speed.onchange();assert.equal(audio.playbackRate,0.85);await repeat.onclick();assert.equal(audio.currentTime,0);
 window.stopPrayerAudio();assert.equal(audio.paused,true);assert.equal(audio.src,'');context.currentPrayer=prayers[2];await play.onclick();assert.match(audio.src,/prayer-hail/);
 audio.paused=true;audio.onended();assert.match(status.textContent,/selesai/);assert.equal(context.stepIndex,0);
 document.hidden=true;events.visibilitychange();assert.equal(audio.src,'');document.hidden=false;
 get('#reader').hidden=true;get('#rosary').hidden=false;context.stepIndex=1;await get('.rosary-layout').panel.children[0].children[0].onclick();assert.match(audio.src,/mystery-joy-1/);
 events.pagehide();assert.equal(audio.paused,true);audio.fail=true;await get('.rosary-layout').panel.children[0].children[0].onclick();assert.match(status.textContent,/belum dapat diputar/);
});
