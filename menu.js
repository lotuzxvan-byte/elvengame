'use strict';
const menu=document.querySelector('#menu');
const player=document.querySelector('#player');
const back=document.querySelector('#back');
const leaveDialog=document.querySelector('#leave-dialog');
let selectedButton;
function openGame(type,button){
 if(window.GameScores&&!window.GameScores.ready()){window.GameScores.ask(()=>openGame(type,button));return}
 const games={adventure:{path:'adventure/index.html',name:'Berburu Bintang'},math:{path:'math/index.html',name:'Taman Angka'},alphabet:{path:'alphabet/index.html',name:'Taman Kata'}};
 const game=games[type];if(!game)return;
 selectedButton=button;
 const frame=document.createElement('iframe');
 frame.src=game.path;frame.title=game.name;if(type==='alphabet')frame.allow='microphone';
 player.replaceChildren(frame);menu.hidden=true;player.hidden=false;back.hidden=false;
 document.querySelector('#header-note').hidden=true;document.body.classList.add('playing');
 document.title=game.name+' — Game Elven';
 frame.addEventListener('load',()=>{frame.contentWindow.focus();window.GameScores?.attach(frame,type)},{once:true});
}
document.querySelectorAll('[data-game]').forEach(button=>button.onclick=()=>openGame(button.dataset.game,button));
back.onclick=()=>leaveDialog.showModal();
document.querySelector('.brand').onclick=event=>{if(document.body.classList.contains('playing')){event.preventDefault();leaveDialog.showModal()}};
document.querySelector('#stay').onclick=()=>leaveDialog.close();
document.querySelector('#leave').onclick=()=>{leaveDialog.close();const frame=player.querySelector('iframe');try{if(frame&&typeof frame.contentWindow.stopWordAudio==='function')frame.contentWindow.stopWordAudio()}catch{}player.replaceChildren();player.hidden=true;menu.hidden=false;back.hidden=true;document.querySelector('#header-note').hidden=false;document.body.classList.remove('playing');document.title='Game Elven — Pilih Petualanganmu';selectedButton?.focus()};
