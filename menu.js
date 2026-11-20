'use strict';
const menu=document.querySelector('#menu');
const player=document.querySelector('#player');
const back=document.querySelector('#back');
const leaveDialog=document.querySelector('#leave-dialog');
let selectedButton;
function openGame(type,button){
 if(type!=='prayers'&&window.GameScores&&!window.GameScores.ready()){window.GameScores.ask(()=>openGame(type,button));return}
 const games={adventure:{path:'adventure/index.html?v=runner-1',name:'Taman Bermain'},math:{path:'math/index.html',name:'Taman Angka'},alphabet:{path:'alphabet/index.html?v=word-zh-1',name:'Taman Kata'},bible:{path:'bible/index.html',name:'Jejak Kasih'},hymns:{path:'hymns/index.html?v=hymns-1',name:'Taman Pujian'},melody:{path:'melody/index.html?v=melody-1',name:'Kebun Melodi'},prayers:{path:'prayers/index.html?v=prayers-crucifix-1',name:'Doa Katolik'}};
 const game=games[type];if(!game)return;
 selectedButton=button;
 const frame=document.createElement('iframe');
 frame.src=game.path;frame.title=game.name;if(type==='alphabet')frame.allow='microphone';
 player.replaceChildren(frame);menu.hidden=true;player.hidden=false;back.hidden=false;
 document.querySelector('#header-note').hidden=true;document.body.classList.add('playing');
 document.title=game.name+' — Game Elven';
 frame.addEventListener('load',()=>{frame.contentWindow.focus();if(type!=='prayers')window.GameScores?.attach(frame,type)},{once:true});
}
document.querySelectorAll('[data-game]').forEach(button=>button.onclick=()=>openGame(button.dataset.game,button));
back.onclick=()=>leaveDialog.showModal();
document.querySelector('.brand').onclick=event=>{if(document.body.classList.contains('playing')){event.preventDefault();leaveDialog.showModal()}};
document.querySelector('#stay').onclick=()=>leaveDialog.close();
document.querySelector('#leave').onclick=()=>{leaveDialog.close();const frame=player.querySelector('iframe');try{if(frame&&typeof frame.contentWindow.stopWordAudio==='function')frame.contentWindow.stopWordAudio();if(frame&&typeof frame.contentWindow.stopBibleAudio==='function')frame.contentWindow.stopBibleAudio();if(frame&&typeof frame.contentWindow.stopPrayerAudio==='function')frame.contentWindow.stopPrayerAudio();if(frame&&typeof frame.contentWindow.stopHymnAudio==='function')frame.contentWindow.stopHymnAudio();if(frame&&typeof frame.contentWindow.stopMelodyAudio==='function')frame.contentWindow.stopMelodyAudio();if(frame&&typeof frame.contentWindow.stopRunnerAudio==='function')frame.contentWindow.stopRunnerAudio()}catch{}player.replaceChildren();player.hidden=true;menu.hidden=false;back.hidden=true;document.querySelector('#header-note').hidden=false;document.body.classList.remove('playing');document.title='Game Elven — Pilih Petualanganmu';selectedButton?.focus()};
