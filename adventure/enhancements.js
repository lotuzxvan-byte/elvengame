'use strict';
let magnetTime=0,missionComplete=false,peakCombo=0,atmosphere='morning',ambientTime=0;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const magnets=[{x:1250,y:ground-100,taken:false},{x:3000,y:ground-160,taken:false}];
const earnedBadges=new Set();
function store(key,value){try{localStorage.setItem(key,value)}catch{}}
try{atmosphere=localStorage.getItem('taman-atmosphere')||'morning';sound=localStorage.getItem('taman-sound')==='true';const saved=JSON.parse(localStorage.getItem('taman-badges')||'[]');if(Array.isArray(saved))saved.filter(b=>['Penjelajah','Sahabat kupu-kupu','Kombo hebat'].includes(b)).forEach(b=>earnedBadges.add(b))}catch{}
if(!['morning','sunset','magic'].includes(atmosphere))atmosphere='morning';
$('#atmosphere').value=atmosphere;
$('#atmosphere').onchange=e=>{atmosphere=e.target.value;store('taman-atmosphere',atmosphere)};
function updateSound(){const b=$('#sound');b.textContent='♫ Suara: '+(sound?'nyala':'mati');b.setAttribute('aria-pressed',String(sound));store('taman-sound',String(sound))}
$('#sound').onclick=()=>{sound=!sound;updateSound();tone(600)};
updateSound();
function updateRecord(){$('#record').textContent='Rekor: '+best+' poin'+(earnedBadges.size?' · '+Array.from(earnedBadges).join(' · '):' · Raih lencana pertamamu!')}
updateRecord();
const originalShow=show;
show=function(title,message,button,icon){originalShow(title,message,button,icon);$('#settings').hidden=mode==='paused';$('#restart').hidden=mode!=='paused';$('#start').focus();updateRecord()};
const originalStart=$('#start').onclick;
$('#start').onclick=()=>{if(mode!=='paused'){magnetTime=0;missionComplete=false;peakCombo=0;magnets.forEach(m=>m.taken=false);clearKeys()}originalStart();$('#settings').hidden=false;$('#restart').hidden=true;$('#pause').textContent='Ⅱ';$('#pause').setAttribute('aria-label','Jeda permainan');updateMission()};
$('#restart').onclick=()=>{mode='ready';$('#start').click()};
const originalPause=pause;
pause=function(){originalPause();$('#pause').textContent=mode==='paused'?'▶':'Ⅱ';$('#pause').setAttribute('aria-label',mode==='paused'?'Lanjut permainan':'Jeda permainan')};
$('#pause').onclick=pause;
const originalFinish=finish;
finish=function(won){if(won){peakCombo=Math.max(peakCombo,combo);completeMission();earnedBadges.add('Penjelajah');if(missionComplete)earnedBadges.add('Sahabat kupu-kupu');if(peakCombo>=5)earnedBadges.add('Kombo hebat');store('taman-badges',JSON.stringify(Array.from(earnedBadges)))}originalFinish(won);if(won){$('#message').textContent=points+' poin! '+(missionComplete?'Misi 4 kupu-kupu selesai. ':'')+'Kombo terbaik ×'+Math.max(1,peakCombo)+'. Semua bintang berhasil dikumpulkan!'}$('#pause').textContent='Ⅱ';updateRecord()};
function updateMission(){const n=butterflies.filter(b=>b.taken).length;$('#butterfly-mission').textContent=missionComplete?'🦋 Misi selesai! +500':'🦋 '+n+' / 4 · bonus 500';$('#magnet-status').hidden=magnetTime<=0;$('#magnet-status').textContent='🧲 '+Math.ceil(magnetTime)+' detik';const active=Math.min(3,Math.floor(x/sceneStep));document.querySelectorAll('.location-trail span').forEach((s,i)=>{s.classList.toggle('active',i===active);s.classList.toggle('visited',x>=i*sceneStep);if(i===active)s.setAttribute('aria-current','step');else s.removeAttribute('aria-current')})}
const originalUpdate=update;
function completeMission(){if(!missionComplete&&butterflies.every(b=>b.taken)){missionComplete=true;points+=500;say('Misi kupu-kupu selesai! +500');tone(880);hud()}}
update=function(dt){if(mode!=='paused'&&!reducedMotion.matches)ambientTime+=dt;if(mode==='playing'){magnetTime=Math.max(0,magnetTime-dt);for(const m of magnets)if(!m.taken&&Math.abs(x-m.x)<48&&m.y>y-168&&m.y<y+8){m.taken=true;magnetTime=8;burst(m.x,m.y);say('Magnet! Bintang dekat ikut terkumpul 🧲')}}originalUpdate(dt);if(mode==='playing'){peakCombo=Math.max(peakCombo,combo);completeMission()}updateMission()};
function drawAtmosphere(){ctx.save();const wash=ctx.createLinearGradient(0,0,0,H);if(atmosphere==='sunset'){wash.addColorStop(0,'rgba(247,164,94,.28)');wash.addColorStop(1,'rgba(255,221,146,.08)')}else if(atmosphere==='magic'){wash.addColorStop(0,'rgba(89,70,141,.38)');wash.addColorStop(1,'rgba(104,152,170,.15)')}else{wash.addColorStop(0,'rgba(213,238,235,.1)');wash.addColorStop(1,'rgba(255,250,211,.02)')}ctx.fillStyle=wash;ctx.fillRect(0,0,W,H);if(!reducedMotion.matches){for(let i=0;i<18;i++){const px=((i*137+Math.sin(ambientTime*.4+i)*24-camera*.15)%W+W)%W,py=100+(i*61)%(ground-145)+Math.sin(ambientTime+i)*16;ctx.globalAlpha=.25+.2*Math.sin(ambientTime*1.5+i);ellipse(px,py,atmosphere==='magic'?3:2,atmosphere==='magic'?3:2,atmosphere==='magic'?'#fff2b2':'#fffce1')}}ctx.restore()}
function drawPowerups(){for(const m of magnets)if(!m.taken){const bob=reducedMotion.matches?0:Math.sin(ambientTime*3+m.x)*6;ctx.save();ctx.shadowColor='#d1b4ff';ctx.shadowBlur=18;ellipse(m.x,m.y+bob,25,25,'#efe4ff');ctx.shadowBlur=0;ctx.font='25px Segoe UI';ctx.textAlign='center';ctx.fillText('🧲',m.x,m.y+bob+9);ctx.restore()}if(magnetTime>0){ctx.save();ctx.strokeStyle='#c4a2ee';ctx.setLineDash([6,10]);ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y-90,175,175,0,0,Math.PI*2);ctx.stroke();ctx.restore()}}
const originalDraw=draw;
draw=function(){originalDraw();if(mode!=='playing')return;const missing=stars.filter(s=>!s.taken).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x))[0];let label;if(missing){const sx=missing.x-camera;label=sx<25?'← Bintang di belakang':sx>W-25?'Bintang berikutnya →':missing.y<y-168?'↑ Lompat dua kali':null}else label='Ke peti hadiah →';if(label){ctx.save();ctx.font='bold 12px Segoe UI';const width=ctx.measureText(label).width+24;ctx.fillStyle='#fffdf3f2';ctx.fillRect(W-width-14,H-75,width,27);ctx.fillStyle='#315c4b';ctx.textAlign='right';ctx.fillText(label,W-26,H-57);ctx.restore()}};
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',()=>b.classList.add('pressed'));for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>b.classList.remove('pressed'))});
const originalClearKeys=clearKeys;
clearKeys=function(){originalClearKeys();document.querySelectorAll('[data-key]').forEach(b=>b.classList.remove('pressed'))};
