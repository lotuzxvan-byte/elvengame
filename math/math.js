'use strict';
const $=selector=>document.querySelector(selector);
const names={add:'Penjumlahan',subtract:'Pengurangan',multiply:'Perkalian',divide:'Pembagian'};
const places=['Gerbang sekolah','Halaman sekolah','Taman Serviam','Sudut baca'];
let questions=[],index=0,points=0,firstTry=0,attempts=0,hintUsed=false,answered=false,best=0,sound=false,audio;
const store=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
try{best=Math.max(0,Number(localStorage.getItem('taman-math-best'))||0);sound=localStorage.getItem('taman-sound')==='true';const saved=localStorage.getItem('taman-atmosphere');if(['morning','sunset','magic'].includes(saved))$('#atmosphere').value=saved}catch{}
function updateBest(){$('#best').textContent='Rekor matematika: '+best+' poin'}
function updateSound(){$('#sound').textContent='♫ Suara '+(sound?'nyala':'mati');$('#sound').setAttribute('aria-pressed',String(sound))}
function tone(frequency){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.connect(gain);gain.connect(audio.destination);oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.04,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.18);oscillator.start();oscillator.stop(audio.currentTime+.18)}catch{}}
$('#sound').onclick=()=>{sound=!sound;store('taman-sound',String(sound));updateSound();tone(600)};
function setAtmosphere(){$('#garden').dataset.atmosphere=$('#atmosphere').value;store('taman-atmosphere',$('#atmosphere').value)}
$('#atmosphere').onchange=setAtmosphere;
function showPanel(id){for(const name of ['setup','quiz','result'])$('#'+name).hidden=name!==id}
function updateProgress(){const progress=$('#garden-progress');progress.replaceChildren();for(let n=0;n<12;n++){const span=document.createElement('span');span.className='progress-step'+(n<index?' done':n===index?' current':'');span.setAttribute('aria-label','Soal '+(n+1)+(n<index?' selesai':n===index?' sedang dimainkan':''));progress.append(span)}$('#score').textContent='⭐ '+points+' poin'}
function start(){questions=MathGarden.makeSession($('#operation').value,$('#difficulty').value);index=0;points=0;firstTry=0;setAtmosphere();showPanel('quiz');renderQuestion();tone(520)}
function renderQuestion(){
 const q=questions[index];attempts=0;hintUsed=false;answered=false;
 const scene=Math.floor(index/3);$('#garden').style.backgroundImage='url("../assets/school-'+(scene+1)+'.jpg")';
 $('#location').textContent='🌿 '+places[scene];$('#speech').textContent=['Yuk, main angka!','Pelan-pelan saja.','Kamu makin hebat!','Sebentar lagi selesai!'][scene];
 $('#question-number').textContent='SOAL '+(index+1)+' / 12';$('#progress-label').textContent=(index+1)+' / 12 soal';$('#operation-name').textContent=names[q.operation];
 const equation=$('#equation');equation.replaceChildren();
 for(const [text,kind] of [[q.a,'number'],[q.symbol,'operator'],[q.b,'number'],['=','operator'],['?','number unknown']]){const span=document.createElement('span');span.className=kind;span.textContent=text;equation.append(span)}
 equation.setAttribute('aria-label',q.a+' '+names[q.operation].toLowerCase()+' '+q.b+' sama dengan berapa?');
 $('#counting').hidden=true;$('#counting').replaceChildren();$('#hint').hidden=false;$('#hint').disabled=false;$('#next').hidden=true;
 $('#feedback').className='feedback';$('#feedback').textContent='Pilih angka yang menurutmu benar.';
 const answers=$('#answers');answers.replaceChildren();q.choices.forEach((choice,n)=>{const button=document.createElement('button');button.className='answer';button.dataset.value=choice;button.setAttribute('aria-label','Jawaban '+choice+', pilihan '+(n+1));const key=document.createElement('small');key.textContent=n+1;const value=document.createElement('span');value.textContent=choice;button.append(key,value);button.onclick=()=>choose(choice,button);answers.append(button)});
 $('#next').textContent=index===11?'Lihat hasilnya! →':'Soal berikutnya →';updateProgress();$('#answers button').focus({preventScroll:true});
}
function choose(value,button){
 if(answered||button.disabled)return;
 const q=questions[index];
 if(value!==q.answer){attempts++;button.classList.add('wrong');button.disabled=true;$('#feedback').className='feedback retry';$('#feedback').textContent='Belum pas. Yuk, hitung lagi atau pakai bantuan 🌿';$('#speech').textContent='Boleh coba lagi!';const available=$('#answers button:not(:disabled)');available?.focus({preventScroll:true});return}
 answered=true;button.classList.add('correct');document.querySelectorAll('.answer').forEach(b=>b.disabled=true);
 const reward=attempts===0&&!hintUsed?100:60;points+=reward;if(attempts===0)firstTry++;
 $('#equation .unknown').textContent=q.answer;$('#equation').setAttribute('aria-label',q.a+' '+names[q.operation].toLowerCase()+' '+q.b+' sama dengan '+q.answer);
 $('#feedback').className='feedback success';$('#feedback').textContent='Betul! '+q.a+' '+q.symbol+' '+q.b+' = '+q.answer+'. +'+reward+' poin ✦';$('#speech').textContent='Tos! Kamu berhasil!';$('#hint').disabled=true;$('#next').hidden=false;$('#score').textContent='⭐ '+points+' poin';tone(720);$('#next').focus({preventScroll:true});
}
function addDots(container,count,kind=''){for(let i=0;i<count;i++){const dot=document.createElement('span');dot.className='count-dot '+kind;dot.setAttribute('aria-hidden','true');container.append(dot)}}
function hint(){
 if(answered)return;hintUsed=true;const q=questions[index],box=$('#counting');box.hidden=false;box.replaceChildren();
 const text=document.createElement('div'),row=document.createElement('div');row.className='dot-row';
 if(q.operation==='add'){text.textContent='Hitung '+q.a+' bintang emas dan '+q.b+' bintang ungu bersama-sama.';addDots(row,q.a);addDots(row,q.b,'other')}
 else if(q.operation==='subtract'){text.textContent='Ada '+q.a+' bintang, lalu '+q.b+' dicoret. Hitung yang masih berwarna emas.';addDots(row,q.a-q.b);addDots(row,q.b,'crossed')}
 else{const groups=q.operation==='multiply'?q.a:q.b,perGroup=q.operation==='multiply'?q.b:q.answer;text.textContent=q.operation==='multiply'?'Ada '+q.a+' kelompok, masing-masing berisi '+q.b+' bintang. Hitung semuanya.':'Bagikan '+q.a+' bintang ke '+q.b+' kelompok sama besar. Berapa bintang dalam satu kelompok?';row.className='group-basket';for(let n=0;n<groups;n++){const group=document.createElement('div');group.className='count-group';addDots(group,perGroup);row.append(group)}}
 box.append(text,row);$('#feedback').className='feedback';$('#feedback').textContent='Hitung pelan-pelan, lalu pilih jawabanmu. Dengan bantuan, jawaban benar mendapat 60 poin.';$('#hint').disabled=true;
}
function finish(){index=12;showPanel('result');updateProgress();$('#progress-label').textContent='12 / 12 selesai';$('#final-score').textContent=points;$('#first-try').textContent=firstTry+' / 12';const newBest=points>best;best=Math.max(best,points);store('taman-math-best',String(best));updateBest();$('#result-message').textContent=(newBest?'Rekor baru! ':'')+'Rekor matematika: '+best+' poin. '+(firstTry===12?'Semua jawaban benar di pilihan pertama!':'Terus berlatih. Setiap percobaan membuatmu makin pintar.');$('#speech').textContent='Sampai main lagi!';tone(880);$('#again').focus({preventScroll:true})}
$('#start').onclick=start;$('#hint').onclick=hint;
$('#next').onclick=()=>{if(!answered)return;if(index===11)finish();else{index++;renderQuestion()}};
$('#again').onclick=start;
$('#change').onclick=()=>{showPanel('setup');index=0;points=0;updateProgress();$('#progress-label').textContent='12 soal · tanpa waktu';$('#garden').style.backgroundImage='url("../assets/school-1.jpg")';$('#location').textContent='🌿 '+places[0];$('#speech').textContent='Yuk, main angka!';$('#operation').focus({preventScroll:true})};
addEventListener('keydown',event=>{if(event.repeat||event.altKey||event.ctrlKey||event.metaKey||['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName)||$('#quiz').hidden)return;if(['1','2','3','4'].includes(event.key)&&!answered){event.preventDefault();$('#answers').children[Number(event.key)-1]?.click()}});
if(window.self!==window.top)$('#direct-home').hidden=true;
for(let i=1;i<=4;i++){const image=new Image();image.src='../assets/school-'+i+'.jpg'}
updateBest();updateSound();setAtmosphere();updateProgress();
