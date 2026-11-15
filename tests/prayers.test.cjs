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
test('prayer mode avoids scoring, audio and persistent personal intentions',()=>{
 const source=fs.readFileSync(require.resolve('../prayers/prayers.js'),'utf8');assert.doesNotMatch(source,/fetch\(|localStorage|sessionStorage|speechSynthesis|new Audio|GameScores/);
 const menu=fs.readFileSync(require.resolve('../menu.js'),'utf8');assert.match(menu,/type!=='prayers'&&window.GameScores/);assert.match(menu,/if\(type!=='prayers'\)window.GameScores\?\.attach/);
});
