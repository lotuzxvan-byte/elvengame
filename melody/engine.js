'use strict';
const MelodyGarden=(()=>{
 const levels=Object.freeze({easy:{total:6,length:2},normal:{total:8,length:3}});
 const notes=Object.freeze([{name:'Do',frequency:261.63,color:'rose'},{name:'Re',frequency:293.66,color:'gold'},{name:'Mi',frequency:329.63,color:'mint'},{name:'Sol',frequency:392,color:'blue'},{name:'La',frequency:440,color:'lilac'}]);
 function randomNote(random){const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw new Error('Invalid random value');return Math.floor(value*notes.length)}
 function create(difficulty='easy',random=Math.random){const level=levels[difficulty];if(!level)throw new Error('Invalid difficulty');return {difficulty,total:level.total,round:0,pattern:Array.from({length:level.length},()=>randomNote(random)),position:0,mistakes:0,score:0,firstTry:0,phase:'ready'}}
 function beginInput(state){if(!['ready','listening'].includes(state.phase))return false;state.position=0;state.phase='input';return true}
 function press(state,note){if(state.phase!=='input'||!Number.isInteger(note)||note<0||note>=notes.length)return 'ignored';if(note!==state.pattern[state.position]){state.mistakes++;state.position=0;state.phase='retry';return 'wrong'}state.position++;if(state.position<state.pattern.length)return 'correct';state.score+=Math.max(40,100-state.mistakes*20);if(state.mistakes===0)state.firstTry++;state.round++;state.phase=state.round===state.total?'done':'round-complete';return state.phase}
 function replay(state){if(!['input','retry','paused','ready'].includes(state.phase))return false;if(state.phase==='input')state.mistakes++;state.position=0;state.phase='ready';return true}
 function advance(state,random=Math.random){if(state.phase!=='round-complete')return false;state.pattern.push(randomNote(random));state.position=0;state.mistakes=0;state.phase='ready';return true}
 return Object.freeze({levels,notes,create,beginInput,press,replay,advance});
})();
if(typeof module!=='undefined')module.exports=MelodyGarden;
