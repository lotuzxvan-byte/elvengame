'use strict';
const ElvenRunner=(()=>{
 const ground=430,gravity=1000,impulse=-430,ceiling=155;
 function create(easy=true){const obstacles=Array.from({length:20},(_,i)=>({x:600+i*360,w:i%4===3?80:62,h:i%4===3?85:70+(i%3)*15,top:i%4===3,hit:false,passed:false}));const stars=obstacles.map((o,i)=>({x:o.x-35,y:o.top?255:ground-o.h-100,taken:false,index:i}));return {easy,status:'playing',distance:0,y:ground,vy:0,speed:easy?210:245,hearts:easy?3:1,stars,obstacles,collected:0,passed:0,points:0,immune:0,elapsed:0,end:obstacles.at(-1).x+620}}
 function flap(state){if(state.status==='playing')state.vy=impulse}
 function bounds(state){return {left:state.distance-18,right:state.distance+18,top:state.y-90,bottom:state.y-8}}
 function intersects(a,b){return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top}
 function starHit(box,star){const x=Math.max(box.left,Math.min(star.x,box.right)),y=Math.max(box.top,Math.min(star.y,box.bottom));return (x-star.x)**2+(y-star.y)**2<24**2}
 function tick(state,dt){if(state.status!=='playing'||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.05);state.elapsed+=dt;state.immune=Math.max(0,state.immune-dt);state.distance+=state.speed*dt;state.vy+=gravity*dt;state.y+=state.vy*dt;if(state.y>=ground){state.y=ground;state.vy=0}if(state.y<ceiling){state.y=ceiling;state.vy=Math.max(0,state.vy)}
  const box=bounds(state);
  for(const star of state.stars)if(!star.taken&&starHit(box,star)){star.taken=true;state.collected++;state.points+=100}
  for(const obstacle of state.obstacles){const rect={left:obstacle.x-obstacle.w/2,right:obstacle.x+obstacle.w/2,top:obstacle.top?80:ground-obstacle.h,bottom:obstacle.top?80+obstacle.h:ground};if(!obstacle.hit&&state.immune===0&&intersects(box,rect)){obstacle.hit=true;state.hearts--;state.immune=1.4;state.vy=-280;if(state.hearts===0){state.status='lost';return}}if(!obstacle.passed&&state.distance>rect.right+20){obstacle.passed=true;state.passed++;state.points+=20}}
  if(state.distance>=state.end){state.status='won';state.points+=500}
 }
 return {ground,gravity,impulse,ceiling,create,flap,tick,bounds,intersects,starHit};
})();
if(typeof module!=='undefined')module.exports=ElvenRunner;
