'use strict';
const menu=document.querySelector('#menu');
const player=document.querySelector('#player');
const back=document.querySelector('#back');
const leaveDialog=document.querySelector('#leave-dialog');
let selectedButton;
function openGame(type,button){
 const game=type==='math'?{path:'math/index.html',name:'Taman Angka'}:{path:'adventure/index.html',name:'Berburu Bintang'};
 selectedButton=button;
 const frame=document.createElement('iframe');
 frame.src=game.path;frame.title=game.name;
 player.replaceChildren(frame);menu.hidden=true;player.hidden=false;back.hidden=false;
 document.querySelector('#header-note').hidden=true;document.body.classList.add('playing');
 document.title=game.name+' — Taman Bintang';
 frame.addEventListener('load',()=>frame.contentWindow.focus(),{once:true});
}
document.querySelectorAll('[data-game]').forEach(button=>button.onclick=()=>openGame(button.dataset.game,button));
back.onclick=()=>leaveDialog.showModal();
document.querySelector('.brand').onclick=event=>{if(document.body.classList.contains('playing')){event.preventDefault();leaveDialog.showModal()}};
document.querySelector('#stay').onclick=()=>leaveDialog.close();
document.querySelector('#leave').onclick=()=>{leaveDialog.close();player.replaceChildren();player.hidden=true;menu.hidden=false;back.hidden=true;document.querySelector('#header-note').hidden=false;document.body.classList.remove('playing');document.title='Taman Bintang — Pilih Petualanganmu';selectedButton?.focus()};
