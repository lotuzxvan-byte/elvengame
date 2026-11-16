'use strict';
(()=>{
 const game=document.currentScript.dataset.game;
 const scores=parent.GameScores;if(!scores)return;
 let session=null,sent=false;
 function begin(difficulty){sent=false;session=scores.begin(game,difficulty)}
 function report(data){if(sent||!session)return;sent=true;Promise.resolve(session).then(s=>scores.finish(s,data)).catch(()=>{})}
 function wrapStart(id,condition,difficulty){const button=document.querySelector('#'+id);if(!button)return;const original=button.onclick;button.onclick=function(event){if(!condition||condition())begin(difficulty());return original?.call(this,event)}}
 if(game==='adventure'){
  wrapStart('start',()=>mode!=='paused',()=>document.querySelector('#relaxed').checked?'runner-santai':'runner-normal');
  const original=finish;finish=function(won){original(won);report({score:Math.round(points),status:won?'won':'lost'})};
 }else if(game==='math'){
  for(const id of ['start','again'])wrapStart(id,null,()=>document.querySelector('#difficulty').value+':'+document.querySelector('#operation').value);
  const original=finish;finish=function(){original();report({score:points,firstTry,status:'completed'})};
 }else if(game==='alphabet'){
  for(const id of ['open-words','go-words','again'])wrapStart(id,null,()=>document.querySelector('#level').value+':'+document.querySelector('#category').value+(document.querySelector('#language')?.value==='en'?':en':''));
  const button=document.querySelector('#next'),original=button.onclick;button.onclick=function(event){original.call(this,event);if(mode==='result')report({score:points,firstTry,status:'completed'})};
 }else if(game==='bible'){
  addEventListener('bible-session-start',event=>begin(event.detail.book));
  addEventListener('bible-session-finish',event=>report({score:event.detail.score,firstTry:event.detail.firstTry,status:event.detail.status}));
 }
})();
