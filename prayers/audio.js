'use strict';
(()=>{
 let audio=null,activeId=null,request=0,rate=1;
 const panels=[];
 function currentId(){if(!document.querySelector('#reader').hidden&&currentPrayer)return 'prayer-'+currentPrayer.id;if(!document.querySelector('#rosary').hidden&&steps.length){const step=steps[stepIndex];return step.mystery?'mystery-'+sessionMystery.id+'-'+step.decade:'prayer-'+step.prayer}return null}
 function update(message){for(const panel of panels){panel.play.textContent=audio&&activeId&&!audio.paused?'Ⅱ Jeda':'▶ Dengarkan';panel.play.setAttribute('aria-label',audio&&activeId&&!audio.paused?'Jeda pembacaan':'Dengarkan pembacaan');panel.status.textContent=message;panel.speed.value=String(rate)}}
 function stopPrayerAudio(){request++;activeId=null;if(audio){audio.pause();audio.removeAttribute('src');audio.load()}update('Suara pria · bahasa Indonesia. Tekan Dengarkan untuk mulai.')}
 window.stopPrayerAudio=stopPrayerAudio;
 async function play(restart=false){const id=currentId();if(!id)return;const ticket=++request;
  if(!audio){audio=new Audio();audio.preload='none';audio.onended=()=>{if(activeId){update('Pembacaan selesai. Boleh berdoa kembali atau lanjut dengan tenang.')}};audio.onerror=()=>{if(activeId){activeId=null;update('Audio belum dapat diputar. Cek koneksi dan coba Dengarkan lagi.')}}}
  if(activeId===id&&!audio.paused&&!restart){audio.pause();update('Pembacaan dijeda. Tekan Dengarkan untuk melanjutkan.');return}
  if(activeId!==id){audio.pause();activeId=id;audio.src='audio/'+id+'.mp3?v=prayer-male-id-1'}
  if(restart||audio.ended)audio.currentTime=0;
  audio.playbackRate=rate;audio.preservesPitch=true;update('Menyiapkan pembacaan…');
  try{await audio.play();if(ticket===request&&activeId===id)update('Sedang dibacakan · suara pria bahasa Indonesia.')}catch{if(ticket===request&&activeId===id){activeId=null;update('Audio belum dapat diputar. Tekan Dengarkan lagi; periksa volume media dan koneksi.')}}
 }
 for(const section of ['reader','rosary']){const panel=document.createElement('div');panel.className='prayer-audio';panel.setAttribute('role','group');panel.setAttribute('aria-label','Pembacaan '+(section==='reader'?'doa':'Rosario'));const controls=document.createElement('div');controls.className='audio-controls';const playButton=document.createElement('button');playButton.type='button';playButton.onclick=()=>play();const repeat=document.createElement('button');repeat.type='button';repeat.textContent='↺ Ulang suara';repeat.onclick=()=>play(true);const label=document.createElement('label');label.textContent='Tempo ';const speed=document.createElement('select');speed.setAttribute('aria-label','Tempo pembacaan');for(const [value,text] of [['0.85','Lebih pelan'],['1','Tenang'],['1.15','Lebih cepat']]){const option=document.createElement('option');option.value=value;option.textContent=text;speed.append(option)}speed.onchange=()=>{rate=Number(speed.value);if(audio)audio.playbackRate=rate;for(const item of panels)item.speed.value=String(rate)};label.append(speed);controls.append(playButton,repeat,label);const status=document.createElement('p');status.className='audio-status';status.setAttribute('role','status');panel.append(controls,status);document.querySelector(section==='reader'?'#prayer-lines':'.rosary-layout').before(panel);panels.push({play:playButton,status,speed})}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPrayerAudio()});window.addEventListener('pagehide',stopPrayerAudio);
 stopPrayerAudio();
})();
